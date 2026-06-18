"use client";

import { useCallback, useEffect, useRef } from "react";
import {
  useConnection,
  useReadContract,
  useSwitchChain,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { bsc } from "wagmi/chains";
import { TicketSalesContract } from "@/lib/abis/ticketsales";
import { getUserInfo } from "@/lib/api/users";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { toast } from "sonner";

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error) {
    const e = error as Error & { shortMessage?: string };
    return e.shortMessage || e.message || fallback;
  }
  return fallback;
}

/**
 * 白名单链上购买：读 ticketPrice / purchases，发起 buyTicket，并在成交后刷新用户资料。
 * 供 WhitelistGate 全站拦截与 TicketCard 展示复用。
 */
export function useWhitelistPurchase(walletAddress: string | undefined) {
  const { t } = useTranslation();
  const { chainId } = useConnection();
  const { switchChainAsync } = useSwitchChain();
  const readEnabled = Boolean(walletAddress);

  const lastReadErrorRef = useRef<unknown>(null);
  const lastTicketPriceErrorRef = useRef<unknown>(null);
  const lastWriteErrorRef = useRef<unknown>(null);
  const lastReceiptErrorRef = useRef<unknown>(null);

  const {
    data: purchasesData,
    isPending: purchasesPending,
    error: readError,
    refetch: refetchPurchases,
  } = useReadContract({
    ...TicketSalesContract,
    functionName: "purchases",
    args: readEnabled ? [walletAddress as `0x${string}`] : undefined,
    query: {
      enabled: readEnabled,
    },
  });

  /** 链上 purchases 映射第一项 hasPurchased，为白名单准入的权威来源 */
  const hasPurchased = Boolean(purchasesData?.[0]);

  const {
    data: ticketPriceWei,
    error: readTicketPriceError,
    isPending: ticketPricePending,
  } = useReadContract({
    ...TicketSalesContract,
    functionName: "ticketPrice",
  });

  const {
    data: hash,
    error: writeError,
    isPending: writeIsPending,
    writeContract,
  } = useWriteContract();

  const {
    isLoading: writeIsConfirming,
    isSuccess,
    error: receiptError,
  } = useWaitForTransactionReceipt({
    hash,
  });

  const opFailed = t("common.operationFailed");

  useEffect(() => {
    if (!readError) {
      lastReadErrorRef.current = null;
      return;
    }
    if (lastReadErrorRef.current !== readError) {
      lastReadErrorRef.current = readError;
      toast.error(getErrorMessage(readError, opFailed));
    }
  }, [readError, opFailed]);

  useEffect(() => {
    if (!readTicketPriceError) {
      lastTicketPriceErrorRef.current = null;
      return;
    }
    if (lastTicketPriceErrorRef.current !== readTicketPriceError) {
      lastTicketPriceErrorRef.current = readTicketPriceError;
      toast.error(getErrorMessage(readTicketPriceError, opFailed));
    }
  }, [readTicketPriceError, opFailed]);

  useEffect(() => {
    if (!writeError) {
      lastWriteErrorRef.current = null;
    } else if (lastWriteErrorRef.current !== writeError) {
      lastWriteErrorRef.current = writeError;
      toast.error(getErrorMessage(writeError, opFailed));
    }

    if (!receiptError) {
      lastReceiptErrorRef.current = null;
      return;
    }
    if (lastReceiptErrorRef.current !== receiptError) {
      lastReceiptErrorRef.current = receiptError;
      toast.error(getErrorMessage(receiptError, opFailed));
    }
  }, [receiptError, writeError, opFailed]);

  /** 支付上链成功后刷新链上状态与后端 hasTicket */
  useEffect(() => {
    if (!isSuccess) return;
    void refetchPurchases();
    void getUserInfo();
  }, [isSuccess, refetchPurchases]);

  const buyWhitelist = useCallback(async () => {
    if (!readEnabled || ticketPriceWei == null || hasPurchased) return;

    // buyTicket 仅在 BSC 上可用，支付前确保网络正确
    if (chainId !== bsc.id) {
      try {
        await switchChainAsync({ chainId: bsc.id });
      } catch (error: unknown) {
        const e = error as { shortMessage?: string; message?: string };
        toast.error(
          e?.shortMessage || e?.message || t("header.switchBscFailed"),
        );
        throw error;
      }
    }

    writeContract({
      ...TicketSalesContract,
      functionName: "buyTicket",
      args: [],
      value: ticketPriceWei,
    });
  }, [
    chainId,
    hasPurchased,
    readEnabled,
    switchChainAsync,
    t,
    ticketPriceWei,
    writeContract,
  ]);

  const isPaying = writeIsPending || writeIsConfirming;
  const isLoading = purchasesPending || ticketPricePending;
  const canBuy =
    readEnabled && ticketPriceWei != null && !hasPurchased && !isPaying;

  return {
    hasPurchased,
    ticketPriceWei,
    buyWhitelist,
    isPaying,
    isLoading,
    canBuy,
    purchasesPending,
  };
}
