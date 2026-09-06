import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

type HeightMatchedColumnProps = {
  height: number | null;
  className?: string;
  children: ReactNode;
};

export function HeightMatchedColumn({
  height,
  className,
  children,
}: HeightMatchedColumnProps) {
  const style: CSSProperties | undefined =
    height != null ? { height } : undefined;

  return (
    <div
      className={cn(
        "flex min-h-0 min-w-0 flex-col gap-6 max-lg:!h-auto",
        height != null && "overflow-hidden",
        className,
      )}
      style={style}
    >
      {children}
    </div>
  );
}
