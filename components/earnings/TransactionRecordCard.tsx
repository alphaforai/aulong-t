"use client";

import React, { Fragment } from "react";
import { AppImage } from "@/components/AppImage";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { earningsAssets } from "./assets";
// import { mineAssets } from "@/components/mine/assets";
import { getSolanablockinfoPage } from "@/lib/api/users";
import { useQuery } from "@tanstack/react-query";
import { formatAmount } from "@/components/team/format";

const PAGE_SIZE = 7;
const TX_POLL_INTERVAL_MS = 2000;
const TX_CURRENCY = "USDT";
const SOLANA_EXPLORER_ADDRESS_BASE = "https://explorer.solana.com/address/";

type SolanaBlockItem = {
  id?: number;
  slot?: number;
  blockHash?: string;
  leader?: string;
  txCount?: number;
  totalFee?: number;
  totalReward?: number;
  relatedTxCount?: number;
  relatedTotalFee?: number;
  relatedTotalReward?: number;
  blockTime?: number;
  blockTimeAt?: string;
  createdAt?: string;
};

function shortAddress(value?: string | null) {
  if (!value || typeof value !== "string") return "—";
  const address = value.trim();
  if (address.length <= 13) return address;
  return `${address.slice(0, 8)}...${address.slice(-4)}`;
}

function formatBlockTime(value?: string | null) {
  if (!value || typeof value !== "string") return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();
  const h = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  const s = String(date.getSeconds()).padStart(2, "0");
  return `${y}.${m}.${d} ${h}:${min}:${s}`;
}

export function TransactionRecordCard() {
  const { t } = useTranslation();
  const listScrollRef = React.useRef<HTMLDivElement>(null);
  // const [page, setPage] = React.useState(0);

  const {
    data: txResponse,
    isPending,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["solanaBlockInfoPage"],
    queryFn: () =>
      getSolanablockinfoPage({
        page: 0,
        limit: PAGE_SIZE,
        searchCount: false,
        lastId: undefined,
        slot: undefined,
        blockHash: undefined,
        leader: undefined,
      }),
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

  const rawList = (
    txResponse?.data as { list?: SolanaBlockItem[]; total?: number } | undefined
  )?.list;
  const records = Array.isArray(rawList) ? rawList.slice(0, PAGE_SIZE) : [];
  // const totalRaw = Number(
  //   (txResponse?.data as { total?: number } | undefined)?.total,
  // );
  // const totalSafe = Number.isFinite(totalRaw)
  //   ? Math.max(0, Math.trunc(totalRaw))
  //   : 0;
  // const totalPages = totalSafe === 0 ? 1 : Math.ceil(totalSafe / PAGE_SIZE);
  // const canPrev = page > 0;
  // const canNext = totalSafe > 0 && page + 1 < totalPages;
  const isInitialLoading = isPending && !txResponse;
  const hasRecords = records.length > 0;

  // const goToPage = React.useCallback((nextPage: number) => {
  //   setPage(Math.max(0, nextPage));
  //   listScrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  // }, []);

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
            <Fragment key={record.id ?? `${record.blockHash}-${index}`}>
              <TransactionRow
                address={record.leader || record.blockHash}
                amount={`+${formatAmount(record.relatedTotalReward)}`}
                currency={TX_CURRENCY}
                time={formatBlockTime(record.blockTimeAt || record.createdAt)}
                tradeTimeLabel={t("earnings.tradeTime")}
              />
              {index < records.length - 1 ? <RecordDivider /> : null}
            </Fragment>
          ))
        )}
      </div>

      {/* {totalSafe > PAGE_SIZE ? (
        <TransactionPagination
          page={page}
          totalPages={totalPages}
          canPrev={canPrev}
          canNext={canNext}
          loading={listPending}
          onPrev={() => goToPage(page - 1)}
          onNext={() => goToPage(page + 1)}
          onPageChange={goToPage}
          t={t}
        />
      ) : null} */}
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

function TransactionRow({
  address,
  amount,
  currency,
  time,
  tradeTimeLabel,
}: {
  address?: string | null;
  amount: string;
  currency: string;
  time: string;
  tradeTimeLabel: string;
}) {
  const fullAddress = address?.trim() ?? "";
  const explorerUrl = fullAddress
    ? `${SOLANA_EXPLORER_ADDRESS_BASE}${fullAddress}`
    : null;

  const handleOpenExplorer = () => {
    if (!explorerUrl) return;
    window.location.assign(explorerUrl);
  };

  return (
    <button
      type="button"
      onClick={handleOpenExplorer}
      disabled={!explorerUrl}
      className="flex w-full shrink-0 flex-col gap-2 py-3 text-left transition-opacity disabled:cursor-default active:opacity-70"
    >
      <div className="flex items-start justify-between">
        <p className="text-xs leading-5 tracking-[0.1px] text-black">
          {shortAddress(fullAddress)}
        </p>
        <span className="text-xs leading-5 text-black">{tradeTimeLabel}</span>
      </div>
      <div className="flex items-end justify-between">
        <div className="flex items-end gap-1.5">
          <span className="font-mulish text-lg font-semibold leading-none text-[#138144]">
            {amount}
          </span>
          <span className="pb-px text-xs leading-none text-black/70">
            {currency}
          </span>
        </div>
        <span className="text-xs leading-none text-black/70">{time}</span>
      </div>
    </button>
  );
}

/*
function buildPageRange(
  current: number,
  total: number,
): Array<number | "ellipsis"> {
  if (total <= 0) return [];
  if (total <= 7) {
    return Array.from({ length: total }, (_, index) => index);
  }

  const indices = new Set<number>([0, total - 1]);
  for (let i = current - 1; i <= current + 1; i++) {
    if (i >= 0 && i < total) indices.add(i);
  }

  const sorted = [...indices].sort((a, b) => a - b);
  const range: Array<number | "ellipsis"> = [];
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) {
      range.push("ellipsis");
    }
    range.push(sorted[i]);
  }
  return range;
}

function TransactionPagination({
  page,
  totalPages,
  canPrev,
  canNext,
  loading,
  onPrev,
  onNext,
  onPageChange,
  t,
}: {
  page: number;
  totalPages: number;
  canPrev: boolean;
  canNext: boolean;
  loading?: boolean;
  onPrev: () => void;
  onNext: () => void;
  onPageChange: (page: number) => void;
  t: (key: string) => string;
}) {
  const items = buildPageRange(page, totalPages);

  return (
    <nav
      className="flex shrink-0 items-center justify-center gap-[6px] py-2"
      aria-label={t("mine.paginationAria")}
      aria-busy={loading}
    >
      <PaginationNavButton
        src={mineAssets.pageChevronLeft}
        label={t("mine.prevPage")}
        disabled={loading || !canPrev}
        onClick={onPrev}
      />

      {items.map((item, index) =>
        item === "ellipsis" ? (
          <PageEllipsisDots key={`ellipsis-${index}`} />
        ) : (
          <button
            key={item}
            type="button"
            disabled={loading}
            onClick={() => onPageChange(item)}
            className={`flex h-5 min-w-5 items-center justify-center rounded-[2px] text-xs leading-normal disabled:opacity-50 ${
              item === page
                ? "w-5 bg-[#ff4646] px-[9px] py-0.5 text-white/90"
                : "w-5 border-[0.5px] border-white bg-white px-2 py-0.5 text-black/90"
            }`}
          >
            {item + 1}
          </button>
        ),
      )}

      <PaginationNavButton
        src={mineAssets.pageChevronRight}
        label={t("mine.nextPage")}
        disabled={loading || !canNext}
        onClick={onNext}
      />
    </nav>
  );
}

function PageEllipsisDots() {
  return (
    <span
      className="flex size-[22.5px] shrink-0 items-center justify-center"
      aria-hidden
    >
      <span className="inline-flex items-center gap-[3px]">
        <span className="size-[2px] rounded-full bg-[rgba(255,0,0,0.9)]" />
        <span className="size-[2px] rounded-full bg-[rgba(255,0,0,0.9)]" />
        <span className="size-[2px] rounded-full bg-[rgba(255,0,0,0.9)]" />
      </span>
    </span>
  );
}

function PaginationNavButton({
  src,
  label,
  disabled,
  onClick,
}: {
  src: string;
  label: string;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="flex size-[22.5px] shrink-0 items-center justify-center rounded-[2px] disabled:cursor-not-allowed disabled:opacity-40"
    >
      <AppImage
        src={src}
        alt=""
        width={9}
        height={9}
        className="size-[9px] shrink-0"
      />
    </button>
  );
}
*/
