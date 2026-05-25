/** 邀请链接基础域名（优先环境变量，否则用当前站点 origin） */
export function getInviteLinkBase(): string {
  const fromEnv = process.env.NEXT_PUBLIC_BASE_INVITE_LINK?.trim() ?? "";
  if (fromEnv) return fromEnv;
  if (typeof window !== "undefined") return window.location.origin;
  return "";
}

/** 生成完整邀请链接：https://域名?inviteCode=xxx */
export function buildInviteLinkWithCode(
  base: string | undefined,
  code: string,
): string {
  const trimmedCode = String(code ?? "").trim();
  if (!trimmedCode) return "";

  const origin = String(base ?? "").trim() || getInviteLinkBase();
  if (!origin) return "";

  try {
    const url = new URL(origin.includes("://") ? origin : `https://${origin}`);
    url.searchParams.set("inviteCode", trimmedCode);
    return url.href;
  } catch {
    return "";
  }
}

export function isValidInviteLink(link: string): boolean {
  try {
    const url = new URL(link);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function buildInviteInfoText(inviteCode: string, inviteLink: string) {
  return `邀请码：${inviteCode}\n邀请链接：${inviteLink}`;
}

/** 根据邀请链接生成二维码 Data URL（仅客户端调用） */
export async function buildInviteQrDataUrl(
  inviteLink: string,
  size = 208,
): Promise<string> {
  const QRCode = (await import("qrcode")).default;
  return QRCode.toDataURL(inviteLink, {
    width: size,
    margin: 1,
    errorCorrectionLevel: "M",
  });
}
