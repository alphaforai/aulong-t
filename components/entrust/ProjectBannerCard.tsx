"use client";

import { AppImage } from "@/components/AppImage";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { entrustAssets } from "./assets";

type ProjectBannerCardProps = {
  onClick?: () => void;
};

/** 项目资料 Banner — Figma 委托页 */
export function ProjectBannerCard({ onClick }: ProjectBannerCardProps) {
  const { t } = useTranslation();

  return (
    <button
      type="button"
      onClick={onClick}
      className="relative z-10 isolate flex h-[88px] w-full max-w-full shrink-0 items-center justify-center overflow-hidden rounded-[12px] border border-white bg-white shadow-[0_5px_10px_rgba(51,51,51,0.08)]"
    >
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-[12px] bg-white">
        <AppImage
          src={entrustAssets.projectBanner}
          alt=""
          width={371}
          height={108}
          className="absolute max-w-none"
          style={{
            width: "105.7%",
            height: "122.7%",
            left: "-2.85%",
            top: "-5.68%",
          }}
        />
      </div>

      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 z-10 h-[79px] w-[169px] -translate-x-1/2 -translate-y-1/2 scale-150 bg-[radial-gradient(ellipse_90%_100%_at_50%_50%,rgba(255,190,190,0.55)_0%,rgba(255,220,220,0.2)_42%,transparent_72%)]"
      />

      <div className="relative z-20 flex w-full items-center justify-center px-14">
        <div className="ml-10 inline-flex max-w-[58%] flex-col items-start">
          <div className="-skew-x-10 flex scale-y-[0.98] items-center gap-0 font-noto-sc-black text-[32px] font-black italic leading-none tracking-[-0.02em] text-black">
            <span>{t("entrust.projectPart1")}</span>
            <span className="text-[#ec0000]">{t("entrust.projectPart2")}</span>
          </div>
          <p className="mt-1 line-clamp-3 text-left text-[12px] leading-snug text-[#242424] sm:text-xs sm:leading-normal">
            {t("entrust.projectBannerDescCard")}
          </p>
        </div>
      </div>
    </button>
  );
}
