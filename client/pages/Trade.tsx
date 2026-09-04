import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowDownRight,
  ArrowLeft,
  ArrowUpRight,
  BarChart3,
  Clock,
  Layers,
  ListOrdered,
  Wallet,
} from "lucide-react";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/theme-toggle";
import { getDashboardChartTheme } from "@/lib/dashboard-theme";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type SymbolInfo = {
  id: string;
  name: string;
  price: number;
  change: number;
  changePct: number;
};

type MobileTab = "chart" | "book" | "order" | "history";

const SYMBOLS: SymbolInfo[] = [
  { id: "NVDA", name: "NVIDIA", price: 892.4, change: 12.8, changePct: 1.46 },
  { id: "AAPL", name: "Apple", price: 198.32, change: -1.24, changePct: -0.62 },
  { id: "TSLA", name: "Tesla", price: 248.91, change: 5.12, changePct: 2.1 },
  { id: "MSFT", name: "Microsoft", price: 428.15, change: 2.44, changePct: 0.57 },
];

const CHART_BY_SYMBOL: Record<string, { time: string; price: number }[]> = {
  NVDA: [
    { time: "09:30", price: 878 },
    { time: "10:00", price: 881 },
    { time: "10:30", price: 879 },
    { time: "11:00", price: 885 },
    { time: "11:30", price: 888 },
    { time: "12:00", price: 886 },
    { time: "12:30", price: 890 },
    { time: "13:00", price: 892 },
  ],
  AAPL: [
    { time: "09:30", price: 199.8 },
    { time: "10:00", price: 199.2 },
    { time: "10:30", price: 198.9 },
    { time: "11:00", price: 198.5 },
    { time: "11:30", price: 198.1 },
    { time: "12:00", price: 198.4 },
    { time: "12:30", price: 198.0 },
    { time: "13:00", price: 198.32 },
  ],
  TSLA: [
    { time: "09:30", price: 242 },
    { time: "10:00", price: 244 },
    { time: "10:30", price: 243 },
    { time: "11:00", price: 246 },
    { time: "11:30", price: 247 },
    { time: "12:00", price: 245 },
    { time: "12:30", price: 248 },
    { time: "13:00", price: 248.91 },
  ],
  MSFT: [
    { time: "09:30", price: 425 },
    { time: "10:00", price: 426 },
    { time: "10:30", price: 427 },
    { time: "11:00", price: 426.5 },
    { time: "11:30", price: 427.8 },
    { time: "12:00", price: 427.2 },
    { time: "12:30", price: 428 },
    { time: "13:00", price: 428.15 },
  ],
};

type OrderBookRow = { price: number; size: number };

function buildOrderBook(mid: number): { asks: OrderBookRow[]; bids: OrderBookRow[] } {
  const asks: OrderBookRow[] = [];
  const bids: OrderBookRow[] = [];
  for (let i = 1; i <= 5; i++) {
    asks.push({ price: mid + i * 0.05, size: Math.round(120 + Math.random() * 400) });
    bids.push({ price: mid - i * 0.05, size: Math.round(120 + Math.random() * 400) });
  }
  return { asks: asks.reverse(), bids };
}

const HOLDINGS = [
  { symbol: "NVDA", qty: 12, avg: 720.5, value: 10708.8, pnl: 12.4 },
  { symbol: "AAPL", qty: 40, avg: 182.1, value: 7932.8, pnl: -2.1 },
  { symbol: "MSFT", qty: 8, avg: 410.0, value: 3425.2, pnl: 4.3 },
];

const RECENT_ORDERS = [
  { id: "ORD-2841", side: "buy" as const, symbol: "NVDA", qty: 5, price: 885.2, status: "체결" },
  { id: "ORD-2839", side: "sell" as const, symbol: "AAPL", qty: 10, price: 199.1, status: "체결" },
  { id: "ORD-2835", side: "buy" as const, symbol: "MSFT", qty: 3, price: 426.0, status: "대기" },
];

const NAV_ITEMS: { id: MobileTab; label: string; icon: typeof BarChart3 }[] = [
  { id: "chart", label: "차트", icon: BarChart3 },
  { id: "book", label: "호가", icon: Layers },
  { id: "order", label: "주문", icon: ListOrdered },
  { id: "history", label: "내역", icon: Clock },
];

function formatKrw(n: number) {
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
    maximumFractionDigits: 0,
  }).format(n);
}

function formatUsd(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(n);
}

function formatUsdCompact(n: number) {
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}k`;
  return formatUsd(n);
}

export default function Trade() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const chartTheme = getDashboardChartTheme(isDark);

  const [tab, setTab] = useState<MobileTab>("order");
  const [symbolId, setSymbolId] = useState("NVDA");
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [orderType, setOrderType] = useState<"market" | "limit">("limit");
  const [quantity, setQuantity] = useState("10");
  const [limitPrice, setLimitPrice] = useState(SYMBOLS[0].price.toFixed(2));

  const symbol = SYMBOLS.find((s) => s.id === symbolId) ?? SYMBOLS[0];
  const chartData = CHART_BY_SYMBOL[symbolId] ?? CHART_BY_SYMBOL.NVDA;
  const orderBook = useMemo(() => buildOrderBook(symbol.price), [symbolId, symbol.price]);

  const qtyNum = Math.max(0, Number(quantity) || 0);
  const priceNum =
    orderType === "market"
      ? symbol.price
      : Math.max(0, Number(limitPrice) || symbol.price);
  const estimatedTotal = qtyNum * priceNum;
  const buyingPower = 124_580_000;
  const availableShares = HOLDINGS.find((h) => h.symbol === symbolId)?.qty ?? 0;
  const isUp = symbol.change >= 0;

  const handleSymbolChange = (id: string) => {
    setSymbolId(id);
    const next = SYMBOLS.find((s) => s.id === id);
    if (next) setLimitPrice(next.price.toFixed(2));
  };

  const handleSubmit = () => {
    if (qtyNum <= 0) {
      toast.error("수량을 입력해 주세요.");
      return;
    }
    if (side === "sell" && qtyNum > availableShares) {
      toast.error(`보유 수량(${availableShares}주)을 초과할 수 없습니다.`);
      return;
    }
    if (orderType === "limit" && (!limitPrice || Number(limitPrice) <= 0)) {
      toast.error("지정가를 입력해 주세요.");
      return;
    }

    toast.success(
      side === "buy"
        ? `${symbol.id} 매수 ${qtyNum}주 접수`
        : `${symbol.id} 매도 ${qtyNum}주 접수`,
      {
        description: `${orderType === "market" ? "시장가" : "지정가"} · ${formatUsd(estimatedTotal)}`,
      },
    );
  };

  const maxAskSize = Math.max(...orderBook.asks.map((r) => r.size));
  const maxBidSize = Math.max(...orderBook.bids.map((r) => r.size));

  return (
    <div className="dashboard-shell">
      <div className="trade-mobile-shell text-foreground">
        {/* Mobile header */}
        <header className="sticky top-0 z-40 border-b border-subtle bg-white/90 backdrop-blur-xl dark:bg-background/90">
          <div className="flex items-center justify-between px-6 py-4">
            <Link
              to="/"
              className="flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
              aria-label="대시보드"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <Select value={symbolId} onValueChange={handleSymbolChange}>
              <SelectTrigger className="h-10 w-auto gap-2 border-0 bg-transparent px-2 font-display text-base font-bold shadow-none focus:ring-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SYMBOLS.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.id} · {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <ThemeToggle />
          </div>

          {/* Price strip */}
          <div className="border-t border-subtle px-6 pb-4 pt-4">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-xs leading-4 text-muted-foreground">{symbol.name}</p>
                <p className="font-display text-2xl font-bold leading-8 tabular-nums">
                  {formatUsd(symbol.price)}
                </p>
              </div>
              <span
                className={cn(
                  "inline-flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-bold leading-6 tabular-nums",
                  isUp ? "trade-buy-muted" : "trade-sell-muted",
                )}
              >
                {isUp ? (
                  <ArrowUpRight className="h-4 w-4" />
                ) : (
                  <ArrowDownRight className="h-4 w-4" />
                )}
                {isUp ? "+" : ""}
                {symbol.changePct.toFixed(2)}%
              </span>
            </div>
            <div className="mt-2 flex items-center gap-2 rounded-lg bg-muted/40 px-4 py-2 text-xs leading-4">
              <Wallet className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="text-muted-foreground">주문가능</span>
              <span className="ml-auto font-semibold tabular-nums">{formatKrw(buyingPower)}</span>
            </div>
          </div>
        </header>

        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto px-6 pb-32 pt-4">
          {tab === "chart" && (
            <div className="space-y-4">
              <div className="flex gap-2">
                {(["1D", "1W", "1M", "1Y"] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    className={cn(
                      "rounded-full px-4 py-2 text-xs font-medium leading-4",
                      p === "1D"
                        ? "bg-foreground text-background"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    {p}
                  </button>
                ))}
              </div>
              <div className="glass-panel-sm h-[52vh] min-h-72 p-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="tradeFill" x1="0" y1="0" x2="0" y2="1">
                        {chartTheme.revenueGradient.map((g) => (
                          <stop
                            key={g.offset}
                            offset={g.offset}
                            stopColor={g.color}
                            stopOpacity={g.opacity}
                          />
                        ))}
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.gridStroke} />
                    <XAxis
                      dataKey="time"
                      tick={{ fill: chartTheme.tickSecondary, fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      domain={["auto", "auto"]}
                      tick={{ fill: chartTheme.tickSecondary, fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                      width={48}
                      tickFormatter={(v) => `$${v}`}
                    />
                    <Tooltip
                      contentStyle={{
                        background: isDark ? "hsl(222 47% 8%)" : "#fff",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                      formatter={(value: number) => [formatUsd(value), "가격"]}
                    />
                    <Area
                      type="monotone"
                      dataKey="price"
                      stroke={chartTheme.revenueStroke[0]?.color ?? "#3b82f6"}
                      strokeWidth={2}
                      fill="url(#tradeFill)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {tab === "book" && (
            <div className="glass-panel-sm p-4 text-xs leading-4">
              <div className="mb-4 grid grid-cols-3 text-center text-xs font-semibold uppercase leading-4 tracking-wide text-muted-foreground">
                <span>호가</span>
                <span>가격</span>
                <span>잔량</span>
              </div>
              <div className="space-y-0">
                {orderBook.asks.map((row) => (
                  <div
                    key={`ask-${row.price}`}
                    className="relative grid grid-cols-3 items-center rounded py-2 tabular-nums"
                  >
                    <span
                      className="absolute inset-y-0 right-0 rounded bg-primary/10"
                      style={{ width: `${(row.size / maxAskSize) * 56}%` }}
                    />
                    <span className="relative z-10 pl-2 text-xs font-medium leading-4 trade-sell">
                      매도
                    </span>
                    <span className="relative z-10 text-center font-semibold trade-sell">
                      {row.price.toFixed(2)}
                    </span>
                    <span className="relative z-10 pr-2 text-right text-muted-foreground">
                      {row.size}
                    </span>
                  </div>
                ))}
              </div>
              <div className="my-2 border-y border-subtle py-2 text-center">
                <span className="font-display text-lg font-bold tabular-nums">
                  {formatUsd(symbol.price)}
                </span>
              </div>
              <div className="space-y-0">
                {orderBook.bids.map((row) => (
                  <div
                    key={`bid-${row.price}`}
                    className="relative grid grid-cols-3 items-center rounded py-2 tabular-nums"
                  >
                    <span
                      className="absolute inset-y-0 left-0 rounded bg-destructive/10"
                      style={{ width: `${(row.size / maxBidSize) * 56}%` }}
                    />
                    <span className="relative z-10 pl-2 text-xs font-medium leading-4 trade-buy">
                      매수
                    </span>
                    <span className="relative z-10 text-center font-semibold trade-buy">
                      {row.price.toFixed(2)}
                    </span>
                    <span className="relative z-10 pr-2 text-right text-muted-foreground">
                      {row.size}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === "order" && (
            <div className="space-y-4">
              {/* Buy / Sell toggle — red buy, blue sell */}
              <div className="grid grid-cols-2 gap-0 rounded-xl bg-muted/50 p-0">
                <button
                  type="button"
                  onClick={() => setSide("buy")}
                  className={cn(
                    "rounded-lg border py-2 text-sm font-bold leading-6 transition",
                    side === "buy"
                      ? "border-transparent trade-buy-bg shadow-md shadow-destructive/25"
                      : "border-subtle text-muted-foreground",
                  )}
                >
                  매수
                </button>
                <button
                  type="button"
                  onClick={() => setSide("sell")}
                  className={cn(
                    "rounded-lg border py-2 text-sm font-bold leading-6 transition",
                    side === "sell"
                      ? "border-transparent trade-sell-bg shadow-md shadow-primary/25"
                      : "border-subtle text-muted-foreground",
                  )}
                >
                  매도
                </button>
              </div>

              <div className="flex gap-2">
                {(
                  [
                    { id: "limit" as const, label: "지정가" },
                    { id: "market" as const, label: "시장가" },
                  ] as const
                ).map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setOrderType(t.id)}
                    className={cn(
                      "flex-1 rounded-lg border py-2 text-sm font-medium leading-6 transition",
                      orderType === t.id
                        ? "border-transparent bg-foreground text-background"
                        : "border-subtle bg-muted/40 text-muted-foreground",
                    )}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              <div className="glass-panel-sm space-y-4 p-4">
                {orderType === "limit" && (
                  <div className="space-y-2">
                    <Label htmlFor="limit-price" className="text-xs text-muted-foreground">
                      주문 가격
                    </Label>
                    <Input
                      id="limit-price"
                      type="number"
                      step="0.01"
                      inputMode="decimal"
                      value={limitPrice}
                      onChange={(e) => setLimitPrice(e.target.value)}
                      className="h-12 text-lg font-semibold tabular-nums"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="qty" className="text-xs leading-4 text-muted-foreground">
                      수량
                    </Label>
                    {side === "sell" && availableShares > 0 && (
                      <button
                        type="button"
                        className={cn(
                          "text-xs font-semibold",
                          side === "sell" ? "trade-sell" : "trade-buy",
                        )}
                        onClick={() => setQuantity(String(availableShares))}
                      >
                        전량 {availableShares}주
                      </button>
                    )}
                  </div>
                  <Input
                    id="qty"
                    type="number"
                    inputMode="numeric"
                    min={1}
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="h-12 text-lg font-semibold tabular-nums"
                  />
                  <div className="grid grid-cols-4 gap-2">
                    {[25, 50, 75, 100].map((pct) => (
                      <button
                        key={pct}
                        type="button"
                        className="rounded-lg border border-subtle bg-muted/40 py-2 text-xs font-semibold text-muted-foreground active:bg-muted/80"
                        onClick={() => {
                          if (side === "sell" && availableShares > 0) {
                            setQuantity(String(Math.floor((availableShares * pct) / 100)));
                          } else if (side === "buy" && priceNum > 0) {
                            const maxQty = Math.floor(buyingPower / 1300 / priceNum);
                            setQuantity(
                              String(Math.max(1, Math.floor((maxQty * pct) / 100))),
                            );
                          }
                        }}
                      >
                        {pct}%
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 rounded-lg bg-muted/40 px-4 py-4 text-sm leading-6">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">예상 금액</span>
                    <span className="font-bold tabular-nums">{formatUsd(estimatedTotal)}</span>
                  </div>
                  {side === "sell" && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">보유</span>
                      <span className="tabular-nums">{availableShares}주</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Holdings quick pick */}
              <div>
                <p className="section-label mb-2 px-0">보유 종목</p>
                <div className="flex gap-2 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {HOLDINGS.map((h) => (
                    <button
                      key={h.symbol}
                      type="button"
                      onClick={() => handleSymbolChange(h.symbol)}
                      className={cn(
                        "shrink-0 rounded-xl border px-4 py-2 text-left transition",
                        h.symbol === symbolId
                          ? "border-primary/40 bg-primary/5"
                          : "border-subtle bg-card",
                      )}
                    >
                      <p className="text-sm font-bold">{h.symbol}</p>
                      <p className="text-xs leading-4 text-muted-foreground">{h.qty}주</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === "history" && (
            <div className="space-y-4">
              <p className="section-label px-0">최근 주문</p>
              {RECENT_ORDERS.map((o) => (
                <div
                  key={o.id}
                  className="glass-panel-sm flex items-center gap-4 p-4"
                >
                  <span
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                      o.side === "buy" ? "trade-buy-muted" : "trade-sell-muted",
                    )}
                  >
                    {o.side === "buy" ? "매수" : "매도"}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold">{o.symbol}</span>
                      <span className="text-sm tabular-nums">{formatUsdCompact(o.price)}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{o.qty}주 · {o.id}</span>
                      <span className="inline-flex items-center gap-1">
                        {o.status === "대기" && <Clock className="h-4 w-4" />}
                        {o.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              <p className="section-label mt-4 px-0">보유 현황</p>
              {HOLDINGS.map((h) => (
                <button
                  key={h.symbol}
                  type="button"
                  onClick={() => {
                    handleSymbolChange(h.symbol);
                    setTab("order");
                  }}
                  className="glass-panel-sm flex w-full items-center justify-between p-4 text-left"
                >
                  <div>
                    <p className="font-bold">{h.symbol}</p>
                    <p className="text-xs text-muted-foreground">
                      {h.qty}주 · 평단 {formatUsd(h.avg)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold tabular-nums">{formatUsd(h.value)}</p>
                    <p
                      className={cn(
                        "text-xs font-semibold tabular-nums",
                        h.pnl >= 0 ? "trade-buy" : "trade-sell",
                      )}
                    >
                      {h.pnl >= 0 ? "+" : ""}
                      {h.pnl}%
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </main>

        {/* Sticky submit on order tab */}
        {tab === "order" && (
          <div className="fixed bottom-[calc(64px+env(safe-area-inset-bottom))] left-1/2 z-50 w-full max-w-trade -translate-x-1/2 px-6">
            <Button
              type="button"
              variant={side === "buy" ? "destructive" : "default"}
              className={cn(
                "h-14 w-full rounded-xl text-base font-bold shadow-lg",
                side === "buy"
                  ? "shadow-destructive/30"
                  : "shadow-primary/30",
              )}
              onClick={handleSubmit}
            >
              {side === "buy" ? "매수 주문하기" : "매도 주문하기"}
            </Button>
          </div>
        )}

        {/* Bottom navigation */}
        <nav className="trade-mobile-nav" aria-label="거래 메뉴">
          <div className="grid grid-cols-4 px-2 pt-2">
            {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={cn(
                  "flex flex-col items-center gap-2 py-2 text-xs font-medium leading-4 transition",
                  tab === id ? "text-foreground" : "text-muted-foreground",
                )}
              >
                <Icon
                  className={cn(
                    "h-4 w-4",
                    tab === id && id === "order" && side === "buy" && "text-destructive",
                    tab === id && id === "order" && side === "sell" && "text-primary",
                    tab === id && id !== "order" && "text-primary",
                  )}
                />
                {label}
              </button>
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
}
