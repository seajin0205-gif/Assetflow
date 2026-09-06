import { ALERT_ITEMS, ALERT_UNREAD_COUNT } from "@/data/dashboard";
import { cn } from "@/lib/utils";

type AlertsPanelProps = {
  compact?: boolean;
};

export function AlertsPanel({ compact = false }: AlertsPanelProps) {
  return (
    <>
      <div className="flex items-center justify-between">
        <h3
          className={cn(
            "font-display font-bold",
            compact ? "text-base" : "text-lg leading-6",
          )}
        >
          Alerts
        </h3>
        <span
          className={cn(
            "rounded-full bg-red-500/15 font-semibold text-red-400",
            compact ? "px-2 py-0.5 text-xs" : "px-2 py-1 text-xs leading-4",
          )}
        >
          {ALERT_UNREAD_COUNT} unread
        </span>
      </div>

      <ul
        className={cn(
          "text-sm text-muted-foreground",
          compact ? "space-y-2" : "space-y-2 leading-6",
        )}
      >
        {ALERT_ITEMS.map((alert) => (
          <li
            key={alert}
            className={cn(
              "rounded-lg border border-subtle bg-subtle-muted",
              compact
                ? "px-3 py-2"
                : "px-4 py-2 leading-6 transition hover:border-blue-100 hover:bg-blue-50/70 dark:hover:border-white/[0.08] dark:hover:bg-white/[0.04]",
            )}
          >
            {alert}
          </li>
        ))}
      </ul>
    </>
  );
}
