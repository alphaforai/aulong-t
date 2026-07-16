"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import AulongHeader from "@/components/AulongHeader";
import { AppImage } from "@/components/AppImage";
import { earningsAssets } from "@/components/earnings/assets";
import { teamAssets } from "@/components/team/assets";
import { getArbitrageLatest, type ArbitrageLatestItem } from "@/lib/api/arbitrage";
import {
  formatChainLabel,
  formatDecimalValue,
  formatDurationParts,
  formatFullDateTime,
  formatPlatformName,
  formatProfitAmount,
  formatProfitRate,
  formatSpreadRate,
  formatTradingPair,
  TX_CURRENCY,
} from "@/lib/earnings/arbitrageFormat";
import { readCachedTransactionDetail } from "@/lib/earnings/transactionDetailCache";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { stackY3 } from "@/lib/mobileCompat";

const DETAIL_CARD =
  "w-full shrink-0 overflow-hidden rounded-[12px] bg-[rgba(255,255,255,0.95)] p-4 shadow-[0_5px_10px_rgba(51,51,51,0.08)]";

const SOLANA_EXPLORER_TX_BASE = "https://explorer.solana.com/tx/";
const BSC_EXPLORER_TX_BASE = "https://bscscan.com/tx/";
const ETH_EXPLORER_TX_BASE = "https://etherscan.io/tx/";
const POLYGON_EXPLORER_TX_BASE = "https://polygonscan.com/tx/";
const TRX_EXPLORER_TX_BASE = "https://tronscan.org/#/transaction/";

function getExplorerTxUrl(
  chain: string | undefined,
  txHash: string,
): string | null {
  if (!txHash) return null;
  const normalized = chain?.toUpperCase();
  if (normalized === "BSC") return `${BSC_EXPLORER_TX_BASE}${txHash}`;
  if (normalized === "ETH") return `${ETH_EXPLORER_TX_BASE}${txHash}`;
  if (normalized === "POLYGON") return `${POLYGON_EXPLORER_TX_BASE}${txHash}`;
  if (normalized === "TRX") return `${TRX_EXPLORER_TX_BASE}${txHash}`;
  if (normalized === "SOLANA" || normalized === "SOL") {
    return `${SOLANA_EXPLORER_TX_BASE}${txHash}`;
  }
  return null;
}

type TransactionDetailPageProps = {
  transactionId: string;
};

export function TransactionDetailPage({
  transactionId,
}: TransactionDetailPageProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const [cachedRecord] = React.useState<ArbitrageLatestItem | null>(() =>
    readCachedTransactionDetail(transactionId),
  );

  const { data, isPending, isError } = useQuery({
    queryKey: ["arbitrageLatest", "detail", transactionId],
    queryFn: () => getArbitrageLatest({ limit: 200 }),
    enabled: !cachedRecord,
    staleTime: 30_000,
  });

  const record =
    cachedRecord ??
    (Array.isArray(data?.data)
      ? data.data.find((item) => item.id === transactionId) ?? null
      : null);

  const handleBack = () => {
    router.back();
  };

  const formatDurationText = React.useCallback(
    (openTime?: string | null, closeTime?: string | null) => {
      const { hours, minutes, seconds } = formatDurationParts(openTime, closeTime);
      if (hours > 0) {
        return `${hours}${t("earnings.hourUnit")}${minutes}${t("earnings.minuteUnit")}${seconds}${t("earnings.secondUnit")}`;
      }
      return `${minutes}${t("earnings.minuteUnit")}${seconds}${t("earnings.secondUnit")}`;
    },
    [t],
  );

  const formatTimeRangeText = React.useCallback(
    (openTime?: string | null, closeTime?: string | null) => {
      const start = formatFullDateTime(openTime);
      const end = formatFullDateTime(closeTime);
      if (start === "—" || end === "—") return "—";
      const endTime = end.includes(" ") ? end.split(" ")[1] : end;
      const duration = formatDurationText(openTime, closeTime);
      return `${start} ${t("earnings.timeTo")} ${endTime} · ${t("earnings.durationLabel")} ${duration}`;
    },
    [formatDurationText, t],
  );

  let content: React.ReactNode;
  if (!record && isPending) {
    content = (
      <p className="py-12 text-center text-sm text-[#8b8b8b]">
        {t("common.loading")}
      </p>
    );
  } else if (!record && isError) {
    content = (
      <p className="py-12 text-center text-sm text-[#8b8b8b]">
        {t("common.operationFailed")}
      </p>
    );
  } else if (!record) {
    content = (
      <p className="py-12 text-center text-sm text-[#8b8b8b]">
        {t("earnings.detailNotFound")}
      </p>
    );
  } else {
    content = (
      <>
        <SummaryCard
          record={record}
          timeRangeText={formatTimeRangeText(record.openTime, record.closeTime)}
          t={t}
        />
        <ExecutionDataCard record={record} t={t} />
        <TransactionRecordsCard record={record} t={t} />
      </>
    );
  }

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
            className="absolute left-3 flex size-6 touch-manipulation items-center justify-center [-webkit-tap-highlight-color:transparent]"
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
            {t("earnings.transactionDetailTitle")}
          </h1>
        </header>

        <div className={`${stackY3} min-h-0 flex-1 overflow-y-auto px-3 pb-safe-compat`}>
          {content}
        </div>
      </div>
    </div>
  );
}

function SummaryCard({
  record,
  timeRangeText,
  t,
}: {
  record: ArbitrageLatestItem;
  timeRangeText: string;
  t: (key: string) => string;
}) {
  return (
    <section className={`${DETAIL_CARD} flex flex-col`}>
      <div className="flex h-[26px] w-full items-center justify-between">
        <div className="flex items-center">
          <span className="mr-2 inline-flex h-[22px] items-center rounded-[7px] bg-[#fff1f2] px-2">
            <span className="text-[10px] font-semibold leading-[14px] text-[#e01e2c]">
              {formatChainLabel(record.chain)}
            </span>
          </span>
          <span className="text-lg font-semibold leading-6 text-[#1a1a1a]">
            {formatTradingPair(record.tokenSymbol)}
          </span>
        </div>
        <span className="inline-flex h-6 items-center rounded-lg bg-[#ecf8f1] px-2">
          <span className="mr-1 text-xs font-semibold leading-4 text-[#16a855]">
            {formatProfitRate(record.profitRate)}
          </span>
          <span className="text-[10px] leading-[14px] text-[#16a855]">
            {t("earnings.roi")}
          </span>
        </span>
      </div>

      <div className="mt-3 flex flex-col">
        <span className="text-xs leading-[18px] text-black">
          {t("earnings.netProfit")}
        </span>
        <div className="mt-0.5 flex items-baseline">
          <span className="mr-1.5 font-mulish text-[28px] font-bold leading-[34px] text-[#16a855]">
            {formatProfitAmount(record.profitAmount)}
          </span>
          <span className="text-xs leading-[18px] text-[#5c5252]">
            {TX_CURRENCY}
          </span>
        </div>
      </div>

      <div className="my-3 h-px w-full bg-[#ece7e7]" />

      <span className="text-xs leading-[18px] text-black">
        {t("earnings.arbitrageRoute")}
      </span>

      <div className="mt-3 flex h-[70px] w-full items-center justify-between rounded-[12px] bg-[#fbf8f8] px-3.5 py-2.5">
        <div className="flex w-[110px] flex-col">
          <span className="text-sm leading-4 text-black">
            {t("earnings.buy")}
          </span>
          <span className="mt-0.5 text-base font-semibold leading-[22px] text-[#1a1a1a]">
            {formatPlatformName(record.buyPlatform)}
          </span>
        </div>
        <span className="flex size-[34px] shrink-0 items-center justify-center rounded-full bg-white">
          <AppImage
            src={earningsAssets.recordArrow}
            alt=""
            width={16}
            height={16}
            className="size-4 -scale-y-100 rotate-90 opacity-55"
            aria-hidden
          />
        </span>
        <div className="flex w-[110px] flex-col items-end text-right">
          <span className="text-sm leading-4 text-black">
            {t("earnings.sell")}
          </span>
          <span className="mt-0.5 text-base font-semibold leading-[22px] text-[#1a1a1a]">
            {formatPlatformName(record.sellPlatform)}
          </span>
        </div>
      </div>

      <p className="mt-3 text-[11px] leading-[18px] text-black">
        {timeRangeText}
      </p>
    </section>
  );
}

function ExecutionDataCard({
  record,
  t,
}: {
  record: ArbitrageLatestItem;
  t: (key: string) => string;
}) {
  const tokenSymbol = record.tokenSymbol?.toUpperCase() || "—";
  const feeSymbol = record.feeSymbol?.toUpperCase() || tokenSymbol;

  return (
    <section className={`${DETAIL_CARD} flex flex-col`}>
      <SectionHeader title={t("earnings.executionData")} />

      <div className="mt-3 flex h-[76px] w-full items-center justify-between rounded-[12px] bg-[#fbf8f8] px-3.5">
        <div className="flex w-[132px] flex-col">
          <span className="text-sm leading-4 text-black">
            {t("earnings.buyPrice")}
          </span>
          <div className="mt-1 flex items-baseline">
            <span className="mr-1 font-mulish text-[15px] font-semibold leading-5 text-[#1a1a1a]">
              {formatDecimalValue(record.buyPrice)}
            </span>
            <span className="text-[10px] leading-[14px] text-[#5c5252]">
              {TX_CURRENCY}
            </span>
          </div>
        </div>
        <span className="h-11 w-px shrink-0 bg-[#ece7e7]" aria-hidden />
        <div className="flex w-[132px] flex-col items-end text-right">
          <span className="text-sm leading-4 text-black">
            {t("earnings.sellPrice")}
          </span>
          <div className="mt-1 flex items-baseline justify-end">
            <span className="mr-1 font-mulish text-[15px] font-semibold leading-5 text-[#1a1a1a]">
              {formatDecimalValue(record.sellPrice)}
            </span>
            <span className="text-[10px] leading-[14px] text-[#5c5252]">
              {TX_CURRENCY}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-col">
        <DetailRow
          label={t("earnings.spreadRate")}
          value={formatSpreadRate(record.spreadRate)}
          valueClassName="text-[#16a855]"
        />
        <DetailDivider />
        <DetailRow
          label={t("earnings.buyAmount")}
          value={`${formatDecimalValue(record.buyStableAmount)} ${TX_CURRENCY}`}
        />
        <DetailDivider />
        <DetailRow
          label={t("earnings.sellAmount")}
          value={`${formatDecimalValue(record.sellStableAmount)} ${TX_CURRENCY}`}
        />
        <DetailDivider />
        <DetailRow
          label={t("earnings.tokenAmount")}
          value={`${formatDecimalValue(record.tokenAmount)} ${tokenSymbol}`}
        />
        <DetailDivider />
        <DetailRow
          label={t("earnings.fee")}
          value={`${formatDecimalValue(record.totalFeeAmount)} ${feeSymbol}`}
        />
      </div>
    </section>
  );
}

function TransactionRecordsCard({
  record,
  t,
}: {
  record: ArbitrageLatestItem;
  t: (key: string) => string;
}) {
  const links = [
    {
      label: t("earnings.explorerTx1"),
      url: getExplorerTxUrl(record.chain, record.buyTxHash ?? ""),
    },
    {
      label: t("earnings.explorerTx2"),
      url: getExplorerTxUrl(record.chain, record.sellTxHash ?? ""),
    },
  ];

  return (
    <section className={`${DETAIL_CARD} flex flex-col`}>
      <SectionHeader title={t("earnings.transactionRecords")} />

      <div className="mt-3 flex flex-col">
        {links.map((link, index) => (
          <React.Fragment key={link.label}>
            {index > 0 ? <div className="h-3" aria-hidden /> : null}
            <ExplorerLinkButton
              label={link.label}
              url={link.url}
            />
          </React.Fragment>
        ))}
      </div>
    </section>
  );
}

function ExplorerLinkButton({
  label,
  url,
}: {
  label: string;
  url: string | null;
}) {
  const handleOpen = () => {
    if (!url) return;
    window.location.assign(url);
  };

  return (
    <button
      type="button"
      onClick={handleOpen}
      disabled={!url}
      className="flex h-[49px] w-full touch-manipulation items-center justify-between rounded-[9px] border border-[#dcdcdc] bg-white px-3 text-left disabled:cursor-default disabled:opacity-50 [-webkit-tap-highlight-color:transparent]"
    >
      <span className="min-w-0 truncate text-sm leading-[18px] text-black">
        {label}
      </span>
      <AppImage
        src={teamAssets.detailArrow}
        alt=""
        width={24}
        height={24}
        className="ml-2 size-6 shrink-0 -scale-y-100 rotate-90 opacity-50"
        aria-hidden
      />
    </button>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="flex h-[22px] items-center">
      <span
        className="mr-2 h-[18px] w-[3px] shrink-0 rounded-[2px] bg-[#e01e2c]"
        aria-hidden
      />
      <h2 className="text-base font-semibold leading-[22px] text-[#1a1a1a]">
        {title}
      </h2>
    </div>
  );
}

function DetailRow({
  label,
  value,
  valueClassName = "text-[#1a1a1a]",
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="flex h-9 w-full items-center justify-between text-sm leading-5">
      <span className="shrink-0 text-black">{label}</span>
      <span className={`font-mulish font-medium ${valueClassName}`}>{value}</span>
    </div>
  );
}

function DetailDivider() {
  return <div className="h-px w-full bg-[rgba(236,231,231,0.85)]" />;
}
