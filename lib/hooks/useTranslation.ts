"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation as useI18nextTranslation } from "react-i18next";
import {
  DEFAULT_LOCALE,
  formatDateTime,
  formatNumber,
  formatPercent,
  formatRelativeTime,
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
  const { t: i18nT } = useI18nextTranslation();

  const t = useCallback(
    (key: string, params?: Record<string, string | number>) =>
      i18nT(key, params),
    [i18nT],
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
