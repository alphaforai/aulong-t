"use client";

import { Fragment } from "react";
import { AppImage } from "@/components/AppImage";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { teamAssets } from "./assets";
import { displayTeamValue, formatAmount, formatCount } from "./format";

type TopStat = {
  icon: string;
  label: string;
  value: string;
  unit: string;
};

export type TeamTopStatsCardProps = {
  isPending?: boolean;
  smallAreaStake?: number;
};

/** 顶部三列统计 — Figma 535:6506 */
export function TeamTopStatsCard({
  isPending,
  smallAreaStake,
}: TeamTopStatsCardProps) {
  const { t } = useTranslation();
  const loadingLabel = t("common.loadingDots");

  const topStats: TopStat[] = [
    {
      icon: teamAssets.statIconCommunity,
      label: t("team.smallAreaPerformanceCard"),
      value: displayTeamValue(
        isPending,
        formatAmount(smallAreaStake),
        loadingLabel,
      ),
      unit: "USDT",
    },
    {
      icon: teamAssets.statIconReferral,
      label: t("team.directReferralCard"),
      value: displayTeamValue(isPending, formatCount(0), loadingLabel),
      unit: t("team.peopleCount"),
    },
    {
      icon: teamAssets.statIconPersonal,
      label: t("team.personalEntrustCountCard"),
      value: displayTeamValue(isPending, formatAmount(0), loadingLabel),
      unit: "USDT",
    },
  ];

  return (
    <section className="relative min-h-[134px] w-full shrink-0 overflow-hidden rounded-[12px] border border-white bg-white py-2 shadow-[0_5px_10px_rgba(51,51,51,0.08)]">
      <div className="relative flex h-full items-stretch justify-between gap-1 px-2">
        {topStats.map((stat, index) => (
          <Fragment key={stat.label}>
            {index > 0 ? <StatDivider /> : null}
            <StatColumn {...stat} loadingLabel={loadingLabel} />
          </Fragment>
        ))}
      </div>
    </section>
  );
}

function StatDivider() {
  return (
    <div className="relative w-px shrink-0 self-center py-2" aria-hidden>
      <AppImage
        src={teamAssets.statDivider}
        alt=""
        width={1}
        height={73}
        className="h-[73px] w-px"
      />
    </div>
  );
}

function StatColumn({
  icon,
  label,
  value,
  unit,
  loadingLabel,
}: TopStat & { loadingLabel: string }) {
  return (
    <div className="flex min-w-0 flex-1 basis-0 flex-col items-center gap-1.5 px-0.5">
      <div className="relative size-[42px] shrink-0">
        <div className="absolute inset-[0_-9.52%_-19.05%_-9.52%]">
          <AppImage
            src={teamAssets.statIconGlow}
            alt=""
            width={50}
            height={50}
            className="size-full max-w-none"
          />
        </div>
        <div className="absolute left-[7px] top-2 size-[27px] overflow-hidden">
          <AppImage
            src={icon}
            alt=""
            width={27}
            height={27}
            className="absolute -left-[9.37%] -top-[9.37%] size-[118.75%] max-w-none"
          />
        </div>
      </div>

      <div className="flex w-full min-w-0 flex-col items-center gap-0.5 text-center">
        <p
          className={`w-full font-[family-name:var(--font-mulish)] text-base font-medium leading-tight tracking-[-0.32px] sm:text-lg sm:leading-6 ${
            value === loadingLabel ? "text-[#8b8b8b]" : "text-[#d50000]"
          }`}
        >
          {value}
        </p>
        <p className="line-clamp-2 w-full text-[10px] font-medium leading-snug tracking-[0.2px] text-[#292929] sm:text-xs sm:leading-normal">
          {label}
        </p>
        <p className="w-full text-[10px] leading-snug tracking-[0.2px] text-[rgba(0,0,0,0.6)] sm:text-xs sm:leading-normal">
          {unit}
        </p>
      </div>
    </div>
  );
}
