import type {
  WorldCupHistoryItem,
  WorldCupHoldingItem,
} from "./types";

type OrderOutcomeItem = Pick<
  WorldCupHoldingItem,
  "selectedOutcome" | "side" | "homeTeam" | "awayTeam" | "question"
>;

export function resolveOrderOutcomeLabel(
  item: OrderOutcomeItem,
  t: (key: string, params?: Record<string, string | number>) => string,
) {
  const { selectedOutcome, side, homeTeam, awayTeam, question } = item;

  let baseLabel = question;
  if (selectedOutcome === "draw") {
    baseLabel = t("worldCup.outcomeDraw");
  } else if (selectedOutcome === "home") {
    baseLabel = t("worldCup.outcomeHomeWin", { team: homeTeam });
  } else if (selectedOutcome === "away") {
    baseLabel = t("worldCup.outcomeHomeWin", { team: awayTeam });
  }

  if (side === "NO" && selectedOutcome) {
    return t("worldCup.outcomeNot", { outcome: baseLabel });
  }

  if (side === "NO" && question) {
    return t("worldCup.outcomeNot", { outcome: question });
  }

  return baseLabel;
}

export function resolveOrderWinLabel(
  win: string | null,
  t: (key: string, params?: Record<string, string | number>) => string,
) {
  switch (win) {
    case "WIN":
      return t("worldCup.orderResultWin");
    case "LOSE":
      return t("worldCup.orderResultLose");
    case "CANCELLED":
      return t("worldCup.orderResultCancelled");
    default:
      return t("worldCup.orderResultPending");
  }
}

export function formatHistoryMatchResult(
  item: Pick<
    WorldCupHistoryItem,
    "homeTeam" | "awayTeam" | "homeScore" | "awayScore" | "win"
  >,
  t: (key: string, params?: Record<string, string | number>) => string,
) {
  if (item.homeScore != null && item.awayScore != null) {
    return t("worldCup.resultScore", {
      home: item.homeTeam,
      away: item.awayTeam,
      homeScore: item.homeScore,
      awayScore: item.awayScore,
    });
  }

  switch (item.win) {
    case "WIN":
      return t("worldCup.orderResultWin");
    case "LOSE":
      return t("worldCup.orderResultLose");
    case "CANCELLED":
      return t("worldCup.orderResultCancelled");
    default:
      return "--";
  }
}
