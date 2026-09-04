import { useState } from "react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartLinearGradient } from "@/components/dashboard/chart-linear-gradient";
import { RevenueGrowthTooltip } from "@/components/dashboard/chart-tooltips";
import type { DashboardChartTheme } from "@/lib/dashboard-theme";
import {
  REVENUE_PERIOD_TABS,
  revenueChartDomain,
  revenueGrowthByPeriod,
  type RevenueGrowthPeriod,
} from "@/lib/dashboard-revenue";
import { cn } from "@/lib/utils";

type RevenueGrowthChartProps = {
  chartTheme: DashboardChartTheme;
  isDark: boolean;
};

export function RevenueGrowthChart({
  chartTheme,
  isDark,
}: RevenueGrowthChartProps) {
  const [period, setPeriod] = useState<RevenueGrowthPeriod>("1Y");
  const chartData = revenueGrowthByPeriod[period];
  const periodReturn = chartData[chartData.length - 1]?.returnPct ?? 0;

  return (
    <div className="glass-panel-sm space-y-4 p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-2">
          <span className="text-sm font-medium text-foreground/90">
            Revenue growth (YTD)
          </span>
          <span
            className={cn(
              "block font-display text-xl font-bold tabular-nums",
              periodReturn >= 0 ? "metric-positive" : "metric-negative",
            )}
          >
            {periodReturn >= 0 ? "+" : ""}
            {periodReturn.toFixed(1)}%
          </span>
        </div>
        <div
          className="flex shrink-0 gap-0 rounded-lg border border-subtle bg-muted/80 p-0"
          role="tablist"
          aria-label="Revenue growth period"
        >
          {REVENUE_PERIOD_TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={period === tab}
              onClick={() => setPeriod(tab)}
              className={cn(
                "rounded-md px-2 py-2 text-xs font-semibold leading-4 transition-colors",
                period === tab
                  ? "tab-active"
                  : "text-muted-foreground hover:text-blue-700 dark:hover:text-foreground",
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>
      <div className="h-36 overflow-visible rounded-lg [&_.recharts-surface]:[clip-path:inset(0_round_8px)]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            key={`${period}-${isDark ? "dark" : "light"}`}
            data={chartData}
            margin={{ top: 8, right: 8, left: 0, bottom: 8 }}
          >
            <defs>
              <ChartLinearGradient
                id="revenueGrowthGradient"
                stops={chartTheme.revenueGradient}
              />
              <ChartLinearGradient
                id="revenueGrowthStroke"
                direction="horizontal"
                stops={chartTheme.revenueStroke}
              />
            </defs>
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
              minTickGap={32}
              tick={{ fill: chartTheme.tickSecondary, fontSize: 12 }}
              dy={8}
            />
            <YAxis hide domain={revenueChartDomain} />
            <Tooltip
              content={<RevenueGrowthTooltip />}
              offset={0}
              allowEscapeViewBox={{ x: true, y: true }}
              wrapperStyle={{ pointerEvents: "none", zIndex: 80 }}
              cursor={{
                stroke: chartTheme.revenueCursor,
                strokeWidth: 1,
                strokeDasharray: "4 4",
              }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="url(#revenueGrowthStroke)"
              strokeWidth={2}
              fill="url(#revenueGrowthGradient)"
              fillOpacity={1}
              dot={false}
              isAnimationActive
              animationDuration={400}
              activeDot={{
                r: 8,
                fill: chartTheme.revenueActiveDot.fill,
                stroke: chartTheme.revenueActiveDot.stroke,
                strokeWidth: 2,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
