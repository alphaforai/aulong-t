"use client";

import React from "react";
import { LOCALE_OPTIONS } from "@/lib/local/locale-meta";
import type { Locale } from "@/lib/local";
import { useTranslation } from "@/lib/hooks/useTranslation";

type LanguagePickerSheetProps = {
  open: boolean;
  onClose: () => void;
};

export function LanguagePickerSheet({ open, onClose }: LanguagePickerSheetProps) {
  const { t, locale, setLocale } = useTranslation();
  const [entered, setEntered] = React.useState(false);

  React.useEffect(() => {
    if (!open) {
      setEntered(false);
      return;
    }
    const frame = requestAnimationFrame(() => {
      requestAnimationFrame(() => setEntered(true));
    });
    return () => cancelAnimationFrame(frame);
  }, [open]);

  const closeSheet = React.useCallback(() => {
    setEntered(false);
    window.setTimeout(onClose, 300);
  }, [onClose]);

  const handleSelect = (code: Locale) => {
    setLocale(code);
    closeSheet();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-65 flex flex-col justify-end">
      <button
        type="button"
        aria-label={t("common.close")}
        className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ease-out ${
          entered ? "opacity-100" : "opacity-0"
        }`}
        onClick={closeSheet}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="language-sheet-title"
        className={`relative flex max-h-[70dvh] w-full flex-col rounded-t-2xl bg-white px-4 pt-3 pb-[max(env(safe-area-inset-bottom),20px)] shadow-[0_-12px_40px_rgba(0,0,0,0.15)] transition-transform duration-300 ease-out ${
          entered ? "translate-y-0" : "translate-y-full"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="mx-auto mb-4 h-1 w-10 rounded-full bg-[#e5e5e5]"
          aria-hidden
        />
        <div className="mb-3 flex items-center justify-between">
          <h3
            id="language-sheet-title"
            className="text-base font-semibold text-[#333]"
          >
            {t("header.languageTitle")}
          </h3>
          <button
            type="button"
            onClick={closeSheet}
            className="text-sm text-[#8b8b8b]"
          >
            {t("common.close")}
          </button>
        </div>

        <ul className="flex flex-col gap-1 overflow-y-auto">
          {LOCALE_OPTIONS.map((option) => {
            const selected = locale === option.code;
            return (
              <li key={option.code}>
                <button
                  type="button"
                  onClick={() => handleSelect(option.code)}
                  className={`flex w-full items-center justify-between rounded-[10px] px-3 py-3 text-left transition-colors ${
                    selected
                      ? "bg-[#fff5f5] text-[#f82a2a]"
                      : "text-[#333] hover:bg-[#f8f8f8]"
                  }`}
                >
                  <span className="text-sm font-medium">{option.nativeLabel}</span>
                  <span className="text-xs text-[#8b8b8b]">{option.englishLabel}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
