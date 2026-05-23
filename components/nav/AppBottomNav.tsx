"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_TABS, type NavTabId } from "./assets";
import { NavIcon } from "./NavIcon";

function resolveActiveTab(pathname: string): NavTabId {
  if (pathname.startsWith("/earnings")) return "earnings";
  if (pathname.startsWith("/mine")) return "mine";
  if (pathname.startsWith("/team")) return "team";
  return "entrust";
}

const ACTIVE_PILL_CLASS =
  "absolute top-2 flex h-[60px] w-[92px] flex-col items-center justify-center gap-0.5 overflow-hidden rounded-full border border-white bg-linear-to-r from-[#ff4d00] via-[#ff3033] via-[53.846%] to-[#ff2d2d] p-2.5 shadow-[0_4px_6px_rgba(213,0,0,0.12),inset_0_-4px_4px_rgba(255,254,227,0.7),inset_0_8px_17px_#ffe5e5]";

const INACTIVE_ITEM_CLASS =
  "absolute top-2 flex size-[60px] flex-col items-center justify-center gap-0.5 p-3";

export function AppBottomNav() {
  const pathname = usePathname();
  const activeId = resolveActiveTab(pathname);
  const activeTab = NAV_TABS.find((tab) => tab.id === activeId) ?? NAV_TABS[0];
  const inactiveTabs = NAV_TABS.filter((tab) => tab.id !== activeId);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 flex justify-center px-3 pb-[max(env(safe-area-inset-bottom),12px)] md:absolute md:inset-x-0">
      <div className="relative h-[77px] w-full max-w-[351px] rounded-full border-[0.5px] border-white bg-white/80 shadow-[0_5px_9.2px_rgba(187,16,19,0.08)] backdrop-blur-[7px]">
        <Link
          href={activeTab.href}
          className={ACTIVE_PILL_CLASS}
          style={{ left: activeTab.pillLeft }}
          aria-current="page"
        >
          <NavIcon tab={activeTab.id} active />
          <span className="text-xs leading-[18px] text-white">{activeTab.label}</span>
        </Link>

        {inactiveTabs.map((tab) => (
          <Link
            key={tab.id}
            href={tab.href}
            className={INACTIVE_ITEM_CLASS}
            style={{ left: tab.inactiveLeft }}
          >
            <NavIcon tab={tab.id} />
            <span className="text-xs leading-[18px] text-[#9c8787]">{tab.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
