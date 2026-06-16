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
  directValidUserCount?: number;
  personalStake?: number;
  teamIncome?: number;
  referralIncome?: number;
};

/** 顶部三列统计 + 团队/推荐奖励 — Figma 811:645 */
export function TeamTopStatsCard({
  isPending,
  smallAreaStake,
  directValidUserCount,
  personalStake,
  teamIncome,
  referralIncome,
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
      value: displayTeamValue(
        isPending,
        formatCount(directValidUserCount),
        loadingLabel,
      ),
      unit: t("team.peopleCount"),
    },
    {
      icon: teamAssets.statIconPersonal,
      label: t("team.personalEntrustCountCard"),
      value: displayTeamValue(isPending, formatAmount(personalStake), loadingLabel),
      unit: "USDT",
    },
  ];

  return (
    <section className="relative w-full shrink-0 overflow-hidden rounded-[12px] border border-white shadow-[0_5px_10px_rgba(51,51,51,0.08)]">
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[12px]">
        <AppImage
          src={teamAssets.statsPanelBg}
          alt=""
          width={371}
          height={228}
          className="absolute max-w-none"
          style={{
            height: "114.93%",
            width: "105.7%",
            left: "-2.85%",
            top: "-3.73%",
          }}
        />
      </div>

      <div className="relative flex flex-col gap-3 px-3 py-4">
        <div className="flex items-center justify-between">
          {topStats.map((stat, index) => (
            <Fragment key={stat.label}>
              {index > 0 ? <StatDivider /> : null}
              <StatColumn {...stat} loadingLabel={loadingLabel} />
            </Fragment>
          ))}
        </div>

        <div className="flex gap-3">
          <RewardCard
            label={t("team.teamIncome")}
            value={displayTeamValue(
              isPending,
              formatAmount(teamIncome),
              loadingLabel,
            )}
            iconSrc={teamAssets.rewardTeamIcon}
            loadingLabel={loadingLabel}
          />
          <RewardCard
            label={t("team.referralIncome")}
            value={displayTeamValue(
              isPending,
              formatAmount(referralIncome),
              loadingLabel,
            )}
            iconSrc={teamAssets.rewardReferralIcon}
            loadingLabel={loadingLabel}
          />
        </div>
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
          className={`w-full font-mulish text-base font-medium leading-tight tracking-[-0.32px] sm:text-lg sm:leading-6 ${
            value === loadingLabel ? "text-[#8b8b8b]" : "text-[#d50000]"
          }`}
        >
          {value}
        </p>
        <p className="w-full text-sm font-medium leading-normal tracking-[0.24px] text-[#292929]">
          {label}
        </p>
        <p className="w-full text-sm leading-normal tracking-[0.24px] text-[rgba(0,0,0,0.6)]">
          {unit}
        </p>
      </div>
    </div>
  );
}

function RewardCard({
  label,
  value,
  iconSrc,
  loadingLabel,
}: {
  label: string;
  value: string;
  iconSrc: string;
  loadingLabel: string;
}) {
  return (
    <div className="relative flex min-w-0 flex-1 items-center overflow-hidden rounded-[8px] border border-white bg-white/80 shadow-[0_5px_10px_rgba(51,51,51,0.08)] backdrop-blur-[7px]">
      <div className="flex min-w-0 flex-1 flex-col gap-0.5 py-3.5 pl-2 pr-[52px]">
        <p className="text-xs font-semibold leading-normal text-[rgba(51,51,51,0.8)]">{label}</p>
        <p className="whitespace-nowrap text-[0px] text-[#333]">
          <span
            className={`font-mulish text-base font-semibold leading-normal ${
              value === loadingLabel ? "text-[#8b8b8b]" : "text-[#333]"
            }`}
          >
            {value}{" "}
          </span>
          <span className="font-mulish text-[10px] leading-normal text-[#333]">
            USDT
          </span>
        </p>
      </div>

      <div className="pointer-events-none absolute right-[6px] top-1/2 size-11 -translate-y-1/2">
        <AppImage
          src={teamAssets.subCardIconGlow}
          alt=""
          width={44}
          height={44}
          className="absolute inset-0 size-full max-w-none"
        />
        <AppImage
          src={iconSrc}
          alt=""
          width={34}
          height={34}
          className="absolute left-1/2 top-1/2 size-[34px] -translate-x-1/2 -translate-y-1/2 max-w-none object-contain"
        />
      </div>
    </div>
  );
}
