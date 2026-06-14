"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { AppImage } from "@/components/AppImage";
import { entrustAssets } from "./assets";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { getArticleList } from "@/lib/api/users";
import { useAuthStore, useUserInfoStore } from "@/lib/store";
import { shellMaxWidth, shellMdPaddingY } from "@/lib/mobileShell";
import type { ArticleItem } from "./announcementTypes";
import { hasArticleDisplayContent, resolveArticleForLocale } from "./announcementLocale";
import {
  ARTICLE_PLAIN_TEXT_CLASS,
  ARTICLE_RICH_TEXT_CLASS,
  getArticleBodyContent,
} from "./announcementRichText";

function isTopArticle(article: ArticleItem) {
  return article.isTop === 1;
}

function sortTopArticles(articles: ArticleItem[]) {
  return [...articles].sort((a, b) => {
    const sortDiff = (b.sort ?? 0) - (a.sort ?? 0);
    if (sortDiff !== 0) return sortDiff;
    const bTime = new Date(b.createdAt ?? 0).getTime();
    const aTime = new Date(a.createdAt ?? 0).getTime();
    return bTime - aTime;
  });
}

const GRADIENT_BTN_INSET =
  "pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0px_-4px_4px_0px_rgba(255,254,227,0.7),inset_0px_8px_17px_0px_#ffe5e5]";

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

function AnnouncementWindowBody({ article }: { article: ArticleItem }) {
  const { sanitizedHtml, plainBody } = React.useMemo(
    () => getArticleBodyContent(article.content, article.summary),
    [article.content, article.summary],
  );

  return (
    <>
      <h3 className="text-base font-semibold leading-normal text-[#161616]">
        {article.title || "—"}
      </h3>
      <p className="mt-2 text-sm leading-normal text-[#5a5a5a]">
        {formatArticleTime(article.createdAt || article.updatedAt)}
      </p>
      {sanitizedHtml ? (
        <div
          className={`${ARTICLE_RICH_TEXT_CLASS} mt-3`}
          dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
        />
      ) : plainBody ? (
        <div className={`${ARTICLE_PLAIN_TEXT_CLASS} mt-3`}>
          {plainBody}
        </div>
      ) : null}
    </>
  );
}

export function AnnouncementWindow() {
  const { t, locale } = useTranslation();
  const accessToken = useAuthStore((state) => state.accessToken);
  const walletAddress = useUserInfoStore(
    (state) => state.userInfo.walletAddress,
  );
  const isLoggedIn = Boolean(accessToken && walletAddress);

  const [open, setOpen] = React.useState(false);
  const [index, setIndex] = React.useState(0);
  const [entered, setEntered] = React.useState(false);
  const shownForAddressRef = React.useRef<string | null>(null);
  const contentScrollRef = React.useRef<HTMLDivElement>(null);

  const { data: articleListResponse, isSuccess } = useQuery({
    queryKey: ["articleList", "announcement", "top", locale],
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
    enabled: isLoggedIn,
  });

  const topArticles = React.useMemo(() => {
    const raw = articleListResponse?.data;
    if (!Array.isArray(raw)) return [];
    return sortTopArticles(
      (raw as ArticleItem[])
        .filter(isTopArticle)
        .map((article) => resolveArticleForLocale(article, locale))
        .filter(hasArticleDisplayContent),
    );
  }, [articleListResponse, locale]);

  const currentArticle = topArticles[index] ?? null;
  const hasNext = index < topArticles.length - 1;

  React.useEffect(() => {
    if (!isLoggedIn) {
      setOpen(false);
      setIndex(0);
      shownForAddressRef.current = null;
      return;
    }

    if (
      isSuccess &&
      topArticles.length > 0 &&
      walletAddress &&
      shownForAddressRef.current !== walletAddress
    ) {
      setIndex(0);
      setOpen(true);
      shownForAddressRef.current = walletAddress;
    }
  }, [isLoggedIn, isSuccess, topArticles.length, walletAddress]);

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
    contentScrollRef.current?.scrollTo({ top: 0 });
  }, [index, currentArticle?.id]);

  const closeWindow = React.useCallback(() => {
    setEntered(false);
    window.setTimeout(() => {
      setOpen(false);
      setIndex(0);
    }, 200);
  }, []);

  const handleNext = React.useCallback(() => {
    setIndex((prev) => prev + 1);
  }, []);

  React.useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeWindow();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, closeWindow]);

  if (!open || !currentArticle) return null;

  return (
    <div
      className={[
        "fixed inset-0 z-90 flex items-center justify-center overflow-hidden px-3",
        shellMdPaddingY,
      ].join(" ")}
      role="dialog"
      aria-modal="true"
      aria-labelledby="announcement-window-title"
    >
      <div
        className={`absolute inset-0 bg-[rgba(0,0,0,0.7)] transition-opacity duration-200 ${
          entered ? "opacity-100" : "opacity-0"
        }`}
        aria-hidden
      />

      <div
        className={`relative mx-auto w-full ${shellMaxWidth} transition-[transform,opacity] duration-200 ${
          entered ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
        }`}
      >
        <div className="mx-auto flex w-full max-w-[351px] flex-col items-center">
          <div className="relative aspect-[351/485] w-full">
            <div
              aria-hidden
              className="absolute bottom-[11%] left-[8.5%] right-[10.5%] top-[26.8%] rounded-[6px] bg-white"
            />
            <AppImage
              src={entrustAssets.announcementWindowFrameOverlay}
              alt=""
              width={351}
              height={485}
              className="pointer-events-none absolute inset-0 z-20 h-full w-full object-fill"
              priority
            />
            <div
              ref={contentScrollRef}
              className="absolute bottom-[11%] left-[8.5%] right-[10.5%] top-[26.8%] z-30 overflow-y-auto px-2 py-1 text-black [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#ff534e] [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-[#ece9e8]"
            >
              <AnnouncementWindowBody article={currentArticle} />
            </div>
            <h2
              id="announcement-window-title"
              className="pointer-events-none absolute left-1/2 top-[12.2%] z-40 -translate-x-1/2 font-noto-sc-black text-[32px] font-bold leading-none text-[#d90000]"
            >
              {t("entrust.announcementPanelTitle")}
            </h2>
          </div>

          <div className="mt-4 flex w-full gap-[18px]">
            {hasNext ? (
              <button
                type="button"
                onClick={handleNext}
                className="relative flex h-12 flex-1 items-center justify-center overflow-hidden rounded-[33px] border border-white shadow-[0_4px_6px_rgba(213,0,0,0.12)]"
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 rounded-[33px] bg-gradient-to-r from-[#ff4d00] via-[#ff3033] via-[53.846%] to-[#e90000]"
                />
                <span aria-hidden className={GRADIENT_BTN_INSET} />
                <span className="relative text-base font-semibold text-white [text-shadow:0_1px_3px_rgba(94,44,44,0.25)]">
                  {t("mine.nextPage")}
                </span>
              </button>
            ) : null}
            <button
              type="button"
              onClick={closeWindow}
              className={`relative flex h-12 items-center justify-center overflow-hidden rounded-[33px] border border-white bg-[rgba(0,0,0,0.35)] shadow-[0_4px_12px_rgba(213,0,0,0.12)] ${
                hasNext ? "flex-1" : "w-full"
              }`}
            >
              <span className="relative text-base font-semibold text-white [text-shadow:0_1px_3px_rgba(94,44,44,0.25)]">
                {t("common.close")}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
