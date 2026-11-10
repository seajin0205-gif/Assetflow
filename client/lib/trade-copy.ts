export type TradeLocale = "ko" | "en";

export type TradeCopy = {
  backToDashboard: string;
  languageMenu: string;
  buyingPower: string;
  price: string;
  bookSide: string;
  bookPrice: string;
  bookSize: string;
  ask: string;
  bid: string;
  buy: string;
  sell: string;
  limit: string;
  market: string;
  orderPrice: string;
  quantity: string;
  sellAll: (shares: number) => string;
  estimatedTotal: string;
  held: string;
  shares: (count: number) => string;
  holdings: string;
  recentOrders: string;
  positions: string;
  avgCost: (price: string) => string;
  positionMeta: (shares: string, avg: string) => string;
  submitBuy: string;
  submitSell: string;
  tradeMenu: string;
  nav: Record<"chart" | "book" | "order" | "history", string>;
  status: Record<"filled" | "open", string>;
  errQuantity: string;
  errShares: (shares: number) => string;
  errLimit: string;
  toastBuy: (symbol: string, qty: number) => string;
  toastSell: (symbol: string, qty: number) => string;
};

export const tradeCopy: Record<TradeLocale, TradeCopy> = {
  ko: {
    backToDashboard: "대시보드",
    languageMenu: "언어",
    buyingPower: "주문가능",
    price: "가격",
    bookSide: "호가",
    bookPrice: "가격",
    bookSize: "잔량",
    ask: "매도",
    bid: "매수",
    buy: "매수",
    sell: "매도",
    limit: "지정가",
    market: "시장가",
    orderPrice: "주문 가격",
    quantity: "수량",
    sellAll: (shares) => `전량 ${shares}주`,
    estimatedTotal: "예상 금액",
    held: "보유",
    shares: (count) => `${count}주`,
    holdings: "보유 종목",
    recentOrders: "최근 주문",
    positions: "보유 현황",
    avgCost: (price) => `평단 ${price}`,
    positionMeta: (shares, avg) => `${shares} · ${avg}`,
    submitBuy: "매수 주문하기",
    submitSell: "매도 주문하기",
    tradeMenu: "거래 메뉴",
    nav: {
      chart: "차트",
      book: "호가",
      order: "주문",
      history: "내역",
    },
    status: {
      filled: "체결",
      open: "대기",
    },
    errQuantity: "수량을 입력해 주세요.",
    errShares: (shares) => `보유 수량(${shares}주)을 초과할 수 없습니다.`,
    errLimit: "지정가를 입력해 주세요.",
    toastBuy: (symbol, qty) => `${symbol} 매수 ${qty}주 접수`,
    toastSell: (symbol, qty) => `${symbol} 매도 ${qty}주 접수`,
  },
  en: {
    backToDashboard: "Dashboard",
    languageMenu: "Language",
    buyingPower: "Buying power",
    price: "Price",
    bookSide: "Side",
    bookPrice: "Price",
    bookSize: "Size",
    ask: "Ask",
    bid: "Bid",
    buy: "Buy",
    sell: "Sell",
    limit: "Limit",
    market: "Market",
    orderPrice: "Limit price",
    quantity: "Quantity",
    sellAll: (shares) => `All ${shares} shares`,
    estimatedTotal: "Estimated total",
    held: "Held",
    shares: (count) => (count === 1 ? "1 share" : `${count} shares`),
    holdings: "Holdings",
    recentOrders: "Recent orders",
    positions: "Positions",
    avgCost: (price) => `Avg ${price}`,
    positionMeta: (shares, avg) => `${shares} · ${avg}`,
    submitBuy: "Place buy order",
    submitSell: "Place sell order",
    tradeMenu: "Trade menu",
    nav: {
      chart: "Chart",
      book: "Book",
      order: "Order",
      history: "History",
    },
    status: {
      filled: "Filled",
      open: "Open",
    },
    errQuantity: "Enter a quantity.",
    errShares: (shares) => `Cannot sell more than the ${shares} shares you hold.`,
    errLimit: "Enter a limit price.",
    toastBuy: (symbol, qty) => `Buy ${qty} ${symbol} submitted`,
    toastSell: (symbol, qty) => `Sell ${qty} ${symbol} submitted`,
  },
};
