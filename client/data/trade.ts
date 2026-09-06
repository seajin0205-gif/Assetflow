/** Mock market data for the Trade screen. */
export type TradeSymbol = {
  id: string;
  name: string;
  price: number;
  change: number;
  changePct: number;
};


export const TRADE_SYMBOLS: TradeSymbol[] = [
  { id: "NVDA", name: "NVIDIA", price: 892.4, change: 12.8, changePct: 1.46 },
  { id: "AAPL", name: "Apple", price: 198.32, change: -1.24, changePct: -0.62 },
  { id: "TSLA", name: "Tesla", price: 248.91, change: 5.12, changePct: 2.1 },
  { id: "MSFT", name: "Microsoft", price: 428.15, change: 2.44, changePct: 0.57 },
];

export const TRADE_CHART_BY_SYMBOL: Record<string, { time: string; price: number }[]> = {
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

export type OrderBookRow = { price: number; size: number };

export function buildOrderBook(mid: number): { asks: OrderBookRow[]; bids: OrderBookRow[] } {
  const asks: OrderBookRow[] = [];
  const bids: OrderBookRow[] = [];
  for (let i = 1; i <= 5; i++) {
    asks.push({ price: mid + i * 0.05, size: Math.round(120 + Math.random() * 400) });
    bids.push({ price: mid - i * 0.05, size: Math.round(120 + Math.random() * 400) });
  }
  return { asks: asks.reverse(), bids };
}

export const TRADE_HOLDINGS = [
  { symbol: "NVDA", qty: 12, avg: 720.5, value: 10708.8, pnl: 12.4 },
  { symbol: "AAPL", qty: 40, avg: 182.1, value: 7932.8, pnl: -2.1 },
  { symbol: "MSFT", qty: 8, avg: 410.0, value: 3425.2, pnl: 4.3 },
];

export const TRADE_RECENT_ORDERS = [
  { id: "ORD-2841", side: "buy" as const, symbol: "NVDA", qty: 5, price: 885.2, status: "체결" },
  { id: "ORD-2839", side: "sell" as const, symbol: "AAPL", qty: 10, price: 199.1, status: "체결" },
  { id: "ORD-2835", side: "buy" as const, symbol: "MSFT", qty: 3, price: 426.0, status: "대기" },
];

