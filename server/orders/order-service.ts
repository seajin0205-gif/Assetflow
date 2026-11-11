import { createHash, randomUUID } from "node:crypto";
import type { DatabaseSync } from "node:sqlite";
import type { OrderResponse, ProblemDetails } from "@shared/api";
import { ProblemError, problem } from "../http/problem";
import {
  type AccountRow,
  type OrderRow,
  insertOrder,
  loadAccount,
  loadIdempotency,
  loadOrder,
  saveAccount,
  saveIdempotency,
  transact,
  updateOrderStatus,
} from "./db";

export const PLACE_SCOPE = "POST /api/orders";
export const CANCEL_SCOPE = "DELETE /api/orders/:id";

const QUOTES_CENTS: Record<string, number> = {
  NVDA: 89240,
  AAPL: 19832,
  TSLA: 24891,
  MSFT: 42815,
};

export type PlaceOrderCommand = {
  accountId: string;
  idempotencyKey: string;
  symbol: string;
  side: "buy" | "sell";
  type: "market" | "limit";
  quantity: number;
  limitPriceCents: number | null;
  instance: string;
};

export type CancelOrderCommand = {
  accountId: string;
  idempotencyKey: string;
  orderId: string;
  instance: string;
};

export type OrderHooks = {
  /** Test seam. Runs inside the open transaction after the account row is read. */
  afterAccountRead?: () => Promise<void> | void;
};

export type OrderOutcome = {
  status: number;
  body: OrderResponse | ProblemDetails;
  replayed: boolean;
};

type ApplySuccess = {
  ok: true;
  account: AccountRow;
  order: OrderRow;
  response: OrderResponse;
};

type ApplyFailure = { ok: false; problem: ProblemDetails };

export async function placeOrder(
  db: DatabaseSync,
  command: PlaceOrderCommand,
  hooks: OrderHooks = {},
): Promise<OrderOutcome> {
  const requestHash = hashPayload({
    op: "place",
    symbol: command.symbol,
    side: command.side,
    type: command.type,
    quantity: command.quantity,
    limitPriceCents: command.limitPriceCents,
  });

  return transact(db, async () => {
    const replay = readReplay(
      db,
      command.accountId,
      command.idempotencyKey,
      PLACE_SCOPE,
      requestHash,
      command.instance,
    );
    if (replay) return replay;

    const account = loadAccount(db, command.accountId);
    if (!account) {
      return persistProblem(
        db,
        command,
        PLACE_SCOPE,
        requestHash,
        problem(
          404,
          "account-not-found",
          "Account Not Found",
          `No account exists for ${command.accountId}.`,
          command.instance,
        ),
      );
    }

    if (hooks.afterAccountRead) await hooks.afterAccountRead();

    const applied = applyPlace(account, command);
    if (applied.ok === false) {
      return persistProblem(
        db,
        command,
        PLACE_SCOPE,
        requestHash,
        applied.problem,
      );
    }

    if (!saveAccount(db, applied.account)) {
      throw concurrentUpdate(command.instance);
    }
    insertOrder(db, applied.order);
    return persistSuccess(
      db,
      command.accountId,
      command.idempotencyKey,
      PLACE_SCOPE,
      requestHash,
      201,
      applied.response,
    );
  });
}

export async function cancelOrder(
  db: DatabaseSync,
  command: CancelOrderCommand,
  hooks: OrderHooks = {},
): Promise<OrderOutcome> {
  const requestHash = hashPayload({ op: "cancel", orderId: command.orderId });

  return transact(db, async () => {
    const replay = readReplay(
      db,
      command.accountId,
      command.idempotencyKey,
      CANCEL_SCOPE,
      requestHash,
      command.instance,
    );
    if (replay) return replay;

    const account = loadAccount(db, command.accountId);
    if (!account) {
      return persistProblem(
        db,
        command,
        CANCEL_SCOPE,
        requestHash,
        problem(
          404,
          "account-not-found",
          "Account Not Found",
          `No account exists for ${command.accountId}.`,
          command.instance,
        ),
      );
    }

    if (hooks.afterAccountRead) await hooks.afterAccountRead();

    const order = loadOrder(db, command.orderId);
    if (!order || order.accountId !== command.accountId) {
      return persistProblem(
        db,
        command,
        CANCEL_SCOPE,
        requestHash,
        problem(
          404,
          "order-not-found",
          "Order Not Found",
          `No order exists for ${command.orderId}.`,
          command.instance,
        ),
      );
    }

    if (order.status === "cancelled") {
      return persistSuccess(
        db,
        command.accountId,
        command.idempotencyKey,
        CANCEL_SCOPE,
        requestHash,
        200,
        toResponse(order),
      );
    }

    if (order.status !== "open") {
      return persistProblem(
        db,
        command,
        CANCEL_SCOPE,
        requestHash,
        problem(
          409,
          "order-not-cancellable",
          "Order Not Cancellable",
          `Order ${order.id} is ${order.status} and can no longer be cancelled.`,
          command.instance,
        ),
      );
    }

    releaseReservation(account, order);
    order.status = "cancelled";
    order.reservedCashCents = 0;

    if (!saveAccount(db, account)) throw concurrentUpdate(command.instance);
    updateOrderStatus(db, order);
    return persistSuccess(
      db,
      command.accountId,
      command.idempotencyKey,
      CANCEL_SCOPE,
      requestHash,
      200,
      toResponse(order),
    );
  });
}

export async function getOrder(
  db: DatabaseSync,
  accountId: string,
  orderId: string,
  instance: string,
): Promise<OrderOutcome> {
  const order = loadOrder(db, orderId);
  if (!order || order.accountId !== accountId) {
    return {
      status: 404,
      replayed: false,
      body: problem(
        404,
        "order-not-found",
        "Order Not Found",
        `No order exists for ${orderId}.`,
        instance,
      ),
    };
  }
  return { status: 200, replayed: false, body: toResponse(order) };
}

function applyPlace(
  account: AccountRow,
  command: PlaceOrderCommand,
): ApplySuccess | ApplyFailure {
  const quote = QUOTES_CENTS[command.symbol];
  if (!quote) {
    return {
      ok: false,
      problem: problem(
        422,
        "invalid-symbol",
        "Invalid Symbol",
        `${command.symbol} is not tradable.`,
        command.instance,
      ),
    };
  }

  if (command.type === "limit" && command.limitPriceCents == null) {
    return {
      ok: false,
      problem: problem(
        400,
        "validation-error",
        "Validation Error",
        "Limit orders require a limit price.",
        command.instance,
      ),
    };
  }

  const priceCents =
    command.type === "market" ? quote : command.limitPriceCents!;
  const cost = notional(command.quantity, priceCents, command.instance);
  const now = new Date().toISOString();
  const order: OrderRow = {
    id: randomUUID(),
    accountId: account.id,
    symbol: command.symbol,
    side: command.side,
    type: command.type,
    quantity: command.quantity,
    limitPriceCents: command.type === "limit" ? command.limitPriceCents : null,
    status: command.type === "market" ? "filled" : "open",
    filledQuantity: command.type === "market" ? command.quantity : 0,
    averagePriceCents: command.type === "market" ? priceCents : null,
    reservedCashCents: 0,
    createdAt: now,
  };

  if (command.side === "buy" && command.type === "market") {
    if (buyingPower(account) < cost) return insufficientFunds(command, cost);
    account.cashCents -= cost;
    addShares(account, command.symbol, command.quantity, priceCents);
  } else if (command.side === "sell" && command.type === "market") {
    if (!takeShares(account, command.symbol, command.quantity))
      return insufficientShares(command);
    account.cashCents += cost;
  } else if (command.side === "buy" && command.type === "limit") {
    if (buyingPower(account) < cost) return insufficientFunds(command, cost);
    account.reservedCashCents += cost;
    order.reservedCashCents = cost;
  } else {
    if (!reserveShares(account, command.symbol, command.quantity))
      return insufficientShares(command);
  }

  return { ok: true, account, order, response: toResponse(order) };
}

function releaseReservation(account: AccountRow, order: OrderRow): void {
  if (order.side === "buy") {
    account.reservedCashCents -= order.reservedCashCents;
    if (account.reservedCashCents < 0) {
      throw new ProblemError(
        problem(
          500,
          "internal-error",
          "Internal Server Error",
          "Reserved cash dropped below zero.",
          order.id,
        ),
      );
    }
    return;
  }

  const position = account.positions.find(
    (item) => item.symbol === order.symbol,
  );
  if (!position || position.reservedQuantity < order.quantity) {
    throw new ProblemError(
      problem(
        500,
        "internal-error",
        "Internal Server Error",
        "Reserved shares dropped below zero.",
        order.id,
      ),
    );
  }
  position.reservedQuantity -= order.quantity;
}

function addShares(
  account: AccountRow,
  symbol: string,
  quantity: number,
  priceCents: number,
): void {
  const position = account.positions.find((item) => item.symbol === symbol);
  if (!position) {
    account.positions.push({
      symbol,
      quantity,
      avgCostCents: priceCents,
      reservedQuantity: 0,
    });
    return;
  }
  const nextQuantity = position.quantity + quantity;
  position.avgCostCents = Math.round(
    (position.quantity * position.avgCostCents + quantity * priceCents) /
      nextQuantity,
  );
  position.quantity = nextQuantity;
}

function takeShares(
  account: AccountRow,
  symbol: string,
  quantity: number,
): boolean {
  const position = account.positions.find((item) => item.symbol === symbol);
  if (!position || position.quantity - position.reservedQuantity < quantity)
    return false;
  position.quantity -= quantity;
  return true;
}

function reserveShares(
  account: AccountRow,
  symbol: string,
  quantity: number,
): boolean {
  const position = account.positions.find((item) => item.symbol === symbol);
  if (!position || position.quantity - position.reservedQuantity < quantity)
    return false;
  position.reservedQuantity += quantity;
  return true;
}

function buyingPower(account: AccountRow): number {
  return account.cashCents - account.reservedCashCents;
}

function notional(
  quantity: number,
  priceCents: number,
  instance: string,
): number {
  const total = quantity * priceCents;
  if (!Number.isSafeInteger(total)) {
    throw new ProblemError(
      problem(
        422,
        "invalid-notional",
        "Invalid Notional",
        "Order notional is outside the supported range.",
        instance,
      ),
    );
  }
  return total;
}

function insufficientFunds(
  command: PlaceOrderCommand,
  cost: number,
): ApplyFailure {
  return {
    ok: false,
    problem: problem(
      422,
      "insufficient-funds",
      "Insufficient Funds",
      `Buying power cannot cover ${money(cost)} for ${command.quantity} ${command.symbol}.`,
      command.instance,
    ),
  };
}

function insufficientShares(command: PlaceOrderCommand): ApplyFailure {
  return {
    ok: false,
    problem: problem(
      422,
      "insufficient-shares",
      "Insufficient Shares",
      `Not enough ${command.symbol} shares are available to sell ${command.quantity}.`,
      command.instance,
    ),
  };
}

function concurrentUpdate(instance: string): ProblemError {
  return new ProblemError(
    problem(
      409,
      "concurrent-update",
      "Concurrent Update",
      "The account was updated by another transaction. Retry with the same Idempotency-Key.",
      instance,
    ),
  );
}

function readReplay(
  db: DatabaseSync,
  accountId: string,
  key: string,
  scope: string,
  requestHash: string,
  instance: string,
): OrderOutcome | null {
  const existing = loadIdempotency(db, accountId, key, scope);
  if (!existing) return null;
  if (existing.requestHash !== requestHash) {
    throw new ProblemError(
      problem(
        409,
        "idempotency-key-mismatch",
        "Idempotency Key Mismatch",
        "This Idempotency-Key was already used with a different request.",
        instance,
      ),
    );
  }
  return {
    status: existing.statusCode,
    body: JSON.parse(existing.responseJson) as OrderResponse | ProblemDetails,
    replayed: true,
  };
}

function persistProblem(
  db: DatabaseSync,
  command: { accountId: string; idempotencyKey: string },
  scope: string,
  requestHash: string,
  details: ProblemDetails,
): OrderOutcome {
  saveIdempotency(db, {
    accountId: command.accountId,
    key: command.idempotencyKey,
    scope,
    requestHash,
    statusCode: details.status,
    responseJson: JSON.stringify(details),
  });
  return { status: details.status, body: details, replayed: false };
}

function persistSuccess(
  db: DatabaseSync,
  accountId: string,
  key: string,
  scope: string,
  requestHash: string,
  status: number,
  response: OrderResponse,
): OrderOutcome {
  saveIdempotency(db, {
    accountId,
    key,
    scope,
    requestHash,
    statusCode: status,
    responseJson: JSON.stringify(response),
  });
  return { status, body: response, replayed: false };
}

export function toResponse(order: OrderRow): OrderResponse {
  return {
    id: order.id,
    accountId: order.accountId,
    symbol: order.symbol,
    side: order.side,
    type: order.type,
    quantity: order.quantity,
    limitPrice:
      order.limitPriceCents == null ? null : money(order.limitPriceCents),
    status: order.status,
    filledQuantity: order.filledQuantity,
    averagePrice:
      order.averagePriceCents == null ? null : money(order.averagePriceCents),
    reservedCash: money(order.reservedCashCents),
  };
}

function money(cents: number): string {
  const sign = cents < 0 ? "-" : "";
  const absolute = Math.abs(cents);
  const whole = Math.trunc(absolute / 100);
  const fraction = String(absolute % 100).padStart(2, "0");
  return `${sign}${whole}.${fraction}`;
}

function hashPayload(payload: Record<string, unknown>): string {
  const keys = Object.keys(payload).sort();
  return createHash("sha256")
    .update(JSON.stringify(payload, keys))
    .digest("hex");
}
