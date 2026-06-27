import type { WorldCupPredictionItem } from "./types";

const KEY_PREFIX = "worldCup:event:";

/** 列表跳转下注页时缓存赛事元信息（限额、标题、icon 等） */
export function cacheParticipateEvent(
  gameId: string,
  item: WorldCupPredictionItem,
): void {
  if (typeof sessionStorage === "undefined") return;
  try {
    sessionStorage.setItem(KEY_PREFIX + gameId, JSON.stringify(item));
  } catch {
    // 存储失败时忽略，下注页仍可用玩法接口数据
  }
}

export function readCachedParticipateEvent(
  gameId: string,
): WorldCupPredictionItem | null {
  if (typeof sessionStorage === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(KEY_PREFIX + gameId);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as WorldCupPredictionItem;
    if (parsed?.gameId !== gameId) return null;
    return parsed;
  } catch {
    return null;
  }
}
