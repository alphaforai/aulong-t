import cnMessages from "./json/cn.json";
import enMessages from "./json/en.json";

/** 默认语言：简体中文 */
export const DEFAULT_LOCALE = "zh-CN";

/** 支持的语言列表 */
export const SUPPORTED_LOCALES = ["zh-CN", "en"];

/** @type {Record<string, { labelKey: string; bcp47: string; messages: Record<string, unknown> }>} */
export const LOCALE_CONFIG = {
  "zh-CN": {
    labelKey: "locale.zhCN",
    bcp47: "zh-CN",
    messages: cnMessages,
  },
  en: {
    labelKey: "locale.en",
    bcp47: "en",
    messages: enMessages,
  },
};

/**
 * @param {string} locale
 * @returns {boolean}
 */
export function isSupportedLocale(locale) {
  return SUPPORTED_LOCALES.includes(locale);
}

/**
 * @param {string} [locale]
 * @returns {string}
 */
export function normalizeLocale(locale) {
  return isSupportedLocale(locale) ? locale : DEFAULT_LOCALE;
}

/**
 * @param {string} [locale]
 * @returns {string}
 */
export function getBcp47Tag(locale) {
  return LOCALE_CONFIG[normalizeLocale(locale)]?.bcp47 ?? "zh-CN";
}

/**
 * @param {string} [locale]
 * @returns {string}
 */
export function getHtmlLang(locale) {
  const normalized = normalizeLocale(locale);
  return normalized === "zh-CN" ? "zh-CN" : "en";
}

/**
 * @param {Record<string, unknown>} messages
 * @param {string} key 点分路径，如 common.loading
 * @returns {string | undefined}
 */
function getMessageByPath(messages, key) {
  if (!key) return undefined;
  return key.split(".").reduce((acc, part) => {
    if (acc == null || typeof acc !== "object") return undefined;
    return /** @type {Record<string, unknown>} */ (acc)[part];
  }, messages);
}

/**
 * i18n：按 key 取文案，支持 {name} 占位符
 * @param {string} locale
 * @param {string} key
 * @param {Record<string, string | number>} [params]
 * @returns {string}
 */
export function translate(locale, key, params) {
  const normalized = normalizeLocale(locale);
  const messages = LOCALE_CONFIG[normalized]?.messages;
  const fallbackMessages = LOCALE_CONFIG[DEFAULT_LOCALE].messages;

  let text = getMessageByPath(messages, key);
  if (text == null) {
    text = getMessageByPath(fallbackMessages, key);
  }
  if (text == null) {
    return key;
  }
  if (typeof text !== "string") {
    return key;
  }

  if (!params) return text;

  return Object.entries(params).reduce((result, [name, value]) => {
    return result.replaceAll(`{${name}}`, String(value));
  }, text);
}

/** @param {string} locale @param {string} key @param {Record<string, string | number>} [params] */
export const t = translate;

/**
 * l10n：数字格式化
 * @param {string} locale
 * @param {number} value
 * @param {Intl.NumberFormatOptions} [options]
 */
export function formatNumber(locale, value, options) {
  return new Intl.NumberFormat(getBcp47Tag(locale), options).format(value);
}

/**
 * l10n：日期时间格式化
 * @param {string} locale
 * @param {Date | number | string} value
 * @param {Intl.DateTimeFormatOptions} [options]
 */
export function formatDateTime(locale, value, options) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(getBcp47Tag(locale), options).format(date);
}

/**
 * l10n：相对时间（如 3 天前）
 * @param {string} locale
 * @param {number} value
 * @param {Intl.RelativeTimeFormatUnit} unit
 * @param {Intl.RelativeTimeFormatOptions} [options]
 */
export function formatRelativeTime(locale, value, unit, options) {
  return new Intl.RelativeTimeFormat(getBcp47Tag(locale), {
    numeric: "auto",
    ...options,
  }).format(value, unit);
}

/**
 * l10n：百分比
 * @param {string} locale
 * @param {number} value 0.1234 表示 12.34%
 * @param {Intl.NumberFormatOptions} [options]
 */
export function formatPercent(locale, value, options) {
  return new Intl.NumberFormat(getBcp47Tag(locale), {
    style: "percent",
    maximumFractionDigits: 2,
    ...options,
  }).format(value);
}
