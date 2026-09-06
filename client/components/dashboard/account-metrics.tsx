import {
  ACCOUNT_CASH_LABEL,
  ACCOUNT_ID,
  ACCOUNT_NET_WORTH_LABEL,
} from "@/data/dashboard";
import { cn } from "@/lib/utils";

type AccountMetricsProps = {
  compact?: boolean;
};

export function AccountMetrics({ compact = false }: AccountMetricsProps) {
  return (
    <>
      <div
        className={cn(
          "flex justify-between gap-4",
          compact ? "items-center" : "items-start",
        )}
      >
        <h2
          className={cn(
            "font-display font-bold tracking-tight",
            compact
              ? "text-lg"
              : "text-xl leading-8 lg:text-2xl lg:leading-8",
          )}
        >
          My account
        </h2>
        <span
          className={cn(
            "rounded-lg border border-subtle bg-subtle text-xs text-muted-foreground",
            compact ? "px-2 py-1" : "px-2 py-2 leading-4",
          )}
        >
          ID {ACCOUNT_ID}
        </span>
      </div>

      <div
        className={cn(
          "grid min-w-0 grid-cols-2",
          compact ? "gap-3" : "gap-4",
        )}
      >
        <div
          className={cn(
            "glass-panel-sm flex min-w-0 flex-col",
            compact ? "gap-1 px-3 py-3" : "gap-2 px-2 py-4",
          )}
        >
          <div className={cn("section-label", !compact && "shrink-0")}>Net worth</div>
          <div className={cn("metric-value", compact && "text-lg sm:text-xl")}>
            {ACCOUNT_NET_WORTH_LABEL}
          </div>
        </div>
        <div
          className={cn(
            "glass-panel-sm flex min-w-0 flex-col",
            compact ? "gap-1 px-3 py-3" : "gap-2 px-2 py-4",
          )}
        >
          <div className={cn("section-label", !compact && "shrink-0")}>Cash</div>
          <div className={cn("metric-value", compact && "text-lg sm:text-xl")}>
            {ACCOUNT_CASH_LABEL}
          </div>
        </div>
      </div>
    </>
  );
}
