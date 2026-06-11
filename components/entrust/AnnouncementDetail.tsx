"use client";

import React from "react";
import AulongHeader from "@/components/AulongHeader";
import { AppImage } from "@/components/AppImage";
import { teamAssets } from "@/components/team/assets";
import { useTranslation } from "@/lib/hooks/useTranslation";
import {
  sidePanelOverlayFrame,
  sidePanelOverlayRoot,
} from "@/lib/mobileShell";
import { withImageUrlPrefix } from "@/lib/imageUrl";
import type { ArticleItem } from "./announcementTypes";
import {
  ARTICLE_PLAIN_TEXT_CLASS,
  ARTICLE_RICH_TEXT_CLASS,
  getArticleBodyContent,
} from "./announcementRichText";

export type AnnouncementDetailProps = {
  open: boolean;
  article: ArticleItem | null;
  onClose: () => void;
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

export function AnnouncementDetail({
  open,
  article,
  onClose,
}: AnnouncementDetailProps) {
  const { t } = useTranslation();
  const [entered, setEntered] = React.useState(false);

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

  const { sanitizedHtml, plainBody } = React.useMemo(
    () => getArticleBodyContent(article?.content, article?.summary),
    [article?.content, article?.summary],
  );

  if (!open || !article) return null;

  const coverSrc = withImageUrlPrefix(article.picUrl);

  return (
    <div
      className={`${sidePanelOverlayRoot} z-85`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="announcement-detail-title"
    >
      <div className={sidePanelOverlayFrame}>
        <div
          className={`absolute inset-0 flex w-full flex-col bg-[#f8f8f8] transition-transform duration-300 ease-out ${
            entered ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-[974px] bg-gradient-to-b from-[rgba(248,248,248,0.34)] to-[rgba(255,255,255,0.34)]"
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
                id="announcement-detail-title"
                className="text-lg font-medium leading-[26px] text-[#272727]"
              >
                {t("entrust.announcementPanelTitle")}
              </h1>
            </header>

            <div className="relative z-10 min-h-0 flex-1 overflow-y-auto bg-[#f8f8f8] px-3 pb-[max(env(safe-area-inset-bottom),16px)] pt-2">
              {coverSrc ? (
                <div className="relative aspect-[351/197] w-full overflow-hidden rounded-[7px]">
                  <AppImage
                    src={coverSrc}
                    alt=""
                    width={351}
                    height={197}
                    className="size-full object-cover"
                  />
                </div>
              ) : null}

              <h2
                className={`break-words text-base font-semibold leading-normal text-[#161616] [overflow-wrap:anywhere] ${
                  coverSrc ? "mt-4" : ""
                }`}
              >
                {article.title || "—"}
              </h2>

              <p className="mt-2 text-sm leading-normal text-[#5a5a5a]">
                {formatArticleTime(article.createdAt || article.updatedAt)}
              </p>

              {sanitizedHtml ? (
                <div
                  className={`${ARTICLE_RICH_TEXT_CLASS} mt-4`}
                  dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
                />
              ) : plainBody ? (
                <div className={`${ARTICLE_PLAIN_TEXT_CLASS} mt-4`}>
                  {plainBody}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
