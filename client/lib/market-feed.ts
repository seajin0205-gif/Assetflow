export type QuoteSymbol = "NVDA" | "AAPL" | "TSLA" | "MSFT";

export type PriceDirection = "up" | "down" | "flat";

export type LiveQuote = {
  symbol: QuoteSymbol;
  name: string;
  price: number;
  open: number;
  change: number;
  changePct: number;
  direction: PriceDirection;
};

export type ChartPoint = {
  time: string;
  price: number;
};

export type MarketFeedStatus = "connecting" | "connected";

export type MarketSnapshot = {
  status: MarketFeedStatus;
  latencyMs: number;
  quotes: LiveQuote[];
  charts: Record<QuoteSymbol, ChartPoint[]>;
  sequence: number;
};

export type MarketFeed = {
  getSnapshot: () => MarketSnapshot;
  subscribe: (listener: (snapshot: MarketSnapshot) => void) => () => void;
};

const QUOTE_SEEDS: Array<
  Pick<LiveQuote, "symbol" | "name" | "price" | "change" | "changePct">
> = [
  {
    symbol: "NVDA",
    name: "NVIDIA",
    price: 892.4,
    change: 12.8,
    changePct: 1.46,
  },
  {
    symbol: "AAPL",
    name: "Apple",
    price: 198.32,
    change: -1.24,
    changePct: -0.62,
  },
  {
    symbol: "TSLA",
    name: "Tesla",
    price: 248.91,
    change: 5.12,
    changePct: 2.1,
  },
  {
    symbol: "MSFT",
    name: "Microsoft",
    price: 428.15,
    change: 2.44,
    changePct: 0.57,
  },
];

const CHART_SEEDS: Record<QuoteSymbol, ChartPoint[]> = {
  NVDA: [
    { time: "09:30", price: 878 },
    { time: "10:00", price: 881 },
    { time: "10:30", price: 879 },
    { time: "11:00", price: 885 },
    { time: "11:30", price: 888 },
    { time: "12:00", price: 886 },
    { time: "12:30", price: 890 },
    { time: "13:00", price: 892.4 },
  ],
  AAPL: [
    { time: "09:30", price: 199.8 },
    { time: "10:00", price: 199.2 },
    { time: "10:30", price: 198.9 },
    { time: "11:00", price: 198.5 },
    { time: "11:30", price: 198.1 },
    { time: "12:00", price: 198.4 },
    { time: "12:30", price: 198.0 },
    { time: "13:00", price: 198.32 },
  ],
  TSLA: [
    { time: "09:30", price: 242 },
    { time: "10:00", price: 244 },
    { time: "10:30", price: 243 },
    { time: "11:00", price: 246 },
    { time: "11:30", price: 247 },
    { time: "12:00", price: 245 },
    { time: "12:30", price: 248 },
    { time: "13:00", price: 248.91 },
  ],
  MSFT: [
    { time: "09:30", price: 425 },
    { time: "10:00", price: 426 },
    { time: "10:30", price: 427 },
    { time: "11:00", price: 426.5 },
    { time: "11:30", price: 427.8 },
    { time: "12:00", price: 427.2 },
    { time: "12:30", price: 428 },
    { time: "13:00", price: 428.15 },
  ],
};

export function priceTickDirection(
  previous: number,
  next: number,
): PriceDirection {
  if (next > previous) return "up";
  if (next < previous) return "down";
  return "flat";
}

export function createMarketSnapshot(): MarketSnapshot {
  return {
    status: "connected",
    latencyMs: 45,
    sequence: 0,
    quotes: QUOTE_SEEDS.map((seed) => ({
      ...seed,
      open: roundPrice(seed.price - seed.change),
      direction: "flat",
    })),
    charts: {
      NVDA: CHART_SEEDS.NVDA.map((point) => ({ ...point })),
      AAPL: CHART_SEEDS.AAPL.map((point) => ({ ...point })),
      TSLA: CHART_SEEDS.TSLA.map((point) => ({ ...point })),
      MSFT: CHART_SEEDS.MSFT.map((point) => ({ ...point })),
    },
  };
}

/** One simulated socket check. Most symbols stay quiet; a print moves one price. */
export function stepMarket(
  current: MarketSnapshot,
  random: () => number = Math.random,
): MarketSnapshot {
  const quotes = current.quotes.map((quote) => {
    const price = nextPrice(quote.price, random);
    if (price === null) {
      return { ...quote, direction: "flat" as const };
    }
    const change = roundPrice(price - quote.open);
    return {
      ...quote,
      price,
      change,
      changePct: roundPct((change / quote.open) * 100),
      direction: priceTickDirection(quote.price, price),
    };
  });

  const charts = { ...current.charts };
  for (const quote of quotes) {
    const series = current.charts[quote.symbol];
    const nextSeries = series.map((point) => ({ ...point }));
    const last = nextSeries[nextSeries.length - 1];
    if (last) last.price = quote.price;
    charts[quote.symbol] = nextSeries;
  }

  return {
    status: "connected",
    latencyMs: nextLatency(current.latencyMs, random),
    quotes,
    charts,
    sequence: current.sequence + 1,
  };
}

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

export const liveMarketFeed = createSimulatedMarketFeed();

function nextPrice(price: number, random: () => number): number | null {
  if (random() >= 0.4) return null;
  const moved = roundPrice(price * (1 + (random() - 0.5) * 0.0016));
  if (moved === price) return null;
  return Math.max(0.01, moved);
}

function nextLatency(current: number, random: () => number): number {
  const drifted = current + Math.round((random() - 0.5) * 16);
  return Math.min(96, Math.max(18, drifted));
}

function roundPrice(value: number): number {
  return Math.round(value * 100) / 100;
}

function roundPct(value: number): number {
  return Math.round(value * 100) / 100;
}
