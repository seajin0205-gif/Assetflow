import { forwardRef } from "react";
import { AccountMetrics } from "@/components/dashboard/account-metrics";
import { AlertsPanel } from "@/components/dashboard/alerts-panel";
import { AssetFiltersPanel } from "@/components/dashboard/asset-filters-panel";
import { RevenueGrowthChart } from "@/components/dashboard/revenue-growth-chart";
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
          <AccountMetrics />
          <RevenueGrowthChart chartTheme={chartTheme} isDark={isDark} />
        </div>

        <div className="glass-panel space-y-6 p-6">
          <AssetFiltersPanel variant="list" inputName="asset" />
        </div>

        <div className="glass-panel space-y-4 p-6">
          <AlertsPanel />
        </div>
      </div>
    );
  },
);
