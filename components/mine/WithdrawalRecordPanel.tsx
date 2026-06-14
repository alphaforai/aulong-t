"use client";

import React from "react";
import { format } from "date-fns";
import { enUS, ja, ko, ms, vi, zhCN } from "date-fns/locale";
import { type DateRange } from "react-day-picker";
import { useQuery } from "@tanstack/react-query";
import AulongHeader from "@/components/AulongHeader";
import { AppImage } from "@/components/AppImage";
import { Calendar } from "@/components/ui/calendar";
import { formatAmount, formatSignedAmount } from "@/components/team/format";
import { teamAssets } from "@/components/team/assets";
import { getStatusList, getWithdrawalPage } from "@/lib/api/users";
import { useTranslation } from "@/lib/hooks/useTranslation";
import type { Locale } from "@/lib/local";
import {
  bottomSheetOverlayFrame,
  bottomSheetOverlayRoot,
  sidePanelOverlayFrame,
  sidePanelOverlayRoot,
} from "@/lib/mobileShell";
import { useUserInfoStore } from "@/lib/store";
import {
  glassCard,
  recordRowStatic,
  rowX1,
  rowX4,
  scrollToTop,
  sheetMaxHeight,
  stackY1_5,
  stackY10,
  stackY2,
  stackY4,
} from "@/lib/mobileCompat";
import { mineAssets } from "./assets";

const PAGE_SIZE = 20;

const GRADIENT_BTN =
  "relative overflow-hidden rounded-[33px] border border-white shadow-[0_4px_6px_rgba(213,0,0,0.12)]";
const GRADIENT_FILL =
  "pointer-events-none absolute inset-0 rounded-[33px] bg-gradient-to-r from-[#ff4d00] via-[#ff3033] via-[53.846%] to-[#e90000]";
const GRADIENT_INSET =
  "pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0px_-4px_4px_0px_rgba(255,254,227,0.7),inset_0px_8px_17px_0px_#ffe5e5]";

const DATE_FNS_LOCALE: Record<Locale, typeof zhCN> = {
  zh_CN: zhCN,
  en_US: enUS,
  ko_KR: ko,
  vi_VN: vi,
  ja_JP: ja,
  ms_MY: ms,
};

const ALL_STATUS = "all";

type WithdrawalStatusFilter = typeof ALL_STATUS | string;

type StatusListItem = {
  code: string;
  name: string;
};

type WithdrawalRecordItem = {
  id?: number;
  status?: number;
  statusDesc?: string;
  amount?: number;
  currency?: string;
  feeAmountAul?: number;
  feeAmountUsdt?: number;
  balanceAfter?: number;
  balanceCurrency?: string;
  rejectReason?: string;
  createdAt?: string;
};

type FilterSheetId = "time" | "status";

type TimeFilterMode = "all" | "range";

export type WithdrawalRecordPanelProps = {
  open: boolean;
  onClose: () => void;
};

function formatRecordTime(value?: string) {
  if (!value) return "--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return format(date, "yyyy-MM-dd HH:mm");
}

function formatDateYmd(date: Date, locale: Locale) {
  return format(date, "yyyy-MM-dd", { locale: DATE_FNS_LOCALE[locale] });
}

function toDateRange(start: Date, end: Date): DateRange {
  return { from: start, to: end };
}

function resolveStatusLabel(
  status: number | undefined,
  statusDesc: string | undefined,
  statusNameByCode: Map<string, string>,
) {
  if (statusDesc) return statusDesc;
  if (status != null) {
    const fromList = statusNameByCode.get(String(status));
    if (fromList) return fromList;
  }
  return "--";
}

function resolveStatusTone(status?: number) {
  switch (status) {
    case 1:
      return "pending";
    case 2:
      return "success";
    case 3:
      return "rejected";
    default:
      return "default";
  }
}

function formatFeeLine(
  record: WithdrawalRecordItem,
  t: (key: string) => string,
) {
  const aul = Number(record.feeAmountAul ?? 0);
  const usdt = Number(record.feeAmountUsdt ?? 0);
  const parts: string[] = [];
  if (aul > 0) parts.push(`${formatAmount(aul)} AUL`);
  if (usdt > 0) parts.push(`${formatAmount(usdt)} USDT`);
  if (parts.length === 0) return null;
  return `${t("mine.withdrawRecordFee")} ${parts.join(" + ")}`;
}

export function WithdrawalRecordPanel({ open, onClose }: WithdrawalRecordPanelProps) {
  const { t, locale } = useTranslation();
  const walletAddress = useUserInfoStore((state) => state.userInfo.walletAddress);
  const [entered, setEntered] = React.useState(false);
  const [page, setPage] = React.useState(0);
  const [activeSheet, setActiveSheet] = React.useState<FilterSheetId | null>(null);
  const [selectedStatus, setSelectedStatus] =
    React.useState<WithdrawalStatusFilter>(ALL_STATUS);
  const [timeFilterMode, setTimeFilterMode] =
    React.useState<TimeFilterMode>("all");
  const [startDate, setStartDate] = React.useState(() => new Date());
  const [endDate, setEndDate] = React.useState(() => new Date());
  const listScrollRef = React.useRef<HTMLDivElement>(null);

  const closePanel = React.useCallback(() => {
    setEntered(false);
    window.setTimeout(() => onClose(), 300);
  }, [onClose]);

  const resetFilters = React.useCallback(() => {
    setPage(0);
    setActiveSheet(null);
    setSelectedStatus(ALL_STATUS);
    setTimeFilterMode("all");
    setStartDate(new Date());
    setEndDate(new Date());
  }, []);

  React.useEffect(() => {
    if (!open) {
      setEntered(false);
      resetFilters();
      return;
    }
    const frame = requestAnimationFrame(() => {
      requestAnimationFrame(() => setEntered(true));
    });
    return () => cancelAnimationFrame(frame);
  }, [open, resetFilters]);

  React.useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closePanel();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, closePanel]);

  React.useEffect(() => {
    setPage(0);
  }, [walletAddress, selectedStatus, timeFilterMode, startDate, endDate]);

  const createdAtStart =
    timeFilterMode === "range" ? formatDateYmd(startDate, locale) : undefined;
  const createdAtEnd =
    timeFilterMode === "range" ? formatDateYmd(endDate, locale) : undefined;
  const statusFilter =
    selectedStatus === ALL_STATUS ? undefined : Number(selectedStatus);

  const { data: statusListResponse, isPending: statusListPending } = useQuery({
    queryKey: ["withdrawalStatusList", locale],
    queryFn: getStatusList,
    enabled: open,
  });

  const apiStatusList = React.useMemo<StatusListItem[]>(() => {
    const raw = statusListResponse?.data;
    if (!Array.isArray(raw)) return [];
    return raw.flatMap((item) => {
      if (!item || typeof item !== "object") return [];
      const { code, name } = item as { code?: string | number; name?: string };
      if (code == null || String(code).trim() === "") return [];
      if (typeof name !== "string") return [];
      return [{ code: String(code), name }];
    });
  }, [statusListResponse]);

  const statusNameByCode = React.useMemo(
    () => new Map(apiStatusList.map((item) => [item.code, item.name])),
    [apiStatusList],
  );

  const statusOptions = React.useMemo(
    () => [
      { value: ALL_STATUS, label: t("mine.withdrawRecordStatusAll") },
      ...apiStatusList.map((item) => ({
        value: item.code,
        label: item.name,
      })),
    ],
    [apiStatusList, t],
  );

  React.useEffect(() => {
    if (selectedStatus === ALL_STATUS) return;
    if (apiStatusList.length === 0) return;
    if (!apiStatusList.some((item) => item.code === selectedStatus)) {
      setSelectedStatus(ALL_STATUS);
    }
  }, [apiStatusList, selectedStatus]);

  const {
    data: withdrawalPageResponse,
    isPending,
    isFetching,
    isError,
  } = useQuery({
    queryKey: [
      "withdrawalPage",
      walletAddress,
      locale,
      page,
      selectedStatus,
      timeFilterMode,
      createdAtStart,
      createdAtEnd,
    ],
    queryFn: () =>
      getWithdrawalPage({
        page,
        limit: PAGE_SIZE,
        searchCount: true,
        status: statusFilter,
        createdAtStart,
        createdAtEnd,
      }),
    enabled: open && Boolean(walletAddress),
  });

  const rawList = (
    withdrawalPageResponse?.data as
      | { list?: WithdrawalRecordItem[]; total?: number }
      | undefined
  )?.list;
  const records = Array.isArray(rawList) ? rawList : [];
  const totalRaw = Number(
    (withdrawalPageResponse?.data as { total?: number } | undefined)?.total,
  );
  const totalSafe = Number.isFinite(totalRaw)
    ? Math.max(0, Math.trunc(totalRaw))
    : 0;
  const totalPages = totalSafe === 0 ? 1 : Math.ceil(totalSafe / PAGE_SIZE);
  const canPrev = page > 0;
  const canNext = totalSafe > 0 && page + 1 < totalPages;
  const listPending = isPending || isFetching;

  const goToPage = React.useCallback((nextPage: number) => {
    setPage(Math.max(0, nextPage));
    scrollToTop(listScrollRef.current);
  }, []);

  const statusLabel =
    statusOptions.find((item) => item.value === selectedStatus)?.label ??
    t("mine.withdrawRecordFilterStatus");

  const timeLabel = `${formatDateYmd(startDate, locale)} ~ ${formatDateYmd(endDate, locale)}`;

  if (!open) return null;

  return (
    <>
      <div
        className={`${sidePanelOverlayRoot} z-85`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="withdrawal-record-title"
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
                id="withdrawal-record-title"
                className="text-lg font-medium leading-[26px] text-[#272727]"
              >
                {t("mine.withdrawRecordTitle")}
              </h1>
            </header>

            <div
              ref={listScrollRef}
              className="flex min-h-0 flex-1 flex-col overflow-y-auto px-3 pt-4 pb-safe-compat"
            >
              <div
                className={`${stackY10} ${glassCard} transition-opacity ${
                  listPending && !isPending ? "opacity-70" : "opacity-100"
                }`}
              >
                <div className={rowX4}>
                  <FilterButton
                    label={
                      timeFilterMode === "all"
                        ? t("mine.withdrawRecordFilterTime")
                        : timeLabel
                    }
                    onClick={() => setActiveSheet("time")}
                  />
                  <FilterButton
                    label={
                      selectedStatus === ALL_STATUS
                        ? t("mine.withdrawRecordFilterStatus")
                        : statusLabel
                    }
                    onClick={() => setActiveSheet("status")}
                  />
                </div>

                <RowDivider />

                {!walletAddress ? (
                  <EmptyState message={t("common.connectWallet")} />
                ) : isPending ? (
                  <EmptyState message={t("common.loading")} />
                ) : isError ? (
                  <EmptyState message={t("mine.withdrawRecordLoadFailed")} />
                ) : records.length === 0 ? (
                  <EmptyState message={t("mine.withdrawRecordEmpty")} />
                ) : (
                  <ul className="flex flex-col" role="list">
                    {records.map((record, index) => (
                      <li key={record.id ?? `${page}-${index}`} role="listitem">
                        <WithdrawalRecordRow
                          record={record}
                          statusNameByCode={statusNameByCode}
                          t={t}
                        />
                        {index < records.length - 1 ? (
                          <RowDivider className="mt-4" />
                        ) : null}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {walletAddress && totalSafe > PAGE_SIZE ? (
                <FundPagination
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
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <StatusFilterSheet
        open={activeSheet === "status"}
        title={t("mine.withdrawRecordFilterStatus")}
        options={statusOptions}
        loading={statusListPending}
        selected={selectedStatus}
        onSelect={(value) => {
          setSelectedStatus(value);
          setActiveSheet(null);
        }}
        onClose={() => setActiveSheet(null)}
      />

      <TimeFilterSheet
        open={activeSheet === "time"}
        title={t("mine.withdrawRecordFilterTime")}
        locale={locale}
        mode={timeFilterMode}
        startDate={startDate}
        endDate={endDate}
        onConfirm={(mode, start, end) => {
          setTimeFilterMode(mode);
          if (mode === "range" && start) {
            setStartDate(start);
            setEndDate(end ?? start);
          }
          setActiveSheet(null);
        }}
        onClose={() => setActiveSheet(null)}
      />
    </>
  );
}

function FilterButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex min-w-0 items-center space-x-1 text-sm leading-normal text-[#333]`}
    >
      <span className="truncate">{label}</span>
      <AppImage
        src={mineAssets.chevronDown}
        alt=""
        width={12}
        height={12}
        className="block h-3 w-3 shrink-0"
      />
    </button>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <p className="py-12 text-center text-sm text-[#8b8b8b]">{message}</p>
  );
}

function RowDivider({ className = "" }: { className?: string }) {
  return (
    <div className={`relative h-px w-full shrink-0 overflow-hidden ${className}`}>
      <AppImage
        src={mineAssets.fundDividerRow}
        alt=""
        width={327}
        height={1}
        className="h-px w-full"
      />
    </div>
  );
}

function formatDisplayAmount(amount: number, statusTone: ReturnType<typeof resolveStatusTone>) {
  const n = Number(amount);
  if (!Number.isFinite(n)) {
    return { value: 0, isRefund: false };
  }
  if (statusTone === "rejected") {
    return { value: Math.abs(n), isRefund: true };
  }
  if (n === 0) {
    return { value: 0, isRefund: false };
  }
  return { value: -Math.abs(n), isRefund: false };
}

function WithdrawalRecordRow({
  record,
  statusNameByCode,
  t,
}: {
  record: WithdrawalRecordItem;
  statusNameByCode: Map<string, string>;
  t: (key: string, params?: Record<string, string | number>) => string;
}) {
  const statusTone = resolveStatusTone(record.status);
  const statusLabel = resolveStatusLabel(
    record.status,
    record.statusDesc,
    statusNameByCode,
  );
  const amount = Number(record.amount ?? 0);
  const feeLine = formatFeeLine(record, t);
  const balanceCurrency = record.balanceCurrency ?? record.currency ?? "";
  const balanceText = `${t("common.balancePrefix")}${formatAmount(record.balanceAfter)} ${balanceCurrency}`.trim();
  const hasReason = Boolean(record.rejectReason?.trim());

  const statusClass =
    statusTone === "pending"
      ? "text-[#9e6f6f]"
      : statusTone === "success"
        ? "text-[#129a48]"
        : statusTone === "rejected"
          ? "text-[#f50404]"
          : "text-[#333]";

  const { value: displayAmount, isRefund } = formatDisplayAmount(amount, statusTone);
  const amountClass = isRefund ? "text-[#ea4747]" : "text-[#129a48]";

  return (
    <div className={recordRowStatic}>
      <div className="flex items-end justify-between">
        <div className="flex min-h-[73px] min-w-0 flex-1 flex-col justify-between pr-3">
          <p className={`text-base font-medium leading-normal ${statusClass}`}>
            {statusLabel}
          </p>
          <p className="text-xs leading-normal text-[#707070]">
            {formatRecordTime(record.createdAt)}
          </p>
        </div>

        <div className="flex min-h-[73px] shrink-0 flex-col items-end justify-between text-right">
          <p
            className={`font-mulish text-base font-semibold leading-normal whitespace-nowrap ${amountClass}`}
          >
            {formatSignedAmount(displayAmount)}
          </p>
          {feeLine ? (
            <p className="text-xs leading-normal text-[#707070] whitespace-nowrap">
              {feeLine}
            </p>
          ) : (
            <span className="block h-3" aria-hidden />
          )}
          <p className="text-xs leading-normal text-[#707070] whitespace-nowrap">
            {balanceText}
          </p>
        </div>
      </div>

      {hasReason ? (
        <p className="mt-2 break-words text-xs leading-normal text-[#373737]">
          {t("mine.withdrawRecordRejectReason", {
            reason: record.rejectReason!,
          })}
        </p>
      ) : null}
    </div>
  );
}

function FilterBottomSheet({
  open,
  title,
  onClose,
  children,
  footer,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  const { t } = useTranslation();
  const [entered, setEntered] = React.useState(false);

  const closeSheet = React.useCallback(() => {
    setEntered(false);
    window.setTimeout(() => onClose(), 300);
  }, [onClose]);

  React.useEffect(() => {
    if (!open) {
      setEntered(false);
      return;
    }
    const frame = requestAnimationFrame(() => {
      requestAnimationFrame(() => setEntered(true));
    });
    return () => cancelAnimationFrame(frame);
  }, [open]);

  React.useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeSheet();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, closeSheet]);

  if (!open) return null;

  return (
    <div
      className={`${bottomSheetOverlayRoot} z-90`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="withdraw-filter-sheet-title"
    >
      <div className={bottomSheetOverlayFrame}>
        <button
          type="button"
          aria-label={t("common.close")}
          className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ease-out ${
            entered ? "opacity-100" : "opacity-0"
          }`}
          onClick={closeSheet}
        />
        <div
          className={`relative flex w-full flex-col ${sheetMaxHeight} rounded-t-2xl bg-white px-4 pt-3 pb-safe-compat-lg shadow-[0_-12px_40px_rgba(0,0,0,0.15)] transition-transform duration-300 ease-out ${
            entered ? "translate-y-0" : "translate-y-full"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-[#e5e5e5]" aria-hidden />
          <h3
            id="withdraw-filter-sheet-title"
            className="mb-4 text-base font-semibold text-[#333]"
          >
            {title}
          </h3>
          <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
          {footer ? <div className="mt-4 shrink-0">{footer}</div> : null}
        </div>
      </div>
    </div>
  );
}

function StatusFilterSheet({
  open,
  title,
  options,
  loading,
  selected,
  onSelect,
  onClose,
}: {
  open: boolean;
  title: string;
  options: { value: WithdrawalStatusFilter; label: string }[];
  loading?: boolean;
  selected: WithdrawalStatusFilter;
  onSelect: (value: WithdrawalStatusFilter) => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();

  return (
    <FilterBottomSheet open={open} title={title} onClose={onClose}>
      <div className={`${stackY2} pb-4`}>
        {loading ? (
          <p className="py-6 text-center text-sm text-[#8b8b8b]">
            {t("common.loading")}
          </p>
        ) : (
          options.map((option) => {
            const isSelected = option.value === selected;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onSelect(option.value)}
                className={`flex h-11 items-center justify-between rounded-[7px] px-3 text-base text-[#333] ${
                  isSelected ? "bg-[#f6f6f6]" : "bg-transparent"
                }`}
              >
                <span>{option.label}</span>
                {isSelected ? <CheckIcon /> : null}
              </button>
            );
          })
        )}
      </div>
    </FilterBottomSheet>
  );
}

function TimeFilterSheet({
  open,
  title,
  locale,
  mode,
  startDate,
  endDate,
  onConfirm,
  onClose,
}: {
  open: boolean;
  title: string;
  locale: Locale;
  mode: TimeFilterMode;
  startDate: Date;
  endDate: Date;
  onConfirm: (mode: TimeFilterMode, start?: Date, end?: Date) => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const [draftMode, setDraftMode] = React.useState<TimeFilterMode>(mode);
  const [draftRange, setDraftRange] = React.useState<DateRange | undefined>(
    mode === "range" ? toDateRange(startDate, endDate) : undefined,
  );

  React.useEffect(() => {
    if (!open) return;
    setDraftMode(mode);
    setDraftRange(mode === "range" ? toDateRange(startDate, endDate) : undefined);
  }, [open, mode, startDate, endDate]);

  const dateFnsLocale = DATE_FNS_LOCALE[locale];
  const isAll = draftMode === "all";

  const footer = (
    <div className="flex items-center">
      <button
        type="button"
        onClick={onClose}
        className="mr-3 flex h-11 flex-1 items-center justify-center rounded-full border border-[#bbb] text-base text-[#bbb]"
      >
        {t("common.cancel")}
      </button>
      <button
        type="button"
        disabled={!isAll && !draftRange?.from}
        onClick={() => {
          if (isAll) {
            onConfirm("all");
            return;
          }
          if (!draftRange?.from) return;
          onConfirm("range", draftRange.from, draftRange.to ?? draftRange.from);
        }}
        className={`relative flex h-[46px] flex-1 items-center justify-center disabled:opacity-50 ${GRADIENT_BTN}`}
      >
        <span className={GRADIENT_FILL} aria-hidden />
        <span className={GRADIENT_INSET} aria-hidden />
        <span className="relative text-base font-semibold text-white [text-shadow:0_1px_3px_rgba(94,44,44,0.25)]">
          {t("mine.fundFilter.confirm")}
        </span>
      </button>
    </div>
  );

  return (
    <FilterBottomSheet open={open} title={title} onClose={onClose} footer={footer}>
      <div className={`${stackY4} pb-2`}>
        <button
          type="button"
          onClick={() => {
            setDraftMode("all");
            setDraftRange(undefined);
          }}
          className={`flex min-h-[46px] w-full items-center justify-center rounded-[7px] p-3 text-sm font-medium text-[#333] ${
            isAll
              ? "border border-[rgba(253,65,64,0.4)] bg-[#ffe8e8]"
              : "bg-[#f6f6f6]"
          }`}
        >
          {t("mine.fundFilter.billAll")}
        </button>

        <DateRangeRow
          label={t("mine.fundFilter.startDate")}
          value={
            !isAll && draftRange?.from
              ? format(draftRange.from, "yyyy-MM-dd", { locale: dateFnsLocale })
              : "--"
          }
        />
        <div className="h-px w-full bg-[#eee]" />
        <DateRangeRow
          label={t("mine.fundFilter.endDate")}
          value={
            !isAll && draftRange?.to
              ? format(draftRange.to, "yyyy-MM-dd", { locale: dateFnsLocale })
              : !isAll && draftRange?.from
                ? format(draftRange.from, "yyyy-MM-dd", { locale: dateFnsLocale })
                : "--"
          }
        />

        <div className={`flex justify-center transition-opacity ${isAll ? "opacity-40" : ""}`}>
          <Calendar
            mode="range"
            defaultMonth={draftRange?.from ?? new Date()}
            selected={isAll ? undefined : draftRange}
            onSelect={(range) => {
              setDraftMode("range");
              setDraftRange(range);
            }}
            numberOfMonths={1}
            locale={dateFnsLocale}
            className="w-full max-w-none p-0 [--cell-size:2.25rem]"
          />
        </div>
      </div>
    </FilterBottomSheet>
  );
}

function DateRangeRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex w-full items-center justify-between text-sm text-[#333]">
      <span className="font-medium">{label}</span>
      <span className={`${rowX1} text-[#949494]`}>
        {value}
        <AppImage
          src={mineAssets.pageChevronRight}
          alt=""
          width={12}
          height={12}
          className="size-3 shrink-0"
        />
      </span>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg width={16} height={16} viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M3.5 8.2L6.8 11.5L12.5 4.5"
        stroke="#FD4140"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

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

function FundPagination({
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
      className="flex items-center justify-center space-x-[6px] py-2"
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
      <span className="inline-flex items-center space-x-[3px]">
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
