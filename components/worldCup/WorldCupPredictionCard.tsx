"use client";

import { AppImage } from "@/components/AppImage";
import { teamAssets } from "@/components/team/assets";
import type {
  WorldCupOutcomeSide,
  WorldCupPredictionItem,
} from "@/lib/worldCup/types";
import { formatUtcMatchTime } from "@/lib/worldCup/utcDate";
import { canParticipateInEvent } from "@/lib/worldCup/types";

type WorldCupPredictionCardProps = {
  item: WorldCupPredictionItem;
  t: (key: string, params?: Record<string, string | number>) => string;
  onParticipate?: (
    item: WorldCupPredictionItem,
    selectedOutcome?: WorldCupOutcomeSide,
  ) => void;
  showDivider?: boolean;
};

/** 「全部」Tab 赛事列表行 */
export function WorldCupPredictionCard({
  item,
  t,
  onParticipate,
  showDivider = false,
}: WorldCupPredictionCardProps) {
  const canParticipate = canParticipateInEvent(item);
  const matchTimeText = formatUtcMatchTime(item.endDate);

  const handleActivate = () => {
    if (!canParticipate) return;
    onParticipate?.(item);
  };

  return (
    <div
      role={canParticipate ? "button" : undefined}
      tabIndex={canParticipate ? 0 : undefined}
      onClick={handleActivate}
      onKeyDown={(event) => {
        if (!canParticipate) return;
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          handleActivate();
        }
      }}
      className={`px-3.5 py-3.5 ${
        showDivider ? "border-b border-[#f0f1f3]" : ""
      } ${
        canParticipate
          ? "cursor-pointer touch-manipulation active:bg-[#fafafa]"
          : ""
      }`}
    >
      <div className="flex items-center gap-3">
        {item.icon ? (
          <AppImage
            src={item.icon}
            alt=""
            width={36}
            height={36}
            className="size-9 shrink-0 rounded object-cover"
          />
        ) : (
          <span className="size-9 shrink-0 rounded bg-[#f4f4f4]" aria-hidden />
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-2">
            <h3 className="min-w-0 flex-1 line-clamp-2 text-sm font-bold leading-snug text-[#1a1a1a]">
              {item.title}
            </h3>
            {!canParticipate ? (
              <span className="shrink-0 text-[11px] font-medium text-[#999]">
                {t("worldCup.statusEnded")}
              </span>
            ) : null}
          </div>
          <p className="mt-0.5 text-xs text-[#949494]">{matchTimeText}</p>
        </div>

        {canParticipate ? (
          <AppImage
            src={teamAssets.detailArrow}
            alt=""
            width={14}
            height={14}
            className="size-3.5 shrink-0 -scale-y-100 rotate-90 opacity-40"
          />
        ) : null}
      </div>
    </div>
  );
}
