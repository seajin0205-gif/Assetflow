import { useMemo } from "react";
import { useTheme } from "next-themes";
import {
  getDashboardChartTheme,
  type DashboardChartTheme,
} from "@/lib/dashboard-theme";

/** Shared dark-mode + chart palette resolution for dashboard surfaces. */
export function useDashboardChartTheme(): {
  isDark: boolean;
  chartTheme: DashboardChartTheme;
} {
  const { resolvedTheme } = useTheme();
  // Match prior Index/mobile behavior: anything other than explicit light is dark.
  const isDark = resolvedTheme !== "light";
  const chartTheme = useMemo(() => getDashboardChartTheme(isDark), [isDark]);
  return { isDark, chartTheme };
}
