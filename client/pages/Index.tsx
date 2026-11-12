import { useMemo } from "react";
import { useTheme } from "next-themes";
import {
  AccountSummary,
  AlertsPanel,
  QuickFilters,
} from "@/components/dashboard/account-sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { LiveQuoteTape } from "@/components/dashboard/live-quote-tape";
import { DashboardMobile } from "@/components/dashboard/dashboard-mobile";
import { MarketBriefPanel } from "@/components/dashboard/market-brief-panel";
import { MoodTracker } from "@/components/dashboard/mood-tracker";
import {
  ReturnOnAssetsCard,
  RiskFactorPair,
} from "@/components/dashboard/risk-factor-analysis";
import { RiskScoreCard } from "@/components/dashboard/risk-score-card";
import { RiskScoreCardSkeleton } from "@/components/risk-score-skeleton";
import { StockList } from "@/components/dashboard/stock-list";
import { useIsDesktop } from "@/hooks/use-mobile";
import { useRiskScoreLoading } from "@/hooks/use-risk-score-loading";
import { getDashboardChartTheme } from "@/lib/dashboard-theme";

export default function Index() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme !== "light";
  const chartTheme = useMemo(() => getDashboardChartTheme(isDark), [isDark]);

  const isRiskScoreLoading = useRiskScoreLoading();
  const isDesktop = useIsDesktop();

  if (!isDesktop) {
    return <DashboardMobile />;
  }

  return (
    <div className="dashboard-shell min-h-screen text-foreground">
      <DashboardHeader />
      <LiveQuoteTape />

      <main className="mx-auto grid max-w-dashboard grid-cols-1 items-stretch gap-6 p-6 lg:grid-cols-[20rem_minmax(0,1fr)_20rem] lg:p-8">
        <AccountSummary
          chartTheme={chartTheme}
          isDark={isDark}
          className="h-full"
        />
        {isRiskScoreLoading ? (
          <RiskScoreCardSkeleton className="h-full" />
        ) : (
          <RiskScoreCard isDark={isDark} className="h-full" />
        )}
        <StockList />

        <QuickFilters />
        <RiskFactorPair
          isLoading={isRiskScoreLoading}
          chartTheme={chartTheme}
          isDark={isDark}
        />
        <div className="relative min-h-0">
          <div className="absolute inset-0">
            <MarketBriefPanel />
          </div>
        </div>

        <AlertsPanel />
        <ReturnOnAssetsCard
          isLoading={isRiskScoreLoading}
          chartTheme={chartTheme}
          isDark={isDark}
        />
        <MoodTracker />
      </main>
    </div>
  );
}
