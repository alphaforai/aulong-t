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

/** 顶栏语言下拉 — 顺序与文案对齐 Figma 806:573 */
export const LOCALE_PICKER_OPTIONS = [
  { code: "zh_CN" as const, pickerLabel: "中文", flagIcon: "/assets/locale/flag-zh_CN.svg" },
  { code: "en_US" as const, pickerLabel: "English", flagIcon: "/assets/locale/flag-en_US.svg" },
  { code: "ja_JP" as const, pickerLabel: "日本語", flagIcon: "/assets/locale/flag-ja_JP.svg" },
  { code: "ko_KR" as const, pickerLabel: "한국어", flagIcon: "/assets/locale/flag-ko_KR.svg" },
  { code: "vi_VN" as const, pickerLabel: "Việt", flagIcon: "/assets/locale/flag-vi_VN.svg" },
  { code: "ms_MY" as const, pickerLabel: "Melayu", flagIcon: "/assets/locale/flag-ms_MY.svg" },
] satisfies ReadonlyArray<{
  code: Locale;
  pickerLabel: string;
  flagIcon: string;
}>;

export const localePickerCheckIcon = "/assets/locale/check.svg";

/** 非默认语言时顶栏语言按钮使用深色样式 */
export function isAlternateLocaleHeaderStyle(locale: Locale): boolean {
  return locale !== "zh_CN";
}
