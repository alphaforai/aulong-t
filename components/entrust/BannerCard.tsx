import type { ReactNode } from "react";
import { entrustAssets } from "./assets";
import { AppImage } from "@/components/AppImage";

type BannerCardProps = {
  imageSrc: string;
  title: ReactNode;
  description: string;
  variant?: "project" | "startAi";
  onClick?: () => void;
};

export function BannerCard({
  imageSrc,
  title,
  description,
  variant = "project",
  onClick,
}: BannerCardProps) {
  const isStartAi = variant === "startAi";

  return (
    <button
      type="button"
      onClick={onClick}
      className="relative z-10 isolate block h-[88px] w-full max-w-full shrink-0 overflow-hidden rounded-[12px] border border-white bg-white shadow-[0_5px_10px_rgba(51,51,51,0.08)]"
    >
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-[12px] bg-white">
        {isStartAi ? (
          <AppImage
            src={imageSrc}
            alt=""
            width={420}
            height={180}
            className="absolute max-w-none object-cover"
            style={{
              height: "204.01%",
              width: "119.6%",
              left: "-9.8%",
              top: "-50.59%",
            }}
          />
        ) : (
          <AppImage
            src={imageSrc}
            alt=""
            width={371}
            height={108}
            className="absolute max-w-none"
            style={{
              width: "105.7%",
              height: "122.7%",
              left: "-2.85%",
              top: "-5.68%",
            }}
          />
        )}
      </div>

      {!isStartAi && (
        <div className="pointer-events-none absolute left-[114px] top-[2px] h-[79px] w-[169px]">
          <AppImage
            src={entrustAssets.projectGlow}
            alt=""
            width={169}
            height={79}
            className="size-full scale-150 object-contain"
          />
        </div>
      )}

      <div
        className={`absolute z-20 -skew-x-10 scale-y-[0.98] font-noto-sc-black text-[32px] font-black leading-none tracking-[-0.02em] text-black ${
          isStartAi ? "left-[133px] top-4" : "left-[116px] top-1"
        }`}
      >
        {title}
      </div>

      <p
        className={`absolute z-20 line-clamp-3 max-w-[min(200px,52%)] text-left text-[10px] leading-snug text-[#242424] sm:text-xs sm:leading-normal ${
          isStartAi ? "left-[133px] top-14" : "left-[116px] top-11"
        }`}
      >
        {description}
      </p>
    </button>
  );
}
