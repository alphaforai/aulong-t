"use client";

import React from "react";
import { entrustAssets } from "./assets";
import { AppImage } from "@/components/AppImage";
import { ImageButton } from "./ImageButton";
import { useWhitelistPurchase } from "@/lib/hooks/useWhitelistPurchase";
import { useUserInfoStore } from "@/lib/store";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { formatEther } from "viem";
import { getPlatformConfig } from "@/lib/api/platformConfig";
import { useQuery } from "@tanstack/react-query";

/** 首页白名单购买卡片（可选展示）；全站强制支付逻辑见 WhitelistGate */
export function TicketCard() {
  const { t } = useTranslation();
  const walletAddress = useUserInfoStore(
    (state) => state.userInfo.walletAddress,
  );

  const {
    hasPurchased,
    ticketPriceWei,
    buyWhitelist,
    isPaying,
    isLoading,
    canBuy,
  } = useWhitelistPurchase(walletAddress);

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

  const readEnabled = Boolean(walletAddress);
  const isButtonDisabled = !canBuy || hasPurchased;

  if (hasPurchased) return null;

  return (
    <section className="relative h-[180px] w-full overflow-hidden rounded-[12px] border border-white bg-gradient-to-b from-white/45 to-white/90 p-3 shadow-[0_5px_10px_rgba(51,51,51,0.08)] backdrop-blur-[7px]">
      <div className="relative z-10 flex w-full min-w-0 flex-col gap-[10px]">
        <div className="relative flex w-full min-w-0 flex-col gap-[5px]">
          <div className="flex h-[27px] items-center gap-[3px] overflow-hidden">
            <AppImage
              src={entrustAssets.ticketIcon}
              alt=""
              width={22}
              height={22}
              className="size-[22px] shrink-0 object-cover"
            />
            <span className="text-base font-semibold leading-[22px] text-black">
              {t("entrust.buyWhitelist")}
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
              <span className="font-mulish text-[38px] font-bold leading-[19px]">
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
          onClick={() => void buyWhitelist()}
          disabled={isButtonDisabled}
        >
          {isPaying
            ? t("entrust.whitelistPaying")
            : isLoading
              ? t("common.loading")
              : readEnabled
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
