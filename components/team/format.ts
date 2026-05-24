export const TEAM_LOADING_LABEL = "...";

export function displayTeamValue(
  isPending: boolean | undefined,
  formatted: string,
): string {
  return isPending ? TEAM_LOADING_LABEL : formatted;
}

export function formatAmount(
  value: number | undefined | null,
  fractionDigits = 2,
): string {
  if (value == null || Number.isNaN(Number(value))) {
    return (0).toLocaleString("en-US", {
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    });
  }
  return Number(value).toLocaleString("en-US", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });
}

export function formatCount(value: number | undefined | null): string {
  if (value == null || Number.isNaN(Number(value))) return "0";
  return Number(value).toLocaleString("en-US");
}
