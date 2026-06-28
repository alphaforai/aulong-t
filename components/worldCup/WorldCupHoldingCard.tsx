"use client";

import { AppImage } from "@/components/AppImage";
import type { WorldCupHoldingItem } from "@/lib/worldCup/types";
import {
  formatOrderAmount,
  formatOrderDateTime,
} from "@/lib/worldCup/formatOrderDisplay";

type WorldCupHoldingCardProps = {
  item: WorldCupHoldingItem;
  t: (key: string, params?: Record<string, string | number>) => string;
};

function MetaCell({
  label,
  value,
  valueClassName = "text-[#1a1a1a]",
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="min-w-0">
      <p className="text-xs leading-snug text-[#707070]">{label}</p>
      <p
        className={`mt-0.5 break-words text-sm font-semibold leading-snug ${valueClassName}`}
      >
        {value}
      </p>
    </div>
  );
}

function resolveSideLabel(
  side: WorldCupHoldingItem["side"],
  t: (key: string) => string,
) {
  return side === "NO" ? t("worldCup.outcomeNo") : t("worldCup.outcomeYes");
}

/** 持仓中列表卡片 */
export function WorldCupHoldingCard({ item, t }: WorldCupHoldingCardProps) {
  const headline = item.question.trim() || item.title;
  const stakeText = `${formatOrderAmount(item.stakeAmount)} ${item.stakeCurrency}`;
  const profitText = `${formatOrderAmount(item.estimatedProfit)} ${item.profitCurrency}`;
  const stakeAulText = `${formatOrderAmount(item.stakeAul)} AUL`;
  const betTimeText = formatOrderDateTime(item.betAt);
  const sideText = resolveSideLabel(item.side, t);

  return (
    <article className="rounded-[12px] border border-[#f0f1f3] bg-white p-[14px] shadow-[0_10px_14px_rgba(17,24,39,0.08)]">
      <div className="flex items-start gap-2">
        {item.icon ? (
          <AppImage
            src={item.icon}
            alt=""
            width={32}
            height={32}
            className="size-8 shrink-0 rounded object-cover"
          />
        ) : null}
        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-3 text-sm font-extrabold leading-snug text-[#1a1a1a]">
            {headline}
          </h3>
          <p className="mt-1 text-xs leading-snug text-[#949494]">
            <span className="text-[#707070]">{t("worldCup.betTime")}</span>
            <span className="font-medium text-[#5c5c5c]">{betTimeText}</span>
          </p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2.5 border-t border-[#f0f1f3] pt-3">
        <MetaCell label={t("worldCup.stakeAmount")} value={stakeText} />
        <MetaCell
          label={t("worldCup.estimatedProfit")}
          value={profitText}
        />
        <MetaCell label={t("worldCup.betAul")} value={stakeAulText} />
        <MetaCell label={t("worldCup.betSide")} value={sideText} />
      </div>
    </article>
  );
}
