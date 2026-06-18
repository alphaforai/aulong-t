"use client";

import type { ReactNode } from "react";
import { useEffect, useRef } from "react";
import { useConnection } from "wagmi";
import { formatEther } from "viem";
import { entrustAssets } from "@/components/entrust/assets";
import { AppImage } from "@/components/AppImage";
import { ImageButton } from "@/components/entrust/ImageButton";
import { useWhitelistPurchase } from "@/lib/hooks/useWhitelistPurchase";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { getPlatformConfig } from "@/lib/api/platformConfig";
import { useAuthStore, useUserInfoStore } from "@/lib/store";
import { shellMaxWidth, shellMdPaddingY } from "@/lib/mobileShell";
import {
  fixedFullscreen,
  modalBackdrop,
  rowX1,
  stackY2,
  stackY1_5,
  whitelistModalCard,
} from "@/lib/mobileCompat";
import { useQuery } from "@tanstack/react-query";

type WhitelistGateProps = {
  children: ReactNode;
};

/**
 * 全站白名单准入：已登录且已绑邀请码、但未链上购白名单时，遮挡主内容与底栏并自动唤起钱包支付。
 * 样式遵循 lib/mobileCompat（Android 9 / Chrome 69–74：无 gap、无 backdrop-blur、无 inset 简写）。
 */
export function WhitelistGate({ children }: WhitelistGateProps) {
  const { t } = useTranslation();
  const { isConnected } = useConnection();
  const accessToken = useAuthStore((state) => state.accessToken);
  const needsInviteRegister = useAuthStore(
    (state) => state.needsInviteRegister,
  );
  /** Header 绑码成功后会递增，用于立即触发一次自动支付 */
  const whitelistPurchaseTrigger = useAuthStore(
    (state) => state.whitelistPurchaseTrigger,
  );

  const walletAddress = useUserInfoStore(
    (state) => state.userInfo.walletAddress,
  );
  /** 登录接口返回的 hasTicket，用于链上 reads 完成前避免已购用户闪一下拦截层 */
  const hasTicketFromBackend = useUserInfoStore(
    (state) => Number(state.userInfo.hasTicket) === 1,
  );

  const {
    hasPurchased,
    ticketPriceWei,
    buyWhitelist,
    isPaying,
    isLoading,
    canBuy,
    purchasesPending,
    purchaseSyncing,
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

  // 已拿到 token 且无需再绑邀请码时，才进入白名单校验（绑码弹窗由 Header 单独处理）
  const whitelistCheckEnabled = Boolean(
    accessToken && !needsInviteRegister && isConnected,
  );

  // 仅在链上明确未购买时拦截；pending 期间若后端已标记有票则不闪；支付同步中也不闪
  const gateActive =
    whitelistCheckEnabled &&
    !hasPurchased &&
    !purchaseSyncing &&
    (!purchasesPending || !hasTicketFromBackend);

  const autoBuyAttemptedRef = useRef(false);

  // 换地址或外部触发（绑码成功）后，允许再次自动唤起钱包
  useEffect(() => {
    autoBuyAttemptedRef.current = false;
  }, [walletAddress, whitelistPurchaseTrigger]);

  // 满足条件时自动发起 buyTicket，无需用户再点首页按钮
  useEffect(() => {
    if (!gateActive || hasPurchased || isLoading || !canBuy) return;
    if (autoBuyAttemptedRef.current) return;
    autoBuyAttemptedRef.current = true;
    void buyWhitelist();
  }, [
    buyWhitelist,
    canBuy,
    gateActive,
    hasPurchased,
    isLoading,
    whitelistPurchaseTrigger,
  ]);

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      {/* gate 激活时禁止点击底层主内容与底栏（底栏 fixed z-50，靠上层遮罩拦截） */}
      <div
        className={
          gateActive ? "pointer-events-none flex min-h-0 flex-1 flex-col" : "flex min-h-0 flex-1 flex-col"
        }
        aria-hidden={gateActive}
      >
        {children}
      </div>

      {gateActive && (
        <div
          className={`${fixedFullscreen} z-[60] flex items-center justify-center px-3 ${shellMdPaddingY} md:items-center`}
          role="dialog"
          aria-modal="true"
          aria-labelledby="whitelist-gate-title"
          aria-busy={isPaying || isLoading}
        >
          {/* 深色实色遮罩（Android 9 WebView 不支持 backdrop-blur） */}
          <div className={modalBackdrop} aria-hidden />

          <section className={`${whitelistModalCard} ${shellMaxWidth}`}>
            <div className={`relative z-10 w-full ${stackY2}`}>
              <div className={rowX1}>
                <AppImage
                  src={entrustAssets.ticketIcon}
                  alt=""
                  width={22}
                  height={22}
                  className="size-[22px] shrink-0 object-cover"
                />
                <h2
                  id="whitelist-gate-title"
                  className="text-base font-semibold leading-[22px] text-black"
                >
                  {t("entrust.buyWhitelist")}
                </h2>
              </div>

              <p className="text-sm leading-relaxed text-[#666]">
                {t("entrust.whitelistGateHint")}
              </p>

              <div className={stackY1_5}>
                <p className="text-black">
                  <span className="font-mulish text-[38px] font-bold leading-[19px]">
                    {ticketPriceWei != null
                      ? `${formatEther(ticketPriceWei)} `
                      : "—"}
                  </span>
                  <span className="text-sm leading-[19px]">BNB</span>
                </p>
                <p className="text-sm leading-[19px] text-black">
                  {t("entrust.ticketAirdropDesc", { bnbAmount, usdtAmount })}
                </p>
              </div>

              <ImageButton
                variant="whitelist"
                className="mt-1"
                onClick={() => void buyWhitelist()}
                disabled={!canBuy}
              >
                {isPaying
                  ? t("entrust.whitelistPaying")
                  : isLoading
                    ? t("common.loading")
                    : t("entrust.buyWhitelist")}
              </ImageButton>
            </div>

            <div className="pointer-events-none absolute -right-12 top-2 size-[180px] opacity-70">
              <AppImage
                src={entrustAssets.ticketDeco}
                alt=""
                width={180}
                height={180}
                className="size-full object-cover"
              />
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
