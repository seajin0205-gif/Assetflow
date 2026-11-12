import {
  createMarketSnapshot,
  stepMarket,
  type MarketSnapshot,
} from "@shared/market";

export type {
  ChartPoint,
  LiveQuote,
  MarketFeedStatus,
  MarketSnapshot,
  PriceDirection,
  QuoteSymbol,
} from "@shared/market";

export {
  createMarketSnapshot,
  priceTickDirection,
  stepMarket,
} from "@shared/market";

export type MarketFeed = {
  getSnapshot: () => MarketSnapshot;
  subscribe: (listener: (snapshot: MarketSnapshot) => void) => () => void;
};

export function createSimulatedMarketFeed({
  intervalMs = 1500,
  random = Math.random,
  initial = createMarketSnapshot(),
}: {
  intervalMs?: number;
  random?: () => number;
  initial?: MarketSnapshot;
} = {}): MarketFeed {
  let snapshot = initial;
  const listeners = new Set<(next: MarketSnapshot) => void>();
  let timer: ReturnType<typeof setInterval> | null = null;

  return {
    getSnapshot: () => snapshot,
    subscribe(listener) {
      listeners.add(listener);
      if (!timer) {
        timer = setInterval(() => {
          snapshot = stepMarket(snapshot, random);
          for (const notify of listeners) notify(snapshot);
        }, intervalMs);
      }
      return () => {
        listeners.delete(listener);
        if (listeners.size === 0 && timer) {
          clearInterval(timer);
          timer = null;
        }
      };
    },
  };
}
