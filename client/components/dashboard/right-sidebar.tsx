import { MarketBriefPanel } from "@/components/dashboard/market-brief-panel";
import { HeightMatchedColumn } from "@/components/dashboard/height-matched-column";
import { MoodTracker } from "@/components/dashboard/mood-tracker";
import { HoldingsList } from "@/components/dashboard/holdings-list";

type RightSidebarProps = {
  columnHeight: number | null;
};

export function RightSidebar({ columnHeight }: RightSidebarProps) {
  return (
    <HeightMatchedColumn height={columnHeight} className="w-full shrink-0 lg:w-80">
      <HoldingsList />

      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden">
        <MarketBriefPanel />
        <MoodTracker />
      </div>
    </HeightMatchedColumn>
  );
}
