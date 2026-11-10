// @vitest-environment happy-dom
import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  buildOrderBook,
  createSimulatedBookFeed,
  useOrderBook,
  type BookTick,
} from "./use-order-book";

afterEach(() => {
  vi.useRealTimers();
});

describe("buildOrderBook", () => {
  it("builds five ask levels above the mid and five bid levels below it", () => {
    const book = buildOrderBook(100, [180, 260, 340, 420, 300]);

    expect(book.asks.map((level) => level.price)).toEqual([
      100.25, 100.2, 100.15, 100.1, 100.05,
    ]);
    expect(book.bids.map((level) => level.price)).toEqual([
      99.95, 99.9, 99.85, 99.8, 99.75,
    ]);
    expect(book.asks.map((level) => level.size)).toEqual([
      300, 420, 340, 260, 180,
    ]);
    expect(book.bids.map((level) => level.size)).toEqual([
      180, 260, 340, 420, 300,
    ]);
  });

  it("rejects a non-positive mid price and a short size ladder", () => {
    expect(() => buildOrderBook(0)).toThrow(/mid price/);
    expect(() => buildOrderBook(100, [10, 20])).toThrow(/5 size levels/);
  });
});

describe("useOrderBook", () => {
  it("replaces the book when the simulated feed pushes a tick", () => {
    const ticks: Array<(tick: BookTick) => void> = [];
    const subscribe = (onTick: (tick: BookTick) => void) => {
      ticks.push(onTick);
      return () => {
        const index = ticks.indexOf(onTick);
        if (index >= 0) ticks.splice(index, 1);
      };
    };

    const { result } = renderHook(() => useOrderBook(892.4, subscribe));

    expect(result.current.bids[0]).toEqual({ price: 892.35, size: 180 });

    act(() => {
      ticks[0]?.({ mid: 892.4, sizes: [11, 22, 33, 44, 55] });
    });

    expect(result.current.asks[0]).toEqual({ price: 892.65, size: 55 });
    expect(result.current.bids[0]).toEqual({ price: 892.35, size: 11 });
    expect(result.current.bids[4]).toEqual({ price: 892.15, size: 55 });
  });

  it("stops applying ticks after the subscriber unmounts", () => {
    let onTick: ((tick: BookTick) => void) | null = null;
    let unsubscribed = false;
    const subscribe = (listener: (tick: BookTick) => void) => {
      onTick = listener;
      return () => {
        unsubscribed = true;
        onTick = null;
      };
    };

    const { result, unmount } = renderHook(() => useOrderBook(50, subscribe));
    unmount();

    expect(unsubscribed).toBe(true);
    expect(() => onTick?.({ mid: 50, sizes: [1, 1, 1, 1, 1] })).not.toThrow();
    expect(result.current.bids[0]?.size).toBe(180);
  });

  it("rebuilds around the latest mid when the symbol price changes", () => {
    const subscribe = () => () => undefined;
    const { result, rerender } = renderHook(
      ({ mid }) => useOrderBook(mid, subscribe),
      {
        initialProps: { mid: 100 },
      },
    );

    expect(result.current.bids[0]?.price).toBe(99.95);
    rerender({ mid: 200 });
    expect(result.current.bids[0]?.price).toBe(199.95);
    const asks = result.current.asks;
    expect(asks[asks.length - 1]?.price).toBe(200.05);
  });
});

describe("createSimulatedBookFeed", () => {
  it("emits the next size frame and clears the interval on unsubscribe", () => {
    vi.useFakeTimers();
    const feed = createSimulatedBookFeed(1000);
    const ticks: BookTick[] = [];
    const unsubscribe = feed(
      (tick) => ticks.push(tick),
      () => 10,
    );

    vi.advanceTimersByTime(1000);
    expect(ticks).toHaveLength(1);
    expect(ticks[0]?.mid).toBe(10);
    expect(ticks[0]?.sizes).toEqual([210, 190, 360, 280, 450]);

    unsubscribe();
    vi.advanceTimersByTime(5000);
    expect(ticks).toHaveLength(1);
  });
});
