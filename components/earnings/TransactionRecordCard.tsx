"use client";

import React, { Fragment } from "react";
import { useRouter } from "next/navigation";
import { AppImage } from "@/components/AppImage";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { earningsAssets } from "./assets";
import { getArbitrageLatest, type ArbitrageLatestItem } from "@/lib/api/arbitrage";
import {
  formatChainLabel,
  formatCloseTime,
  formatPlatformName,
  formatProfitAmount,
  formatProfitRate,
  formatTradingPair,
  TX_CURRENCY,
} from "@/lib/earnings/arbitrageFormat";
import { cacheTransactionDetail } from "@/lib/earnings/transactionDetailCache";
import { useQuery } from "@tanstack/react-query";

const PAGE_SIZE = 7;
const TX_POLL_INTERVAL_MS = 5000;

export function TransactionRecordCard() {
  const { t } = useTranslation();
  const listScrollRef = React.useRef<HTMLDivElement>(null);

  const {
    data: txResponse,
    isPending,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["arbitrageLatest", PAGE_SIZE],
    queryFn: () => getArbitrageLatest({ limit: PAGE_SIZE }),
    refetchInterval: TX_POLL_INTERVAL_MS,
    refetchOnWindowFocus: true,
  });

  React.useEffect(() => {
    const handlePageShow = () => {
      void refetch();
    };
    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, [refetch]);

  const rawList = txResponse?.data;
  const records = Array.isArray(rawList) ? rawList.slice(0, PAGE_SIZE) : [];
  const isInitialLoading = isPending && !txResponse;
  const hasRecords = records.length > 0;

  return (
    <section className="flex min-h-0 w-full min-w-0 flex-1 flex-col gap-[10px] overflow-hidden rounded-[12px] bg-white/80 p-3 shadow-[0_5px_10px_rgba(51,51,51,0.08)] backdrop-blur-[7px]">
      <div className="flex h-[27px] shrink-0 items-center justify-between gap-2 overflow-hidden">
        <div className="flex min-w-0 items-center gap-[3px]">
          <div className="relative size-[22px] shrink-0 overflow-hidden">
            <AppImage
              src={earningsAssets.txIcon}
              alt=""
              width={22}
              height={22}
              className="absolute h-[135.06%] w-[136.84%] max-w-none -left-[18.42%] -top-[16.88%]"
            />
          </div>
          <h2 className="truncate text-base font-semibold leading-[22px] text-black/80">
            {t("earnings.transactionRecord")}
          </h2>
        </div>
        <span className="inline-flex h-6 shrink-0 items-center gap-1.5 rounded-[41px] bg-[rgba(231,231,231,0.5)] pl-1.5 pr-2.5">
          <span
            className="relative flex size-3 shrink-0 items-center justify-center"
            aria-hidden
          >
            <span className="absolute size-3 animate-ping rounded-full bg-[rgba(255,42,42,0.45)]" />
            <span className="relative size-2 rounded-full bg-[#ff2a2a] animate-realtime-dot" />
          </span>
          <span className="text-sm leading-normal text-black">
            {t("earnings.realtime")}
          </span>
        </span>
      </div>

      <RecordDivider />

      <div
        ref={listScrollRef}
        className="flex min-h-0 flex-1 flex-col overflow-y-auto"
      >
        {isInitialLoading ? (
          <div className="flex flex-1 items-center justify-center py-12 text-sm text-black/50">
            {t("common.loading")}
          </div>
        ) : isError ? (
          <div className="flex flex-1 items-center justify-center py-12 text-sm text-black/50">
            {t("common.operationFailed")}
          </div>
        ) : !hasRecords ? (
          <div className="flex flex-1 items-center justify-center py-12 text-sm text-black/50">
            {t("earnings.noTransactions")}
          </div>
        ) : (
          records.map((record, index) => (
            <Fragment key={record.id ?? `${record.sellTxHash}-${index}`}>
              <TransactionRow record={record} />
              {index < records.length - 1 ? <RecordDivider /> : null}
            </Fragment>
          ))
        )}
      </div>
    </section>
  );
}

function RecordDivider() {
  return (
    <div className="relative h-0 w-full shrink-0">
      <AppImage
        src={earningsAssets.txDivider}
        alt=""
        width={327}
        height={1}
        className="absolute inset-x-0 top-0 h-px w-full"
      />
    </div>
  );
}

function TransactionRow({ record }: { record: ArbitrageLatestItem }) {
  const router = useRouter();

  const handleOpenDetail = () => {
    if (!record.id) return;
    cacheTransactionDetail(record.id, record);
    router.push(`/earnings/transaction/${record.id}`);
  };

  return (
    <button
      type="button"
      onClick={handleOpenDetail}
      disabled={!record.id}
      className="flex w-full shrink-0 appearance-none flex-col gap-[5px] border-0 bg-transparent py-2 text-left transition-opacity disabled:cursor-default active:opacity-70"
    >
      <div className="flex h-4 w-full items-center justify-between">
        <span className="shrink-0 whitespace-nowrap text-[11px] leading-4 text-[#9c8787]">
          {formatCloseTime(record.closeTime)}
        </span>
        <span className="inline-flex h-4 shrink-0 items-center justify-center rounded-lg bg-[#fff1f2] px-1.5">
          <span className="text-[9px] font-semibold leading-3 text-[#e01e2c]">
            {formatChainLabel(record.chain)}
          </span>
        </span>
      </div>

      <div className="flex h-6 w-full items-center justify-between">
        <span className="min-w-0 truncate pr-2 text-base font-semibold leading-[22px] text-[#1a1a1a]">
          {formatTradingPair(record.tokenSymbol)}
        </span>
        <div className="flex shrink-0 items-end gap-1">
          <span className="font-mulish text-base font-semibold leading-[22px] text-[#16a855]">
            {formatProfitAmount(record.profitAmount)}
          </span>
          <span className="pb-px text-[10px] leading-4 text-[#665c5c]">
            {TX_CURRENCY}
          </span>
        </div>
      </div>

      <div className="flex h-[18px] w-full items-center justify-between">
        <div className="flex min-w-0 items-center gap-1.5 pr-2">
          <span className="truncate text-xs leading-[18px] text-[#665c5c]">
            {formatPlatformName(record.buyPlatform)}
          </span>
          <AppImage
            src={earningsAssets.recordArrow}
            alt=""
            width={10}
            height={10}
            className="size-2.5 shrink-0 -scale-y-100 rotate-90 opacity-35"
            aria-hidden
          />
          <span className="truncate text-xs leading-[18px] text-[#665c5c]">
            {formatPlatformName(record.sellPlatform)}
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-[5px]">
          <span className="inline-flex h-[22px] items-center justify-center rounded-[7px] bg-[#ecf8f1] px-[7px] text-[11px] font-semibold leading-4 text-[#16a855]">
            {formatProfitRate(record.profitRate)}
          </span>
          <AppImage
            src={earningsAssets.recordArrow}
            alt=""
            width={12}
            height={12}
            className="size-3 shrink-0 -scale-y-100 rotate-90 opacity-40"
            aria-hidden
          />
        </div>
      </div>
    </button>
  );
}
