"use client";

import { AppImage } from "@/components/AppImage";
import { worldCupAssets } from "./assets";

type WorldCupEmptyStateProps = {
  t: (key: string) => string;
};

/** 预测市场空状态 — Figma 三 Tab 通用（Android 9：flex + space-y） */
export function WorldCupEmptyState({ t }: WorldCupEmptyStateProps) {
  return (
    <div className="flex w-full flex-col items-center px-[26px] py-6">
      <div className="flex h-[160px] w-[160px] items-center justify-center">
        <AppImage
          src={worldCupAssets.emptyOrders}
          alt=""
          width={160}
          height={160}
          className="size-[160px] max-w-full object-contain"
        />
      </div>
      <h2 className="mt-0 text-center text-2xl font-bold leading-normal text-[#1a1a1a]">
        {t("worldCup.emptyTitle")}
      </h2>
      <p className="mt-2 text-center text-sm leading-[23.8px] text-[#5c5c5c]">
        {t("worldCup.emptyDesc")}
      </p>
    </div>
  );
}
