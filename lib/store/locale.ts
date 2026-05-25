import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  DEFAULT_LOCALE,
  getHtmlLang,
  isSupportedLocale,
  type Locale,
} from "@/lib/local";

type LocaleState = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
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
        const next = get().locale === "zh-CN" ? "en" : "zh-CN";
        syncDocumentLocale(next);
        set({ locale: next });
      },
    }),
    {
      name: "aulong-locale",
      // lang 仅在 LocaleSync 的 useEffect 中写入，避免 rehydrate 早于 hydration 导致 <html lang> 不一致
    },
  ),
);
