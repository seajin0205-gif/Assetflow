import { DatabaseSync } from "node:sqlite";

/**
 * One writer queue per connection. SQLite's BEGIN IMMEDIATE is the database
 * lock; the queue keeps that transaction from overlapping an await on the
 * same connection. A Postgres port of `saveAccount` is:
 *
 *   SELECT cash_cents, reserved_cash_cents, version
 *     FROM accounts WHERE id = $1 FOR UPDATE;
 *   UPDATE accounts
 *      SET cash_cents = $2, reserved_cash_cents = $3, version = version + 1
 *    WHERE id = $1 AND version = $4;
 */

const queues = new WeakMap<DatabaseSync, Promise<unknown>>();

export type PositionRow = {
  symbol: string;
  quantity: number;
  avgCostCents: number;
  reservedQuantity: number;
};

export type AccountRow = {
  id: string;
  cashCents: number;
  reservedCashCents: number;
  version: number;
  positions: PositionRow[];
};

export type OrderRow = {
  id: string;
  accountId: string;
  symbol: string;
  side: "buy" | "sell";
  type: "market" | "limit";
  quantity: number;
  limitPriceCents: number | null;
  status: "open" | "filled" | "cancelled";
  filledQuantity: number;
  averagePriceCents: number | null;
  reservedCashCents: number;
  createdAt: string;
};

export type IdempotencyRow = {
  requestHash: string;
  statusCode: number;
  responseJson: string;
};

const DEMO_CASH_CENTS = 9_583_077;

export function createDatabase(path = ":memory:"): DatabaseSync {
  const db = new DatabaseSync(path);
  db.exec("PRAGMA foreign_keys = ON");
  db.exec("PRAGMA busy_timeout = 5000");
  migrate(db);
  seedDemo(db);
  return db;
}

let shared: DatabaseSync | undefined;

export function getSharedDatabase(): DatabaseSync {
  if (!shared) {
    shared = createDatabase(process.env.ORDER_DB_PATH || ":memory:");
  }
  return shared;
}

export function transact<T>(
  db: DatabaseSync,
  fn: () => Promise<T> | T,
): Promise<T> {
  const previous = queues.get(db) ?? Promise.resolve();
  const run = previous.then(async () => {
    db.exec("BEGIN IMMEDIATE");
    try {
      const value = await fn();
      db.exec("COMMIT");
      return value;
    } catch (error) {
      try {
        db.exec("ROLLBACK");
      } catch {
        // The driver may already have closed the transaction.
      }
      throw error;
    }
  });
  queues.set(
    db,
    run.then(
      () => undefined,
      () => undefined,
    ),
  );
  return run;
}

export function loadAccount(
  db: DatabaseSync,
  accountId: string,
): AccountRow | null {
  const row = db
    .prepare(
      `SELECT id, cash_cents, reserved_cash_cents, version
         FROM accounts
        WHERE id = ?`,
    )
    .get(accountId) as
    | {
        id: string;
        cash_cents: number;
        reserved_cash_cents: number;
        version: number;
      }
    | undefined;

  if (!row) return null;

  const positions = db
    .prepare(
      `SELECT symbol, quantity, avg_cost_cents, reserved_quantity
         FROM positions
        WHERE account_id = ?
        ORDER BY symbol`,
    )
    .all(accountId) as Array<{
    symbol: string;
    quantity: number;
    avg_cost_cents: number;
    reserved_quantity: number;
  }>;

  return {
    id: row.id,
    cashCents: row.cash_cents,
    reservedCashCents: row.reserved_cash_cents,
    version: row.version,
    positions: positions.map((position) => ({
      symbol: position.symbol,
      quantity: position.quantity,
      avgCostCents: position.avg_cost_cents,
      reservedQuantity: position.reserved_quantity,
    })),
  };
}

/**
 * Optimistic version check. `changes === 0` means another commit won the
 * version, and the caller must roll the transaction back.
 */
export function saveAccount(db: DatabaseSync, account: AccountRow): boolean {
  const updated = db
    .prepare(
      `UPDATE accounts
          SET cash_cents = ?,
              reserved_cash_cents = ?,
              version = version + 1
        WHERE id = ?
          AND version = ?`,
    )
    .run(
      account.cashCents,
      account.reservedCashCents,
      account.id,
      account.version,
    );

  if (Number(updated.changes) !== 1) return false;

  db.prepare(`DELETE FROM positions WHERE account_id = ?`).run(account.id);
  const insert = db.prepare(
    `INSERT INTO positions (account_id, symbol, quantity, avg_cost_cents, reserved_quantity)
     VALUES (?, ?, ?, ?, ?)`,
  );
  for (const position of account.positions) {
    if (position.quantity === 0 && position.reservedQuantity === 0) continue;
    insert.run(
      account.id,
      position.symbol,
      position.quantity,
      position.avgCostCents,
      position.reservedQuantity,
    );
  }
  return true;
}

export function insertOrder(db: DatabaseSync, order: OrderRow): void {
  db.prepare(
    `INSERT INTO orders (
       id, account_id, symbol, side, order_type, quantity, limit_price_cents,
       status, filled_quantity, average_price_cents, reserved_cash_cents, created_at
     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    order.id,
    order.accountId,
    order.symbol,
    order.side,
    order.type,
    order.quantity,
    order.limitPriceCents,
    order.status,
    order.filledQuantity,
    order.averagePriceCents,
    order.reservedCashCents,
    order.createdAt,
  );
}

export function updateOrderStatus(
  db: DatabaseSync,
  order: Pick<OrderRow, "id" | "status" | "reservedCashCents">,
): void {
  db.prepare(
    `UPDATE orders
        SET status = ?, reserved_cash_cents = ?
      WHERE id = ?`,
  ).run(order.status, order.reservedCashCents, order.id);
}

export function loadOrder(db: DatabaseSync, orderId: string): OrderRow | null {
  const row = db
    .prepare(
      `SELECT id, account_id, symbol, side, order_type, quantity, limit_price_cents,
              status, filled_quantity, average_price_cents, reserved_cash_cents, created_at
         FROM orders
        WHERE id = ?`,
    )
    .get(orderId) as
    | {
        id: string;
        account_id: string;
        symbol: string;
        side: "buy" | "sell";
        order_type: "market" | "limit";
        quantity: number;
        limit_price_cents: number | null;
        status: "open" | "filled" | "cancelled";
        filled_quantity: number;
        average_price_cents: number | null;
        reserved_cash_cents: number;
        created_at: string;
      }
    | undefined;

  if (!row) return null;
  return {
    id: row.id,
    accountId: row.account_id,
    symbol: row.symbol,
    side: row.side,
    type: row.order_type,
    quantity: row.quantity,
    limitPriceCents: row.limit_price_cents,
    status: row.status,
    filledQuantity: row.filled_quantity,
    averagePriceCents: row.average_price_cents,
    reservedCashCents: row.reserved_cash_cents,
    createdAt: row.created_at,
  };
}

export function loadIdempotency(
  db: DatabaseSync,
  accountId: string,
  key: string,
  scope: string,
): IdempotencyRow | null {
  const row = db
    .prepare(
      `SELECT request_hash, status_code, response_json
         FROM idempotency_keys
        WHERE account_id = ? AND idempotency_key = ? AND scope = ?`,
    )
    .get(accountId, key, scope) as
    | { request_hash: string; status_code: number; response_json: string }
    | undefined;

  if (!row) return null;
  return {
    requestHash: row.request_hash,
    statusCode: row.status_code,
    responseJson: row.response_json,
  };
}

export function saveIdempotency(
  db: DatabaseSync,
  entry: {
    accountId: string;
    key: string;
    scope: string;
    requestHash: string;
    statusCode: number;
    responseJson: string;
  },
): void {
  db.prepare(
    `INSERT INTO idempotency_keys (
       account_id, idempotency_key, scope, request_hash, status_code, response_json, created_at
     ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    entry.accountId,
    entry.key,
    entry.scope,
    entry.requestHash,
    entry.statusCode,
    entry.responseJson,
    new Date().toISOString(),
  );
}

function migrate(db: DatabaseSync): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS accounts (
      id TEXT PRIMARY KEY,
      cash_cents INTEGER NOT NULL,
      reserved_cash_cents INTEGER NOT NULL,
      version INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS positions (
      account_id TEXT NOT NULL,
      symbol TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      avg_cost_cents INTEGER NOT NULL,
      reserved_quantity INTEGER NOT NULL,
      PRIMARY KEY (account_id, symbol),
      FOREIGN KEY (account_id) REFERENCES accounts(id)
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      account_id TEXT NOT NULL,
      symbol TEXT NOT NULL,
      side TEXT NOT NULL,
      order_type TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      limit_price_cents INTEGER,
      status TEXT NOT NULL,
      filled_quantity INTEGER NOT NULL,
      average_price_cents INTEGER,
      reserved_cash_cents INTEGER NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (account_id) REFERENCES accounts(id)
    );

    CREATE TABLE IF NOT EXISTS idempotency_keys (
      account_id TEXT NOT NULL,
      idempotency_key TEXT NOT NULL,
      scope TEXT NOT NULL,
      request_hash TEXT NOT NULL,
      status_code INTEGER NOT NULL,
      response_json TEXT NOT NULL,
      created_at TEXT NOT NULL,
      PRIMARY KEY (account_id, idempotency_key, scope)
    );
  `);
}

function seedDemo(db: DatabaseSync): void {
  const existing = db
    .prepare(`SELECT id FROM accounts WHERE id = ?`)
    .get("demo");
  if (existing) return;

  db.prepare(
    `INSERT INTO accounts (id, cash_cents, reserved_cash_cents, version)
     VALUES (?, ?, 0, 0)`,
  ).run("demo", DEMO_CASH_CENTS);

  const insert = db.prepare(
    `INSERT INTO positions (account_id, symbol, quantity, avg_cost_cents, reserved_quantity)
     VALUES ('demo', ?, ?, ?, 0)`,
  );
  insert.run("NVDA", 12, 72050);
  insert.run("AAPL", 40, 18210);
  insert.run("MSFT", 8, 41000);
}
