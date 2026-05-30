"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AppImage } from "@/components/AppImage";
import { useTranslation } from "@/lib/hooks/useTranslation";

/** 底部导航静态资源（public/assets/nav） */
const navAssets = {
  entrustInactive: "/assets/nav/entrust-inactive.svg",
  entrustActive: "/assets/nav/entrust-active.png",
  earningsInactive: "/assets/nav/earnings-inactive.svg",
  earningsActiveBottom: "/assets/nav/earnings-active-bottom.png",
  earningsActiveTop: "/assets/nav/earnings-active-top.svg",
  mineInactive: "/assets/nav/mine-inactive.svg",
  mineActive: "/assets/nav/mine-active.png",
  teamInactive: "/assets/nav/team-inactive.svg",
  teamActive: "/assets/nav/team-active.png",
} as const;

type NavTabId = "entrust" | "earnings" | "mine" | "team";

type NavTabConfig = {
  id: NavTabId;
  href: string;
  labelKey: string;
  pillLeft: number;
  inactiveLeft: number;
};

const NAV_TABS: NavTabConfig[] = [
  {
    id: "entrust",
    href: "/",
    labelKey: "nav.entrust",
    pillLeft: 12,
    inactiveLeft: 28,
  },
  {
    id: "earnings",
    href: "/earnings",
    labelKey: "nav.earnings",
    pillLeft: 88,
    inactiveLeft: 104,
  },
  {
    id: "mine",
    href: "/mine",
    labelKey: "nav.mine",
    pillLeft: 168,
    inactiveLeft: 184,
  },
  {
    id: "team",
    href: "/team",
    labelKey: "nav.team",
    pillLeft: 247,
    inactiveLeft: 263,
  },
];

const NAV_INACTIVE: Record<NavTabId, string> = {
  entrust: navAssets.entrustInactive,
  earnings: navAssets.earningsInactive,
  mine: navAssets.mineInactive,
  team: navAssets.teamInactive,
};

function resolveActiveTab(pathname: string): NavTabId {
  if (pathname.startsWith("/earnings")) return "earnings";
  if (pathname.startsWith("/mine")) return "mine";
  if (pathname.startsWith("/team")) return "team";
  if (pathname === "/" || pathname.startsWith("/entrust")) return "entrust";
  return "entrust";
}

const ACTIVE_PILL_CLASS =
  "absolute top-2 flex h-[60px] w-[92px] flex-col items-center justify-center gap-0.5 overflow-hidden rounded-full border border-white bg-gradient-to-r from-[#ff4d00] via-[#ff3033] via-[53.846%] to-[#ff2d2d] p-2.5 shadow-[0_4px_6px_rgba(213,0,0,0.12),inset_0_-4px_4px_rgba(255,254,227,0.7),inset_0_8px_17px_#ffe5e5]";

const INACTIVE_ITEM_CLASS =
  "absolute top-2 flex size-[60px] flex-col items-center justify-center gap-0.5 p-3";

function NavIcon({ tab, active = false }: { tab: NavTabId; active?: boolean }) {
  if (!active) {
    return (
      <AppImage
        src={NAV_INACTIVE[tab]}
        alt=""
        width={24}
        height={24}
        className="size-6 shrink-0"
      />
    );
  }

  switch (tab) {
    case "earnings":
      return (
        <div className="relative size-6 shrink-0 overflow-hidden">
          <AppImage
            src={navAssets.earningsActiveBottom}
            alt=""
            width={24}
            height={24}
            className="absolute inset-0 size-full max-w-none object-contain"
          />
          <AppImage
            src={navAssets.earningsActiveTop}
            alt=""
            width={24}
            height={24}
            className="absolute inset-0 size-full max-w-none object-contain"
          />
        </div>
      );
    case "entrust":
      return (
        <div className="relative size-6 shrink-0 overflow-hidden">
          <AppImage
            src={navAssets.entrustActive}
            alt=""
            width={29}
            height={28}
            className="absolute max-w-none"
            style={{
              height: "114.58%",
              width: "120.83%",
              left: "6.5%",
              top: "9.33%",
            }}
          />
        </div>
      );
    case "mine":
      return (
        <AppImage
          src={navAssets.mineActive}
          alt=""
          width={24}
          height={24}
          className="size-6 shrink-0 object-contain"
        />
      );
    case "team":
      return (
        <AppImage
          src={navAssets.teamActive}
          alt=""
          width={24}
          height={24}
          className="size-6 shrink-0 object-contain"
        />
      );
    default:
      return null;
  }
}

/** 统一底部导航 */
export default function AulongFooterNav() {
  const { t } = useTranslation();
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
          <span className="text-xs font-extrabold leading-[18px] text-white">
            {t(activeTab.labelKey)}
          </span>
        </Link>

        {inactiveTabs.map((tab) => (
          <Link
            key={tab.id}
            href={tab.href}
            className={INACTIVE_ITEM_CLASS}
            style={{ left: tab.inactiveLeft }}
          >
            <NavIcon tab={tab.id} />
            <span className="text-xs font-extrabold leading-[18px] text-[#9c8787]">
              {t(tab.labelKey)}
            </span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
