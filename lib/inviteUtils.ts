/** 邀请页基础地址，与 inviteCode 以 `?inviteCode=`（或已有查询时 `&inviteCode=`）拼接 */
export function buildInviteLinkWithCode(
  base: string | undefined,
  code: string,
): string {
  const trimmed = String(base ?? "").trim();
  const sep = trimmed.includes("?") ? "&" : "?";
  return `${trimmed}${sep}inviteCode=${encodeURIComponent(code)}`;
}

export function buildInviteInfoText(inviteCode: string, inviteLink: string) {
  return `邀请码：${inviteCode}\n邀请链接：${inviteLink}`;
}
