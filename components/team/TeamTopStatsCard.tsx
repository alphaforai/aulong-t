import { Fragment } from "react";
import { AppImage } from "@/components/AppImage";
import { teamAssets } from "./assets";
import {
  displayTeamValue,
  formatAmount,
  formatCount,
  TEAM_LOADING_LABEL,
} from "./format";

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
  const topStats: TopStat[] = [
    {
      icon: teamAssets.statIconCommunity,
      label: "小区业绩",
      value: displayTeamValue(isPending, formatAmount(smallAreaStake)),
      unit: "USDT",
    },
    {
      icon: teamAssets.statIconReferral,
      label: "直推委托",
      value: displayTeamValue(isPending, formatCount(0)),
      unit: "人数",
    },
    {
      icon: teamAssets.statIconPersonal,
      label: "个人委托数量",
      value: displayTeamValue(isPending, formatAmount(0)),
      unit: "USDT",
    },
  ];

  return (
    <section className="relative h-[134px] w-full shrink-0 overflow-hidden rounded-[12px] border border-white bg-white shadow-[0_5px_10px_rgba(51,51,51,0.08)]">
      <div className="relative flex h-full items-center justify-between px-3">
        {topStats.map((stat, index) => (
          <Fragment key={stat.label}>
            {index > 0 ? <StatDivider /> : null}
            <StatColumn {...stat} />
          </Fragment>
        ))}
      </div>
    </section>
  );
}

function StatDivider() {
  return (
    <div className="relative h-[73px] w-px shrink-0 self-center" aria-hidden>
      <AppImage
        src={teamAssets.statDivider}
        alt=""
        width={1}
        height={73}
        className="size-full"
      />
    </div>
  );
}

function StatColumn({ icon, label, value, unit }: TopStat) {
  return (
    <div className="flex w-[90px] shrink-0 flex-col items-center gap-[9px]">
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

      <div className="flex w-full flex-col items-center gap-[3px] text-center">
        <p
          className={`w-full font-[family-name:var(--font-mulish)] text-lg font-medium leading-6 tracking-[-0.32px] ${
            value === TEAM_LOADING_LABEL ? "text-[#8b8b8b]" : "text-[#d50000]"
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
