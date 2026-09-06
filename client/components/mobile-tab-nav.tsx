import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type MobileTabItem<T extends string> = {
  id: T;
  label: string;
  icon: LucideIcon;
};

type MobileTabNavProps<T extends string> = {
  items: MobileTabItem<T>[];
  activeId: T;
  onChange: (id: T) => void;
  ariaLabel: string;
  className?: string;
};

export function MobileTabNav<T extends string>({
  items,
  activeId,
  onChange,
  ariaLabel,
  className,
}: MobileTabNavProps<T>) {
  return (
    <nav className={cn("mobile-tab-nav", className)} aria-label={ariaLabel}>
      <div className="grid grid-cols-4 px-2 pt-2">
        {items.map(({ id, label, icon: Icon }) => {
          const isActive = activeId === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onChange(id)}
              className={cn(
                "flex flex-col items-center gap-1.5 py-2 text-xs font-medium leading-4 transition",
                isActive ? "text-foreground" : "text-muted-foreground",
              )}
            >
              <Icon className={cn("h-4 w-4", isActive && "text-primary")} />
              {label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
