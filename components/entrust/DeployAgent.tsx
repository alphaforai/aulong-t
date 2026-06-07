"use client";

import React from "react";
import { AppImage } from "@/components/AppImage";
import { entrustAssets } from "./assets";
import {
  bottomSheetOverlayFrame,
  bottomSheetOverlayRoot,
} from "@/lib/mobileShell";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { useUserInfoStore } from "@/lib/store";
import {
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { UsdtContract } from "@/lib/abis/usdt";
import { entrustContract } from "@/lib/abis/entrust";
import { formatEther, maxUint256, parseEther } from "viem";
import { toast } from "sonner";

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error) {
    const e = error as Error & { shortMessage?: string };
    return e.shortMessage || e.message || fallback;
  }
  return fallback;
}

type EntrustTxStep = "idle" | "approve" | "entrust";

/** 部署 Agent 抽屉：与首页策略卡片一一对应 */
export type DeployStrategyId = "trend" | "arbitrage" | "hedge";

export type DeployStrategy = {
  id: DeployStrategyId;
  iconSrc: string;
  iconSize?: number;
  title: string;
  description: string;
  /** 卡片 APR 数值（不含 %） */
  apr: string;
  /** 抽屉「预计 APR」展示，如 70%-180% */
  aprEstimate: string;
  /** 周期天数（展示用字符串，与卡片一致） */
  period: string;
  /** 链上质押周期（EntrustTest supportedPeriods） */
  periodDays: number;
};

export const DEPLOY_STRATEGIES: Record<
  DeployStrategyId,
  Pick<DeployStrategy, "apr" | "aprEstimate" | "period" | "periodDays">
> = {
  trend: { apr: "238", aprEstimate: "200%-280%", period: "7", periodDays: 7 },
  arbitrage: {
    apr: "310",
    aprEstimate: "300%-380%",
    period: "90",
    periodDays: 90,
  },
  hedge: {
    apr: "388",
    aprEstimate: "388%-688%",
    period: "360",
    periodDays: 360,
  },
};

export type DeployAgentProps = {
  open: boolean;
  strategy: DeployStrategy | null;
  strategies: DeployStrategy[];
  onClose: () => void;
};

const CUSTODY_ASSET = "USDT";

function SheetRow({
  label,
  value,
  className = "",
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div
      className={`flex items-center justify-between text-sm leading-normal text-[#333] ${className}`}
    >
      <span>{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function SelectChevron({ open }: { open?: boolean }) {
  return (
    <svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className={`size-6 shrink-0 transition-transform duration-200 ${
        open ? "rotate-180" : ""
      }`}
    >
      <path
        d="M7 10l5 5 5-5"
        stroke="#333"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SelectField({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-[50px] w-full items-center justify-between rounded-[8px] bg-white/70 px-4 text-left"
    >
      {children}
      <SelectChevron />
    </button>
  );
}

function StrategySelect({
  strategies,
  value,
  onChange,
}: {
  strategies: DeployStrategy[];
  value: DeployStrategy;
  onChange: (strategy: DeployStrategy) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [listMounted, setListMounted] = React.useState(false);
  const [listExpanded, setListExpanded] = React.useState(false);
  const rootRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (open) {
      setListMounted(true);
      const frame = requestAnimationFrame(() => {
        requestAnimationFrame(() => setListExpanded(true));
      });
      return () => cancelAnimationFrame(frame);
    }
    setListExpanded(false);
    const timer = window.setTimeout(() => setListMounted(false), 200);
    return () => window.clearTimeout(timer);
  }, [open]);

  React.useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (rootRef.current?.contains(e.target as Node)) return;
      setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  React.useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => setOpen((prev) => !prev)}
        className="flex h-[50px] w-full items-center justify-between rounded-[8px] bg-white/70 px-4 text-left"
      >
        <span className="text-base font-semibold text-[#333]">
          {value.title}
        </span>
        <SelectChevron open={open} />
      </button>
      {listMounted && (
        <ul
          role="listbox"
          aria-label={value.title}
          className={`absolute inset-x-0 top-[calc(100%+4px)] z-30 origin-top overflow-hidden rounded-[8px] border border-white bg-white/95 shadow-[0_4px_12px_rgba(51,51,51,0.12)] backdrop-blur-[6px] transition-[transform,opacity] duration-300 ease-out ${
            listExpanded
              ? "pointer-events-auto scale-y-100 opacity-100"
              : "pointer-events-none scale-y-0 opacity-0"
          }`}
        >
          {strategies.map((item) => {
            const selected = item.id === value.id;
            return (
              <li key={item.id} role="option" aria-selected={selected}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(item);
                    setOpen(false);
                  }}
                  className={`flex h-[50px] w-full items-center px-4 text-left text-base transition-colors ${
                    selected
                      ? "bg-white/70 font-semibold text-[#333]"
                      : "font-normal text-[#333] hover:bg-white/50"
                  }`}
                >
                  {item.title}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export function DeployAgent({
  open,
  strategy,
  strategies,
  onClose,
}: DeployAgentProps) {
  const { t } = useTranslation();
  const userInfo = useUserInfoStore((state) => state.userInfo);
  const isWalletConnected = Boolean(userInfo.walletAddress);
  const [entered, setEntered] = React.useState(false);
  const [amount, setAmount] = React.useState("");
  const [isDeployTxActive, setIsDeployTxActive] = React.useState(false);
  const [selectedStrategy, setSelectedStrategy] =
    React.useState<DeployStrategy | null>(null);
  const txStepRef = React.useRef<EntrustTxStep>("idle");
  const pendingAmountWeiRef = React.useRef(parseEther("0"));
  const pendingPeriodDaysRef = React.useRef<number>(0);
  const processedTxHashRef = React.useRef<`0x${string}` | undefined>(undefined);
  const lastWriteErrorRef = React.useRef<unknown>(null);
  const lastReceiptErrorRef = React.useRef<unknown>(null);

  const closeSheet = React.useCallback(() => {
    setEntered(false);
    window.setTimeout(() => onClose(), 300);
  }, [onClose]);

  React.useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeSheet();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, closeSheet]);

  const opFailed = t("common.operationFailed");
  const walletAddress = userInfo.walletAddress as `0x${string}` | undefined;
  const readEnabled = open && Boolean(walletAddress);

  const {
    data: usdtBalanceData,
    isPending: usdtBalancePending,
    refetch: refetchUsdtBalance,
  } = useReadContract({
    ...UsdtContract,
    functionName: "balanceOf",
    args: walletAddress ? [walletAddress] : undefined,
    query: { enabled: readEnabled },
  });

  const { data: usdtAllowanceData, isPending: usdtAllowancePending } =
    useReadContract({
      ...UsdtContract,
      functionName: "allowance",
      args:
        walletAddress && entrustContract.address
          ? [walletAddress, entrustContract.address]
          : undefined,
      query: { enabled: readEnabled && Boolean(entrustContract.address) },
    });

  const { data: minEntrustAmountData } = useReadContract({
    ...entrustContract,
    functionName: "minEntrustAmount",
    query: { enabled: readEnabled },
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
    query: { enabled: Boolean(txHash && isDeployTxActive) },
  });

  const finishDeployTx = React.useCallback(() => {
    setIsDeployTxActive(false);
    txStepRef.current = "idle";
    resetWrite();
  }, [resetWrite]);

  const sendContractTx = React.useCallback(
    (variables: Parameters<typeof writeContract>[0]) => {
      writeContract(variables, {
        onError: () => {
          finishDeployTx();
          closeSheet();
        },
      });
    },
    [writeContract, finishDeployTx, closeSheet],
  );

  React.useEffect(() => {
    if (!open) {
      setEntered(false);
      setAmount("");
      setSelectedStrategy(null);
      finishDeployTx();
      processedTxHashRef.current = undefined;
      return;
    }
    if (strategy) setSelectedStrategy(strategy);
    const frame = requestAnimationFrame(() => {
      requestAnimationFrame(() => setEntered(true));
    });
    return () => cancelAnimationFrame(frame);
  }, [open, strategy, finishDeployTx]);

  const availableBalance =
    usdtBalanceData != null ? formatEther(usdtBalanceData) : "0.00";

  React.useEffect(() => {
    if (!writeError) {
      lastWriteErrorRef.current = null;
      return;
    }
    if (lastWriteErrorRef.current !== writeError) {
      lastWriteErrorRef.current = writeError;
      finishDeployTx();
      toast.error(getErrorMessage(writeError, opFailed));
      closeSheet();
    }
  }, [writeError, opFailed, finishDeployTx, closeSheet]);

  React.useEffect(() => {
    if (!receiptError) {
      lastReceiptErrorRef.current = null;
      return;
    }
    if (lastReceiptErrorRef.current !== receiptError) {
      lastReceiptErrorRef.current = receiptError;
      finishDeployTx();
      toast.error(getErrorMessage(receiptError, opFailed));
      closeSheet();
    }
  }, [receiptError, opFailed, finishDeployTx, closeSheet]);

  React.useEffect(() => {
    if (!txConfirmed || !txHash || processedTxHashRef.current === txHash) {
      return;
    }
    processedTxHashRef.current = txHash;

    if (txStepRef.current === "approve") {
      txStepRef.current = "entrust";
      sendContractTx({
        ...entrustContract,
        functionName: "entrustUSDT",
        args: [pendingAmountWeiRef.current, BigInt(pendingPeriodDaysRef.current)],
      });
      return;
    }

    if (txStepRef.current === "entrust") {
      finishDeployTx();
      toast.success(t("entrust.deploySuccess"));
      void refetchUsdtBalance();
      setAmount("");
      closeSheet();
    }
  }, [
    txConfirmed,
    txHash,
    sendContractTx,
    finishDeployTx,
    closeSheet,
    t,
    refetchUsdtBalance,
  ]);

  if (!open || !strategy || !selectedStrategy) return null;

  const periodLabel = `${selectedStrategy.period}${t("entrust.periodUnit")}`;

  const displayBalance = usdtBalancePending
    ? t("common.loadingDots")
    : availableBalance;

  const isTxBusy = isDeployTxActive;

  const handleMax = () => {
    if (usdtBalancePending || isTxBusy || availableBalance === "0.00") return;
    setAmount(availableBalance);
  };

  const handleLaunch = () => {
    if (!isWalletConnected) {
      toast.success(t("entrust.deployConnectWalletFirst"));
      return;
    }
    if (usdtBalancePending || usdtAllowancePending || isTxBusy) return;

    const trimmed = amount.trim();
    if (!trimmed || !/^\d+(\.\d+)?$/.test(trimmed)) {
      toast.error(t("entrust.deployInvalidAmount"));
      return;
    }

    let amountWei: bigint;
    try {
      amountWei = parseEther(trimmed);
    } catch {
      toast.error(t("entrust.deployInvalidAmount"));
      return;
    }

    if (amountWei <= parseEther("0")) {
      toast.error(t("entrust.deployInvalidAmount"));
      return;
    }

    if (
      typeof minEntrustAmountData === "bigint" &&
      amountWei < minEntrustAmountData
    ) {
      toast.error(
        t("entrust.deployBelowMinAmount", {
          min: formatEther(minEntrustAmountData),
        }),
      );
      return;
    }

    const balanceWei =
      typeof usdtBalanceData === "bigint" ? usdtBalanceData : undefined;
    if (balanceWei != null && amountWei > balanceWei) {
      toast.error(t("entrust.deployInsufficientBalance"));
      return;
    }

    pendingAmountWeiRef.current = amountWei;
    pendingPeriodDaysRef.current = selectedStrategy.periodDays;
    processedTxHashRef.current = undefined;
    setIsDeployTxActive(true);

    const allowance =
      typeof usdtAllowanceData === "bigint"
        ? usdtAllowanceData
        : parseEther("0");
    if (allowance < amountWei) {
      txStepRef.current = "approve";
      sendContractTx({
        ...UsdtContract,
        functionName: "approve",
        args: [entrustContract.address, maxUint256],
      });
      return;
    }

    txStepRef.current = "entrust";
    sendContractTx({
      ...entrustContract,
      functionName: "entrustUSDT",
      args: [amountWei, BigInt(selectedStrategy.periodDays)],
    });
  };

  const launchButtonLabel = !isWalletConnected
    ? t("entrust.deployConnectWalletFirst")
    : isTxBusy
      ? t("entrust.deployTxConfirming")
      : t("entrust.start");

  return (
    <div
      className={`${bottomSheetOverlayRoot} z-70`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="deploy-agent-sheet-title"
    >
      <div className={bottomSheetOverlayFrame}>
        <button
          type="button"
          aria-label={t("common.close")}
          className={`absolute inset-0 bg-black/50 backdrop-blur-[6px] transition-opacity duration-300 ease-out ${
            entered ? "opacity-100" : "opacity-0"
          }`}
          onClick={closeSheet}
        />
        <div
          className={`relative flex max-h-[min(602px,92dvh)] w-full flex-col overflow-hidden rounded-t-[12px] bg-white/90 shadow-[0_-12px_40px_rgba(0,0,0,0.15)] backdrop-blur-[6px] transition-transform duration-300 ease-out ${
            entered ? "translate-y-0" : "translate-y-full"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-3 pb-3 pt-5">
            <h2
              id="deploy-agent-sheet-title"
              className="text-center text-lg font-semibold uppercase leading-normal text-[#333]"
            >
              {t("entrust.deployAgentTitle")}
            </h2>

            <div className="mt-4 flex items-center gap-[3px]">
              <AppImage
                src={selectedStrategy.iconSrc}
                alt=""
                width={22}
                height={22}
                className="size-[22px] shrink-0 object-contain"
              />
              <span className="text-base font-semibold leading-[22px] text-[#333]">
                {t("entrust.deployAgentStrategySection")}
              </span>
            </div>

            <div className="mt-3">
              <StrategySelect
                strategies={strategies}
                value={selectedStrategy}
                onChange={setSelectedStrategy}
              />
            </div>

            <div className="mt-3 rounded-[8px] bg-white/70 px-4 py-3">
              <div className="flex flex-col gap-4">
                <SheetRow
                  label={t("entrust.deployAgentLabel")}
                  value={selectedStrategy.title}
                />
                <SheetRow
                  label={t("entrust.deployCyclePeriod")}
                  value={periodLabel}
                />
                <SheetRow
                  label={t("entrust.deployEstimatedApr")}
                  value={selectedStrategy.aprEstimate}
                />
              </div>
            </div>

            <p className="mt-4 text-base font-medium text-[#333]">
              {t("entrust.deployCustodyAsset")}
            </p>
            <div className="mt-1.5">
              <SelectField
              // onClick={() => toast.success(t("common.notOpen"))}
              >
                <span className="flex items-center gap-1.5">
                  {/* 原生 img，避免 next/image 缓存旧的 BTC 图标 */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={entrustAssets.deployUsdtIcon}
                    alt=""
                    width={22}
                    height={22}
                    className="size-[22px] shrink-0 rounded-full object-contain"
                  />
                  <span className="text-base text-[#333]">{CUSTODY_ASSET}</span>
                </span>
              </SelectField>
            </div>

            <p className="mt-4 text-base font-medium text-[#333]">
              {t("entrust.deployCustodyAmount")}
            </p>
            <div className="mt-1.5 flex h-[50px] items-center justify-between rounded-[8px] bg-white/70 px-4">
              <input
                type="text"
                inputMode="decimal"
                placeholder={t("entrust.deployAmountPlaceholder")}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="min-w-0 flex-1 bg-transparent text-base text-[#333] placeholder:text-[rgba(51,51,51,0.3)] outline-none"
              />
              <div className="flex shrink-0 items-center gap-3 text-sm">
                <span className="text-[#333]">{CUSTODY_ASSET}</span>
                <button
                  type="button"
                  onClick={handleMax}
                  className="font-medium text-[#143fff]"
                >
                  {t("entrust.deployMax")}
                </button>
              </div>
            </div>
            <p className="mt-3 text-xs leading-[19px] text-[#333]">
              {t("entrust.deployAvailableBalance", {
                balance: displayBalance,
                asset: CUSTODY_ASSET,
              })}
            </p>
          </div>

          <div className="shrink-0 px-3 pb-[max(env(safe-area-inset-bottom),16px)] pt-2">
            <button
              type="button"
              onClick={handleLaunch}
              disabled={isWalletConnected && (usdtBalancePending || isTxBusy)}
              className="relative mx-auto flex h-[58px] w-full max-w-[308px] items-center justify-center overflow-hidden rounded-[33px] border border-white px-[10px] shadow-[0_4px_6px_rgba(213,0,0,0.12)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-[33px] bg-gradient-to-r from-[#ff4d00] via-[#ff3033] via-[53.846%] to-[#e90000]"
              />
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0px_-4px_4px_0px_rgba(255,254,227,0.7),inset_0px_8px_17px_0px_#ffe5e5]"
              />
              <span className="relative text-base font-semibold text-white [text-shadow:0_1px_3px_rgba(94,44,44,0.25)]">
                {launchButtonLabel}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
