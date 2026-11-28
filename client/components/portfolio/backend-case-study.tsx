import type { ReactNode } from "react";
import {
  Activity,
  Braces,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  Database,
  Layers,
  Radio,
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Flip a value to "live" when that capability is actually served here.
 * Badges, table captions, and the status note all read this map.
 */
export type CapabilityState = "live" | "design";

export const backendStatus: Record<
  "orders" | "quotes" | "database" | "events",
  CapabilityState
> = {
  orders: "design",
  quotes: "design",
  database: "design",
  events: "design",
};

const LIVE_ENDPOINTS = [
  {
    method: "GET",
    path: "/api/ping",
    description: "Returns a ping message.",
  },
  {
    method: "GET",
    path: "/api/demo",
    description: "Returns the demo message.",
  },
] as const;

const ORDER_ENDPOINTS = [
  {
    method: "POST",
    path: "/api/orders",
    description: "Create a buy or sell order.",
  },
  {
    method: "GET",
    path: "/api/orders",
    description: "Retrieve the recent 20 orders.",
  },
  {
    method: "GET",
    path: "/api/orders/:id",
    description: "Retrieve one order.",
  },
  {
    method: "DELETE",
    path: "/api/orders/:id",
    description: "Cancel a pending order.",
  },
  {
    method: "GET",
    path: "/api/account",
    description: "Retrieve cash, reservations, and positions.",
  },
] as const;

const QUOTE_ENDPOINTS = [
  {
    method: "GET",
    path: "/api/quotes",
    description: "Retrieve quotes and chart points.",
  },
  {
    method: "GET",
    path: "/api/quotes/stream",
    description: "Subscribe to quote snapshots.",
  },
] as const;

const CAPABILITIES = [
  {
    title: "Order Management",
    body: "Buy and sell requests follow one path, from the check to the result.",
    role: "Accepts, holds, or fills an order.",
    status: backendStatus.orders,
    icon: ClipboardList,
  },
  {
    title: "Real-time Market Data",
    body: "A simulated board moves prices and chart points on a fixed interval.",
    role: "Feeds quotes. Not a live exchange.",
    status: backendStatus.quotes,
    icon: Activity,
  },
  {
    title: "SQLite Database",
    body: "Accounts, positions, and orders sit in one SQLite database.",
    role: "Memory by default. A file when ORDER_DB_PATH is set.",
    status: backendStatus.database,
    icon: Database,
  },
  {
    title: "Transaction Management",
    body: "Place and cancel each run inside a single transaction.",
    role: "Cash and shares stay in step, or the change rolls back.",
    status: backendStatus.orders,
    icon: Layers,
  },
  {
    title: "Server-Sent Events",
    body: "A client subscribes to a stream of quote snapshots.",
    role: "The timer stops when nobody is listening.",
    status: backendStatus.events,
    icon: Radio,
  },
  {
    title: "REST API",
    body: "Order, account, and quote routes are specified as a small HTTP surface.",
    role:
      backendStatus.orders === "live"
        ? "Served by this server."
        : "A design. This server does not serve these routes.",
    status: backendStatus.orders,
    icon: Braces,
  },
] as const;

function designedCapabilities() {
  return Object.values(backendStatus).some((state) => state === "design");
}

export function BackendCaseStudy() {
  return (
    <>
      <section
        id="backend"
        className="scroll-mt-24 mx-auto max-w-dashboard px-6 pb-16 lg:px-8"
      >
        <div className="flex flex-wrap items-center gap-4">
          <p className="text-xs font-semibold uppercase leading-4 tracking-widest text-blue-600">
            Backend Engineering
          </p>
          <StateBadge state={designedCapabilities() ? "design" : "live"} />
        </div>
        <h2 className="mt-4 max-w-4xl font-display text-4xl font-extrabold leading-[1.25] tracking-tight text-slate-950 lg:text-6xl lg:leading-[80px]">
          Beyond the interface.
          <span className="mt-2 block bg-gradient-to-r from-blue-700 to-blue-500 bg-clip-text pb-2 text-transparent lg:pb-4">
            Building the engine behind every transaction.
          </span>
        </h2>
        <p className="mt-8 max-w-2xl text-sm leading-6 text-slate-500">
          Assetflow extends beyond portfolio visualization into transaction
          processing and real-time market data. The backend architecture is
          designed to handle order execution, asset reservation, data
          consistency, and live market updates.
        </p>
        <StatusNote />
        <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {CAPABILITIES.map((item) => (
            <article
              key={item.title}
              className="flex flex-col rounded-3xl border border-white bg-white/90 p-8 shadow-[0_24px_48px_-24px_rgba(37,99,235,0.35)]"
            >
              <div className="flex items-start justify-between gap-4">
                <IconTile>
                  <item.icon size={32} strokeWidth={1.75} aria-hidden />
                </IconTile>
                <StateBadge state={item.status} />
              </div>
              <h3 className="mt-8 font-display text-xl font-bold leading-8">
                {item.title}
              </h3>
              <p className="mt-4 text-sm leading-6 text-slate-500">{item.body}</p>
              <p className="mt-8 text-xs font-semibold leading-4 text-blue-600">
                {item.role}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section
        id="orders"
        className="scroll-mt-24 mx-auto max-w-dashboard px-6 pb-16 lg:px-8"
      >
        <SectionIntro
          kicker="Order Management System"
          title="Every order follows a controlled execution flow."
          body="An order processing system designed to manage buy and sell requests while maintaining account balance and asset consistency."
          state={backendStatus.orders}
        />
        <div className="mt-8 grid gap-8 md:grid-cols-2">
          <article className="rounded-[32px] bg-white p-8 shadow-[0_16px_40px_-24px_rgba(15,23,42,0.35)]">
            <p className="text-xs font-semibold uppercase leading-4 tracking-widest text-blue-600">
              Market order
            </p>
            <h3 className="mt-4 font-display text-xl font-bold leading-8">
              Fill at the current server quote
            </h3>
            <ul className="mt-8 grid gap-4">
              <Bullet>Fills immediately from the server’s simulated quote.</Bullet>
              <Bullet>The fill price is the same board the stream publishes.</Bullet>
            </ul>
          </article>
          <article className="rounded-[32px] bg-white p-8 shadow-[0_16px_40px_-24px_rgba(15,23,42,0.35)]">
            <p className="text-xs font-semibold uppercase leading-4 tracking-widest text-blue-600">
              Limit order
            </p>
            <h3 className="mt-4 font-display text-xl font-bold leading-8">
              Hold until the price is met
            </h3>
            <ul className="mt-8 grid gap-4">
              <Bullet>Opens at the price the request names.</Bullet>
              <Bullet>Stays pending until that condition is met.</Bullet>
              <Bullet>A limit buy reserves cash.</Bullet>
              <Bullet>A limit sell reserves shares.</Bullet>
            </ul>
          </article>
        </div>

        <div className="mt-8 rounded-[32px] bg-white p-8 shadow-[0_16px_40px_-24px_rgba(15,23,42,0.35)] lg:p-16">
          <h3 className="font-display text-xl font-bold leading-8">
            Order lifecycle
          </h3>
          <div className="mt-8">
            <StepFlow
              label="Designed order lifecycle"
              steps={[
                "Order Request",
                "Validation",
                "Account Balance Check",
                "Asset Reservation",
                "Order Creation",
                "Execution / Pending",
              ]}
            />
          </div>
          <h3 className="mt-16 font-display text-xl font-bold leading-8">
            Cancel flow
          </h3>
          <div className="mt-8">
            <StepFlow
              label="Designed cancel flow"
              fill
              steps={[
                "Cancel Request",
                "Order Validation",
                "Reservation Release",
                "Order Cancellation",
              ]}
            />
          </div>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          <ProtectCard
            title="Idempotency Key"
            body="The same request cannot create the order twice. A repeat with the same key returns the earlier response."
          />
          <ProtectCard
            title="Account Validation"
            body="Cash and share counts are checked before the order is accepted."
          />
          <ProtectCard
            title="Asset Reservation"
            body="A pending limit order sets aside the cash or the shares it needs."
          />
        </div>
      </section>

      <section
        id="market"
        className="scroll-mt-24 mx-auto max-w-dashboard px-6 pb-16 lg:px-8"
      >
        <SectionIntro
          kicker="Real-time Market Data"
          title="Market data that moves with every second."
          body="The design uses a simulated market data engine for prices and chart points. It is not a stock-exchange feed."
          state={backendStatus.quotes}
        />
        <SimulatedMarket />
      </section>

      <section
        id="database"
        className="scroll-mt-24 mx-auto max-w-dashboard px-6 pb-16 lg:px-8"
      >
        <SectionIntro
          kicker="Database & Transaction Management"
          title="Consistency matters when every transaction counts."
          body="Account balances, reserved assets, and order states need one consistent read and write through the life of an order."
          state={backendStatus.database}
        />
        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          <ProtectCard
            title="SQLite Database"
            body="SQLite stores the designed accounts, positions, and orders. The default database is in memory. ORDER_DB_PATH switches it to a file."
          />
          <ProtectCard
            title="Transaction Management"
            body="Creating and cancelling an order each run in a transaction, so cash and shares change together."
          />
          <ProtectCard
            title="Concurrency Control"
            body="An account version stops two writes from debiting the same balance. A lost race rolls back."
          />
        </div>
        <div className="mt-8 rounded-[32px] bg-white p-8 shadow-[0_16px_40px_-24px_rgba(15,23,42,0.35)] lg:p-16">
          <h3 className="font-display text-xl font-bold leading-8">
            Write path
          </h3>
          <div className="mt-8">
            <StepFlow
              label="Designed database write path"
              steps={[
                "Client Request",
                "API Validation",
                "Database Transaction",
                "Account Version Check",
                "Commit / Rollback",
              ]}
            />
          </div>
        </div>
      </section>

      <section
        id="api"
        className="scroll-mt-24 mx-auto max-w-dashboard px-6 pb-16 lg:px-8"
      >
        <SectionIntro
          kicker="API Architecture"
          title="Structured endpoints. Predictable responses."
          body="Two groups sit side by side: the routes this server actually serves, and the order and quote specification."
          state={designedCapabilities() ? "design" : "live"}
        />
        <div className="mt-8 grid gap-8">
          <EndpointTable
            title="Available on this server"
            caption="These routes respond today."
            state="live"
            rows={LIVE_ENDPOINTS}
          />
          <EndpointTable
            title="Orders API"
            caption={
              backendStatus.orders === "live"
                ? "These order routes respond on this server."
                : "Specification. These routes are not served here."
            }
            state={backendStatus.orders}
            rows={ORDER_ENDPOINTS}
          />
          <EndpointTable
            title="Market Data API"
            caption={
              backendStatus.quotes === "live"
                ? "Simulated quotes respond on this server."
                : "Specification for simulated quotes. These routes are not served here."
            }
            state={backendStatus.quotes}
            rows={QUOTE_ENDPOINTS}
          />
        </div>
        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          <ProtectCard
            title="RFC 7807"
            body="Errors use a Problem Details body, with a type, title, status, and detail."
          />
          <ProtectCard
            title="Rate Limiting"
            body="The design allows 10 order requests a second for one account. Past that, the response is HTTP 429 with a Retry-After header."
          />
          <ProtectCard
            title="Request Validation"
            body="Invalid JSON, a failed check, a missing account, a missing order, and an order that can no longer be cancelled each get their own error."
          />
        </div>
        <div className="mt-8 rounded-[32px] bg-white p-8 shadow-[0_16px_40px_-24px_rgba(15,23,42,0.35)] lg:p-16">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h3 className="font-display text-xl font-bold leading-8">
              Request headers
            </h3>
            <StateBadge state={backendStatus.orders} />
          </div>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-500">
            There is no login session. The account is the X-User-Id header.
          </p>
          <dl className="mt-8 grid gap-8 md:grid-cols-2">
            <div>
              <dt className="text-xs font-semibold uppercase leading-4 tracking-widest text-slate-400">
                X-User-Id
              </dt>
              <dd className="mt-2 text-sm leading-6 text-slate-600">
                Names the account for the order and account routes.
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase leading-4 tracking-widest text-slate-400">
                Idempotency-Key
              </dt>
              <dd className="mt-2 text-sm leading-6 text-slate-600">
                Required on create and cancel, so a retry cannot submit the
                order twice.
              </dd>
            </div>
          </dl>
        </div>
      </section>

      <section
        id="architecture"
        className="scroll-mt-24 mx-auto max-w-dashboard px-6 pb-16 lg:px-8"
      >
        <SectionIntro
          kicker="Technical Architecture Summary"
          title="From the screen to the record."
          body="The client talks to a REST layer. Orders go through checks and a transaction. Simulated quotes return on their own stream."
          state={designedCapabilities() ? "design" : "live"}
        />
        <div className="mt-8 rounded-[32px] bg-white p-8 shadow-[0_16px_40px_-24px_rgba(15,23,42,0.35)] lg:p-16">
          <ArchitectureDiagram />
        </div>
      </section>
    </>
  );
}

const SIMULATED_QUOTES = [
  { symbol: "NVDA", price: "892.40", change: "+1.46%", up: true },
  { symbol: "AAPL", price: "198.32", change: "−0.62%", up: false },
  { symbol: "TSLA", price: "248.91", change: "+2.10%", up: true },
  { symbol: "MSFT", price: "428.15", change: "+0.57%", up: true },
] as const;

const MARKET_BEATS = [
  { title: "1.5s", body: "The server moves the price." },
  { title: "Stream", body: "The dashboard subscribes." },
  { title: "Quiet", body: "No listeners, the timer stops." },
  { title: "Fill", body: "A market order uses this quote." },
] as const;

function SimulatedMarket() {
  return (
    <div className="mt-8 overflow-hidden rounded-[32px] bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 p-8 text-white shadow-[0_32px_80px_-32px_rgba(30,64,175,0.45)] lg:p-16">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-xs font-semibold uppercase leading-4 tracking-widest text-blue-200">
          Simulated market data
        </p>
        <span className="inline-flex h-8 items-center rounded-full bg-white/10 px-4 text-xs font-semibold leading-4 text-blue-100">
          Not an exchange
        </span>
      </div>
      <div className="mt-8 grid items-end gap-8 lg:grid-cols-2">
        <div>
          <p className="text-sm font-semibold leading-6 text-blue-100">NVDA</p>
          <p className="mt-2 font-display text-6xl font-extrabold leading-none tracking-tight">
            892.40
          </p>
          <p className="mt-4 text-sm font-semibold leading-6 text-emerald-300">
            +12.80 · +1.46%
          </p>
        </div>
        <svg viewBox="0 0 280 96" className="h-24 w-full" aria-hidden>
          <path
            d="M0 72 C36 68 52 40 88 44 C124 48 140 24 176 28 C212 32 236 16 280 8"
            fill="none"
            stroke="#93c5fd"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <circle cx="280" cy="8" r="5" fill="#60a5fa" />
        </svg>
      </div>
      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {SIMULATED_QUOTES.map((quote) => (
          <div key={quote.symbol} className="rounded-2xl bg-white/10 px-4 py-4">
            <p className="text-xs font-semibold leading-4 text-blue-100">
              {quote.symbol}
            </p>
            <p className="mt-2 font-display text-xl font-bold leading-8">
              {quote.price}
            </p>
            <p
              className={
                quote.up
                  ? "mt-2 text-xs font-semibold leading-4 text-emerald-300"
                  : "mt-2 text-xs font-semibold leading-4 text-rose-300"
              }
            >
              {quote.change}
            </p>
          </div>
        ))}
      </div>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {MARKET_BEATS.map((beat) => (
          <div key={beat.title}>
            <p className="font-display text-lg font-bold leading-6">{beat.title}</p>
            <p className="mt-2 text-sm leading-6 text-blue-100">{beat.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatusNote() {
  const liveList = LIVE_ENDPOINTS.map(
    (row) => `${row.method} ${row.path}`,
  ).join(" and ");

  return (
    <div className="mt-8 max-w-2xl rounded-3xl border border-white bg-white/90 p-8 shadow-[0_24px_48px_-24px_rgba(37,99,235,0.35)]">
      <p className="text-sm leading-6 text-slate-600">
        {designedCapabilities()
          ? "Order management, market data, and the database on this page are an API design. They are not running on this server."
          : "The order and quote routes on this page are live on this server."}{" "}
        This server currently serves {liveList}.
      </p>
    </div>
  );
}

function SectionIntro({
  kicker,
  title,
  body,
  state,
}: {
  kicker: string;
  title: string;
  body: string;
  state: CapabilityState;
}) {
  return (
    <div className="max-w-2xl">
      <div className="flex flex-wrap items-center gap-4">
        <p className="text-xs font-semibold uppercase leading-4 tracking-widest text-blue-600">
          {kicker}
        </p>
        <StateBadge state={state} />
      </div>
      <h2 className="mt-4 font-display text-3xl font-bold leading-10 tracking-tight">
        {title}
      </h2>
      <p className="mt-4 text-sm leading-6 text-slate-500">{body}</p>
    </div>
  );
}

function StateBadge({ state }: { state: CapabilityState }) {
  const live = state === "live";
  return (
    <span
      className={cn(
        "inline-flex h-8 items-center rounded-full px-4 text-xs font-semibold leading-4",
        live
          ? "bg-blue-600 text-white"
          : "border border-blue-200 bg-white text-blue-700",
      )}
    >
      {live ? "Live on this server" : "API design"}
    </span>
  );
}

function IconTile({ children }: { children: ReactNode }) {
  return (
    <div className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-100 text-blue-600">
      {children}
    </div>
  );
}

function Bullet({ children }: { children: ReactNode }) {
  return (
    <li className="flex gap-4 text-sm leading-6 text-slate-600">
      <span
        className="mt-2 h-2 w-2 shrink-0 rounded-full bg-blue-600"
        aria-hidden
      />
      <span>{children}</span>
    </li>
  );
}

function ProtectCard({ title, body }: { title: string; body: string }) {
  return (
    <article className="rounded-3xl border border-white bg-white/90 p-8 shadow-[0_24px_48px_-24px_rgba(37,99,235,0.35)]">
      <h3 className="font-display text-xl font-bold leading-8">{title}</h3>
      <p className="mt-4 text-sm leading-6 text-slate-500">{body}</p>
    </article>
  );
}

function StepFlow({
  steps,
  label,
  fill = false,
}: {
  steps: readonly string[];
  label: string;
  fill?: boolean;
}) {
  return (
    <ol
      aria-label={label}
      className={
        fill
          ? "flex flex-col items-stretch gap-4 lg:flex-row lg:items-center lg:justify-center"
          : "flex flex-col gap-4 md:flex-row md:flex-wrap md:items-center"
      }
    >
      {steps.map((step, index) => (
        <li
          key={step}
          className={
            fill
              ? "min-w-0"
              : "flex flex-col items-center gap-4 md:flex-row"
          }
        >
          <span
            className={
              fill
                ? "flex w-full items-center gap-4 rounded-2xl bg-[#eef3fb] px-4 py-4 lg:w-auto"
                : "flex w-full items-center gap-4 rounded-2xl bg-[#eef3fb] px-4 py-4 md:w-auto"
            }
          >
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white font-display text-xs font-bold text-blue-700">
              0{index + 1}
            </span>
            <span className="text-sm font-semibold leading-6 text-slate-900">
              {step}
            </span>
          </span>
          {!fill && index < steps.length - 1 && (
            <>
              <ChevronDown
                className="h-4 w-4 text-blue-500 md:hidden"
                aria-hidden
              />
              <ChevronRight
                className="hidden h-4 w-4 shrink-0 text-blue-500 md:block"
                aria-hidden
              />
            </>
          )}
        </li>
      ))}
    </ol>
  );
}

function EndpointTable({
  title,
  caption,
  state,
  rows,
}: {
  title: string;
  caption: string;
  state: CapabilityState;
  rows: readonly { method: string; path: string; description: string }[];
}) {
  return (
    <div className="overflow-hidden rounded-[32px] bg-white shadow-[0_16px_40px_-24px_rgba(15,23,42,0.35)]">
      <div className="flex flex-wrap items-center justify-between gap-4 px-8 pt-8">
        <h3 className="font-display text-xl font-bold leading-8">{title}</h3>
        <StateBadge state={state} />
      </div>
      <p className="px-8 pt-4 text-sm leading-6 text-slate-500">{caption}</p>
      <p className="px-8 pt-2 text-xs leading-4 text-slate-400 md:hidden">
        Swipe sideways to read every column.
      </p>
      <div className="mt-8 overflow-x-auto">
        <table className="w-full min-w-[640px] text-left">
          <thead>
            <tr className="border-y border-slate-100 text-xs font-semibold uppercase leading-4 tracking-widest text-slate-400">
              <th className="px-8 py-4 font-semibold">Method</th>
              <th className="px-8 py-4 font-semibold">Endpoint</th>
              <th className="px-8 py-4 font-semibold">Description</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={`${row.method}-${row.path}`} className="border-b border-slate-100 last:border-0">
                <td className="px-8 py-4 text-sm font-semibold leading-6 text-blue-700">
                  {row.method}
                </td>
                <td className="px-8 py-4 text-sm font-semibold leading-6 text-slate-900">
                  {row.path}
                </td>
                <td className="px-8 py-4 text-sm leading-6 text-slate-600">
                  {row.description}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ArchitectureDiagram() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col items-stretch gap-4">
      <ArchNode title="Client" body="Dashboard and order ticket." />
      <ArchArrow label="Requests down · SSE quotes return up" />
      <ArchNode
        title="REST API layer"
        body="Order, account, and quote routes. A specification on this server."
      />
      <ArchArrow />
      <div className="grid gap-4 md:grid-cols-2">
        <ArchNode
          title="Order processing"
          items={[
            "Order Validation",
            "Idempotency",
            "Asset Reservation",
            "Transaction Management",
            "Concurrency Control",
          ]}
        />
        <ArchNode
          title="Market data engine"
          body="Simulated market data."
          items={[
            "Simulated Price Generator",
            "1.5s Update Interval",
            "SSE Streaming",
          ]}
        />
      </div>
      <p className="rounded-2xl bg-blue-50 px-4 py-4 text-center text-sm font-semibold leading-6 text-blue-700">
        SSE stream returns simulated quotes to the client. Quotes are not
        stored in SQLite.
      </p>
      <ArchArrow label="Accounts, positions, and orders" />
      <ArchNode
        title="SQLite database"
        body="In memory by default. A file when ORDER_DB_PATH is set."
      />
    </div>
  );
}

function ArchNode({
  title,
  body,
  items,
}: {
  title: string;
  body?: string;
  items?: readonly string[];
}) {
  return (
    <div className="rounded-3xl border border-blue-100 bg-[#eef3fb] px-8 py-8">
      <p className="font-display text-lg font-bold leading-6 text-slate-950">
        {title}
      </p>
      {body && <p className="mt-2 text-sm leading-6 text-slate-500">{body}</p>}
      {items && (
        <ul className="mt-4 grid gap-2">
          {items.map((item) => (
            <li key={item} className="text-sm leading-6 text-slate-600">
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ArchArrow({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center gap-2 text-blue-600">
      <ChevronDown className="h-4 w-4" aria-hidden />
      {label && (
        <p className="text-center text-xs font-semibold leading-4">{label}</p>
      )}
    </div>
  );
}
