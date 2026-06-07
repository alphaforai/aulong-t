"use client";

import { AppImage } from "@/components/AppImage";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { teamAssets } from "./assets";
import { TeamSectionTitle } from "./TeamSectionTitle";
import { displayTeamValue, formatAmount, formatSignedAmount, formatSignedPercent } from "./format";

export type TeamPerformanceCardProps = {
  isPending?: boolean;
  smallAreaStakeYesterdayDelta?: number;
  smallAreaStakeChangeRate?: number;
  todayTotalStake?: number;
  teamTotalStake?: number;
};

/** 团队业绩数据 — Figma 535:6355 */
export function TeamPerformanceCard({
  isPending,
  smallAreaStakeYesterdayDelta,
  smallAreaStakeChangeRate,
  todayTotalStake,
  teamTotalStake,
}: TeamPerformanceCardProps) {
  const { t } = useTranslation();
  const loadingLabel = t("common.loadingDots");
  const deltaValue = displayTeamValue(
    isPending,
    formatSignedAmount(smallAreaStakeYesterdayDelta),
    loadingLabel,
  );
  const deltaPctValue = displayTeamValue(
    isPending,
    formatSignedPercent(smallAreaStakeChangeRate),
    loadingLabel,
  );

  return (
    <section className="relative w-full shrink-0 overflow-hidden rounded-[12px] border border-white shadow-[0_5px_10px_rgba(51,51,51,0.08)]">
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[12px]" aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={teamAssets.performanceCardBg}
          alt=""
          className="absolute inset-0 size-full max-w-none rounded-[12px] object-fill"
        />
        <div className="absolute inset-0 rounded-[12px] bg-[rgba(255,255,255,0.61)] backdrop-blur-[7px]" />
      </div>

      <div className="relative px-2.5 pt-2.5">
        <TeamSectionTitle title={t("team.teamPerformance")} />

        <div className="relative mt-2 min-h-[72px] pr-[86px]">
          <p className="text-sm leading-normal text-[#333]">
            {t("team.communityPerfYesterday")}
          </p>
          <div className="mt-0.5 flex flex-wrap items-end gap-1.5 whitespace-nowrap">
            <p
              className={`font-mulish text-lg font-medium leading-normal ${
                isPending ? "text-[#8b8b8b]" : "text-[#db0000]"
              }`}
            >
              {deltaValue}
              {!isPending ? (
                <span className="text-xs font-normal text-[#db0000]">
                  {" "}
                  USDT
                </span>
              ) : null}
            </p>
            <span
              className={`font-mulish text-sm leading-normal ${
                isPending ? "text-[#8b8b8b]" : "text-[#db0000]"
              }`}
            >
              {deltaPctValue}
            </span>
          </div>
          <AppImage
            src={teamAssets.performanceDeco}
            alt=""
            width={86}
            height={86}
            className="pointer-events-none absolute right-0 top-1/2 size-[86px] -translate-y-1/2 object-contain"
          />
        </div>
      </div>

      <div className="mt-1 rounded-b-[12px] bg-white/80 px-2.5 pb-2.5 pt-2 backdrop-blur-[7px]">
        <div className="flex gap-3">
          <PerformanceSubCard
            icon={teamAssets.perfIconToday}
            label={t("team.todayStakeTotal")}
            value={displayTeamValue(
              isPending,
              formatAmount(todayTotalStake),
              loadingLabel,
            )}
            unit="USDT"
            isPending={isPending}
            loadingLabel={loadingLabel}
          />
          <PerformanceSubCard
            icon={teamAssets.perfIconTeam}
            label={t("team.teamStakeTotal")}
            value={displayTeamValue(
              isPending,
              formatAmount(teamTotalStake),
              loadingLabel,
            )}
            unit="USDT"
            isPending={isPending}
            loadingLabel={loadingLabel}
          />
        </div>
      </div>
    </section>
  );
}

function PerformanceSubCard({
  icon,
  label,
  value,
  unit,
  isPending,
  loadingLabel,
}: {
  icon: string;
  label: string;
  value: string;
  unit: string;
  isPending?: boolean;
  loadingLabel: string;
}) {
  return (
    <div className="relative h-[80px] min-w-0 flex-1 overflow-hidden rounded-lg bg-white shadow-[0_5px_10px_rgba(51,51,51,0.08)] backdrop-blur-[7px]">
      <div className="absolute left-2 top-3.5 flex w-[97px] flex-col gap-0.5">
        <p className="line-clamp-2 text-xs font-bold leading-snug text-[rgba(51,51,51,0.8)]">
          {label}
        </p>
        <p
          className={`font-mulish text-lg font-medium leading-normal ${
            isPending || value === loadingLabel
              ? "text-[#8b8b8b]"
              : "text-[#333]"
          }`}
        >
          {value}
          {!isPending && value !== loadingLabel ? (
            <span className="text-xs font-normal"> {unit}</span>
          ) : null}
        </p>
      </div>
      <div className="absolute right-[6px] top-[11px] size-11 overflow-hidden">
        <AppImage
          src={teamAssets.subCardIconGlow}
          alt=""
          width={44}
          height={44}
          className="absolute inset-[11.36%_0_-9.09%_2.27%] size-full max-w-none"
        />
        <div className="absolute inset-[6.82%] overflow-hidden">
          <AppImage
            src={icon}
            alt=""
            width={40}
            height={40}
            className="absolute -left-[37.84%] -top-[37.84%] size-[175.68%] max-w-none"
          />
        </div>
      </div>
    </div>
  );
}
