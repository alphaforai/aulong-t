import { getWorldCupPredictionDetail } from "@/lib/api/worldCup";
import { extractTeamsFromBetQuestions, normalizePolymarketBets } from "./normalizeMarkets";
import { parseTitleTeams, resolveEventStatus } from "./normalizeEvent";
import type {
  PolymarketBetApiItem,
  WorldCupParticipateDetail,
  WorldCupPredictionItem,
} from "./types";

function buildParticipateDetail(
  gameId: string,
  bets: PolymarketBetApiItem[],
  cachedEvent: WorldCupPredictionItem | null | undefined,
): WorldCupParticipateDetail {
  const markets = normalizePolymarketBets(bets, cachedEvent ?? undefined);

  const teamsFromBets = extractTeamsFromBetQuestions(bets);
  const homeTeam =
    cachedEvent?.homeTeam || teamsFromBets?.homeTeam || "";
  const awayTeam =
    cachedEvent?.awayTeam || teamsFromBets?.awayTeam || "";

  const title =
    cachedEvent?.title ||
    (homeTeam && awayTeam ? `${homeTeam} vs. ${awayTeam}` : homeTeam || awayTeam);

  const endDate =
    cachedEvent?.endDate ||
    String(bets[0]?.endDate ?? markets.home?.endDate ?? markets.draw?.endDate ?? markets.away?.endDate ?? "");

  const closed = cachedEvent?.closed ?? false;
  const enabled = cachedEvent?.enabled ?? true;

  return {
    gameId,
    title,
    homeTeam,
    awayTeam,
    endDate,
    icon: cachedEvent?.icon,
    minBetAmount: cachedEvent?.minBetAmount ?? 5,
    maxBetAmount: cachedEvent?.maxBetAmount ?? 10000,
    feeRate: cachedEvent?.feeRate ?? 0.05,
    closed,
    enabled,
    status: cachedEvent?.status ?? resolveEventStatus(closed, endDate),
    homeScore: cachedEvent?.homeScore,
    awayScore: cachedEvent?.awayScore,
    markets,
  };
}

/**
 * 赛事玩法详情 — POST /api/polymarket/event/bets
 * @param gameId 列表项 gameId（非列表主键 id）
 * @param cachedEvent 列表页缓存的赛事元信息（可选）
 */
export async function fetchWorldCupPredictionDetail(
  gameId: string,
  cachedEvent?: WorldCupPredictionItem | null,
): Promise<WorldCupParticipateDetail> {
  const response = await getWorldCupPredictionDetail(gameId);
  const data = (response as { data?: unknown })?.data;

  if (!Array.isArray(data) || data.length === 0) {
    throw new Error("赛事不存在或已关闭");
  }

  const detail = buildParticipateDetail(gameId, data as PolymarketBetApiItem[], cachedEvent);

  if (Object.keys(detail.markets).length === 0) {
    throw new Error("暂无可下注玩法");
  }

  if (!detail.homeTeam && !detail.awayTeam && detail.title) {
    const parsed = parseTitleTeams(detail.title);
    detail.homeTeam = parsed.homeTeam;
    detail.awayTeam = parsed.awayTeam;
  }

  return detail;
}
