import zh_CN from "./json/zh_CN.json";
import en_US from "./json/en_US.json";
import ko_KR from "./json/ko_KR.json";
import vi_VN from "./json/vi_VN.json";
import ja_JP from "./json/ja_JP.json";
import ms_MY from "./json/ms_MY.json";

/** 默认语言：简体中文 */
export const DEFAULT_LOCALE = "zh_CN" as const;

export type Locale =
  | "zh_CN"
  | "en_US"
  | "ko_KR"
  | "vi_VN"
  | "ja_JP"
  | "ms_MY";

export const SUPPORTED_LOCALES: readonly Locale[] = [
  "zh_CN",
  "en_US",
  "ko_KR",
  "vi_VN",
  "ja_JP",
  "ms_MY",
];

const LEGACY_LOCALE_MAP: Record<string, Locale> = {
  "zh-CN": "zh_CN",
  zh: "zh_CN",
  en: "en_US",
};

export const LOCALE_CONFIG: Record<
  Locale,
  { labelKey: string; bcp47: string; messages: Record<string, unknown> }
> = {
  zh_CN: {
    labelKey: "locale.zh_CN",
    bcp47: "zh-CN",
    messages: zh_CN,
  },
  en_US: {
    labelKey: "locale.en_US",
    bcp47: "en-US",
    messages: en_US,
  },
  ko_KR: {
    labelKey: "locale.ko_KR",
    bcp47: "ko-KR",
    messages: ko_KR,
  },
  vi_VN: {
    labelKey: "locale.vi_VN",
    bcp47: "vi-VN",
    messages: vi_VN,
  },
  ja_JP: {
    labelKey: "locale.ja_JP",
    bcp47: "ja-JP",
    messages: ja_JP,
  },
  ms_MY: {
    labelKey: "locale.ms_MY",
    bcp47: "ms-MY",
    messages: ms_MY,
  },
};

export function isSupportedLocale(locale: string): locale is Locale {
  return (SUPPORTED_LOCALES as readonly string[]).includes(locale);
}

export function migrateLegacyLocale(locale: unknown): Locale {
  if (typeof locale !== "string") return DEFAULT_LOCALE;
  if (isSupportedLocale(locale)) return locale;
  return LEGACY_LOCALE_MAP[locale] ?? DEFAULT_LOCALE;
}

export function normalizeLocale(locale?: string): Locale {
  if (!locale) return DEFAULT_LOCALE;
  if (isSupportedLocale(locale)) return locale;
  return migrateLegacyLocale(locale);
}

export function getBcp47Tag(locale?: string): string {
  return LOCALE_CONFIG[normalizeLocale(locale)]?.bcp47 ?? "zh-CN";
}

export function getHtmlLang(locale?: string): string {
  return getBcp47Tag(locale);
}

function getMessageByPath(
  messages: Record<string, unknown>,
  key: string,
): string | undefined {
  if (!key) return undefined;
  const value = key.split(".").reduce<unknown>((acc, part) => {
    if (acc == null || typeof acc !== "object") return undefined;
    return (acc as Record<string, unknown>)[part];
  }, messages);
  return typeof value === "string" ? value : undefined;
}

export function translate(
  locale: Locale,
  key: string,
  params?: Record<string, string | number>,
): string {
  const normalized = normalizeLocale(locale);
  const messages = LOCALE_CONFIG[normalized]?.messages;
  const fallbackMessages = LOCALE_CONFIG[DEFAULT_LOCALE].messages;

  let text = getMessageByPath(messages, key);
  if (text == null) {
    text = getMessageByPath(fallbackMessages, key);
  }
  if (text == null) return key;

  if (!params) return text;

  return Object.entries(params).reduce(
    (result, [name, value]) =>
      result.replaceAll(`{${name}}`, String(value)),
    text,
  );
}

export const t = translate;

export function formatNumber(
  locale: Locale,
  value: number,
  options?: Intl.NumberFormatOptions,
): string {
  return new Intl.NumberFormat(getBcp47Tag(locale), options).format(value);
}

export function formatDateTime(
  locale: Locale,
  value: Date | number | string,
  options?: Intl.DateTimeFormatOptions,
): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(getBcp47Tag(locale), options).format(date);
}

export function formatRelativeTime(
  locale: Locale,
  value: number,
  unit: Intl.RelativeTimeFormatUnit,
  options?: Intl.RelativeTimeFormatOptions,
): string {
  return new Intl.RelativeTimeFormat(getBcp47Tag(locale), {
    numeric: "auto",
    ...options,
  }).format(value, unit);
}

export function formatPercent(
  locale: Locale,
  value: number,
  options?: Intl.NumberFormatOptions,
): string {
  return new Intl.NumberFormat(getBcp47Tag(locale), {
    style: "percent",
    maximumFractionDigits: 2,
    ...options,
  }).format(value);
}

export function getNextLocale(current: Locale): Locale {
  const index = SUPPORTED_LOCALES.indexOf(current);
  const next = (index + 1) % SUPPORTED_LOCALES.length;
  return SUPPORTED_LOCALES[next] ?? DEFAULT_LOCALE;
}
