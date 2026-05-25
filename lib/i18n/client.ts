"use client";

import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import {
  DEFAULT_LOCALE,
  LOCALE_CONFIG,
  type Locale,
} from "@/lib/local";

const resources = Object.fromEntries(
  (Object.keys(LOCALE_CONFIG) as Locale[]).map((code) => [
    code,
    { translation: LOCALE_CONFIG[code].messages },
  ]),
);

if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    resources,
    lng: DEFAULT_LOCALE,
    fallbackLng: DEFAULT_LOCALE,
    supportedLngs: Object.keys(LOCALE_CONFIG),
    interpolation: {
      escapeValue: false,
      prefix: "{",
      suffix: "}",
    },
    react: { useSuspense: false },
  });
}

export default i18n;
