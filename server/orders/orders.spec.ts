import { createServer as createHttpServer } from "node:http";
import { afterEach, describe, expect, it } from "vitest";
import type { Server } from "node:http";
import { ProblemError } from "../http/problem";
import { createServer } from "../index";
import { createDatabase } from "./db";
import { cancelOrder, placeOrder } from "./order-service";

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

describe("order API", () => {
  it("fills a market buy once and replays the same response for the same key", async () => {
    const { url, database } = await listen();
    const first = await place(url, "order-key-001", {
      symbol: "NVDA",
      side: "buy",
      type: "market",
      quantity: 1,
    });
    const second = await place(url, "order-key-001", {
      symbol: "NVDA",
      side: "buy",
      type: "market",
      quantity: 1,
    });

    expect(first.status).toBe(201);
    expect(first.body.status).toBe("filled");
    expect(first.body.averagePrice).toBe("892.40");
    expect(second.status).toBe(201);
    expect(second.replayed).toBe(true);
    expect(second.body).toEqual(first.body);

    const account = database
      .prepare(`SELECT cash_cents FROM accounts WHERE id = 'demo'`)
      .get() as { cash_cents: number };
    const position = database
      .prepare(
        `SELECT quantity, avg_cost_cents FROM positions WHERE symbol = 'NVDA'`,
      )
      .get() as {
      quantity: number;
      avg_cost_cents: number;
    };
    const orders = database
      .prepare(`SELECT COUNT(*) AS count FROM orders`)
      .get() as { count: number };
    expect(account.cash_cents).toBe(9_583_077 - 89240);
    expect(position.quantity).toBe(13);
    expect(position.avg_cost_cents).toBe(73372);
    expect(orders.count).toBe(1);
  });

  it("rejects a reused key when the body differs", async () => {
    const { url } = await listen();
    await place(url, "order-key-002", {
      symbol: "AAPL",
      side: "buy",
      type: "market",
      quantity: 1,
    });
    const mismatch = await place(url, "order-key-002", {
      symbol: "AAPL",
      side: "buy",
      type: "market",
      quantity: 2,
    });

    expect(mismatch.status).toBe(409);
    expect(mismatch.contentType).toContain("application/problem+json");
    expect(mismatch.body).toMatchObject({
      type: "https://assetflow.dev/problems/idempotency-key-mismatch",
      title: "Idempotency Key Mismatch",
      status: 409,
      instance: "/api/orders",
    });
    expect(typeof mismatch.body.detail).toBe("string");
  });

  it("requires an idempotency key and returns problem details", async () => {
    const { url } = await listen();
    const response = await fetch(`${url}/api/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-User-Id": "demo" },
      body: JSON.stringify({
        symbol: "NVDA",
        side: "buy",
        type: "market",
        quantity: 1,
      }),
    });
    const body = await response.json();
    expect(response.status).toBe(400);
    expect(response.headers.get("content-type")).toContain(
      "application/problem+json",
    );
    expect(body.type).toBe(
      "https://assetflow.dev/problems/missing-idempotency-key",
    );
    expect(body.title).toBe("Missing Idempotency Key");
    expect(body.status).toBe(400);
    expect(body.instance).toBe("/api/orders");
  });

  it("does not spend reserved cash twice when a limit order is cancelled", async () => {
    const { url, database } = await listen();
    const placed = await place(url, "limit-key-001", {
      symbol: "NVDA",
      side: "buy",
      type: "limit",
      quantity: 2,
      limitPrice: 100,
    });
    expect(placed.status).toBe(201);
    expect(placed.body.status).toBe("open");
    expect(placed.body.reservedCash).toBe("200.00");

    const reserved = database
      .prepare(
        `SELECT reserved_cash_cents, cash_cents FROM accounts WHERE id = 'demo'`,
      )
      .get() as {
      reserved_cash_cents: number;
      cash_cents: number;
    };
    expect(reserved.reserved_cash_cents).toBe(20000);
    expect(reserved.cash_cents).toBe(9_583_077);

    const cancelled = await cancel(url, placed.body.id, "cancel-key-001");
    const again = await cancel(url, placed.body.id, "cancel-key-002");
    expect(cancelled.status).toBe(200);
    expect(cancelled.body.status).toBe("cancelled");
    expect(again.status).toBe(200);
    expect(again.body).toMatchObject({
      id: placed.body.id,
      status: "cancelled",
      reservedCash: "0.00",
    });

    const after = database
      .prepare(
        `SELECT reserved_cash_cents, cash_cents FROM accounts WHERE id = 'demo'`,
      )
      .get() as {
      reserved_cash_cents: number;
      cash_cents: number;
    };
    expect(after.reserved_cash_cents).toBe(0);
    expect(after.cash_cents).toBe(9_583_077);
  });

  it("keeps a filled order and its cash debit when cancellation is rejected", async () => {
    const { url, database } = await listen();
    const placed = await place(url, "filled-key-001", {
      symbol: "MSFT",
      side: "sell",
      type: "market",
      quantity: 1,
    });
    const denied = await cancel(url, placed.body.id, "cancel-filled-001");

    expect(denied.status).toBe(409);
    expect(denied.body.type).toBe(
      "https://assetflow.dev/problems/order-not-cancellable",
    );
    const account = database
      .prepare(`SELECT cash_cents FROM accounts WHERE id = 'demo'`)
      .get() as { cash_cents: number };
    const position = database
      .prepare(`SELECT quantity FROM positions WHERE symbol = 'MSFT'`)
      .get() as { quantity: number };
    expect(account.cash_cents).toBe(9_583_077 + 42815);
    expect(position.quantity).toBe(7);
  });

  it("rejects a sell larger than the available position", async () => {
    const { url, database } = await listen();
    const denied = await place(url, "sell-key-001", {
      symbol: "NVDA",
      side: "sell",
      type: "market",
      quantity: 100,
    });
    expect(denied.status).toBe(422);
    expect(denied.body.type).toBe(
      "https://assetflow.dev/problems/insufficient-shares",
    );
    const position = database
      .prepare(`SELECT quantity FROM positions WHERE symbol = 'NVDA'`)
      .get() as { quantity: number };
    expect(position.quantity).toBe(12);

    const replay = await place(url, "sell-key-001", {
      symbol: "NVDA",
      side: "sell",
      type: "market",
      quantity: 100,
    });
    expect(replay.status).toBe(422);
    expect(replay.replayed).toBe(true);
    expect(replay.body).toEqual(denied.body);
  });

  it("returns 429 problem details after 10 trading requests in one second", async () => {
    const { url } = await listen();
    const responses = [];
    for (let index = 0; index < 11; index += 1) {
      responses.push(
        await place(url, "rate-key-001", {
          symbol: "AAPL",
          side: "buy",
          type: "market",
          quantity: 1,
        }),
      );
    }

    expect(
      responses.slice(0, 10).every((response) => response.status === 201),
    ).toBe(true);
    expect(responses[10].status).toBe(429);
    expect(responses[10].contentType).toContain("application/problem+json");
    expect(responses[10].body).toMatchObject({
      type: "https://assetflow.dev/problems/rate-limited",
      title: "Too Many Requests",
      status: 429,
    });
    expect(responses[10].retryAfter).toBe("1");
  });
});

describe("order ledger", () => {
  it("lets only one of two concurrent buys spend the last dollar of buying power", async () => {
    const database = createDatabase();
    database
      .prepare(`UPDATE accounts SET cash_cents = ? WHERE id = 'demo'`)
      .run(89240);
    let release!: () => void;
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    let waiting = false;
    const first = placeOrder(database, command("concurrent-a"), {
      afterAccountRead: async () => {
        waiting = true;
        await gate;
      },
    });
    await waitFor(() => waiting);
    const second = placeOrder(database, command("concurrent-b"));
    release();

    const [left, right] = await Promise.all([first, second]);
    const statuses = [left.status, right.status].sort();
    expect(statuses).toEqual([201, 422]);
    const cash = database
      .prepare(`SELECT cash_cents FROM accounts WHERE id = 'demo'`)
      .get() as { cash_cents: number };
    const orders = database
      .prepare(`SELECT COUNT(*) AS count FROM orders`)
      .get() as { count: number };
    expect(cash.cash_cents).toBe(0);
    expect(orders.count).toBe(1);
  });

  it("replays a concurrent retry of the same key instead of filling twice", async () => {
    const database = createDatabase();
    let release!: () => void;
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    let waiting = false;
    const first = placeOrder(database, command("same-key"), {
      afterAccountRead: async () => {
        waiting = true;
        await gate;
      },
    });
    await waitFor(() => waiting);
    const second = placeOrder(database, command("same-key"));
    release();

    const [left, right] = await Promise.all([first, second]);
    expect(left.status).toBe(201);
    expect(right.status).toBe(201);
    expect(right.replayed).toBe(true);
    expect(right.body).toEqual(left.body);
    const orders = database
      .prepare(`SELECT COUNT(*) AS count FROM orders`)
      .get() as { count: number };
    const position = database
      .prepare(`SELECT quantity FROM positions WHERE symbol = 'NVDA'`)
      .get() as { quantity: number };
    expect(orders.count).toBe(1);
    expect(position.quantity).toBe(13);
  });

  it("releases reserved shares when an open sell is cancelled", async () => {
    const database = createDatabase();
    const placed = await placeOrder(database, {
      ...command("limit-sell"),
      side: "sell",
      type: "limit",
      quantity: 4,
      limitPriceCents: 90000,
    });
    expect(placed.status).toBe(201);
    const reserved = database
      .prepare(
        `SELECT reserved_quantity, quantity FROM positions WHERE symbol = 'NVDA'`,
      )
      .get() as {
      reserved_quantity: number;
      quantity: number;
    };
    expect(reserved.quantity).toBe(12);
    expect(reserved.reserved_quantity).toBe(4);

    const cancelled = await placeOrder(database, {
      ...command("should-not-run"),
      side: "sell",
      type: "market",
      quantity: 10,
    });
    expect(cancelled.status).toBe(422);

    const done = await cancelOrder(database, {
      accountId: "demo",
      idempotencyKey: "cancel-limit-sell",
      orderId: (placed.body as { id: string }).id,
      instance: "/api/orders/x",
    });
    expect(done.status).toBe(200);
    const after = database
      .prepare(
        `SELECT reserved_quantity, quantity FROM positions WHERE symbol = 'NVDA'`,
      )
      .get() as {
      reserved_quantity: number;
      quantity: number;
    };
    expect(after.quantity).toBe(12);
    expect(after.reserved_quantity).toBe(0);
  });

  it("rolls the transaction back when the account version changes before commit", async () => {
    const database = createDatabase();
    await expect(
      placeOrder(database, command("version-key"), {
        afterAccountRead: () => {
          database
            .prepare(
              `UPDATE accounts SET version = version + 1 WHERE id = 'demo'`,
            )
            .run();
        },
      }),
    ).rejects.toBeInstanceOf(ProblemError);

    const account = database
      .prepare(`SELECT version, cash_cents FROM accounts WHERE id = 'demo'`)
      .get() as {
      version: number;
      cash_cents: number;
    };
    const orders = database
      .prepare(`SELECT COUNT(*) AS count FROM orders`)
      .get() as { count: number };
    expect(account.version).toBe(0);
    expect(account.cash_cents).toBe(9_583_077);
    expect(orders.count).toBe(0);
  });
});

function command(idempotencyKey: string) {
  return {
    accountId: "demo",
    idempotencyKey,
    symbol: "NVDA",
    side: "buy" as const,
    type: "market" as const,
    quantity: 1,
    limitPriceCents: null,
    instance: "/api/orders",
  };
}

async function listen() {
  const database = createDatabase();
  const app = createServer({ database });
  const server = createHttpServer(app);
  servers.push(server);
  await new Promise<void>((resolve) =>
    server.listen(0, "127.0.0.1", () => resolve()),
  );
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("missing port");
  return { database, url: `http://127.0.0.1:${address.port}` };
}

async function place(
  url: string,
  key: string,
  body: {
    symbol: string;
    side: string;
    type: string;
    quantity: number;
    limitPrice?: number;
  },
) {
  const response = await fetch(`${url}/api/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Idempotency-Key": key,
      "X-User-Id": "demo",
    },
    body: JSON.stringify(body),
  });
  return read(response);
}

async function cancel(url: string, orderId: string, key: string) {
  const response = await fetch(`${url}/api/orders/${orderId}`, {
    method: "DELETE",
    headers: { "Idempotency-Key": key, "X-User-Id": "demo" },
  });
  return read(response);
}

async function read(response: Response) {
  const body = (await response.json()) as Record<string, any> & { id: string };
  return {
    status: response.status,
    body,
    replayed: response.headers.get("idempotent-replayed") === "true",
    contentType: response.headers.get("content-type") ?? "",
    retryAfter: response.headers.get("retry-after"),
  };
}

async function waitFor(check: () => boolean) {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    if (check()) return;
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
  throw new Error("timed out waiting for the ledger hook");
}
