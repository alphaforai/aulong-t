"use client";

import React from "react";
import AulongHeader from "@/components/AulongHeader";
import { AppImage } from "@/components/AppImage";
import { teamAssets } from "@/components/team/assets";
import { mineAssets } from "./assets";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { getPlatformConfig } from "@/lib/api/platformConfig";
import { applyWithdrawal, getUserAssets, getXcoinPrice, getWithdrawalPreview } from "@/lib/api/users";
import { useUserInfoStore } from "@/lib/store";
import {
  sidePanelOverlayFrame,
  sidePanelOverlayRoot,
} from "@/lib/mobileShell";
import { useQuery } from "@tanstack/react-query";
import {
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { formatEther, maxUint256, parseEther } from "viem";
import { toast } from "sonner";
import { AulContract } from "@/lib/abis/aul";
import { QuickswapContract } from "@/lib/abis/quickswap";
import { WithdrawalRecordPanel } from "./WithdrawalRecordPanel";

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error) {
    const e = error as Error & { shortMessage?: string };
    return e.shortMessage || e.message || fallback;
  }
  return fallback;
}

type WithdrawTxStep = "idle" | "approve" | "fee";

export type WithdrawUSDTProps = {
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

type WithdrawPlatformConfig = {
  feeUsdtRatio?: number;
  feeXRatio?: number;
  maxWithdrawAmount?: number;
  minWithdrawAmount?: number;
  usdtWithdrawEnabled?: boolean;
};

function formatBalance(value: number): string {
  return value.toLocaleString("en-US", {
    maximumFractionDigits: 8,
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

export function WithdrawUSDT({ open, onClose }: WithdrawUSDTProps) {
  const { t } = useTranslation();
  const walletAddress = useUserInfoStore((state) => state.userInfo.walletAddress);
  const [entered, setEntered] = React.useState(false);
  const [amount, setAmount] = React.useState("");
  const [showRecords, setShowRecords] = React.useState(false);
  const [isWithdrawTxActive, setIsWithdrawTxActive] = React.useState(false);
  const [isPreviewLoading, setIsPreviewLoading] = React.useState(false);
  const txStepRef = React.useRef<WithdrawTxStep>("idle");
  const pendingFeeAulWeiRef = React.useRef(BigInt(0));
  const pendingWithdrawAmountRef = React.useRef(0);
  const processedTxHashRef = React.useRef<`0x${string}` | undefined>(undefined);
  const lastWriteErrorRef = React.useRef<unknown>(null);
  const lastReceiptErrorRef = React.useRef<unknown>(null);
  const opFailed = t("common.operationFailed");

  const {
    data: userAssetsResponse,
    isPending: userAssetsPending,
    refetch: refetchUserAssets,
  } = useQuery({
    queryKey: ["userAssets", walletAddress],
    queryFn: () => getUserAssets(),
    enabled: Boolean(walletAddress),
  });

  const withdrawableUsdt = userAssetsResponse?.data?.usdtBalance ?? 0;

  const {
    data: xcoinPriceResponse,
    isPending: xcoinPricePending,
    refetch: refetchXcoinPrice,
  } = useQuery({
    queryKey: ["xcoinPrice"],
    queryFn: () => getXcoinPrice(),
  });

  const aulPrice = Number(xcoinPriceResponse?.data?.currentPrice ?? 0);

  const { data: withdrawConfig, isPending: withdrawConfigPending } = useQuery({
    queryKey: ["platformConfig", "withdraw"],
    queryFn: () => getPlatformConfig("withdraw"),
    enabled: open,
  });

  // withdrawConfig example:
  //   {
  //     aulAutoDisburseThreshold: 1,
  //     aulWithdrawEnabled: true,            // 是否开启AUL提现
  //     feeUsdtRatio: 10,                    // USDT提现中USDT手续费比例
  //     feeXRatio: 5,                         // USDT提现中AUL手续费占比
  //     maxWithdrawAmount: 0,                  // USDT提现单笔最大提现金额，0表示不限制
  //     maxWithdrawAmountX: 0,                 // AUL提现单笔最大提现金额，0表示不限制
  //     minWithdrawAmount: 5,                  // USDT提现单笔最小提现金额
  //     minWithdrawAmountX: 0,                 // AUL提现单笔最小提现金额
  //     usdtAutoDisburseThreshold: 1,
  //     usdtWithdrawEnabled: true,           // 是否开启USDT提现
  //     withdrawFeeRate: 15,                 // USDT提现总手续费比例
  //     withdrawFeeRateX: 15,                // AUL提现总手续费比例
  // }

  const {
    usdtWithdrawEnabled,
    minWithdrawAmount,
    maxWithdrawAmount,
    feeUsdtRatio,
    feeXRatio,
  } = React.useMemo(() => {
    const config = withdrawConfig as WithdrawPlatformConfig | undefined;
    const min = Number(config?.minWithdrawAmount);
    const max = Number(config?.maxWithdrawAmount);
    const usdtFee = Number(config?.feeUsdtRatio);
    const xFee = Number(config?.feeXRatio);
    return {
      usdtWithdrawEnabled: config?.usdtWithdrawEnabled === true,
      minWithdrawAmount: Number.isFinite(min) ? min : 0,
      maxWithdrawAmount: Number.isFinite(max) ? max : 0,
      feeUsdtRatio: Number.isFinite(usdtFee) ? usdtFee : 0,
      feeXRatio: Number.isFinite(xFee) ? xFee : 0,
    };
  }, [withdrawConfig]);

  const wallet = walletAddress as `0x${string}` | undefined;
  const chainReadEnabled = open && Boolean(wallet);

  const {
    data: aulBalanceData,
    isPending: aulBalancePending,
    refetch: refetchAulBalance,
  } = useReadContract({
    ...AulContract,
    functionName: "balanceOf",
    args: wallet ? [wallet] : undefined,
    query: { enabled: chainReadEnabled },
  });

  const availableAul =
    aulBalanceData != null ? Number(formatEther(aulBalanceData)) : 0;

  const { data: aulAllowanceData } = useReadContract({
    ...AulContract,
    functionName: "allowance",
    args:
      wallet && QuickswapContract.address
        ? [wallet, QuickswapContract.address]
        : undefined,
    query: {
      enabled: chainReadEnabled && Boolean(QuickswapContract.address),
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
    query: { enabled: Boolean(txHash && isWithdrawTxActive) },
  });

  const finishWithdrawTx = React.useCallback(() => {
    setIsWithdrawTxActive(false);
    txStepRef.current = "idle";
    resetWrite();
  }, [resetWrite]);

  const sendContractTx = React.useCallback(
    (variables: Parameters<typeof writeContract>[0]) => {
      writeContract(variables, {
        onError: () => {
          finishWithdrawTx();
        },
      });
    },
    [writeContract, finishWithdrawTx],
  );

  const submitWithdrawalApi = React.useCallback(
    async (hash: `0x${string}`) => {
      try {
        await applyWithdrawal({
          currency: "USDT",
          amount: pendingWithdrawAmountRef.current,
          txHash: hash,
        });
        finishWithdrawTx();
        toast.success(t("mine.withdrawSuccess"));
        setAmount("");
        void refetchUserAssets();
        void refetchAulBalance();
      } catch (error) {
        finishWithdrawTx();
        toast.error(getErrorMessage(error, opFailed));
      }
    },
    [
      finishWithdrawTx,
      opFailed,
      refetchAulBalance,
      refetchUserAssets,
      t,
    ],
  );

  const closePanel = React.useCallback(() => {
    setEntered(false);
    window.setTimeout(() => onClose(), 300);
  }, [onClose]);

  React.useEffect(() => {
    if (!open) {
      setEntered(false);
      setAmount("");
      setShowRecords(false);
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
    if (!open || !walletAddress) return;
    void refetchUserAssets();
    void refetchAulBalance();
    void refetchXcoinPrice();
  }, [open, walletAddress, refetchUserAssets, refetchAulBalance, refetchXcoinPrice]);

  React.useEffect(() => {
    if (!open) {
      finishWithdrawTx();
      setIsPreviewLoading(false);
      processedTxHashRef.current = undefined;
    }
  }, [open, finishWithdrawTx]);

  React.useEffect(() => {
    if (!writeError) {
      lastWriteErrorRef.current = null;
      return;
    }
    if (lastWriteErrorRef.current !== writeError) {
      lastWriteErrorRef.current = writeError;
      finishWithdrawTx();
      toast.error(getErrorMessage(writeError, opFailed));
    }
  }, [writeError, opFailed, finishWithdrawTx]);

  React.useEffect(() => {
    if (!receiptError) {
      lastReceiptErrorRef.current = null;
      return;
    }
    if (lastReceiptErrorRef.current !== receiptError) {
      lastReceiptErrorRef.current = receiptError;
      finishWithdrawTx();
      toast.error(getErrorMessage(receiptError, opFailed));
    }
  }, [receiptError, opFailed, finishWithdrawTx]);

  React.useEffect(() => {
    if (!txConfirmed || !txHash || processedTxHashRef.current === txHash) {
      return;
    }
    processedTxHashRef.current = txHash;

    if (txStepRef.current === "approve") {
      txStepRef.current = "fee";
      sendContractTx({
        ...QuickswapContract,
        functionName: "handingFeeAUL",
        args: [pendingFeeAulWeiRef.current],
      });
      return;
    }

    if (txStepRef.current === "fee") {
      void submitWithdrawalApi(txHash);
    }
  }, [txConfirmed, txHash, sendContractTx, submitWithdrawalApi]);

  const parsedAmount = parseAmountInput(amount);
  const hasInput = amount.trim().length > 0;
  const notPositive =
    hasInput && (parsedAmount == null || parsedAmount <= 0);

  const singleWithdrawMaxLimit =
    maxWithdrawAmount > 0
      ? Math.min(maxWithdrawAmount, withdrawableUsdt)
      : withdrawableUsdt;

  const exceedsMaxLimit =
    parsedAmount != null &&
    parsedAmount > 0 &&
    parsedAmount > singleWithdrawMaxLimit;

  const belowMin =
    parsedAmount != null &&
    parsedAmount > 0 &&
    minWithdrawAmount > 0 &&
    parsedAmount < minWithdrawAmount;

  const feeAulWei = React.useMemo(() => {
    if (parsedAmount == null || parsedAmount <= 0 || aulPrice <= 0 || feeXRatio <= 0) {
      return BigInt(0);
    }
    const feeAulAmount = (parsedAmount * (feeXRatio / 100)) / aulPrice;
    if (feeAulAmount <= 0) return BigInt(0);
    try {
      return parseEther(sanitizeAmountInput(String(feeAulAmount)));
    } catch {
      return BigInt(0);
    }
  }, [parsedAmount, aulPrice, feeXRatio]);

  const feeAul =
    feeAulWei > BigInt(0) ? Number(formatEther(feeAulWei)) : 0;

  const insufficientAulFee =
    !aulBalancePending &&
    !xcoinPricePending &&
    !withdrawConfigPending &&
    parsedAmount != null &&
    parsedAmount > 0 &&
    feeAul > 0 &&
    availableAul < feeAul;

  const hasValidationError =
    notPositive || exceedsMaxLimit || belowMin || insufficientAulFee;

  const isTxBusy = isWithdrawTxActive || isPreviewLoading;
  const canSubmit =
    !userAssetsPending &&
    !aulBalancePending &&
    !xcoinPricePending &&
    !withdrawConfigPending &&
    usdtWithdrawEnabled &&
    feeXRatio > 0 &&
    !isTxBusy &&
    hasInput &&
    parsedAmount != null &&
    parsedAmount > 0 &&
    !hasValidationError &&
    feeAulWei > BigInt(0) &&
    Boolean(QuickswapContract.address);

  const withdrawableUsdtLabel = userAssetsPending
    ? t("common.loadingDots")
    : formatBalance(withdrawableUsdt);

  const availableAulLabel = aulBalancePending
    ? t("common.loadingDots")
    : formatBalance(availableAul);

  const feeUsdt =
    parsedAmount != null && parsedAmount > 0
      ? (parsedAmount * feeUsdtRatio) / 100
      : 0;

  const feeAulLabel =
    (xcoinPricePending || withdrawConfigPending) &&
    parsedAmount != null &&
    parsedAmount > 0
      ? t("common.loadingDots")
      : formatBalance(feeAul);

  const submitButtonLabel = isWithdrawTxActive
    ? t("entrust.deployTxConfirming")
    : isPreviewLoading
      ? t("common.loadingDots")
      : t("mine.withdrawSubmit");

  const handleSubmit = async () => {
    if (!canSubmit || isTxBusy || parsedAmount == null || withdrawConfigPending) {
      return;
    }

    if (!usdtWithdrawEnabled) {
      toast.error(t("mine.withdrawUsdtClosed"));
      return;
    }

    if (!QuickswapContract.address) {
      toast.error(opFailed);
      return;
    }

    setIsPreviewLoading(true);
    try {
      const previewResponse = await getWithdrawalPreview({
        currency: "USDT",
        amount: parsedAmount,
        txHash: "",
      });
      console.log("getWithdrawalPreview", previewResponse);
    } catch (error) {
      toast.error(getErrorMessage(error, opFailed));
      setIsPreviewLoading(false);
      return;
    }
    setIsPreviewLoading(false);

    pendingFeeAulWeiRef.current = feeAulWei;
    pendingWithdrawAmountRef.current = parsedAmount;
    processedTxHashRef.current = undefined;
    setIsWithdrawTxActive(true);

    const allowance =
      typeof aulAllowanceData === "bigint"
        ? aulAllowanceData
        : parseEther("0");

    if (allowance < feeAulWei) {
      txStepRef.current = "approve";
      sendContractTx({
        ...AulContract,
        functionName: "approve",
        args: [QuickswapContract.address, maxUint256],
      });
      return;
    }

    txStepRef.current = "fee";
    sendContractTx({
      ...QuickswapContract,
      functionName: "handingFeeAUL",
      args: [feeAulWei],
    });
  };

  const amountPlaceholder = withdrawConfigPending
    ? t("common.loadingDots")
    : t("mine.withdrawAmountPlaceholder", {
        min: formatBalance(minWithdrawAmount),
      });

  const handleFillAll = () => {
    if (userAssetsPending) return;
    setAmount(String(withdrawableUsdt));
  };

  const recordsOpen = open && showRecords;

  return (
    <>
      {open ? (
    <div
      className={`${sidePanelOverlayRoot} z-80`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="withdraw-usdt-title"
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
              id="withdraw-usdt-title"
              className="text-lg font-medium leading-[26px] text-[#272727]"
            >
              {t("mine.withdrawPanelTitle")}
            </h1>
            <button
              type="button"
              onClick={() => setShowRecords(true)}
              className="absolute right-3 text-sm leading-[26px] text-[#272727]"
            >
              {t("mine.withdrawRecordBtn")}
            </button>
          </header>

          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-3 pb-[max(env(safe-area-inset-bottom),24px)] pt-4">
            <div className="flex flex-col gap-6">
              <FieldBlock label={t("mine.withdrawCurrency")}>
                <button
                  type="button"
                //   onClick={() => toast.success(t("common.notOpen"))}
                  className="flex h-12 w-full items-center justify-start rounded-[6px] bg-[#eff0f1] px-[11px] py-1"
                >
                  <span className="flex items-center gap-1.5">
                    <AppImage
                      src={mineAssets.withdrawUsdtIcon}
                      alt=""
                      width={20}
                      height={20}
                      className="size-5 shrink-0 object-contain"
                    />
                    <span className="font-mulish text-base font-bold text-[#333]">
                      USDT
                    </span>
                  </span>
                </button>
              </FieldBlock>

              <FieldBlock label={t("mine.withdrawAmount")}>
                <div className="flex flex-col gap-2">
                  <div
                    className={`flex h-12 items-center justify-between rounded-[6px] bg-[#eff0f1] px-[11px] py-1 ${
                      hasValidationError
                        ? "border border-red-500"
                        : "border border-transparent"
                    }`}
                  >
                    <input
                      type="text"
                      inputMode="decimal"
                      placeholder={amountPlaceholder}
                      value={amount}
                      onChange={(e) =>
                        setAmount(sanitizeAmountInput(e.target.value))
                      }
                      className="min-w-0 flex-1 bg-transparent text-sm text-[#333] placeholder:text-[#949494] outline-none"
                    />
                    <div className="flex shrink-0 items-center gap-4">
                      <span className="text-sm text-[#bbb]">USDT</span>
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
                    {notPositive ? (
                      <p className="text-sm tracking-[0.18px] text-[#ea4747]">
                        {t("mine.withdrawAmountInvalid")}
                      </p>
                    ) : null}
                    {exceedsMaxLimit ? (
                      <p className="text-sm tracking-[0.18px] text-[#ea4747]">
                        {t("mine.withdrawExceedLimit")}
                      </p>
                    ) : null}
                    {belowMin ? (
                      <p className="text-sm tracking-[0.18px] text-[#ea4747]">
                        {t("mine.withdrawUsdtBelowMin", {
                          min: formatBalance(minWithdrawAmount),
                        })}
                      </p>
                    ) : null}
                    {insufficientAulFee ? (
                      <p className="text-sm tracking-[0.18px] text-[#ea4747]">
                        {t("mine.withdrawInsufficientAulFee")}
                      </p>
                    ) : null}

                    <InfoRow
                      label={
                        exceedsMaxLimit
                          ? t("mine.availableUsdt")
                          : t("mine.withdrawableUsdt")
                      }
                      value={`${withdrawableUsdtLabel} USDT`}
                    />
                    <InfoRow
                      label={t("mine.availableAul")}
                      value={`${availableAulLabel} AUL`}
                    />
                    <InfoRow
                      label={t("mine.withdrawFee")}
                      value={
                        withdrawConfigPending &&
                        parsedAmount != null &&
                        parsedAmount > 0
                          ? t("common.loadingDots")
                          : `${formatBalance(feeUsdt)} USDT + ${feeAulLabel} AUL`
                      }
                    />
                  </div>
                </div>
              </FieldBlock>
            </div>

            <button
              type="button"
              disabled={!canSubmit || isTxBusy}
              onClick={() => void handleSubmit()}
              className={`mx-auto mt-10 flex h-[58px] w-full max-w-[308px] flex-col items-center justify-center px-2.5 ${GRADIENT_BTN} disabled:cursor-not-allowed`}
            >
              <span className={GRADIENT_FILL} aria-hidden />
              {!canSubmit || isTxBusy ? (
                <span className={DISABLED_OVERLAY} aria-hidden />
              ) : null}
              <span className={GRADIENT_INSET} aria-hidden />
              <span className="relative text-base font-semibold text-white [text-shadow:0_1px_3px_rgba(94,44,44,0.25)]">
                {submitButtonLabel}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
      ) : null}
      <WithdrawalRecordPanel
        open={recordsOpen}
        onClose={() => setShowRecords(false)}
      />
    </>
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
