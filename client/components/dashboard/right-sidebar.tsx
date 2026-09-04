import { MarketBriefPanel } from "@/components/dashboard/market-brief-panel";
import { MatchedColumn } from "@/components/dashboard/matched-column";
import { MoodTracker } from "@/components/dashboard/mood-tracker";
import { StockList } from "@/components/dashboard/stock-list";

type RightSidebarProps = {
  columnHeight: number | null;
};

export function RightSidebar({ columnHeight }: RightSidebarProps) {
  return (
    <MatchedColumn height={columnHeight} className="w-full shrink-0 lg:w-80">
      <StockList />

      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden">
        <MarketBriefPanel />
        <MoodTracker />
      </div>
    </MatchedColumn>
  );
}
