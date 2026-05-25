export type PriceGranularity = "MINUTE" | "HOUR" | "DAY";

export const XPRICE_OVERVIEW_CACHE_MS = 15 * 60 * 1000;

export function formatAxisTime(
  dateStr: unknown,
  granularity: PriceGranularity,
  bcp47: string,
) {
  const s = dateStr != null ? String(dateStr).trim() : "";
  if (!s) return "";

  const d = new Date(s);
  if (Number.isNaN(d.getTime())) {
    return s.length > 12 ? `${s.slice(0, 10)}…` : s;
  }

  if (granularity === "MINUTE" || granularity === "HOUR") {
    return d.toLocaleTimeString(bcp47, {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return d.toLocaleDateString(bcp47, { month: "numeric", day: "numeric" });
}

export function mapOverviewToChart(
  rows: unknown,
  granularity: PriceGranularity,
  bcp47: string,
) {
  if (!Array.isArray(rows)) return [];

  return rows.map((row, index) => {
    const record = row as { date?: string; price?: number };
    const time = formatAxisTime(record?.date, granularity, bcp47);
    const p = Number(record?.price);
    return {
      time: time || `${index + 1}`,
      xPrice: Number.isFinite(p) ? p : 0,
    };
  });
}
