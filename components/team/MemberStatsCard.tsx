"use client";

import React from "react";
import { AppImage } from "@/components/AppImage";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { teamAssets } from "./assets";
import { DirectPanel } from "./Direct";
import { TeamSectionTitle } from "./TeamSectionTitle";
import { displayTeamValue, formatCount } from "./format";

type MemberStat = {
  icon: string;
  label: string;
  value: string;
  iconCrop?: string;
};

export type MemberStatsCardProps = {
  isPending?: boolean;
  teamTotalCount?: number;
  teamWhitelistCount?: number;
  teamStakerCount?: number;
  teamTodayWhitelistCount?: number;
};

/** 人数统计 — Figma 535:6392 */
export function MemberStatsCard({
  isPending,
  teamTotalCount,
  teamWhitelistCount,
  teamStakerCount,
  teamTodayWhitelistCount,
}: MemberStatsCardProps) {
  const { t } = useTranslation();
  const [showDirectPanel, setShowDirectPanel] = React.useState(false);
  const loadingLabel = t("common.loadingDots");
  const peopleUnit = t("common.peopleUnit");

  const memberStats: MemberStat[] = [
    {
      icon: teamAssets.memberIconRegister,
      label: t("team.teamTotalRegister"),
      value: displayTeamValue(
        isPending,
        formatCount(teamTotalCount),
        loadingLabel,
      ),
      iconCrop: "left-[-24.07%] top-[-24.07%] size-[148.15%]",
    },
    {
      icon: teamAssets.memberIconWhitelist,
      label: t("team.teamTotalWhitelist"),
      value: displayTeamValue(
        isPending,
        formatCount(teamWhitelistCount),
        loadingLabel,
      ),
      iconCrop: "left-[-36%] top-[-37.35%] size-[172.01%]",
    },
    {
      icon: teamAssets.memberIconEntrust,
      label: t("team.teamTotalStakers"),
      value: displayTeamValue(
        isPending,
        formatCount(teamStakerCount),
        loadingLabel,
      ),
      iconCrop: "left-[-24.07%] top-[-24.07%] size-[148.15%]",
    },
    {
      icon: teamAssets.memberIconNewWhitelist,
      label: t("team.todayNewWhitelist"),
      value: displayTeamValue(
        isPending,
        formatCount(teamTodayWhitelistCount),
        loadingLabel,
      ),
      iconCrop: "left-[-24.07%] top-[-24.07%] size-[148.15%]",
    },
  ];

  return (
    <>
      <section className="flex w-full min-w-0 flex-col overflow-hidden rounded-[12px] border border-white bg-white/61 p-2.5 shadow-[0_5px_10px_rgba(51,51,51,0.08)] backdrop-blur-[7px]">
        <TeamSectionTitle
          title={t("team.memberStats")}
          action={
            <button
              type="button"
              onClick={() => setShowDirectPanel(true)}
              className="flex shrink-0 items-center gap-0.5 text-sm leading-normal text-[rgba(0,0,0,0.7)]"
            >
              {t("team.directDetail")}
              <AppImage
                src={teamAssets.detailArrow}
                alt=""
                width={14}
                height={14}
                className="size-3.5 shrink-0 -scale-y-100 rotate-90"
              />
            </button>
          }
        />

        <div className="mt-2 grid grid-cols-2 gap-x-2 gap-y-2">
          {memberStats.map((stat) => (
            <MemberStatTile
              key={stat.label}
              isPending={isPending}
              loadingLabel={loadingLabel}
              peopleUnit={peopleUnit}
              {...stat}
            />
          ))}
        </div>
      </section>

      <DirectPanel
        open={showDirectPanel}
        onClose={() => setShowDirectPanel(false)}
      />
    </>
  );
}

function MemberStatTile({
  icon,
  label,
  value,
  iconCrop,
  isPending,
  loadingLabel,
  peopleUnit,
}: MemberStat & {
  isPending?: boolean;
  loadingLabel: string;
  peopleUnit: string;
}) {
  const crop =
    iconCrop ?? "left-[-24.07%] top-[-24.07%] size-[148.15%]";

  return (
    <div className="relative h-[70px] overflow-hidden rounded-[12px] border border-white bg-white shadow-[0_5px_10px_rgba(51,51,51,0.08)] backdrop-blur-[7px]">
      <div className="absolute left-2.5 top-4 flex flex-col gap-0.5">
        <p className="line-clamp-2 text-xs leading-snug text-[rgba(51,51,51,0.8)]">
          {label}
        </p>
        <p
          className={`font-[family-name:var(--font-mulish)] text-lg font-medium leading-normal ${
            isPending || value === loadingLabel
              ? "text-[#8b8b8b]"
              : "text-[#333]"
          }`}
        >
          {value}
          {!isPending && value !== loadingLabel ? (
            <span className="text-xs font-normal"> {peopleUnit}</span>
          ) : null}
        </p>
      </div>
      <div className="absolute right-0 top-[13px] size-11 overflow-hidden">
        <AppImage
          src={teamAssets.memberIconGlow}
          alt=""
          width={44}
          height={44}
          className="absolute inset-[2.27%_0_0_2.27%] size-full max-w-none"
        />
        <div className="absolute inset-[9%] overflow-hidden">
          <AppImage
            src={icon}
            alt=""
            width={38}
            height={38}
            className={`absolute max-w-none ${crop}`}
          />
        </div>
      </div>
    </div>
  );
}
