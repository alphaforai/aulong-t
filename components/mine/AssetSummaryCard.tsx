"use client";

import type { ButtonHTMLAttributes } from "react";
import { AppImage } from "@/components/AppImage";
import { useUserInfoStore } from "@/lib/store";
import { mineAssets } from "./assets";
import { toast } from "sonner";

/** 总资产卡片 — 背景 Figma 550:7512，内容 Figma 514:6035 */
export function AssetSummaryCard() {
  const userInfo = useUserInfoStore((state) => state.userInfo);

  return (
    <section className="relative h-[258px] w-full shrink-0">
      <AssetCardBackground />

      <div className="absolute left-[66px] top-[27px] z-10 flex w-[219px] flex-col items-center gap-1.5">
        <div className="flex items-center justify-center gap-0.5">
          <p className="text-sm leading-normal text-black/70">总资产(USDT)</p>
          <WhitelistBadge hasTicket={userInfo.hasTicket} />
        </div>
        <p className="font-[family-name:var(--font-mulish)] text-[32px] font-bold leading-normal text-black">
            0.00
        </p>
      </div>

      <div className="absolute left-[28.5px] top-[120px] z-10 flex items-center gap-4">
        <StatColumn label="总收益(USDT)" value="0.00" trailingSpace />
        <div className="flex h-7 w-0 items-center justify-center">
          <div className="rotate-90">
            <AppImage
              src={mineAssets.statDividerV}
              alt=""
              width={28}
              height={1}
              className="h-px w-7 max-w-none"
            />
          </div>
        </div>
        <StatColumn label="总释放(X)" value="0.00" trailingSpace />
      </div>

      <div className="absolute left-2 top-[177px] z-10 flex w-[335px] items-center justify-center gap-3">
        <ActionButton
          icon={mineAssets.actionUsdt}
          iconClassName="left-[-8.14%] top-[-8.14%] size-[116.28%]"
          label="USDT提取"
          variant="light"
          onClick={() => {toast.info("暂未开放")}}
        />
        <ActionButton
          icon={mineAssets.actionX}
          iconClassName="left-[-27.37%] top-[-27.37%] size-[154.74%]"
          label="X提取"
          variant="light"
          onClick={() => {toast.info("暂未开放")}}
        />
        <ActionButton
          icon={mineAssets.actionInvest}
          iconClassName="left-[-17.6%] top-[-17.6%] size-[135.21%]"
          label="去理财"
          variant="primary"
          onClick={() => {toast.info("暂未开放")}}
        />
      </div>
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
          {/* 原生 img 避免 next/image 压缩；勿对底图使用 backdrop-blur */}
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
        <div className="absolute inset-0 rounded-[12px] bg-linear-to-b from-[rgba(255,255,255,0.35)] from-[34.924%] to-white" />
      </div>
    </div>
  );
}

function WhitelistBadge({ hasTicket }: { hasTicket: number }) {
  const isWhitelist = Number(hasTicket) === 1;

  if (isWhitelist) {
    return (
      <span className="inline-flex h-5 shrink-0 items-center justify-center whitespace-nowrap rounded-[36px] bg-[rgba(255,0,0,0.91)] px-2 text-[12px] font-medium leading-none text-white shadow-[inset_0_4px_4px_rgba(167,189,255,0.25)]">
        白名单
      </span>
    );
  }

  return (
    <span className="inline-flex h-5 shrink-0 items-center justify-center whitespace-nowrap rounded-[36px] bg-black px-2 text-[12px] font-medium leading-none text-white">
      未激活
    </span>
  );
}

function StatColumn({
  label,
  value,
  trailingSpace = false,
}: {
  label: string;
  value: string;
  trailingSpace?: boolean;
}) {
  return (
    <div className="flex w-[131px] flex-col items-center gap-1">
      <p className="text-center text-sm leading-normal text-black/70">{label}</p>
      <p className="text-center leading-none text-black">
        <span className="font-[family-name:var(--font-mulish)] text-base font-semibold leading-normal">
          {value}
        </span>
        {trailingSpace ? (
          <span className="font-[family-name:var(--font-mulish)] text-sm font-semibold leading-normal">
            {" "}
          </span>
        ) : null}
      </p>
    </div>
  );
}

function ActionButton({
  icon,
  iconClassName,
  label,
  variant,
  className = "",
  ...props
}: {
  icon: string;
  iconClassName: string;
  label: string;
  variant: "light" | "primary";
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  const isPrimary = variant === "primary";

  return (
    <button
      type="button"
      className={`relative flex h-[66px] w-[98px] shrink-0 select-none flex-col items-center justify-center rounded-[12px] border border-white p-2.5 transition-[transform] duration-150 ease-out will-change-transform active:translate-y-1 active:scale-[0.92] ${
        isPrimary
          ? "gap-[3px] shadow-[0_2px_3.5px_rgba(58,0,0,0.16)]"
          : "gap-0.5 bg-[rgba(255,255,255,0.7)] shadow-[0_5px_5px_rgba(51,51,51,0.08)] backdrop-blur-[7px]"
      } ${className}`}
      {...props}
    >
      {isPrimary ? (
        <>
          <span className="pointer-events-none absolute inset-0 rounded-[12px] bg-linear-to-r from-[#ff4d00] via-[#ff3033] via-[53.846%] to-[#e90000]" />
          <span className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0_-4px_4px_rgba(255,254,227,0.7),inset_0_8px_17px_#ffe5e5]" />
        </>
      ) : null}
      <div className="relative z-10 size-[34px] shrink-0 overflow-hidden">
        <AppImage
          src={icon}
          alt=""
          width={34}
          height={34}
          className={`absolute max-w-none ${iconClassName}`}
        />
      </div>
      <span
        className={`relative z-10 text-sm leading-normal ${
          isPrimary ? "text-white" : "text-[#e43b3b]"
        }`}
      >
        {label}
      </span>
    </button>
  );
}
