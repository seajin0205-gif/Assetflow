import {
  ChartLine,
  Coins,
  Pill,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";

export const equityBetaData = [
  { month: "Jan", beta: 0.72 },
  { month: "Feb", beta: 0.78 },
  { month: "Mar", beta: 0.81 },
  { month: "Apr", beta: 0.76 },
  { month: "May", beta: 0.84 },
  { month: "Jun", beta: 0.88 },
];

export const fxExposureData = [
  { currency: "USD", exposure: 8.2 },
  { currency: "EUR", exposure: 5.4 },
  { currency: "JPY", exposure: 3.1 },
  { currency: "GBP", exposure: 1.9 },
];

export const fxExposureColors = ["#06b6d4", "#0ea5e9", "#3b82f6", "#6366f1"];

export const RISK_SCORE_CURRENT = 78;
export const RISK_SCORE_LAST_MONTH = 50;
export const RISK_SCORE_1W_CHANGE = 12.4;
export const RISK_SCORE_MOM_DELTA = RISK_SCORE_CURRENT - RISK_SCORE_LAST_MONTH;

export const riskScoreTrendData = [
  { week: "W1", score: 52 },
  { week: "W2", score: 55 },
  { week: "W3", score: 58 },
  { week: "W4", score: 61 },
  { week: "W5", score: 64 },
  { week: "W6", score: 68 },
  { week: "W7", score: 72 },
  { week: "W8", score: 78 },
];

export const riskScoreDrivers = [
  { label: "Equity beta", delta: "+0.12", tone: "negative" as const },
  { label: "FX exposure", delta: "+2.1pp", tone: "negative" as const },
  { label: "Volatility", delta: "+8%", tone: "negative" as const },
];

export type MarketNewsItem = {
  headline: string;
  summary: string;
  source: string;
  time: string;
  image: string;
  imageAlt: string;
};

export const marketNewsItems: MarketNewsItem[] = [
  {
    headline: "Global equities rally on Middle East de-escalation hopes",
    summary: "S&P 500 rises 1.2% as tech and energy shares lead the advance.",
    source: "Reuters",
    time: "2h ago",
    image: "/news/news1.png",
    imageAlt: "Bull market rally with rising stock chart over city skyline",
  },
  {
    headline: "Treasury yields ease as inflation concerns soften",
    summary: "Bond markets steady after cooler CPI data shifts rate-cut bets.",
    source: "Bloomberg",
    time: "4h ago",
    image: "/news/news2.png",
    imageAlt: "US Treasury bond with declining yield chart",
  },
  {
    headline: "European markets follow Wall Street higher",
    summary: "Fund managers rotate back into growth-oriented portfolios.",
    source: "FT",
    time: "5h ago",
    image: "/news/news3.png",
    imageAlt: "European markets map with rising stock chart",
  },
  {
    headline: "Strategists warn volatility may return quickly",
    summary: "Geopolitical risk and central-bank signals could reverse gains.",
    source: "WSJ",
    time: "6h ago",
    image: "/news/news4.png",
    imageAlt: "Falling stock chart with volatility warning sign",
  },
];

export type StockHolding = {
  name: string;
  ticker: string;
  shares: string;
  price: string;
  icon: LucideIcon;
  color: string;
  iconClass: string;
};

export const stockHoldings: StockHolding[] = [
  {
    name: "Market index",
    ticker: "MEX",
    shares: "135 shares",
    price: "$20,500",
    icon: ChartLine,
    color:
      "bg-blue-500/10 ring-blue-200/80 dark:bg-violet-500/12 dark:ring-violet-500/25",
    iconClass: "text-blue-700 dark:text-violet-400",
  },
  {
    name: "Helia Pharma",
    ticker: "HXP",
    shares: "60 shares",
    price: "$222,555",
    icon: Pill,
    color:
      "bg-blue-500/8 ring-blue-200/70 dark:bg-emerald-500/12 dark:ring-emerald-500/25",
    iconClass: "text-blue-600 dark:text-emerald-400",
  },
  {
    name: "Bitcoin",
    ticker: "BTC",
    shares: "210 shares",
    price: "$543,30",
    icon: Coins,
    color:
      "bg-indigo-500/10 ring-indigo-200/70 dark:bg-amber-500/12 dark:ring-amber-500/25",
    iconClass: "text-indigo-600 dark:text-amber-400",
  },
  {
    name: "Stock 4",
    ticker: "STK",
    shares: "100 shares",
    price: "$33,240",
    icon: TrendingUp,
    color:
      "bg-blue-600/10 ring-blue-300/60 dark:bg-cyan-500/12 dark:ring-cyan-500/25",
    iconClass: "text-blue-800 dark:text-cyan-400",
  },
];

export const MOOD_OPTIONS = [
  { label: "Scare", emoji: "😨" },
  { label: "Anxious", emoji: "😰" },
  { label: "Neutral", emoji: "😐" },
  { label: "Calm", emoji: "😌" },
  { label: "Confident", emoji: "😊" },
] as const;

export const ASSET_FILTER_OPTIONS = ["All Assets", "Equities", "Fixed Income"];

export const ALERT_ITEMS = [
  "Margin call threshold exceeded — EUR Bond Fund",
  "Price alert: Axiom Labs +9.8% intraday",
  "Trade executed",
];

export const ROTA_BENCHMARK = 4.5;

const returnOnAssetsRaw = [
  { month: "Jan", rota: 4.1, netIncome: 42 },
  { month: "Feb", rota: 4.2, netIncome: 44 },
  { month: "Mar", rota: 4.0, netIncome: 41 },
  { month: "Apr", rota: 4.4, netIncome: 46 },
  { month: "May", rota: 4.6, netIncome: 48 },
  { month: "Jun", rota: 4.5, netIncome: 47 },
  { month: "Jul", rota: 4.8, netIncome: 51 },
  { month: "Aug", rota: 4.7, netIncome: 50 },
  { month: "Sep", rota: 5.0, netIncome: 54 },
  { month: "Oct", rota: 4.9, netIncome: 53 },
  { month: "Nov", rota: 5.1, netIncome: 56 },
  { month: "Dec", rota: 5.2, netIncome: 58 },
];

export const returnOnAssetsData = returnOnAssetsRaw.map((row, index, rows) => {
  const window = rows.slice(Math.max(0, index - 2), index + 1);
  const avg3m =
    window.reduce((sum, item) => sum + item.rota, 0) / window.length;
  return {
    ...row,
    benchmark: ROTA_BENCHMARK,
    avg3m: Math.round(avg3m * 10) / 10,
  };
});

export const latestEquityBeta =
  equityBetaData[equityBetaData.length - 1]?.beta ?? 0;

export const totalFxExposure = fxExposureData.reduce(
  (sum, entry) => sum + entry.exposure,
  0,
);

export const latestRota =
  returnOnAssetsData[returnOnAssetsData.length - 1]?.rota ?? 0;

export const firstRota = returnOnAssetsData[0]?.rota ?? latestRota;

export const rotaYtdChange = latestRota - firstRota;

export const vsBenchmark = latestRota - ROTA_BENCHMARK;

export const latestAvg3m =
  returnOnAssetsData[returnOnAssetsData.length - 1]?.avg3m ?? latestRota;
