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
import { getXcoinPrice } from "@/lib/api/users";
import { useWorldCupTranslation } from "@/lib/worldCup/useWorldCupTranslation";
import { stackY3 } from "@/lib/mobileCompat";
import { useUserInfoStore } from "@/lib/store/userInfo";
import { fetchWorldCupPredictionDetail } from "@/lib/worldCup/fetchPredictionDetail";
import { getWorldCupErrorMessage } from "@/lib/worldCup/getErrorMessage";
import { marketOddsPercent } from "@/lib/worldCup/normalizeMarkets";
import { calcParticipateSummary } from "@/lib/worldCup/participateCalc";
import { readCachedParticipateEvent } from "@/lib/worldCup/participateEventCache";
import { DEFAULT_PARTICIPATE_OUTCOME, parseOutcomeParam } from "@/lib/worldCup/participateUrl";
import { fetchWorldCupParticipateSubmit } from "@/lib/worldCup/submitParticipate";
import type { WorldCupParticipateSubmitResult } from "@/lib/worldCup/participateTypes";
import type {
  WorldCupOutcomeSide,
  WorldCupParticipateDetail,
} from "@/lib/worldCup/types";
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

/** YES = 押该选项发生；NO = 押不发生，展示互补概率 */
type ParticipateStance = "yes" | "no";

function formatScore(item: WorldCupParticipateDetail) {
  if (item.homeScore == null || item.awayScore == null) return "VS";
  return `${item.homeScore}:${item.awayScore}`;
}

const DRAW_OUTCOME_LABEL = "Draw";

function parseAmountInput(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return 0;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
}

type ParticipateSuccessState = WorldCupParticipateSubmitResult;

function OutcomePill({
  label,
  selected,
  onSelect,
}: {
  label: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={`flex h-[38px] min-w-0 flex-1 items-center justify-center rounded-[10px] border px-2 touch-manipulation ${
        selected
          ? "border-[#ffd6d8] bg-[#fff1f2] text-[#e84040]"
          : "border-transparent bg-[#f4f4f4] text-[#333]"
      }`}
    >
      <span className="truncate text-xs font-bold">{label}</span>
    </button>
  );
}

function StanceCell({
  label,
  percent,
  selected,
  onSelect,
}: {
  label: string;
  percent: number;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={`flex h-[60px] min-w-0 flex-1 flex-col items-center justify-center rounded-[10px] border px-2 py-3 touch-manipulation ${
        selected
          ? "border-[#ffd6d8] bg-[#fff1f2]"
          : "border-transparent bg-[#f4f4f4]"
      }`}
    >
      <span className="text-xs font-bold text-[#333]">{label}</span>
      <span className="mt-2.5 text-lg font-bold text-[#1a1a1a]">
        {percent.toFixed(1)}%
      </span>
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
  const [selectedOutcome, setSelectedOutcome] = useState<WorldCupOutcomeSide>(
    initialOutcome ?? DEFAULT_PARTICIPATE_OUTCOME,
  );
  const [stance, setStance] = useState<ParticipateStance>("yes");
  const [amountInput, setAmountInput] = useState("");
  const [activeQuickAdd, setActiveQuickAdd] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successData, setSuccessData] = useState<ParticipateSuccessState | null>(
    null,
  );

  useEffect(() => {
    if (initialOutcome) {
      setSelectedOutcome(initialOutcome);
      return;
    }
    setSelectedOutcome(DEFAULT_PARTICIPATE_OUTCOME);
  }, [initialOutcome]);

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

  const detailErrorMessage = useMemo(
    () => getWorldCupErrorMessage(error, t("worldCup.detailNotFound")),
    [error, t],
  );

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

  const { data: priceResponse } = useQuery({
    queryKey: ["xcoinPrice"],
    queryFn: () => getXcoinPrice(),
  });

  const availableAul = Number(assetsResponse?.data?.xCoinBalance ?? 0);
  const aulPriceFromApi = Number(priceResponse?.data?.currentPrice ?? 0);
  // 接口暂无价格时兜底，避免除零
  const aulPrice = aulPriceFromApi > 0 ? aulPriceFromApi : 2;

  const homeTeam = item?.homeTeam ?? "";
  const awayTeam = item?.awayTeam ?? "";
  const showOutcomes = Boolean(
    item && Object.keys(item.markets).length > 0,
  );

  const selectedMarket = selectedOutcome
    ? item?.markets[selectedOutcome]
    : undefined;

  const outcomeShortLabels: Record<WorldCupOutcomeSide, string> = useMemo(
    () => ({
      home: homeTeam,
      draw: DRAW_OUTCOME_LABEL,
      away: awayTeam,
    }),
    [awayTeam, homeTeam],
  );

  const activePercent = useMemo(() => {
    if (!selectedMarket) return 100;
    return marketOddsPercent(selectedMarket, stance);
  }, [selectedMarket, stance]);

  const amountUsdt = parseAmountInput(amountInput);

  const amountOutOfRange = useMemo(() => {
    if (!item || amountUsdt <= 0) return false;
    return amountUsdt < item.minBetAmount || amountUsdt > item.maxBetAmount;
  }, [amountUsdt, item]);

  const summary = useMemo(
    () =>
      calcParticipateSummary({
        amountUsdt,
        aulPrice,
        stancePercent: activePercent,
        feeRate: item?.feeRate ?? 0.05,
      }),
    [activePercent, amountUsdt, aulPrice, item?.feeRate],
  );

  const insufficientBalance =
    amountUsdt > 0 && summary.totalAulCost > availableAul;

  const canSubmit =
    Boolean(
      item &&
        canParticipateInDetail(item) &&
        amountUsdt > 0 &&
        !amountOutOfRange &&
        !insufficientBalance &&
        (!showOutcomes || (selectedOutcome && selectedMarket)),
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
    if (!item) return;
    if (showOutcomes && (!selectedOutcome || !selectedMarket)) {
      toast.info(t("worldCup.selectOutcomeFirst"));
      return;
    }
    if (amountUsdt <= 0) {
      toast.info(t("worldCup.enterAmountFirst"));
      return;
    }
    if (amountUsdt < item.minBetAmount) {
      toast.info(
        t("worldCup.amountBelowMin", { min: formatAmount(item.minBetAmount) }),
      );
      return;
    }
    if (amountUsdt > item.maxBetAmount) {
      toast.info(
        t("worldCup.amountAboveMax", { max: formatAmount(item.maxBetAmount) }),
      );
      return;
    }
    if (insufficientBalance) {
      toast.info(t("worldCup.insufficientAul"));
      return;
    }

    setIsSubmitting(true);
    try {
      const outcome = selectedOutcome ?? DEFAULT_PARTICIPATE_OUTCOME;
      const market = selectedMarket ?? item.markets[outcome];
      if (!market) {
        toast.info(t("worldCup.selectOutcomeFirst"));
        return;
      }

      const result = await fetchWorldCupParticipateSubmit({
        betId: String(market.id),
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
    selectedMarket,
    selectedOutcome,
    showOutcomes,
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
          <div className="flex items-start space-x-2">
            {item.icon ? (
              <AppImage
                src={item.icon}
                alt=""
                width={32}
                height={32}
                className="size-8 shrink-0 rounded object-cover"
              />
            ) : null}
            <h3 className="min-w-0 flex-1 text-base font-extrabold leading-snug text-[#1a1a1a]">
              {item.title}
            </h3>
          </div>

          <div className="relative mt-3 h-[59px]">
            <div className="absolute top-[3px] left-0 flex w-[33%] flex-col items-center">
              <p className="w-full truncate text-center text-sm font-extrabold text-[#333]">
                {homeTeam}
              </p>
            </div>

            <div className="absolute top-0 left-1/2 flex min-w-[88px] -translate-x-1/2 flex-col items-center">
              <p className="text-[28px] font-black leading-none text-[#f0181e]">
                {formatScore(item)}
              </p>
              <p className="mt-0.5 whitespace-nowrap text-xs leading-none text-[#949494]">
                {formatUtcMatchTime(item.endDate)}
              </p>
            </div>

            <div className="absolute top-[3px] right-0 flex w-[33%] flex-col items-center">
              <p className="w-full truncate text-center text-sm font-extrabold text-[#333]">
                {awayTeam}
              </p>
            </div>
          </div>

          {showOutcomes ? (
            <div
              className="mt-3.5 flex flex-col space-y-1.5"
              role="radiogroup"
              aria-label={t("worldCup.outcomeGroupAria")}
            >
              <div className="flex space-x-3">
                {(["home", "draw", "away"] as const).map((side) => (
                  <OutcomePill
                    key={side}
                    label={outcomeShortLabels[side]}
                    selected={selectedOutcome === side}
                    onSelect={() => setSelectedOutcome(side)}
                  />
                ))}
              </div>

              <div
                className="flex space-x-3"
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
                  onSelect={() => setStance("no")}
                />
              </div>
            </div>
          ) : null}
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
                  min: formatAmount(item.minBetAmount),
                  max: formatAmount(item.maxBetAmount),
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
              min: formatAmount(item.minBetAmount),
              max: formatAmount(item.maxBetAmount),
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
              value={`${formatAmount(aulPrice)} USDT/AUL`}
            />
            <SummaryRow
              label={t("worldCup.aulToDeduct")}
              value={`${formatAmount(summary.aulRequired)} AUL`}
            />
            <SummaryRow
              label={t("worldCup.expectedWinUsdt")}
              value={`${formatAmount(summary.expectedWinUsdt)} USDT`}
            />
            <SummaryRow
              label={t("worldCup.feeAul")}
              value={formatAmount(summary.feeAul)}
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
    aulPrice,
    amountOutOfRange,
    availableAul,
    awayTeam,
    canSubmit,
    handleQuickAdd,
    handleSubmit,
    homeTeam,
    detailErrorMessage,
    idValid,
    insufficientBalance,
    isError,
    isPending,
    item,
    outcomeShortLabels,
    selectedOutcome,
    selectedMarket,
    showOutcomes,
    stance,
    summary,
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
