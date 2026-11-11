import { useMarketFeed } from "@/hooks/use-market-feed";
import type { MarketFeedStatus } from "@/lib/market-feed";
import { cn } from "@/lib/utils";

type ConnectionStatusProps = {
  status: MarketFeedStatus;
  latencyMs: number;
  className?: string;
};

export function ConnectionStatus({
  status,
  latencyMs,
  className,
}: ConnectionStatusProps) {
  const connected = status === "connected";
  const label = connected ? "WS Connected" : "WS Connecting";

  return (
    <div
      className={cn(
        "inline-flex h-8 shrink-0 items-center gap-2 rounded-full border border-subtle bg-card/80 px-2 text-xs font-medium leading-4 tabular-nums",
        className,
      )}
      role="status"
      data-testid="connection-status"
      aria-label={
        connected ? `WS Connected, ${latencyMs} milliseconds` : "WS Connecting"
      }
    >
      <span aria-hidden="true">{connected ? "🟢" : "🟡"}</span>
      <span>{label}</span>
      <span aria-hidden="true">•</span>
      <span className="text-muted-foreground">
        {connected ? `${latencyMs}ms` : "—"}
      </span>
    </div>
  );
}

export function LiveConnectionStatus({ className }: { className?: string }) {
  const { status, latencyMs } = useMarketFeed();
  return (
    <ConnectionStatus
      status={status}
      latencyMs={latencyMs}
      className={className}
    />
  );
}
