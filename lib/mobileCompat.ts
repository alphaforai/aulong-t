/**
 * Android 9 / Chrome 69–74 兼容样式常量。
 * 避免：flex/grid gap、dvh/svh、backdrop-blur、CSS max()、min()/clamp() 等。
 */

/** 底部安全区内边距：固定 16px，iOS 在 globals.css 中 @supports 增强 */
export const safeBottomPad = "pb-4";

/** 抽屉/筛选 sheet 最大高度（用 vh 替代 dvh） */
export const sheetMaxHeight = "max-h-[85vh]";

/** 毛玻璃卡片 → 实色半透明底（无 backdrop-blur） */
export const glassCard =
  "rounded-[12px] bg-[rgba(255,255,255,0.95)] p-3 shadow-[0_5px_10px_rgba(51,51,51,0.08)]";

/** 纵向堆叠间距（space-y 基于 margin，兼容旧 WebView） */
export const stackY10 = "flex flex-col space-y-[10px]";
export const stackY4 = "flex flex-col space-y-4";
export const stackY2 = "flex flex-col space-y-2";
export const stackY1_5 = "flex flex-col space-y-1.5";

/** 横向间距 */
export const rowX4 = "flex items-center space-x-4";
export const rowX3 = "flex items-center space-x-3";
export const rowX1 = "inline-flex items-center space-x-1";

/** 只读列表行：不可点击、无 tap 高亮 */
export const recordRowStatic =
  "pointer-events-none cursor-default select-none touch-manipulation [-webkit-tap-highlight-color:transparent] [&_*]:pointer-events-none";

/** 列表平滑滚动降级 */
export function scrollToTop(el: HTMLElement | null | undefined) {
  if (!el) return;
  try {
    el.scrollTo({ top: 0, behavior: "smooth" });
  } catch {
    el.scrollTop = 0;
  }
}
