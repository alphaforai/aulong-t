"use client";

import { AppImage } from "@/components/AppImage";
import { earningsAssets } from "./assets";
import { toast } from "sonner";
import { useTranslation } from "@/lib/hooks/useTranslation";

/** 收益摘要卡 — 对齐 Figma 439:331 / 438:5985 */
export function EarningsSummaryCard() {
  const { t } = useTranslation();
  return (
    <section className="relative h-[148px] w-full shrink-0 overflow-hidden rounded-[12px] bg-white/80 shadow-[0_5px_10px_rgba(51,51,51,0.08)] backdrop-blur-[7px]">
      <SummaryBackground />

      {/* 总收益 — left 9px, top 9px（稿 21/121 相对 12/112 卡片） */}
      <div className="absolute left-[9px] top-[9px] z-10 flex flex-col gap-2">
        <p className="text-sm leading-normal text-black/70">总收益(USDT)</p>
        <p className="font-[family-name:var(--font-mulish)] text-[32px] font-bold leading-none text-black">
          0.00
        </p>
      </div>

      {/* 收益记录 — 稿 top 124, 箭头 334px */}
      <button
        type="button"
        className="absolute right-[15px] top-3 z-10 flex items-center gap-1"
        onClick={() => {toast.success(t("toast.willdo"))}}
      >
        <span className="text-xs leading-normal text-black/70">收益记录</span>
        <AppImage
          src={earningsAssets.recordArrow}
          alt=""
          width={14}
          height={14}
          className="size-3.5 shrink-0 -scale-y-100 rotate-90"
        />
      </button>

      {/* 领取 — 稿 left 252, top 155 → 相对卡片 left 240, top 43 */}
      <button
        type="button"
        className="absolute right-[7px] top-[43px] z-10 flex h-9 w-[104px] select-none items-center justify-center rounded-[33px] border border-white bg-linear-to-r from-[#ff4d00] via-[#ff3033] via-[53.846%] to-[#e90000] text-base font-semibold leading-normal text-white shadow-[0_4px_6px_rgba(213,0,0,0.12),inset_0_-4px_4px_rgba(255,254,227,0.7),inset_0_8px_17px_#ffe5e5] [text-shadow:0_1px_3px_rgba(94,44,44,0.25)] transition-[transform] duration-150 ease-out will-change-transform active:translate-y-1 active:scale-[0.92]"
        onClick={() => {toast.success(t("toast.willdo"))}}
      >
        去理财
      </button>

      {/* 横线 — 稿居中宽 220, top 197 → top 85 */}
      <div className="absolute left-1/2 top-[85px] z-10 h-px w-[220px] -translate-x-1/2">
        <AppImage
          src={earningsAssets.summaryDividerH}
          alt=""
          width={220}
          height={1}
          className="block h-px w-full max-w-none"
        />
      </div>

      {/* 底部统计 — 稿 top 206, left 21, gap 11 */}
      <div className="absolute left-[9px] top-[94px] z-10 flex items-center gap-[11px]">
        <StatBlock label="待发放收益" />
        <div className="flex h-9 w-0 shrink-0 items-center justify-center">
          <div className="rotate-90">
            <AppImage
              src={earningsAssets.summaryDividerV}
              alt=""
              width={36}
              height={1}
              className="h-px w-9 max-w-none"
            />
          </div>
        </div>
        <StatBlock label="上期收益" withTrailingSpace />
      </div>
    </section>
  );
}

function SummaryBackground() {
  const maskStyle = {
    maskImage: `url(${earningsAssets.summaryDecoMask})`,
    WebkitMaskImage: `url(${earningsAssets.summaryDecoMask})`,
    maskSize: "371px 168px",
    WebkitMaskSize: "371px 168px",
    maskRepeat: "no-repeat" as const,
    WebkitMaskRepeat: "no-repeat" as const,
  };

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[12px]">
      {/* 稿 438:6259 — 相对卡片 left 55.7, top -152 */}
      <div className="absolute left-[55.7px] top-[-152px] flex h-[568px] w-[553px] items-center justify-center">
        <div className="flex-none -skew-x-[1.21deg] rotate-[-25.72deg]">
          <div
            className="relative h-[425px] w-[418px] opacity-[0.19]"
            style={{
              ...maskStyle,
              maskPosition: "-65.699px 147.084px",
              WebkitMaskPosition: "-65.699px 147.084px",
            }}
          >
            <AppImage
              src={earningsAssets.summaryPattern}
              alt=""
              fill
              className="object-cover"
            />
          </div>
        </div>
      </div>

      {/* 稿 438:6266 — 相对卡片 left -264, top -253 */}
      <div className="absolute -left-[264px] -top-[253px] flex h-[590px] w-[574px] items-center justify-center">
        <div className="flex-none -skew-x-[1.43deg] rotate-[-33.51deg]">
          <div
            className="relative h-[424px] w-[419px] opacity-[0.11]"
            style={{
              ...maskStyle,
              maskPosition: "253.884px 247.714px",
              WebkitMaskPosition: "253.884px 247.714px",
            }}
          >
            <AppImage
              src={earningsAssets.summaryPattern}
              alt=""
              fill
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatBlock({
  label,
  withTrailingSpace = false,
}: {
  label: string;
  withTrailingSpace?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-sm leading-normal text-black/70">{label}</p>
      <p className="text-black leading-none">
        <span className="font-[family-name:var(--font-mulish)] text-base font-bold leading-normal">
          0.00
        </span>
        {withTrailingSpace ? (
          <span className="font-[family-name:var(--font-mulish)] text-sm font-bold leading-normal">
            {" "}
          </span>
        ) : null}
        <span className="text-[10px] leading-normal">USDT</span>
      </p>
    </div>
  );
}
