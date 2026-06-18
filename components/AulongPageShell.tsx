import type { ReactNode } from "react";
import AulongHeader from "@/components/AulongHeader";
import AulongFooterNav from "@/components/AulongFooterNav";
import { WhitelistGate } from "@/components/WhitelistGate";

type AulongPageShellProps = {
  children: ReactNode;
  /** 内层面板背景色 */
  panelClassName?: string;
  mainClassName?: string;
};

/** 统一页面外壳：顶栏 + 主内容 + 底栏 */
export function AulongPageShell({
  children,
  panelClassName = "bg-[#f8f8f8]",
  mainClassName = "",
}: AulongPageShellProps) {
  return (
    <div className="min-h-dvh w-full md:py-8">
      <div
        className={`relative mx-auto flex min-h-dvh w-full max-w-[430px] flex-col overflow-x-hidden md:min-h-[calc(100dvh-4rem)] md:overflow-hidden md:rounded-2xl md:shadow-[0_4px_32px_rgba(0,0,0,0.08)] ${panelClassName}`}
      >
        <div className="relative z-[70] h-11 shrink-0" aria-hidden />
        <div className="relative z-[70]">
          <AulongHeader />
        </div>
        {/* 未购白名单时遮挡主内容与底栏；顶栏仍可连接/断开钱包 */}
        <WhitelistGate>
          <main
            className={`mt-3 flex w-full min-w-0 flex-1 flex-col gap-3 px-3 pb-[100px] ${mainClassName}`}
          >
            {children}
          </main>
          <AulongFooterNav />
        </WhitelistGate>
      </div>
    </div>
  );
}
