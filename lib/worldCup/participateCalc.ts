/** 下注页费用摘要 */
export type ParticipateSummary = {
  aulPrice: number;
  aulRequired: number;
  expectedWinUsdt: number;
  feeAul: number;
  totalAulCost: number;
};

export function calcParticipateSummary({
  amountUsdt,
  aulPrice,
  stancePercent,
  feeRate = 0.05,
}: {
  amountUsdt: number;
  aulPrice: number;
  stancePercent: number;
  feeRate?: number;
}): ParticipateSummary {
  const safeAmount = Math.max(0, amountUsdt);
  const safePrice = aulPrice > 0 ? aulPrice : 1;
  const safePercent = stancePercent > 0 ? stancePercent : 1;
  const safeFeeRate = feeRate >= 0 ? feeRate : 0;

  const aulRequired = safeAmount / safePrice;
  const expectedWinUsdt = safeAmount / (safePercent / 100);
  const feeAul = aulRequired * safeFeeRate;
  const totalAulCost = aulRequired + feeAul;

  return {
    aulPrice: safePrice,
    aulRequired,
    expectedWinUsdt,
    feeAul,
    totalAulCost,
  };
}
