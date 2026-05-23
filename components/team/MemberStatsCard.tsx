import { EntrustImg } from "@/components/entrust/EntrustImg";
import { teamAssets } from "./assets";
import { TeamSectionTitle } from "./TeamSectionTitle";

type MemberStat = {
  icon: string;
  label: string;
  value: string;
  iconCrop?: string;
};

const MEMBER_STATS: MemberStat[] = [
  {
    icon: teamAssets.memberIconRegister,
    label: "团队总注册人数",
    value: "122,582",
    iconCrop: "left-[-24.07%] top-[-24.07%] size-[148.15%]",
  },
  {
    icon: teamAssets.memberIconWhitelist,
    label: "团队总白名单数",
    value: "9,215,480",
    iconCrop: "left-[-36%] top-[-37.35%] size-[172.01%]",
  },
  {
    icon: teamAssets.memberIconEntrust,
    label: "团队总委托人数",
    value: "215,480",
    iconCrop: "left-[-24.07%] top-[-24.07%] size-[148.15%]",
  },
  {
    icon: teamAssets.memberIconNewWhitelist,
    label: "今日新增白名单人数",
    value: "122,582",
    iconCrop: "left-[-24.07%] top-[-24.07%] size-[148.15%]",
  },
];

/** 人数统计 — Figma 535:6392 */
export function MemberStatsCard() {
  return (
    <section className="flex w-full min-w-0 flex-col overflow-hidden rounded-[12px] border border-white bg-white/61 p-2.5 shadow-[0_5px_10px_rgba(51,51,51,0.08)] backdrop-blur-[7px]">
      <TeamSectionTitle
        title="人数统计"
        action={
          <button
            type="button"
            className="flex shrink-0 items-center gap-0.5 text-xs leading-normal text-[rgba(0,0,0,0.7)]"
          >
            直推详情
            <EntrustImg
              src={teamAssets.detailArrow}
              alt=""
              width={14}
              height={14}
              className="size-3.5 shrink-0 -scale-y-100 rotate-90"
            />
          </button>
        }
      />

      <div className="mt-2 grid grid-cols-2 gap-x-2 gap-y-2">
        {MEMBER_STATS.map((stat) => (
          <MemberStatTile key={stat.label} {...stat} />
        ))}
      </div>
    </section>
  );
}

function MemberStatTile({ icon, label, value, iconCrop }: MemberStat) {
  const crop =
    iconCrop ?? "left-[-24.07%] top-[-24.07%] size-[148.15%]";

  return (
    <div className="relative h-[70px] overflow-hidden rounded-[12px] border border-white bg-white shadow-[0_5px_10px_rgba(51,51,51,0.08)] backdrop-blur-[7px]">
      <div className="absolute left-2.5 top-4 flex flex-col gap-0.5">
        <p className="whitespace-nowrap text-xs leading-normal text-[rgba(51,51,51,0.8)]">
          {label}
        </p>
        <p className="font-[family-name:var(--font-mulish)] text-base font-medium leading-normal text-[#333]">
          {value}
          <span className="text-[10px] font-normal"> 人</span>
        </p>
      </div>
      <div className="absolute right-0 top-[13px] size-11 overflow-hidden">
        <EntrustImg
          src={teamAssets.memberIconGlow}
          alt=""
          width={44}
          height={44}
          className="absolute inset-[2.27%_0_0_2.27%] size-full max-w-none"
        />
        <div className="absolute inset-[9%] overflow-hidden">
          <EntrustImg
            src={icon}
            alt=""
            width={38}
            height={38}
            className={`absolute max-w-none ${crop}`}
          />
        </div>
      </div>
    </div>
  );
}
