import { useEffect, useState } from "react";
import { subscribeQuoteStream } from "@/lib/quote-stream";
import {
  createMarketSnapshot,
  type MarketFeed,
  type MarketSnapshot,
} from "@/lib/market-feed";

export function useMarketFeed(feed?: MarketFeed): MarketSnapshot {
  const [snapshot, setSnapshot] = useState<MarketSnapshot>(() =>
    feed
      ? feed.getSnapshot()
      : { ...createMarketSnapshot(), status: "connecting", latencyMs: 0 },
  );

  useEffect(() => {
    if (feed) {
      setSnapshot(feed.getSnapshot());
      return feed.subscribe(setSnapshot);
    }
    return subscribeQuoteStream(setSnapshot);
  }, [feed]);

  return snapshot;
}
