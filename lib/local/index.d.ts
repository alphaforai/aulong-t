export type Locale = "zh-CN" | "en";

export const DEFAULT_LOCALE: Locale;
export const SUPPORTED_LOCALES: readonly Locale[];
export const LOCALE_CONFIG: Record<
  Locale,
  { labelKey: string; bcp47: string; messages: Record<string, unknown> }
>;

export function isSupportedLocale(locale: string): locale is Locale;
export function normalizeLocale(locale?: string): Locale;
export function getBcp47Tag(locale?: string): string;
export function getHtmlLang(locale?: string): string;
export function translate(
  locale: Locale,
  key: string,
  params?: Record<string, string | number>,
): string;
export const t: typeof translate;
export function formatNumber(
  locale: Locale,
  value: number,
  options?: Intl.NumberFormatOptions,
): string;
export function formatDateTime(
  locale: Locale,
  value: Date | number | string,
  options?: Intl.DateTimeFormatOptions,
): string;
export function formatRelativeTime(
  locale: Locale,
  value: number,
  unit: Intl.RelativeTimeFormatUnit,
  options?: Intl.RelativeTimeFormatOptions,
): string;
export function formatPercent(
  locale: Locale,
  value: number,
  options?: Intl.NumberFormatOptions,
): string;
