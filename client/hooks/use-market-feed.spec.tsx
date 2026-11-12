// @vitest-environment happy-dom
import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createSimulatedMarketFeed } from "@/lib/market-feed";
import { useMarketFeed } from "./use-market-feed";

afterEach(() => {
  vi.useRealTimers();
});

describe("useMarketFeed", () => {
  it("applies socket ticks and ignores ticks after unmount", () => {
    vi.useFakeTimers();
    const draws = [0.1, 0.95, 0.1, 0.95, 0.1, 0.95, 0.1, 0.95, 0.5];
    let index = 0;
    const feed = createSimulatedMarketFeed({
      intervalMs: 1000,
      random: () => draws[index++] ?? 0.5,
    });
    const { result, unmount } = renderHook(() => useMarketFeed(feed));

    expect(result.current.quotes[0]?.price).toBe(892.4);
    expect(result.current.latencyMs).toBe(45);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.sequence).toBe(1);
    expect(result.current.quotes[0]?.price).toBeGreaterThan(892.4);
    const appleChart = result.current.charts.AAPL;
    expect(appleChart[appleChart.length - 1]?.price).toBe(
      result.current.quotes[1]?.price,
    );

    const sequence = result.current.sequence;
    unmount();
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(feed.getSnapshot().sequence).toBe(sequence);
  });
});
