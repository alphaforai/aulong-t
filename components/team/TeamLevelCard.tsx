import { EntrustImg } from "@/components/entrust/EntrustImg";
import { teamAssets } from "./assets";

const PROGRESS = 4500;
const PROGRESS_MAX = 5000;
const PROGRESS_PCT = (PROGRESS / PROGRESS_MAX) * 100;

/** VIP 等级与升级进度 — Figma 535:6307 */
export function TeamLevelCard() {
  return (
    <section className="relative -mb-1 flex w-full min-w-0 gap-3">
      <div className="relative h-[83px] w-[78px] shrink-0">
        <EntrustImg
          src={teamAssets.levelAvatar}
          alt=""
          width={78}
          height={83}
          className="absolute h-[107.29%] w-[114%] max-w-none -left-[7%] -top-[3.06%]"
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 flex-col">
            <p className="text-sm leading-tight text-[#4b4b4b]">当前等级</p>
            <div className="relative mt-0.5 h-10 w-32">
              <EntrustImg
                src={teamAssets.vipBadge}
                alt="VIP1"
                width={128}
                height={40}
                className="size-full object-contain object-left"
              />
            </div>
          </div>
          <div className="flex h-[58px] shrink-0 flex-col items-end justify-between">
            <button
              type="button"
              className="flex items-center gap-0.5 text-xs leading-normal text-[rgba(51,51,51,0.7)]"
            >
              规则说明
              <EntrustImg
                src={teamAssets.rulesIcon}
                alt=""
                width={13}
                height={13}
                className="size-[13px] shrink-0"
              />
            </button>
            <p className="text-xs leading-normal whitespace-nowrap">
              <span className="text-[#424242]">{PROGRESS}/</span>
              <span className="font-semibold text-[#fd4140]">{PROGRESS_MAX}</span>
            </p>
          </div>
        </div>

        <div className="mt-1 flex flex-col gap-1">
          <div className="relative h-2 w-full overflow-hidden rounded-[34px] bg-[#e5e5e5]">
            <div
              className="absolute inset-y-0 left-0 rounded-[34px] bg-linear-to-r from-[#c60303] to-[#f33]"
              style={{ width: `${PROGRESS_PCT}%` }}
            />
          </div>
          <p className="text-sm leading-tight tracking-[0.28px] text-[#292929]">
            小区业绩
          </p>
        </div>
      </div>
    </section>
  );
}
