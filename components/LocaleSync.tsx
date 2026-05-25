"use client";

import { useEffect } from "react";
import { getHtmlLang } from "@/lib/local";
import { useLocaleStore } from "@/lib/store/locale";

/** 将 Zustand 中的语言同步到 document.documentElement.lang */
export function LocaleSync() {
  const locale = useLocaleStore((state) => state.locale);

  useEffect(() => {
    document.documentElement.lang = getHtmlLang(locale);
  }, [locale]);

  return null;
}
