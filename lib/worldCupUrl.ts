/** 世界杯预测 H5 入口（同源路径或完整 URL） */
export function getWorldCupUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_WORLD_CUP_URL?.trim();
  if (fromEnv) return fromEnv;
  return "/world-cup";
}
