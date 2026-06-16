"use client";

import React from "react";
import type { ButtonHTMLAttributes } from "react";
import { AppImage } from "@/components/AppImage";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { useUserInfoStore } from "@/lib/store";
import { mineAssets } from "./assets";
import { WithdrawAUL } from "./WithdrawAUL";
import { WithdrawUSDT } from "./WithdrawUSDT";
import { FinancialManagement } from "./FinancialManagement2";
import { useQuery } from "@tanstack/react-query";
import { getUserAssets } from "@/lib/api/users";

/** 总资产卡片 — 背景 Figma 550:7512，内容 Figma 514:6035 */
export function AssetSummaryCard() {
  const { t } = useTranslation();
  const userInfo = useUserInfoStore((state) => state.userInfo);
  const [showWithdrawUsdt, setShowWithdrawUsdt] = React.useState(false);
  const [showWithdrawAul, setShowWithdrawAul] = React.useState(false);
  const [showFinancialManagement, setShowFinancialManagement] =
    React.useState(false);

    //
    // 响应示例
// {
// 	"code": 0,
// 	"msg": "",
// 	"data": {
// 		"totalBalance": 0,
// 		"totalIncomeUsdt": 0,
// 		"usdtBalance": 0,
// 		"stakeTotalUsdtIncome": 0,
// 		"stakeUsdtIncome": 0,
// 		"lastUsdtIncome": 0,
// 		"stakeUsdt": 0,
// 		"miningUsdt": 0,
// 		"xcoinUnreleasedBalance": 0,
// 		"xcoinReleasedBalance": 0,
// 		"xcoinBalance": 0
// 	},
// 	"success": true
// }

  // getUserAssets
  const { data: userAssetsResponse } = useQuery({
    queryKey: ["userAssets", userInfo.walletAddress],
    queryFn: () => getUserAssets(),
    enabled: Boolean(userInfo.walletAddress),
  });


  const userAssets = userAssetsResponse?.data;
  const totalAssets = userAssets?.totalBalance ?? 0;
  const usdtBalance = userAssets?.usdtBalance ?? 0;
  const xcoinBalance = userAssets?.xCoinBalance ?? 0;
  const stakeUsdt = userAssets?.stakeUsdt ?? 0;
  const xcoinUnreleasedBalance = userAssets?.xcoinUnreleasedBalance ?? 0;

  const summaryCards = [
    {
      label: t("mine.totalEntrustUsdt"),
      value: stakeUsdt,
      unit: "USDT",
      icon: mineAssets.summaryTotalEntrust,
    },
    {
      label: t("mine.totalUnreleasedAul"),
      value: xcoinUnreleasedBalance,
      unit: "AUL",
      icon: mineAssets.summaryAulUnreleased,
    },
    {
      label: t("mine.totalEarnings"),
      value: usdtBalance,
      unit: "USDT",
      icon: mineAssets.summaryUsdtWithdrawable,
    },
    {
      label: t("mine.totalRelease"),
      value: xcoinBalance,
      unit: "AUL",
      icon: mineAssets.summaryAulWithdrawable,
    },
  ];

  return (
    <section className="relative h-[340px] w-full shrink-0">
      <AssetCardBackground />

      <div className="absolute inset-x-10 top-[27px] z-10 flex flex-col items-center gap-1.5">
        <div className="flex items-center justify-center gap-1">
          <p className="max-w-[180px] truncate text-sm font-extrabold leading-normal text-black/70">
            {t("mine.totalAssets")}
          </p>
          <WhitelistBadge hasTicket={userInfo.hasTicket} />
        </div>
        <p className="font-mulish text-[32px] font-bold leading-normal text-black">
          {totalAssets}
        </p>
      </div>

      <div className="absolute left-1/2 top-[114px] z-10 grid w-[336px] -translate-x-1/2 grid-cols-2 gap-2">
        {summaryCards.map((card) => (
          <StatColumn
            key={card.label}
            label={card.label}
            value={card.value}
            unit={card.unit}
            icon={card.icon}
          />
        ))}
      </div>

      <div className="absolute left-1/2 top-[260px] z-10 flex w-[343px] -translate-x-1/2 items-center justify-center gap-3">
        <ActionButton
          icon={mineAssets.actionUsdt}
          label={t("mine.usdtWithdraw")}
          variant="light"
          onClick={() => setShowWithdrawUsdt(true)}
        />
        <ActionButton
          icon={mineAssets.actionAul}
          label={t("mine.aulWithdraw")}
          variant="light"
          onClick={() => setShowWithdrawAul(true)}
        />
        <ActionButton
          icon={mineAssets.actionInvest}
          label={t("mine.goInvest")}
          variant="primary"
          onClick={() => setShowFinancialManagement(true)}
        />
      </div>

      <WithdrawUSDT
        open={showWithdrawUsdt}
        onClose={() => setShowWithdrawUsdt(false)}
      />
      <WithdrawAUL
        open={showWithdrawAul}
        onClose={() => setShowWithdrawAul(false)}
      />
      <FinancialManagement
        open={showFinancialManagement}
        onClose={() => setShowFinancialManagement(false)}
      />
    </section>
  );
}

/** Figma 550:7512 — image 72 背景层 */
function AssetCardBackground() {
  return (
    <div
      className="absolute inset-0 overflow-clip rounded-[12px] border border-white opacity-80 shadow-[0_5px_10px_rgba(51,51,51,0.08)]"
      aria-hidden
    >
      <div className="pointer-events-none absolute inset-0 rounded-[12px]">
        <div className="absolute inset-0 overflow-hidden rounded-[12px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={mineAssets.assetCardBg}
            alt=""
            className="absolute max-w-none"
            style={{
              height: "136.35%",
              width: "133.46%",
              left: "-16.68%",
              top: "-16.95%",
            }}
          />
        </div>
        <div className="absolute inset-0 rounded-[12px] bg-gradient-to-b from-[rgba(255,255,255,0.35)] from-[34.924%] to-white" />
      </div>
    </div>
  );
}

function WhitelistBadge({ hasTicket }: { hasTicket: number }) {
  const { t } = useTranslation();
  const isWhitelist = Number(hasTicket) === 1;

  if (isWhitelist) {
    return (
      <span className="inline-flex h-5 shrink-0 items-center justify-center whitespace-nowrap rounded-[36px] bg-[rgba(255,0,0,0.91)] px-2 text-[12px] font-medium leading-none text-white shadow-[inset_0_4px_4px_rgba(167,189,255,0.25)]">
        {t("mine.whitelist")}
      </span>
    );
  }

  return (
    <span className="inline-flex h-5 shrink-0 items-center justify-center whitespace-nowrap rounded-[36px] bg-black px-2 text-[12px] font-medium leading-none text-white">
      {t("mine.inactive")}
    </span>
  );
}

function StatColumn({
  label,
  value,
  unit,
  icon,
}: {
  label: string;
  value: number;
  unit: string;
  icon: string;
}) {
  const displayValue = Number(value).toLocaleString("en-US", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  });

  return (
    <div className="relative h-[65px] w-40 shrink-0 overflow-hidden rounded-[8px] bg-white/80 shadow-[0_5px_10px_rgba(51,51,51,0.08)] backdrop-blur-[7px]">
      <div className="absolute left-2 top-[12.5px] flex w-[97px] flex-col gap-0.5">
        <p className="text-sm leading-normal text-black/70">{label}</p>
        <p className="inline-flex items-baseline whitespace-nowrap leading-none text-[#333]">
          <span className="font-mulish text-base font-semibold leading-normal">
            {displayValue}
          </span>
          <span className="ml-1 font-mulish text-[10px] leading-normal">
            {unit}
          </span>
        </p>
      </div>
      <AppImage
        src={icon}
        alt=""
        width={44}
        height={44}
        className="pointer-events-none absolute right-[6px] top-[11px] size-11 object-contain"
      />
    </div>
  );
}

function ActionButton({
  icon,
  label,
  variant,
  className = "",
  ...props
}: {
  icon: string;
  label: string;
  variant: "light" | "primary";
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  const isPrimary = variant === "primary";

  return (
    <button
      type="button"
      className={`relative flex h-[66px] w-[98px] shrink-0 select-none flex-col items-center justify-center rounded-[12px] border border-white p-[10px] transition-[transform] duration-150 ease-out will-change-transform active:translate-y-1 active:scale-[0.92] ${
        isPrimary
          ? "gap-[3px] shadow-[0_2px_3.5px_rgba(58,0,0,0.16)]"
          : "gap-[2px] bg-[rgba(255,255,255,0.7)] shadow-[0_5px_5px_rgba(51,51,51,0.08)] backdrop-blur-[7px]"
      } ${className}`}
      {...props}
    >
      {isPrimary ? (
        <>
          <span className="pointer-events-none absolute inset-0 rounded-[12px] bg-gradient-to-r from-[#ff4d00] via-[#ff3033] via-[53.846%] to-[#e90000]" />
          <span className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0_-4px_4px_rgba(255,254,227,0.7),inset_0_8px_17px_#ffe5e5]" />
        </>
      ) : null}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={icon}
        alt=""
        width={34}
        height={34}
        className="relative z-10 size-[34px] shrink-0 object-contain"
      />
      <span
        className={`relative z-10 max-w-full whitespace-nowrap text-center text-[14px] leading-normal font-normal ${
          isPrimary ? "text-white" : "text-[#e43b3b]"
        }`}
      >
        {label}
      </span>
    </button>
  );
}
