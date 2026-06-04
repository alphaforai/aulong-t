"use client";

import React from "react";
import AulongHeader from "@/components/AulongHeader";
import { AppImage } from "@/components/AppImage";
import { entrustAssets } from "./assets";
import { teamAssets } from "@/components/team/assets";
import { useTranslation } from "@/lib/hooks/useTranslation";
import {
  sidePanelOverlayFrame,
  sidePanelOverlayRoot,
} from "@/lib/mobileShell";
import { toast } from "sonner";

export type AIStrategyProps = {
  open: boolean;
  onClose: () => void;
};

type TabId = "deploying" | "history";

type StrategyRunStatus = "deployed" | "ended";

type AIStrategyRecord = {
  id: string;
  iconSrc: string;
  title: string;
  description: string;
  depositedAmount: string;
  cumulativeEarnings: string;
  status: StrategyRunStatus;
  strategyName: string;
  startTime: string;
  endTime: string;
  progressPercent?: number;
  progressTrack?: "light" | "dark";
  daysElapsed?: number;
  daysRemaining?: number;
  redeemCountdown?: string;
  showRedeemButton?: boolean;
  redeemReady?: boolean;
};

const GRADIENT_BTN =
  "relative overflow-hidden rounded-[33px] border border-white shadow-[0_4px_6px_rgba(213,0,0,0.12)]";
const GRADIENT_FILL =
  "pointer-events-none absolute inset-0 rounded-[33px] bg-gradient-to-r from-[#ff4d00] via-[#ff3033] via-[53.846%] to-[#e90000]";
const GRADIENT_INSET =
  "pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0px_-4px_4px_0px_rgba(255,254,227,0.7),inset_0px_8px_17px_0px_#ffe5e5]";

function AmountValue({ amount }: { amount: string }) {
  return (
    <p className="whitespace-nowrap text-[0px] text-[rgba(0,0,0,0.8)]">
      <span className="font-mulish text-sm font-medium leading-normal">
        {amount}
      </span>
      <span className="font-mulish text-[10px] leading-normal"> USDT</span>
    </p>
  );
}

function DetailCell({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-xs text-black/70">{label}</p>
      {children}
    </div>
  );
}

function RunProgressText({
  elapsed,
  remaining,
}: {
  elapsed: number;
  remaining: number;
}) {
  const { t } = useTranslation();
  return (
    <p className="text-center text-xs text-black/70">
      {t("entrust.aiStrategy.runProgressPrefix")}
      <span className="text-[rgba(255,0,0,0.7)]">{elapsed} </span>
      {t("entrust.aiStrategy.runProgressMiddle")}
      <span className="text-[rgba(255,0,0,0.7)]">{remaining} </span>
      {t("entrust.aiStrategy.runProgressSuffix")}
    </p>
  );
}

function StrategyRecordCard({
  record,
  onRedeem,
}: {
  record: AIStrategyRecord;
  onRedeem: () => void;
}) {
  const { t } = useTranslation();
  const statusColor =
    record.status === "deployed" ? "bg-[#2cb360]" : "bg-[#d76464]";
  const statusLabel =
    record.status === "deployed"
      ? t("entrust.aiStrategy.statusDeployed")
      : t("entrust.aiStrategy.statusEnded");

  return (
    <article className="w-full rounded-[12px] border border-white bg-white/80 p-3 shadow-[0_5px_10px_rgba(51,51,51,0.08)] backdrop-blur-[7px]">
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-4">
          <AppImage
            src={record.iconSrc}
            alt=""
            width={32}
            height={32}
            className="size-8 shrink-0 object-contain"
          />
          <div className="min-w-0">
            <h3 className="text-base font-semibold text-black">{record.title}</h3>
            <p className="text-xs text-black/70">{record.description}</p>
          </div>
        </div>

        <div className="flex justify-between gap-3">
          <div className="flex min-w-0 flex-1 items-center gap-1.5 rounded-[8px] border border-white bg-white/70 p-3">
            <AppImage
              src={entrustAssets.aiDepositIcon}
              alt=""
              width={40}
              height={40}
              className="size-10 shrink-0"
            />
            <div className="min-w-0">
              <p className="text-xs text-black/70">
                {t("entrust.aiStrategy.depositedAssets")}
              </p>
              <AmountValue amount={record.depositedAmount} />
            </div>
          </div>
          <div className="flex min-w-0 flex-1 items-center gap-1.5 rounded-[8px] border border-white bg-white/70 p-3">
            <AppImage
              src={entrustAssets.aiEarningsIcon}
              alt=""
              width={40}
              height={40}
              className="size-10 shrink-0"
            />
            <div className="min-w-0">
              <p className="text-xs text-black/70">
                {t("entrust.aiStrategy.cumulativeEarnings")}
              </p>
              <AmountValue amount={record.cumulativeEarnings} />
            </div>
          </div>
        </div>

        <div className="flex gap-[74px]">
          <DetailCell label={t("entrust.aiStrategy.runStatus")}>
            <span className="flex items-center gap-1 text-xs font-medium">
              <span className={`size-1.5 shrink-0 rounded-full ${statusColor}`} />
              <span
                className={
                  record.status === "deployed" ? "text-[#2cb360]" : "text-[#d76464]"
                }
              >
                {statusLabel}
              </span>
            </span>
          </DetailCell>
          <DetailCell label={t("entrust.aiStrategy.strategyName")}>
            <span className="text-xs font-medium text-black/80">
              {record.strategyName}
            </span>
          </DetailCell>
        </div>

        <div className="relative h-px w-full">
          <AppImage
            src={entrustAssets.dividerLine}
            alt=""
            width={327}
            height={1}
            className="h-px w-full"
          />
        </div>

        <div className="flex gap-[74px]">
          <DetailCell label={t("entrust.aiStrategy.startTime")}>
            <span className="text-xs font-medium text-[#333]">
              {record.startTime}
            </span>
          </DetailCell>
          <DetailCell label={t("entrust.aiStrategy.endTime")}>
            <span className="text-xs font-medium text-[#333]">
              {record.endTime}
            </span>
          </DetailCell>
        </div>

        {record.progressPercent != null &&
        record.daysElapsed != null &&
        record.daysRemaining != null ? (
          <>
            <div className="relative h-[13px] w-full">
              <div
                className={`absolute left-0 top-[3px] h-[7px] w-full rounded-[21px] ${
                  record.progressTrack === "dark" ? "bg-[#1d1e22]" : "bg-[#ddd]"
                }`}
              />
              <div
                className="absolute left-0 top-[3px] h-[7px] rounded-[21px] bg-gradient-to-b from-[#ff3636] to-[#c80000]"
                style={{ width: `${record.progressPercent}%` }}
              />
              <div
                className="absolute top-0 size-[13px] rounded-[21px] border-2 border-white bg-gradient-to-b from-[#ff3636] to-[#c80000]"
                style={{
                  left: `calc(${record.progressPercent}% - 6.5px)`,
                }}
              />
            </div>
            <RunProgressText
              elapsed={record.daysElapsed}
              remaining={record.daysRemaining}
            />
          </>
        ) : null}

        {record.showRedeemButton ? (
          <button
            type="button"
            onClick={onRedeem}
            className={`mx-auto flex h-[58px] w-full max-w-[308px] flex-col items-center justify-center px-2.5 ${GRADIENT_BTN}`}
          >
            {record.redeemReady ? (
              <>
                <span className={GRADIENT_FILL} aria-hidden />
                <span className={GRADIENT_INSET} aria-hidden />
                <span className="relative text-base font-semibold text-white [text-shadow:0_1px_3px_rgba(94,44,44,0.25)]">
                  {t("entrust.aiStrategy.redeemable")}
                </span>
              </>
            ) : (
              <>
                <span
                  className="pointer-events-none absolute inset-0 rounded-[33px]"
                  style={{
                    backgroundImage:
                      "linear-gradient(90deg, rgba(255,255,255,0.47) 0%, rgba(255,255,255,0.47) 100%), linear-gradient(90deg, rgb(255, 77, 0) 0%, rgb(255, 48, 51) 53.846%, rgb(233, 0, 0) 100%)",
                  }}
                  aria-hidden
                />
                <span className={GRADIENT_INSET} aria-hidden />
                {record.redeemCountdown ? (
                  <span className="relative text-base text-white [text-shadow:0_1px_3px_rgba(94,44,44,0.25)]">
                    {t("entrust.aiStrategy.redeemAfter", {
                      time: record.redeemCountdown,
                    })}
                  </span>
                ) : null}
                <span className="relative text-base font-semibold text-white [text-shadow:0_1px_3px_rgba(94,44,44,0.25)]">
                  {t("entrust.aiStrategy.redeemable")}
                </span>
              </>
            )}
          </button>
        ) : null}
      </div>
    </article>
  );
}

export function AIStrategy({ open, onClose }: AIStrategyProps) {
  const { t } = useTranslation();
  const [entered, setEntered] = React.useState(false);
  const [tab, setTab] = React.useState<TabId>("deploying");

  const closePanel = React.useCallback(() => {
    setEntered(false);
    window.setTimeout(() => onClose(), 300);
  }, [onClose]);

  React.useEffect(() => {
    if (!open) {
      setEntered(false);
      return;
    }
    setTab("deploying");
    const frame = requestAnimationFrame(() => {
      requestAnimationFrame(() => setEntered(true));
    });
    return () => cancelAnimationFrame(frame);
  }, [open]);

  React.useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closePanel();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, closePanel]);

  const strategyTitle = t("entrust.strategyTrendTitle");
  const strategyDesc = t("entrust.strategyTrendDesc");

  const deployingRecords: AIStrategyRecord[] = [
    {
      id: "deploy-1",
      iconSrc: entrustAssets.strategyTrend,
      title: strategyTitle,
      description: strategyDesc,
      depositedAmount: "5,000",
      cumulativeEarnings: "5,000,000",
      status: "deployed",
      strategyName: strategyTitle,
      startTime: "2026-05-12 10:21",
      endTime: "2026-05-17 10:21",
      progressPercent: 53.52,
      progressTrack: "light",
      daysElapsed: 5,
      daysRemaining: 2,
      redeemCountdown: "52:52:16",
      showRedeemButton: true,
      redeemReady: false,
    },
    {
      id: "deploy-2",
      iconSrc: entrustAssets.strategyTrend,
      title: strategyTitle,
      description: strategyDesc,
      depositedAmount: "5,000",
      cumulativeEarnings: "5,000,000",
      status: "deployed",
      strategyName: strategyTitle,
      startTime: "2026-05-17 10:21",
      endTime: "2026-05-17 10:21",
      progressPercent: 97.86,
      progressTrack: "dark",
      daysElapsed: 5,
      daysRemaining: 0,
      showRedeemButton: true,
      redeemReady: true,
    },
  ];

  const historyRecords: AIStrategyRecord[] = [
    {
      id: "history-1",
      iconSrc: entrustAssets.strategyTrend,
      title: strategyTitle,
      description: strategyDesc,
      depositedAmount: "5,000",
      cumulativeEarnings: "5,000,000",
      status: "ended",
      strategyName: strategyTitle,
      startTime: "2026-05-12 10:21",
      endTime: "2026-05-17 10:21",
    },
    {
      id: "history-2",
      iconSrc: entrustAssets.strategyTrend,
      title: strategyTitle,
      description: strategyDesc,
      depositedAmount: "5,000",
      cumulativeEarnings: "5,000,000",
      status: "ended",
      strategyName: strategyTitle,
      startTime: "2026-05-12 10:21",
      endTime: "2026-05-17 10:21",
    },
  ];

  const records = tab === "deploying" ? deployingRecords : historyRecords;

  const handleRedeem = () => {
    toast.success(t("common.notOpen"));
  };

  if (!open) return null;

  return (
    <div
      className={`${sidePanelOverlayRoot} z-80`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="ai-strategy-title"
    >
      <div className={sidePanelOverlayFrame}>
        <div
          className={`absolute inset-0 flex w-full flex-col bg-[#f8f8f8] transition-transform duration-300 ease-out ${
            entered ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="h-11 shrink-0 bg-white" aria-hidden />
          <AulongHeader />

          <header className="relative flex h-12 shrink-0 items-center justify-center bg-[#f8f8f8] px-3">
            <button
              type="button"
              aria-label={t("common.back")}
              onClick={closePanel}
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
            <h1
              id="ai-strategy-title"
              className="text-lg font-medium leading-[26px] text-[#272727]"
            >
              {t("entrust.aiStrategy.panelTitle")}
            </h1>
          </header>

          <div className="relative mx-3 mt-2 h-12 shrink-0">
            <div className="absolute inset-0 rounded-full bg-white/80" />
            <div className="relative flex h-full items-center px-2">
              <button
                type="button"
                onClick={() => setTab("deploying")}
                className={`relative flex h-[38px] flex-1 items-center justify-center rounded-[33px] text-sm transition-colors ${
                  tab === "deploying"
                    ? `${GRADIENT_BTN} font-normal text-white [text-shadow:0_1px_3px_rgba(94,44,44,0.25)]`
                    : "text-black"
                }`}
              >
                {tab === "deploying" ? (
                  <>
                    <span className={GRADIENT_FILL} aria-hidden />
                    <span className={GRADIENT_INSET} aria-hidden />
                  </>
                ) : null}
                <span className="relative">{t("entrust.aiStrategy.tabDeploying")}</span>
              </button>
              <button
                type="button"
                onClick={() => setTab("history")}
                className={`relative flex h-[38px] flex-1 items-center justify-center rounded-[33px] text-sm transition-colors ${
                  tab === "history"
                    ? `${GRADIENT_BTN} font-normal text-white [text-shadow:0_1px_3px_rgba(94,44,44,0.25)]`
                    : "text-black"
                }`}
              >
                {tab === "history" ? (
                  <>
                    <span className={GRADIENT_FILL} aria-hidden />
                    <span className={GRADIENT_INSET} aria-hidden />
                  </>
                ) : null}
                <span className="relative">{t("entrust.aiStrategy.tabHistory")}</span>
              </button>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-[max(env(safe-area-inset-bottom),16px)] pt-4">
            <div className="flex flex-col gap-4">
              {records.map((record) => (
                <StrategyRecordCard
                  key={record.id}
                  record={record}
                  onRedeem={handleRedeem}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
