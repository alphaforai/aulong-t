"use client";

import { AppImage } from "@/components/AppImage";
import type { WorldCupHoldingItem } from "@/lib/worldCup/types";
import { resolveOrderOutcomeLabel } from "@/lib/worldCup/resolveOrderOutcomeLabel";

const EVENT_STATUS_KEYS = {
  ongoing: "worldCup.statusOngoing",
  ended: "worldCup.statusEnded",
  upcoming: "worldCup.statusUpcoming",
} as const;

type WorldCupHoldingCardProps = {
  item: WorldCupHoldingItem;
  t: (key: string, params?: Record<string, string | number>) => string;
};

function formatAmount(value: number) {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

/** 持仓中列表卡片 — 纯文字紧凑布局（Figma 预测市场-进行中） */
export function WorldCupHoldingCard({ item, t }: WorldCupHoldingCardProps) {
  const outcomeLabel = resolveOrderOutcomeLabel(item, t);
  const stakeText = `${formatAmount(item.stakeAmount)} ${item.stakeCurrency}`;
  const profitText = `${formatAmount(item.estimatedProfit)}${item.profitCurrency}`;

  return (
    <article className="rounded-[12px] border border-[#f0f1f3] bg-white p-[14px] shadow-[0_10px_14px_rgba(17,24,39,0.08)]">
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
          <h3 className="min-w-0 line-clamp-2 text-sm font-extrabold leading-snug text-[#1a1a1a]">
            {item.title}
          </h3>
        </div>
        <span className="ml-2 shrink-0 rounded-[12px] bg-[#fff1f2] px-2 py-0.5 text-xs font-extrabold text-[#f0181e]">
          {t(EVENT_STATUS_KEYS[item.eventStatus])}
        </span>
      </div>

      <div className="mt-3.5 flex items-center justify-between">
        <div className="flex min-w-0 flex-col justify-between space-y-3">
          <p className="truncate text-base font-semibold text-[#1a1a1a]">
            {outcomeLabel}
          </p>
          <p className="truncate text-sm text-[#1a1a1a]">
            {t("worldCup.matchVs", {
              home: item.homeTeam,
              away: item.awayTeam,
            })}
          </p>
        </div>

        <div className="ml-3 flex shrink-0 flex-col items-end space-y-1.5 text-right text-sm text-[#707070]">
          <p>
            <span>{t("worldCup.stakeAmount")}</span>
            <span className="font-semibold text-[#1a1a1a]">{stakeText}</span>
          </p>
          <p>
            <span>{t("worldCup.estimatedProfit")}</span>
            <span className="font-semibold text-[#1a1a1a]">{profitText}</span>
          </p>
        </div>
      </div>
    </article>
  );
}
