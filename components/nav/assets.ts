/** 底部导航静态资源（public/assets/nav） */
export const navAssets = {
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

export type NavTabId = "entrust" | "earnings" | "mine" | "team";

export type NavTabConfig = {
  id: NavTabId;
  href: string;
  label: string;
  pillLeft: number;
  inactiveLeft: number;
  inactiveIcon: string;
};

export const NAV_TABS: NavTabConfig[] = [
  {
    id: "entrust",
    href: "/entrust",
    label: "委托",
    pillLeft: 12,
    inactiveLeft: 28,
    inactiveIcon: navAssets.entrustInactive,
  },
  {
    id: "earnings",
    href: "/earnings",
    label: "收益",
    pillLeft: 88,
    inactiveLeft: 104,
    inactiveIcon: navAssets.earningsInactive,
  },
  {
    id: "mine",
    href: "/mine",
    label: "我的",
    pillLeft: 168,
    inactiveLeft: 184,
    inactiveIcon: navAssets.mineInactive,
  },
  {
    id: "team",
    href: "/team",
    label: "团队",
    pillLeft: 247,
    inactiveLeft: 263,
    inactiveIcon: navAssets.teamInactive,
  },
];
