import { createServer as createHttpServer, type Server } from "node:http";
import { afterEach, describe, expect, it } from "vitest";
import { ProblemError } from "../http/problem";
import { createServer } from "../index";
import { createDatabase } from "./db";
import { placeOrder, type PlaceOrderCommand } from "./order-service";

const servers: Server[] = [];

afterEach(async () => {
  await Promise.all(
    servers.splice(0).map(
      (server) =>
        new Promise<void>((resolve, reject) => {
          server.close((error) => (error ? reject(error) : resolve()));
        }),
    ),
  );
});

describe("order placement validation", () => {
  it("rejects a missing quantity, a fractional quantity, and a limit order without a price", async () => {
    const url = await listen();

    const missingQuantity = await post(url, "validate-qty", {
      symbol: "NVDA",
      side: "buy",
      type: "market",
    });
    const fractional = await post(url, "validate-fraction", {
      symbol: "NVDA",
      side: "buy",
      type: "market",
      quantity: 1.5,
    });
    const missingLimit = await post(url, "validate-limit", {
      symbol: "NVDA",
      side: "buy",
      type: "limit",
      quantity: 1,
    });

    for (const response of [missingQuantity, fractional, missingLimit]) {
      expect(response.status).toBe(400);
      expect(response.contentType).toContain("application/problem+json");
      expect(response.body).toMatchObject({
        type: "https://assetflow.dev/problems/validation-error",
        title: "Validation Error",
        status: 400,
        instance: "/api/orders",
      });
    }
  });

  it("rejects a symbol that is not on the quote list", async () => {
    const database = createDatabase();
    const outcome = await placeOrder(database, command({ symbol: "GME" }));

    expect(outcome.status).toBe(422);
    expect(outcome.body).toMatchObject({
      type: "https://assetflow.dev/problems/invalid-symbol",
      title: "Invalid Symbol",
      status: 422,
    });
    expect(countOrders(database)).toBe(0);
  });
});

describe("order placement balance check", () => {
  it("debits cash for a market buy that fits and leaves cash untouched when it does not", async () => {
    const database = createDatabase();
    database
      .prepare(`UPDATE accounts SET cash_cents = ? WHERE id = 'demo'`)
      .run(100_000);

    const rejected = await placeOrder(
      database,
      command({ quantity: 2, idempotencyKey: "balance-reject" }),
    );
    expect(rejected.status).toBe(422);
    expect(rejected.body).toMatchObject({
      type: "https://assetflow.dev/problems/insufficient-funds",
      title: "Insufficient Funds",
    });
    expect(cash(database)).toBe(100_000);
    expect(countOrders(database)).toBe(0);

    const filled = await placeOrder(
      database,
      command({ quantity: 1, idempotencyKey: "balance-fill" }),
    );
    expect(filled.status).toBe(201);
    expect(filled.body).toMatchObject({
      status: "filled",
      filledQuantity: 1,
      averagePrice: "892.40",
    });
    expect(cash(database)).toBe(100_000 - 89_240);
  });

  it("counts reserved buying power, so a resting limit order can block the next buy", async () => {
    const database = createDatabase();
    database
      .prepare(`UPDATE accounts SET cash_cents = ? WHERE id = 'demo'`)
      .run(100_000);

    const resting = await placeOrder(
      database,
      command({
        type: "limit",
        quantity: 1,
        limitPriceCents: 100_000,
        idempotencyKey: "reserve-limit",
      }),
    );
    expect(resting.status).toBe(201);
    expect(resting.body).toMatchObject({
      status: "open",
      reservedCash: "1000.00",
    });

    const blocked = await placeOrder(
      database,
      command({ quantity: 1, idempotencyKey: "reserve-block" }),
    );
    expect(blocked.status).toBe(422);
    expect(blocked.body).toMatchObject({
      type: "https://assetflow.dev/problems/insufficient-funds",
    });
    expect(cash(database)).toBe(100_000);
  });

  it("rejects a sell that exceeds shares available after reservations", async () => {
    const database = createDatabase();
    const outcome = await placeOrder(
      database,
      command({
        side: "sell",
        quantity: 13,
        idempotencyKey: "too-many-shares",
      }),
    );

    expect(outcome.status).toBe(422);
    expect(outcome.body).toMatchObject({
      type: "https://assetflow.dev/problems/insufficient-shares",
      title: "Insufficient Shares",
    });
    const position = database
      .prepare(
        `SELECT quantity FROM positions WHERE account_id = 'demo' AND symbol = 'NVDA'`,
      )
      .get() as { quantity: number };
    expect(position.quantity).toBe(12);
  });
});

describe("order placement idempotency", () => {
  it("returns the original order for the same key and does not debit twice", async () => {
    const database = createDatabase();
    const first = await placeOrder(
      database,
      command({ idempotencyKey: "same-order" }),
    );
    const second = await placeOrder(
      database,
      command({ idempotencyKey: "same-order" }),
    );

    expect(first.status).toBe(201);
    expect(second.replayed).toBe(true);
    expect(second.body).toEqual(first.body);
    expect(countOrders(database)).toBe(1);
    expect(cash(database)).toBe(9_583_077 - 89_240);
  });

  it("refuses the same key when the quantity changes", async () => {
    const database = createDatabase();
    await placeOrder(
      database,
      command({ idempotencyKey: "changed-body", quantity: 1 }),
    );

    await expect(
      placeOrder(
        database,
        command({ idempotencyKey: "changed-body", quantity: 2 }),
      ),
    ).rejects.toMatchObject({
      problem: {
        type: "https://assetflow.dev/problems/idempotency-key-mismatch",
        title: "Idempotency Key Mismatch",
        status: 409,
      },
    });
    await expect(
      placeOrder(
        database,
        command({ idempotencyKey: "changed-body", quantity: 2 }),
      ),
    ).rejects.toBeInstanceOf(ProblemError);
    expect(countOrders(database)).toBe(1);
  });
});

describe("order placement errors", () => {
  it("returns problem details for an unknown account and for malformed JSON", async () => {
    const database = createDatabase();
    const missing = await placeOrder(
      database,
      command({ accountId: "nobody" }),
    );
    expect(missing.status).toBe(404);
    expect(missing.body).toMatchObject({
      type: "https://assetflow.dev/problems/account-not-found",
      title: "Account Not Found",
      status: 404,
    });

    const url = await listen();
    const response = await fetch(`${url}/api/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Idempotency-Key": "bad-json-key",
        "X-User-Id": "demo",
      },
      body: "{",
    });
    const body = await response.json();
    expect(response.status).toBe(400);
    expect(response.headers.get("content-type")).toContain(
      "application/problem+json",
    );
    expect(body).toMatchObject({
      type: "https://assetflow.dev/problems/invalid-json",
      title: "Invalid JSON",
      status: 400,
    });
  });
});

function command(
  overrides: Partial<PlaceOrderCommand> = {},
): PlaceOrderCommand {
  return {
    accountId: "demo",
    idempotencyKey: "placement-key",
    symbol: "NVDA",
    side: "buy",
    type: "market",
    quantity: 1,
    limitPriceCents: null,
    instance: "/api/orders",
    ...overrides,
  };
}

function cash(database: ReturnType<typeof createDatabase>): number {
  const row = database
    .prepare(`SELECT cash_cents FROM accounts WHERE id = 'demo'`)
    .get() as {
    cash_cents: number;
  };
  return row.cash_cents;
}

function countOrders(database: ReturnType<typeof createDatabase>): number {
  const row = database
    .prepare(`SELECT COUNT(*) AS count FROM orders`)
    .get() as { count: number };
  return row.count;
}

async function listen(): Promise<string> {
  const app = createServer({ database: createDatabase() });
  const server = createHttpServer(app);
  servers.push(server);
  await new Promise<void>((resolve) =>
    server.listen(0, "127.0.0.1", () => resolve()),
  );
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("missing port");
  return `http://127.0.0.1:${address.port}`;
}

async function post(url: string, key: string, body: Record<string, unknown>) {
  const response = await fetch(`${url}/api/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Idempotency-Key": key,
      "X-User-Id": "demo",
    },
    body: JSON.stringify(body),
  });
  return {
    status: response.status,
    contentType: response.headers.get("content-type") ?? "",
    body: (await response.json()) as Record<string, unknown>,
  };
}
