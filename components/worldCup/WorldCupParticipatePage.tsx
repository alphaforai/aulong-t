"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import AulongHeader from "@/components/AulongHeader";
import { AppImage } from "@/components/AppImage";
import { formatAmount } from "@/components/team/format";
import { teamAssets } from "@/components/team/assets";
import { getUserAssets } from "@/lib/api/users";
import { useWorldCupTranslation } from "@/lib/worldCup/useWorldCupTranslation";
import { stackY3 } from "@/lib/mobileCompat";
import { useUserInfoStore } from "@/lib/store/userInfo";
import { fetchWorldCupPredictionDetail, WorldCupNoBetMarketsError } from "@/lib/worldCup/fetchPredictionDetail";
import {
  fetchWorldCupParticipatePreview,
  resolvePreviewFeeAul,
} from "@/lib/worldCup/fetchParticipatePreview";
import { getWorldCupErrorMessage } from "@/lib/worldCup/getErrorMessage";
import { marketOddsPercent } from "@/lib/worldCup/normalizeMarkets";
import { readCachedParticipateEvent } from "@/lib/worldCup/participateEventCache";
import { parseOutcomeParam } from "@/lib/worldCup/participateUrl";
import { fetchWorldCupParticipateSubmit } from "@/lib/worldCup/submitParticipate";
import type { WorldCupParticipateSubmitResult } from "@/lib/worldCup/participateTypes";
import { canParticipateInDetail } from "@/lib/worldCup/types";
import { formatUtcMatchTime } from "@/lib/worldCup/utcDate";
import { WorldCupParticipateSuccess } from "./WorldCupParticipateSuccess";

const GRADIENT_BTN =
  "relative overflow-hidden rounded-[33px] border border-white shadow-[0_4px_6px_rgba(213,0,0,0.12)]";
const GRADIENT_FILL =
  "pointer-events-none absolute top-0 right-0 bottom-0 left-0 rounded-[33px] bg-gradient-to-r from-[#ff4d00] via-[#ff3033] to-[#e90000]";
const GRADIENT_FILL_DISABLED =
  "pointer-events-none absolute top-0 right-0 bottom-0 left-0 rounded-[33px] bg-[rgba(199,199,199,0.69)]";
const GRADIENT_INSET =
  "pointer-events-none absolute top-0 right-0 bottom-0 left-0 rounded-[inherit] shadow-[inset_0px_-4px_4px_0px_rgba(255,254,227,0.7),inset_0px_8px_17px_0px_#ffe5e5]";

const QUICK_ADD_AMOUNTS = [1, 5, 10, 50, 100] as const;
const PREVIEW_DEBOUNCE_MS = 300;

/** YES = 押该选项发生；NO = 押不发生，展示互补概率 */
type ParticipateStance = "yes" | "no";

function parseAmountInput(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return 0;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
}

type ParticipateSuccessState = WorldCupParticipateSubmitResult;

function QuestionOption({
  question,
  selected,
  onSelect,
}: {
  question: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={`flex w-full items-start rounded-[10px] border px-3 py-2.5 text-left touch-manipulation ${
        selected
          ? "border-[#ffd6d8] bg-[#fff1f2]"
          : "border-[#f0f1f3] bg-[#f8f8f8]"
      }`}
    >
      <span
        className={`mt-0.5 mr-2.5 flex size-4 shrink-0 items-center justify-center rounded-full border ${
          selected ? "border-[#f0181e]" : "border-[#c7c7c7]"
        }`}
        aria-hidden
      >
        {selected ? (
          <span className="size-2 rounded-full bg-[#f0181e]" />
        ) : null}
      </span>
      <span
        className={`min-w-0 flex-1 text-sm leading-snug ${
          selected ? "font-bold text-[#1a1a1a]" : "text-[#333]"
        }`}
      >
        {question}
      </span>
    </button>
  );
}

const STANCE_YES_BG = "#2A9D6E";
const STANCE_NO_BG = "#f0181e";

function StanceCell({
  label,
  percent,
  selected,
  variant,
  onSelect,
}: {
  label: string;
  percent: number;
  selected: boolean;
  variant: "yes" | "no";
  onSelect: () => void;
}) {
  const activeBg = variant === "yes" ? STANCE_YES_BG : STANCE_NO_BG;

  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className="flex h-[60px] min-w-0 flex-1 flex-col items-center justify-center rounded-[10px] border border-transparent px-2 py-3 touch-manipulation"
      style={
        selected
          ? { backgroundColor: activeBg, color: "#fff" }
          : { backgroundColor: "#f4f4f4", color: "#333" }
      }
    >
      <span className="text-xs font-bold">{label}</span>
      <span className="mt-2.5 text-lg font-bold">{percent.toFixed(1)}%</span>
    </button>
  );
}

function SummaryRow({
  label,
  value,
  valueClassName = "text-[#1a1a1a]",
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="flex items-center justify-between border-b border-[#f0f1f3] pb-2.5 pt-0 first:pt-0">
      <span className="text-sm text-[#5c5c5c]">{label}</span>
      <span className={`text-right text-sm font-bold ${valueClassName}`}>
        {value}
      </span>
    </div>
  );
}

type WorldCupParticipatePageProps = {
  /** 路由参数：列表项 gameId */
  matchId: string;
};

/**
 * 参与预测下注页 — Figma 1380-15526
 *
 * 流程：列表「参与预测」→ 选赛果 / YES·NO / 输入 USDT → 提交 → 同页成功态（1380-13958）
 * 选项：URL ?outcome= 优先；列表未选时默认主胜 home
 * 可用余额：/api/user/assets → xCoinBalance
 */
export function WorldCupParticipatePage({ matchId }: WorldCupParticipatePageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, locale } = useWorldCupTranslation();
  const walletAddress = useUserInfoStore((state) => state.userInfo.walletAddress);

  const gameId = matchId.trim();
  const idValid = gameId.length > 0;
  const initialOutcome = parseOutcomeParam(searchParams.get("outcome"));
  const cachedEvent = useMemo(
    () => (idValid ? readCachedParticipateEvent(gameId) : null),
    [gameId, idValid],
  );

  // 表单状态；提交成功后 successData 非空则切换为成功视图
  const [selectedBetId, setSelectedBetId] = useState<number | null>(null);
  const [stance, setStance] = useState<ParticipateStance>("yes");
  const [amountInput, setAmountInput] = useState("");
  const [activeQuickAdd, setActiveQuickAdd] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successData, setSuccessData] = useState<ParticipateSuccessState | null>(
    null,
  );
  const [debouncedAmountUsdt, setDebouncedAmountUsdt] = useState(0);

  const {
    data: item,
    isPending,
    isError,
    error,
  } = useQuery({
    queryKey: ["worldCupPredictionDetail", locale, gameId],
    queryFn: () => fetchWorldCupPredictionDetail(gameId, cachedEvent),
    enabled: idValid,
  });

  useEffect(() => {
    if (!item?.betList.length) return;
    setSelectedBetId((prev) => {
      if (prev != null && item.betList.some((bet) => bet.id === prev)) {
        return prev;
      }
      const fromOutcome = initialOutcome
        ? item.markets[initialOutcome]
        : undefined;
      return fromOutcome?.id ?? item.betList[0].id;
    });
  }, [item, initialOutcome]);

  const detailErrorMessage = useMemo(() => {
    if (error instanceof WorldCupNoBetMarketsError) {
      return t("worldCup.noBetMarkets");
    }
    return getWorldCupErrorMessage(error, t("worldCup.detailNotFound"));
  }, [error, t]);

  const detailErrorToastRef = useRef<string | null>(null);
  useEffect(() => {
    if (!isError) {
      detailErrorToastRef.current = null;
      return;
    }
    if (detailErrorToastRef.current === detailErrorMessage) return;
    detailErrorToastRef.current = detailErrorMessage;
    toast.error(detailErrorMessage);
  }, [detailErrorMessage, isError]);

  const { data: assetsResponse } = useQuery({
    queryKey: ["userAssets", walletAddress],
    queryFn: () => getUserAssets(),
    enabled: Boolean(walletAddress),
  });

  const availableAul = Number(assetsResponse?.data?.xCoinBalance ?? 0);

  const selectedMarket = useMemo(
    () => item?.betList.find((bet) => bet.id === selectedBetId),
    [item?.betList, selectedBetId],
  );

  const amountUsdt = parseAmountInput(amountInput);
  const previewSide = stance === "yes" ? "YES" : "NO";

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedAmountUsdt(amountUsdt);
    }, PREVIEW_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [amountUsdt]);

  const previewEnabled = Boolean(
    item && selectedBetId && debouncedAmountUsdt > 0 && !successData,
  );

  const { data: preview, isFetching: isPreviewFetching } = useQuery({
    queryKey: [
      "worldCupBetPreview",
      selectedBetId,
      previewSide,
      debouncedAmountUsdt,
    ],
    queryFn: () =>
      fetchWorldCupParticipatePreview({
        betId: selectedBetId!,
        side: previewSide,
        usdtAmount: debouncedAmountUsdt,
      }),
    enabled: previewEnabled,
  });

  const minBetAmount = item?.minBetAmount ?? 5;
  const maxBetAmount =
    preview?.maxBetAmount && preview.maxBetAmount > 0
      ? preview.maxBetAmount
      : item?.maxBetAmount ?? 10000;

  const activePercent = useMemo(() => {
    if (!selectedMarket) return 100;
    return marketOddsPercent(selectedMarket, stance);
  }, [selectedMarket, stance]);

  const amountOutOfRange = useMemo(() => {
    if (!item || amountUsdt <= 0) return false;
    return amountUsdt < minBetAmount || amountUsdt > maxBetAmount;
  }, [amountUsdt, item, maxBetAmount, minBetAmount]);

  const summaryAulPrice = preview?.xCoinPrice ?? 0;
  const summaryRequiredAul = preview?.requiredAul ?? 0;
  const summaryExpectedWin = preview?.netPayoutUsdt ?? 0;
  const summaryFeeAul = preview ? resolvePreviewFeeAul(preview) : 0;

  const amountSynced = debouncedAmountUsdt === amountUsdt;

  const previewPending =
    amountUsdt > 0 &&
    (!amountSynced || isPreviewFetching || (previewEnabled && !preview));

  const insufficientBalance =
    amountUsdt > 0 &&
    preview != null &&
    preview.requiredAul > availableAul;

  const canSubmit =
    Boolean(
      item &&
        canParticipateInDetail(item) &&
        amountUsdt > 0 &&
        !amountOutOfRange &&
        !insufficientBalance &&
        !previewPending &&
        selectedMarket,
    ) &&
    !isSubmitting &&
    !successData;

  const handleBack = useCallback(() => {
    // 成功态返回列表，避免回到已提交的表单
    if (successData) {
      router.replace("/world-cup");
      return;
    }
    router.back();
  }, [router, successData]);

  const handleQuickAdd = useCallback((delta: number) => {
    setActiveQuickAdd(delta);
    setAmountInput((prev) => {
      const current = parseAmountInput(prev);
      return String(current + delta);
    });
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!item || !selectedMarket) {
      toast.info(t("worldCup.selectOutcomeFirst"));
      return;
    }
    if (amountUsdt <= 0) {
      toast.info(t("worldCup.enterAmountFirst"));
      return;
    }
    if (amountUsdt < minBetAmount) {
      toast.info(
        t("worldCup.amountBelowMin", { min: formatAmount(minBetAmount) }),
      );
      return;
    }
    if (amountUsdt > maxBetAmount) {
      toast.info(
        t("worldCup.amountAboveMax", { max: formatAmount(maxBetAmount) }),
      );
      return;
    }
    if (insufficientBalance) {
      toast.info(t("worldCup.insufficientAul"));
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await fetchWorldCupParticipateSubmit({
        betId: String(selectedMarket.id),
        side: stance === "yes" ? "YES" : "NO",
        usdtAmount: amountUsdt,
      });

      setSuccessData(result);
    } catch (submitError) {
      toast.error(
        getWorldCupErrorMessage(submitError, t("worldCup.submitFailed")),
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [
    amountUsdt,
    insufficientBalance,
    item,
    maxBetAmount,
    minBetAmount,
    selectedMarket,
    stance,
    t,
  ]);

  const listContent = useMemo(() => {
    if (successData) {
      return (
        <WorldCupParticipateSuccess order={successData} t={t} />
      );
    }

    if (!idValid) {
      return (
        <p className="py-8 text-center text-sm text-[#707070]">
          {t("worldCup.detailNotFound")}
        </p>
      );
    }
    if (isPending) {
      return (
        <p className="py-8 text-center text-sm text-[#707070]">
          {t("common.loading")}
        </p>
      );
    }
    if (isError) {
      return (
        <p className="py-8 text-center text-sm text-[#707070]">
          {detailErrorMessage}
        </p>
      );
    }
    if (!item) {
      return (
        <p className="py-8 text-center text-sm text-[#707070]">
          {t("worldCup.detailNotFound")}
        </p>
      );
    }

    return (
      <>
        <article className="w-full rounded-[12px] border border-[#f0f1f3] bg-white p-[15px] shadow-[0_10px_14px_rgba(17,24,39,0.08)]">
          <div className="flex items-start gap-2">
            {item.icon ? (
              <AppImage
                src={item.icon}
                alt=""
                width={32}
                height={32}
                className="size-8 shrink-0 rounded object-cover"
              />
            ) : null}
            <div className="min-w-0 flex-1">
              <h3 className="text-base font-extrabold leading-snug text-[#1a1a1a]">
                {item.title}
              </h3>
              <p className="mt-0.5 truncate text-xs leading-none text-[#949494]">
                {formatUtcMatchTime(item.endDate)}
              </p>
            </div>
          </div>

          <div
            className="mt-3.5 flex flex-col gap-2"
            role="radiogroup"
            aria-label={t("worldCup.outcomeGroupAria")}
          >
            {item.betList.map((bet) => (
              <QuestionOption
                key={bet.id}
                question={bet.question}
                selected={selectedBetId === bet.id}
                onSelect={() => setSelectedBetId(bet.id)}
              />
            ))}
          </div>

          <div
            className="mt-3 flex gap-3"
            role="radiogroup"
            aria-label={t("worldCup.stanceGroupAria")}
          >
            <StanceCell
              label={t("worldCup.outcomeYes")}
              percent={
                selectedMarket
                  ? marketOddsPercent(selectedMarket, "yes")
                  : 0
              }
              selected={stance === "yes"}
              variant="yes"
              onSelect={() => setStance("yes")}
            />
            <StanceCell
              label={t("worldCup.outcomeNo")}
              percent={
                selectedMarket
                  ? marketOddsPercent(selectedMarket, "no")
                  : 0
              }
              selected={stance === "no"}
              variant="no"
              onSelect={() => setStance("no")}
            />
          </div>
        </article>

        <article className="w-full rounded-[12px] border border-[#f0f1f3] bg-white p-[15px]">
          <p className="text-sm text-[#5c5c5c]">{t("worldCup.inputAmountUsdt")}</p>

          <div className="mt-3 flex items-center justify-between">
            <input
              type="text"
              inputMode="decimal"
              value={amountInput}
              onChange={(e) => {
                setActiveQuickAdd(null);
                setAmountInput(e.target.value.replace(/[^\d.]/g, ""));
              }}
              className="min-w-0 flex-1 border-0 bg-transparent text-[30px] font-black leading-none text-[#1a1a1a] outline-none"
              aria-label={t("worldCup.inputAmountUsdt")}
            />
            <span className="shrink-0 text-sm font-bold text-[#707070]">USDT</span>
          </div>

          <div className="mt-3 border-t border-[#f0f1f3] pt-2">
            {insufficientBalance ? (
              <p className="text-xs text-[#e84040]">{t("worldCup.insufficientAul")}</p>
            ) : null}
            {amountOutOfRange ? (
              <p className="text-xs text-[#e84040]">
                {t("worldCup.betAmountRange", {
                  min: formatAmount(minBetAmount),
                  max: formatAmount(maxBetAmount),
                })}
              </p>
            ) : null}
          </div>

          <div className="mt-2.5 flex space-x-2">
            {QUICK_ADD_AMOUNTS.map((delta) => {
              const selected = activeQuickAdd === delta;
              return (
                <button
                  key={delta}
                  type="button"
                  onClick={() => handleQuickAdd(delta)}
                  className={`flex h-[30px] w-[58px] shrink-0 items-center justify-center rounded-[14px] border text-xs touch-manipulation ${
                    selected
                      ? "border-[#ffd6d8] bg-[#fff1f2] text-[#f0181e]"
                      : "border-[#f0f1f3] bg-[#f8f8f8] text-[#5c5c5c]"
                  }`}
                >
                  +{delta}
                </button>
              );
            })}
          </div>

          <p className="mt-2 text-sm text-[#5c5c5c]">
            {t("worldCup.betAmountRange", {
              min: formatAmount(minBetAmount),
              max: formatAmount(maxBetAmount),
            })}
          </p>
          <p className="mt-1 text-sm text-[#5c5c5c]">
            {t("worldCup.availableBalance", {
              balance: formatAmount(availableAul),
            })}
          </p>
        </article>

        <article className="w-full rounded-[12px] border border-[#f0f1f3] bg-white p-[15px] shadow-[0_10px_14px_rgba(17,24,39,0.08)]">
          <div className="flex flex-col space-y-2.5">
            <SummaryRow
              label={t("worldCup.currentAulPrice")}
              value={`${formatAmount(summaryAulPrice)} USDT/AUL`}
            />
            <SummaryRow
              label={t("worldCup.aulToDeduct")}
              value={`${formatAmount(summaryRequiredAul)} AUL`}
            />
            <SummaryRow
              label={t("worldCup.expectedWinUsdt")}
              value={`${formatAmount(summaryExpectedWin)} USDT`}
            />
            <SummaryRow
              label={t("worldCup.feeAul")}
              value={formatAmount(summaryFeeAul)}
              valueClassName="text-[#f0181e]"
            />
          </div>
        </article>

        <div className="flex justify-center pb-2">
          <button
            type="button"
            disabled={!canSubmit}
            onClick={handleSubmit}
            className={`${GRADIENT_BTN} flex h-14 w-full max-w-[320px] items-center justify-center text-base font-semibold text-white [text-shadow:0_1px_3px_rgba(94,44,44,0.25)] disabled:cursor-not-allowed`}
          >
            <span
              className={canSubmit ? GRADIENT_FILL : GRADIENT_FILL_DISABLED}
              aria-hidden
            />
            <span className={GRADIENT_INSET} aria-hidden />
            <span className="relative">
              {isSubmitting ? t("common.loading") : t("worldCup.participate")}
            </span>
          </button>
        </div>
      </>
    );
  }, [
    activeQuickAdd,
    amountOutOfRange,
    availableAul,
    canSubmit,
    handleQuickAdd,
    handleSubmit,
    detailErrorMessage,
    idValid,
    insufficientBalance,
    isError,
    isPending,
    item,
    maxBetAmount,
    minBetAmount,
    selectedBetId,
    selectedMarket,
    stance,
    summaryAulPrice,
    summaryExpectedWin,
    summaryFeeAul,
    summaryRequiredAul,
    amountInput,
    successData,
    t,
  ]);

  return (
    <div className="min-h-screen w-full bg-[#f8f8f8] md:py-8">
      <div className="relative mx-auto flex min-h-screen w-full max-w-[430px] flex-col bg-[#f8f8f8] md:min-h-[calc(100vh-4rem)] md:overflow-hidden md:rounded-2xl md:shadow-[0_4px_32px_rgba(0,0,0,0.08)]">
        <div className="relative z-[70] h-11 shrink-0 bg-white" aria-hidden />
        <div className="relative z-[70] shrink-0">
          <AulongHeader />
        </div>

        <header className="relative flex h-12 shrink-0 items-center justify-center px-3">
          <button
            type="button"
            aria-label={t("common.back")}
            onClick={handleBack}
            className="absolute left-3 flex size-6 items-center justify-center"
          >
            <AppImage
              src={teamAssets.directBack}
              alt=""
              width={16}
              height={16}
              className="size-4"
            />
          </button>
          <h1 className="text-lg font-medium leading-[26px] text-[#333]">
            {t("worldCup.pageTitle")}
          </h1>
        </header>

        <div className={`${stackY3} min-h-0 flex-1 overflow-y-auto px-3 pb-safe-compat`}>
          {listContent}
        </div>
      </div>
    </div>
  );
}
