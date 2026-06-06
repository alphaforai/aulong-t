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

export type WithdrawAULProps = {
  open: boolean;
  onClose: () => void;
};

const GRADIENT_BTN =
  "relative overflow-hidden rounded-[33px] border border-white shadow-[0_4px_6px_rgba(213,0,0,0.12)]";
const GRADIENT_FILL =
  "pointer-events-none absolute inset-0 rounded-[33px] bg-gradient-to-r from-[#ff4d00] via-[#ff3033] via-[53.846%] to-[#e90000]";
const GRADIENT_INSET =
  "pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0px_-4px_4px_0px_rgba(255,254,227,0.7),inset_0px_8px_17px_0px_#ffe5e5]";
const DISABLED_OVERLAY =
  "pointer-events-none absolute inset-0 rounded-[33px] bg-[rgba(241,241,241,0.57)]";

const MIN_WITHDRAW = 1;

/** TODO: 接入提现接口后替换为真实余额 */
const MOCK_WITHDRAWABLE_AUL = 888_888;
const MOCK_FEE_AUL = 12;

function formatBalance(value: number): string {
  return value.toLocaleString("en-US", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  });
}

function parseAmountInput(raw: string): number | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const n = Number(trimmed);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

function sanitizeAmountInput(raw: string): string {
  const cleaned = raw.replace(/[^\d.]/g, "");
  const parts = cleaned.split(".");
  if (parts.length <= 1) return cleaned;
  return `${parts[0]}.${parts.slice(1).join("")}`;
}

export function WithdrawAUL({ open, onClose }: WithdrawAULProps) {
  const { t } = useTranslation();
  const [entered, setEntered] = React.useState(false);
  const [amount, setAmount] = React.useState("");

  const closePanel = React.useCallback(() => {
    setEntered(false);
    window.setTimeout(() => onClose(), 300);
  }, [onClose]);

  React.useEffect(() => {
    if (!open) {
      setEntered(false);
      setAmount("");
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

  const parsedAmount = parseAmountInput(amount);
  const exceedsLimit =
    parsedAmount != null && parsedAmount > MOCK_WITHDRAWABLE_AUL;
  const belowMin =
    parsedAmount != null && parsedAmount > 0 && parsedAmount < MIN_WITHDRAW;
  const hasAmount = parsedAmount != null && parsedAmount > 0;
  const canSubmit = hasAmount && !exceedsLimit && !belowMin;

  const handleSubmit = () => {
    if (!canSubmit) return;
    toast.success(t("common.notOpen"));
  };

  const handleFillAll = () => {
    setAmount(String(MOCK_WITHDRAWABLE_AUL));
  };

  if (!open) return null;

  return (
    <div
      className={`${sidePanelOverlayRoot} z-80`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="withdraw-aul-title"
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
              id="withdraw-aul-title"
              className="text-lg font-medium leading-[26px] text-[#272727]"
            >
              {t("mine.withdrawPanelTitle")}
            </h1>
            <button
              type="button"
              onClick={() => toast.success(t("common.notOpen"))}
              className="absolute right-3 text-sm leading-[26px] text-[#272727]"
            >
              {t("mine.withdrawRules")}
            </button>
          </header>

          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-3 pb-[max(env(safe-area-inset-bottom),24px)] pt-4">
            <div className="flex flex-col gap-6">
              <FieldBlock label={t("mine.withdrawCurrency")}>
                <button
                  type="button"
                  onClick={() => toast.success(t("common.notOpen"))}
                  className="flex h-12 w-full items-center justify-start rounded-[6px] bg-[#eff0f1] px-[11px] py-1"
                >
                  <span className="flex items-center gap-1.5">
                    <AppImage
                      src={mineAssets.withdrawAulIcon}
                      alt=""
                      width={20}
                      height={20}
                      className="size-5 shrink-0 rounded-full object-contain"
                    />
                    <span className="font-mulish text-base font-medium text-[#333]">
                      AUL
                    </span>
                  </span>
                </button>
              </FieldBlock>

              <FieldBlock label={t("mine.withdrawAmount")}>
                <div className="flex flex-col gap-2">
                  <div
                    className={`flex h-12 items-center justify-between rounded-[6px] bg-[#eff0f1] px-[11px] py-1 ${
                      exceedsLimit ? "border border-red-500" : "border border-transparent"
                    }`}
                  >
                    <input
                      type="text"
                      inputMode="decimal"
                      placeholder={t("mine.withdrawAulAmountPlaceholder")}
                      value={amount}
                      onChange={(e) =>
                        setAmount(sanitizeAmountInput(e.target.value))
                      }
                      className="min-w-0 flex-1 bg-transparent text-sm text-[#333] placeholder:text-[#949494] outline-none"
                    />
                    <div className="flex shrink-0 items-center gap-4">
                      <span className="text-sm text-[#bbb]">AUL</span>
                      <div className="flex h-[22px] w-0 items-center justify-center">
                        <AppImage
                          src={mineAssets.withdrawInputDivider}
                          alt=""
                          width={1}
                          height={22}
                          className="h-[22px] w-px"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleFillAll}
                        className="bg-gradient-to-b from-[#ff3636] to-[#c80000] bg-clip-text text-sm text-transparent"
                      >
                        {t("mine.withdrawAll")}
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    {exceedsLimit ? (
                      <p className="text-sm tracking-[0.18px] text-[#ea4747]">
                        {t("mine.withdrawExceedLimit")}
                      </p>
                    ) : null}

                    <InfoRow
                      label={
                        exceedsLimit
                          ? t("mine.availableAul")
                          : t("mine.withdrawableAul")
                      }
                      value={`${formatBalance(MOCK_WITHDRAWABLE_AUL)} AUL`}
                    />
                    <InfoRow
                      label={t("mine.withdrawFee")}
                      value={`${MOCK_FEE_AUL} AUL`}
                    />
                  </div>
                </div>
              </FieldBlock>
            </div>

            <button
              type="button"
              disabled={!canSubmit}
              onClick={handleSubmit}
              className={`mx-auto mt-10 flex h-[58px] w-full max-w-[308px] flex-col items-center justify-center px-2.5 ${GRADIENT_BTN} disabled:cursor-not-allowed`}
            >
              <span className={GRADIENT_FILL} aria-hidden />
              {!canSubmit ? <span className={DISABLED_OVERLAY} aria-hidden /> : null}
              <span className={GRADIENT_INSET} aria-hidden />
              <span className="relative text-base font-semibold text-white [text-shadow:0_1px_3px_rgba(94,44,44,0.25)]">
                {t("mine.withdrawSubmit")}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function FieldBlock({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-base font-medium tracking-[0.18px] text-[#333]">
        {label}
      </p>
      {children}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <p className="shrink-0 text-sm text-[#5b5b5b]">{label}</p>
      <p className="min-w-0 text-right text-sm text-[#5b5b5b]">{value}</p>
    </div>
  );
}
