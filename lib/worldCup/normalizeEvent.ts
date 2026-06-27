import type {
  PolymarketEventApiItem,
  WorldCupMatchStatus,
  WorldCupPredictionItem,
} from "./types";

export function parseEventClosed(value: PolymarketEventApiItem["closed"]): boolean {
  if (typeof value === "boolean") return value;
  if (value === "true" || value === "1") return true;
  return false;
}

function parseClosed(value: PolymarketEventApiItem["closed"]): boolean {
  return parseEventClosed(value);
}

function parseNumber(value: unknown, fallback = 0): number {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

/** 根据 closed 推导展示状态 */
export function resolveEventStatus(closed: boolean): WorldCupMatchStatus {
  return closed ? "ended" : "upcoming";
}

/** 从 title 解析主客队，如 "Norway vs. France" */
export function parseTitleTeams(title: string): {
  homeTeam: string;
  awayTeam: string;
} {
  const parts = title.split(/\s+vs\.?\s+/i);
  if (parts.length >= 2) {
    return {
      homeTeam: parts[0]?.trim() || title,
      awayTeam: parts[1]?.trim() || "",
    };
  }
  return { homeTeam: title, awayTeam: "" };
}

export function normalizePolymarketEvent(
  raw: unknown,
): WorldCupPredictionItem | null {
  if (!raw || typeof raw !== "object") return null;

  const item = raw as PolymarketEventApiItem;
  const id = parseNumber(item.id, NaN);
  if (!Number.isFinite(id) || id <= 0) return null;

  const title = String(item.title ?? "").trim();
  if (!title) return null;

  const closed = parseClosed(item.closed);
  const endDate = String(item.endDate ?? "");
  const { homeTeam, awayTeam } = parseTitleTeams(title);

  return {
    listType: "all",
    id,
    gameId: String(item.gameId ?? ""),
    title,
    homeTeam,
    awayTeam,
    endDate,
    icon: item.icon ? String(item.icon) : undefined,
    closed,
    minBetAmount: parseNumber(item.minBetAmount, 5),
    maxBetAmount: parseNumber(item.maxBetAmount, 10000),
    maxTotalBetAmount:
      item.maxTotalBetAmount != null
        ? parseNumber(item.maxTotalBetAmount)
        : undefined,
    totalBetUsdt:
      item.totalBetUsdt != null ? parseNumber(item.totalBetUsdt) : undefined,
    feeRate: parseNumber(item.feeRate, 0.05),
    enabled: item.enabled !== false,
    status: resolveEventStatus(closed),
    outcomes: item.outcomes,
    homeScore: item.homeScore,
    awayScore: item.awayScore,
  };
}
