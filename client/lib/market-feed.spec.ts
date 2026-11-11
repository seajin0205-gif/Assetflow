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
  it("raises every quote and moves only the latest chart point", () => {
    const start = createMarketSnapshot();
    const next = stepMarket(start, () => 0.9);
    const nvda = next.quotes[0];

    expect(nvda?.symbol).toBe("NVDA");
    expect(nvda?.price).toBeGreaterThan(892.4);
    expect(nvda?.direction).toBe("up");
    expect(next.charts.NVDA[0]?.price).toBe(878);
    expect(next.charts.NVDA[next.charts.NVDA.length - 1]?.price).toBe(
      nvda?.price,
    );
    expect(next.quotes.map((quote) => quote.direction)).toEqual([
      "up",
      "up",
      "up",
      "up",
    ]);
    expect(next.status).toBe("connected");
    expect(next.latencyMs).toBe(51);
    expect(next.sequence).toBe(1);
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
