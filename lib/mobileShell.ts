/** 与 AulongPageShell 一致：移动端全宽，md+ 居中 375px 面板 */

export const shellMaxWidth = "max-w-[430px]";
export const shellMdHeight = "md:max-h-[calc(100dvh-4rem)]";
export const shellMdPaddingY = "md:py-8";

/** 底部抽屉根节点（钱包、邀请码、邀请好友等） */
export const bottomSheetOverlayRoot = [
  "fixed inset-0 z-65 flex flex-col justify-end",
  shellMdPaddingY,
  "md:items-center",
].join(" ");

/** 抽屉内容区：限制宽度与高度，遮罩与 sheet 均在此容器内 */
export const bottomSheetOverlayFrame = [
  "relative flex w-full min-h-0 flex-1 flex-col justify-end",
  "md:mx-auto md:w-full",
  shellMaxWidth,
  shellMdHeight,
].join(" ");

/** 侧滑全屏页根节点（直推详情等） */
export const sidePanelOverlayRoot = [
  "fixed inset-0 overflow-hidden",
  shellMdPaddingY,
  "md:flex md:justify-center",
].join(" ");

/** 侧滑面板外框 */
export const sidePanelOverlayFrame = [
  "relative h-full w-full",
  "md:mx-auto md:w-full",
  shellMaxWidth,
  shellMdHeight,
  "md:overflow-hidden md:rounded-2xl md:shadow-[0_4px_32px_rgba(0,0,0,0.08)]",
].join(" ");
