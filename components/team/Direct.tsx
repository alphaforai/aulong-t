"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import AulongHeader from "@/components/AulongHeader";
import { AppImage } from "@/components/AppImage";
import { mineAssets } from "@/components/mine/assets";
import { getTeamDirectPage } from "@/lib/api/users";
import { useUserInfoStore } from "@/lib/store";
import {
  sidePanelOverlayFrame,
  sidePanelOverlayRoot,
} from "@/lib/mobileShell";
import { getTeamVipBadgeSrc, teamAssets } from "./assets";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { formatAmount } from "./format";

const PAGE_SIZE = 5;

type DirectReferralRow = {
  walletAddress?: string;
  registerTime?: string;
  vipLevel?: number;
  totalStakeAmount?: number;
  teamTotalStakeAmount?: number;
  lineStake?: number;
  largeRegionVirtual?: boolean;
  manualBigBranchLine?: boolean;
};

export type DirectPanelProps = {
  open: boolean;
  onClose: () => void;
};

type DirectReferralPageData = {
  list?: DirectReferralRow[];
  total?: number;
};

export function DirectPanel({ open, onClose }: DirectPanelProps) {
  const { t } = useTranslation();
  const [entered, setEntered] = React.useState(false);
  const [page, setPage] = React.useState(0);
  const listScrollRef = React.useRef<HTMLDivElement>(null);
  const walletAddress = useUserInfoStore((state) => state.userInfo.walletAddress);

  React.useEffect(() => {
    setPage(0);
  }, [walletAddress]);

  const closePanel = React.useCallback(() => {
    setEntered(false);
    window.setTimeout(() => onClose(), 300);
  }, [onClose]);

  React.useEffect(() => {
    if (!open) {
      setEntered(false);
      return;
    }
    setPage(0);
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

  const {
    data: teamDirectPageResponse,
    isPending,
    isFetching,
    isError,
  } = useQuery({
    queryKey: ["teamDirectPage", walletAddress, page],
    queryFn: () =>
      getTeamDirectPage({
        page,
        limit: PAGE_SIZE,
        searchCount: true,
      }),
    enabled: open && Boolean(walletAddress),
  });

  const directData = teamDirectPageResponse?.data as
    | DirectReferralPageData
    | undefined;
  const rawList = directData?.list;
  const list = Array.isArray(rawList) ? rawList : [];
  const directTotal = Number(directData?.total);
  const totalSafe = Number.isFinite(directTotal)
    ? Math.max(0, Math.trunc(directTotal))
    : 0;
  const totalPages = totalSafe === 0 ? 1 : Math.ceil(totalSafe / PAGE_SIZE);
  const canPrev = page > 0;
  const canNext = totalSafe > 0 && page + 1 < totalPages;
  const listPending = isPending || isFetching;

  const goToPage = React.useCallback((nextPage: number) => {
    setPage(Math.max(0, nextPage));
    listScrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  if (!open) return null;

  return (
    <div
      className={`${sidePanelOverlayRoot} z-80`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="direct-panel-title"
    >
      <div className={sidePanelOverlayFrame}>
        <div
          className={`absolute inset-0 flex w-full flex-col bg-white transition-transform duration-300 ease-out ${
            entered ? "translate-x-0" : "translate-x-full"
          }`}
        >
        <div className="h-11 shrink-0 bg-white" aria-hidden />
        <AulongHeader />

        <header className="relative flex h-14 shrink-0 items-center justify-center border-b border-black/5 bg-[#f8f8f8] px-3">
          <button
            type="button"
            aria-label={t("common.back")}
            onClick={closePanel}
            className="absolute left-3 flex size-5 items-center justify-center"
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
            id="direct-panel-title"
            className="text-lg font-medium leading-6 text-[#272727]"
          >
            {t("team.directPanelTitle")}
          </h1>
        </header>

        <div
          ref={listScrollRef}
          className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-[#f8f8f8] px-3 pb-[max(env(safe-area-inset-bottom),16px)] pt-4"
        >
          <div
            className={`rounded-[12px] border border-white bg-white/80 p-3 shadow-[0_5px_10px_rgba(51,51,51,0.08)] backdrop-blur-[7px] transition-opacity ${
              listPending && !isPending ? "opacity-70" : "opacity-100"
            }`}
          >
            {!walletAddress ? (
              <p className="py-12 text-center text-sm text-[#8b8b8b]">
                {t("common.connectWallet")}
              </p>
            ) : isPending ? (
              <p className="py-12 text-center text-sm text-[#8b8b8b]">
                {t("common.loading")}
              </p>
            ) : isError ? (
              <p className="py-12 text-center text-sm text-[#8b8b8b]">
                {t("team.loadFailed")}
              </p>
            ) : list.length === 0 ? (
              <p className="py-12 text-center text-sm text-[#8b8b8b]">
                {t("team.noDirectRecords")}
              </p>
            ) : (
              <ul className="flex flex-col">
                {list.map((row, index) => (
                  <li key={`${row.walletAddress ?? "row"}-${page}-${index}`}>
                    <DirectReferralItem row={row} t={t} />
                    {index < list.length - 1 ? (
                      <div className="my-4 h-px w-full overflow-hidden">
                        <AppImage
                          src={teamAssets.directDivider}
                          alt=""
                          width={327}
                          height={1}
                          className="h-px w-full"
                        />
                      </div>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {totalSafe > PAGE_SIZE ? (
            <DirectPagination
              page={page}
              totalPages={totalPages}
              canPrev={canPrev}
              canNext={canNext}
              loading={listPending}
              onPrev={() => goToPage(Math.max(0, page - 1))}
              onNext={() => goToPage(page + 1)}
              onPageChange={goToPage}
              t={t}
            />
          ) : null}
        </div>
        </div>
      </div>
    </div>
  );
}

/** 首页 + 末页 + 当前页邻域（与 xwallet TeamStatus 共用同一套 page/total 计算） */
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

function DirectPagination({
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
      className="flex items-center justify-center gap-[6px] py-2"
      aria-label={t("team.directPaginationAria")}
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

function DirectReferralItem({
  row,
  t,
}: {
  row: DirectReferralRow;
  t: (key: string, params?: Record<string, string | number>) => string;
}) {
  const personalStake = row.totalStakeAmount ?? 0;
  const teamStake = row.teamTotalStakeAmount ?? 0;
  const amountText = formatAmount(personalStake);
  const teamStakeText = formatAmount(teamStake);
  const registerTime = formatRegisterTime(row.registerTime);

  return (
    <div className="flex items-start justify-between gap-3">
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div className="relative h-[25px] w-20 shrink-0">
          <AppImage
            src={getVipBadgeSrc(row.vipLevel)}
            alt={`VIP${Math.max(0, row.vipLevel ?? 0)}`}
            width={80}
            height={25}
            className="h-[25px] w-20 object-contain object-left"
          />
        </div>
        <p className="text-sm font-medium leading-normal text-black">
          {shortWallet(row.walletAddress)}
        </p>
        <p className="text-xs leading-5 text-[#424242]">
          {t("team.registerTimeValue", { time: registerTime })}
        </p>
        <p className="text-xs leading-5 text-[#424242]">
          {t("team.teamStakeValue", { amount: teamStakeText })}
        </p>
      </div>

      <div className="flex w-[72px] shrink-0 flex-col items-end gap-1">
        <p className="text-xs leading-normal text-[#333]">
          {t("team.personalStake")}
        </p>
        <div className="text-right">
          <p className="font-[family-name:var(--font-mulish)] text-base font-semibold leading-5 text-[#ea4747]">
            {amountText}
          </p>
          <p className="font-[family-name:var(--font-mulish)] text-xs font-medium leading-5 text-[#989898]">
            USDT
          </p>
        </div>
      </div>
    </div>
  );
}

function shortWallet(address?: string | null) {
  if (!address || typeof address !== "string") return "—";
  const value = address.trim();
  if (value.length <= 13) return value;
  return `${value.slice(0, 8)}...${value.slice(-4)}`;
}

function formatRegisterTime(value?: string | null) {
  if (!value || typeof value !== "string") return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

function getVipBadgeSrc(vipLevel?: number) {
  return getTeamVipBadgeSrc(vipLevel);
}
