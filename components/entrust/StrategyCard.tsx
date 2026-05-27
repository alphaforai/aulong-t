"use client";

import { entrustAssets } from "./assets";
import { AppImage } from "@/components/AppImage";
import { ImageButton } from "./ImageButton";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { toast } from "sonner";

type StrategyCardProps = {
  iconSrc: string;
  iconSize?: number;
  title: string;
  description: string;
  apr?: string;
  period?: string;
};

export function StrategyCard({
  iconSrc,
  iconSize = 32,
  title,
  description,
  apr = "45.23",
  period = "30",
}: StrategyCardProps) {
  const { t } = useTranslation();

  return (
    <article className="relative min-h-[132px] w-full overflow-hidden rounded-[12px] border border-white bg-white/80 p-3 shadow-[0_5px_10px_rgba(51,51,51,0.08)] backdrop-blur-[7px]">
      <div className="flex w-full min-w-0 flex-col gap-[10px]">
        <div className="flex w-full min-w-0 items-center gap-4">
          <AppImage
            src={iconSrc}
            alt=""
            width={iconSize}
            height={iconSize}
            className="shrink-0"
          />
          <div className="min-w-0">
            <h3 className="text-base font-semibold leading-normal text-black">
              {title}
            </h3>
            <p className="text-sm leading-normal text-black/70">{description}</p>
          </div>
        </div>

        <div className="relative h-0 w-[150px] shrink-0">
          <AppImage
            src={entrustAssets.dividerLine}
            alt=""
            width={150}
            height={1}
            className="absolute inset-x-0 top-0 h-px w-full"
          />
        </div>

        <div className="flex gap-[45px]">
          <div>
            <p className="text-xs  text-black/70 font-semibold leading-normal">
              {t("entrust.apr")}
            </p>
            <p className="font-[family-name:var(--font-mulish)] leading-none text-black">
              <span className="text-2xl text-green-600 font-bold leading-normal">{apr}</span>
              <span className="text-xs text-green-600 font-bold leading-normal">%</span>
            </p>
          </div>
          <div>
            <p className="text-xs leading-normal text-black/50">
              {t("entrust.period")}
            </p>
            <p className="leading-none text-black">
              <span className="font-[family-name:var(--font-mulish)] text-2xl leading-normal">
                {period}
              </span>
              <span className="text-xs leading-normal">
                {t("entrust.periodUnit")}
              </span>
            </p>
          </div>
        </div>
      </div>

      <div className="absolute right-3 top-[84px]">
        <ImageButton
          variant="start"
          onClick={() => {
            toast.success(t("common.notOpen"));
          }}
        >
          {t("entrust.start")}
        </ImageButton>
      </div>
    </article>
  );
}
