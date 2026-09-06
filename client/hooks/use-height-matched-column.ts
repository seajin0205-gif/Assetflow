import { useEffect, useState, type RefObject } from "react";

export function useHeightMatchedColumn(
  ref: RefObject<HTMLElement | null>,
): number | null {
  const [height, setHeight] = useState<number | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const lgQuery = window.matchMedia("(min-width: 1024px)");

    const syncHeight = () => {
      if (!lgQuery.matches) {
        setHeight(null);
        return;
      }
      const raw = element.offsetHeight;
      setHeight(Math.round(raw / 8) * 8);
    };

    syncHeight();
    const observer = new ResizeObserver(syncHeight);
    observer.observe(element);
    lgQuery.addEventListener("change", syncHeight);
    window.addEventListener("resize", syncHeight);

    return () => {
      observer.disconnect();
      lgQuery.removeEventListener("change", syncHeight);
      window.removeEventListener("resize", syncHeight);
    };
  }, [ref]);

  return height;
}
