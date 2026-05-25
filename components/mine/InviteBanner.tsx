"use client";

import React from "react";
import { AppImage } from "@/components/AppImage";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { mineAssets } from "./assets";
import { InviteFriendsSheet } from "./InviteFriendsSheet";

export function InviteBanner() {
  const { t } = useTranslation();
  const [showInviteSheet, setShowInviteSheet] = React.useState(false);

  return (
    <>
      <button
        type="button"
        aria-label={t("mine.inviteOpen")}
        onClick={() => setShowInviteSheet(true)}
        className="relative h-[88px] w-full shrink-0 overflow-hidden rounded-[12px] border border-white text-left shadow-[0_5px_10px_rgba(51,51,51,0.08)] transition-opacity active:opacity-90"
      >
        <div className="absolute inset-0 overflow-hidden rounded-[12px] backdrop-blur-[7px]">
          <AppImage
            src={mineAssets.inviteBannerBg}
            alt=""
            width={351}
            height={88}
            className="absolute max-w-none"
            style={{
              height: "152%",
              width: "114.57%",
              left: "-7.41%",
              top: "-25%",
            }}
          />
        </div>

        <div className="relative z-10 ml-[120px] mt-[17px] pr-3">
          <h2 className="-skew-x-[10deg] flex items-center gap-1 font-[family-name:var(--font-noto-sc-black)] text-[28px] font-black leading-normal text-black">
            <span>{t("mine.invitePart1")}</span>
            <span className="text-[#f82a2a]">{t("mine.invitePart2")}</span>
          </h2>
          <p className="mt-1 max-w-full truncate text-[10px] leading-normal tracking-[0.5px] text-[#8b8b8b]">
            {t("mine.inviteSubtitle")}
          </p>
        </div>
      </button>

      <InviteFriendsSheet
        open={showInviteSheet}
        onClose={() => setShowInviteSheet(false)}
      />
    </>
  );
}
