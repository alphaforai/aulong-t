"use client";

import React from "react";
import { entrustAssets } from "./assets";
import { AppImage } from "@/components/AppImage";
import { ImageButton } from "./ImageButton";

import {
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { TicketSalesContract } from "@/lib/abis/ticketsales";
import { useUserInfoStore } from "@/lib/store";
import { toast } from "sonner";
import { formatEther } from "viem";
import { getPlatformConfig } from "@/lib/api/platformConfig";
import { useQuery } from "@tanstack/react-query";
import { getUserInfo } from "@/lib/api/users";
import { useTranslation } from "@/lib/hooks/useTranslation";

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error) {
    const e = error as Error & { shortMessage?: string };
    return e.shortMessage || e.message || fallback;
  }
  return fallback;
}

export function TicketCard() {
  const { t } = useTranslation();
  const walletAddress = useUserInfoStore(
    (state) => state.userInfo.walletAddress,
  );
  const readEnabled = Boolean(walletAddress);

  const {
    data,
    isPending: readIsPending,
    error: readError,
    refetch,
  } = useReadContract({
    ...TicketSalesContract,
    functionName: "purchases",
    args: readEnabled ? [walletAddress as `0x${string}`] : undefined,
    query: {
      enabled: readEnabled,
    },
  });

  const opFailed = t("common.operationFailed");

  React.useEffect(() => {
    if (readError) {
      toast.error(getErrorMessage(readError, opFailed));
    }
  }, [readError, opFailed]);

  const hasPurchased = Boolean(data?.[0]);

  const {
    data: ticketPriceWei,
    error: readTicketPriceError,
    isPending: ticketPriceReadPending,
  } = useReadContract({
    ...TicketSalesContract,
    functionName: "ticketPrice",
  });

  React.useEffect(() => {
    if (readTicketPriceError) {
      toast.error(getErrorMessage(readTicketPriceError, opFailed));
    }
  }, [readTicketPriceError, opFailed]);

  const {
    data: hash,
    error: writeError,
    isPending: writeIsPending,
    writeContract,
  } = useWriteContract();

  const handleBuyTicket = () => {
    if (ticketPriceWei == null) return;
    writeContract({
      ...TicketSalesContract,
      functionName: "buyTicket",
      args: [],
      value: ticketPriceWei,
    });
  };

  const {
    isLoading: writeIsConfirming,
    isSuccess,
    error: receiptError,
  } = useWaitForTransactionReceipt({
    hash,
  });

 
  React.useEffect(() => {
    if (isSuccess) {
      refetch();
      // 并调用getUserInfo接口更新用户信息
      getUserInfo();
    }
  }, [isSuccess, refetch]);

  React.useEffect(() => {
    if (writeError) {
      toast.error(getErrorMessage(writeError, opFailed));
      return;
    }
    if (receiptError) {
      toast.error(getErrorMessage(receiptError, opFailed));
    }
  }, [receiptError, writeError, opFailed]);

  const isButtonDisabled =
    !walletAddress ||
    readIsPending ||
    ticketPriceReadPending ||
    ticketPriceWei == null ||
    writeIsPending ||
    writeIsConfirming ||
    hasPurchased;

  // 获取平台配置
  const { data: platformConfig } = useQuery({
    queryKey: ["platformConfig"],
    queryFn: () => getPlatformConfig("base"),
  });
  const bnbAmount =
    ticketPriceWei != null ? formatEther(ticketPriceWei) : "—";
  const usdtAmount =
    platformConfig?.usdtAmount != null
      ? String(platformConfig.usdtAmount)
      : "—";

  return (
    <section className="relative h-[180px] w-full overflow-hidden rounded-[12px] border border-white bg-linear-to-b from-white/45 to-white/90 p-3 shadow-[0_5px_10px_rgba(51,51,51,0.08)] backdrop-blur-[7px]">
      <div className="relative z-10 flex w-full min-w-0 flex-col gap-[10px]">
        <div className="relative flex w-full min-w-0 flex-col gap-[5px]">
          <div className="flex h-[27px] w-[129px] items-center gap-[3px] overflow-hidden">
            <AppImage
              src={entrustAssets.ticketIcon}
              alt=""
              width={22}
              height={22}
              className="size-[22px] shrink-0 object-cover"
            />
            <span className="text-base font-semibold leading-[22px] text-black">
              {t("entrust.buyTicket")}
            </span>
            <div className="relative h-5 w-[21px] shrink-0 overflow-hidden">
              <AppImage
                src={entrustAssets.hot}
                alt=""
                width={21}
                height={20}
                className="absolute left-0 top-[-2.9%] h-[105.8%] w-full max-w-none"
              />
            </div>
          </div>

          <button
            type="button"
            className="absolute right-0 top-1 flex w-[74px] items-center justify-end"
          >
            {/* <span className="text-xs leading-[19px] text-[#ffe6d9]">
              规则说明
            </span> */}
            <AppImage
              src={entrustAssets.rulesArrow}
              alt=""
              width={16}
              height={16}
              className="shrink-0"
            />
          </button>

          <div className="flex flex-col gap-[3px]">
            <p className="text-black">
              <span className="font-[family-name:var(--font-mulish)] text-[38px] font-bold leading-[19px]">
                {ticketPriceWei != null
                  ? formatEther(ticketPriceWei) + " "
                  : "—"}
              </span>
              <span className="text-sm leading-[19px]">BNB</span>
            </p>
            <p className="text-sm leading-[19px] text-black">
              {t("entrust.ticketAirdropDesc", { bnbAmount, usdtAmount })}
            </p>
          </div>
        </div>

        <ImageButton
          variant="whitelist"
          className="mt-2"
          onClick={handleBuyTicket}
          disabled={isButtonDisabled}
        >
          {readEnabled
            ? t("entrust.buyWhitelist")
            : t("common.connectFirstBtn")}
        </ImageButton>
      </div>

      <div className="pointer-events-none absolute -right-16 top-0 size-[219px] opacity-60">
        <AppImage
          src={entrustAssets.ticketDeco}
          alt=""
          width={219}
          height={219}
          className="size-full object-cover"
        />
      </div>
    </section>
  );
}
