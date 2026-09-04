export type DashboardChartTheme = {
  gridStroke: string;
  tickPrimary: string;
  tickSecondary: string;
  legendColor: string;
  tooltipCursor: string;
  revenueCursor: string;
  revenueGradient: { offset: string; color: string; opacity: number }[];
  revenueStroke: { offset: string; color: string }[];
  revenueActiveDot: { fill: string; stroke: string };
  equityAreaStroke: string;
  equityGradient: { offset: string; color: string; opacity: number }[];
};

export function getDashboardChartTheme(isDark: boolean): DashboardChartTheme {
  if (isDark) {
    return {
      gridStroke: "rgba(255,255,255,0.08)",
      tickPrimary: "rgba(255,255,255,0.55)",
      tickSecondary: "rgba(255,255,255,0.45)",
      legendColor: "rgba(255,255,255,0.65)",
      tooltipCursor: "rgba(255,255,255,0.06)",
      revenueCursor: "rgba(96,165,250,0.45)",
      revenueGradient: [
        { offset: "0%", color: "#38bdf8", opacity: 0.9 },
        { offset: "40%", color: "#3b82f6", opacity: 0.55 },
        { offset: "75%", color: "#2563eb", opacity: 0.28 },
        { offset: "100%", color: "#1e3a8a", opacity: 0.06 },
      ],
      revenueStroke: [
        { offset: "0%", color: "#60a5fa" },
        { offset: "45%", color: "#3b82f6" },
        { offset: "100%", color: "#1d4ed8" },
      ],
      revenueActiveDot: { fill: "#93c5fd", stroke: "#eff6ff" },
      equityAreaStroke: "#60a5fa",
      equityGradient: [
        { offset: "0%", color: "#3b82f6", opacity: 0.5 },
        { offset: "100%", color: "#3b82f6", opacity: 0 },
      ],
    };
  }

  return {
    gridStroke: "rgba(37, 99, 235, 0.08)",
    tickPrimary: "rgba(71, 85, 105, 0.85)",
    tickSecondary: "rgba(100, 116, 139, 0.75)",
    legendColor: "rgba(51, 65, 85, 0.82)",
    tooltipCursor: "rgba(37, 99, 235, 0.06)",
    revenueCursor: "rgba(37, 99, 235, 0.28)",
    revenueGradient: [
      { offset: "0%", color: "#3b82f6", opacity: 0.35 },
      { offset: "45%", color: "#2563eb", opacity: 0.22 },
      { offset: "80%", color: "#1d4ed8", opacity: 0.1 },
      { offset: "100%", color: "#eff6ff", opacity: 0.02 },
    ],
    revenueStroke: [
      { offset: "0%", color: "#2563eb" },
      { offset: "50%", color: "#1d4ed8" },
      { offset: "100%", color: "#1e40af" },
    ],
    revenueActiveDot: { fill: "#2563eb", stroke: "#ffffff" },
    equityAreaStroke: "#2563eb",
    equityGradient: [
      { offset: "0%", color: "#3b82f6", opacity: 0.28 },
      { offset: "100%", color: "#3b82f6", opacity: 0 },
    ],
  };
}
