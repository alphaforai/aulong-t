"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import AulongHeader from "@/components/AulongHeader";
import { AppImage } from "@/components/AppImage";
import { teamAssets } from "@/components/team/assets";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { getArticleList } from "@/lib/api/users";
import { withImageUrlPrefix } from "@/lib/imageUrl";
import {
  sidePanelOverlayFrame,
  sidePanelOverlayRoot,
} from "@/lib/mobileShell";
import type { ArticleItem } from "./announcementTypes";
import { resolveArticlesForLocale, hasArticleDisplayContent } from "./announcementLocale";

export type AnnouncementListProps = {
  open: boolean;
  onClose: () => void;
  onSelectArticle: (article: ArticleItem) => void;
};

function formatArticleTime(value?: string) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();
  const h = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  return `${y}-${m}-${d} ${h}:${min}`;
}

function AnnouncementListItem({
  article,
  onClick,
}: {
  article: ArticleItem;
  onClick: () => void;
}) {
  const coverSrc = withImageUrlPrefix(article.picUrl);

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full gap-[5px] text-left"
    >
      {coverSrc ? (
        <div className="relative h-[70px] w-[126px] shrink-0 overflow-hidden rounded-[7px]">
          <AppImage
            src={coverSrc}
            alt=""
            width={126}
            height={70}
            className="size-full object-cover"
          />
        </div>
      ) : null}
      <div
        className={`flex min-w-0 flex-1 flex-col justify-between ${
          coverSrc ? "h-[70px] pt-[5px]" : "py-1"
        }`}
      >
        <p className="line-clamp-2 text-sm font-medium leading-normal text-[#212a34]">
          {article.title || "—"}
        </p>
        <p className="text-xs leading-normal text-[#7d818c]">
          {formatArticleTime(article.createdAt || article.updatedAt)}
        </p>
      </div>
    </button>
  );
}

export function AnnouncementList({
  open,
  onClose,
  onSelectArticle,
}: AnnouncementListProps) {
  const { t, locale } = useTranslation();
  const [entered, setEntered] = React.useState(false);

  const { data: articleListResponse, isPending, isError } = useQuery({
    queryKey: ["articleList", "announcement", locale],
    queryFn: () =>
      getArticleList({
        page: 0,
        limit: 50,
        searchCount: false,
        lastId: undefined,
        keyword: undefined,
        type: 1,
        status: undefined,
      }),
    enabled: open,
  });

  const articles = React.useMemo(() => {
    const raw = articleListResponse?.data;
    if (!Array.isArray(raw)) return [];
    return resolveArticlesForLocale(raw as ArticleItem[], locale).filter(
      hasArticleDisplayContent,
    );
  }, [articleListResponse, locale]);

  const closePanel = React.useCallback(() => {
    setEntered(false);
    window.setTimeout(() => onClose(), 300);
  }, [onClose]);

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

  React.useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closePanel();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, closePanel]);

  if (!open) return null;

  return (
    <div
      className={`${sidePanelOverlayRoot} z-75`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="announcement-list-title"
    >
      <div className={sidePanelOverlayFrame}>
        <div
          className={`absolute inset-0 flex w-full flex-col bg-[#f8f8f8] transition-transform duration-300 ease-out ${
            entered ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-[813px] bg-gradient-to-b from-[rgba(248,248,248,0.34)] to-[rgba(255,255,255,0.34)]"
            aria-hidden
          />

          <div className="relative flex min-h-0 flex-1 flex-col">
            <div className="h-11 shrink-0 bg-white" aria-hidden />
            <AulongHeader />

            <header className="relative flex h-12 shrink-0 items-center justify-center bg-[#f8f8f8] px-3">
              <button
                type="button"
                aria-label={t("common.back")}
                onClick={closePanel}
                className="absolute left-3 flex size-6 items-center justify-center"
              >
                <AppImage
                  src={teamAssets.directBack}
                  alt=""
                  width={16}
                  height={16}
                  className="size-4"
                />
              </button>
              <h1
                id="announcement-list-title"
                className="text-lg font-medium leading-[26px] text-[#272727]"
              >
                {t("entrust.announcementPanelTitle")}
              </h1>
            </header>

            <div className="relative z-10 min-h-0 flex-1 overflow-y-auto bg-[#f8f8f8] px-3 pb-[max(env(safe-area-inset-bottom),16px)] pt-4">
              {isPending ? (
                <p className="py-12 text-center text-sm text-black/50">
                  {t("common.loading")}
                </p>
              ) : isError ? (
                <p className="py-12 text-center text-sm text-black/50">
                  {t("common.operationFailed")}
                </p>
              ) : articles.length === 0 ? (
                <p className="py-12 text-center text-sm text-black/50">
                  {t("entrust.announcementNoRecords")}
                </p>
              ) : (
                <div className="flex flex-col gap-4">
                  {articles.map((article) => (
                    <AnnouncementListItem
                      key={article.id}
                      article={article}
                      onClick={() => onSelectArticle(article)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
