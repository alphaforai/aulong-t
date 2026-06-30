import type { WorldCupCategory } from "./constants";
import {
  parseEventClosed,
  parseTitleTeams,
  resolveEventStatus,
} from "./normalizeEvent";
import { classifyBetOutcome } from "./normalizeMarkets";
import type { PolymarketBetOrderApiItem } from "./orderTypes";
import type {
  WorldCupHoldingItem,
  WorldCupHoldingStatus,
  WorldCupHistoryItem,
  WorldCupOrderEventSnapshot,
  WorldCupOutcomeSide,
} from "./types";

const DEFAULT_CATEGORY: WorldCupCategory = "world_cup";

function parseNum(value: unknown, fallback = 0): number {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

function parseId(value: unknown): number {
  const num = parseNum(value, NaN);
  return Number.isFinite(num) && num > 0 ? num : 0;
}

function parseSide(value: unknown): "YES" | "NO" {
  return String(value).toUpperCase() === "NO" ? "NO" : "YES";
}

function resolveOutcomeSide(
  question: string,
  homeTeam: string,
  awayTeam: string,
): WorldCupOutcomeSide | undefined {
  return classifyBetOutcome(question, homeTeam, awayTeam) ?? undefined;
}

function resolveOrderEventSnapshot(
  order: PolymarketBetOrderApiItem,
): WorldCupOrderEventSnapshot {
  const event = order.event;
  const title = String(event?.title ?? order.title ?? "").trim();
  const { homeTeam, awayTeam } = parseTitleTeams(title);
  const closed = parseEventClosed(event?.closed);
  const endDate = String(event?.endDate ?? "");

  return {
    gameId: String(event?.gameId ?? order.gameId ?? ""),
    title: title || (homeTeam && awayTeam ? `${homeTeam} vs. ${awayTeam}` : title),
    homeTeam,
    awayTeam,
    endDate,
    icon: event?.icon ? String(event.icon) : undefined,
    eventStatus: resolveEventStatus(closed),
    homeScore:
      event?.homeScore != null ? parseNum(event.homeScore) : undefined,
    awayScore:
      event?.awayScore != null ? parseNum(event.awayScore) : undefined,
  };
}

function resolveOrderQuestion(order: PolymarketBetOrderApiItem): string {
  return String(order.question ?? order.bet?.question ?? "").trim();
}

/** NOT_PLACED → 下单中；已 PLACED 且未结算 → 进行中 */
export function resolveHoldingPositionStatus(
  placedStatus: string,
): WorldCupHoldingStatus {
  if (placedStatus === "NOT_PLACED" || placedStatus === "FAILED") {
    return "ordering";
  }
  return "ongoing";
}

function buildBaseOrderFields(order: PolymarketBetOrderApiItem) {
  const eventSnapshot = resolveOrderEventSnapshot(order);
  const question = resolveOrderQuestion(order);

  return {
    eventSnapshot,
    question,
    side: parseSide(order.side),
    selectedOutcome: resolveOutcomeSide(
      question,
      eventSnapshot.homeTeam,
      eventSnapshot.awayTeam,
    ),
    betPrice: parseNum(order.betPrice),
    stakeAmount: parseNum(order.actualUsdt, parseNum(order.usdt)),
    stakeAul: parseNum(order.aul),
    betAt: order.createdAt ? String(order.createdAt) : undefined,
  };
}

export function normalizePolymarketHoldingOrder(
  raw: unknown,
): WorldCupHoldingItem | null {
  if (!raw || typeof raw !== "object") return null;

  const order = raw as PolymarketBetOrderApiItem;
  const id = parseId(order.id);
  if (id <= 0) return null;

  const { eventSnapshot, question, side, selectedOutcome, betPrice, stakeAmount, stakeAul, betAt } =
    buildBaseOrderFields(order);
  if (!eventSnapshot.title && !question) return null;

  return {
    id,
    category: DEFAULT_CATEGORY,
    listType: "holding",
    gameId: eventSnapshot.gameId,
    title: eventSnapshot.title,
    homeTeam: eventSnapshot.homeTeam,
    awayTeam: eventSnapshot.awayTeam,
    endDate: eventSnapshot.endDate,
    icon: eventSnapshot.icon,
    eventStatus: eventSnapshot.eventStatus,
    homeScore: eventSnapshot.homeScore,
    awayScore: eventSnapshot.awayScore,
    question,
    side,
    selectedOutcome,
    betPrice,
    payStatus: String(order.payStatus ?? "").trim() || "--",
    stakeAmount,
    stakeCurrency: "USDT",
    stakeAul,
    betAt,
    estimatedProfit: parseNum(order.netPayoutUsdt),
    profitCurrency: "USDT",
  };
}

export function normalizePolymarketHistoryOrder(
  raw: unknown,
): WorldCupHistoryItem | null {
  if (!raw || typeof raw !== "object") return null;

  const order = raw as PolymarketBetOrderApiItem;
  const id = parseId(order.id);
  if (id <= 0) return null;

  const { eventSnapshot, question, side, selectedOutcome, betPrice, stakeAmount, stakeAul, betAt } =
    buildBaseOrderFields(order);
  if (!eventSnapshot.title && !question) return null;

  const payoutAul = parseNum(order.payoutAul);
  const win = order.win != null ? String(order.win) : null;

  return {
    id,
    category: DEFAULT_CATEGORY,
    listType: "history",
    gameId: eventSnapshot.gameId,
    title: eventSnapshot.title,
    homeTeam: eventSnapshot.homeTeam,
    awayTeam: eventSnapshot.awayTeam,
    endDate: eventSnapshot.endDate,
    icon: eventSnapshot.icon,
    eventStatus: eventSnapshot.eventStatus,
    homeScore: eventSnapshot.homeScore,
    awayScore: eventSnapshot.awayScore,
    question,
    side,
    selectedOutcome,
    betPrice,
    stakeAmount,
    stakeCurrency: "USDT",
    stakeAul,
    betAt,
    netPayoutUsdt: parseNum(order.netPayoutUsdt),
    payoutAulPrice: parseNum(order.payoutAulPrice),
    win,
    settlementAul: payoutAul,
    settledAt: order.settledAt ? String(order.settledAt) : undefined,
  };
}
