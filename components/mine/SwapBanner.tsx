"use client";

import React from "react";
import { AppImage } from "@/components/AppImage";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { mineAssets } from "./assets";
import { QuickSwap } from "./QuickSwap";

/** 闪兑 Banner — Figma 969:482 / 506:318；背景裁切对齐 InviteBanner */
export function SwapBanner() {
  const { t } = useTranslation();
  const [showQuickSwap, setShowQuickSwap] = React.useState(false);

  return (
    <>
      <button
        type="button"
        aria-label={t("mine.swapOpen")}
        onClick={() => setShowQuickSwap(true)}
        className="relative flex h-[87px] w-full shrink-0 items-center justify-center overflow-hidden rounded-[12px] border border-white text-center shadow-[0_5px_10px_rgba(51,51,51,0.08)] transition-opacity active:opacity-90"
      >
        <div className="absolute inset-0 overflow-hidden rounded-[12px] backdrop-blur-[7px]">
          <AppImage
            src={mineAssets.swapBannerBg}
            alt=""
            width={351}
            height={87}
            className="absolute max-w-none"
            style={{
              height: "152%",
              width: "114.57%",
              left: "-7.41%",
              top: "-25%",
            }}
          />
        </div>

        <div className="relative z-10 flex max-w-[58%] flex-col items-center px-2 text-center">
          <h2 className="-skew-x-[10deg] scale-y-[0.98] font-noto-sc-black text-[28px] font-black leading-normal text-black">
            {t("mine.swapTitle")}
          </h2>
          <p className="mt-1 ml-12 w-full truncate text-[10px] leading-normal tracking-[0.5px] text-[#8b8b8b]">
            {t("mine.swapSubtitle")}
          </p>
        </div>
      </button>

      <QuickSwap
        open={showQuickSwap}
        onClose={() => setShowQuickSwap(false)}
      />
    </>
  );
}
