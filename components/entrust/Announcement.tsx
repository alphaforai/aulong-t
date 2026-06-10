"use client";

import { AppImage } from "@/components/AppImage";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { entrustAssets } from "./assets";
import { toast } from "sonner";

type AnnouncementProps = {
  onClick?: () => void;
};

/** 公告栏 — Figma 969:2244 */
export function Announcement({ onClick }: AnnouncementProps) {
  const { t } = useTranslation();

  return (
    <button
      type="button"
      onClick={onClick ?? (() => toast.success(t("common.notOpen")))}
      className="flex h-12 w-full shrink-0 items-center gap-[3px] overflow-hidden rounded-[12px] bg-white/80 px-3 shadow-[0_5px_10px_rgba(51,51,51,0.08)] backdrop-blur-[7px]"
    >
      <div className="relative size-[34px] shrink-0">
        <AppImage
          src={entrustAssets.announcementIcon}
          alt=""
          width={34}
          height={34}
          className="pointer-events-none absolute inset-0 size-full max-w-none object-bottom"
        />
      </div>
      <p className="min-w-0 flex-1 truncate text-left text-sm leading-normal text-[#212a34]">
        {t("entrust.announcementText")}
      </p>
    </button>
  );
}
