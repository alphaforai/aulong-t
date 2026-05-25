"use client";

import React from "react";
import { AppImage } from "@/components/AppImage";
import { mineAssets } from "./assets";
import { useUserInfoStore } from "@/lib/store";
import {
  buildInviteInfoText,
  buildInviteLinkWithCode,
  buildInviteQrDataUrl,
  getInviteLinkBase,
  isValidInviteLink,
} from "@/lib/inviteUtils";
import {
  bottomSheetOverlayFrame,
  bottomSheetOverlayRoot,
} from "@/lib/mobileShell";
import { toast } from "sonner";

type InviteFriendsSheetProps = {
  open: boolean;
  onClose: () => void;
};

export function InviteFriendsSheet({ open, onClose }: InviteFriendsSheetProps) {
  const [entered, setEntered] = React.useState(false);
  const [qrDataUrl, setQrDataUrl] = React.useState<string | null>(null);

  const inviteCode = useUserInfoStore((state) => state.userInfo.inviteCode ?? "");
  const needsConnectWallet = inviteCode === "";
  const fullInviteLink = needsConnectWallet
    ? ""
    : buildInviteLinkWithCode(getInviteLinkBase(), inviteCode);

  React.useEffect(() => {
    if (!open || needsConnectWallet || !fullInviteLink || !isValidInviteLink(fullInviteLink)) {
      setQrDataUrl(null);
      return;
    }

    setQrDataUrl(null);
    let cancelled = false;
    void buildInviteQrDataUrl(fullInviteLink, 208)
      .then((url) => {
        if (!cancelled) setQrDataUrl(url);
      })
      .catch(() => {
        if (!cancelled) setQrDataUrl(null);
      });

    return () => {
      cancelled = true;
    };
  }, [open, fullInviteLink, needsConnectWallet, inviteCode]);

  const closeSheet = React.useCallback(() => {
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
      if (e.key === "Escape") closeSheet();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, closeSheet]);

  const copyInviteCode = async () => {
    if (needsConnectWallet) {
      toast.info("请先连接钱包");
      return;
    }
    try {
      await navigator.clipboard.writeText(inviteCode);
      toast.success("已复制邀请码");
    } catch {
      toast.error("复制失败，请重试");
    }
  };

  const copyInviteLink = async () => {
    if (needsConnectWallet) {
      toast.info("请先连接钱包");
      return;
    }
    try {
      await navigator.clipboard.writeText(fullInviteLink);
      toast.success("已复制邀请链接");
    } catch {
      toast.error("复制失败，请重试");
    }
  };

  const copyAllInviteInfo = async () => {
    if (needsConnectWallet) {
      toast.info("请先连接钱包");
      return;
    }
    try {
      await navigator.clipboard.writeText(
        buildInviteInfoText(inviteCode, fullInviteLink),
      );
      toast.success("已复制全部邀请信息");
    } catch {
      toast.error("复制失败，请重试");
    }
  };

  if (!open) return null;

  return (
    <div
      className={`${bottomSheetOverlayRoot} z-70`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="invite-friends-sheet-title"
    >
      <div className={bottomSheetOverlayFrame}>
        <button
          type="button"
          aria-label="关闭"
          className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ease-out ${
            entered ? "opacity-100" : "opacity-0"
          }`}
          onClick={closeSheet}
        />
        <div
          className={`relative flex max-h-[min(640px,92dvh)] w-full flex-col overflow-hidden rounded-t-[12px] bg-white shadow-[0_-12px_40px_rgba(0,0,0,0.15)] transition-transform duration-300 ease-out ${
            entered ? "translate-y-0" : "translate-y-full"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
        <button
          type="button"
          aria-label="关闭"
          onClick={closeSheet}
          className="absolute right-3 top-3 z-20 grid size-[30px] place-items-center"
        >
          <AppImage
            src={mineAssets.inviteSheetClose}
            alt=""
            width={30}
            height={30}
            className="size-[30px]"
          />
        </button>

        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-3 pb-3 pt-5">
          <div className="flex flex-col items-center text-center">
            <h2
              id="invite-friends-sheet-title"
              className="-skew-x-[10.65deg] scale-y-[0.98] font-[family-name:var(--font-noto-sc-black)] text-[42px] font-black leading-none text-black"
            >
              <span>邀请</span>
              <span className="text-[#f82a2a]">好友</span>
            </h2>
            <p className="mt-2 text-xs tracking-[0.6px] text-[#8b8b8b]">
              专属邀请奖励,分享链接赢福利
            </p>
          </div>

          <div className="relative mx-auto mt-4 h-[200px] w-full max-w-[270px] shrink-0">
            <AppImage
              src={mineAssets.inviteSheetIllustration}
              alt=""
              width={270}
              height={227}
              className="h-full w-full object-contain"
            />
          </div>

          <div className="mt-3 rounded-[12px] border border-white bg-white p-3 shadow-[0_5px_10px_rgba(51,51,51,0.08)] backdrop-blur-[7px]">
            <div className="flex gap-3">
              <div className="flex size-[119px] shrink-0 items-center justify-center rounded-[8px] border border-white bg-white/80 p-2 shadow-[0_5px_10px_rgba(51,51,51,0.08)] backdrop-blur-[7px]">
                {qrDataUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={qrDataUrl}
                    alt="邀请二维码"
                    width={104}
                    height={104}
                    className="size-[104px] object-contain"
                  />
                ) : (
                  <div className="flex size-[104px] items-center justify-center px-1 text-center text-[10px] leading-snug text-[#8b8b8b]">
                    {needsConnectWallet ? "请先连接钱包" : "二维码生成中…"}
                  </div>
                )}
              </div>

              <div className="flex min-w-0 flex-1 flex-col gap-[9px]">
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-semibold text-[#262626]">邀请码</p>
                  <div className="flex h-[37px] items-center justify-between rounded-[6px] bg-white px-2 py-2 shadow-[0_5px_5px_rgba(51,51,51,0.08)] backdrop-blur-[7px]">
                    <span className="min-w-0 truncate text-sm text-[#3d3d3d]">
                      {needsConnectWallet ? "请先连接钱包" : inviteCode}
                    </span>
                    <button
                      type="button"
                      aria-label="复制邀请码"
                      disabled={needsConnectWallet}
                      onClick={() => void copyInviteCode()}
                      className="ml-1 shrink-0 disabled:opacity-40"
                    >
                      <AppImage
                        src={mineAssets.inviteSheetCopy}
                        alt=""
                        width={20}
                        height={20}
                        className="size-5"
                      />
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <p className="text-sm font-semibold text-[#262626]">
                    邀请链接
                  </p>
                  <div className="flex h-[37px] items-center justify-between rounded-[6px] bg-white px-2 py-2 shadow-[0_5px_5px_rgba(51,51,51,0.08)] backdrop-blur-[7px]">
                    <span className="min-w-0 flex-1 truncate text-sm text-[#3d3d3d]">
                      {needsConnectWallet ? "请先连接钱包" : fullInviteLink}
                    </span>
                    <button
                      type="button"
                      aria-label="复制邀请链接"
                      disabled={needsConnectWallet}
                      onClick={() => void copyInviteLink()}
                      className="ml-1 shrink-0 disabled:opacity-40"
                    >
                      <AppImage
                        src={mineAssets.inviteSheetCopy}
                        alt=""
                        width={20}
                        height={20}
                        className="size-5"
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="shrink-0 px-3 pb-[max(env(safe-area-inset-bottom),16px)] pt-1">
          <button
            type="button"
            disabled={needsConnectWallet}
            onClick={() => void copyAllInviteInfo()}
            className="relative flex h-[58px] w-full items-center justify-center overflow-hidden rounded-[33px] border border-white text-lg font-medium text-white shadow-[0_4px_6px_rgba(213,0,0,0.12)] transition-opacity disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-[33px] bg-linear-to-r from-[#ff4d00] via-[#ff3033] via-[53.846%] to-[#e90000]"
            />
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-[33px] shadow-[inset_0_-4px_4px_rgba(255,254,227,0.7),inset_0_8px_17px_#ffe5e5]"
            />
            <span className="relative text-shadow-[0_1px_3px_rgba(94,44,44,0.25)]">
              {needsConnectWallet ? "请先连接钱包" : "复制全部邀请信息"}
            </span>
          </button>
        </div>
        </div>
      </div>
    </div>
  );
}
