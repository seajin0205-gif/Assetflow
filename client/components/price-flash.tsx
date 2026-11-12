import { useEffect, useRef, useState, type ReactNode } from "react";
import { priceTickDirection, type PriceDirection } from "@/lib/market-feed";
import { cn } from "@/lib/utils";

type PriceFlashProps = {
  value: number;
  children: ReactNode;
  className?: string;
};

export function PriceFlash({ value, children, className }: PriceFlashProps) {
  const previous = useRef(value);
  const [flash, setFlash] = useState<PriceDirection>("flat");

  useEffect(() => {
    const direction = priceTickDirection(previous.current, value);
    previous.current = value;
    if (direction === "flat") return;
    setFlash(direction);
    const timer = window.setTimeout(() => setFlash("flat"), 450);
    return () => window.clearTimeout(timer);
  }, [value]);

  return (
    <span
      data-flash={flash}
      className={cn(
        "inline-block rounded-lg",
        flash === "up" && "price-flash-up",
        flash === "down" && "price-flash-down",
        className,
      )}
    >
      {children}
    </span>
  );
}
