/** 列表 → 下注页 URL 与 query 解析 */
import type { WorldCupOutcomeSide } from "./types";

/** 下注页未传选项时的默认预测（第一个：主胜） */
export const DEFAULT_PARTICIPATE_OUTCOME: WorldCupOutcomeSide = "home";

/** 参与预测详情页路径（id 为 gameId） */
export function buildWorldCupParticipateUrl(
  gameId: string,
  outcome?: WorldCupOutcomeSide,
): string {
  const base = `/world-cup/${gameId}/participate`;
  if (!outcome) return base;
  return `${base}?outcome=${outcome}`;
}

/** 解析地址栏 ?outcome=，非法值返回 undefined */
export function parseOutcomeParam(
  value: string | null | undefined,
): WorldCupOutcomeSide | undefined {
  if (value === "home" || value === "draw" || value === "away") return value;
  return undefined;
}
