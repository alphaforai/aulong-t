"use client";

import React from "react";
import { AppImage } from "@/components/AppImage";
import {
  LOCALE_PICKER_OPTIONS,
  localePickerCheckIcon,
} from "@/lib/local/locale-meta";
import type { Locale } from "@/lib/local";
import { useTranslation } from "@/lib/hooks/useTranslation";

type LanguagePickerSheetProps = {
  open: boolean;
  onClose: () => void;
};

/** 顶栏语言按钮下方下拉 — Figma 806:573 */
export function LanguagePickerSheet({ open, onClose }: LanguagePickerSheetProps) {
  const { t, locale, setLocale } = useTranslation();
  const [entered, setEntered] = React.useState(false);
  const [mounted, setMounted] = React.useState(open);

  React.useEffect(() => {
    if (open) {
      setMounted(true);
      const frame = requestAnimationFrame(() => {
        requestAnimationFrame(() => setEntered(true));
      });
      return () => cancelAnimationFrame(frame);
    }
    setEntered(false);
    const timer = window.setTimeout(() => setMounted(false), 200);
    return () => window.clearTimeout(timer);
  }, [open]);

  React.useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  const handleSelect = (code: Locale) => {
    setLocale(code);
    onClose();
  };

  if (!mounted) return null;

  return (
    <>
      <button
        type="button"
        aria-label={t("common.close")}
        tabIndex={-1}
        className={`fixed inset-0 z-40 bg-transparent transition-opacity duration-200 ${
          entered ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />
      <div
        role="listbox"
        aria-label={t("header.languageTitle")}
        className={`absolute right-0 top-[calc(100%+6px)] z-50 w-[114px] origin-top overflow-hidden rounded-[12px] border border-white bg-white/80 py-1 shadow-[0_5px_10px_rgba(51,51,51,0.08)] backdrop-blur-[4.3px] transition-[transform,opacity] duration-200 ease-out ${
          entered
            ? "pointer-events-auto scale-y-100 opacity-100"
            : "pointer-events-none scale-y-0 opacity-0"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <ul className="flex flex-col">
          {LOCALE_PICKER_OPTIONS.map((option) => {
            const selected = locale === option.code;
            return (
              <li key={option.code}>
                <button
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => handleSelect(option.code)}
                  className="flex h-8 w-full items-center gap-[7px] pl-[13px] pr-2 text-left"
                >
                  <AppImage
                    src={option.flagIcon}
                    alt=""
                    width={18}
                    height={18}
                    className="size-[18px] shrink-0 rounded-full object-cover"
                  />
                  <span
                    className={`min-w-0 flex-1 text-[14px] leading-normal ${
                      selected ? "text-[#f82a2a]" : "text-black"
                    }`}
                  >
                    {option.pickerLabel}
                  </span>
                  {selected ? (
                    <AppImage
                      src={localePickerCheckIcon}
                      alt=""
                      width={16}
                      height={16}
                      className="size-4 shrink-0"
                    />
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
}
