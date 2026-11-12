/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

/**
 * Example response type for /api/demo
 */
export interface DemoResponse {
  message: string;
}

/** RFC 7807 Problem Details. */
export interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance?: string;
}

export interface OrderResponse {
  id: string;
  accountId: string;
  symbol: string;
  side: "buy" | "sell";
  type: "market" | "limit";
  quantity: number;
  limitPrice: string | null;
  status: "open" | "filled" | "cancelled";
  filledQuantity: number;
  averagePrice: string | null;
  reservedCash: string;
}

export interface AccountPosition {
  symbol: string;
  quantity: number;
  reservedQuantity: number;
  avgCost: string;
}

export interface AccountResponse {
  accountId: string;
  cash: string;
  reservedCash: string;
  buyingPower: string;
  positions: AccountPosition[];
}

export interface PlaceOrderRequest {
  symbol: string;
  side: "buy" | "sell";
  type: "market" | "limit";
  quantity: number;
  limitPrice?: number;
}
