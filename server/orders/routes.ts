import { Router } from "express";
import type { Request, RequestHandler } from "express";
import type { DatabaseSync } from "node:sqlite";
import { z } from "zod";
import type {
  AccountResponse,
  OrderResponse,
  ProblemDetails,
} from "@shared/api";
import { ProblemError, problem, sendProblem } from "../http/problem";
import { loadAccount, listOrders } from "./db";
import {
  cancelOrder,
  formatCents,
  getOrder,
  placeOrder,
  toResponse,
  type OrderOutcome,
} from "./order-service";

const placeBody = z.object({
  symbol: z.string().trim().min(1).max(8),
  side: z.enum(["buy", "sell"]),
  type: z.enum(["market", "limit"]),
  quantity: z.number().int().positive().max(1_000_000),
  limitPrice: z.number().positive().max(1_000_000).optional(),
});

const KEY_PATTERN = /^[A-Za-z0-9_.:-]{8,200}$/;
const ACCOUNT_PATTERN = /^[A-Za-z0-9_-]{1,64}$/;
const ORDER_ID_PATTERN = /^[A-Za-z0-9-]{1,64}$/;

export function createOrderRouter(db: DatabaseSync): Router {
  const router = Router();

  router.post(
    "/",
    asyncHandler(async (req, res) => {
      const instance = req.originalUrl;
      const accountId = readAccountId(req, instance);
      const idempotencyKey = readIdempotencyKey(req, instance);
      const parsed = placeBody.safeParse(req.body);
      if (!parsed.success) {
        throw new ProblemError(
          problem(
            400,
            "validation-error",
            "Validation Error",
            parsed.error.issues.map((issue) => issue.message).join(" "),
            instance,
          ),
        );
      }

      const command = parsed.data;
      if (command.type === "limit" && command.limitPrice == null) {
        throw new ProblemError(
          problem(
            400,
            "validation-error",
            "Validation Error",
            "Limit orders require a limit price.",
            instance,
          ),
        );
      }

      const outcome = await placeOrder(db, {
        accountId,
        idempotencyKey,
        symbol: command.symbol.toUpperCase(),
        side: command.side,
        type: command.type,
        quantity: command.quantity,
        limitPriceCents:
          command.type === "limit"
            ? dollarsToCents(command.limitPrice!, instance)
            : null,
        instance,
      });
      sendOutcome(res, outcome);
    }),
  );

  router.get(
    "/",
    asyncHandler(async (req, res) => {
      const instance = req.originalUrl;
      const accountId = readAccountId(req, instance);
      if (!loadAccount(db, accountId)) {
        sendProblem(res, missingAccount(accountId, instance));
        return;
      }
      const orders = listOrders(db, accountId, 20).map(toResponse);
      res.json(orders);
    }),
  );

  router.get(
    "/:id",
    asyncHandler(async (req, res) => {
      const instance = req.originalUrl;
      const accountId = readAccountId(req, instance);
      const orderId = readOrderId(req.params.id, instance);
      const outcome = await getOrder(db, accountId, orderId, instance);
      sendOutcome(res, outcome);
    }),
  );

  router.delete(
    "/:id",
    asyncHandler(async (req, res) => {
      const instance = req.originalUrl;
      const accountId = readAccountId(req, instance);
      const idempotencyKey = readIdempotencyKey(req, instance);
      const orderId = readOrderId(req.params.id, instance);
      const outcome = await cancelOrder(db, {
        accountId,
        idempotencyKey,
        orderId,
        instance,
      });
      sendOutcome(res, outcome);
    }),
  );

  return router;
}

export function createAccountRouter(db: DatabaseSync): Router {
  const router = Router();

  router.get(
    "/",
    asyncHandler(async (req, res) => {
      const instance = req.originalUrl;
      const accountId = readAccountId(req, instance);
      const account = loadAccount(db, accountId);
      if (!account) {
        sendProblem(res, missingAccount(accountId, instance));
        return;
      }
      const body: AccountResponse = {
        accountId: account.id,
        cash: formatCents(account.cashCents),
        reservedCash: formatCents(account.reservedCashCents),
        buyingPower: formatCents(account.cashCents - account.reservedCashCents),
        positions: account.positions.map((position) => ({
          symbol: position.symbol,
          quantity: position.quantity,
          reservedQuantity: position.reservedQuantity,
          avgCost: formatCents(position.avgCostCents),
        })),
      };
      res.json(body);
    }),
  );

  return router;
}

function missingAccount(accountId: string, instance: string): ProblemDetails {
  return problem(
    404,
    "account-not-found",
    "Account Not Found",
    `No account exists for ${accountId}.`,
    instance,
  );
}

function sendOutcome(
  res: Parameters<RequestHandler>[1],
  outcome: OrderOutcome,
): void {
  if (outcome.replayed) res.setHeader("Idempotent-Replayed", "true");
  if (outcome.status >= 400) {
    sendProblem(res, outcome.body as ProblemDetails);
    return;
  }
  res.status(outcome.status).json(outcome.body as OrderResponse);
}

function readAccountId(req: Request, instance: string): string {
  const accountId = req.get("X-User-Id");
  if (!accountId || !ACCOUNT_PATTERN.test(accountId)) {
    throw new ProblemError(
      problem(
        400,
        "invalid-account",
        "Invalid Account",
        "Send an X-User-Id header of 1–64 letters, numbers, underscores, or hyphens.",
        instance,
      ),
    );
  }
  return accountId;
}

function readIdempotencyKey(req: Request, instance: string): string {
  const key = req.get("Idempotency-Key");
  if (!key) {
    throw new ProblemError(
      problem(
        400,
        "missing-idempotency-key",
        "Missing Idempotency Key",
        "Send an Idempotency-Key header so a retry cannot submit the order twice.",
        instance,
      ),
    );
  }
  if (!KEY_PATTERN.test(key)) {
    throw new ProblemError(
      problem(
        400,
        "invalid-idempotency-key",
        "Invalid Idempotency Key",
        "Idempotency-Key must be 8–200 characters and use only letters, numbers, or . _ : -.",
        instance,
      ),
    );
  }
  return key;
}

function readOrderId(
  value: string | string[] | undefined,
  instance: string,
): string {
  const orderId = Array.isArray(value) ? value[0] : value;
  if (!orderId || !ORDER_ID_PATTERN.test(orderId)) {
    throw new ProblemError(
      problem(
        404,
        "order-not-found",
        "Order Not Found",
        "No order exists for that id.",
        instance,
      ),
    );
  }
  return orderId;
}

function dollarsToCents(dollars: number, instance: string): number {
  const cents = Math.round(dollars * 100);
  if (!Number.isSafeInteger(cents) || cents <= 0) {
    throw new ProblemError(
      problem(
        400,
        "validation-error",
        "Validation Error",
        "Limit price must convert to a positive cent amount.",
        instance,
      ),
    );
  }
  return cents;
}

function asyncHandler(handler: RequestHandler): RequestHandler {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}
