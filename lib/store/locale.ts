import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  DEFAULT_LOCALE,
  getHtmlLang,
  getNextLocale,
  isSupportedLocale,
  migrateLegacyLocale,
  type Locale,
} from "@/lib/local";

type LocaleState = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  /** 按支持列表顺序循环切换（保留兼容） */
  toggleLocale: () => void;
};

function syncDocumentLocale(locale: Locale) {
  if (typeof document === "undefined") return;
  document.documentElement.lang = getHtmlLang(locale);
}

export const useLocaleStore = create<LocaleState>()(
  persist(
    (set, get) => ({
      locale: DEFAULT_LOCALE,
      setLocale: (locale) => {
        if (!isSupportedLocale(locale)) return;
        syncDocumentLocale(locale);
        set({ locale });
      },
      toggleLocale: () => {
        const next = getNextLocale(get().locale);
        syncDocumentLocale(next);
        set({ locale: next });
      },
    }),
    {
      name: "aulong-locale",
      version: 1,
      migrate: (persisted) => {
        const state = persisted as { locale?: unknown } | undefined;
        if (!state) return { locale: DEFAULT_LOCALE };
        return { locale: migrateLegacyLocale(state.locale) };
      },
    },
  ),
);
