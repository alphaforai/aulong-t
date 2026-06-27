/** 提取世界杯相关接口错误文案（优先使用后端 msg） */
export function getWorldCupErrorMessage(
  error: unknown,
  fallback: string,
): string {
  if (error instanceof Error) {
    const message = error.message?.trim();
    if (message) return message;
  }

  if (typeof error === "object" && error !== null) {
    const payload = error as { msg?: string; message?: string };
    const message = payload.msg?.trim() || payload.message?.trim();
    if (message) return message;
  }

  return fallback;
}
