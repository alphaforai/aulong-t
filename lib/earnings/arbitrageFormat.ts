const TX_CURRENCY = "USDT";

export function formatCloseTime(value?: string | null) {
  if (!value) return "—";
  const seconds = Number(value);
  if (!Number.isFinite(seconds)) return "—";
  const date = new Date(seconds * 1000);
  if (Number.isNaN(date.getTime())) return "—";
  const h = String(date.getHours()).padStart(2, "0");
  const m = String(date.getMinutes()).padStart(2, "0");
  const s = String(date.getSeconds()).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

export function formatFullDateTime(value?: string | null) {
  if (!value) return "—";
  const seconds = Number(value);
  if (!Number.isFinite(seconds)) return "—";
  const date = new Date(seconds * 1000);
  if (Number.isNaN(date.getTime())) return "—";
  const y = date.getFullYear();
  const mo = date.getMonth() + 1;
  const d = date.getDate();
  const h = String(date.getHours()).padStart(2, "0");
  const m = String(date.getMinutes()).padStart(2, "0");
  const s = String(date.getSeconds()).padStart(2, "0");
  return `${y}-${mo}-${d} ${h}:${m}:${s}`;
}

export function formatPlatformName(value?: string | null) {
  if (!value || typeof value !== "string") return "—";
  return value
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

export function formatProfitAmount(value?: number | null) {
  if (value == null || Number.isNaN(Number(value))) return "+0";
  const amount = Number(value);
  const sign = amount >= 0 ? "+" : "-";
  const formatted = Math.abs(amount).toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 8,
  });
  return `${sign}${formatted}`;
}

export function formatProfitRate(value?: number | null) {
  if (value == null || Number.isNaN(Number(value))) return "+0%";
  const percent = Number(value) * 100;
  const sign = percent >= 0 ? "+" : "";
  const abs = Math.abs(percent);
  const maxDigits = abs < 0.1 ? 4 : abs < 10 ? 2 : 3;
  const formatted = percent.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: maxDigits,
  });
  return `${sign}${formatted}%`;
}

export function formatSpreadRate(value?: number | null) {
  if (value == null || Number.isNaN(Number(value))) return "+0%";
  const percent = Number(value) * 100;
  const sign = percent >= 0 ? "+" : "";
  const formatted = percent.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 5,
  });
  return `${sign}${formatted}%`;
}

export function formatChainLabel(chain?: string | null) {
  if (!chain) return "—";
  return chain.toUpperCase();
}

export function formatTradingPair(tokenSymbol?: string | null) {
  if (!tokenSymbol) return "—";
  return `${tokenSymbol.toUpperCase()}/${TX_CURRENCY}`;
}

export function formatDecimalValue(
  value?: number | null,
  maxFractionDigits = 8,
) {
  if (value == null || Number.isNaN(Number(value))) return "0";
  return Number(value).toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: maxFractionDigits,
  });
}

export function shortMiddleText(
  value?: string | null,
  head = 12,
  tail = 8,
) {
  if (!value || typeof value !== "string") return "—";
  const text = value.trim();
  if (text.length <= head + tail + 1) return text;
  return `${text.slice(0, head)}…${text.slice(-tail)}`;
}

export function formatDurationParts(openTime?: string | null, closeTime?: string | null) {
  const open = Number(openTime);
  const close = Number(closeTime);
  if (!Number.isFinite(open) || !Number.isFinite(close)) {
    return { hours: 0, minutes: 0, seconds: 0 };
  }
  const total = Math.max(0, Math.trunc(close - open));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  return { hours, minutes, seconds };
}

export { TX_CURRENCY };
