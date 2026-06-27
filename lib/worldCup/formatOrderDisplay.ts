import { formatDateTime, type Locale } from "@/lib/local";

const WORLD_CUP_LOCALE: Locale = "en_US";

export function formatOrderAmount(value: number) {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

export function formatSignedOrderAmount(value: number) {
  if (value < 0) return `-${formatOrderAmount(value)}`;
  return formatOrderAmount(value);
}

export function formatOrderDateTime(value?: string) {
  if (!value) return "--";
  const formatted = formatDateTime(WORLD_CUP_LOCALE, value, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
  return formatted || "--";
}
