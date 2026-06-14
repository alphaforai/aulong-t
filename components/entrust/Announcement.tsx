"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { AppImage } from "@/components/AppImage";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { getArticleList } from "@/lib/api/users";
import { entrustAssets } from "./assets";
import type { ArticleItem } from "./announcementTypes";
import { getArticleHeadline, hasArticleDisplayContent, resolveArticlesForLocale } from "./announcementLocale";
import { toast } from "sonner";

const ROTATE_MS = 3000;
const SLIDE_HEIGHT_PX = 48;

type AnnouncementProps = {
  onClick?: () => void;
};

function AnnouncementIcon() {
  return (
    <div className="relative size-[34px] shrink-0">
      <AppImage
        src={entrustAssets.announcementIcon}
        alt=""
        width={34}
        height={34}
        className="pointer-events-none absolute inset-0 size-full max-w-none object-bottom"
      />
    </div>
  );
}

function AnnouncementTitleRow({ title }: { title: string }) {
  return (
    <div className="flex h-12 w-full items-center gap-[3px]">
      <AnnouncementIcon />
      <p className="min-w-0 flex-1 truncate text-left text-sm leading-normal text-[#212a34]">
        {title}
      </p>
    </div>
  );
}

function AnnouncementCarousel({
  articles,
  index,
}: {
  articles: ArticleItem[];
  index: number;
}) {
  return (
    <div
      className="h-12 w-full overflow-hidden"
      aria-live="polite"
      aria-atomic="true"
    >
      <div
        className="flex flex-col transition-transform duration-500 ease-in-out"
        style={{ transform: `translateY(-${index * SLIDE_HEIGHT_PX}px)` }}
      >
        {articles.map((article) => (
          <AnnouncementTitleRow
            key={article.id}
            title={getArticleHeadline(article)}
          />
        ))}
      </div>
    </div>
  );
}

/** 公告栏 — Figma 969:2244 */
export function Announcement({ onClick }: AnnouncementProps) {
  const { t, locale } = useTranslation();
  const [index, setIndex] = React.useState(0);

  const { data: articleListResponse } = useQuery({
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
  });

  const articles = React.useMemo(() => {
    const raw = articleListResponse?.data;
    if (!Array.isArray(raw)) return [];
    return resolveArticlesForLocale(raw as ArticleItem[], locale).filter(
      hasArticleDisplayContent,
    );
  }, [articleListResponse, locale]);

  React.useEffect(() => {
    setIndex(0);
  }, [locale, articles.length]);

  React.useEffect(() => {
    if (articles.length <= 1) return;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % articles.length);
    }, ROTATE_MS);
    return () => window.clearInterval(timer);
  }, [articles.length]);

  const currentArticle =
    articles.length > 0
      ? articles[Math.min(index, articles.length - 1)]!
      : null;
  const displayTitle = currentArticle
    ? getArticleHeadline(currentArticle, t("entrust.announcementText"))
    : t("entrust.announcementText");

  return (
    <button
      type="button"
      onClick={onClick ?? (() => toast.success(t("common.notOpen")))}
      aria-label={displayTitle}
      className="block h-12 w-full shrink-0 overflow-hidden rounded-[12px] bg-white/80 px-3 shadow-[0_5px_10px_rgba(51,51,51,0.08)] backdrop-blur-[7px]"
    >
      <div className="h-12 w-full overflow-hidden">
        {articles.length <= 1 ? (
          <AnnouncementTitleRow
            title={
              articles.length === 1
                ? getArticleHeadline(
                    articles[0],
                    t("entrust.announcementText"),
                  )
                : t("entrust.announcementText")
            }
          />
        ) : (
          <AnnouncementCarousel articles={articles} index={index} />
        )}
      </div>
    </button>
  );
}
