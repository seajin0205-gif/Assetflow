import { createMarketSnapshot, type MarketSnapshot } from "@shared/market";

type QuoteBoard = Pick<MarketSnapshot, "sequence" | "quotes" | "charts">;

let snapshot: MarketSnapshot = {
  ...createMarketSnapshot(),
  status: "connecting",
  latencyMs: 0,
};
const listeners = new Set<(next: MarketSnapshot) => void>();
let stopStream: (() => void) | null = null;

/** One server-sent quote stream shared by every mounted subscriber. */
export function subscribeQuoteStream(
  listener: (next: MarketSnapshot) => void,
): () => void {
  listeners.add(listener);
  listener(snapshot);
  if (!stopStream) stopStream = connect();
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && stopStream) {
      stopStream();
      stopStream = null;
    }
  };
}

function connect(): () => void {
  let latencyMs = snapshot.latencyMs;
  let stopped = false;
  const source = new EventSource("/api/quotes/stream");

  const publish = (status: MarketSnapshot["status"], board?: QuoteBoard) => {
    if (board) {
      snapshot = {
        status,
        latencyMs,
        quotes: board.quotes,
        charts: board.charts,
        sequence: board.sequence,
      };
    } else {
      snapshot = { ...snapshot, status, latencyMs };
    }
    for (const notify of listeners) notify(snapshot);
  };

  source.onopen = () => publish("connected");
  source.onmessage = (event) => {
    publish("connected", JSON.parse(event.data) as QuoteBoard);
  };
  source.onerror = () => publish("connecting");

  const measure = async () => {
    const started = performance.now();
    try {
      const response = await fetch("/api/ping");
      if (!response.ok || stopped) return;
      latencyMs = Math.max(1, Math.round(performance.now() - started));
      if (source.readyState === EventSource.OPEN) publish("connected");
    } catch {
      // Keep the previous reading when the ping fails.
    }
  };
  void measure();
  const timer = window.setInterval(() => void measure(), 3000);

  return () => {
    stopped = true;
    window.clearInterval(timer);
    source.close();
  };
}
