import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Bell,
  LayoutDashboard,
  Newspaper,
  Search,
  ShieldAlert,
  TrendingUp,
} from "lucide-react";
import { useTheme } from "next-themes";
import { RevenueGrowthChart } from "@/components/dashboard/revenue-growth-chart";
import { MarketBriefPanel } from "@/components/dashboard/market-brief-panel";
import { MoodTracker } from "@/components/dashboard/mood-tracker";
import { RiskFactorAnalysis } from "@/components/dashboard/risk-factor-analysis";
import { RiskScoreCard } from "@/components/dashboard/risk-score-card";
import { StockList } from "@/components/dashboard/stock-list";
import { RiskScoreCardSkeleton } from "@/components/risk-score-skeleton";
import { ThemeToggle } from "@/components/theme-toggle";
import { ALERT_ITEMS, ASSET_FILTER_OPTIONS } from "@/data/dashboard";
import { useRiskScoreLoading } from "@/hooks/use-risk-score-loading";
import { getDashboardChartTheme } from "@/lib/dashboard-theme";
import { cn } from "@/lib/utils";

type MobileTab = "home" | "risk" | "stocks" | "feed";

const NAV_ITEMS: { id: MobileTab; label: string; icon: typeof LayoutDashboard }[] =
  [
    { id: "home", label: "Home", icon: LayoutDashboard },
    { id: "risk", label: "Risk", icon: ShieldAlert },
    { id: "stocks", label: "Stocks", icon: TrendingUp },
    { id: "feed", label: "Feed", icon: Newspaper },
  ];

export function DashboardMobile() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme !== "light";
  const chartTheme = useMemo(
    () => getDashboardChartTheme(isDark),
    [isDark],
  );
  const isRiskScoreLoading = useRiskScoreLoading();
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
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-lg font-bold">My account</h2>
                  <span className="rounded-lg border border-subtle bg-subtle px-2 py-1 text-xs text-muted-foreground">
                    ID 78241
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="glass-panel-sm flex flex-col gap-1 px-3 py-3">
                    <div className="section-label">Net worth</div>
                    <div className="metric-value text-lg sm:text-xl">$1,262,480</div>
                  </div>
                  <div className="glass-panel-sm flex flex-col gap-1 px-3 py-3">
                    <div className="section-label">Cash</div>
                    <div className="metric-value text-lg sm:text-xl">$120,540</div>
                  </div>
                </div>
                <RevenueGrowthChart chartTheme={chartTheme} isDark={isDark} />
              </div>

              <div className="glass-panel space-y-4 p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-base font-bold">Quick filters</h3>
                  <button
                    type="button"
                    className="text-xs font-medium text-primary"
                  >
                    Reset
                  </button>
                </div>
                <div className="flex flex-wrap justify-center gap-2">
                  {ASSET_FILTER_OPTIONS.map((label, i) => (
                    <label
                      key={label}
                      className={cn(
                        "cursor-pointer rounded-full border px-3 py-1.5 text-xs font-medium transition",
                        i === 0
                          ? "border-primary/40 bg-primary/10 text-primary"
                          : "border-subtle bg-subtle text-muted-foreground",
                      )}
                    >
                      <input
                        type="radio"
                        name="asset-mobile"
                        defaultChecked={i === 0}
                        className="sr-only"
                      />
                      {label}
                    </label>
                  ))}
                </div>
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
              <StockList />
            </div>
          )}

          {tab === "feed" && (
            <div className="animate-fade-in space-y-4">
              <div className="glass-panel space-y-3 p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-base font-bold">Alerts</h3>
                  <span className="rounded-full bg-red-500/15 px-2 py-0.5 text-xs font-semibold text-red-400">
                    3 unread
                  </span>
                </div>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {ALERT_ITEMS.map((alert) => (
                    <li
                      key={alert}
                      className="rounded-lg border border-subtle bg-subtle-muted px-3 py-2"
                    >
                      {alert}
                    </li>
                  ))}
                </ul>
              </div>
              <MoodTracker />
              <MarketBriefPanel />
            </div>
          )}
        </main>

        <nav className="dashboard-mobile-nav" aria-label="Dashboard menu">
          <div className="grid grid-cols-4 px-2 pt-2">
            {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={cn(
                  "flex flex-col items-center gap-1.5 py-2 text-xs font-medium leading-4 transition",
                  tab === id ? "text-foreground" : "text-muted-foreground",
                )}
              >
                <Icon
                  className={cn(
                    "h-4 w-4",
                    tab === id && "text-primary",
                  )}
                />
                {label}
              </button>
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
}
