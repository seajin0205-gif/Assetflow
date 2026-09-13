import { useEffect, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { ScaledFrame } from "@/components/portfolio/scaled-frame";
import { ThemeToggle } from "@/components/theme-toggle";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

const METRICS = [
  { label: "Net worth", value: "$1,262,480" },
  { label: "Risk score", value: "78 / 100" },
  { label: "Live specs", value: "12" },
  { label: "Trade UX", value: "매수 빨강 · 매도 파랑" },
] as const;

const DEVICES = [
  {
    id: "mobile-dash",
    label: "Mobile dashboard",
    caption: "390 × 844 · Home / Risk / Stocks / Feed",
    src: "/?embed=1",
    width: 390,
    height: 844,
  },
  {
    id: "trade",
    label: "Trade last screen",
    caption: "주문 · 한국형 매수/매도 · Sonner",
    src: "/trade?embed=1",
    width: 390,
    height: 844,
  },
] as const;

export default function Portfolio() {
  const { resolvedTheme } = useTheme();
  const frameKey = resolvedTheme ?? "dark";

  useEffect(() => {
    document.title = "Assetflow — Final Output";
    return () => {
      document.title = "Assetflow — Portfolio Intelligence";
    };
  }, []);

  return (
    <div className="dashboard-shell min-h-screen text-foreground">
      <header className="sticky top-0 z-50 border-b border-subtle bg-white/80 backdrop-blur-xl dark:bg-background/80">
        <div className="mx-auto flex max-w-dashboard items-center justify-between gap-4 px-6 py-4 lg:px-8">
          <Link to="/portfolio" className="min-w-0">
            <p className="text-xs font-semibold uppercase leading-4 tracking-widest text-muted-foreground">
              Portfolio
            </p>
            <p className="font-display text-lg font-bold leading-6 tracking-tight">
              Assetflow · Final Output
            </p>
          </Link>

          <nav className="hidden items-center gap-2 md:flex" aria-label="Portfolio">
            <a href="/portfolio.html" className="btn-ghost h-8 px-4 text-xs">
              Case study
            </a>
            <a href="/retrospective.html" className="btn-ghost h-8 px-4 text-xs">
              Retrospective
            </a>
            <Link to="/" className="btn-ghost h-8 px-4 text-xs">
              Live dashboard
            </Link>
            <Link to="/trade" className="btn-primary h-8 px-4 text-xs">
              Trade
            </Link>
          </nav>

          <ThemeToggle />
        </div>
        <div className="flex gap-2 overflow-x-auto border-t border-subtle px-6 py-2 md:hidden">
          <a href="/portfolio.html" className="btn-ghost h-8 shrink-0 px-4 text-xs">
            Case study
          </a>
          <Link to="/" className="btn-ghost h-8 shrink-0 px-4 text-xs">
            Dashboard
          </Link>
          <Link to="/trade" className="btn-primary h-8 shrink-0 px-4 text-xs">
            Trade
          </Link>
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-dashboard px-6 pb-8 pt-16 lg:px-8 lg:pt-24">
          <p className="mb-4 font-mono text-xs font-medium uppercase leading-4 tracking-widest text-primary">
            06 · Final output
          </p>
          <h1 className="max-w-4xl font-display text-4xl font-extrabold leading-none tracking-tight lg:text-6xl">
            Assetflow
            <span className="mt-2 block text-2xl font-semibold leading-8 text-muted-foreground lg:text-3xl lg:leading-10">
              리스크를 읽고, 바로 주문하는 자산 대시보드
            </span>
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-6 text-muted-foreground">
            순자산·리스크 스코어·보유 종목을 한 화면에서 읽고, 모바일에서
            한국형 매수/매도로 실행하는 마지막 산출물입니다.
          </p>
          <div className="mt-8 flex flex-wrap gap-2">
            {["Desktop 1600", "Mobile 390", "Trade", "React", "Recharts"].map(
              (chip) => (
                <span
                  key={chip}
                  className="rounded-full border border-subtle bg-card px-4 py-2 text-xs font-medium leading-4 text-muted-foreground"
                >
                  {chip}
                </span>
              ),
            )}
          </div>
        </section>

        <section className="mx-auto max-w-dashboard px-6 pb-16 lg:px-8">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="section-label mb-2">Desktop dashboard</p>
              <h2 className="font-display text-2xl font-bold leading-8 tracking-tight">
                Final product screen
              </h2>
            </div>
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm font-semibold text-primary"
            >
              Open live
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>

          <BrowserChrome url="assetflow.app /">
            <ScaledFrame
              key={`desktop-${frameKey}`}
              src="/?embed=1"
              title="Assetflow desktop dashboard"
              width={1440}
              height={980}
            />
          </BrowserChrome>
        </section>

        <section className="mx-auto max-w-dashboard px-6 pb-16 lg:px-8">
          <p className="section-label mb-2">Last output · devices</p>
          <h2 className="mb-8 font-display text-2xl font-bold leading-8 tracking-tight">
            모바일 대시보드와 거래 화면
          </h2>

          <div className="grid gap-8 lg:grid-cols-2">
            {DEVICES.map((device) => (
              <figure key={device.id} className="mx-auto w-full max-w-[432px]">
                <PhoneChrome>
                  <ScaledFrame
                    key={`${device.id}-${frameKey}`}
                    src={device.src}
                    title={device.label}
                    width={device.width}
                    height={device.height}
                  />
                </PhoneChrome>
                <figcaption className="mt-4 space-y-2 text-center">
                  <p className="font-display text-base font-bold leading-6">
                    {device.label}
                  </p>
                  <p className="text-xs leading-4 text-muted-foreground">
                    {device.caption}
                  </p>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-dashboard px-6 pb-16 lg:px-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {METRICS.map((metric) => (
              <div key={metric.label} className="glass-panel-sm space-y-2 px-6 py-6">
                <p className="section-label">{metric.label}</p>
                <p className="font-display text-xl font-bold leading-8 tabular-nums">
                  {metric.value}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-t border-subtle">
          <div className="mx-auto flex max-w-dashboard flex-col gap-8 px-6 py-16 lg:flex-row lg:items-end lg:justify-between lg:px-8">
            <div className="max-w-xl space-y-4">
              <p className="section-label">Close</p>
              <h2 className="font-display text-3xl font-bold leading-10 tracking-tight">
                대시보드에서 주문까지, 한 흐름으로.
              </h2>
              <p className="text-sm leading-6 text-muted-foreground">
                Interaction spec 19 · Live demo 12 · Case study와 회고는 정적
                문서로 남겨 두었습니다.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link to="/" className="btn-primary">
                대시보드 열기
              </Link>
              <a href="/portfolio.html" className="btn-ghost">
                Case study
              </a>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function BrowserChrome({
  url,
  children,
}: {
  url: string;
  children: ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-subtle bg-card shadow-card">
      <div className="flex items-center gap-4 border-b border-subtle px-4 py-2">
        <div className="flex gap-2" aria-hidden>
          <span className="h-2 w-2 rounded-full bg-red-400" />
          <span className="h-2 w-2 rounded-full bg-amber-400" />
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
        </div>
        <div className="min-w-0 flex-1 rounded-lg bg-muted/70 px-4 py-2 text-center font-mono text-xs leading-4 text-muted-foreground">
          {url}
        </div>
      </div>
      {children}
    </div>
  );
}

function PhoneChrome({ children }: { children: ReactNode }) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-[32px] border-8 border-zinc-800 bg-zinc-900 shadow-card",
        "dark:border-zinc-700",
      )}
    >
      <div className="flex justify-center bg-zinc-800 py-2 dark:bg-zinc-700">
        <span className="h-2 w-16 rounded-full bg-zinc-600" aria-hidden />
      </div>
      {children}
    </div>
  );
}
