import { returnOnAssetsData } from "@/data/dashboard";
import {
  formatRevenueCurrency,
  type RevenueGrowthPoint,
} from "@/lib/dashboard-revenue";
import { cn } from "@/lib/utils";

type RevenueGrowthTooltipProps = {
  active?: boolean;
  payload?: { payload: RevenueGrowthPoint }[];
  label?: string;
  coordinate?: { x: number; y: number };
  viewBox?: { x?: number; y?: number; width?: number; height?: number };
};

export function RevenueGrowthTooltip({
  active,
  payload,
  label,
  coordinate,
  viewBox,
}: RevenueGrowthTooltipProps) {
  if (!active || !payload?.length) return null;

  const point = payload[0]?.payload;
  if (!point) return null;

  const positive = point.returnPct >= 0;

  const TOOLTIP_W = 208;
  const TOOLTIP_H = 112;
  const GAP = 8;

  const vx = viewBox?.x ?? 0;
  const vy = viewBox?.y ?? 0;
  const vw = viewBox?.width ?? 0;
  const vh = viewBox?.height ?? 0;
  const cx = coordinate?.x ?? 0;
  const cy = coordinate?.y ?? 0;

  const spaceLeft = cx - vx;
  const spaceRight = vx + vw - cx;
  const spaceTop = cy - vy;
  const spaceBottom = vy + vh - cy;

  const placeRight = spaceRight >= TOOLTIP_W + GAP || spaceRight >= spaceLeft;
  const placeAbove = spaceTop >= TOOLTIP_H + GAP || spaceTop >= spaceBottom;

  let dx = placeRight ? GAP : -(TOOLTIP_W + GAP);
  let dy = placeAbove ? -(TOOLTIP_H + GAP) : GAP;

  if (vw > 0) {
    const left = cx + dx;
    const right = left + TOOLTIP_W;
    if (left < vx + 8) {
      const nextDx = dx + (vx + 8 - left);
      dx = placeRight ? Math.max(nextDx, GAP) : nextDx;
    }
    if (right > vx + vw - 8) {
      const nextDx = dx - (right - (vx + vw - 8));
      dx = !placeRight ? Math.min(nextDx, -(TOOLTIP_W + GAP)) : nextDx;
    }
  }
  if (vh > 0) {
    const top = cy + dy;
    const bottom = top + TOOLTIP_H;
    if (top < vy + 8 && !placeAbove) dy = dy + (vy + 8 - top);
    if (bottom > vy + vh - 8 && placeAbove) {
      dy = dy - (bottom - (vy + vh - 8));
    }
  }

  return (
    <div
      className="chart-tooltip w-52 border-blue-200/80 dark:border-cyan-500/25"
      style={{ transform: `translate(${dx}px, ${dy}px)` }}
    >
      <p className="mb-2 font-semibold text-foreground">{label ?? point.label}</p>
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-6 text-muted-foreground">
          <span>Portfolio value</span>
          <span className="tabular-nums font-medium text-foreground">
            {formatRevenueCurrency(point.value)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-6 text-muted-foreground">
          <span>Return</span>
          <span
            className={cn(
              "tabular-nums font-semibold",
              positive ? "metric-positive" : "metric-negative",
            )}
          >
            {positive ? "+" : ""}
            {point.returnPct.toFixed(1)}%
          </span>
        </div>
      </div>
    </div>
  );
}

type RotaTooltipProps = {
  active?: boolean;
  payload?: { name: string; value: number; color: string; dataKey: string }[];
  label?: string;
};

export function RotaTooltip({ active, payload, label }: RotaTooltipProps) {
  if (!active || !payload?.length) return null;

  const row = returnOnAssetsData.find((d) => d.month === label);

  return (
    <div className="chart-tooltip">
      <p className="mb-2 font-semibold text-foreground">{label}</p>
      <div className="space-y-2 text-muted-foreground">
        {payload.map((entry) => (
          <div key={entry.dataKey} className="flex items-center justify-between gap-6">
            <span className="flex items-center gap-2">
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              {entry.name}
            </span>
            <span className="tabular-nums font-medium text-foreground">
              {entry.value}
              {entry.dataKey === "netIncome" ? "M" : "%"}
            </span>
          </div>
        ))}
        {row != null && (
          <p className="border-subtle border-t pt-2 text-muted-foreground">
            Net income ${row.netIncome}M
          </p>
        )}
      </div>
    </div>
  );
}
