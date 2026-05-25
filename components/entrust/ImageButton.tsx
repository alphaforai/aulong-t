import { entrustAssets } from "./assets";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type ImageButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant: "whitelist" | "start";
  children: ReactNode;
  className?: string;
};

const CONFIG = {
  whitelist: { src: entrustAssets.btnWhitelist, minWidth: 150 },
  start: { src: entrustAssets.btnStart, minWidth: 108 },
} as const;

export function ImageButton({
  variant,
  children,
  className = "",
  ...props
}: ImageButtonProps) {
  const { src, minWidth } = CONFIG[variant];
  const height = 44;

  return (
    <button
      type="button"
      className={`relative inline-flex max-w-full shrink-0 select-none items-center justify-center overflow-visible px-4 transition-[transform] duration-150 ease-out will-change-transform enabled:active:translate-y-1 enabled:active:scale-[0.92] disabled:cursor-default disabled:opacity-100 ${className}`}
      style={{
        minWidth,
        width: "max-content",
        height,
        minHeight: height,
      }}
      {...props}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        className="pointer-events-none absolute max-w-none"
        style={{
          width: "114%",
          height: "154%",
          left: "-7%",
          top: "-18%",
        }}
      />
      <span className="relative z-10 max-w-full text-center text-sm font-semibold leading-tight text-white [text-shadow:0_1px_3px_rgba(94,44,44,0.25)]">
        {children}
      </span>
    </button>
  );
}
