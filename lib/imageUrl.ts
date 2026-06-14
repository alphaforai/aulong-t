const IMAGE_URL_PREFIX =
  process.env.NEXT_PUBLIC_IMAGE_URL_PREFIX?.trim().replace(/\/$/, "") ?? "";

/** 为相对路径图片 URL 拼接 NEXT_PUBLIC_IMAGE_URL_PREFIX；已是绝对地址则原样返回 */
export function withImageUrlPrefix(url?: string | null): string {
  if (!url) return "";
  const trimmed = url.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (!IMAGE_URL_PREFIX) return trimmed;
  if (trimmed.startsWith("/")) {
    return `${IMAGE_URL_PREFIX}${trimmed}`;
  }
  return `${IMAGE_URL_PREFIX}/${trimmed}`;
}
