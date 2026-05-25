/** 团队页静态资源（public/assets/team） */
export const teamAssets = {
  levelAvatar: "/assets/team/vip/vip-0-avatar.png",
  vipBadge: "/assets/team/vip/vip-0-badge.png",
  rulesIcon: "/assets/team/rules-icon.svg",
  statIconGlow: "/assets/team/stat-icon-glow.png",
  statDivider: "/assets/team/stat-divider.png",
  statIconCommunity: "/assets/team/stat-icon-community.png",
  statIconReferral: "/assets/team/stat-icon-referral.png",
  statIconPersonal: "/assets/team/stat-icon-personal.png",
  performanceDeco: "/assets/team/performance-deco.png",
  subCardIconGlow: "/assets/team/sub-card-icon-glow.png",
  perfIconToday: "/assets/team/perf-icon-today.png",
  perfIconTeam: "/assets/team/perf-icon-team.png",
  memberIconGlow: "/assets/team/member-icon-glow.png",
  memberIconRegister: "/assets/team/member-icon-register.png",
  memberIconWhitelist: "/assets/team/member-icon-whitelist.png",
  memberIconNewWhitelist: "/assets/team/member-icon-new-whitelist.png",
  memberIconEntrust: "/assets/team/member-icon-entrust.png",
  detailArrow: "/assets/team/detail-arrow.svg",
  directBack: "/assets/team/direct-back.svg",
  directDivider: "/assets/team/direct-divider.svg",
  directVip1: "/assets/team/direct-vip1.png",
  directVip2: "/assets/team/direct-vip2.png",
} as const;

/** VIP 0–8 等级头像与徽章（Figma → public/assets/team/vip） */
const VIP_LEVEL_MAX = 8;

const vipAvatars: Record<number, string> = {
  0: "/assets/team/vip/vip-0-avatar.png",
  1: "/assets/team/vip/vip-1-avatar.png",
  2: "/assets/team/vip/vip-2-avatar.png",
  3: "/assets/team/vip/vip-3-avatar.png",
  4: "/assets/team/vip/vip-4-avatar.png",
  5: "/assets/team/vip/vip-5-avatar.png",
  6: "/assets/team/vip/vip-6-avatar.png",
  7: "/assets/team/vip/vip-7-avatar.png",
  8: "/assets/team/vip/vip-8-avatar.png",
};

const vipBadges: Record<number, string> = {
  0: "/assets/team/vip/vip-0-badge.png",
  1: "/assets/team/vip/vip-1-badge.png",
  2: "/assets/team/vip/vip-2-badge.png",
  3: "/assets/team/vip/vip-3-badge.png",
  4: "/assets/team/vip/vip-4-badge.png",
  5: "/assets/team/vip/vip-5-badge.png",
  6: "/assets/team/vip/vip-6-badge.png",
  7: "/assets/team/vip/vip-7-badge.png",
  8: "/assets/team/vip/vip-8-badge.png",
};

function clampVipLevel(vipLevel?: number) {
  const level = Math.floor(Number(vipLevel) || 0);
  return Math.min(VIP_LEVEL_MAX, Math.max(0, level));
}

export function getTeamVipAvatarSrc(vipLevel?: number) {
  return vipAvatars[clampVipLevel(vipLevel)];
}

export function getTeamVipBadgeSrc(vipLevel?: number) {
  return vipBadges[clampVipLevel(vipLevel)];
}
