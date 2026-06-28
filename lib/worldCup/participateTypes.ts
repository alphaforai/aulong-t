/** 参与预测下单 — POST /api/polymarket/bet/place */

export type WorldCupParticipateStance = "YES" | "NO";

export type WorldCupParticipateSubmitParams = {
  betId: string;
  side: WorldCupParticipateStance;
  usdtAmount: number;
};

export type WorldCupParticipatePreviewParams = {
  betId: number;
  side: WorldCupParticipateStance;
  usdtAmount: number;
};

/** 下注预览 — POST /api/polymarket/bet/preview 响应 data */
export type WorldCupParticipatePreviewResult = {
  usdtAmount: number;
  fee: number;
  actualUsdt: number;
  betRate: number;
  xCoinPrice: number;
  requiredAul: number;
  netPayoutUsdt: number;
  maxBetAmount: number;
};

export type WorldCupOrderPlacedStatus = "NOT_PLACED" | "PLACED" | "FAILED";
export type WorldCupOrderStatus = "PLACING" | "PLACED" | "FAILED";

/** 下单成功响应 data */
export type WorldCupParticipateSubmitResult = {
  orderId: number;
  title: string;
  question: string;
  /** 下注总金额（USDT，含手续费） */
  usdt: number;
  /** 真实下注金额（USDT）= usdt - fee */
  actualUsdt: number;
  /** 平台手续费（USDT） */
  fee: number;
  side: WorldCupParticipateStance;
  /** 成交时含滑点的赔率（快照） */
  betPrice: number;
  /** 本次下注所需 AUL = usdt / aulPrice */
  aul: number;
  /** AUL 价格（USDT/AUL，快照） */
  aulPrice: number;
  payStatus: string;
  placedStatus: WorldCupOrderPlacedStatus | string;
  status: WorldCupOrderStatus | string;
  /** 预期赢取（USDT，含本金） */
  netPayoutUsdt: number;
};
