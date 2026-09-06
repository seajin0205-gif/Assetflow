import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Bell,
  LayoutDashboard,
  Newspaper,
  Search,
  ShieldAlert,
  TrendingUp,
} from "lucide-react";
import { AccountMetrics } from "@/components/dashboard/account-metrics";
import { AlertsPanel } from "@/components/dashboard/alerts-panel";
import { AssetFiltersPanel } from "@/components/dashboard/asset-filters-panel";
import { MarketBriefPanel } from "@/components/dashboard/market-brief-panel";
import { MoodTracker } from "@/components/dashboard/mood-tracker";
import { RevenueGrowthChart } from "@/components/dashboard/revenue-growth-chart";
import { RiskFactorAnalysis } from "@/components/dashboard/risk-factor-analysis";
import { RiskScoreCard } from "@/components/dashboard/risk-score-card";
import { RiskScoreCardSkeleton } from "@/components/dashboard/risk-score-skeleton";
import { HoldingsList } from "@/components/dashboard/holdings-list";
import {
  MobileTabNav,
  type MobileTabItem,
} from "@/components/mobile-tab-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { useDashboardChartTheme } from "@/hooks/use-dashboard-chart-theme";

type MobileTab = "home" | "risk" | "stocks" | "feed";

const NAV_ITEMS: MobileTabItem<MobileTab>[] = [
  { id: "home", label: "Home", icon: LayoutDashboard },
  { id: "risk", label: "Risk", icon: ShieldAlert },
  { id: "stocks", label: "Stocks", icon: TrendingUp },
  { id: "feed", label: "Feed", icon: Newspaper },
];

type DashboardMobileProps = {
  isRiskScoreLoading: boolean;
};

export function DashboardMobile({
  isRiskScoreLoading,
}: DashboardMobileProps) {
  const { isDark, chartTheme } = useDashboardChartTheme();
  const [tab, setTab] = useState<MobileTab>("home");

  return (
    <div className="dashboard-shell">
      <div className="dashboard-mobile-shell text-foreground">
        <header className="sticky top-0 z-40 border-b border-subtle bg-white/90 backdrop-blur-xl dark:bg-background/90">
          <div className="flex items-center justify-between gap-2 px-4 py-3">
            <div className="flex min-w-0 items-center gap-2">
              <img
                src="/logo-transparent.png"
                alt="Assetflow"
                className="h-8 w-auto shrink-0 object-contain"
              />
              <span className="truncate font-display text-base font-bold tracking-tight">
                Assetflow
              </span>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <Link
                to="/trade"
                className="btn-primary px-3 py-2 text-xs leading-4"
              >
                Trade
              </Link>
              <ThemeToggle />
              <button
                type="button"
                aria-label="Notifications"
                className="rounded-lg p-2 text-muted-foreground transition hover:bg-blue-50 hover:text-foreground dark:hover:bg-white/5"
              >
                <Bell className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="border-t border-subtle px-4 pb-3 pt-3">
            <div className="saas-input">
              <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search tickers, reports, risk"
                className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-4 py-4 pb-24">
          {tab === "home" && (
            <div className="animate-fade-in space-y-4">
              {isRiskScoreLoading ? (
                <RiskScoreCardSkeleton />
              ) : (
                <RiskScoreCard isDark={isDark} />
              )}

              <div className="glass-panel space-y-4 p-4">
                <AccountMetrics compact />
                <RevenueGrowthChart chartTheme={chartTheme} isDark={isDark} />
              </div>

              <div className="glass-panel space-y-4 p-4">
                <AssetFiltersPanel variant="chips" inputName="asset-mobile" />
              </div>
            </div>
          )}

          {tab === "risk" && (
            <div className="animate-fade-in">
              <RiskFactorAnalysis
                isLoading={isRiskScoreLoading}
                chartTheme={chartTheme}
                isDark={isDark}
              />
            </div>
          )}

          {tab === "stocks" && (
            <div className="animate-fade-in">
              <HoldingsList />
            </div>
          )}

          {tab === "feed" && (
            <div className="animate-fade-in space-y-4">
              <div className="glass-panel space-y-3 p-4">
                <AlertsPanel compact />
              </div>
              <MoodTracker />
              <MarketBriefPanel />
            </div>
          )}
        </main>

        <MobileTabNav<MobileTab>
          items={NAV_ITEMS}
          activeId={tab}
          onChange={setTab}
          ariaLabel="Dashboard menu"
        />
      </div>
    </div>
  );
}
