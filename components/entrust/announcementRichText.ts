import DOMPurify from "dompurify";

const ARTICLE_RICH_TEXT_WRAP =
  "min-w-0 max-w-full break-words [overflow-wrap:anywhere] [&_div]:max-w-full [&_div]:break-words [&_div]:whitespace-normal [&_h1]:break-words [&_h2]:break-words [&_h3]:break-words [&_li]:break-words [&_li]:whitespace-normal [&_p]:break-words [&_p]:whitespace-normal [&_span]:break-words [&_span]:whitespace-normal";

export const ARTICLE_RICH_TEXT_CLASS =
  `announcement-rich-text text-sm leading-normal text-black ${ARTICLE_RICH_TEXT_WRAP} [&_a]:break-all [&_a]:text-[#ec0000] [&_a]:underline [&_blockquote]:my-3 [&_blockquote]:border-l-2 [&_blockquote]:border-black/10 [&_blockquote]:pl-3 [&_blockquote]:text-black/70 [&_h1]:mt-4 [&_h1]:text-lg [&_h1]:font-semibold [&_h2]:mt-4 [&_h2]:text-base [&_h2]:font-semibold [&_h3]:mt-3 [&_h3]:text-sm [&_h3]:font-semibold [&_img]:my-3 [&_img]:h-auto [&_img]:max-w-full [&_img]:rounded-[7px] [&_li+li]:mt-1 [&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:leading-relaxed [&_p+p]:mt-3 [&_pre]:my-3 [&_pre]:overflow-x-auto [&_pre]:whitespace-pre [&_pre]:rounded-md [&_pre]:bg-black/5 [&_pre]:p-3 [&_table]:my-3 [&_table]:w-full [&_table]:border-collapse [&_td]:border [&_td]:border-black/10 [&_td]:p-2 [&_th]:border [&_th]:border-black/10 [&_th]:p-2 [&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-5`;

export const ARTICLE_PLAIN_TEXT_CLASS =
  "min-w-0 max-w-full whitespace-pre-wrap break-words [overflow-wrap:anywhere] text-sm leading-normal text-black";

export function isHtmlContent(text: string) {
  return /<[a-z][\s\S]*>/i.test(text.trim());
}

export function sanitizeArticleHtml(html: string) {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      "p",
      "br",
      "strong",
      "b",
      "em",
      "i",
      "u",
      "s",
      "span",
      "div",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "ul",
      "ol",
      "li",
      "a",
      "img",
      "blockquote",
      "pre",
      "code",
      "table",
      "thead",
      "tbody",
      "tr",
      "th",
      "td",
    ],
    ALLOWED_ATTR: [
      "href",
      "target",
      "rel",
      "src",
      "alt",
      "title",
      "class",
      "style",
      "width",
      "height",
    ],
  });
}

export function getArticleBodyContent(
  content?: string,
  summary?: string,
): { sanitizedHtml: string; plainBody: string } {
  const rawBody = content || summary || "";
  if (!rawBody) {
    return { sanitizedHtml: "", plainBody: "" };
  }
  if (isHtmlContent(rawBody)) {
    return { sanitizedHtml: sanitizeArticleHtml(rawBody), plainBody: "" };
  }
  return { sanitizedHtml: "", plainBody: rawBody };
}
