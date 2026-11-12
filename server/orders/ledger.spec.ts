import { createServer as createHttpServer } from "node:http";
import { afterEach, describe, expect, it } from "vitest";
import type { Server } from "node:http";
import { createServer } from "../index";
import { resetQuoteBoard } from "../quotes/engine";
import { createDatabase } from "./db";

const servers: Server[] = [];

afterEach(async () => {
  resetQuoteBoard();
  await Promise.all(
    servers.splice(0).map(
      (server) =>
        new Promise<void>((resolve, reject) => {
          server.close((error) => (error ? reject(error) : resolve()));
        }),
    ),
  );
});

describe("account and quote ledger", () => {
  it("reads buying power and an empty order list from the seeded account", async () => {
    const { url } = await listen();
    const account = await fetch(`${url}/api/account`, {
      headers: { "X-User-Id": "demo" },
    });
    const orders = await fetch(`${url}/api/orders`, {
      headers: { "X-User-Id": "demo" },
    });

    expect(account.status).toBe(200);
    await expect(account.json()).resolves.toMatchObject({
      accountId: "demo",
      cash: "95830.77",
      reservedCash: "0.00",
      buyingPower: "95830.77",
      positions: expect.arrayContaining([
        expect.objectContaining({
          symbol: "NVDA",
          quantity: 12,
          reservedQuantity: 0,
          avgCost: "720.50",
        }),
      ]),
    });
    expect(orders.status).toBe(200);
    await expect(orders.json()).resolves.toEqual([]);
  });

  it("fills a market order at the published quote and lists that fill", async () => {
    const { url } = await listen();
    const board = (await (await fetch(`${url}/api/quotes`)).json()) as {
      quotes: Array<{ symbol: string; price: number }>;
    };
    const nvda = board.quotes.find((quote) => quote.symbol === "NVDA");
    const placed = await fetch(`${url}/api/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Idempotency-Key": "ledger-market-001",
        "X-User-Id": "demo",
      },
      body: JSON.stringify({
        symbol: "NVDA",
        side: "buy",
        type: "market",
        quantity: 1,
      }),
    });
    const order = (await placed.json()) as { averagePrice: string };
    const account = (await (
      await fetch(`${url}/api/account`, { headers: { "X-User-Id": "demo" } })
    ).json()) as {
      buyingPower: string;
      positions: Array<{ symbol: string; quantity: number }>;
    };
    const orders = (await (
      await fetch(`${url}/api/orders`, { headers: { "X-User-Id": "demo" } })
    ).json()) as Array<{
      symbol: string;
      status: string;
      averagePrice: string;
    }>;

    expect(placed.status).toBe(201);
    expect(order.averagePrice).toBe(nvda?.price.toFixed(2));
    expect(account.buyingPower).toBe("94938.37");
    expect(
      account.positions.find((position) => position.symbol === "NVDA")
        ?.quantity,
    ).toBe(13);
    expect(orders).toHaveLength(1);
    expect(orders[0]).toMatchObject({
      symbol: "NVDA",
      status: "filled",
      averagePrice: "892.40",
    });
  });

  it("opens a quote stream on the same opening price the fill uses", async () => {
    const { url } = await listen();
    const response = await fetch(`${url}/api/quotes/stream`);
    const reader = response.body?.getReader();
    if (!reader) throw new Error("missing stream");
    const decoder = new TextDecoder();
    let text = "";
    while (!text.includes("\n\n")) {
      const chunk = await reader.read();
      if (chunk.done) break;
      text += decoder.decode(chunk.value, { stream: true });
    }
    await reader.cancel();

    expect(response.headers.get("content-type")).toContain("text/event-stream");
    expect(text).toContain('"symbol":"NVDA"');
    expect(text).toContain('"price":892.4');
  });
});

async function listen() {
  const app = createServer({ database: createDatabase() });
  const server = createHttpServer(app);
  servers.push(server);
  await new Promise<void>((resolve) =>
    server.listen(0, "127.0.0.1", () => resolve()),
  );
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("missing port");
  return { url: `http://127.0.0.1:${address.port}` };
}
