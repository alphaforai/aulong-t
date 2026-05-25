"use client";

import { useMemo } from "react";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { getBcp47Tag } from "@/lib/local";
import type { PriceGranularity } from "@/components/entrust/priceChartUtils";

export function useChartLocale() {
  const { locale, t } = useTranslation();
  const bcp47 = useMemo(() => getBcp47Tag(locale), [locale]);

  const rangeTabs = useMemo(
    () =>
      [
        { granularity: "MINUTE" as const, label: t("entrust.range15m") },
        { granularity: "HOUR" as const, label: t("entrust.range1h") },
        { granularity: "DAY" as const, label: t("entrust.range1d") },
      ],
    [t],
  );

  const rangeDescMap = useMemo(
    (): Record<PriceGranularity, string> => ({
      MINUTE: t("entrust.rangeDescMinute"),
      HOUR: t("entrust.rangeDescHour"),
      DAY: t("entrust.rangeDescDay"),
    }),
    [t],
  );

  return { bcp47, rangeTabs, rangeDescMap, t };
}
