import type { WorldCupCategory, WorldCupTab } from "./constants";

export type WorldCupMatchStatus = "ongoing" | "ended" | "upcoming";

export type WorldCupOutcomeSide = "home" | "draw" | "away";

export type WorldCupHoldingStatus = "ongoing" | "ordering";

/** POST /api/polymarket/event/bets 玩法项原始结构 */
export type PolymarketBetApiItem = {
  id: number | string;
  marketId?: string;
  gameId?: string;
  question?: string;
  betYes?: number | string;
  betNo?: number | string;
  startDate?: string;
  endDate?: string;
};

/** 单场赛果对应的 Polymarket 玩法（下注页使用） */
export type WorldCupOutcomeMarket = {
  id: number;
  marketId: string;
  question: string;
  betYes: number;
  betNo: number;
  startDate: string;
  endDate: string;
};

/** 下注页详情：赛事元信息 + 各赛果玩法赔率 */
export type WorldCupParticipateDetail = {
  gameId: string;
  title: string;
  homeTeam: string;
  awayTeam: string;
  endDate: string;
  icon?: string;
  minBetAmount: number;
  maxBetAmount: number;
  feeRate: number;
  closed: boolean;
  enabled: boolean;
  status: WorldCupMatchStatus;
  homeScore?: number;
  awayScore?: number;
  markets: Partial<Record<WorldCupOutcomeSide, WorldCupOutcomeMarket>>;
};

/** POST /api/polymarket/events 列表项原始结构 */
export type PolymarketEventApiItem = {
  id: number | string;
  gameId?: string;
  title?: string;
  endDate?: string;
  icon?: string;
  closed?: boolean | string;
  minBetAmount?: number | string;
  maxBetAmount?: number | string;
  maxTotalBetAmount?: number | string;
  totalBetUsdt?: number | string;
  feeRate?: number | string;
  enabled?: boolean;
  /** 详情接口可能返回 */
  homeScore?: number;
  awayScore?: number;
  outcomes?: {
    home: number;
    draw: number;
    away: number;
  };
};

/** 「全部」Tab 赛事卡片（Polymarket 赛事） */
export type WorldCupPredictionItem = {
  listType: "all";
  id: number;
  gameId: string;
  title: string;
  homeTeam: string;
  awayTeam: string;
  endDate: string;
  icon?: string;
  closed: boolean;
  minBetAmount: number;
  maxBetAmount: number;
  maxTotalBetAmount?: number;
  totalBetUsdt?: number;
  feeRate: number;
  enabled: boolean;
  status: WorldCupMatchStatus;
  homeScore?: number;
  awayScore?: number;
  outcomes?: {
    home: number;
    draw: number;
    away: number;
  };
  selectedOutcome?: WorldCupOutcomeSide;
};

/** 列表卡片 / 下注页共用 */
export type WorldCupMarketItem = WorldCupPredictionItem;

/** 订单列表共用赛事快照（来自 event 或订单快照字段） */
export type WorldCupOrderEventSnapshot = {
  gameId: string;
  title: string;
  homeTeam: string;
  awayTeam: string;
  endDate: string;
  icon?: string;
  eventStatus: WorldCupMatchStatus;
  homeScore?: number;
  awayScore?: number;
};

/** 「历史记录」Tab 历史卡片 */
export type WorldCupHistoryItem = {
  id: number;
  category: WorldCupCategory;
  listType: "history";
  gameId: string;
  title: string;
  homeTeam: string;
  awayTeam: string;
  endDate: string;
  icon?: string;
  eventStatus: WorldCupMatchStatus;
  homeScore?: number;
  awayScore?: number;
  question: string;
  side: "YES" | "NO";
  selectedOutcome?: WorldCupOutcomeSide;
  betPrice: number;
  stakeAmount: number;
  stakeCurrency: string;
  stakeAul: number;
  betAt?: string;
  profitAmount: number;
  profitCurrency: string;
  win: string | null;
  settlementAul: number;
  settledAt?: string;
};

/** 「持仓中」Tab 持仓卡片 */
export type WorldCupHoldingItem = {
  id: number;
  category: WorldCupCategory;
  listType: "holding";
  gameId: string;
  title: string;
  homeTeam: string;
  awayTeam: string;
  endDate: string;
  icon?: string;
  eventStatus: WorldCupMatchStatus;
  homeScore?: number;
  awayScore?: number;
  question: string;
  side: "YES" | "NO";
  selectedOutcome?: WorldCupOutcomeSide;
  betPrice: number;
  payStatus: string;
  stakeAmount: number;
  stakeCurrency: string;
  stakeAul: number;
  betAt?: string;
  estimatedProfit: number;
  profitCurrency: string;
};

export type WorldCupListItem =
  | WorldCupPredictionItem
  | WorldCupHoldingItem
  | WorldCupHistoryItem;

export type WorldCupPredictionPageParams = {
  page?: number;
  limit?: number;
  searchCount?: boolean;
  listType: WorldCupTab;
  category: WorldCupCategory;
};

export type WorldCupPredictionPageResult = {
  list: WorldCupListItem[];
  total: number;
};

export function isWorldCupHoldingItem(
  item: WorldCupListItem,
): item is WorldCupHoldingItem {
  return item.listType === "holding";
}

export function isWorldCupPredictionItem(
  item: WorldCupListItem,
): item is WorldCupPredictionItem {
  return item.listType === "all";
}

export function isWorldCupHistoryItem(
  item: WorldCupListItem,
): item is WorldCupHistoryItem {
  return item.listType === "history";
}

export function hasOutcomeOptions(
  item: WorldCupPredictionItem,
): item is WorldCupPredictionItem & {
  outcomes: NonNullable<WorldCupPredictionItem["outcomes"]>;
} {
  const o = item.outcomes;
  return (
    o != null &&
    Number.isFinite(o.home) &&
    Number.isFinite(o.draw) &&
    Number.isFinite(o.away)
  );
}

export function hasParticipateMarkets(
  detail: WorldCupParticipateDetail,
): detail is WorldCupParticipateDetail & {
  markets: Record<WorldCupOutcomeSide, WorldCupOutcomeMarket>;
} {
  return (
    detail.markets.home != null &&
    detail.markets.draw != null &&
    detail.markets.away != null
  );
}

/** 「全部」Tab 是否有效（可下注） */
export function isEventValid(item: WorldCupPredictionItem): boolean {
  return item.enabled && !item.closed;
}

/** 是否允许参与预测（已关闭 / 未开启不可下注） */
export function canParticipateInEvent(item: WorldCupPredictionItem): boolean {
  return isEventValid(item);
}

export function canParticipateInDetail(detail: WorldCupParticipateDetail): boolean {
  return detail.enabled && !detail.closed;
}
