import {
  createMarketSnapshot,
  stepMarket,
  type MarketSnapshot,
} from "../../shared/market.ts";

const INTERVAL_MS = 1500;

let snapshot: MarketSnapshot = createMarketSnapshot();
const listeners = new Set<(next: MarketSnapshot) => void>();
let timer: ReturnType<typeof setInterval> | null = null;

export function currentQuoteBoard(): MarketSnapshot {
  return snapshot;
}

/** Cent price used to fill a market order. Matches the board the stream publishes. */
export function quoteCents(symbol: string): number | null {
  const quote = snapshot.quotes.find((item) => item.symbol === symbol);
  if (!quote) return null;
  return Math.round(quote.price * 100);
}

export function subscribeQuotes(
  listener: (next: MarketSnapshot) => void,
): () => void {
  listeners.add(listener);
  if (!timer) {
    timer = setInterval(() => {
      snapshot = stepMarket(snapshot);
      for (const notify of listeners) notify(snapshot);
    }, INTERVAL_MS);
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && timer) {
      clearInterval(timer);
      timer = null;
    }
  };
}

/** Restores the opening board. Tests call this so a stream cannot leak into later cases. */
export function resetQuoteBoard(): void {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
  listeners.clear();
  snapshot = createMarketSnapshot();
}
