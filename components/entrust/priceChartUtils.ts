export type PriceGranularity = "MINUTE" | "HOUR" | "DAY";

export const RANGE_TABS: { granularity: PriceGranularity; label: string }[] = [
  { granularity: "MINUTE", label: "15分钟" },
  { granularity: "HOUR", label: "1小时" },
  { granularity: "DAY", label: "1天" },
];

export const RANGE_DESC_MAP: Record<PriceGranularity, string> = {
  MINUTE: "分钟级走势",
  HOUR: "小时级走势",
  DAY: "日级走势",
};

export const XPRICE_OVERVIEW_CACHE_MS = 15 * 60 * 1000;

export function formatAxisTime(
  dateStr: unknown,
  granularity: PriceGranularity,
) {
  const s = dateStr != null ? String(dateStr).trim() : "";
  if (!s) return "";

  const d = new Date(s);
  if (Number.isNaN(d.getTime())) {
    return s.length > 12 ? `${s.slice(0, 10)}…` : s;
  }

  if (granularity === "MINUTE" || granularity === "HOUR") {
    return d.toLocaleTimeString("zh-CN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return d.toLocaleDateString("zh-CN", { month: "numeric", day: "numeric" });
}

export function mapOverviewToChart(
  rows: unknown,
  granularity: PriceGranularity,
) {
  if (!Array.isArray(rows)) return [];

  return rows.map((row, index) => {
    const record = row as { date?: string; price?: number };
    const time = formatAxisTime(record?.date, granularity);
    const p = Number(record?.price);
    return {
      time: time || `${index + 1}`,
      xPrice: Number.isFinite(p) ? p : 0,
    };
  });
}
