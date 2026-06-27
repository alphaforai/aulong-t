"use client";

import { AppImage } from "@/components/AppImage";
import { mineAssets } from "@/components/mine/assets";

function buildPageRange(
  current: number,
  total: number,
): Array<number | "ellipsis"> {
  if (total <= 0) return [];
  if (total <= 7) {
    return Array.from({ length: total }, (_, index) => index);
  }

  const indices = new Set<number>([0, total - 1]);
  for (let i = current - 1; i <= current + 1; i++) {
    if (i >= 0 && i < total) indices.add(i);
  }

  const sorted = [...indices].sort((a, b) => a - b);
  const range: Array<number | "ellipsis"> = [];
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) {
      range.push("ellipsis");
    }
    range.push(sorted[i]);
  }
  return range;
}

function PaginationNavButton({
  src,
  label,
  disabled,
  onClick,
}: {
  src: string;
  label: string;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="flex size-8 items-center justify-center disabled:opacity-40"
    >
      <AppImage src={src} alt="" width={16} height={16} className="size-4" />
    </button>
  );
}

function PageEllipsisDots() {
  return (
    <span className="px-1 text-sm text-[#acacac]" aria-hidden>
      …
    </span>
  );
}

type WorldCupPaginationProps = {
  page: number;
  totalPages: number;
  loading?: boolean;
  onPageChange: (page: number) => void;
  t: (key: string) => string;
};

/** Android 9：分页器用 space-x 代替 gap */
export function WorldCupPagination({
  page,
  totalPages,
  loading,
  onPageChange,
  t,
}: WorldCupPaginationProps) {
  const canPrev = page > 0;
  const canNext = page < totalPages - 1;
  const items = buildPageRange(page, totalPages);

  return (
    <nav
      className="flex items-center justify-center space-x-1.5 py-2"
      aria-label={t("worldCup.paginationAria")}
      aria-busy={loading}
    >
      <PaginationNavButton
        src={mineAssets.pageChevronLeft}
        label={t("worldCup.prevPage")}
        disabled={loading || !canPrev}
        onClick={() => onPageChange(page - 1)}
      />

      {items.map((item, index) =>
        item === "ellipsis" ? (
          <PageEllipsisDots key={`ellipsis-${index}`} />
        ) : (
          <button
            key={item}
            type="button"
            disabled={loading}
            onClick={() => onPageChange(item)}
            className={`flex h-8 min-w-8 items-center justify-center rounded-full px-2 text-sm ${
              item === page
                ? "bg-[#f0181e] font-medium text-white"
                : "text-[#333]"
            }`}
          >
            {item + 1}
          </button>
        ),
      )}

      <PaginationNavButton
        src={mineAssets.pageChevronRight}
        label={t("worldCup.nextPage")}
        disabled={loading || !canNext}
        onClick={() => onPageChange(page + 1)}
      />
    </nav>
  );
}
