"use client";

import React from "react";
import AulongHeader from "@/components/AulongHeader";
import { AppImage } from "@/components/AppImage";
import { teamAssets } from "@/components/team/assets";
import { mineAssets } from "./assets";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { useUserInfoStore } from "@/lib/store";
import { sidePanelOverlayFrame, sidePanelOverlayRoot } from "@/lib/mobileShell";
import { AulContract } from "@/lib/abis/aul";
import { UsdtContract } from "@/lib/abis/usdt";
import { QuickswapContract } from "@/lib/abis/quickswap";
import { useReadContract, useReadContracts, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { formatEther, maxUint256, parseEther } from "viem";
import { toast } from "sonner";

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error) {
    const e = error as Error & { shortMessage?: string };
    return e.shortMessage || e.message || fallback;
  }
  return fallback;
}

type SwapTxStep = "idle" | "approve" | "swap";

export type QuickSwapProps = {
  open: boolean;
  onClose: () => void;
};

const cls = {
  surface:
    "absolute inset-0 flex w-full flex-col bg-[#f8f8f8] transition-transform duration-300 ease-out",
  nav: "relative flex h-12 shrink-0 items-center justify-center bg-[#f8f8f8] px-3",
  title: "text-lg font-medium leading-normal text-[#272727]",
  glassCard:
    "relative w-full overflow-visible rounded-xl border border-white bg-white/60 p-3 shadow-[0_5px_10px_rgba(51,51,51,0.08)] backdrop-blur-[7px]",
  amountField:
    "flex h-[120px] w-full flex-col gap-4 rounded-xl bg-white/80 px-4 py-3 shadow-[0_5px_5px_rgba(51,51,51,0.08)] backdrop-blur-[7px]",
  submit:
    "relative flex h-12 w-full items-center justify-center overflow-hidden rounded-full bg-gradient-to-b from-[#ff3636] to-[#c80000] text-base font-semibold text-white disabled:cursor-not-allowed",
  submitDisabled:
    "pointer-events-none absolute inset-0 rounded-full bg-[rgba(241,241,241,0.57)]",
} as const;

const HERO_BG_CROP = {
  height: "160.34%",
  width: "100%",
  left: 0,
  top: "-30.17%",
} as const;

const PRECISION = parseEther("1");

/** usdtOut = aulAmount * aulPrice * (1 - slip) / PRECISION^2 */
function previewUsdtOutWei(
  aulAmountWei: bigint,
  aulPrice: bigint,
  slip: bigint,
): bigint {
  if (
    aulAmountWei === BigInt(0) ||
    aulPrice === BigInt(0) ||
    slip >= PRECISION
  ) {
    return BigInt(0);
  }
  return (aulAmountWei * aulPrice * (PRECISION - slip)) / PRECISION / PRECISION;
}

function formatUsdtOut(fromAmount: string, aulPrice: bigint, slip: bigint) {
  const cleaned = sanitizeAmountInput(fromAmount.trim());
  if (!cleaned) return "";
  try {
    const aulAmountWei = parseEther(cleaned);
    const usdtOutWei = previewUsdtOutWei(aulAmountWei, aulPrice, slip);
    if (usdtOutWei === BigInt(0)) return "0";
    return sanitizeAmountInput(formatEther(usdtOutWei));
  } catch {
    return "";
  }
}

function formatNumber(value: number, maximumFractionDigits: number) {
  return value.toLocaleString("en-US", {
    maximumFractionDigits,
    minimumFractionDigits: 0,
    useGrouping: false,
  });
}

function sanitizeAmountInput(raw: string) {
  const cleaned = raw.replace(/[^\d.]/g, "");
  const parts = cleaned.split(".");
  return parts.length <= 1 ? cleaned : `${parts[0]}.${parts.slice(1).join("")}`;
}

function parseAmountInput(raw: string) {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const n = Number(trimmed);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

type AmountFieldProps = {
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
};

function AmountField({
  label,
  balanceLabel,
  placeholder,
  value,
  tokenIcon,
  tokenSymbol,
  fillMaxAria,
  onFillMax,
  onChange,
  readOnly,
}: AmountFieldProps) {
  const empty = !value;

  return (
    <div className={cls.amountField}>
      <div className="flex min-h-[27px] w-full items-center justify-between gap-2">
        <p className="shrink-0 text-sm font-semibold text-[#2a2a2a]">{label}</p>
        <div className="flex min-w-0 items-center gap-0.5">
          <p className="truncate text-xs text-[#707c85]">{balanceLabel}</p>
          <button
            type="button"
            aria-label={fillMaxAria}
            onClick={onFillMax}
            className="flex shrink-0"
          >
            <AppImage
              src={mineAssets.swapFillMax}
              alt=""
              width={19}
              height={19}
            />
          </button>
        </div>
      </div>

      <div className="flex min-h-6 w-full items-center justify-between gap-2">
        {readOnly ? (
          <p
            className={`min-w-0 flex-1 text-base leading-[30px] ${
              empty ? "text-[#c9cbcd]" : "text-[#333]"
            }`}
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
            className="min-w-0 flex-1 bg-transparent text-base leading-[30px] text-[#333] placeholder:text-[#c9cbcd] outline-none"
          />
        )}
        <div className="flex shrink-0 items-center gap-2">
          <AppImage src={tokenIcon} alt="" width={23} height={23} />
          <span className="font-noto-sc-black text-sm font-black text-black">
            {tokenSymbol}
          </span>
        </div>
      </div>
    </div>
  );
}

export function QuickSwap({ open, onClose }: QuickSwapProps) {
  const { t } = useTranslation();
  const userInfo = useUserInfoStore((state) => state.userInfo);
  const isWalletConnected = Boolean(userInfo.walletAddress);
  const [entered, setEntered] = React.useState(false);
  const [fromAmount, setFromAmount] = React.useState("");
  const [isSwapTxActive, setIsSwapTxActive] = React.useState(false);
  const txStepRef = React.useRef<SwapTxStep>("idle");
  const pendingAmountWeiRef = React.useRef(parseEther("0"));
  const processedTxHashRef = React.useRef<`0x${string}` | undefined>(undefined);
  const lastWriteErrorRef = React.useRef<unknown>(null);
  const lastReceiptErrorRef = React.useRef<unknown>(null);

  const walletAddress = userInfo.walletAddress as `0x${string}` | undefined;
  const readEnabled = open && isWalletConnected && Boolean(walletAddress);
  const quickswapReadEnabled = open && Boolean(QuickswapContract.address);

  const { data: aulBalanceData, isPending: aulBalancePending, refetch: refetchAulBalance } =
    useReadContract({
      ...AulContract,
      functionName: "balanceOf",
      args: walletAddress ? [walletAddress] : undefined,
      query: { enabled: readEnabled },
    });

  const aulBalance =
    aulBalanceData != null ? Number(formatEther(aulBalanceData)) : 0;

  const { data: usdtBalanceData, isPending: usdtBalancePending, refetch: refetchUsdtBalance } =
    useReadContract({
      ...UsdtContract,
      functionName: "balanceOf",
      args: walletAddress ? [walletAddress] : undefined,
      query: { enabled: readEnabled },
    });

  const usdtBalance =
    usdtBalanceData != null ? Number(formatEther(usdtBalanceData)) : 0;

  const { data: quickswapData, isPending: quickswapParamsPending } =
    useReadContracts({
      contracts: [
        { ...QuickswapContract, functionName: "aulPrice" },
        { ...QuickswapContract, functionName: "slip" },
      ],
      query: { enabled: quickswapReadEnabled },
    });

  const aulPrice =
    typeof quickswapData?.[0]?.result === "bigint"
      ? quickswapData[0].result
      : undefined;
  const slip =
    typeof quickswapData?.[1]?.result === "bigint"
      ? quickswapData[1].result
      : undefined;

  const { data: aulAllowanceData } = useReadContract({
    ...AulContract,
    functionName: "allowance",
    args:
      walletAddress && QuickswapContract.address
        ? [walletAddress, QuickswapContract.address]
        : undefined,
    query: {
      enabled: readEnabled && Boolean(QuickswapContract.address),
    },
  });

  const {
    data: txHash,
    error: writeError,
    writeContract,
    reset: resetWrite,
  } = useWriteContract();

  const {
    isSuccess: txConfirmed,
    error: receiptError,
  } = useWaitForTransactionReceipt({
    hash: txHash,
    query: { enabled: Boolean(txHash && isSwapTxActive) },
  });

  const opFailed = t("common.operationFailed");

  const finishSwapTx = React.useCallback(() => {
    setIsSwapTxActive(false);
    txStepRef.current = "idle";
    resetWrite();
  }, [resetWrite]);

  const sendContractTx = React.useCallback(
    (variables: Parameters<typeof writeContract>[0]) => {
      writeContract(variables, {
        onError: () => {
          finishSwapTx();
        },
      });
    },
    [writeContract, finishSwapTx],
  );

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

  React.useEffect(() => {
    if (!open) {
      setIsSwapTxActive(false);
      txStepRef.current = "idle";
      processedTxHashRef.current = undefined;
      resetWrite();
    }
  }, [open, resetWrite]);

  React.useEffect(() => {
    if (!writeError) {
      lastWriteErrorRef.current = null;
      return;
    }
    if (lastWriteErrorRef.current !== writeError) {
      lastWriteErrorRef.current = writeError;
      finishSwapTx();
      toast.error(getErrorMessage(writeError, opFailed));
    }
  }, [writeError, opFailed, finishSwapTx]);

  React.useEffect(() => {
    if (!receiptError) {
      lastReceiptErrorRef.current = null;
      return;
    }
    if (lastReceiptErrorRef.current !== receiptError) {
      lastReceiptErrorRef.current = receiptError;
      finishSwapTx();
      toast.error(getErrorMessage(receiptError, opFailed));
    }
  }, [receiptError, opFailed, finishSwapTx]);

  React.useEffect(() => {
    if (!txConfirmed || !txHash || processedTxHashRef.current === txHash) {
      return;
    }
    processedTxHashRef.current = txHash;

    if (txStepRef.current === "approve") {
      txStepRef.current = "swap";
      sendContractTx({
        ...QuickswapContract,
        functionName: "quickswapUsdt",
        args: [pendingAmountWeiRef.current],
      });
      return;
    }

    if (txStepRef.current === "swap") {
      finishSwapTx();
      toast.success(t("mine.swapSuccess"));
      setFromAmount("");
      void refetchAulBalance();
      void refetchUsdtBalance();
    }
  }, [
    txConfirmed,
    txHash,
    sendContractTx,
    finishSwapTx,
    t,
    refetchAulBalance,
    refetchUsdtBalance,
  ]);

  const parsedFrom = parseAmountInput(fromAmount);
  const loadingDots = t("common.loadingDots");
  const toAmount = React.useMemo(() => {
    if (!fromAmount.trim()) return "";
    if (quickswapParamsPending) return loadingDots;
    if (aulPrice == null || slip == null) return "";
    return formatUsdtOut(fromAmount, aulPrice, slip);
  }, [fromAmount, aulPrice, slip, quickswapParamsPending, loadingDots]);

  const exceedsBalance =
    !aulBalancePending && parsedFrom != null && parsedFrom > aulBalance;
  const canSubmit =
    isWalletConnected &&
    !aulBalancePending &&
    !quickswapParamsPending &&
    parsedFrom != null &&
    parsedFrom > 0 &&
    !exceedsBalance &&
    aulPrice != null &&
    slip != null &&
    toAmount !== "" &&
    toAmount !== loadingDots;

  const balanceLabel = (
    amount: number | string,
    currency: string,
    maximumFractionDigits = 0,
  ) =>
    t("mine.swapAvailableBalance", {
      amount:
        typeof amount === "number"
          ? formatNumber(amount, maximumFractionDigits)
          : amount,
      currency,
    });

  const aulBalanceLabel = aulBalancePending
    ? balanceLabel(t("common.loadingDots"), "AUL")
    : balanceLabel(aulBalance, "AUL", 4);

  const usdtBalanceLabel = usdtBalancePending
    ? balanceLabel(t("common.loadingDots"), "USDT")
    : balanceLabel(usdtBalance, "USDT", 4);

  const placeholder = t("mine.swapInputPlaceholder");
  const fillMaxAria = t("mine.swapFillMaxAria");

  const isTxBusy = isSwapTxActive;

  const submitButtonLabel = !isWalletConnected
    ? t("common.connectWalletBtn")
    : isTxBusy
      ? t("entrust.deployTxConfirming")
      : t("mine.swapTitle");

  const handleSubmit = () => {
    if (!canSubmit || isTxBusy) return;

    let amountWei: bigint;
    try {
      amountWei = parseEther(sanitizeAmountInput(fromAmount.trim()));
    } catch {
      toast.error(opFailed);
      return;
    }
    if (amountWei <= BigInt(0)) return;

    if (
      typeof aulBalanceData === "bigint" &&
      amountWei > aulBalanceData
    ) {
      toast.error(opFailed);
      return;
    }

    pendingAmountWeiRef.current = amountWei;
    processedTxHashRef.current = undefined;
    setIsSwapTxActive(true);

    const allowance =
      typeof aulAllowanceData === "bigint"
        ? aulAllowanceData
        : parseEther("0");
    if (allowance < amountWei) {
      txStepRef.current = "approve";
      sendContractTx({
        ...AulContract,
        functionName: "approve",
        args: [QuickswapContract.address, maxUint256],
      });
      return;
    }

    txStepRef.current = "swap";
    sendContractTx({
      ...QuickswapContract,
      functionName: "quickswapUsdt",
      args: [amountWei],
    });
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
          className={`${cls.surface} ${
            entered ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="h-11 shrink-0 bg-white" aria-hidden />
          <AulongHeader />

          <header className={cls.nav}>
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
            <h1 id="quick-swap-title" className={cls.title}>
              {t("mine.swapTitle")}
            </h1>
          </header>

          <div className="relative isolate flex min-h-0 flex-1 flex-col overflow-y-auto px-3 pb-[max(env(safe-area-inset-bottom),24px)]">
            <div className="relative w-full shrink-0">
              {/* Hero：背景币 + 龙虾，卡片上拉重叠 */}
              <div className="pointer-events-none relative aspect-[375/167] w-full overflow-visible">
                <div
                  className="absolute inset-y-0 left-0 z-[1] w-[77%] overflow-hidden opacity-[0.24]"
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
              </div>

              <div className="relative z-10 -mt-[10.933%] flex flex-col gap-[42px]">
                <div className={cls.glassCard}>
                  <div className="flex flex-col gap-2.5">
                    <AmountField
                      label={t("mine.swapFromLabel")}
                      balanceLabel={aulBalanceLabel}
                      placeholder={placeholder}
                      value={fromAmount}
                      tokenIcon={mineAssets.swapAulToken}
                      tokenSymbol="AUL"
                      fillMaxAria={fillMaxAria}
                      onFillMax={() => {
                        if (aulBalancePending || aulBalanceData == null) return;
                        setFromAmount(
                          sanitizeAmountInput(formatEther(aulBalanceData)),
                        );
                      }}
                      onChange={setFromAmount}
                    />
                    <AmountField
                      label={t("mine.swapToLabel")}
                      balanceLabel={usdtBalanceLabel}
                      placeholder={placeholder}
                      value={toAmount}
                      tokenIcon={mineAssets.swapUsdtToken}
                      tokenSymbol="USDT"
                      fillMaxAria={fillMaxAria}
                      onFillMax={() => {}}
                      readOnly
                    />
                  </div>

                  <button
                    type="button"
                    aria-label={t("mine.swapToggleAria")}
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

                <button
                  type="button"
                  disabled={!canSubmit || isTxBusy}
                  onClick={handleSubmit}
                  className={cls.submit}
                >
                  {!canSubmit || isTxBusy ? (
                    <span className={cls.submitDisabled} aria-hidden />
                  ) : null}
                  <span className="relative">{submitButtonLabel}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
