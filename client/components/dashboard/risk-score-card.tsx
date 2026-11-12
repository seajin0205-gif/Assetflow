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
  className?: string;
};

type RiskDriver = (typeof riskScoreDrivers)[number];

function DriverCell({ driver }: { driver: RiskDriver }) {
  return (
    <div
      className={cn(
        "flex min-w-0 flex-col items-center justify-center gap-1 rounded-lg border px-2 py-2 text-center",
        driver.tone === "negative"
          ? "border-red-500/25 bg-red-500/10 text-red-400"
          : "border-emerald-500/25 bg-emerald-500/10 text-emerald-500",
      )}
    >
      <span className="text-xs font-medium leading-4">{driver.label}</span>
      <span className="text-sm font-semibold leading-4 tabular-nums">
        {driver.delta}
      </span>
    </div>
  );
}

export function RiskScoreCard({ isDark, className }: RiskScoreCardProps) {
  const riskStatus = getRiskScoreStatus(RISK_SCORE_CURRENT);
  const riskStyles = riskScoreStatusStyles[riskStatus.tone];

  return (
    <div
      className={cn(
        "glass-panel relative h-full overflow-hidden px-6 py-6 lg:px-8 lg:py-8",
        className,
      )}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-red-500/40 to-transparent"
        aria-hidden
      />

      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4">
          <div className="min-w-0 space-y-2">
            <h4 className="font-display text-2xl font-bold leading-8 lg:text-3xl lg:leading-10">
              Risk score
            </h4>
            <p className="text-sm leading-6 text-muted-foreground">
              Portfolio composite index · 0–100 scale
            </p>
            <div className="flex flex-wrap items-center gap-2">
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
              <span className="text-xs leading-4 text-muted-foreground">
                · +{RISK_SCORE_MOM_DELTA} vs last mo.
              </span>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <div
              className={cn(
                "rounded-lg border px-4 py-2 text-sm font-semibold leading-4",
                riskStyles.badge,
              )}
            >
              {riskStatus.label}
            </div>
            <div
              className="flex items-baseline gap-2"
              aria-label={`Risk score ${RISK_SCORE_CURRENT}, ${riskStatus.label.toLowerCase()}`}
            >
              <span
                className={cn(
                  "font-display text-5xl font-extrabold leading-none tabular-nums",
                  riskStyles.score,
                )}
              >
                {RISK_SCORE_CURRENT}
              </span>
              <span className="text-base font-medium leading-6 text-muted-foreground">
                /100
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="relative h-2 overflow-visible rounded-full">
            <div
              className="absolute inset-0 overflow-hidden rounded-full bg-slate-200/80 dark:bg-white/[0.08]"
              aria-hidden
            >
              <div className="absolute inset-0 grid grid-cols-3">
                <div className="bg-emerald-500/40 dark:bg-emerald-400/70" />
                <div className="border-x border-white/25 bg-amber-500/40 dark:border-white/10 dark:bg-amber-400/70" />
                <div className="bg-red-500/45 dark:bg-red-400/75" />
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
          <div className="grid grid-cols-3 text-center text-xs font-medium uppercase leading-4 tracking-wider text-muted-foreground">
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

        <div className="space-y-2 border-t border-subtle pt-4">
          <div className="flex items-center justify-between gap-4">
            <span className="section-label">Top drivers</span>
            <span className="text-xs leading-4 text-muted-foreground">
              Target: below 40
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {riskScoreDrivers.map((driver) => (
              <DriverCell key={driver.label} driver={driver} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
