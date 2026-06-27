import { format } from "date-fns";

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
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--";
  return format(date, "yyyy-MM-dd HH:mm");
}
