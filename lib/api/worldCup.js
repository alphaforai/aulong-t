import { request } from "@/lib/api/request";

/**
 * Polymarket 赛事分页列表
 * POST /api/polymarket/events
 *
 * 响应 data.list[]：id, gameId, title, endDate, icon, closed,
 * minBetAmount, maxBetAmount, feeRate, ...
 */
export async function getWorldCupPredictionPage({
  page = 0,
  limit,
  searchCount = true,
  listType,
  category,
}) {
  const response = await request("/api/polymarket/events", {
    method: "POST",
    body: {
      page: page + 1,
      limit,
      searchCount,
      listType,
      category,
    },
  });
  return response;
}

/**
 * Polymarket 赛事玩法列表
 * POST /api/polymarket/event/bets
 *
 * 响应 data[]：id, marketId, gameId, question, betYes, betNo, startDate, endDate
 */
export async function getWorldCupPredictionDetail(gameId) {
  const response = await request(`/api/polymarket/event/bets`, {
    method: "POST",
    body: {
      gameId,
    },
  });
  return response;
}

/**
 * Polymarket 下注订单列表（持仓 / 历史）
 * POST /api/polymarket/bet/order-list
 *
 * 持仓中需传 listType；历史不传 listType
 */
export async function getWorldCupOrderList({
  page = 0,
  limit,
  searchCount = true,
  listType,
}) {
  const body = {
    page: page + 1,
    limit,
    searchCount,
  };
  if (listType) {
    body.listType = listType;
  }
  const response = await request("/api/polymarket/bet/order-list", {
    method: "POST",
    body,
  });
  return response;
}

/**
 * 下注预览
 * POST /api/polymarket/bet/preview
 */
export async function previewWorldCupParticipate({ betId, side, usdtAmount }) {
  const response = await request("/api/polymarket/bet/preview", {
    method: "POST",
    body: {
      betId,
      side,
      usdtAmount,
    },
  });
  return response;
}

/**
 * 参与预测下单
 * POST /api/polymarket/bet/place
 */
export async function submitWorldCupParticipate({ betId, side, usdtAmount }) {
  const response = await request("/api/polymarket/bet/place", {
    method: "POST",
    body: {
      betId,
      side,
      usdtAmount,
    },
  });
  return response;
}
