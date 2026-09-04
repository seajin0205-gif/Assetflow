import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

type RiskScoreNumberSkeletonProps = {
  size?: "hero" | "card";
  className?: string;
};

/** Large numeric placeholder for risk score values. */
export function RiskScoreNumberSkeleton({
  size = "hero",
  className,
}: RiskScoreNumberSkeletonProps) {
  return (
    <Skeleton
      aria-hidden
      className={cn(
        "rounded-lg tabular-nums",
        size === "hero" && "h-16 w-20 lg:h-16 lg:w-24",
        size === "card" && "h-8 w-16 lg:h-8 lg:w-16",
        className,
      )}
    />
  );
}

type RiskScoreChartSkeletonProps = {
  variant?: "area" | "bars";
  className?: string;
};

/** Chart area placeholder for risk factor mini charts. */
export function RiskScoreChartSkeleton({
  variant = "area",
  className,
}: RiskScoreChartSkeletonProps) {
  return (
    <div
      aria-hidden
      className={cn(
        "relative h-24 w-full overflow-hidden rounded-lg bg-muted/25 lg:h-32",
        className,
      )}
    >
      {variant === "area" ? (
        <>
          <Skeleton className="absolute inset-x-0 bottom-0 h-[56%] rounded-none opacity-50" />
          <svg
            className="absolute inset-0 h-full w-full text-muted-foreground/35"
            preserveAspectRatio="none"
            viewBox="0 0 320 96"
          >
            <path
              d="M0 72 C40 68, 60 48, 96 52 S152 78, 192 58 S272 28, 320 44 L320 96 L0 96 Z"
              className="animate-pulse fill-current"
            />
            <path
              d="M0 72 C40 68, 60 48, 96 52 S152 78, 192 58 S272 28, 320 44"
              className="animate-pulse fill-none stroke-current stroke-2"
              strokeLinecap="round"
            />
          </svg>
        </>
      ) : (
        <div className="flex h-full items-end gap-2 px-4 pb-4 pt-4">
          {[42, 68, 55, 82, 48, 74, 61].map((height, index) => (
            <Skeleton
              key={index}
              className="flex-1 rounded-sm"
              style={{ height: `${height}%` }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

type RiskScoreCardSkeletonProps = {
  className?: string;
};

/** Full risk score summary card while data is loading. */
export function RiskScoreCardSkeleton({ className }: RiskScoreCardSkeletonProps) {
  return (
    <div
      className={cn(
        "glass-panel relative shrink-0 overflow-hidden px-6 py-6 lg:px-8 lg:py-8",
        className,
      )}
      aria-busy="true"
      aria-label="Loading risk score"
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-red-500/40 to-transparent"
        aria-hidden
      />

      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <h4 className="font-display text-2xl font-bold leading-8 lg:text-3xl lg:leading-10">
              Risk score
            </h4>
            <Skeleton className="h-4 w-56 rounded-md" />
          </div>

          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <div className="flex flex-col items-end gap-2">
              <Skeleton className="h-8 w-24 rounded-lg" />
              <Skeleton className="h-4 w-40 rounded-md" />
            </div>
            <RiskScoreNumberSkeleton size="hero" />
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_144px] lg:items-center lg:gap-6">
          <div className="space-y-2">
            <Skeleton className="h-2 w-full rounded-full" />
            <div className="flex justify-between">
              <Skeleton className="h-4 w-8 rounded-md" />
              <Skeleton className="h-4 w-16 rounded-md" />
              <Skeleton className="h-4 w-8 rounded-md" />
            </div>
          </div>
          <RiskScoreChartSkeleton variant="area" className="h-16" />
        </div>

        <div className="grid gap-2 border-t border-subtle pt-4 lg:grid-cols-[minmax(0,1fr)_144px] lg:items-center lg:gap-6">
          <div className="flex flex-wrap items-center gap-2">
            <Skeleton className="h-4 w-16 rounded-md" />
            <Skeleton className="h-8 w-32 rounded-lg" />
            <Skeleton className="h-8 w-32 rounded-lg" />
            <Skeleton className="h-8 w-24 rounded-lg" />
          </div>
          <div className="flex justify-end">
            <Skeleton className="h-4 w-32 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
}

type RiskFactorCardSkeletonProps = {
  variant?: "area" | "bars";
  className?: string;
};

/** Small factor card with metric + chart placeholders. */
export function RiskFactorCardSkeleton({
  variant = "area",
  className,
}: RiskFactorCardSkeletonProps) {
  return (
    <div
      className={cn("glass-panel-sm space-y-4 p-4 lg:p-6", className)}
      aria-busy="true"
      aria-label="Loading risk factor"
    >
      <div className="flex items-center justify-between gap-2">
        <Skeleton className="h-6 w-32 rounded-md lg:h-6 lg:w-32" />
        <RiskScoreNumberSkeleton size="card" />
      </div>
      {variant === "bars" ? (
        <div className="flex min-h-28 items-stretch gap-4 lg:min-h-32">
          <RiskScoreChartSkeleton variant={variant} className="min-h-0 flex-1" />
          <div className="flex shrink-0 flex-col justify-center gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between gap-4">
                <Skeleton className="h-4 w-10 rounded-md" />
                <Skeleton className="h-4 w-8 rounded-md" />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <RiskScoreChartSkeleton
          variant={variant}
          className="min-h-28 lg:min-h-32"
        />
      )}
    </div>
  );
}
