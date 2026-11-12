import { describe, expect, it, vi } from "vitest";
import {
  createMarketSnapshot,
  createSimulatedMarketFeed,
  priceTickDirection,
  stepMarket,
} from "./market-feed";

describe("priceTickDirection", () => {
  it("classifies an increase, a decrease, and an unchanged print", () => {
    expect(priceTickDirection(10, 10.01)).toBe("up");
    expect(priceTickDirection(10, 9.99)).toBe("down");
    expect(priceTickDirection(10, 10)).toBe("flat");
  });
});

describe("stepMarket", () => {
  it("prints only the symbols that draw a trade", () => {
    const draws = [0.1, 0.95, 0.9, 0.1, 0.05, 0.9, 0.5];
    let index = 0;
    const start = createMarketSnapshot();
    const next = stepMarket(start, () => draws[index++] ?? 0.5);
    const nvda = next.quotes[0];

    expect(next.quotes.map((quote) => quote.direction)).toEqual([
      "up",
      "flat",
      "down",
      "flat",
    ]);
    expect(nvda?.price).toBeGreaterThan(892.4);
    expect(next.quotes[1]?.price).toBe(198.32);
    expect(next.charts.NVDA[0]?.price).toBe(878);
    expect(next.charts.NVDA[next.charts.NVDA.length - 1]?.price).toBe(
      nvda?.price,
    );
    expect(next.charts.AAPL[next.charts.AAPL.length - 1]?.price).toBe(198.32);
    expect(next.status).toBe("connected");
    expect(next.sequence).toBe(1);
  });

  it("leaves every quote quiet when none of them print", () => {
    const start = createMarketSnapshot();
    const next = stepMarket(start, () => 0.9);

    expect(next.quotes.every((quote) => quote.direction === "flat")).toBe(true);
    expect(next.quotes[0]?.price).toBe(892.4);
    expect(next.latencyMs).toBe(51);
  });

  it("prints a down tick and promotes a connecting session", () => {
    const start = createMarketSnapshot();
    start.status = "connecting";
    const next = stepMarket(start, () => 0.1);

    expect(next.status).toBe("connected");
    expect(next.quotes.every((quote) => quote.direction === "down")).toBe(true);
    expect(next.latencyMs).toBe(39);
  });
});

describe("createSimulatedMarketFeed", () => {
  it("emits one snapshot per interval and stops after the last unsubscribe", () => {
    vi.useFakeTimers();
    const feed = createSimulatedMarketFeed({
      intervalMs: 1000,
      random: () => 0.9,
    });
    const seen: number[] = [];
    const unsubscribe = feed.subscribe((snapshot) => {
      seen.push(snapshot.sequence);
    });

    vi.advanceTimersByTime(2000);
    expect(seen).toEqual([1, 2]);

    unsubscribe();
    vi.advanceTimersByTime(3000);
    expect(feed.getSnapshot().sequence).toBe(2);
    vi.useRealTimers();
  });
});
