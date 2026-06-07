"use client";

import React from "react";
import { format } from "date-fns";
import { enUS, ja, ko, ms, vi, zhCN } from "date-fns/locale";
import { type DateRange } from "react-day-picker";
import { AppImage } from "@/components/AppImage";
import { Calendar } from "@/components/ui/calendar";
import { useTranslation } from "@/lib/hooks/useTranslation";
import type { Locale } from "@/lib/local";
import {
  bottomSheetOverlayFrame,
  bottomSheetOverlayRoot,
} from "@/lib/mobileShell";
import { mineAssets } from "./assets";
import { getAssetLedgerPage } from "@/lib/api/users";
import { useUserInfoStore } from "@/lib/store";
import { useQuery } from "@tanstack/react-query";
import { formatAmount, formatSignedAmount } from "@/components/team/format";

const PAGE_SIZE = 5;

type AssetLedgerItem = {
  id?: number;
  currency?: string;
  changeType?: string;
  changeTypeDesc?: string;
  amount?: number;
  balanceAfter?: number;
  referenceId?: number;
  createdAt?: string;
};

type FilterSheetId = "billType" | "currency" | "time";

type BillTypeId =
  | "all"
  | "startAi"
  | "usdtYield"
  | "redeem"
  | "redeemFee"
  | "xUnlock"
  | "xWithdraw"
  | "usdtWithdraw"
  | "usdtWithdrawFee"
  | "shareholder"
  | "teamLevel"
  | "teamGen"
  | "teamContrib";

const DATE_FNS_LOCALE: Record<Locale, typeof zhCN> = {
  zh_CN: zhCN,
  en_US: enUS,
  ko_KR: ko,
  vi_VN: vi,
  ja_JP: ja,
  ms_MY: ms,
};


const BILL_TYPES: {
  id: BillTypeId;
  labelKey: string;
  changeType?: string;
}[] = [
  { id: "all", labelKey: "mine.fundFilter.billAll" },
  { id: "startAi", labelKey: "mine.fundFilter.billStartAi", changeType: "STAKE_APPLY" },
  { id: "usdtYield", labelKey: "mine.fundFilter.billUsdtYield", changeType: "USDT_YIELD" },
  { id: "redeem", labelKey: "mine.fundFilter.billRedeem", changeType: "REDEEM_APPLY" },
  { id: "redeemFee", labelKey: "mine.fundFilter.billRedeemFee", changeType: "REDEEM_FEE" },
  { id: "xUnlock", labelKey: "mine.fundFilter.billXUnlock", changeType: "X_UNLOCK" },
  { id: "xWithdraw", labelKey: "mine.fundFilter.billXWithdraw", changeType: "X_WITHDRAW" },
  { id: "usdtWithdraw", labelKey: "mine.fundFilter.billUsdtWithdraw", changeType: "WITHDRAW_APPLY" },
  { id: "usdtWithdrawFee", labelKey: "mine.fundFilter.billUsdtWithdrawFee", changeType: "WITHDRAW_FEE" },
  { id: "shareholder", labelKey: "mine.fundFilter.billShareholder", changeType: "SHAREHOLDER_DIVIDEND" },
  { id: "teamLevel", labelKey: "mine.fundFilter.billTeamLevel", changeType: "TEAM_LEVEL_REWARD" },
  { id: "teamGen", labelKey: "mine.fundFilter.billTeamGen", changeType: "TEAM_GEN_REWARD" },
  { id: "teamContrib", labelKey: "mine.fundFilter.billTeamContrib", changeType: "TEAM_CONTRIBUTION_REWARD" },
];

const CURRENCY_OPTIONS = [
  "all",
  "USDT",
    "AUL"
] as const;

type CurrencyOption = (typeof CURRENCY_OPTIONS)[number];

type TimeFilterMode = "all" | "range";

const GRADIENT_BTN =
  "relative overflow-hidden rounded-[33px] border border-white shadow-[0_4px_6px_rgba(213,0,0,0.12)]";
const GRADIENT_FILL =
  "pointer-events-none absolute inset-0 rounded-[33px] bg-gradient-to-r from-[#ff4d00] via-[#ff3033] via-[53.846%] to-[#e90000]";
const GRADIENT_INSET =
  "pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0px_-4px_4px_0px_rgba(255,254,227,0.7),inset_0px_8px_17px_0px_#ffe5e5]";

function formatDateYmd(date: Date, locale: Locale) {
  return format(date, "yyyy-MM-dd", { locale: DATE_FNS_LOCALE[locale] });
}

function toDateRange(start: Date, end: Date): DateRange {
  return { from: start, to: end };
}

function formatLedgerTime(value?: string) {
  if (!value) return "--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return format(date, "yyyy-MM-dd HH:mm");
}

function getBillChangeType(id: BillTypeId) {
  return BILL_TYPES.find((item) => item.id === id)?.changeType;
}

const FILTER_SHEETS: { id: FilterSheetId; labelKey: string }[] = [
  { id: "billType", labelKey: "mine.filterBillType" },
  { id: "currency", labelKey: "mine.filterCurrency" },
  { id: "time", labelKey: "mine.filterTime" },
];

export function FundDetailsCard() {
  const { t, locale } = useTranslation();
  const userInfo = useUserInfoStore((state) => state.userInfo);
  const userId = Number(userInfo.id) || 0;
  const walletAddress = userInfo.walletAddress;
  const listScrollRef = React.useRef<HTMLDivElement>(null);
  const [page, setPage] = React.useState(0);
  const [activeSheet, setActiveSheet] = React.useState<FilterSheetId | null>(
    null,
  );
  const [selectedBillType, setSelectedBillType] =
    React.useState<BillTypeId>("all");
  const [selectedCurrency, setSelectedCurrency] =
    React.useState<CurrencyOption>("all");
  const [timeFilterMode, setTimeFilterMode] =
    React.useState<TimeFilterMode>("all");
  const [startDate, setStartDate] = React.useState(() => new Date());
  const [endDate, setEndDate] = React.useState(() => new Date());

  const changeType = getBillChangeType(selectedBillType);
  const currencyFilter =
    selectedCurrency === "all" ? undefined : selectedCurrency;
  const createdAtStart =
    timeFilterMode === "range"
      ? formatDateYmd(startDate, locale)
      : undefined;
  const createdAtEnd =
    timeFilterMode === "range" ? formatDateYmd(endDate, locale) : undefined;

  React.useEffect(() => {
    setPage(0);
  }, [
    walletAddress,
    selectedBillType,
    selectedCurrency,
    timeFilterMode,
    startDate,
    endDate,
  ]);

  const {
    data: ledgerResponse,
    isPending,
    isFetching,
    isError,
  } = useQuery({
    queryKey: [
      "assetLedgerPage",
      walletAddress,
      userId,
      page,
      selectedBillType,
      selectedCurrency,
      timeFilterMode,
      createdAtStart,
      createdAtEnd,
    ],
    queryFn: () =>
      getAssetLedgerPage({
        page,
        limit: PAGE_SIZE,
        searchCount: true,
        lastId: undefined,
        userId,
        walletAddress,
        currency: currencyFilter,
        changeType,
        referenceId: undefined,
        createdAtStart,
        createdAtEnd,
      }),
    enabled: Boolean(walletAddress),
  });

  const rawList = (
    ledgerResponse?.data as { list?: AssetLedgerItem[]; total?: number } | undefined
  )?.list;
  const records = Array.isArray(rawList) ? rawList : [];
  const totalRaw = Number(
    (ledgerResponse?.data as { total?: number } | undefined)?.total,
  );
  const totalSafe = Number.isFinite(totalRaw)
    ? Math.max(0, Math.trunc(totalRaw))
    : 0;
  const totalPages = totalSafe === 0 ? 1 : Math.ceil(totalSafe / PAGE_SIZE);
  const canPrev = page > 0;
  const canNext = totalSafe > 0 && page + 1 < totalPages;
  const listPending = isPending || isFetching;
  const hasRecords = records.length > 0;

  const goToPage = React.useCallback((nextPage: number) => {
    setPage(Math.max(0, nextPage));
    listScrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const billTypeLabel =
    BILL_TYPES.find((item) => item.id === selectedBillType)?.labelKey ??
    "mine.fundFilter.billAll";
  const timeLabel = `${formatDateYmd(startDate, locale)} ~ ${formatDateYmd(endDate, locale)}`;

  const filterButtonLabel = (sheetId: FilterSheetId) => {
    if (sheetId === "billType") {
      return selectedBillType === "all" ? t("mine.filterBillType") : t(billTypeLabel);
    }
    if (sheetId === "currency") {
      return selectedCurrency === "all"
        ? t("mine.filterCurrency")
        : selectedCurrency;
    }
    if (timeFilterMode === "all") {
      return t("mine.filterTime");
    }
    return timeLabel;
  };

  return (
    <>
      <section className="flex min-h-[540px] w-full min-w-0 flex-col gap-[10px] overflow-hidden rounded-[12px] bg-white/80 p-3 shadow-[0_5px_10px_rgba(51,51,51,0.08)] backdrop-blur-[7px]">
        <div className="flex h-[27px] w-[129px] items-center gap-[3px] overflow-hidden">
          <div className="relative size-[22px] shrink-0 overflow-hidden">
            <AppImage
              src={mineAssets.fundIcon}
              alt=""
              width={22}
              height={22}
              className="absolute h-[135.06%] w-[136.84%] max-w-none -left-[18.42%] -top-[16.88%]"
            />
          </div>
          <h2 className="text-base font-semibold leading-[22px] text-black/80">
            {t("mine.fundDetails")}
          </h2>
        </div>

        <div className="-mx-3 flex items-center gap-3 overflow-x-auto px-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {FILTER_SHEETS.map(({ id }) => {
            const isTime = id === "time";
            return (
              <button
                key={id}
                type="button"
                onClick={() => setActiveSheet(id)}
                className={`flex items-center gap-1 text-sm leading-normal text-[#333] ${
                  isTime
                    ? "shrink-0 whitespace-nowrap"
                    : "min-w-0 max-w-[30%] shrink"
                }`}
              >
                <span className={isTime ? undefined : "truncate"}>
                  {filterButtonLabel(id)}
                </span>
                <AppImage
                  src={mineAssets.chevronDown}
                  alt=""
                  width={12}
                  height={12}
                  className="block h-2 w-2 shrink-0"
                />
              </button>
            );
          })}
        </div>

        <div className="relative h-0 w-full shrink-0">
          <AppImage
            src={mineAssets.fundDividerH}
            alt=""
            width={327}
            height={1}
            className="absolute inset-x-0 top-0 h-px w-full"
          />
        </div>

        <div
          ref={listScrollRef}
          className={`flex min-h-0 flex-1 flex-col overflow-y-auto transition-opacity ${
            listPending && !isPending ? "opacity-70" : "opacity-100"
          }`}
        >
          {!walletAddress ? (
            <div className="flex flex-1 items-center justify-center py-12 text-sm text-black/50">
              {t("common.connectWallet")}
            </div>
          ) : listPending && !hasRecords ? (
            <div className="flex flex-1 items-center justify-center py-12 text-sm text-black/50">
              {t("common.loading")}
            </div>
          ) : isError ? (
            <div className="flex flex-1 items-center justify-center py-12 text-sm text-black/50">
              {t("common.operationFailed")}
            </div>
          ) : !hasRecords ? (
            <div className="flex flex-1 items-center justify-center py-12 text-sm text-black/50">
              {t("mine.noFundRecords")}
            </div>
          ) : (
            records.map((record, index) => (
              <div
                key={record.id ?? `${record.createdAt}-${index}`}
                className={`flex w-full flex-col ${index < records.length - 1 ? "gap-4" : ""}`}
              >
                <FundRecordRow record={record} t={t} />
                {index < records.length - 1 ? <RowDivider /> : null}
              </div>
            ))
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
      </section>

      <BillTypeFilterSheet
        open={activeSheet === "billType"}
        title={t("mine.filterBillType")}
        selected={selectedBillType}
        onSelect={(id) => {
          setSelectedBillType(id);
          setActiveSheet(null);
        }}
        onClose={() => setActiveSheet(null)}
      />

      <CurrencyFilterSheet
        open={activeSheet === "currency"}
        title={t("mine.filterCurrency")}
        selected={selectedCurrency}
        onSelect={(currency) => {
          setSelectedCurrency(currency);
          setActiveSheet(null);
        }}
        onClose={() => setActiveSheet(null)}
      />

      <TimeFilterSheet
        open={activeSheet === "time"}
        title={t("mine.filterTime")}
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
      className={`${bottomSheetOverlayRoot} z-70`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="fund-filter-sheet-title"
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
          className={`relative flex h-[50dvh] w-full flex-col overflow-hidden rounded-t-[16px] bg-white shadow-[0_-12px_40px_rgba(0,0,0,0.15)] transition-transform duration-300 ease-out ${
            entered ? "translate-y-0" : "translate-y-full"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="relative flex shrink-0 items-center justify-center px-3 pb-3 pt-4">
            <h2
              id="fund-filter-sheet-title"
              className="text-base font-medium text-[#333]"
            >
              {title}
            </h2>
            <button
              type="button"
              aria-label={t("common.close")}
              onClick={closeSheet}
              className="absolute right-3 top-3 grid size-4 place-items-center"
            >
              <AppImage
                src={mineAssets.inviteSheetClose}
                alt=""
                width={16}
                height={16}
                className="size-4"
              />
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-3">{children}</div>

          {footer ? (
            <div className="shrink-0 px-3 pb-[max(env(safe-area-inset-bottom),16px)] pt-2">
              {footer}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function BillTypeFilterSheet({
  open,
  title,
  selected,
  onSelect,
  onClose,
}: {
  open: boolean;
  title: string;
  selected: BillTypeId;
  onSelect: (id: BillTypeId) => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();

  return (
    <FilterBottomSheet open={open} title={title} onClose={onClose}>
      <div className="grid grid-cols-2 gap-[11px] pb-4">
        {BILL_TYPES.map((item) => {
          const isSelected = item.id === selected;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect(item.id)}
              className={`flex min-h-[46px] items-center justify-center rounded-[7px] p-3 text-sm font-medium text-[#333] ${
                isSelected
                  ? "bg-[#ffe8e8] ring-1 ring-[#fd4140]/40"
                  : "bg-[#f6f6f6]"
              }`}
            >
              {t(item.labelKey)}
            </button>
          );
        })}
      </div>
    </FilterBottomSheet>
  );
}

function CurrencyFilterSheet({
  open,
  title,
  selected,
  onSelect,
  onClose,
}: {
  open: boolean;
  title: string;
  selected: CurrencyOption;
  onSelect: (currency: CurrencyOption) => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const [search, setSearch] = React.useState("");

  React.useEffect(() => {
    if (!open) setSearch("");
  }, [open]);

  const filtered = CURRENCY_OPTIONS.filter((currency) => {
    if (!search.trim()) return true;
    const q = search.trim().toLowerCase();
    if (currency === "all") {
      return t("mine.fundFilter.currencyAll").toLowerCase().includes(q);
    }
    return currency.toLowerCase().includes(q);
  });

  return (
    <FilterBottomSheet open={open} title={title} onClose={onClose}>
      <div className="flex flex-col gap-4 pb-4">
        <label className="flex h-[37px] items-center gap-1.5 rounded-full border border-[#d8d8d8] px-3 py-1.5">
          <SearchIcon />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("mine.fundFilter.currencySearchPlaceholder")}
            className="min-w-0 flex-1 bg-transparent text-sm text-[#333] placeholder:text-[#bbb] outline-none"
          />
        </label>

        <div className="flex flex-col gap-4">
          {filtered.map((currency) => {
            const isSelected = currency === selected;
            const label =
              currency === "all"
                ? t("mine.fundFilter.currencyAll")
                : currency;
            return (
              <button
                key={currency}
                type="button"
                onClick={() => onSelect(currency)}
                className={`flex h-9 items-center justify-between rounded-[7px] px-3 text-base text-[#333] ${
                  isSelected ? "bg-[#f6f6f6]" : "bg-transparent"
                }`}
              >
                <span>{label}</span>
                {isSelected ? <CheckIcon /> : null}
              </button>
            );
          })}
        </div>
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

  const handleRangeSelect = (range: DateRange | undefined) => {
    setDraftMode("range");
    setDraftRange(range);
  };

  const footer = (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={onClose}
        className="flex h-11 flex-1 items-center justify-center rounded-full border border-[#bbb] text-base text-[#bbb]"
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
    <FilterBottomSheet
      open={open}
      title={title}
      onClose={onClose}
      footer={footer}
    >
      <div className="flex flex-col gap-4 pb-2">
        <button
          type="button"
          onClick={() => {
            setDraftMode("all");
            setDraftRange(undefined);
          }}
          className={`flex min-h-[46px] w-full items-center justify-center rounded-[7px] p-3 text-sm font-medium text-[#333] ${
            isAll
              ? "bg-[#ffe8e8] ring-1 ring-[#fd4140]/40"
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
                ? format(draftRange.from, "yyyy-MM-dd", {
                    locale: dateFnsLocale,
                  })
                : "--"
          }
        />

        <div
          className={`flex justify-center transition-opacity ${
            isAll ? "opacity-40" : ""
          }`}
        >
          <Calendar
            mode="range"
            defaultMonth={draftRange?.from ?? new Date()}
            selected={isAll ? undefined : draftRange}
            onSelect={handleRangeSelect}
            numberOfMonths={1}
            locale={dateFnsLocale}
            className="w-full max-w-none p-0 [--cell-size:2.25rem]"
          />
        </div>
      </div>
    </FilterBottomSheet>
  );
}

function DateRangeRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex w-full items-center justify-between text-sm text-[#333]">
      <span className="font-medium">{label}</span>
      <span className="flex items-center gap-1 text-[#949494]">
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

function SearchIcon() {
  return (
    <svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className="size-6 shrink-0 text-[#bbb]"
    >
      <circle cx={11} cy={11} r={7} stroke="currentColor" strokeWidth={1.5} />
      <path
        d="M16.5 16.5L20 20"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
      />
    </svg>
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

function RowDivider() {
  return (
    <div className="relative h-0 w-full shrink-0">
      <AppImage
        src={mineAssets.fundDividerRow}
        alt=""
        width={327}
        height={1}
        className="absolute inset-x-0 top-0 h-px w-full"
      />
    </div>
  );
}

function FundRecordRow({
  record,
  t,
}: {
  record: AssetLedgerItem;
  t: (key: string) => string;
}) {
  const currency = record.currency ?? "";
  const amount = Number(record.amount ?? 0);
  const amountTone = amount >= 0 ? "positive" : "negative";
  const balanceText = `${t("common.balancePrefix")}${formatAmount(record.balanceAfter)} ${currency}`.trim();

  return (
    <div className="flex w-full items-center justify-between gap-3">
      <div className="flex min-w-0 flex-1 flex-col gap-0.5 leading-normal">
        <p className="text-sm font-semibold text-[#333]">
          {record.changeTypeDesc || "--"}
        </p>
        <p className="text-xs text-[#9e6f6f]">{currency || "--"}</p>
        <p className="text-xs text-[#707070]">
          {formatLedgerTime(record.createdAt)}
        </p>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-3 text-right">
        <p
          className={`font-mulish text-base font-semibold leading-normal whitespace-nowrap ${
            amountTone === "positive" ? "text-[#ea4747]" : "text-[#129a48]"
          }`}
        >
          {formatSignedAmount(amount)}
        </p>
        <p className="text-xs leading-none text-[#707070]">{balanceText}</p>
      </div>
    </div>
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
      className="flex items-center justify-center gap-[6px] py-2"
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
