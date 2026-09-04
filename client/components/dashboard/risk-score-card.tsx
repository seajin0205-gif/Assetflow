import { Area, AreaChart, ResponsiveContainer, YAxis } from "recharts";
import { ChartLinearGradient } from "@/components/dashboard/chart-linear-gradient";
import {
  RISK_SCORE_1W_CHANGE,
  RISK_SCORE_CURRENT,
  RISK_SCORE_MOM_DELTA,
  riskScoreDrivers,
  riskScoreTrendData,
} from "@/data/dashboard";
import {
  getRiskScoreStatus,
  riskScoreStatusStyles,
} from "@/lib/dashboard-risk";
import { cn } from "@/lib/utils";

type RiskScoreCardProps = {
  isDark: boolean;
};

type RiskDriver = (typeof riskScoreDrivers)[number];

function DriverChip({ driver }: { driver: RiskDriver }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-lg border px-2 py-2 text-xs font-medium leading-4 tabular-nums",
        driver.tone === "negative"
          ? "border-red-500/25 bg-red-500/10 text-red-400"
          : "border-emerald-500/25 bg-emerald-500/10 text-emerald-500",
      )}
    >
      {driver.label}
      <span className="font-semibold">{driver.delta}</span>
    </span>
  );
}

export function RiskScoreCard({ isDark }: RiskScoreCardProps) {
  const riskStatus = getRiskScoreStatus(RISK_SCORE_CURRENT);
  const riskStyles = riskScoreStatusStyles[riskStatus.tone];

  return (
    <div className="glass-panel relative shrink-0 overflow-hidden px-6 py-6 lg:px-8 lg:py-8">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-red-500/40 to-transparent"
        aria-hidden
      />

      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 space-y-2">
            <h4 className="font-display text-2xl font-bold leading-8 lg:text-3xl lg:leading-10">
              Risk score
            </h4>
            <p className="text-sm leading-6 text-muted-foreground">
              Portfolio composite index · 0–100 scale
            </p>
          </div>

          <div className="flex items-center justify-between gap-3 lg:justify-end lg:gap-6">
            <div className="flex min-w-0 flex-col items-start gap-2 lg:items-end">
              <div
                className={cn(
                  "rounded-lg border px-3 py-1.5 text-sm font-semibold leading-6 lg:px-4 lg:py-2",
                  riskStyles.badge,
                )}
              >
                {riskStatus.label}
              </div>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <svg
                  className="h-4 w-4 shrink-0 text-red-500"
                  fill="currentColor"
                  viewBox="0 0 16 10"
                  aria-hidden
                >
                  <path d="M8 10L14.9282 2.5H1.0718L8 10Z" />
                </svg>
                <span className="text-xs font-semibold leading-4 tabular-nums text-red-400">
                  {RISK_SCORE_1W_CHANGE}% 1W
                </span>
                <span className="hidden text-xs leading-4 text-muted-foreground min-[400px]:inline">
                  · +{RISK_SCORE_MOM_DELTA} vs last mo.
                </span>
              </div>
            </div>

            <div
              className="flex shrink-0 items-baseline gap-1.5"
              aria-label={`Risk score ${RISK_SCORE_CURRENT}, ${riskStatus.label.toLowerCase()}`}
            >
              <span
                className={cn(
                  "font-display text-4xl font-extrabold leading-none tabular-nums sm:text-5xl lg:text-6xl lg:leading-none",
                  riskStyles.score,
                )}
              >
                {RISK_SCORE_CURRENT}
              </span>
              <span className="text-base font-medium leading-6 text-muted-foreground lg:text-lg">
                /100
              </span>
            </div>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_144px] lg:items-center lg:gap-6">
          <div className="space-y-2">
            <div className="relative h-2 overflow-visible rounded-full">
              <div
                className="absolute inset-0 overflow-hidden rounded-full bg-slate-200/80 dark:bg-white/[0.08]"
                aria-hidden
              >
                <div className="absolute inset-0 flex">
                  <div className="h-full flex-[34] bg-emerald-500/40 dark:bg-emerald-400/70" />
                  <div className="h-full flex-[33] border-x border-white/25 bg-amber-500/40 dark:border-white/10 dark:bg-amber-400/70" />
                  <div className="h-full flex-[33] bg-red-500/45 dark:bg-red-400/75" />
                </div>
              </div>
              <div
                className={cn(
                  "absolute top-1/2 z-10 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 shadow-sm",
                  riskStyles.marker,
                )}
                style={{ left: `${RISK_SCORE_CURRENT}%` }}
                aria-hidden
              />
            </div>
            <div className="flex justify-between text-xs font-medium uppercase leading-4 tracking-wider text-muted-foreground">
              <span>Low</span>
              <span>Moderate</span>
              <span>High</span>
            </div>
          </div>

          <div className="h-16 overflow-hidden rounded-lg">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                key={isDark ? "risk-trend-dark" : "risk-trend-light"}
                data={riskScoreTrendData}
                margin={{ top: 8, right: 8, left: 8, bottom: 0 }}
              >
                <defs>
                  <ChartLinearGradient
                    id="riskScoreTrendGradient"
                    stops={riskStyles.sparkGradient}
                  />
                </defs>
                <YAxis domain={[45, 85]} hide />
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke={riskStyles.sparkStroke}
                  strokeWidth={2}
                  fill="url(#riskScoreTrendGradient)"
                  dot={false}
                  activeDot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="border-t border-subtle pt-4 lg:grid lg:grid-cols-[minmax(0,1fr)_144px] lg:items-center lg:gap-6">
          <div className="flex flex-col items-center gap-2 lg:flex-row lg:items-center lg:justify-start">
            <span className="section-label lg:mr-2">Top drivers</span>
            <div className="flex flex-col items-center gap-2 lg:hidden">
              <DriverChip driver={riskScoreDrivers[0]} />
              <div className="flex justify-center gap-2">
                {riskScoreDrivers.slice(1).map((driver) => (
                  <DriverChip key={driver.label} driver={driver} />
                ))}
              </div>
            </div>
            <div className="hidden flex-wrap items-center justify-center gap-2 lg:flex">
              {riskScoreDrivers.map((driver) => (
                <DriverChip key={driver.label} driver={driver} />
              ))}
            </div>
          </div>
          <div className="mt-2 flex justify-center lg:mt-0 lg:justify-end">
            <span className="text-xs leading-4 text-muted-foreground">Target: below 40</span>
          </div>
        </div>
      </div>
    </div>
  );
}
