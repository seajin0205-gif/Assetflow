import { useState } from "react";
import { MOOD_OPTIONS } from "@/data/dashboard";
import { cn } from "@/lib/utils";

function MoodOption({
  emoji,
  label,
  selected,
  onSelect,
}: {
  emoji: string;
  label: string;
  selected: boolean;
  onSelect: (label: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(label)}
      aria-pressed={selected}
      aria-label={label}
      className={cn(
        "group flex min-h-16 min-w-0 w-full flex-col items-center justify-center gap-1 overflow-hidden rounded-lg border px-1 py-2 transition-all duration-200",
        selected
          ? "border-blue-400/40 bg-blue-500/10 ring-1 ring-inset ring-blue-400/25 dark:border-violet-500/45 dark:bg-violet-500/12 dark:ring-violet-400/20"
          : "border-subtle bg-subtle-muted hover:border-blue-200 hover:bg-blue-50/70 dark:hover:border-white/[0.12] dark:hover:bg-white/[0.05]",
      )}
    >
      <span
        className={cn(
          "shrink-0 text-base leading-none transition-transform duration-200",
          selected ? "scale-100" : "group-hover:scale-100",
        )}
        aria-hidden
      >
        {emoji}
      </span>
      <span
        className={cn(
          "block w-full min-w-0 whitespace-nowrap px-0.5 text-center text-[9px] font-semibold leading-3 tracking-tight sm:text-[10px] sm:leading-4",
          selected
            ? "text-blue-700 dark:text-violet-200"
            : "text-muted-foreground",
        )}
      >
        {label}
      </span>
    </button>
  );
}

export function MoodTracker() {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);

  return (
    <div className="glass-panel relative shrink-0 overflow-hidden border-blue-500/15 p-4 dark:border-blue-500/10">
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl mood-panel-glow"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset mood-panel-ring"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute left-0 top-6 bottom-6 w-px mood-panel-accent"
        aria-hidden
      />

      <div className="relative flex flex-col gap-4">
        <div>
          <p className="section-label mb-2">Sentiment</p>
          <h3 className="font-display text-base font-bold leading-6">
            How are you feeling today?
          </h3>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-medium leading-4 text-muted-foreground">
            <span>Stressed</span>
            <span>Balanced</span>
            <span>Confident</span>
          </div>
          <div
            className="sentiment-track h-2 overflow-hidden rounded-full"
            aria-hidden
          >
            <div className="h-full w-full bg-gradient-to-r from-blue-300/80 via-blue-500/70 to-blue-700/80 opacity-90 dark:from-rose-500/70 dark:via-amber-400/50 dark:to-emerald-400/70 dark:opacity-80" />
          </div>
        </div>

        <div className="w-full">
          <div className="grid grid-cols-5 gap-1">
            {MOOD_OPTIONS.map((mood) => (
              <MoodOption
                key={mood.label}
                label={mood.label}
                emoji={mood.emoji}
                selected={selectedMood === mood.label}
                onSelect={setSelectedMood}
              />
            ))}
          </div>
        </div>

        <p className="text-xs leading-4 text-muted-foreground">
          <span className="font-semibold text-blue-700 dark:text-violet-300/90">
            Blue markers
          </span>{" "}
          on your risk chart.
          {selectedMood ? (
            <>
              {" "}
              ·{" "}
              <span className="font-medium text-blue-700 dark:text-violet-300">
                {selectedMood}
              </span>
            </>
          ) : null}
        </p>

        <button type="button" className="btn-primary self-center px-4 py-2 text-xs">
          Save mood
        </button>
      </div>
    </div>
  );
}
