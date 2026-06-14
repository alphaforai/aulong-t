import {
  getBcp47Tag,
  normalizeLocale,
  type Locale,
} from "@/lib/local";
import type { ArticleItem } from "./announcementTypes";

type ArticleLocalizedFields = {
  title?: string;
  summary?: string;
  content?: string;
  picUrl?: string;
  videoUrl?: string;
};

const LOCALIZED_FIELDS = [
  "title",
  "summary",
  "content",
  "picUrl",
  "videoUrl",
] as const satisfies readonly (keyof ArticleLocalizedFields)[];

function pickFirstNonEmpty(
  ...values: (string | undefined)[]
): string | undefined {
  for (const value of values) {
    if (value?.trim()) return value;
  }
  return undefined;
}

function localeKeyCandidates(locale: Locale): string[] {
  const bcp47 = getBcp47Tag(locale);
  return [
    locale,
    bcp47,
    locale.replace("_", "-"),
    bcp47.toLowerCase(),
    locale.toLowerCase(),
  ];
}

function matchesLocaleKey(value: string, locale: Locale): boolean {
  const normalized = value.trim();
  if (!normalized) return false;
  return localeKeyCandidates(locale).some(
    (candidate) =>
      candidate === normalized ||
      candidate.toLowerCase() === normalized.toLowerCase(),
  );
}

function asLocalizedFields(value: unknown): ArticleLocalizedFields | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const obj = value as Record<string, unknown>;
  const result: ArticleLocalizedFields = {};
  let hasAny = false;

  for (const field of LOCALIZED_FIELDS) {
    const raw = obj[field];
    if (typeof raw === "string" && raw.trim()) {
      result[field] = raw;
      hasAny = true;
    }
  }

  return hasAny ? result : null;
}

function pickLocaleFirstEntry(
  map: Record<string, unknown>,
  locale: Locale,
): ArticleLocalizedFields | null {
  for (const key of localeKeyCandidates(locale)) {
    const entry = asLocalizedFields(map[key]);
    if (entry) return entry;
  }
  return null;
}

function pickFieldFirstEntry(
  map: Record<string, unknown>,
  locale: Locale,
): ArticleLocalizedFields | null {
  const result: ArticleLocalizedFields = {};
  let hasAny = false;

  for (const field of LOCALIZED_FIELDS) {
    const raw = map[field];
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) continue;

    const localized = pickStringFromLocaleMap(
      raw as Record<string, unknown>,
      locale,
    );
    if (localized) {
      result[field] = localized;
      hasAny = true;
    }
  }

  return hasAny ? result : null;
}

function pickStringFromLocaleMap(
  map: Record<string, unknown> | undefined,
  locale: Locale,
): string | undefined {
  if (!map) return undefined;

  for (const key of localeKeyCandidates(locale)) {
    const value = map[key];
    if (typeof value === "string" && value.trim()) return value;
  }

  return undefined;
}

function pickArrayEntry(
  entries: unknown[],
  locale: Locale,
): ArticleLocalizedFields | null {
  for (const entry of entries) {
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) continue;

    const obj = entry as Record<string, unknown>;
    const lang = obj.locale ?? obj.lang ?? obj.language;
    if (typeof lang === "string" && matchesLocaleKey(lang, locale)) {
      const localized = asLocalizedFields(entry);
      if (localized) return localized;
    }
  }

  return null;
}

function extractLocalizedFields(
  i18n: unknown,
  locale: Locale,
): ArticleLocalizedFields | null {
  if (!i18n) return null;

  if (typeof i18n === "string") {
    try {
      return extractLocalizedFields(JSON.parse(i18n), locale);
    } catch {
      return null;
    }
  }

  if (Array.isArray(i18n)) {
    return pickArrayEntry(i18n, locale);
  }

  if (typeof i18n !== "object") return null;

  const map = i18n as Record<string, unknown>;
  const localeFirst = pickLocaleFirstEntry(map, locale);
  if (localeFirst) return localeFirst;

  const hasFieldFirstShape = LOCALIZED_FIELDS.some((field) => {
    const raw = map[field];
    return raw != null && typeof raw === "object" && !Array.isArray(raw);
  });
  if (hasFieldFirstShape) {
    return pickFieldFirstEntry(map, locale);
  }

  return null;
}

function pickLocalizedField(
  field: keyof ArticleLocalizedFields,
  article: ArticleItem,
  localeEntry: ArticleLocalizedFields | null,
): string | undefined {
  return pickFirstNonEmpty(localeEntry?.[field], article[field]);
}

export function hasArticleDisplayContent(article: ArticleItem): boolean {
  return Boolean(
    article.title?.trim() || article.summary?.trim() || article.content?.trim(),
  );
}

function stripHtmlText(text: string): string {
  return text.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

/** 公告栏/列表展示用标题：优先 title，否则摘要或正文纯文本 */
export function getArticleHeadline(
  article: ArticleItem,
  fallback = "—",
): string {
  if (article.title?.trim()) return article.title.trim();
  if (article.summary?.trim()) return article.summary.trim();
  if (article.content?.trim()) {
    const plain = stripHtmlText(article.content);
    if (plain) {
      return plain.length > 80 ? `${plain.slice(0, 80)}…` : plain;
    }
  }
  return fallback;
}

/** 按当前语言从 article.i18n 与根字段合并出可展示的公告内容 */
export function resolveArticleForLocale(
  article: ArticleItem,
  locale?: string,
): ArticleItem {
  const normalized = normalizeLocale(locale);
  const localeEntry = extractLocalizedFields(article.i18n, normalized);

  return {
    ...article,
    title: pickLocalizedField("title", article, localeEntry),
    summary: pickLocalizedField("summary", article, localeEntry),
    content: pickLocalizedField("content", article, localeEntry),
    picUrl:
      pickLocalizedField("picUrl", article, localeEntry) ?? article.picUrl,
    videoUrl:
      pickLocalizedField("videoUrl", article, localeEntry) ?? article.videoUrl,
  };
}

export function resolveArticlesForLocale(
  articles: ArticleItem[],
  locale?: string,
): ArticleItem[] {
  return articles.map((article) => resolveArticleForLocale(article, locale));
}
