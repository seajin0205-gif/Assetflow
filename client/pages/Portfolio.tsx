import { useEffect, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { BackendCaseStudy } from "@/components/portfolio/backend-case-study";
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

const CASES = [
  {
    index: "01",
    kicker: "Dashboard chart",
    title: "Show the year first.",
    emphasis: "The rest of the chart can wait.",
    problem:
      "Return, period, and every point arrive at once. The first screen has no headline.",
    decision: "Open on one number. Change the period, and the line follows.",
    outcome:
      "Year-to-date is the summary. The exact day appears only when you scrub to it.",
    steps: [
      {
        title: "Start with the year",
        body: "Year-to-date is the only number on arrival. A period narrows the comparison.",
      },
      {
        title: "The line follows",
        body: "A new period redraws the return and the shape together.",
      },
      {
        title: "Touch a day",
        body: "Scrub a point and that day’s value and return appear at once.",
      },
    ],
    visual: "chart",
  },
  {
    index: "02",
    kicker: "Trade order",
    title: "An order should answer.",
    emphasis: "Check it, then say what happened.",
    problem:
      "After the tap, it is unclear whether the order went through. A bad input does not say what to fix.",
    decision:
      "Check before submit. Failure and success each get their own toast, right away.",
    outcome:
      "An error names the cause. A success shows the ticker, the size, and the amount.",
    steps: [
      {
        title: "Side and size",
        body: "Pick buy or sell, then the quantity. An empty field keeps the button quiet.",
      },
      {
        title: "Three checks",
        body: "Quantity, holdings, then limit price. A miss names the cause.",
      },
      {
        title: "It landed",
        body: "Success puts the ticker, the size, and the amount in one toast.",
      },
    ],
    visual: "order",
  },
  {
    index: "03",
    kicker: "Mood tracker",
    title: "A mood should stay",
    emphasis: "on the risk chart.",
    problem:
      "There is no place to record how the market felt. Later, the risk chart has no context.",
    decision:
      "Five moods answer the moment you tap, and the chart marker stays in step.",
    outcome:
      "One tap records the feeling. The chart can be read back to that moment.",
    steps: [
      {
        title: "Five moods",
        body: "A tap lights the emoji with a ring, a glow, and a slight scale.",
      },
      {
        title: "The label follows",
        body: "The feeling and the risk note appear under the row at the same moment.",
      },
      {
        title: "A marker on the chart",
        body: "The mood becomes a point on the risk chart, so the context stays.",
      },
    ],
    visual: "mood",
  },
] as const;

const PHONE_GRID = [
  { key: "stocks-a", src: "/portfolio-phones/stocks.jpg", alt: "My stocks", top: "4%", left: "-6%", rotate: -14, width: 168 },
  { key: "book-a", src: "/portfolio-phones/book.jpg", alt: "Order book", top: "-8%", left: "14%", rotate: 8, width: 160 },
  { key: "chart-a", src: "/portfolio-phones/chart.jpg", alt: "Price chart", top: "-10%", left: "34%", rotate: -8, width: 168 },
  { key: "buy-a", src: "/portfolio-phones/order-buy.jpg", alt: "Buy order", top: "-6%", left: "56%", rotate: 10, width: 168 },
  { key: "stocks-b", src: "/portfolio-phones/stocks.jpg", alt: "", top: "2%", left: "78%", rotate: -12, width: 152 },
  { key: "home", src: "/portfolio-phones/home.jpg", alt: "Risk score on the phone", top: "28%", left: "6%", rotate: 7, width: 184 },
  { key: "feed", src: "/portfolio-phones/feed.jpg", alt: "Mood and alerts", top: "30%", left: "32%", rotate: -5, width: 192 },
  { key: "risk", src: "/portfolio-phones/risk.jpg", alt: "Risk factor analysis", top: "24%", left: "58%", rotate: 8, width: 184 },
  { key: "sell-a", src: "/portfolio-phones/order-sell.jpg", alt: "Sell order", top: "32%", left: "84%", rotate: 14, width: 160 },
  { key: "buy-b", src: "/portfolio-phones/order-buy.jpg", alt: "", top: "64%", left: "-4%", rotate: -10, width: 168 },
  { key: "chart-b", src: "/portfolio-phones/chart.jpg", alt: "", top: "66%", left: "22%", rotate: 6, width: 160 },
  { key: "book-b", src: "/portfolio-phones/book.jpg", alt: "", top: "68%", left: "46%", rotate: -8, width: 168 },
  { key: "sell-b", src: "/portfolio-phones/order-sell.jpg", alt: "", top: "62%", left: "72%", rotate: 12, width: 176 },
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
              href="#screens"
              className="btn-ghost h-8 bg-white/70 px-4 text-xs"
            >
              Screens
            </a>
            <a
              href="#backend"
              className="btn-ghost h-8 bg-white/70 px-4 text-xs"
            >
              Backend
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
              <h2 className="inline-block bg-gradient-to-b from-blue-900 via-blue-600 to-blue-400 bg-clip-text font-display text-6xl font-extrabold leading-none tracking-tight text-transparent lg:text-[96px] lg:leading-[96px]">
                Assetflow
              </h2>
              <p className="mt-4 text-xs font-semibold uppercase leading-4 tracking-widest text-slate-500">
                Personal asset management
              </p>
            </div>
            <img
              src="/imac-front.png"
              alt="Front view of an iMac showing the Assetflow dashboard"
              className="mx-auto mt-8 w-full"
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
          <p className="mt-4 max-w-xl text-sm leading-6 text-slate-500">
            A problem, a decision, then something a person can use. Chart,
            order, and mood, in that order.
          </p>
          <div className="mt-8 flex flex-col gap-8">
            {CASES.map((item) => (
              <article
                key={item.index}
                className="rounded-[32px] bg-white p-8 shadow-[0_16px_40px_-24px_rgba(15,23,42,0.35)] lg:p-16"
              >
                <div
                  className={cn(
                    "grid items-center gap-8 lg:grid-cols-2",
                    item.index === "02" && "lg:[&>*:first-child]:order-2",
                  )}
                >
                  <div>
                    <p className="text-xs font-semibold uppercase leading-4 tracking-widest text-blue-600">
                      Case {item.index} · {item.kicker}
                    </p>
                    <h3 className="mt-4 font-display text-3xl font-bold leading-10 tracking-tight">
                      {item.title}{" "}
                      <span className="text-blue-600">{item.emphasis}</span>
                    </h3>
                    <dl className="mt-8 grid gap-8 sm:grid-cols-3">
                      <div>
                        <dt className="text-xs font-semibold uppercase leading-4 tracking-widest text-slate-400">
                          Problem
                        </dt>
                        <dd className="mt-2 text-sm leading-6 text-slate-600">
                          {item.problem}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs font-semibold uppercase leading-4 tracking-widest text-slate-400">
                          Decision
                        </dt>
                        <dd className="mt-2 text-sm leading-6 text-slate-600">
                          {item.decision}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs font-semibold uppercase leading-4 tracking-widest text-slate-400">
                          Outcome
                        </dt>
                        <dd className="mt-2 text-sm leading-6 text-slate-600">
                          {item.outcome}
                        </dd>
                      </div>
                    </dl>
                    <ol className="mt-8 grid gap-4">
                      {item.steps.map((step, stepIndex) => (
                        <li key={step.title} className="flex gap-4">
                          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-blue-50 font-display text-xs font-bold text-blue-700">
                            0{stepIndex + 1}
                          </span>
                          <p className="text-sm leading-6 text-slate-600">
                            <span className="font-semibold text-slate-900">
                              {step.title}.
                            </span>{" "}
                            {step.body}
                          </p>
                        </li>
                      ))}
                    </ol>
                  </div>
                  <CaseScreen kind={item.visual} />
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

        <section id="screens" className="scroll-mt-24 mx-auto max-w-dashboard px-6 pb-16 lg:px-8">
          <h2 className="max-w-xl font-display text-3xl font-bold leading-10 tracking-tight">
            The same product, across the phone
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-6 text-slate-500">
            Risk, stocks, the chart, and the order. Buy stays red. Sell stays
            blue.
          </p>
          <div className="relative mt-8 h-[640px] overflow-hidden rounded-[32px] bg-[#070b16] shadow-[0_32px_80px_-32px_rgba(7,11,22,0.8)] lg:h-[760px]">
            <div
              className="pointer-events-none absolute inset-0"
              aria-hidden
              style={{
                background:
                  "radial-gradient(ellipse 50% 40% at 50% 40%, rgba(37,99,235,0.18), transparent 70%)",
              }}
            />
            {PHONE_GRID.map((phone) => (
              <TiltedPhone key={phone.key} {...phone} />
            ))}
          </div>
        </section>

        <BackendCaseStudy />

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

function CaseScreen({ kind }: { kind: "chart" | "order" | "mood" }) {
  return (
    <div className="grid min-h-[320px] place-items-center rounded-[32px] bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 p-8">
      {kind === "chart" && <ChartScreen />}
      {kind === "order" && <OrderScreen />}
      {kind === "mood" && <MoodScreen />}
    </div>
  );
}

function ChartScreen() {
  return (
    <div className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-2xl">
      <p className="text-xs font-semibold uppercase leading-4 tracking-widest text-slate-400">
        Portfolio performance
      </p>
      <p className="mt-2 font-display text-3xl font-bold leading-10 text-slate-950">
        +11.9%
      </p>
      <p className="text-xs leading-4 text-slate-500">Year to date</p>
      <svg viewBox="0 0 280 96" className="mt-8 h-24 w-full" aria-hidden>
        <path
          d="M0 78 C40 70 70 64 110 48 C150 32 190 36 230 22 L280 12"
          fill="none"
          stroke="#2563eb"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <circle cx="176" cy="34" r="6" fill="#2563eb" stroke="#fff" strokeWidth="2" />
      </svg>
      <div className="mt-4 rounded-2xl bg-slate-950 px-4 py-3 text-white">
        <p className="text-xs font-semibold leading-4">Sep 2025</p>
        <p className="mt-2 flex justify-between text-xs leading-4 text-slate-300">
          <span>Value</span>
          <span className="text-white">$2.41M</span>
        </p>
        <p className="mt-2 flex justify-between text-xs leading-4 text-slate-300">
          <span>Return</span>
          <span className="text-emerald-300">+18.4%</span>
        </p>
      </div>
    </div>
  );
}

function OrderScreen() {
  return (
    <div className="w-full max-w-[240px] rounded-[32px] border-8 border-slate-950 bg-slate-950 p-4 shadow-2xl">
      <div className="rounded-[24px] bg-[#0b1220] p-4 text-white">
        <p className="text-center font-display text-sm font-bold leading-6">
          NVDA
        </p>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <span className="grid h-8 place-items-center rounded-lg bg-rose-500 text-xs font-semibold">
            Buy
          </span>
          <span className="grid h-8 place-items-center rounded-lg bg-white/10 text-xs font-semibold text-sky-300">
            Sell
          </span>
        </div>
        <div className="mt-4 flex h-8 items-center justify-between rounded-lg bg-white/10 px-4 text-xs">
          <span className="text-slate-400">Qty</span>
          <span>10</span>
        </div>
        <div className="mt-4 grid h-8 place-items-center rounded-lg bg-blue-500 text-xs font-semibold">
          Place order
        </div>
        <div className="mt-4 rounded-2xl bg-white px-4 py-3 text-slate-950">
          <p className="text-xs font-semibold leading-4">NVDA buy · 10 shares</p>
          <p className="mt-2 text-xs leading-4 text-slate-500">Limit · $8,924.00</p>
        </div>
      </div>
    </div>
  );
}

function MoodScreen() {
  const moods = ["😰", "😟", "😐", "😌", "😎"];
  return (
    <div className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-2xl">
      <p className="text-xs font-semibold uppercase leading-4 tracking-widest text-slate-400">
        How are you feeling?
      </p>
      <div className="mt-8 grid grid-cols-5 gap-2">
        {moods.map((mood, index) => (
          <span
            key={mood}
            className={cn(
              "grid h-12 place-items-center rounded-2xl text-xl",
              index === 4
                ? "bg-blue-600 shadow-[0_8px_24px_-8px_rgba(37,99,235,0.8)]"
                : "bg-slate-100",
            )}
          >
            {mood}
          </span>
        ))}
      </div>
      <p className="mt-4 text-sm font-semibold leading-6 text-blue-700">
        Confident. Risk appetite is up.
      </p>
      <svg viewBox="0 0 280 72" className="mt-8 h-16 w-full" aria-hidden>
        <path
          d="M0 56 C50 48 90 40 140 32 C190 22 230 18 280 12"
          fill="none"
          stroke="#94a3b8"
          strokeWidth="2"
        />
        <circle cx="168" cy="28" r="6" fill="#2563eb" stroke="#fff" strokeWidth="2" />
      </svg>
    </div>
  );
}

function TiltedPhone({
  src,
  alt,
  top,
  left,
  rotate,
  width,
}: {
  src: string;
  alt: string;
  top: string;
  left: string;
  rotate: number;
  width: number;
}) {
  return (
    <div
      className="absolute"
      style={{ top, left, width, transform: `rotate(${rotate}deg)` }}
    >
      <div
        className="rounded-[32px] p-2"
        style={{
          background:
            "linear-gradient(145deg, #f5f6f8 0%, #cfd3d8 24%, #8f959d 52%, #e6e9ed 100%)",
          boxShadow:
            "0 24px 32px rgba(0,0,0,0.42), inset 0 1px 0 rgba(255,255,255,0.8)",
        }}
      >
        <div className="overflow-hidden rounded-[24px] bg-black">
          <div className="flex h-6 items-end justify-center" aria-hidden>
            <div className="h-4 w-[38%] rounded-b-2xl bg-[#0b0d12]" />
          </div>
          <img
            src={src}
            alt={alt}
            className="block aspect-[390/844] w-full object-cover object-top"
          />
        </div>
      </div>
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
        className="rounded-[40px] p-2"
        style={{
          background:
            "linear-gradient(160deg, #f7f8fa 0%, #d5d8de 30%, #9aa0a8 62%, #e8ebef 100%)",
          boxShadow:
            "0 24px 40px rgba(15,23,42,0.28), inset 0 1px 0 rgba(255,255,255,0.85)",
        }}
      >
        <div className="overflow-hidden rounded-[32px] bg-black">
          <div className="flex h-8 items-end justify-center pb-1" aria-hidden>
            <div className="h-4 w-24 rounded-full bg-[#0b0d12]" />
          </div>
          {children}
        </div>
      </div>
      <figcaption className="mt-4 text-center text-white">
        <p className="font-display text-sm font-bold leading-6">{title}</p>
        <p className="text-xs leading-4 text-blue-100">{caption}</p>
      </figcaption>
    </figure>
  );
}
