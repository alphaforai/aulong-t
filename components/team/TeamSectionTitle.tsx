import type { ReactNode } from "react";

type TeamSectionTitleProps = {
  title: string;
  action?: ReactNode;
};

/** 章节标题 — 左侧红色竖条 + 文案 */
export function TeamSectionTitle({ title, action }: TeamSectionTitleProps) {
  return (
    <div className="flex w-full items-center justify-between gap-2">
      <div className="flex min-w-0 items-center gap-1.5">
        <div
          className="h-[15px] w-[5px] shrink-0 rounded-[1px] bg-gradient-to-b from-[#ff3033] to-[#c60303]"
          aria-hidden
        />
        <h2 className="text-lg font-medium leading-normal text-[#333]">
          {title}
        </h2>
      </div>
      {action}
    </div>
  );
}
