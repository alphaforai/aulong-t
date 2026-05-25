"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  DEFAULT_LOCALE,
  formatDateTime,
  formatNumber,
  formatPercent,
  formatRelativeTime,
  translate,
  type Locale,
} from "@/lib/local";
import { useLocaleStore } from "@/lib/store/locale";

/** 首屏与 SSR 对齐默认语言，hydration 后再用 persist 中的 locale */
function useHydratedLocale(): Locale {
  const locale = useLocaleStore((state) => state.locale);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setHydrated(true);
  }, []);
  return hydrated ? locale : DEFAULT_LOCALE;
}

/**
 * React 侧 i18n / l10n 钩子（基于 i18next）
 * @example const { t } = useTranslation(); t("nav.entrust")
 */
export function useTranslation() {
  const locale = useHydratedLocale();
  const setLocale = useLocaleStore((state) => state.setLocale);
  const toggleLocale = useLocaleStore((state) => state.toggleLocale);

  /** 与 SSR 一致：走 translate，避免 i18next 异步 init 导致插值/语言首屏不一致 */
  const t = useCallback(
    (key: string, params?: Record<string, string | number>) =>
      translate(locale, key, params),
    [locale],
  );

  const l10n = useMemo(
    () => ({
      number: (value: number, options?: Intl.NumberFormatOptions) =>
        formatNumber(locale, value, options),
      dateTime: (
        value: Date | number | string,
        options?: Intl.DateTimeFormatOptions,
      ) => formatDateTime(locale, value, options),
      relativeTime: (
        value: number,
        unit: Intl.RelativeTimeFormatUnit,
        options?: Intl.RelativeTimeFormatOptions,
      ) => formatRelativeTime(locale, value, unit, options),
      percent: (value: number, options?: Intl.NumberFormatOptions) =>
        formatPercent(locale, value, options),
    }),
    [locale],
  );

  return {
    locale,
    setLocale,
    toggleLocale,
    t,
    l10n,
  };
}

export type { Locale };
