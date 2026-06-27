"use client";

import { AppImage } from "@/components/AppImage";
import { formatAmount } from "@/components/team/format";
import type { WorldCupParticipateSubmitResult } from "@/lib/worldCup/participateTypes";
import { worldCupAssets } from "./assets";

type WorldCupParticipateSuccessProps = {
  order: WorldCupParticipateSubmitResult;
  t: (key: string, params?: Record<string, string | number>) => string;
};

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-[#f0f1f3] pb-2.5 last:border-b-0 last:pb-0">
      <span className="text-sm text-[#5c5c5c]">{label}</span>
      <span className="text-right text-sm font-bold text-[#1a1a1a]">{value}</span>
    </div>
  );
}

function formatOrderStatus(
  status: string,
  t: (key: string, params?: Record<string, string | number>) => string,
) {
  switch (status) {
    case "PLACING":
      return t("worldCup.orderStatusPlacing");
    case "PLACED":
      return t("worldCup.orderStatusPlaced");
    case "FAILED":
      return t("worldCup.orderStatusFailed");
    default:
      return status || t("worldCup.orderStatusSuccess");
  }
}

/** 下单成功反馈 — 提交成功后替换下注表单，Figma 1380-13958 */
export function WorldCupParticipateSuccess({
  order,
  t,
}: WorldCupParticipateSuccessProps) {
  const outcomeLabel = order.question || order.title;

  return (
    <div className="flex w-full flex-col items-center px-[26px] pb-6 pt-2">
      <div className="flex h-[160px] w-[160px] items-center justify-center">
        <AppImage
          src={worldCupAssets.orderSuccess}
          alt=""
          width={160}
          height={160}
          className="size-[160px] max-w-full object-contain"
        />
      </div>

      <h2 className="mt-[34px] text-center text-2xl font-bold leading-normal text-[#1a1a1a]">
        {t("worldCup.orderSuccessTitle")}
      </h2>
      <p className="mt-2 text-center text-sm leading-[23.8px] text-[#5c5c5c]">
        {t("worldCup.orderSuccessDesc", { outcome: outcomeLabel })}
      </p>

      <article className="mt-[34px] w-full rounded-[12px] border border-[#f0f1f3] bg-white p-[15px] shadow-[0_10px_14px_rgba(17,24,39,0.08)]">
        <div className="flex flex-col space-y-2.5">
          <DetailRow
            label={t("worldCup.orderStakeAmount")}
            value={`${formatAmount(order.actualUsdt)} USDT`}
          />
          <DetailRow
            label={t("worldCup.orderDeductAmount")}
            value={`${formatAmount(order.aul)} AUL`}
          />
          <DetailRow
            label={t("worldCup.orderExpectedPayout")}
            value={`${formatAmount(order.netPayoutUsdt)} USDT`}
          />
          <DetailRow
            label={t("worldCup.orderStatus")}
            value={formatOrderStatus(order.status, t)}
          />
        </div>
      </article>
    </div>
  );
}
