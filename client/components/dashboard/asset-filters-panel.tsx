import { ASSET_FILTER_OPTIONS } from "@/data/dashboard";
import { cn } from "@/lib/utils";

type AssetFiltersPanelProps = {
  variant?: "list" | "chips";
  inputName?: string;
};

export function AssetFiltersPanel({
  variant = "list",
  inputName = "asset",
}: AssetFiltersPanelProps) {
  return (
    <>
      <div className="flex items-center justify-between">
        <h3
          className={cn(
            "font-display font-bold",
            variant === "chips" ? "text-base" : "text-lg leading-6",
          )}
        >
          {variant === "chips" ? "Quick filters" : "Quick Filters"}
        </h3>
        <button
          type="button"
          className={cn(
            "text-xs font-medium text-primary",
            variant === "list" &&
              "leading-4 hover:text-blue-700 dark:hover:text-cyan-300",
          )}
        >
          Reset
        </button>
      </div>

      {variant === "list" ? (
        <>
          <div className="space-y-4">
            {ASSET_FILTER_OPTIONS.map((label, i) => (
              <label
                key={label}
                className="hover-surface-row flex cursor-pointer items-center gap-4 rounded-lg border border-transparent px-2 py-2"
              >
                <input
                  type="radio"
                  name={inputName}
                  defaultChecked={i === 0}
                  className="h-4 w-4"
                />
                <span className="text-sm leading-6 text-foreground/90">{label}</span>
              </label>
            ))}
          </div>
          <div className="space-y-2 border-t border-subtle pt-4">
            <div className="flex items-center justify-between text-xs leading-4 text-muted-foreground">
              <span>Risk sensitivity</span>
              <span className="font-medium text-foreground">30%</span>
            </div>
            <input
              type="range"
              className="w-full"
              min="0"
              max="100"
              defaultValue="30"
            />
          </div>
        </>
      ) : (
        <div className="flex flex-wrap justify-center gap-2">
          {ASSET_FILTER_OPTIONS.map((label, i) => (
            <label
              key={label}
              className={cn(
                "cursor-pointer rounded-full border px-3 py-1.5 text-xs font-medium transition",
                i === 0
                  ? "border-primary/40 bg-primary/10 text-primary"
                  : "border-subtle bg-subtle text-muted-foreground",
              )}
            >
              <input
                type="radio"
                name={inputName}
                defaultChecked={i === 0}
                className="sr-only"
              />
              {label}
            </label>
          ))}
        </div>
      )}
    </>
  );
}
