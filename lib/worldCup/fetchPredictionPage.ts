import { getWorldCupOrderList, getWorldCupPredictionPage } from "@/lib/api/worldCup";
import type { WorldCupTab } from "./constants";
import { normalizePolymarketEvent } from "./normalizeEvent";
import {
  normalizePolymarketHistoryOrder,
  normalizePolymarketHoldingOrder,
} from "./normalizeOrder";
import type {
  WorldCupListItem,
  WorldCupPredictionPageParams,
  WorldCupPredictionPageResult,
} from "./types";

function normalizeListItem(
  raw: unknown,
  listType: WorldCupTab,
): WorldCupListItem | null {
  if (listType === "all") {
    return normalizePolymarketEvent(raw);
  }
  if (listType === "holding") {
    return normalizePolymarketHoldingOrder(raw);
  }
  if (listType === "history") {
    return normalizePolymarketHistoryOrder(raw);
  }
  return null;
}

function normalizePageResult(
  raw: unknown,
  listType: WorldCupTab,
): WorldCupPredictionPageResult {
  const data = (raw as { data?: unknown })?.data ?? raw;
  const payload = data as { list?: unknown; total?: unknown };
  const rawList = Array.isArray(payload?.list) ? payload.list : [];
  const list = rawList
    .map((item) => normalizeListItem(item, listType))
    .filter((item): item is WorldCupListItem => item != null);

  const totalRaw = Number(payload?.total);
  const total = Number.isFinite(totalRaw)
    ? Math.max(0, Math.trunc(totalRaw))
    : list.length;

  return { list, total };
}

/** 预测市场分页列表 */
export async function fetchWorldCupPredictionPage(
  params: WorldCupPredictionPageParams,
): Promise<WorldCupPredictionPageResult> {
  if (params.listType === "all") {
    const response = await getWorldCupPredictionPage(params);
    return normalizePageResult(response, params.listType);
  }

  const response = await getWorldCupOrderList({
    page: params.page,
    limit: params.limit,
    searchCount: params.searchCount,
    listType: params.listType === "holding" ? params.listType : undefined,
  });
  return normalizePageResult(response, params.listType);
}
