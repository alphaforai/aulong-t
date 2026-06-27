"use client";

import { AppImage } from "@/components/AppImage";
import {
  formatAulAmount,
  formatOrderDateTime,
  formatSignedAulAmount,
  formatUsdtAmount,
  resolveOrderWinStatus,
  resolveProfitTone,
  resolveWinBadgeClass,
  type OrderWinStatus,
} from "@/lib/worldCup/formatOrderDisplay";
import {
  formatHistoryMatchResult,
  resolveOrderOutcomeLabel,
} from "@/lib/worldCup/resolveOrderOutcomeLabel";
import type { WorldCupHistoryItem } from "@/lib/worldCup/types";

type WorldCupHistoryCardProps = {
  item: WorldCupHistoryItem;
  t: (key: string, params?: Record<string, string | number>) => string;
};

function resolveWinLabel(status: OrderWinStatus, t: WorldCupHistoryCardProps["t"]) {
  switch (status) {
    case "WIN":
      return t("worldCup.winStatusWin");
    case "LOSE":
      return t("worldCup.winStatusLose");
    case "CANCELLED":
      return t("worldCup.winStatusCancelled");
    default:
      return t("worldCup.winStatusUnsettled");
  }
}




/** 历史记录列表卡片 — 对齐持仓卡布局，补充结算信息 */
export function WorldCupHistoryCard({ item, t }: WorldCupHistoryCardProps) {
  const outcomeLabel = resolveOrderOutcomeLabel(item, t);
  const winStatus = resolveOrderWinStatus(item.win);
  const winLabel = resolveWinLabel(winStatus, t);
  const winBadgeClass = resolveWinBadgeClass(winStatus);

  const stakeText = `${formatUsdtAmount(item.stakeAmount)} ${item.stakeCurrency}`;
  const stakeAulText = `${formatAulAmount(item.stakeAul)} AUL`;
  const payoutAulText = `${formatAulAmount(item.payoutAul)} AUL`;
  const profitText = `${formatSignedAulAmount(item.profitAmount)} ${item.profitCurrency}`;
  const profitTone = resolveProfitTone(item.profitAmount);
  const resultText = formatHistoryMatchResult(item, t);
  const betTimeText = formatOrderDateTime(item.createdAt);
  const settledTimeText = formatOrderDateTime(item.settledAt);

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
        <span
          className={`ml-2 shrink-0 rounded-[12px] px-2 py-0.5 text-xs font-extrabold uppercase ${winBadgeClass}`}
        >
          {winLabel}
        </span>
      </div>

      <div className="mt-3.5 flex items-center justify-between gap-3">
        <p className="min-w-0 truncate text-base font-semibold text-[#1a1a1a]">
          {outcomeLabel}
        </p>
        <p className="shrink-0 text-right text-sm text-[#1a1a1a]">{resultText}</p>
      </div>

      <div className="mt-3 flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col space-y-2">
          <p className="truncate text-sm text-[#1a1a1a]">
            {t("worldCup.matchVs", {
              home: item.homeTeam,
              away: item.awayTeam,
            })}
          </p>
          <p className="truncate text-xs text-[#707070]">
            <span>{t("worldCup.betTime")}</span>
            <span className="text-[#1a1a1a]">{betTimeText}</span>
          </p>
          <p className="truncate text-xs text-[#707070]">
            <span>{t("worldCup.settleTime")}</span>
            <span className="text-[#1a1a1a]">{settledTimeText}</span>
          </p>
        </div>

        <div className="flex shrink-0 flex-col items-end space-y-1.5 text-right text-sm text-[#707070]">
          <p>
            <span>{t("worldCup.stakeAmount")}</span>
            <span className="font-semibold text-[#1a1a1a]">{stakeText}</span>
          </p>
          <p>
            <span>{t("worldCup.stakeAul")}</span>
            <span className="font-semibold text-[#1a1a1a]">{stakeAulText}</span>
          </p>
          <p>
            <span>{t("worldCup.payoutAul")}</span>
            <span className="font-semibold text-[#1a1a1a]">{payoutAulText}</span>
          </p>
          <p className={`font-medium ${profitTone}`}>
            <span>{t("worldCup.profit")}</span>
            <span>{profitText}</span>
          </p>
        </div>
      </div>
    </article>
  );
}
