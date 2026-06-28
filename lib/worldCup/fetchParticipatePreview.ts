import { previewWorldCupParticipate } from "@/lib/api/worldCup";
import type {
  WorldCupParticipatePreviewParams,
  WorldCupParticipatePreviewResult,
  WorldCupParticipateStance,
} from "./participateTypes";

function parseNum(value: unknown, fallback = 0): number {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

function normalizePreviewResult(raw: unknown): WorldCupParticipatePreviewResult {
  const data = (raw as { data?: unknown })?.data ?? raw;
  const payload = (data ?? {}) as Record<string, unknown>;

  return {
    usdtAmount: parseNum(payload.usdtAmount),
    fee: parseNum(payload.fee),
    actualUsdt: parseNum(payload.actualUsdt),
    betRate: parseNum(payload.betRate),
    xCoinPrice: parseNum(payload.xCoinPrice),
    requiredAul: parseNum(payload.requiredAul),
    netPayoutUsdt: parseNum(payload.netPayoutUsdt),
    maxBetAmount: parseNum(payload.maxBetAmount),
  };
}

/** 下注预览 — POST /api/polymarket/bet/preview */
export async function fetchWorldCupParticipatePreview(
  params: WorldCupParticipatePreviewParams,
): Promise<WorldCupParticipatePreviewResult> {
  const response = await previewWorldCupParticipate({
    betId: params.betId,
    side: params.side as WorldCupParticipateStance,
    usdtAmount: params.usdtAmount,
  });
  return normalizePreviewResult(response);
}

export function resolvePreviewFeeAul(preview: WorldCupParticipatePreviewResult) {
  if (preview.xCoinPrice <= 0) return 0;
  return preview.fee / preview.xCoinPrice;
}
