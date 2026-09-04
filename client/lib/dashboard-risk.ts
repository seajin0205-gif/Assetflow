import { ROTA_BENCHMARK } from "@/data/dashboard";

export function getRiskScoreStatus(score: number) {
  if (score >= 67) return { label: "High risk", tone: "high" as const };
  if (score >= 34) return { label: "Moderate", tone: "medium" as const };
  return { label: "Low risk", tone: "low" as const };
}

export const riskScoreStatusStyles = {
  high: {
    badge: "border-red-500/30 bg-red-500/15 text-red-400",
    score: "text-red-500 dark:text-red-400",
    marker:
      "border-red-400 bg-red-500 dark:border-white dark:bg-red-400 dark:shadow-[0_0_0_3px_rgba(2,6,23,0.85),0_0_14px_rgba(248,113,113,0.75)]",
    sparkStroke: "#ef4444",
    sparkGradient: [
      { offset: "0%", color: "#ef4444", opacity: 0.45 },
      { offset: "100%", color: "#ef4444", opacity: 0 },
    ],
  },
  medium: {
    badge: "border-amber-500/30 bg-amber-500/15 text-amber-500",
    score: "text-amber-500 dark:text-amber-400",
    marker:
      "border-amber-400 bg-amber-500 dark:border-white dark:bg-amber-400 dark:shadow-[0_0_0_3px_rgba(2,6,23,0.85),0_0_14px_rgba(251,191,36,0.75)]",
    sparkStroke: "#f59e0b",
    sparkGradient: [
      { offset: "0%", color: "#f59e0b", opacity: 0.45 },
      { offset: "100%", color: "#f59e0b", opacity: 0 },
    ],
  },
  low: {
    badge: "border-emerald-500/30 bg-emerald-500/15 text-emerald-500",
    score: "text-emerald-500 dark:text-emerald-400",
    marker:
      "border-emerald-400 bg-emerald-500 dark:border-white dark:bg-emerald-400 dark:shadow-[0_0_0_3px_rgba(2,6,23,0.85),0_0_14px_rgba(52,211,153,0.75)]",
    sparkStroke: "#10b981",
    sparkGradient: [
      { offset: "0%", color: "#10b981", opacity: 0.45 },
      { offset: "100%", color: "#10b981", opacity: 0 },
    ],
  },
} as const;

export function rotaBarFill(rota: number) {
  return rota >= ROTA_BENCHMARK ? "#34d399" : "#38bdf8";
}

export async function fetchRiskScoreData(): Promise<void> {
  await new Promise((resolve) => window.setTimeout(resolve, 1200));
}
