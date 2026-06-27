import type {
  PolymarketBetApiItem,
  WorldCupOutcomeMarket,
  WorldCupOutcomeSide,
} from "./types";

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

/** 从平局玩法描述解析主客队，如 "Will Uruguay vs. Spain end in a draw?" */
export function extractTeamsFromBetQuestions(
  bets: PolymarketBetApiItem[],
): { homeTeam: string; awayTeam: string } | null {
  for (const bet of bets) {
    const question = String(bet.question ?? "");
    const match = question.match(
      /Will\s+(.+?)\s+vs\.?\s+(.+?)\s+end\s+in\s+a\s+draw/i,
    );
    if (match) {
      return {
        homeTeam: match[1]?.trim() ?? "",
        awayTeam: match[2]?.trim() ?? "",
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
  const q = question.toLowerCase();
  if (q.includes("draw")) return "draw";

  const homeLower = homeTeam.toLowerCase();
  const awayLower = awayTeam.toLowerCase();
  if (homeLower && q.includes(homeLower) && q.includes("win")) return "home";
  if (awayLower && q.includes(awayLower) && q.includes("win")) return "away";
  return null;
}

/** POST /api/polymarket/event/bets 返回的玩法数组 → 按赛果选项索引 */
export function normalizePolymarketBets(
  raw: unknown,
  teams?: { homeTeam: string; awayTeam: string } | null,
): Partial<Record<WorldCupOutcomeSide, WorldCupOutcomeMarket>> {
  if (!Array.isArray(raw) || raw.length === 0) return {};

  const bets = raw as PolymarketBetApiItem[];
  let homeTeam = teams?.homeTeam ?? "";
  let awayTeam = teams?.awayTeam ?? "";

  if (!homeTeam || !awayTeam) {
    const extracted = extractTeamsFromBetQuestions(bets);
    if (extracted) {
      homeTeam = extracted.homeTeam;
      awayTeam = extracted.awayTeam;
    }
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

/** 0~1 赔率转展示百分比 */
export function marketOddsPercent(
  market: WorldCupOutcomeMarket,
  stance: "yes" | "no",
): number {
  const raw = stance === "yes" ? market.betYes : market.betNo;
  return Math.min(100, Math.max(0, raw * 100));
}
