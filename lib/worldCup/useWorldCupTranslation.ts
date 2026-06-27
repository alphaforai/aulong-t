"use client";

import { useCallback } from "react";
import { translate, type Locale } from "@/lib/local";

/** 世界杯模块暂强制英文（后续可改回跟随全局 locale） */
const WORLD_CUP_LOCALE: Locale = "en_US";

export function useWorldCupTranslation() {
  const t = useCallback(
    (key: string, params?: Record<string, string | number>) =>
      translate(WORLD_CUP_LOCALE, key, params),
    [],
  );

  return { t, locale: WORLD_CUP_LOCALE };
}
