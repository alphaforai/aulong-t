"use client";

import { useState } from "react";
import { entrustAssets } from "./assets";
import { EntrustImg } from "./EntrustImg";

const TIME_RANGES = ["1H", "1D", "1W", "1M", "1Y"] as const;

const Y_LABELS = [
  { label: "7.00", top: -6 },
  { label: "6.00", top: 18 },
  { label: "4.00", top: 41 },
  { label: "3.50", top: 65 },
  { label: "2.20", top: 89 },
  { label: "1.25", top: 113 },
  { label: "0.50", top: 136 },
] as const;

export function PriceChartSection() {
  const [activeRange, setActiveRange] =
    useState<(typeof TIME_RANGES)[number]>("1D");

  return (
    <section className="relative z-0 flex w-full flex-col items-center gap-3 overflow-hidden rounded-[12px] border border-white bg-white px-4 py-3 shadow-[0_5px_5px_rgba(51,51,51,0.08)]">
      <div className="relative h-[126px] w-full min-w-0 shrink-0 rounded-[12px] shadow-[0_4px_5.2px_rgba(253,101,104,0.06)]">
        <p className="absolute left-[18px] top-[9px] text-[14px] text-[#5c5c5c]">
          X 币价格
        </p>
        <p className="absolute left-[18px] top-[29px] font-[family-name:var(--font-mulish)] text-[20px] font-bold leading-normal text-[#1e1917]">
          5.00
        </p>
        <p className="absolute left-[61px] top-[36px] text-[10px] font-medium leading-normal text-[#1e1917]">
          USDT
        </p>
        <p className="absolute left-[18px] top-[57px] font-[family-name:var(--font-mulish)] text-[14px] leading-normal text-[#16b86f]">
          +8.24%
        </p>

        <div className="absolute left-1/2 top-[15px] h-[51px] w-px -translate-x-1/2 bg-[#f3efeb]" />

        <p className="absolute left-[198px] top-[9px] text-[14px] text-[#5c5c5c]">
          持有 X 币
        </p>
        <p className="absolute left-[198px] top-[29px] font-[family-name:var(--font-mulish)] text-[20px] font-bold leading-normal text-[#1e1917]">
          1,000.00
        </p>
        <p className="absolute left-[284px] top-[36px] text-[10px] font-medium leading-normal text-[#1e1917]">
          X
        </p>
        <p className="absolute left-[198px] top-[57px] font-[family-name:var(--font-mulish)] text-[14px] leading-normal text-[#5c5c5c]">
          ≈ $5,000.00
        </p>

        <div className="absolute left-1/2 top-[81px] flex h-9 w-full max-w-[327px] -translate-x-1/2 items-center justify-between overflow-hidden rounded-[7px] bg-[#f4f4f4] p-1">
          {TIME_RANGES.map((range) => {
            const active = range === activeRange;
            return (
              <button
                key={range}
                type="button"
                onClick={() => setActiveRange(range)}
                className={`flex h-7 min-w-0 flex-1 items-center justify-center rounded-lg text-[12px] font-medium leading-4 ${
                  active ? "bg-[#e90000] text-white" : "text-[#1e1917]"
                }`}
              >
                {range}
              </button>
            );
          })}
        </div>
      </div>

      <div className="relative h-[144px] w-full min-w-0 shrink-0 overflow-hidden">
        <div className="absolute inset-0 left-5 overflow-hidden">
          <div className="absolute inset-[21%_0_0_6.27%] relative overflow-hidden">
            <EntrustImg src={entrustAssets.chartFill} alt="" fill />
          </div>
          <div className="absolute inset-[21%_0_13.37%_6.27%] relative overflow-hidden">
            <EntrustImg src={entrustAssets.chartLine} alt="" fill />
          </div>

          <div className="absolute left-[245px] top-1 rounded-full bg-[#e90000] px-1 py-0.5">
            <span className="font-[family-name:var(--font-mulish)] text-[10px] font-semibold leading-normal text-white">
              $5.00
            </span>
          </div>
          <EntrustImg
            src={entrustAssets.chartDot}
            alt=""
            width={6}
            height={6}
            className="absolute left-[261px] top-[27px]"
          />
        </div>

        {Y_LABELS.map(({ label, top }) => (
          <span
            key={label}
            className="absolute left-[5.5px] -translate-x-1/2 font-[family-name:var(--font-mulish)] text-[10px] font-semibold leading-normal text-black"
            style={{ top }}
          >
            {label}
          </span>
        ))}
      </div>

      <div className="flex h-[18px] w-full min-w-0 shrink-0 items-center justify-between text-[11px] leading-[15px] text-[#9b4949]">
        {["00:00", "06:00", "12:00", "18:00", "24:00"].map((label) => (
          <span key={label} className="shrink-0">
            {label}
          </span>
        ))}
      </div>
    </section>
  );
}
