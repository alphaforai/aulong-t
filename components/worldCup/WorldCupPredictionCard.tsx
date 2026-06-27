"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { AppImage } from "@/components/AppImage";
import type {
  WorldCupOutcomeSide,
  WorldCupPredictionItem,
} from "@/lib/worldCup/types";
import { hasOutcomeOptions, canParticipateInEvent } from "@/lib/worldCup/types";

const GRADIENT_BTN =
  "relative overflow-hidden rounded-[33px] border border-white shadow-[0_4px_6px_rgba(213,0,0,0.12)]";
const GRADIENT_FILL =
  "pointer-events-none absolute top-0 right-0 bottom-0 left-0 rounded-[33px] bg-gradient-to-r from-[#ff4d00] via-[#ff3033] to-[#e90000]";
const GRADIENT_FILL_DISABLED =
  "pointer-events-none absolute top-0 right-0 bottom-0 left-0 rounded-[33px] bg-[rgba(199,199,199,0.69)]";
const GRADIENT_INSET =
  "pointer-events-none absolute top-0 right-0 bottom-0 left-0 rounded-[inherit] shadow-[inset_0px_-4px_4px_0px_rgba(255,254,227,0.7),inset_0px_8px_17px_0px_#ffe5e5]";

const STATUS_LABEL_KEYS = {
  ongoing: "worldCup.statusOngoing",
  ended: "worldCup.statusEnded",
} as const;

function formatMatchTime(value: string) {
  const normalized = value.includes("T") ? value : value.replace(" ", "T");
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) return "--";
  return format(date, "MM-dd HH:mm");
}

function formatScore(item: WorldCupPredictionItem) {
  if (item.homeScore == null || item.awayScore == null) return "VS";
  return `${item.homeScore}:${item.awayScore}`;
}

type WorldCupPredictionCardProps = {
  item: WorldCupPredictionItem;
  t: (key: string, params?: Record<string, string | number>) => string;
  onParticipate?: (
    item: WorldCupPredictionItem,
    selectedOutcome?: WorldCupOutcomeSide,
  ) => void;
};

function OutcomeCell({
  label,
  percent,
  selected,
  onSelect,
}: {
  label: string;
  percent: number;
  selected?: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={`flex min-h-[68px] flex-1 flex-col items-center justify-center rounded-[14px] border px-1.5 py-2 touch-manipulation ${
        selected
          ? "border-[#f0181e] bg-[#fff1f2]"
          : "border-[#f0f1f3] bg-[#f8f8f8]"
      }`}
    >
      <p className="text-center text-xs font-bold text-[#333]">{label}</p>
      <p className="mt-0.5 text-center text-lg font-bold text-[#1a1a1a]">
        {percent.toFixed(1)}%
      </p>
    </button>
  );
}

/** 「全部」Tab 赛事卡片 — Polymarket 赛事列表 */
export function WorldCupPredictionCard({
  item,
  t,
  onParticipate,
}: WorldCupPredictionCardProps) {
  const showOutcomes = hasOutcomeOptions(item);
  const [selectedOutcome, setSelectedOutcome] = useState<
    WorldCupOutcomeSide | undefined
  >(item.selectedOutcome);

  useEffect(() => {
    setSelectedOutcome(item.selectedOutcome);
  }, [item.id, item.selectedOutcome]);

  const outcomeLabels: Record<WorldCupOutcomeSide, string> = {
    home: t("worldCup.outcomeHomeWin", { team: item.homeTeam }),
    draw: t("worldCup.outcomeDraw"),
    away: t("worldCup.outcomeHomeWin", { team: item.awayTeam }),
  };

  const canParticipate = canParticipateInEvent(item);
  const isOngoing = item.enabled;

  return (
    <article className="rounded-[12px] border border-[#f0f1f3] bg-white p-[15px] shadow-[0_10px_14px_rgba(17,24,39,0.08)]">
      <div className="flex items-start justify-between">
        <div className="flex min-w-0 flex-1 items-center space-x-2">
          {item.icon ? (
            <AppImage
              src={item.icon}
              alt=""
              width={32}
              height={32}
              className="size-8 shrink-0 rounded object-cover"
            />
          ) : null}
          <h3 className="line-clamp-2 text-sm font-extrabold leading-snug text-[#1a1a1a]">
            {item.title}
          </h3>
        </div>
        <span
          className={`ml-2 shrink-0 rounded-[12px] px-2 py-0.5 text-xs font-extrabold ${
            isOngoing
              ? "bg-[#fff1f2] text-[#f0181e]"
              : "bg-[#f4f4f4] text-[#707070]"
          }`}
        >
          {t(STATUS_LABEL_KEYS[isOngoing ? "ongoing" : "ended"])}
        </span>
      </div>

      <div className="relative mt-3 h-[59px]">
        <div className="absolute top-[3px] left-0 flex w-[33%] flex-col items-center">
          <p className="w-full truncate text-center text-sm font-extrabold text-[#333]">
            {item.homeTeam}
          </p>
        </div>

        <div className="absolute top-0 left-1/2 flex min-w-[88px] -translate-x-1/2 flex-col items-center">
          <p className="text-[28px] font-black leading-none text-[#f0181e]">
            {formatScore(item)}
          </p>
          <p className="mt-0.5 whitespace-nowrap text-xs leading-none text-[#949494]">
            {formatMatchTime(item.endDate)}
          </p>
        </div>

        <div className="absolute top-[3px] right-0 flex w-[33%] flex-col items-center">
          <p className="w-full truncate text-center text-sm font-extrabold text-[#333]">
            {item.awayTeam}
          </p>
        </div>
      </div>

      {showOutcomes ? (
        <div
          className="mt-3.5 flex space-x-2"
          role="radiogroup"
          aria-label={t("worldCup.outcomeGroupAria")}
        >
          {(["home", "draw", "away"] as const).map((side) => (
            <OutcomeCell
              key={side}
              label={outcomeLabels[side]}
              percent={item.outcomes[side]}
              selected={selectedOutcome === side}
              onSelect={() => setSelectedOutcome(side)}
            />
          ))}
        </div>
      ) : null}

      <div className="mt-3 flex justify-center">
        <button
          type="button"
          disabled={!canParticipate}
          onClick={() => onParticipate?.(item, selectedOutcome)}
          className={`${GRADIENT_BTN} flex h-11 w-[235px] items-center justify-center text-base font-semibold text-white [text-shadow:0_1px_3px_rgba(94,44,44,0.25)] disabled:cursor-not-allowed`}
        >
          <span
            className={canParticipate ? GRADIENT_FILL : GRADIENT_FILL_DISABLED}
            aria-hidden
          />
          <span className={GRADIENT_INSET} aria-hidden />
          <span className="relative">{t("worldCup.participate")}</span>
        </button>
      </div>
    </article>
  );
}
