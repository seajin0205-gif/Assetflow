import {
  Area,
  AreaChart,
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartLinearGradient } from "@/components/dashboard/chart-linear-gradient";
import { RotaTooltip } from "@/components/dashboard/chart-tooltips";
import {
  RiskFactorCardSkeleton,
  RiskScoreChartSkeleton,
  RiskScoreNumberSkeleton,
} from "@/components/risk-score-skeleton";
import { Skeleton } from "@/components/ui/skeleton";
import {
  equityBetaData,
  fxExposureColors,
  fxExposureData,
  latestAvg3m,
  latestEquityBeta,
  latestRota,
  returnOnAssetsData,
  rotaYtdChange,
  totalFxExposure,
  vsBenchmark,
} from "@/data/dashboard";
import type { DashboardChartTheme } from "@/lib/dashboard-theme";
import { rotaBarFill } from "@/lib/dashboard-risk";
import { cn } from "@/lib/utils";

type RiskFactorAnalysisProps = {
  isLoading: boolean;
  chartTheme: DashboardChartTheme;
  isDark: boolean;
};

export function RiskFactorAnalysis({
  isLoading,
  chartTheme,
  isDark,
}: RiskFactorAnalysisProps) {
  return (
    <div className="glass-panel flex flex-col gap-6 overflow-hidden p-4 lg:min-h-0 lg:flex-1 lg:gap-8 lg:p-8">
      <div className="shrink-0 space-y-4">
        <h3 className="font-display text-2xl font-bold tracking-tight lg:text-3xl">
          Risk Factor Analysis
        </h3>
        <p className="max-w-2xl text-sm text-muted-foreground lg:text-base">
          Breakdown of exposures by systematic factors and concentration
        </p>
      </div>

      <div className="flex shrink-0 gap-4">
        <button type="button" className="btn-ghost text-sm">
          Export
        </button>
        <button type="button" className="btn-ghost text-sm">
          Compare
        </button>
      </div>

      <div className="grid shrink-0 grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
        {isLoading ? (
          <>
            <RiskFactorCardSkeleton variant="area" />
            <RiskFactorCardSkeleton variant="bars" />
          </>
        ) : (
          <>
            <EquityBetaCard chartTheme={chartTheme} isDark={isDark} />
            <FxExposureCard isDark={isDark} />
          </>
        )}
      </div>

      {isLoading ? <RotaChartSkeleton /> : <RotaChart chartTheme={chartTheme} isDark={isDark} />}
    </div>
  );
}

function EquityBetaCard({
  chartTheme,
  isDark,
}: {
  chartTheme: DashboardChartTheme;
  isDark: boolean;
}) {
  return (
    <div className="glass-panel-sm flex flex-col gap-4 p-4 lg:p-6">
      <div className="flex items-baseline justify-between gap-2">
        <h4 className="font-display text-base font-semibold leading-6 text-foreground/90 lg:text-lg lg:leading-6">
          Equity beta
        </h4>
        <div className="font-display text-2xl font-bold tabular-nums lg:text-3xl">
          {latestEquityBeta.toFixed(2)}
        </div>
      </div>
      <div className="h-36 overflow-hidden rounded-lg lg:min-h-32 lg:h-auto lg:flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            key={isDark ? "equity-dark" : "equity-light"}
            data={equityBetaData}
            margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
          >
            <defs>
              <ChartLinearGradient
                id="equityBetaGradient"
                stops={chartTheme.equityGradient}
              />
            </defs>
            <YAxis domain={[0.68, 0.9]} hide />
            <Area
              type="monotone"
              dataKey="beta"
              stroke={chartTheme.equityAreaStroke}
              strokeWidth={2}
              fill="url(#equityBetaGradient)"
              dot={false}
              activeDot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function FxExposureCard({ isDark }: { isDark: boolean }) {
  return (
    <div className="glass-panel-sm fx-card-accent flex flex-col gap-4 p-4 lg:p-6">
      <div className="flex items-baseline justify-between gap-2">
        <h4 className="font-display text-base font-semibold leading-6 text-foreground/90 lg:text-lg lg:leading-6">
          FX exposure
        </h4>
        <div className="font-display text-2xl font-bold tabular-nums lg:text-3xl">
          {totalFxExposure.toFixed(1)}%
        </div>
      </div>
      <div className="flex flex-col gap-4 lg:min-h-32 lg:flex-row lg:items-center lg:gap-4">
        <div className="mx-auto aspect-square h-36 w-36 shrink-0 lg:mx-0 lg:h-full lg:max-h-32 lg:min-h-22 lg:min-w-0 lg:flex-1 lg:self-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart
              key={isDark ? "fx-dark" : "fx-light"}
              margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
            >
              <Pie
                data={fxExposureData}
                dataKey="exposure"
                nameKey="currency"
                cx="50%"
                cy="50%"
                innerRadius={0}
                outerRadius="100%"
                paddingAngle={0}
                cornerRadius={0}
                stroke={
                  isDark ? "rgba(2, 6, 23, 0.45)" : "rgba(255, 255, 255, 0.75)"
                }
                strokeWidth={2}
              >
                {fxExposureData.map((entry, i) => (
                  <Cell key={entry.currency} fill={fxExposureColors[i]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <ul className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs leading-4 sm:flex sm:shrink-0 sm:flex-col sm:justify-center lg:gap-2 lg:text-sm lg:leading-6">
          {fxExposureData.map((entry, i) => (
            <li
              key={entry.currency}
              className="flex items-center justify-between gap-4 tabular-nums"
            >
              <span className="flex items-center gap-2 text-muted-foreground">
                <span
                  className="inline-block h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: fxExposureColors[i] }}
                />
                {entry.currency}
              </span>
              <span className="font-medium text-foreground">
                {entry.exposure.toFixed(1)}%
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function RotaChartSkeleton() {
  return (
    <div
      className="glass-panel-sm flex min-h-0 flex-1 flex-col gap-4 p-4 lg:p-6"
      aria-busy="true"
      aria-label="Loading return on total assets"
    >
      <div className="flex shrink-0 flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-6 w-44 rounded-md lg:h-6 lg:w-52" />
          <Skeleton className="h-4 w-56 rounded-md" />
        </div>
        <RiskScoreNumberSkeleton size="card" className="h-8 w-16 lg:h-8 lg:w-16" />
      </div>
      <div className="flex shrink-0 flex-wrap gap-2">
        <Skeleton className="h-8 w-16 rounded-lg" />
        <Skeleton className="h-8 w-20 rounded-lg" />
        <Skeleton className="h-8 w-20 rounded-lg" />
      </div>
      <RiskScoreChartSkeleton
        variant="bars"
        className="min-h-32 flex-1 lg:min-h-32"
      />
    </div>
  );
}

function RotaChart({
  chartTheme,
  isDark,
}: {
  chartTheme: DashboardChartTheme;
  isDark: boolean;
}) {
  return (
    <div className="glass-panel-sm flex flex-col gap-4 p-4 lg:min-h-0 lg:flex-1 lg:p-6">
      <div className="flex shrink-0 flex-wrap items-start justify-between gap-4">
        <div>
          <h4 className="text-base font-semibold leading-6 lg:text-lg lg:leading-6">
            Return on Total Assets
          </h4>
          <p className="mt-2 text-xs leading-4 text-muted-foreground">
            Net income ÷ total assets · monthly %
          </p>
        </div>
        <span className="font-display text-xl font-bold tabular-nums lg:text-2xl">
          {latestRota.toFixed(1)}%
        </span>
      </div>

      <div className="flex shrink-0 flex-wrap gap-2">
        <span
          className={cn(
            "rounded-lg border px-2 py-2 text-xs font-semibold leading-4 tabular-nums",
            rotaYtdChange >= 0 ? "badge-positive" : "badge-negative",
          )}
        >
          YTD {rotaYtdChange >= 0 ? "+" : ""}
          {rotaYtdChange.toFixed(1)}pp
        </span>
        <span
          className={cn(
            "rounded-lg border px-2 py-2 text-xs font-semibold leading-4 tabular-nums",
            vsBenchmark >= 0 ? "badge-positive" : "badge-warning",
          )}
        >
          vs peer {vsBenchmark >= 0 ? "+" : ""}
          {vsBenchmark.toFixed(1)}pp
        </span>
        <span className="rounded-lg border border-subtle bg-subtle px-2 py-2 text-xs leading-4 tabular-nums text-muted-foreground">
          3m avg {latestAvg3m.toFixed(1)}%
        </span>
      </div>

      <div className="h-44 overflow-hidden rounded-lg lg:min-h-32 lg:flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            key={isDark ? "rota-dark" : "rota-light"}
            data={returnOnAssetsData}
            margin={{ top: 16, right: 8, left: 0, bottom: 0 }}
          >
            <CartesianGrid
              stroke={chartTheme.gridStroke}
              strokeDasharray="3 3"
              vertical={false}
            />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              interval={1}
              tick={{ fill: chartTheme.tickPrimary, fontSize: 12 }}
            />
            <YAxis
              yAxisId="rota"
              domain={[3.2, 5.6]}
              axisLine={false}
              tickLine={false}
              tick={{ fill: chartTheme.tickSecondary, fontSize: 12 }}
              tickFormatter={(v) => `${v}%`}
              width={40}
            />
            <Tooltip
              content={<RotaTooltip />}
              cursor={{ fill: chartTheme.tooltipCursor }}
            />
            <Legend
              verticalAlign="top"
              align="right"
              iconType="circle"
              iconSize={8}
              wrapperStyle={{
                fontSize: 12,
                color: chartTheme.legendColor,
                paddingBottom: 8,
              }}
            />
            <Bar
              yAxisId="rota"
              dataKey="rota"
              name="Monthly ROTA"
              radius={[8, 8, 0, 0]}
              barSize={16}
              maxBarSize={16}
            >
              {returnOnAssetsData.map((entry) => (
                <Cell
                  key={entry.month}
                  fill={rotaBarFill(entry.rota)}
                  fillOpacity={0.8}
                />
              ))}
            </Bar>
            <Line
              yAxisId="rota"
              type="monotone"
              dataKey="avg3m"
              name="3m rolling avg"
              stroke="#a78bfa"
              strokeWidth={2}
              dot={{ r: 2, fill: "#a78bfa", strokeWidth: 0 }}
              activeDot={{ r: 4, fill: "#c4b5fd" }}
            />
            <Line
              yAxisId="rota"
              type="monotone"
              dataKey="benchmark"
              name="Peer benchmark"
              stroke="#fbbf24"
              strokeWidth={2}
              strokeDasharray="8 8"
              dot={false}
              activeDot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
