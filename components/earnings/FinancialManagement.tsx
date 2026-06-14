"use client";

import React from "react";
import { AppImage } from "@/components/AppImage";
import { entrustAssets } from "@/components/entrust/assets";
import {
  bottomSheetOverlayFrame,
  bottomSheetOverlayRoot,
} from "@/lib/mobileShell";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { useEntrustUiStore, useUserInfoStore } from "@/lib/store";
import {
  deployStake,
  getStakeDeployMinePreview,
  getStakePlans,
  getUserAssets,
} from "@/lib/api/users";
import {
  parseAmountInput,
  toPlanLimits,
  validateMineStakePreview,
} from "@/lib/stakeAmountValidation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error) {
    const e = error as Error & { shortMessage?: string };
    return e.shortMessage || e.message || fallback;
  }
  return fallback;
}

type StakePlan = {
  id: number;
  name: string;
  planImageUrl: string;
  planIntro: string;
  displayApr: string;
  displayAprMin: number;
  displayAprMax: number;
  periodDays: number;
  minAmount?: number;
  maxAmount?: number;
  dailyStakeLimit?: number;
  accountMaxAmount?: number;
  apr: number;
  status?: number;
  planType?: number;
};

export type DeployStrategy = {
  id: number;
  iconSrc: string;
  iconSize?: number;
  title: string;
  description: string;
  apr: string;
  aprEstimate: string;
  period: string;
  periodDays: number;
  minAmount?: number;
  maxAmount?: number;
  dailyStakeLimit?: number;
  accountMaxAmount?: number;
};

export type FinancialManagementProps = {
  open: boolean;
  onClose: () => void;
};

const CUSTODY_ASSET = "USDT";

function toDeployStrategy(plan: StakePlan): DeployStrategy {
  const aprEstimate =
    plan.displayApr ||
    (plan.displayAprMin != null && plan.displayAprMax != null
      ? `${plan.displayAprMin}%-${plan.displayAprMax}%`
      : "");

  return {
    id: plan.id,
    iconSrc: plan.planImageUrl || entrustAssets.strategyTrend,
    title: plan.name || "",
    description: plan.planIntro || "",
    apr: plan.apr != null ? String(plan.apr) : "",
    aprEstimate,
    period: plan.periodDays != null ? String(plan.periodDays) : "",
    periodDays: plan.periodDays ?? 0,
    minAmount: plan.minAmount ?? 0,
    maxAmount: plan.maxAmount ?? 0,
    dailyStakeLimit: plan.dailyStakeLimit ?? 0,
    accountMaxAmount: plan.accountMaxAmount ?? 0,
  };
}

function SheetRow({
  label,
  value,
  className = "",
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div
      className={`flex items-center justify-between text-sm leading-normal text-[#333] ${className}`}
    >
      <span>{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function SelectChevron({ open }: { open?: boolean }) {
  return (
    <svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className={`size-6 shrink-0 transition-transform duration-200 ${
        open ? "rotate-180" : ""
      }`}
    >
      <path
        d="M7 10l5 5 5-5"
        stroke="#333"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SelectField({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-[50px] w-full items-center justify-between rounded-[8px] bg-white/70 px-4 text-left">
      {children}
      <SelectChevron />
    </div>
  );
}

export function FinancialManagement({
  open,
  onClose,
}: FinancialManagementProps) {
  const { t: rawT, locale } = useTranslation();
  const t: (key: string, params?: Record<string, string | number>) => string =
    rawT;
  const walletAddress = useUserInfoStore(
    (state) => state.userInfo.walletAddress,
  );
  const isWalletConnected = Boolean(walletAddress);
  const [entered, setEntered] = React.useState(false);
  const [amount, setAmount] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isPreviewValidating, setIsPreviewValidating] = React.useState(false);
  const [selectedStrategy, setSelectedStrategy] =
    React.useState<DeployStrategy | null>(null);

  const opFailed: string = t("common.operationFailed");
  const queryClient = useQueryClient();
  const router = useRouter();
  const requestOpenAIStrategy = useEntrustUiStore(
    (state) => state.requestOpenAIStrategy,
  );

  const closeSheet = React.useCallback(
    (afterClose?: () => void) => {
      setEntered(false);
      window.setTimeout(() => {
        onClose();
        afterClose?.();
      }, 300);
    },
    [onClose],
  );

  const { data: stakePlansResponse, isPending: plansPending } = useQuery({
    queryKey: ["stakePlans", 2, locale],
    queryFn: () =>
      getStakePlans({
        page: 0,
        limit: undefined,
        searchCount: false,
        lastId: undefined,
        name: undefined,
        status: 1,
        planType: 2,
      }),
    enabled: open,
  });

  const strategies = React.useMemo(() => {
    const raw = stakePlansResponse?.data;
    if (!Array.isArray(raw)) return [];
    return raw
      .filter((plan) => {
        const item = plan as StakePlan;
        const statusOk = item.status === undefined || item.status === 1;
        const typeOk = item.planType === undefined || item.planType === 2;
        return statusOk && typeOk;
      })
      .map((plan) => toDeployStrategy(plan as StakePlan));
  }, [stakePlansResponse]);

  const { data: userAssetsResponse, isPending: userAssetsPending } = useQuery(
    {
      queryKey: ["userAssets", walletAddress],
      queryFn: () => getUserAssets(),
      enabled: open && Boolean(walletAddress),
    },
  );

  const stakeUsdtIncomeBalance = React.useMemo(() => {
    const num = Number(userAssetsResponse?.data?.stakeUsdtIncome ?? 0);
    return Number.isFinite(num) ? num : 0;
  }, [userAssetsResponse]);

  const availableBalance = React.useMemo(() => {
    return stakeUsdtIncomeBalance.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }, [stakeUsdtIncomeBalance]);

  React.useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeSheet();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, closeSheet]);

  React.useEffect(() => {
    if (!open) {
      setEntered(false);
      setAmount("");
      setSelectedStrategy(null);
      setIsSubmitting(false);
      setIsPreviewValidating(false);
      return;
    }
    const frame = requestAnimationFrame(() => {
      requestAnimationFrame(() => setEntered(true));
    });
    return () => cancelAnimationFrame(frame);
  }, [open]);

  React.useEffect(() => {
    if (!open || strategies.length === 0) return;
    setSelectedStrategy((prev) => {
      if (prev && strategies.some((item) => item.id === prev.id)) return prev;
      return strategies[0];
    });
  }, [open, strategies]);

  const handleMax = () => {
    if (userAssetsPending || isSubmitting) return;
    if (stakeUsdtIncomeBalance <= 0) return;
    setAmount(String(stakeUsdtIncomeBalance));
  };

  const handleLaunch = async () => {
    if (!isWalletConnected) {
      toast.success(t("entrust.deployConnectWalletFirst"));
      return;
    }
    if (
      plansPending ||
      userAssetsPending ||
      isSubmitting ||
      isPreviewValidating ||
      !selectedStrategy
    ) {
      return;
    }

    const trimmed = amount.trim();
    const parsedAmount = parseAmountInput(trimmed);
    if (parsedAmount == null) {
      toast.error(t("entrust.deployInvalidAmount"));
      return;
    }

    if (parsedAmount > stakeUsdtIncomeBalance) {
      toast.error(t("entrust.deployInsufficientBalance"));
      return;
    }

    setIsPreviewValidating(true);
    const previewValidation = await validateMineStakePreview(
      selectedStrategy.id,
      parsedAmount,
      toPlanLimits(selectedStrategy),
      t,
      opFailed,
      getStakeDeployMinePreview,
    );
    setIsPreviewValidating(false);
    if (!previewValidation.ok) {
      toast.error(previewValidation.message);
      return;
    }

    setIsSubmitting(true);
    try {
      await deployStake({
        planId: selectedStrategy.id,
        amount: parsedAmount,
      });
      await queryClient.invalidateQueries({
        queryKey: ["userAssets", walletAddress],
      });
      toast.success(t("entrust.deploySuccess"));
      setAmount("");
      closeSheet(() => {
        requestOpenAIStrategy();
        router.push("/");
      });
    } catch (error) {
      toast.error(getErrorMessage(error, opFailed));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!open) return null;

  const periodLabel = selectedStrategy
    ? `${selectedStrategy.period}${t("entrust.periodUnit")}`
    : "—";

  const displayBalance = userAssetsPending
    ? t("common.loadingDots")
    : availableBalance;

  const launchButtonLabel = !isWalletConnected
    ? t("entrust.deployConnectWalletFirst")
    : isSubmitting
      ? t("earnings.waitingConfirm")
      : isPreviewValidating
        ? t("common.loadingDots")
        : t("entrust.start");

  return (
    <div
      className={`${bottomSheetOverlayRoot} z-70`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="financial-management-sheet-title"
    >
      <div className={bottomSheetOverlayFrame}>
        <button
          type="button"
          aria-label={t("common.close")}
          className={`absolute inset-0 bg-black/50 backdrop-blur-[6px] transition-opacity duration-300 ease-out ${
            entered ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => closeSheet()}
        />
        <div
          className={`relative flex max-h-[min(602px,92dvh)] w-full flex-col overflow-hidden rounded-t-[12px] bg-white/90 shadow-[0_-12px_40px_rgba(0,0,0,0.15)] backdrop-blur-[6px] transition-transform duration-300 ease-out ${
            entered ? "translate-y-0" : "translate-y-full"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-3 pb-3 pt-5">
            <h2
              id="financial-management-sheet-title"
              className="text-center text-lg font-semibold uppercase leading-normal text-[#333]"
            >
              {t("entrust.deployAgentTitle")}
            </h2>

            <div className="mt-4 flex items-center gap-[3px]">
              <AppImage
                src={selectedStrategy?.iconSrc ?? entrustAssets.strategyTrend}
                alt=""
                width={22}
                height={22}
                className="size-[22px] shrink-0 object-contain"
              />
              <span className="text-base font-semibold leading-[22px] text-[#333]">
                {t("entrust.deployAgentStrategySection")}
              </span>
            </div>

            <div className="mt-3">
              {plansPending || !selectedStrategy ? (
                <div className="flex h-[50px] items-center justify-center rounded-[8px] bg-white/70 text-sm text-black/50">
                  {t("common.loading")}
                </div>
              ) : (
                <div className="flex h-[50px] w-full items-center rounded-[8px] bg-white/70 px-4">
                  <span className="text-base font-semibold text-[#333]">
                    {selectedStrategy.title}
                  </span>
                </div>
              )}
            </div>

            <div className="mt-3 rounded-[8px] bg-white/70 px-4 py-3">
              <div className="flex flex-col gap-4">
                <SheetRow
                  label={t("entrust.deployAgentLabel")}
                  value={selectedStrategy?.title ?? "—"}
                />
                <SheetRow
                  label={t("entrust.deployCyclePeriod")}
                  value={periodLabel}
                />
                <SheetRow
                  label={t("entrust.deployEstimatedApr")}
                  value={selectedStrategy?.aprEstimate ?? "—"}
                />
              </div>
            </div>

            <p className="mt-4 text-base font-medium text-[#333]">
              {t("entrust.deployCustodyAsset")}
            </p>
            <div className="mt-1.5">
              <SelectField>
                <span className="flex items-center gap-1.5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={entrustAssets.deployUsdtIcon}
                    alt=""
                    width={22}
                    height={22}
                    className="size-[22px] shrink-0 rounded-full object-contain"
                  />
                  <span className="text-base text-[#333]">{CUSTODY_ASSET}</span>
                </span>
              </SelectField>
            </div>

            <p className="mt-4 text-base font-medium text-[#333]">
              {t("entrust.deployCustodyAmount")}
            </p>
            <div className="mt-1.5 flex h-[50px] w-full items-stretch rounded-[8px] bg-white/70 px-4">
              <input
                type="text"
                inputMode="decimal"
                placeholder={t("entrust.deployAmountPlaceholder")}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="min-w-0 flex-1 self-stretch border-0 bg-transparent py-0 text-base leading-normal text-[#333] placeholder:text-[rgba(51,51,51,0.3)] outline-none"
              />
              <div className="flex shrink-0 items-center gap-3 text-base">
                <span className="text-[#333]">{CUSTODY_ASSET}</span>
                <button
                  type="button"
                  onClick={handleMax}
                  className="font-medium text-[#143fff]"
                >
                  {t("entrust.deployMax")}
                </button>
              </div>
            </div>
            <p className="mt-3 text-xs leading-[19px] text-[#333]">
              {t("entrust.deployAvailableBalance", {
                balance: displayBalance,
                asset: CUSTODY_ASSET,
              })}
            </p>
          </div>

          <div className="shrink-0 px-3 pb-[max(env(safe-area-inset-bottom),16px)] pt-2">
            <button
              type="button"
              onClick={() => void handleLaunch()}
              disabled={
                isWalletConnected &&
                (plansPending ||
                  userAssetsPending ||
                  isSubmitting ||
                  isPreviewValidating ||
                  !selectedStrategy)
              }
              className="relative mx-auto flex h-[58px] w-full max-w-[308px] items-center justify-center overflow-hidden rounded-[33px] border border-white px-[10px] shadow-[0_4px_6px_rgba(213,0,0,0.12)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-[33px] bg-gradient-to-r from-[#ff4d00] via-[#ff3033] via-[53.846%] to-[#e90000]"
              />
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0px_-4px_4px_0px_rgba(255,254,227,0.7),inset_0px_8px_17px_0px_#ffe5e5]"
              />
              <span className="relative text-base font-semibold text-white [text-shadow:0_1px_3px_rgba(94,44,44,0.25)]">
                {launchButtonLabel}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
