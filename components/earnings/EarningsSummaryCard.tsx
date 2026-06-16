"use client";

import { useEffect, useState } from "react";
import { AppImage } from "@/components/AppImage";
import { useTranslation } from "@/lib/hooks/useTranslation";
import type { Locale } from "@/lib/local";
import { getLastPeriodEarningsHelp, getUserAssets } from "@/lib/api/users";
import { useUserInfoStore } from "@/lib/store";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { earningsAssets } from "./assets";
import { FinancialManagement } from "./FinancialManagement";

/** 底栏统计在窄卡片里用短文案的语言 */
const COMPACT_STAT_LOCALES: Locale[] = ["en_US", "ko_KR", "vi_VN", "ja_JP", "ms_MY"];

function useEarningsSummaryCopy(locale: Locale, t: (key: string) => string) {
  const compactStat = COMPACT_STAT_LOCALES.includes(locale);
  return {
    totalEarnings: t("earnings.totalEarnings"),
    earningsRecord: t("earnings.earningsRecord"),
    invest: t("earnings.investBtn"),
    pending: compactStat
      ? t("earnings.pendingEarningsCard")
      : t("earnings.pendingEarnings"),
    lastPeriod: compactStat
      ? t("earnings.lastPeriodEarningsCard")
      : t("earnings.lastPeriodEarnings"),
  };
}

function formatIncome(value: number) {
  return value.toLocaleString("en-US", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  });
}

/** 收益摘要卡 — 对齐 Figma 1117:2113 */
export function EarningsSummaryCard() {
  const { t, locale } = useTranslation();
  const copy = useEarningsSummaryCopy(locale, t);
  const [deployOpen, setDeployOpen] = useState(false);
  const walletAddress = useUserInfoStore((state) => state.userInfo.walletAddress);

  const [helpOpen, setHelpOpen] = useState(false);
  const [helpPending, setHelpPending] = useState(false);
  const [helpError, setHelpError] = useState<string | null>(null);
  const [helpRows, setHelpRows] = useState<Array<{ label: string; value: string }>>(
    [],
  );

  const { data: userAssetsResponse, isPending: userAssetsPending } = useQuery({
    queryKey: ["userAssets", walletAddress],
    queryFn: () => getUserAssets(),
    enabled: Boolean(walletAddress),
  });

  const totalIncomeUsdt = userAssetsResponse?.data?.stakeTotalUsdtIncome ?? 0;
  const totalIncomeLabel = userAssetsPending
    ? t("common.loadingDots")
    : formatIncome(totalIncomeUsdt);

  const usdtBalance = userAssetsResponse?.data?.stakeUsdtIncome ?? 0;
  const usdtBalanceLabel = userAssetsPending
    ? t("common.loadingDots")
    : formatIncome(usdtBalance);

  const lastUsdtIncome =
    userAssetsResponse?.data?.lastUsdtIncome ?? 0;
  const xcoinReleasedBalanceLabel = userAssetsPending
    ? t("common.loadingDots")
    : formatIncome(lastUsdtIncome);

  const handleLastPeriodHelp = async () => {
    // 只有“已登录/已连接钱包”的情况下才请求后端
    if (!walletAddress) return;

    setHelpError(null);
    setHelpPending(true);
    setHelpOpen(true);

    try {
      const resp = await getLastPeriodEarningsHelp();
      const list = Array.isArray((resp as any)?.data) ? (resp as any).data : [];

      setHelpRows(
        list.slice(0, 3).map((item: any) => ({
          label: String(item?.label ?? "").trim(),
          value: String(item?.value ?? "").trim(),
        })),
      );
    } catch (e) {
      const msg = e instanceof Error ? e.message : t("common.operationFailed");
      setHelpError(msg);
      setHelpRows([]);
      toast.error(msg);
    } finally {
      setHelpPending(false);
    }
  };

  return (
    <>
      <section className="relative flex h-[221px] w-full shrink-0 flex-col overflow-hidden rounded-[12px] bg-white/80 px-3 pb-3 pt-3 shadow-[0_5px_10px_rgba(51,51,51,0.08)] backdrop-blur-[7px]">
        <SummaryBackground />
        <AiDecoration />

        <div className="relative z-10 flex max-w-[calc(100%-100px)] flex-col gap-2">
          <p className="text-sm leading-normal text-black/70">{copy.totalEarnings}</p>
          <p className="font-mulish text-[32px] font-bold leading-none text-black">
            {totalIncomeLabel}
          </p>
        </div>

        <div className="relative z-10 mt-5 flex gap-3">
          <StatCard
            label={copy.pending}
            value={usdtBalanceLabel}
            icon={earningsAssets.statPendingIcon}
            iconClassName="left-[-33.2%] top-[-30.15%] size-[166.53%]"
          />
          <StatCard
            label={copy.lastPeriod}
            value={xcoinReleasedBalanceLabel}
            icon={earningsAssets.statLastPeriodIcon}
            iconClassName="left-[-30.11%] top-[-27.96%] size-[160.22%]"
            helpOnClick={walletAddress ? handleLastPeriodHelp : undefined}
            helpValue={lastUsdtIncome}
            helpAriaLabel="Last period help"
          />
        </div>

        <button
          type="button"
          className="relative z-10 mt-3 flex h-11 w-full shrink-0 select-none items-center justify-center rounded-[33px] border border-white bg-gradient-to-r from-[#ff4d00] via-[#ff3033] via-[53.846%] to-[#e90000] text-base font-semibold leading-normal text-white shadow-[0_4px_6px_rgba(213,0,0,0.12),inset_0_-4px_4px_rgba(255,254,227,0.7),inset_0_8px_17px_#ffe5e5] [text-shadow:0_1px_3px_rgba(94,44,44,0.25)] transition-[transform] duration-150 ease-out will-change-transform active:translate-y-1 active:scale-[0.98]"
          onClick={() => setDeployOpen(true)}
        >
          {copy.invest}
        </button>
      </section>

      <FinancialManagement
        open={deployOpen}
        onClose={() => setDeployOpen(false)}
      />

      <LastPeriodHelpSheet
        open={helpOpen}
        pending={helpPending}
        error={helpError}
        rows={helpRows}
        loadingLabel={t("common.loadingDots")}
        noRecordsLabel={t("common.noRecords")}
        onClose={() => setHelpOpen(false)}
      />
    </>
  );
}

function AiDecoration() {
  return (
    <div className="pointer-events-none absolute right-0 top-0 z-[1] h-[107px] w-[118px] overflow-hidden">
      <AppImage
        src={earningsAssets.summaryAiDeco}
        alt=""
        fill
        className="object-cover opacity-70"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-white/0 from-[23.95%] to-[#fbfbfb]" />
    </div>
  );
}

function SummaryBackground() {
  const maskStyle = {
    maskImage: `url(${earningsAssets.summaryDecoMask})`,
    WebkitMaskImage: `url(${earningsAssets.summaryDecoMask})`,
    maskSize: "371px 241px",
    WebkitMaskSize: "371px 241px",
    maskRepeat: "no-repeat" as const,
    WebkitMaskRepeat: "no-repeat" as const,
  };

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[12px]">
      <div className="absolute left-[55.7px] top-[-152px] flex h-[568px] w-[553px] items-center justify-center">
        <div className="flex-none -skew-x-[1.21deg] rotate-[-25.72deg]">
          <div
            className="relative h-[425px] w-[418px] opacity-[0.19]"
            style={{
              ...maskStyle,
              maskPosition: "-65.699px 147.084px",
              WebkitMaskPosition: "-65.699px 147.084px",
            }}
          >
            <AppImage
              src={earningsAssets.summaryPattern}
              alt=""
              fill
              className="object-cover"
            />
          </div>
        </div>
      </div>

      <div className="absolute -left-[264px] -top-[253px] flex h-[590px] w-[574px] items-center justify-center">
        <div className="flex-none -skew-x-[18.57deg] rotate-[-42.75deg] scale-y-95">
          <div
            className="relative h-[529px] w-[458px] opacity-[0.11]"
            style={{
              ...maskStyle,
              maskPosition: "258px 336px",
              WebkitMaskPosition: "258px 336px",
            }}
          >
            <AppImage
              src={earningsAssets.summaryPattern}
              alt=""
              fill
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  iconClassName,
  helpOnClick,
  helpValue,
  helpAriaLabel,
}: {
  label: string;
  value: string;
  icon: string;
  iconClassName: string;
  helpOnClick?: () => void;
  helpValue?: number;
  helpAriaLabel?: string;
}) {
  const showHelp = Boolean(helpOnClick) && Number(helpValue ?? 0) > 0;

  return (
    <div className="relative flex h-[65px] min-w-0 flex-1 overflow-hidden rounded-[8px] bg-white shadow-[0_5px_10px_rgba(51,51,51,0.08)] backdrop-blur-[7px]">
      <div
        className={`relative z-[1] flex min-w-0 flex-1 flex-col justify-center gap-0.5 py-3 pl-2 ${
          showHelp ? "pr-[64px]" : "pr-[52px]"
        }`}
      >
        <div className="flex min-w-0 items-center">
          <p className="min-w-0 truncate text-sm leading-normal text-black/70">
            {label}
          </p>
          {showHelp ? (
            <button
              type="button"
              aria-label={helpAriaLabel ?? "Help"}
              onClick={helpOnClick}
              className="relative z-[2] ml-1 flex size-5 shrink-0 items-center justify-center rounded-full bg-white text-[11px] font-bold leading-none text-[#333] shadow-[0_2px_4px_rgba(0,0,0,0.12)]"
            >
              ?
            </button>
          ) : null}
        </div>
        <p className="truncate leading-none text-[#333]">
          <span className="font-mulish text-base font-bold leading-normal">
            {value}
          </span>
          <span className="text-[10px] leading-normal"> USDT</span>
        </p>
      </div>
      <div className="pointer-events-none absolute right-1.5 top-1/2 z-0 size-11 -translate-y-1/2 overflow-hidden">
        <AppImage
          src={icon}
          alt=""
          width={44}
          height={44}
          className={`absolute max-w-none ${iconClassName}`}
        />
      </div>
    </div>
  );
}

function LastPeriodHelpSheet({
  open,
  pending,
  error,
  rows,
  loadingLabel,
  noRecordsLabel,
  onClose,
}: {
  open: boolean;
  pending: boolean;
  error: string | null;
  rows: Array<{ label: string; value: string }>;
  loadingLabel: string;
  noRecordsLabel: string;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-80 flex items-center justify-center px-3"
      role="dialog"
      aria-modal="true"
    >
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      <div
        className="relative w-[320px] max-w-[calc(100%-48px)] rounded-[12px] bg-white px-4 pb-4 pt-4 shadow-[0_8px_24px_rgba(0,0,0,0.15)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold leading-normal text-[#333]">
            说明
          </h2>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="flex size-7 items-center justify-center rounded-full bg-[#f5f5f5] text-[#666]"
          >
            ×
          </button>
        </div>

        <div className="mt-3">
          {pending ? (
            <p className="py-6 text-center text-sm text-black/50">
              {loadingLabel}
            </p>
          ) : error ? (
            <p className="py-6 text-center text-sm text-[#e43b3b]">{error}</p>
          ) : rows.length === 0 ? (
            <p className="py-6 text-center text-sm text-black/50">
              {noRecordsLabel}
            </p>
          ) : (
            <div className="flex flex-col space-y-2">
              {rows.slice(0, 3).map((row, idx) => (
                <div
                  // eslint-disable-next-line react/no-array-index-key
                  key={`${row.label}-${idx}`}
                  className="flex items-center"
                >
                  <span className="min-w-0 flex-1 truncate text-sm leading-normal text-[#333]">
                    {row.label}
                  </span>
                  <span className="ml-3 shrink-0 text-sm font-semibold leading-normal text-[#333]">
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
