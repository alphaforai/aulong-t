import { formatDateTime } from "@/lib/local";

/** 与 useWorldCupTranslation 一致 */
export const WORLD_CUP_LOCALE = "en_US" as const;

export type OrderWinStatus = "WIN" | "LOSE" | "CANCELLED" | "UNSETTLED";

export function formatUsdtAmount(value: number) {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

export function formatAulAmount(value: number) {
  return Math.abs(value).toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 4,
  });
}

export function formatSignedAulAmount(value: number) {
  if (value < 0) return `-${formatAulAmount(value)}`;
  return formatAulAmount(value);
}

export function formatOrderDateTime(value?: string) {
  if (!value) return "-";
  const normalized = value.includes("T") ? value : value.replace(" ", "T");
  const formatted = formatDateTime(WORLD_CUP_LOCALE, normalized, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  return formatted || value;
}

/** 兼容 WIN/LOSE/CANCELLED 与历史 1/0 */
export function resolveOrderWinStatus(win: string | null | undefined): OrderWinStatus {
  if (win == null || win === "") return "UNSETTLED";
  const upper = win.toUpperCase();
  if (upper === "WIN" || win === "1") return "WIN";
  if (upper === "LOSE" || win === "0") return "LOSE";
  if (upper === "CANCELLED") return "CANCELLED";
  return "UNSETTLED";
}

export function resolveWinBadgeClass(status: OrderWinStatus) {
  switch (status) {
    case "WIN":
      return "bg-[#ecfdf3] text-[#16a855]";
    case "LOSE":
      return "bg-[#fff1f2] text-[#e84040]";
    case "CANCELLED":
      return "bg-[#fff7ed] text-[#d97706]";
    default:
      return "bg-[#f3f4f6] text-[#707070]";
  }
}

export function resolveProfitTone(value: number) {
  if (value > 0) return "text-[#16a855]";
  if (value < 0) return "text-[#e84040]";
  return "text-[#707070]";
}
