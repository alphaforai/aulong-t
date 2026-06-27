"use client";

import { AppImage } from "@/components/AppImage";
import type { WorldCupHistoryItem } from "@/lib/worldCup/types";
import {
  formatOrderAmount,
  formatOrderDateTime,
  formatSignedOrderAmount,
} from "@/lib/worldCup/formatOrderDisplay";
import {
  formatHistoryMatchResult,
  resolveOrderOutcomeLabel,
  resolveOrderWinLabel,
} from "@/lib/worldCup/resolveOrderOutcomeLabel";

type WorldCupHistoryCardProps = {
  item: WorldCupHistoryItem;
  t: (key: string, params?: Record<string, string | number>) => string;
};

function MetaRow({
  label,
  value,
  valueClassName = "text-[#1a1a1a]",
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <p className="whitespace-nowrap text-sm text-[#707070]">
      <span>{label}</span>
      <span className={`font-semibold ${valueClassName}`}>{value}</span>
    </p>
  );
}

function resolveProfitTone(value: number) {
  if (value > 0) return "text-[#16a855]";
  if (value < 0) return "text-[#e84040]";
  return "text-[#707070]";
}

/** 历史记录列表卡片 — 紧凑布局（Figma 预测市场-历史记录） */
export function WorldCupHistoryCard({ item, t }: WorldCupHistoryCardProps) {
  const outcomeLabel = resolveOrderOutcomeLabel(item, t);
  const stakeText = `${formatOrderAmount(item.stakeAmount)} ${item.stakeCurrency}`;
  const stakeAulText = `${formatOrderAmount(item.stakeAul)} AUL`;
  const betTimeText = formatOrderDateTime(item.betAt);
  const resultText = formatHistoryMatchResult(item, t);
  const winLossText = resolveOrderWinLabel(item.win, t);
  const settlementAulText = `${formatOrderAmount(item.settlementAul)} AUL`;
  const settlementTimeText = formatOrderDateTime(item.settledAt);
  const profitText = `${formatSignedOrderAmount(item.profitAmount)} ${item.profitCurrency}`;
  const profitTone = resolveProfitTone(item.profitAmount);

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
        <MetaRow label={t("worldCup.stakeAmount")} value={stakeText} />
      </div>

      <div className="mt-3.5 flex items-center justify-between">
        <p className="min-w-0 truncate text-base font-semibold text-[#1a1a1a]">
          {outcomeLabel}
        </p>
        <p className="ml-3 shrink-0 text-right text-sm text-[#1a1a1a]">
          {resultText}
        </p>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <p className="min-w-0 truncate text-sm text-[#1a1a1a]">
          {t("worldCup.matchVs", {
            home: item.homeTeam,
            away: item.awayTeam,
          })}
        </p>
        <p className={`ml-3 shrink-0 text-right text-sm font-medium ${profitTone}`}>
          <span>{t("worldCup.profit")}</span>
          <span>{profitText}</span>
        </p>
      </div>

      <div className="mt-3 flex flex-col gap-1.5 border-t border-[#f0f1f3] pt-3">
        <MetaRow label={t("worldCup.betAul")} value={stakeAulText} />
        <MetaRow label={t("worldCup.betTime")} value={betTimeText} />
        <MetaRow label={t("worldCup.winLoss")} value={winLossText} />
        <MetaRow label={t("worldCup.settlementAul")} value={settlementAulText} />
        <MetaRow
          label={t("worldCup.settlementTime")}
          value={settlementTimeText}
        />
      </div>
    </article>
  );
}
