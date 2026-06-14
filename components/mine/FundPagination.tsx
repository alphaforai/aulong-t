"use client";

import { AppImage } from "@/components/AppImage";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { mineAssets } from "./assets";

const PAGE_NUMBERS = [1, 2, 3, 4, 5] as const;

/** 分页 — 对齐 Figma 514:5744 */
export function FundPagination() {
  const { t } = useTranslation();

  return (
    <nav
      className="flex items-center justify-center gap-[6px] py-2"
      aria-label={t("mine.paginationAria")}
    >
      <PaginationNavButton
        src={mineAssets.pageChevronLeft}
        label={t("mine.prevPage")}
      />

      {PAGE_NUMBERS.map((page) => (
        <button
          key={page}
          type="button"
          className={`flex h-5 min-w-5 items-center justify-center rounded-[2px] text-xs leading-normal ${
            page === 1
              ? "w-5 bg-[#ff4646] px-[9px] py-0.5 text-white/90"
              : "w-5 border-[0.5px] border-white bg-white px-2 py-0.5 text-black/90"
          }`}
        >
          {page}
        </button>
      ))}

      <button
        type="button"
        aria-label={t("mine.morePagesAria")}
        className="flex size-[22.5px] shrink-0 items-center justify-center rounded-[2px]"
      >
        <PageEllipsisDots />
      </button>

      <button
        type="button"
        className="flex size-5 items-center justify-center rounded-[2px] border-[0.5px] border-white bg-white px-[7px] py-1 text-xs leading-normal text-black/90"
      >
        11
      </button>

      <PaginationNavButton
        src={mineAssets.pageChevronRight}
        label={t("mine.nextPage")}
      />
    </nav>
  );
}

function PageEllipsisDots() {
  return (
    <span className="inline-flex items-center gap-[3px]" aria-hidden>
      <span className="size-[2px] rounded-full bg-[rgba(255,0,0,0.9)]" />
      <span className="size-[2px] rounded-full bg-[rgba(255,0,0,0.9)]" />
      <span className="size-[2px] rounded-full bg-[rgba(255,0,0,0.9)]" />
    </span>
  );
}

function PaginationNavButton({
  src,
  label,
}: {
  src: string;
  label: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      className="flex size-[22.5px] shrink-0 items-center justify-center rounded-[2px]"
    >
      <AppImage
        src={src}
        alt=""
        width={9}
        height={9}
        className="size-[9px] shrink-0"
      />
    </button>
  );
}
