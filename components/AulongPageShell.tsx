import type { ReactNode } from "react";
import AulongHeader from "@/components/AulongHeader";
import AulongFooterNav from "@/components/AulongFooterNav";

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
    <div className="min-h-screen w-full md:py-8">
      <div
        className={`relative mx-auto flex min-h-screen w-full max-w-[430px] flex-col overflow-x-hidden md:min-h-[calc(100vh-4rem)] md:overflow-hidden md:rounded-2xl md:shadow-[0_4px_32px_rgba(0,0,0,0.08)] ${panelClassName}`}
      >
        <div className="h-11 shrink-0" aria-hidden />
        <AulongHeader />
        <main
          className={`mt-3 flex w-full min-w-0 flex-1 flex-col gap-3 px-3 pb-[100px] ${mainClassName}`}
        >
          {children}
        </main>
        <AulongFooterNav />
      </div>
    </div>
  );
}
