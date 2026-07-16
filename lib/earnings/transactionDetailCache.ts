import type { ArbitrageLatestItem } from "@/lib/api/arbitrage";

const KEY_PREFIX = "earnings:transaction:";

export function cacheTransactionDetail(
  id: string,
  item: ArbitrageLatestItem,
): void {
  if (typeof sessionStorage === "undefined") return;
  try {
    sessionStorage.setItem(KEY_PREFIX + id, JSON.stringify(item));
  } catch {
    // 存储失败时忽略，详情页仍可从接口回退
  }
}

export function readCachedTransactionDetail(
  id: string,
): ArbitrageLatestItem | null {
  if (typeof sessionStorage === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(KEY_PREFIX + id);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ArbitrageLatestItem;
    if (parsed?.id !== id) return null;
    return parsed;
  } catch {
    return null;
  }
}
