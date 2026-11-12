import { Area, AreaChart } from "recharts";
import { PriceFlash } from "@/components/price-flash";
import { useMarketFeed } from "@/hooks/use-market-feed";
import { cn } from "@/lib/utils";

function formatUsd(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value);
}

export function LiveQuoteTape() {
  const { quotes, charts } = useMarketFeed();

  return (
    <div className="border-b border-subtle bg-card/70">
      <div className="mx-auto flex max-w-dashboard gap-2 overflow-x-auto px-4 py-2 lg:grid lg:grid-cols-4 lg:overflow-visible lg:px-8">
        {quotes.map((quote) => {
          const rising = quote.change >= 0;
          const series = charts[quote.symbol];
          return (
            <div
              key={quote.symbol}
              data-testid={`quote-${quote.symbol}`}
              className="flex h-16 shrink-0 items-center gap-2 rounded-xl px-2"
            >
              <AreaChart
                width={64}
                height={32}
                data={series}
                margin={{ top: 4, right: 0, left: 0, bottom: 0 }}
              >
                <Area
                  type="monotone"
                  dataKey="price"
                  stroke={rising ? "#16a34a" : "#dc2626"}
                  fill={
                    rising
                      ? "rgba(22, 163, 74, 0.16)"
                      : "rgba(220, 38, 38, 0.16)"
                  }
                  strokeWidth={2}
                  isAnimationActive={false}
                  dot={false}
                />
              </AreaChart>
              <div className="min-w-0">
                <div className="text-xs font-semibold leading-4">
                  {quote.symbol}
                  <span className="ml-2 font-medium text-muted-foreground">
                    {quote.name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <PriceFlash
                    value={quote.price}
                    className="text-sm font-semibold leading-6 tabular-nums"
                  >
                    {formatUsd(quote.price)}
                  </PriceFlash>
                  <span
                    className={cn(
                      "text-xs font-semibold leading-4 tabular-nums",
                      rising
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-red-600 dark:text-red-400",
                    )}
                  >
                    {rising ? "+" : ""}
                    {quote.changePct.toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
