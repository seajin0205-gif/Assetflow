import { marketNewsItems } from "@/data/dashboard";

export function MarketBriefPanel() {
  return (
    <div className="glass-panel flex min-h-0 flex-1 flex-col p-4">
      <p className="section-label mb-2 shrink-0">Market brief</p>
      <div className="panel-scroll panel-inset min-h-0 flex-1 overflow-y-auto py-2 pl-2 pr-4">
        <div className="space-y-2">
          {marketNewsItems.map((item) => (
              <article
                key={item.headline}
                className="group flex flex-row flex-nowrap items-center gap-4 rounded-xl border border-transparent py-2 pl-0 pr-2 transition-colors hover:border-subtle hover:bg-muted/30"
              >
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg ring-1 ring-subtle">
                  <img
                    src={item.image}
                    alt={item.imageAlt}
                    loading="lazy"
                    className="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-100"
                  />
                  <div
                    className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"
                    aria-hidden
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex items-center gap-2 text-xs leading-4 text-muted-foreground">
                    <span className="font-semibold uppercase tracking-wide">
                      {item.source}
                    </span>
                    <span aria-hidden>·</span>
                    <span className="tabular-nums">{item.time}</span>
                  </div>
                  <h4 className="line-clamp-2 text-sm font-semibold leading-6 text-foreground transition-colors group-hover:text-primary">
                    {item.headline}
                  </h4>
                  <p className="mt-1 line-clamp-1 text-xs leading-4 text-muted-foreground">
                    {item.summary}
                  </p>
                </div>
              </article>
          ))}
        </div>
      </div>
    </div>
  );
}
