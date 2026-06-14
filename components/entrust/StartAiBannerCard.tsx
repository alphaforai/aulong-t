"use client";

import { AppImage } from "@/components/AppImage";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { entrustAssets } from "./assets";

type StartAiBannerCardProps = {
  onClick?: () => void;
};

/** 启动 AI Banner — Figma 委托页 */
export function StartAiBannerCard({ onClick }: StartAiBannerCardProps) {
  const { t } = useTranslation();

  return (
    <button
      type="button"
      onClick={onClick}
      className="relative z-10 isolate flex h-[88px] w-full max-w-full shrink-0 items-center justify-center overflow-hidden rounded-[12px] border border-white bg-white shadow-[0_5px_10px_rgba(51,51,51,0.08)]"
    >
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-[12px] bg-white">
        <AppImage
          src={entrustAssets.startAiBanner}
          alt=""
          width={420}
          height={180}
          className="absolute max-w-none object-cover"
          style={{
            height: "204.01%",
            width: "119.6%",
            left: "-9.8%",
            top: "-50.59%",
          }}
        />
      </div>

      <div className="relative z-20 flex w-full items-center justify-center px-14">
        <div className="inline-flex max-w-[58%] flex-col items-start">
          <div className="-skew-x-10 flex scale-y-[0.98] items-center gap-0 font-noto-sc-black text-[32px] font-black italic leading-none tracking-[-0.02em] text-black">
            <span>{t("entrust.startAiPart1")}</span>
            <span className="text-[#ec0000]">{t("entrust.startAiPart2")}</span>
          </div>
          <p className="mt-1 line-clamp-3 text-left text-[12px] leading-snug text-[#242424] sm:text-xs sm:leading-normal">
            {t("entrust.startAiDescCard")}
          </p>
        </div>
      </div>
    </button>
  );
}
