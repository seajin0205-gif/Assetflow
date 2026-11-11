import { useEffect, useState } from "react";
import {
  liveMarketFeed,
  type MarketFeed,
  type MarketSnapshot,
} from "@/lib/market-feed";

export function useMarketFeed(
  feed: MarketFeed = liveMarketFeed,
): MarketSnapshot {
  const [snapshot, setSnapshot] = useState(() => feed.getSnapshot());

  useEffect(() => {
    setSnapshot(feed.getSnapshot());
    return feed.subscribe(setSnapshot);
  }, [feed]);

  return snapshot;
}
