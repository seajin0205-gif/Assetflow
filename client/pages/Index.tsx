import { useMemo, useRef } from "react";
import { useTheme } from "next-themes";
import { AccountSidebar } from "@/components/dashboard/account-sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardMobile } from "@/components/dashboard/dashboard-mobile";
import { MatchedColumn } from "@/components/dashboard/matched-column";
import { RightSidebar } from "@/components/dashboard/right-sidebar";
import { RiskFactorAnalysis } from "@/components/dashboard/risk-factor-analysis";
import { RiskScoreCard } from "@/components/dashboard/risk-score-card";
import { RiskScoreCardSkeleton } from "@/components/dashboard/risk-score-skeleton";
import { useLeftColumnHeight } from "@/hooks/use-left-column-height";
import { useRiskScoreLoading } from "@/hooks/use-risk-score-loading";
import { getDashboardChartTheme } from "@/lib/dashboard-theme";

export default function Index() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme !== "light";
  const chartTheme = useMemo(
    () => getDashboardChartTheme(isDark),
    [isDark],
  );

  const leftSidebarRef = useRef<HTMLDivElement>(null);
  const leftColumnHeight = useLeftColumnHeight(leftSidebarRef);
  const isRiskScoreLoading = useRiskScoreLoading();

  return (
    <>
      <div className="lg:hidden">
        <DashboardMobile />
      </div>

      <div className="dashboard-shell hidden min-h-screen text-foreground lg:block">
        <DashboardHeader />

        <main className="mx-auto flex max-w-dashboard flex-col gap-6 p-6 lg:flex-row lg:items-start lg:p-8">
          <AccountSidebar
            ref={leftSidebarRef}
            chartTheme={chartTheme}
            isDark={isDark}
          />

          <MatchedColumn height={leftColumnHeight} className="flex-1">
            {isRiskScoreLoading ? (
              <RiskScoreCardSkeleton />
            ) : (
              <RiskScoreCard isDark={isDark} />
            )}
            <RiskFactorAnalysis
              isLoading={isRiskScoreLoading}
              chartTheme={chartTheme}
              isDark={isDark}
            />
          </MatchedColumn>

          <RightSidebar columnHeight={leftColumnHeight} />
        </main>
      </div>
    </>
  );
}
