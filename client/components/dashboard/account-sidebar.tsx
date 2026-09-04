import { forwardRef } from "react";
import { RevenueGrowthChart } from "@/components/dashboard/revenue-growth-chart";
import { ALERT_ITEMS, ASSET_FILTER_OPTIONS } from "@/data/dashboard";
import type { DashboardChartTheme } from "@/lib/dashboard-theme";

type AccountSidebarProps = {
  chartTheme: DashboardChartTheme;
  isDark: boolean;
};

export const AccountSidebar = forwardRef<HTMLDivElement, AccountSidebarProps>(
  function AccountSidebar({ chartTheme, isDark }, ref) {
    return (
      <div
        ref={ref}
        className="flex w-full shrink-0 flex-col gap-6 lg:w-80"
      >
        <div className="glass-panel animate-fade-in space-y-6 p-6">
          <div className="flex items-start justify-between gap-4">
            <h2 className="font-display text-xl font-bold leading-8 tracking-tight lg:text-2xl lg:leading-8">
              My account
            </h2>
            <span className="rounded-lg border border-subtle bg-subtle px-2 py-2 text-xs leading-4 text-muted-foreground">
              ID 78241
            </span>
          </div>

          <div className="grid min-w-0 grid-cols-2 gap-4">
            <div className="glass-panel-sm flex min-w-0 flex-col gap-2 px-2 py-4">
              <div className="section-label shrink-0">Net worth</div>
              <div className="metric-value">$1,262,480</div>
            </div>
            <div className="glass-panel-sm flex min-w-0 flex-col gap-2 px-2 py-4">
              <div className="section-label shrink-0">Cash</div>
              <div className="metric-value">$120,540</div>
            </div>
          </div>

          <RevenueGrowthChart chartTheme={chartTheme} isDark={isDark} />
        </div>

        <div className="glass-panel space-y-6 p-6">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg font-bold leading-6">Quick Filters</h3>
            <button
              type="button"
              className="text-xs font-medium leading-4 text-primary hover:text-blue-700 dark:hover:text-cyan-300"
            >
              Reset
            </button>
          </div>

          <div className="space-y-4">
            {ASSET_FILTER_OPTIONS.map((label, i) => (
              <label
                key={label}
                className="flex cursor-pointer items-center gap-4 rounded-lg border border-transparent px-2 py-2 hover-surface-row"
              >
                <input
                  type="radio"
                  name="asset"
                  defaultChecked={i === 0}
                  className="h-4 w-4"
                />
                <span className="text-sm leading-6 text-foreground/90">{label}</span>
              </label>
            ))}
          </div>

          <div className="space-y-2 border-t border-subtle pt-4">
            <div className="flex items-center justify-between text-xs leading-4 text-muted-foreground">
              <span>Risk sensitivity</span>
              <span className="font-medium text-foreground">30%</span>
            </div>
            <input
              type="range"
              className="w-full"
              min="0"
              max="100"
              defaultValue="30"
            />
          </div>
        </div>

        <div className="glass-panel space-y-4 p-6">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg font-bold leading-6">Alerts</h3>
            <span className="rounded-full bg-red-500/15 px-2 py-1 text-xs font-semibold leading-4 text-red-400">
              3 unread
            </span>
          </div>

          <ul className="space-y-2 text-sm leading-6 text-muted-foreground">
            {ALERT_ITEMS.map((alert) => (
              <li
                key={alert}
                className="rounded-lg border border-subtle bg-subtle-muted px-4 py-2 leading-6 transition hover:border-blue-100 hover:bg-blue-50/70 dark:hover:border-white/[0.08] dark:hover:bg-white/[0.04]"
              >
                {alert}
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  },
);
