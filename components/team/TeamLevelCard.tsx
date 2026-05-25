"use client";

import { AppImage } from "@/components/AppImage";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { teamAssets } from "./assets";
import { displayTeamValue, formatAmount } from "./format";

export type TeamLevelCardProps = {
  isPending?: boolean;
  vipLevel?: number;
  smallAreaStake?: number;
  nextVipLevel?: number;
  nextLevelSmallAreaStake?: number;
};

/** VIP 等级与升级进度 — Figma 535:6307 */
export function TeamLevelCard({
  isPending,
  vipLevel = 0,
  smallAreaStake = 0,
  nextVipLevel,
  nextLevelSmallAreaStake = 0,
}: TeamLevelCardProps) {
  const { t } = useTranslation();
  const loadingLabel = t("common.loadingDots");

  const progressMax =
    nextLevelSmallAreaStake > 0 ? nextLevelSmallAreaStake : 0;
  const progress = Math.min(smallAreaStake, progressMax || smallAreaStake);
  const progressPct = isPending
    ? 0
    : progressMax > 0
      ? Math.min(100, (progress / progressMax) * 100)
      : 0;
  const displayVip = Math.max(0, vipLevel);
  const progressText = isPending
    ? loadingLabel
    : `${formatAmount(progress, 0)}/${formatAmount(progressMax, 0)}`;

  return (
    <section className="relative -mb-1 flex w-full min-w-0 gap-3">
      <div className="relative h-[83px] w-[78px] shrink-0">
        <AppImage
          src={teamAssets.levelAvatar}
          alt=""
          width={78}
          height={83}
          className="absolute h-[107.29%] w-[114%] max-w-none -left-[7%] -top-[3.06%]"
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 flex-col">
            <p className="text-base leading-tight text-[#4b4b4b]">
              {t("team.currentLevel")}
            </p>
            <div className="relative mt-0.5 h-10 w-32">
              <AppImage
                src={teamAssets.vipBadge}
                alt={`VIP${displayVip}`}
                width={128}
                height={40}
                className="size-full object-contain object-left"
              />
            </div>
          </div>
          <div className="flex h-[58px] shrink-0 flex-col items-end justify-end">
            <p
              className={`text-sm leading-normal whitespace-nowrap ${
                isPending ? "text-[#8b8b8b]" : ""
              }`}
            >
              {isPending ? (
                progressText
              ) : (
                <>
                  <span className="text-[#424242]">
                    {formatAmount(progress, 0)}/
                  </span>
                  <span className="font-semibold text-[#fd4140]">
                    {formatAmount(progressMax, 0)}
                  </span>
                </>
              )}
            </p>
          </div>
        </div>

        <div className="mt-1 flex flex-col gap-1">
          <div className="relative h-2 w-full overflow-hidden rounded-[34px] bg-[#e5e5e5]">
            <div
              className="absolute inset-y-0 left-0 rounded-[34px] bg-linear-to-r from-[#c60303] to-[#f33]"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <p className="text-base leading-tight tracking-[0.28px] text-[#292929]">
            {t("team.smallAreaPerformance")}
          </p>
        </div>
      </div>
    </section>
  );
}
