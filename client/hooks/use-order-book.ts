import { useEffect, useRef, useState } from "react";

export type OrderBookLevel = {
  price: number;
  size: number;
};

export type OrderBook = {
  asks: OrderBookLevel[];
  bids: OrderBookLevel[];
};

export type BookTick = {
  mid: number;
  sizes: readonly number[];
};

export const ORDER_BOOK_DEPTH = 5;
export const ORDER_BOOK_SEED_SIZES = [180, 260, 340, 420, 300] as const;

const BOOK_FRAMES: readonly (readonly number[])[] = [
  ORDER_BOOK_SEED_SIZES,
  [210, 190, 360, 280, 450],
  [150, 320, 240, 390, 270],
];

export function buildOrderBook(
  mid: number,
  sizes: readonly number[] = ORDER_BOOK_SEED_SIZES,
): OrderBook {
  if (!Number.isFinite(mid) || mid <= 0) {
    throw new Error("Order book mid price must be a positive number.");
  }
  if (sizes.length !== ORDER_BOOK_DEPTH) {
    throw new Error(`Order book expects ${ORDER_BOOK_DEPTH} size levels.`);
  }

  const asks: OrderBookLevel[] = [];
  const bids: OrderBookLevel[] = [];
  for (let level = 1; level <= ORDER_BOOK_DEPTH; level += 1) {
    const size = sizes[level - 1];
    if (!Number.isInteger(size) || size <= 0) {
      throw new Error("Order book sizes must be positive integers.");
    }
    asks.push({ price: roundPrice(mid + level * 0.05), size });
    bids.push({ price: roundPrice(mid - level * 0.05), size });
  }

  return { asks: asks.reverse(), bids };
}

export type BookFeed = (
  onTick: (tick: BookTick) => void,
  getMid: () => number,
) => () => void;

/** Simulated socket: pushes a new size frame on an interval and stops when unsubscribed. */
export function createSimulatedBookFeed(intervalMs = 1000): BookFeed {
  return (onTick, getMid) => {
    let frame = 0;
    const timer = setInterval(() => {
      frame = (frame + 1) % BOOK_FRAMES.length;
      onTick({ mid: getMid(), sizes: BOOK_FRAMES[frame] });
    }, intervalMs);
    return () => clearInterval(timer);
  };
}

const liveBookFeed = createSimulatedBookFeed();

export function useOrderBook(
  mid: number,
  subscribe: BookFeed = liveBookFeed,
): OrderBook {
  const midRef = useRef(mid);
  midRef.current = mid;
  const [book, setBook] = useState(() => buildOrderBook(mid));

  useEffect(() => {
    setBook(buildOrderBook(midRef.current));
    return subscribe(
      (tick) => setBook(buildOrderBook(tick.mid, tick.sizes)),
      () => midRef.current,
    );
  }, [mid, subscribe]);

  return book;
}

function roundPrice(value: number): number {
  return Math.round(value * 100) / 100;
}
