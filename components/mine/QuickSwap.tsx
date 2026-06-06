"use client";

import React from "react";
import AulongHeader from "@/components/AulongHeader";
import { AppImage } from "@/components/AppImage";
import { teamAssets } from "@/components/team/assets";
import { mineAssets } from "./assets";
import { useTranslation } from "@/lib/hooks/useTranslation";
import {
  sidePanelOverlayFrame,
  sidePanelOverlayRoot,
} from "@/lib/mobileShell";
import { toast } from "sonner";

export type QuickSwapProps = {
  open: boolean;
  onClose: () => void;
};

const SIDE_PANEL_SURFACE =
  "absolute inset-0 flex w-full flex-col bg-[#f8f8f8] transition-transform duration-300 ease-out";
const SIDE_PANEL_NAV_BAR =
  "relative flex h-12 shrink-0 items-center justify-center bg-[#f8f8f8] px-3";
const SIDE_PANEL_NAV_TITLE =
  "text-lg font-medium leading-normal text-[#272727]";

const SWAP_GLASS_CARD =
  "rounded-xl border border-white bg-white/60 p-3 shadow-[0_5px_10px_rgba(51,51,51,0.08)] backdrop-blur-[7px]";
const SWAP_AMOUNT_FIELD =
  "rounded-xl bg-white/80 px-4 py-3 shadow-[0_5px_5px_rgba(51,51,51,0.08)] backdrop-blur-[7px] h-[120px]";
const FIELD_LABEL =
  "shrink-0 text-sm font-semibold leading-normal text-[#2a2a2a]";
const FIELD_HINT = "truncate text-xs leading-normal text-[#707c85]";
const AMOUNT_INPUT =
  "min-w-0 flex-1 bg-transparent text-base leading-normal text-[#333] placeholder:text-[#c9cbcd] outline-none";
const AMOUNT_INPUT_ERROR = "text-[#ea4747]";
const SUBMIT_BTN =
  "relative flex h-12 w-full items-center justify-center overflow-hidden rounded-full bg-gradient-to-b from-[#ff3636] to-[#c80000] text-base font-semibold text-white disabled:cursor-not-allowed";
const SUBMIT_BTN_DISABLED_OVERLAY =
  "pointer-events-none absolute inset-0 rounded-full bg-[rgba(241,241,241,0.57)]";

/** Figma 943:1325 — Hero 占位 + 卡片上拉 (167-126)/375 重叠 41px */
const SWAP_HERO_ASPECT = "aspect-[375/167]";
const SWAP_HERO_IN_FLOW =
  "pointer-events-none relative w-full overflow-visible";
const SWAP_CONTENT_STACK =
  "relative z-10 -mt-[10.933%] flex flex-col items-stretch gap-[42px]";
const SWAP_MAIN_SECTION = "relative w-full shrink-0";

/** 背景图在容器内的裁切比例（随容器缩放，非布局写死） */
const HERO_BG_CROP = {
  height: "160.34%",
  width: "100%",
  left: 0,
  top: "-30.17%",
} as const;

/** TODO: 接入闪兑接口后替换 */
const MOCK_AUL_BALANCE = 20_000;
const MOCK_USDT_BALANCE = 20_000;
const MOCK_AUL_TO_USDT_RATE = 1;

function formatAmount(value: number): string {
  return value.toLocaleString("en-US", {
    maximumFractionDigits: 6,
    minimumFractionDigits: 0,
    useGrouping: false,
  });
}

function formatBalanceLabel(value: number): string {
  return value.toLocaleString("en-US", {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
    useGrouping: false,
  });
}

function sanitizeAmountInput(raw: string): string {
  const cleaned = raw.replace(/[^\d.]/g, "");
  const parts = cleaned.split(".");
  if (parts.length <= 1) return cleaned;
  return `${parts[0]}.${parts.slice(1).join("")}`;
}

function parseAmountInput(raw: string): number | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const n = Number(trimmed);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

export function QuickSwap({ open, onClose }: QuickSwapProps) {
  const { t } = useTranslation();
  const [entered, setEntered] = React.useState(false);
  const [fromAmount, setFromAmount] = React.useState("");

  const closePanel = React.useCallback(() => {
    setEntered(false);
    window.setTimeout(() => onClose(), 300);
  }, [onClose]);

  React.useEffect(() => {
    if (!open) {
      setEntered(false);
      setFromAmount("");
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
      if (e.key === "Escape") closePanel();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, closePanel]);

  const parsedFrom = parseAmountInput(fromAmount);
  const toAmount =
    parsedFrom != null
      ? formatAmount(parsedFrom * MOCK_AUL_TO_USDT_RATE)
      : "";
  const exceedsBalance =
    parsedFrom != null && parsedFrom > MOCK_AUL_BALANCE;
  const canSubmit =
    parsedFrom != null && parsedFrom > 0 && !exceedsBalance;

  const handleSubmit = () => {
    if (!canSubmit) return;
    toast.success(t("common.notOpen"));
  };

  if (!open) return null;

  return (
    <div
      className={`${sidePanelOverlayRoot} z-80`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="quick-swap-title"
    >
      <div className={sidePanelOverlayFrame}>
        <div
          className={`${SIDE_PANEL_SURFACE} ${
            entered ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="h-11 shrink-0 bg-white" aria-hidden />
          <AulongHeader />

          <header className={SIDE_PANEL_NAV_BAR}>
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
            <h1 id="quick-swap-title" className={SIDE_PANEL_NAV_TITLE}>
              {t("mine.swapTitle")}
            </h1>
          </header>

          <div className="relative isolate flex min-h-0 flex-1 flex-col overflow-y-auto px-3 pb-[max(env(safe-area-inset-bottom),24px)]">
            <div className={SWAP_MAIN_SECTION}>
              <div className={`${SWAP_HERO_IN_FLOW} ${SWAP_HERO_ASPECT}`}>
                <SwapHeroDecor />
              </div>

              <div className={SWAP_CONTENT_STACK}>
                <SwapCard
                  fromAmount={fromAmount}
                  toAmount={toAmount}
                  exceedsBalance={exceedsBalance}
                  aulBalanceLabel={t("mine.swapAvailableBalance", {
                    amount: formatBalanceLabel(MOCK_AUL_BALANCE),
                    currency: "AUL",
                  })}
                  usdtBalanceLabel={t("mine.swapAvailableBalance", {
                    amount: formatBalanceLabel(MOCK_USDT_BALANCE),
                    currency: "USDT",
                  })}
                  fromLabel={t("mine.swapFromLabel")}
                  toLabel={t("mine.swapToLabel")}
                  placeholder={t("mine.swapInputPlaceholder")}
                  fillMaxAria={t("mine.swapFillMaxAria")}
                  toggleAria={t("mine.swapToggleAria")}
                  onFromChange={setFromAmount}
                  onFillMax={() => setFromAmount(String(MOCK_AUL_BALANCE))}
                  onToggle={() => toast.success(t("common.notOpen"))}
                />

                <button
                  type="button"
                  disabled={!canSubmit}
                  onClick={handleSubmit}
                  className={SUBMIT_BTN}
                >
                  {!canSubmit ? (
                    <span
                      className={SUBMIT_BTN_DISABLED_OVERLAY}
                      aria-hidden
                    />
                  ) : null}
                  <span className="relative">{t("mine.swapTitle")}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** 背景币 → 龙虾（层级与 Figma DOM 顺序一致） */
function SwapHeroDecor() {
  return (
    <>
      <div
        className="pointer-events-none absolute inset-y-0 left-0 z-[1] w-[77%] overflow-hidden opacity-[0.24]"
        aria-hidden
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={mineAssets.swapHeroBgSource}
          alt=""
          draggable={false}
          className="absolute max-w-none"
          style={HERO_BG_CROP}
        />
      </div>

      <div
        className="pointer-events-none absolute bottom-0 right-0.5 z-[5] h-full w-[37%]"
        aria-hidden
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={mineAssets.swapHeroIp}
          alt=""
          draggable={false}
          className="size-full object-contain object-bottom"
        />
      </div>
    </>
  );
}

function SwapCard({
  fromLabel,
  toLabel,
  placeholder,
  fromAmount,
  toAmount,
  aulBalanceLabel,
  usdtBalanceLabel,
  fillMaxAria,
  toggleAria,
  exceedsBalance,
  onFromChange,
  onFillMax,
  onToggle,
}: {
  fromLabel: string;
  toLabel: string;
  placeholder: string;
  fromAmount: string;
  toAmount: string;
  aulBalanceLabel: string;
  usdtBalanceLabel: string;
  fillMaxAria: string;
  toggleAria: string;
  exceedsBalance: boolean;
  onFromChange: (value: string) => void;
  onFillMax: () => void;
  onToggle: () => void;
}) {
  return (
    <div
      className={`relative w-full overflow-visible ${SWAP_GLASS_CARD}`}
    >
      <div className="flex flex-col gap-2.5">
        <SwapAmountField
          label={fromLabel}
          balanceLabel={aulBalanceLabel}
          placeholder={placeholder}
          value={fromAmount}
          tokenIcon={mineAssets.swapAulToken}
          tokenSymbol="AUL"
          fillMaxAria={fillMaxAria}
          onFillMax={onFillMax}
          onChange={onFromChange}
          error={exceedsBalance}
        />
        <SwapAmountField
          label={toLabel}
          balanceLabel={usdtBalanceLabel}
          placeholder={placeholder}
          value={toAmount}
          tokenIcon={mineAssets.swapUsdtToken}
          tokenSymbol="USDT"
          fillMaxAria={fillMaxAria}
          onFillMax={onToggle}
          readOnly
        />
      </div>

      <button
        type="button"
        aria-label={toggleAria}
        onClick={onToggle}
        className="absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={mineAssets.swapToggle}
          alt=""
          width={61}
          height={61}
          draggable={false}
          className="size-auto max-w-none"
        />
      </button>
    </div>
  );
}

function SwapAmountField({
  label,
  balanceLabel,
  placeholder,
  value,
  tokenIcon,
  tokenSymbol,
  fillMaxAria,
  onFillMax,
  onChange,
  readOnly = false,
  error = false,
}: {
  label: string;
  balanceLabel: string;
  placeholder: string;
  value: string;
  tokenIcon: string;
  tokenSymbol: string;
  fillMaxAria: string;
  onFillMax: () => void;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  error?: boolean;
}) {
  const valueClassName = value
    ? "text-[#333]"
    : "text-[#c9cbcd]";

  return (
    <div className={`flex w-full flex-col gap-4 ${SWAP_AMOUNT_FIELD}`}>
      <div className="flex min-h-[27px] w-full items-center justify-between gap-2">
        <p className={FIELD_LABEL}>{label}</p>
        <div className="flex min-w-0 items-center gap-0.5">
          <p className={FIELD_HINT}>{balanceLabel}</p>
          <button
            type="button"
            aria-label={fillMaxAria}
            onClick={onFillMax}
            className="flex shrink-0 items-center justify-center"
          >
            <AppImage
              src={mineAssets.swapFillMax}
              alt=""
              width={19}
              height={19}
              className="shrink-0"
            />
          </button>
        </div>
      </div>

      <div className="flex min-h-6 w-full items-center justify-between gap-2">
        {readOnly ? (
          <p
            className={`min-w-0 flex-1 text-base leading-[30px] ${valueClassName}`}
          >
            {value || placeholder}
          </p>
        ) : (
          <input
            type="text"
            inputMode="decimal"
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange?.(sanitizeAmountInput(e.target.value))}
            className={`${AMOUNT_INPUT} leading-[30px] ${error ? AMOUNT_INPUT_ERROR : ""}`}
          />
        )}
        <div className="flex shrink-0 items-center gap-2">
          <AppImage
            src={tokenIcon}
            alt=""
            width={23}
            height={23}
            className="shrink-0 object-contain"
          />
          <span className="font-noto-sc-black text-sm font-black leading-normal text-black">
            {tokenSymbol}
          </span>
        </div>
      </div>
    </div>
  );
}
