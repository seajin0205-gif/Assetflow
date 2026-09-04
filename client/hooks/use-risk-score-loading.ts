import { useEffect, useState } from "react";
import { fetchRiskScoreData } from "@/lib/dashboard-risk";

export function useRiskScoreLoading() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    fetchRiskScoreData().then(() => {
      if (!cancelled) setIsLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return isLoading;
}
