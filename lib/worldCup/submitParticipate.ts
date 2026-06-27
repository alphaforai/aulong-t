import { submitWorldCupParticipate } from "@/lib/api/worldCup";
import type {
  WorldCupParticipateStance,
  WorldCupParticipateSubmitParams,
  WorldCupParticipateSubmitResult,
} from "./participateTypes";

function parseNum(value: unknown, fallback = 0): number {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

function parseSide(value: unknown): WorldCupParticipateStance {
  return String(value).toUpperCase() === "NO" ? "NO" : "YES";
}

function normalizeSubmitResult(
  raw: unknown,
  fallback: WorldCupParticipateSubmitParams,
): WorldCupParticipateSubmitResult {
  const data = (raw as { data?: unknown })?.data ?? raw;
  const payload = (data ?? {}) as Record<string, unknown>;

  return {
    orderId: parseNum(payload.orderId),
    title: String(payload.title ?? ""),
    question: String(payload.question ?? ""),
    usdt: parseNum(payload.usdt, fallback.usdtAmount),
    actualUsdt: parseNum(payload.actualUsdt, fallback.usdtAmount),
    fee: parseNum(payload.fee),
    side: parseSide(payload.side ?? fallback.side),
    betPrice: parseNum(payload.betPrice),
    aul: parseNum(payload.aul),
    aulPrice: parseNum(payload.aulPrice),
    payStatus: String(payload.payStatus ?? ""),
    placedStatus: String(payload.placedStatus ?? ""),
    status: String(payload.status ?? ""),
    netPayoutUsdt: parseNum(payload.netPayoutUsdt),
  };
}

/** 提交参与预测 — POST /api/polymarket/bet/place */
export async function fetchWorldCupParticipateSubmit(
  params: WorldCupParticipateSubmitParams,
): Promise<WorldCupParticipateSubmitResult> {
  const response = await submitWorldCupParticipate(params);
  return normalizeSubmitResult(response, params);
}
