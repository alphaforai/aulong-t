import type { PolymarketBetApiItem, PolymarketEventApiItem } from "./types";

/** POST /api/polymarket/bet/order-list 订单项 */
export type PolymarketBetOrderApiItem = {
  userName?: string;
  bet?: PolymarketBetApiItem;
  event?: PolymarketEventApiItem;
  id?: number | string;
  orderId?: string;
  userId?: number | string;
  gameId?: string;
  marketId?: string;
  betId?: number | string;
  title?: string;
  question?: string;
  side?: string;
  betPrice?: number | string;
  usdt?: number | string;
  actualUsdt?: number | string;
  aul?: number | string;
  aulPrice?: number | string;
  fee?: number | string;
  payStatus?: string;
  placedStatus?: string;
  netPayoutUsdt?: number | string;
  payoutAul?: number | string;
  payoutAulPrice?: number | string;
  settledAt?: string | null;
  win?: string | null;
  memo?: string;
  createdAt?: string;
  updatedAt?: string;
};
