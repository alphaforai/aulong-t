import { AppImage } from "@/components/AppImage";
import { teamAssets } from "./assets";
import { TeamSectionTitle } from "./TeamSectionTitle";
import { displayTeamValue, formatAmount } from "./format";

export type TeamPerformanceCardProps = {
  isPending?: boolean;
};

/** 团队业绩数据 — Figma 535:6355（接口暂无对应字段，先展示占位 0） */
export function TeamPerformanceCard({ isPending }: TeamPerformanceCardProps) {
  const deltaValue = displayTeamValue(isPending, `+${formatAmount(0)}`);
  const deltaPctValue = displayTeamValue(isPending, `+${formatAmount(0)}%`);

  return (
    <section className="relative w-full shrink-0 overflow-hidden rounded-[12px] border border-white bg-white/61 shadow-[0_5px_10px_rgba(51,51,51,0.08)] backdrop-blur-[7px]">
      <div className="relative px-2.5 pt-2.5">
        <TeamSectionTitle title="团队业绩数据" />

        <div className="relative mt-2 min-h-[72px] pr-[86px]">
          <p className="text-sm leading-normal text-[#333]">小区业绩(昨日变化)</p>
          <div className="mt-0.5 flex flex-wrap items-end gap-1.5 whitespace-nowrap">
            <p
              className={`font-[family-name:var(--font-mulish)] text-lg font-medium leading-normal ${
                isPending ? "text-[#8b8b8b]" : "text-[#db0000]"
              }`}
            >
              {deltaValue}
              {!isPending ? (
                <span className="text-xs font-normal text-[#db0000]">
                  {" "}
                  USDT
                </span>
              ) : null}
            </p>
            <span
              className={`font-[family-name:var(--font-mulish)] text-sm leading-normal ${
                isPending ? "text-[#8b8b8b]" : "text-[#db0000]"
              }`}
            >
              {deltaPctValue}
            </span>
          </div>
          <AppImage
            src={teamAssets.performanceDeco}
            alt=""
            width={86}
            height={86}
            className="pointer-events-none absolute right-0 top-1/2 size-[86px] -translate-y-1/2 object-contain"
          />
        </div>
      </div>

      <div className="mt-1 rounded-b-[12px] bg-white/80 px-2.5 pb-2.5 pt-2 backdrop-blur-[7px]">
        <div className="flex gap-3">
          <PerformanceSubCard
            icon={teamAssets.perfIconToday}
            label="今日委托总额"
            value={displayTeamValue(isPending, formatAmount(0))}
            unit="USDT"
            isPending={isPending}
          />
          <PerformanceSubCard
            icon={teamAssets.perfIconTeam}
            label="团队委托总额"
            value={displayTeamValue(isPending, formatAmount(0))}
            unit="USDT"
            isPending={isPending}
          />
        </div>
      </div>
    </section>
  );
}

function PerformanceSubCard({
  icon,
  label,
  value,
  unit,
  isPending,
}: {
  icon: string;
  label: string;
  value: string;
  unit: string;
  isPending?: boolean;
}) {
  return (
    <div className="relative h-[65px] min-w-0 flex-1 overflow-hidden rounded-lg bg-white shadow-[0_5px_10px_rgba(51,51,51,0.08)] backdrop-blur-[7px]">
      <div className="absolute left-2 top-3.5 flex w-[97px] flex-col gap-0.5">
        <p className="text-sm leading-normal text-[rgba(51,51,51,0.8)]">{label}</p>
        <p
          className={`font-[family-name:var(--font-mulish)] text-lg font-medium leading-normal ${
            isPending ? "text-[#8b8b8b]" : "text-[#333]"
          }`}
        >
          {value}
          {!isPending ? (
            <span className="text-xs font-normal"> {unit}</span>
          ) : null}
        </p>
      </div>
      <div className="absolute right-[6px] top-[11px] size-11 overflow-hidden">
        <AppImage
          src={teamAssets.subCardIconGlow}
          alt=""
          width={44}
          height={44}
          className="absolute inset-[11.36%_0_-9.09%_2.27%] size-full max-w-none"
        />
        <div className="absolute inset-[6.82%] overflow-hidden">
          <AppImage
            src={icon}
            alt=""
            width={40}
            height={40}
            className="absolute -left-[37.84%] -top-[37.84%] size-[175.68%] max-w-none"
          />
        </div>
      </div>
    </div>
  );
}
