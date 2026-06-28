/** 预测市场 Tab / 分类 / 分页常量 */
export const WORLD_CUP_TABS = ["all", "holding", "history"] as const;
export type WorldCupTab = (typeof WORLD_CUP_TABS)[number];

export const WORLD_CUP_CATEGORIES = ["world_cup"] as const;
export type WorldCupCategory = (typeof WORLD_CUP_CATEGORIES)[number];

export const WORLD_CUP_PAGE_SIZE = 20;
