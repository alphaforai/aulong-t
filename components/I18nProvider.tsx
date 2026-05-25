"use client";

import { useEffect } from "react";
import { I18nextProvider } from "react-i18next";
import i18n from "@/lib/i18n/client";
import { useLocaleStore } from "@/lib/store/locale";

/** 将 Zustand 持久化的语言同步到 i18next */
export function I18nProvider({ children }: { children: React.ReactNode }) {
  const locale = useLocaleStore((state) => state.locale);

  useEffect(() => {
    if (i18n.language !== locale) {
      void i18n.changeLanguage(locale);
    }
  }, [locale]);

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
