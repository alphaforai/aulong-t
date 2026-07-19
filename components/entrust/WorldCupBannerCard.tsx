"use client";

import { useRouter } from "next/navigation";
import { AppImage } from "@/components/AppImage";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { getWorldCupUrl } from "@/lib/worldCupUrl";
import { entrustAssets } from "./assets";

type WorldCupBannerCardProps = {
  onClick?: () => void;
};

function isInternalWorldCupPath(url: string) {
  return url.startsWith("/") && !url.startsWith("//");
}

/** 预测市场 Banner — Figma 委托页（Android 9：无 backdrop-blur、无 inset 简写） */
export function WorldCupBannerCard({ onClick }: WorldCupBannerCardProps) {
  const router = useRouter();
  const { t } = useTranslation();

  const handleClick = () => {
    if (onClick) {
      onClick();
      return;
    }
    const url = getWorldCupUrl();
    if (!url) return;

    // 同源路径用客户端路由，避免整页刷新丢失内存中的 accessToken 并重复唤起钱包签名
    if (isInternalWorldCupPath(url)) {
      router.push(url);
      return;
    }
    window.location.assign(url);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="relative z-10 isolate flex h-[77px] w-full max-w-full shrink-0 items-center overflow-hidden rounded-[9px] border border-white bg-white shadow-[0_3px_4px_rgba(190,166,166,0.25)]"
    >
      <div className="pointer-events-none absolute top-0 right-0 bottom-0 left-0 z-0 overflow-hidden rounded-[9px] bg-white">
        <AppImage
          src={entrustAssets.worldCupBanner}
          alt=""
          width={410}
          height={137}
          className="absolute max-w-none"
          style={{
            width: "116.71%",
            height: "178.36%",
            left: "-1.54%",
            top: "-42.26%",
          }}
        />
      </div>

      <div className="relative z-20 flex w-full items-center pl-[60px] pr-[120px]">
        <div className="inline-flex max-w-full flex-col items-start">
          <div className="-skew-x-10 flex scale-y-[0.98] items-center font-noto-sc-black text-[32px] font-black italic leading-none tracking-[-0.02em]">
            <span className="text-[#1a1a1a]">{t("entrust.worldCupPart1")}</span>
            <span className="text-[#ec0000]">{t("entrust.worldCupPart2")}</span>
          </div>
          <p className="mt-0.5 line-clamp-2 text-left text-[10px] leading-normal tracking-[0.12em] text-[#1a1a1a]">
            {t("entrust.worldCupBannerDesc")}
          </p>
        </div>
      </div>
    </button>
  );
}
