import { stockHoldings } from "@/data/dashboard";
import { cn } from "@/lib/utils";

export function StockList() {
  return (
    <div className="glass-panel flex shrink-0 flex-col space-y-4 px-6 py-6">
      <div className="space-y-2">
        <h2 className="font-display text-xl font-bold leading-8 tracking-tight lg:text-2xl lg:leading-8">
          My stocks
        </h2>
        <p className="text-xs leading-4 text-muted-foreground">
          All · Stocks · Crypto · ETF
        </p>
      </div>

      <div className="space-y-2">
        {stockHoldings.map((stock) => {
          const Icon = stock.icon;
          return (
            <div
              key={stock.ticker}
              className="flex items-center gap-4 rounded-xl px-2 py-2 hover-surface"
            >
              <div
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1",
                  stock.color,
                )}
              >
                <Icon className={cn("h-4 w-4", stock.iconClass)} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium leading-6">{stock.name}</div>
                <div className="truncate text-xs leading-4 text-muted-foreground">
                  {stock.ticker} · {stock.shares}
                </div>
              </div>
              <div className="shrink-0 text-right text-sm font-semibold leading-6 tabular-nums">
                {stock.price}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
