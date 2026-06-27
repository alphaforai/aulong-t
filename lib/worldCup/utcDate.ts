/** API 返回的无时区日期时间按 UTC 解析 */
export function parseUtcApiDate(value: string): Date | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const normalized = trimmed.includes("T") ? trimmed : trimmed.replace(" ", "T");
  const withZone = /(?:Z|[+-]\d{2}:\d{2})$/i.test(normalized)
    ? normalized
    : `${normalized}Z`;
  const date = new Date(withZone);

  return Number.isNaN(date.getTime()) ? null : date;
}

/** 列表卡片开赛时间：MM-dd HH:mm(UTC) */
export function formatUtcMatchTime(value: string) {
  const date = parseUtcApiDate(value);
  if (!date) return "--";

  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  const hour = String(date.getUTCHours()).padStart(2, "0");
  const minute = String(date.getUTCMinutes()).padStart(2, "0");

  return `${month}-${day} ${hour}:${minute}(UTC)`;
}
