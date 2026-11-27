import { useEffect, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { ScaledFrame } from "@/components/portfolio/scaled-frame";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

const PROBLEMS = [
  {
    title: "Holdings in too many places",
    body: "Coins, stocks, and cash each live in a different app. There is no single view of the portfolio.",
    note: "6 accounts · 3 channels",
    icon: "scatter",
  },
  {
    title: "Charts that take too long",
    body: "Drawdown, beta, and moving averages show up as numbers a person cannot read on the first pass.",
    note: "12+ minutes to interpret",
    icon: "chart",
  },
  {
    title: "Risk that arrives late",
    body: "A heavy coin weight or a missing hedge never raises a flag before the move is already over.",
    note: "No live warning",
    icon: "shield",
  },
] as const;

const STORIES = [
  {
    index: "01",
    title: "The year, then the day",
    body: "The first number is the year-to-date return. A period changes the chart. A point on the line is there only when you ask for it.",
  },
  {
    index: "02",
    title: "The order answers back",
    body: "Buy is red and sell is blue. Size, holdings, and price are checked in that order, then a toast names the ticker, the shares, and the amount.",
  },
  {
    index: "03",
    title: "The mood stays on the chart",
    body: "Five moods. The one you tap glows, and a marker lands on the risk chart so the feeling is still there later.",
  },
] as const;

export default function Portfolio() {
  const { resolvedTheme } = useTheme();
  const frameKey = resolvedTheme ?? "dark";

  useEffect(() => {
    const previousTitle = document.title;
    const previousLang = document.documentElement.lang;
    document.title = "Assetflow — Portfolio";
    document.documentElement.lang = "en";
    return () => {
      document.title = previousTitle;
      document.documentElement.lang = previousLang;
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#eef3fb] text-slate-900">
      <div
        className="pointer-events-none fixed inset-0 -z-10"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(96,165,250,0.45), transparent 60%), radial-gradient(ellipse 40% 40% at 100% 20%, rgba(191,219,254,0.7), transparent 50%), radial-gradient(ellipse 40% 30% at 0% 80%, rgba(224,231,255,0.8), transparent 50%)",
        }}
      />

      <header className="sticky top-0 z-50 border-b border-white/60 bg-white/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-dashboard items-center justify-between gap-4 px-6 lg:px-8">
          <a href="#top" className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-blue-600 text-sm font-bold text-white">
              A
            </span>
            <span className="font-display text-lg font-bold leading-6 tracking-tight">
              Assetflow
            </span>
          </a>
          <nav
            className="hidden items-center gap-2 md:flex"
            aria-label="Portfolio"
          >
            <a
              href="#product"
              className="btn-ghost h-8 bg-white/70 px-4 text-xs"
            >
              Product
            </a>
            <a
              href="#interactions"
              className="btn-ghost h-8 bg-white/70 px-4 text-xs"
            >
              Interactions
            </a>
            <a
              href="/retrospective.html"
              className="btn-ghost h-8 bg-white/70 px-4 text-xs"
            >
              Retrospective
            </a>
            <Link to="/" className="btn-primary h-8 px-4 text-xs">
              Live app
            </Link>
          </nav>
          <Link to="/" className="btn-primary h-8 px-4 text-xs md:hidden">
            Live app
          </Link>
        </div>
      </header>

      <main id="top">
        <section className="mx-auto max-w-dashboard px-6 pb-16 pt-24 text-center lg:px-8 lg:pt-32">
          <div className="mb-8 flex flex-wrap items-center justify-center gap-2">
            {["Case study", "Fintech · UX", "2026"].map((pill) => (
              <span
                key={pill}
                className="rounded-full border border-white/80 bg-white/70 px-4 py-2 text-xs font-semibold leading-4 text-blue-700 shadow-sm"
              >
                {pill}
              </span>
            ))}
          </div>
          <p className="mx-auto max-w-2xl text-sm leading-6 text-slate-500">
            Coins, stocks, and cash sit in different apps. Without one view, the
            risk of the whole portfolio stays hidden in the numbers.
          </p>
          <h1 className="mx-auto mt-8 max-w-3xl font-display text-4xl font-extrabold leading-none tracking-tight text-slate-950 lg:text-6xl">
            Past the numbers,
            <span className="mt-2 block bg-gradient-to-r from-blue-700 to-blue-500 bg-clip-text text-transparent">
              how safe is the portfolio?
            </span>
          </h1>

          <div className="mt-16 grid gap-8 text-left md:grid-cols-3">
            {PROBLEMS.map((problem) => (
              <article
                key={problem.title}
                className="rounded-3xl border border-white bg-white/90 p-8 shadow-[0_24px_48px_-24px_rgba(37,99,235,0.35)]"
              >
                <ProblemIcon name={problem.icon} />
                <h2 className="mt-8 font-display text-xl font-bold leading-8">
                  {problem.title}
                </h2>
                <p className="mt-4 text-sm leading-6 text-slate-500">
                  {problem.body}
                </p>
                <p className="mt-8 text-xs font-semibold leading-4 text-blue-600">
                  {problem.note}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto flex max-w-dashboard flex-col items-start justify-between gap-8 px-6 pb-16 lg:flex-row lg:items-center lg:px-8">
          <div className="max-w-xl">
            <p className="text-xs font-semibold uppercase leading-4 tracking-widest text-blue-600">
              Solution
            </p>
            <p className="mt-4 font-display text-2xl font-bold leading-8 tracking-tight">
              A score in three seconds, then a dashboard built around the
              decision.
            </p>
          </div>
          <div className="flex flex-wrap gap-4">
            <div className="rounded-2xl bg-white px-8 py-6 shadow-sm">
              <p className="text-xs font-semibold leading-4 text-blue-600">
                Goal 01
              </p>
              <p className="mt-2 font-display text-lg font-bold leading-6">
                Risk score, 0–100
              </p>
              <p className="mt-2 text-xs leading-4 text-slate-500">
                One read, before the charts
              </p>
            </div>
            <div className="rounded-2xl bg-white px-8 py-6 shadow-sm">
              <p className="text-xs font-semibold leading-4 text-blue-600">
                Goal 02
              </p>
              <p className="mt-2 font-display text-lg font-bold leading-6">
                A dashboard that fits
              </p>
              <p className="mt-2 text-xs leading-4 text-slate-500">
                Holdings, risk, and the order
              </p>
            </div>
          </div>
        </section>

        <section id="product" className="scroll-mt-24 px-6 pb-16 lg:px-8">
          <div className="mx-auto max-w-dashboard overflow-hidden rounded-[32px] bg-gradient-to-b from-white via-[#e7eefc] to-[#c7d7f5] px-6 py-16 shadow-[0_32px_80px_-32px_rgba(30,64,175,0.45)] lg:px-16 lg:py-24">
            <div className="text-center">
              <h2 className="bg-gradient-to-b from-blue-500 to-blue-800 bg-clip-text font-display text-6xl font-extrabold leading-none tracking-tight text-transparent">
                Assetflow
              </h2>
              <p className="mt-4 text-xs font-semibold uppercase leading-4 tracking-widest text-slate-500">
                Personal asset management
              </p>
            </div>
            <img
              src="/imac-front.png"
              alt="Front view of an iMac showing the Assetflow dashboard"
              className="mx-auto mt-8 w-full max-w-6xl"
            />
            <div className="mt-8 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
              <p className="max-w-md text-sm leading-6 text-slate-600">
                Scattered holdings on one screen. Risk, drawn so it can be read.
                A personal dashboard for the next order.
              </p>
              <dl className="grid grid-cols-2 gap-x-8 gap-y-4 text-left text-xs leading-4 text-slate-600 sm:grid-cols-4">
                <div>
                  <dt className="font-semibold text-slate-900">Role</dt>
                  <dd className="mt-2">UI and design systems</dd>
                </div>
                <div>
                  <dt className="font-semibold text-slate-900">Duration</dt>
                  <dd className="mt-2">Feb–Mar 2026</dd>
                </div>
                <div>
                  <dt className="font-semibold text-slate-900">Tools</dt>
                  <dd className="mt-2">Figma, React, Recharts</dd>
                </div>
                <div>
                  <dt className="font-semibold text-slate-900">Shipped</dt>
                  <dd className="mt-2">Web and mobile</dd>
                </div>
              </dl>
            </div>
          </div>
        </section>

        <section
          id="interactions"
          className="scroll-mt-24 mx-auto max-w-dashboard px-6 pb-16 lg:px-8"
        >
          <h2 className="max-w-xl font-display text-3xl font-bold leading-10 tracking-tight">
            Three moments, from the chart to the order
          </h2>
          <div className="mt-8 grid gap-8 lg:grid-cols-3">
            {STORIES.map((story) => (
              <article
                key={story.index}
                className="flex flex-col justify-between rounded-3xl bg-white p-8 shadow-[0_16px_40px_-24px_rgba(15,23,42,0.35)]"
              >
                <div>
                  <p className="font-display text-4xl font-extrabold leading-none text-blue-100">
                    {story.index}
                  </p>
                  <h3 className="mt-8 font-display text-xl font-bold leading-8">
                    {story.title}
                  </h3>
                  <p className="mt-4 text-sm leading-6 text-slate-500">
                    {story.body}
                  </p>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-8 overflow-hidden rounded-[32px] bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 px-6 py-16 lg:px-16">
            <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
              <div className="text-white">
                <p className="text-xs font-semibold uppercase leading-4 tracking-widest text-blue-100">
                  On the phone
                </p>
                <h3 className="mt-4 font-display text-3xl font-bold leading-10">
                  Home, risk, and the ticket
                </h3>
                <p className="mt-4 max-w-md text-sm leading-6 text-blue-100">
                  The same dashboard, then the order. Buy stays red. Sell stays
                  blue.
                </p>
                <Link
                  to="/trade"
                  className="mt-8 inline-flex h-12 items-center rounded-full bg-white px-8 text-sm font-semibold text-blue-700"
                >
                  Place an order
                </Link>
              </div>
              <div className="grid gap-8 sm:grid-cols-2">
                <Phone
                  title="Mobile dashboard"
                  caption="Home, risk, stocks, feed"
                >
                  <ScaledFrame
                    key={`mobile-${frameKey}`}
                    src="/?embed=1"
                    title="Mobile dashboard"
                    width={390}
                    height={844}
                  />
                </Phone>
                <Phone title="Order ticket" caption="Buy red · Sell blue">
                  <ScaledFrame
                    key={`trade-${frameKey}`}
                    src="/trade?embed=1"
                    title="Order ticket"
                    width={390}
                    height={844}
                  />
                </Phone>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-dashboard px-6 pb-24 lg:px-8">
          <div className="flex flex-col items-start justify-between gap-8 rounded-[32px] bg-slate-950 px-8 py-16 text-white lg:flex-row lg:items-center lg:px-16">
            <div className="max-w-xl">
              <h2 className="font-display text-3xl font-bold leading-10 tracking-tight">
                From the score to the order, in one flow.
              </h2>
              <p className="mt-4 text-sm leading-6 text-slate-300">
                Net worth $1,262,480. Risk 78 of 100. Twelve live behaviors on
                the dashboard.
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <Link to="/" className="btn-primary h-12 px-8">
                Open dashboard
              </Link>
              <a
                href="/retrospective.html"
                className="inline-flex h-12 items-center rounded-lg border border-white/20 px-8 text-sm font-semibold"
              >
                Retrospective
              </a>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function ProblemIcon({ name }: { name: "scatter" | "chart" | "shield" }) {
  return (
    <div className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-100">
      {name === "scatter" && (
        <svg width="32" height="32" viewBox="0 0 32 32" aria-hidden>
          <circle cx="10" cy="16" r="6" fill="#2563eb" />
          <circle cx="20" cy="12" r="5" fill="#f59e0b" />
          <rect x="18" y="18" width="10" height="8" rx="2" fill="#93c5fd" />
        </svg>
      )}
      {name === "chart" && (
        <svg width="32" height="32" viewBox="0 0 32 32" aria-hidden>
          <path
            d="M6 22 L12 14 L18 18 L26 8"
            fill="none"
            stroke="#2563eb"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M6 24h20"
            stroke="#bfdbfe"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      )}
      {name === "shield" && (
        <svg width="32" height="32" viewBox="0 0 32 32" aria-hidden>
          <path
            d="M16 4 L26 8 V16 C26 22 21 26 16 28 C11 26 6 22 6 16 V8 Z"
            fill="#dbeafe"
            stroke="#2563eb"
            strokeWidth="1.5"
          />
          <path
            d="M12 16 l3 3 6-7"
            fill="none"
            stroke="#2563eb"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </div>
  );
}

function Phone({
  title,
  caption,
  children,
}: {
  title: string;
  caption: string;
  children: ReactNode;
}) {
  return (
    <figure className="mx-auto w-full max-w-[280px]">
      <div
        className={cn(
          "overflow-hidden rounded-[32px] border-8 border-slate-900 bg-slate-900 shadow-2xl",
        )}
      >
        {children}
      </div>
      <figcaption className="mt-4 text-center text-white">
        <p className="font-display text-sm font-bold leading-6">{title}</p>
        <p className="text-xs leading-4 text-blue-100">{caption}</p>
      </figcaption>
    </figure>
  );
}
