export type StakeAmountLimits = {
  planId?: number;
  minAmount?: number;
  maxAmount?: number;
  dailyStakeLimit?: number;
  accountMaxAmount?: number;
};

type AmountLimitError = "belowMin" | "aboveMax" | "dailyLimit" | "accountMax";

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error) {
    const e = error as Error & { shortMessage?: string };
    return e.shortMessage || e.message || fallback;
  }
  return fallback;
}

export function formatUsdtLimit(value: unknown) {
  const num = Number(value);
  if (!Number.isFinite(num)) return "0";
  return num.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

export function parseAmountInput(trimmed: string): number | null {
  if (!trimmed || !/^\d+(\.\d+)?$/.test(trimmed)) return null;
  const num = Number(trimmed);
  if (!Number.isFinite(num) || num <= 0) return null;
  return num;
}

export function normalizeStakeLimits(
  raw: unknown,
): StakeAmountLimits | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  return raw as StakeAmountLimits;
}

export function extractLimitsFromError(
  error: unknown,
): StakeAmountLimits | undefined {
  if (!error || typeof error !== "object") return undefined;
  const payload = error as {
    data?: unknown;
    result?: { data?: unknown };
  };
  return (
    normalizeStakeLimits(payload.data) ??
    normalizeStakeLimits(payload.result?.data)
  );
}

export function toPlanLimits(input: {
  id: number;
  minAmount?: number;
  maxAmount?: number;
  dailyStakeLimit?: number;
  accountMaxAmount?: number;
}): StakeAmountLimits {
  return {
    planId: input.id,
    minAmount: input.minAmount ?? 0,
    maxAmount: input.maxAmount ?? 0,
    dailyStakeLimit: input.dailyStakeLimit ?? 0,
    accountMaxAmount: input.accountMaxAmount ?? 0,
  };
}

function getAmountLimitError(
  amount: number,
  limits: StakeAmountLimits | undefined,
): AmountLimitError | null {
  if (!limits) return null;

  const minAmount = Number(limits.minAmount ?? 0);
  const maxAmount = Number(limits.maxAmount ?? 0);
  const dailyStakeLimit = Number(limits.dailyStakeLimit ?? 0);
  const accountMaxAmount = Number(limits.accountMaxAmount ?? 0);

  if (minAmount > 0 && amount < minAmount) return "belowMin";
  if (maxAmount > 0 && amount > maxAmount) return "aboveMax";
  if (dailyStakeLimit > 0 && amount > dailyStakeLimit) return "dailyLimit";
  if (accountMaxAmount > 0 && amount > accountMaxAmount) return "accountMax";
  return null;
}

function getAmountLimitMessage(
  error: AmountLimitError,
  limits: StakeAmountLimits,
  t: (key: string, params?: Record<string, string | number>) => string,
) {
  switch (error) {
    case "belowMin":
      return t("entrust.deployBelowMinAmount", {
        min: formatUsdtLimit(limits.minAmount),
      });
    case "aboveMax":
      return t("entrust.deployAboveMaxAmount", {
        max: formatUsdtLimit(limits.maxAmount),
      });
    case "dailyLimit":
      return t("entrust.deployDailyStakeLimitExceeded", {
        limit: formatUsdtLimit(limits.dailyStakeLimit),
      });
    case "accountMax":
      return t("entrust.deployAccountMaxAmountExceeded", {
        limit: formatUsdtLimit(limits.accountMaxAmount),
      });
  }
}

function getValidationFailureMessage(
  amount: number,
  limits: StakeAmountLimits | undefined,
  t: (key: string, params?: Record<string, string | number>) => string,
) {
  const limitError = getAmountLimitError(amount, limits);
  if (!limitError || !limits) return null;
  return getAmountLimitMessage(limitError, limits, t);
}

export async function validateMineStakePreview(
  planId: number,
  amount: number,
  planLimits: StakeAmountLimits,
  t: (key: string, params?: Record<string, string | number>) => string,
  fallback: string,
  previewFn: (args: {
    planId: number;
    amount: number;
  }) => Promise<{ data?: unknown }>,
): Promise<{ ok: true } | { ok: false; message: string }> {
  try {
    const previewResponse = await previewFn({ planId, amount });
    const limits = normalizeStakeLimits(previewResponse?.data) ?? planLimits;
    const message = getValidationFailureMessage(amount, limits, t);
    if (message) return { ok: false, message };
    return { ok: true };
  } catch (error) {
    const limits = extractLimitsFromError(error) ?? planLimits;
    const message = getValidationFailureMessage(amount, limits, t);
    if (message) return { ok: false, message };
    return { ok: false, message: getErrorMessage(error, fallback) };
  }
}
