import type {
  PolymarketBetApiItem,
  WorldCupOutcomeMarket,
  WorldCupOutcomeSide,
  WorldCupPredictionItem,
} from "./types";
import { parseTitleTeams } from "./normalizeEvent";

function parseNumber(value: unknown, fallback = 0): number {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

function normalizeBetItem(raw: PolymarketBetApiItem): WorldCupOutcomeMarket | null {
  const id = parseNumber(raw.id, NaN);
  const marketId = String(raw.marketId ?? "").trim();
  const question = String(raw.question ?? "").trim();
  if (!Number.isFinite(id) || id <= 0 || !marketId || !question) return null;

  return {
    id,
    marketId,
    question,
    betYes: parseNumber(raw.betYes),
    betNo: parseNumber(raw.betNo),
    startDate: String(raw.startDate ?? ""),
    endDate: String(raw.endDate ?? ""),
  };
}

/** 从平局玩法描述解析主客队 */
export function extractTeamsFromBetQuestions(
  bets: PolymarketBetApiItem[],
): { homeTeam: string; awayTeam: string } | null {
  for (const bet of bets) {
    const question = String(bet.question ?? "");

    const cnDrawMatch = question.match(/(.+?)与(.+?)会以平局/);
    if (cnDrawMatch) {
      return {
        homeTeam: cnDrawMatch[1]?.trim() ?? "",
        awayTeam: cnDrawMatch[2]?.trim() ?? "",
      };
    }

    const enDrawMatch = question.match(
      /Will\s+(.+?)\s+vs\.?\s+(.+?)\s+end\s+in\s+a\s+draw/i,
    );
    if (enDrawMatch) {
      return {
        homeTeam: enDrawMatch[1]?.trim() ?? "",
        awayTeam: enDrawMatch[2]?.trim() ?? "",
      };
    }
  }
  return null;
}

/** 根据 question 归类为主胜 / 平局 / 客胜 */
export function classifyBetOutcome(
  question: string,
  homeTeam: string,
  awayTeam: string,
): WorldCupOutcomeSide | null {
  if (/draw|平局/i.test(question)) return "draw";

  if (!/win|获胜/i.test(question)) return null;

  if (homeTeam && question.includes(homeTeam)) return "home";
  if (awayTeam && question.includes(awayTeam)) return "away";
  return null;
}

/** POST /api/polymarket/event/bets 返回的玩法数组 → 按赛果选项索引 */
export function normalizePolymarketBets(
  raw: unknown,
  event?: Pick<WorldCupPredictionItem, "homeTeam" | "awayTeam" | "title"> | null,
): Partial<Record<WorldCupOutcomeSide, WorldCupOutcomeMarket>> {
  if (!Array.isArray(raw) || raw.length === 0) return {};

  const bets = raw as PolymarketBetApiItem[];
  let homeTeam = event?.homeTeam ?? "";
  let awayTeam = event?.awayTeam ?? "";

  if (event?.title) {
    const parsed = parseTitleTeams(event.title);
    if (parsed.awayTeam) {
      homeTeam = parsed.homeTeam;
      awayTeam = parsed.awayTeam;
    }
  }

  const extracted = extractTeamsFromBetQuestions(bets);
  if (extracted) {
    homeTeam = homeTeam || extracted.homeTeam;
    awayTeam = awayTeam || extracted.awayTeam;
  }

  const markets: Partial<Record<WorldCupOutcomeSide, WorldCupOutcomeMarket>> =
    {};

  for (const rawBet of bets) {
    const bet = normalizeBetItem(rawBet);
    if (!bet) continue;

    const side = classifyBetOutcome(bet.question, homeTeam, awayTeam);
    if (!side) continue;

    markets[side] = bet;
  }

  return markets;
}

/** 接口玩法数组 → 保序列表（下注页 question 单选） */
export function normalizePolymarketBetList(raw: unknown): WorldCupOutcomeMarket[] {
  if (!Array.isArray(raw) || raw.length === 0) return [];

  return (raw as PolymarketBetApiItem[]).flatMap((rawBet) => {
    const bet = normalizeBetItem(rawBet);
    return bet ? [bet] : [];
  });
}

/** 0~1 赔率转展示百分比 */
export function marketOddsPercent(
  market: WorldCupOutcomeMarket,
  stance: "yes" | "no",
): number {
  const raw = stance === "yes" ? market.betYes : market.betNo;
  return Math.min(100, Math.max(0, raw * 100));
}
