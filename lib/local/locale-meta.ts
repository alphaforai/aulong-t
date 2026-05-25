import type { Locale } from "./index";

export type LocaleOption = {
  code: Locale;
  /** 该语言下的自称，如「简体中文」 */
  nativeLabel: string;
  /** 英文描述，如 Simplified Chinese */
  englishLabel: string;
};

/** 与后端 LocaleEnum 对齐 */
export const LOCALE_OPTIONS: readonly LocaleOption[] = [
  { code: "zh_CN", nativeLabel: "简体中文", englishLabel: "Simplified Chinese" },
  { code: "en_US", nativeLabel: "English", englishLabel: "English" },
  { code: "ko_KR", nativeLabel: "한국어", englishLabel: "Korean" },
  { code: "vi_VN", nativeLabel: "Tiếng Việt", englishLabel: "Vietnamese" },
  { code: "ja_JP", nativeLabel: "日本語", englishLabel: "Japanese" },
  { code: "ms_MY", nativeLabel: "Bahasa Melayu", englishLabel: "Malay" },
] as const;

export function getLocaleOption(code: Locale): LocaleOption {
  return LOCALE_OPTIONS.find((o) => o.code === code) ?? LOCALE_OPTIONS[0];
}

/** 非默认语言时顶栏语言按钮使用深色样式 */
export function isAlternateLocaleHeaderStyle(locale: Locale): boolean {
  return locale !== "zh_CN";
}
