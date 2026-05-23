import { entrustAssets } from "./assets";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type ImageButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant: "whitelist" | "start";
  children: ReactNode;
  className?: string;
};

const CONFIG = {
  whitelist: { src: entrustAssets.btnWhitelist, width: 166 },
  start: { src: entrustAssets.btnStart, width: 130 },
} as const;

export function ImageButton({
  variant,
  children,
  className = "",
  ...props
}: ImageButtonProps) {
  const { src, width } = CONFIG[variant];
  const height = 44;

  return (
    <button
      type="button"
      className={`relative inline-flex shrink-0 items-center justify-center overflow-visible ${className}`}
      style={{ width, height, minWidth: width, minHeight: height }}
      {...props}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        className="pointer-events-none absolute max-w-none"
        style={{
          width: width * 1.14,
          height: height * 1.54,
          left: width * -0.07,
          top: height * -0.18,
        }}
      />
      <span className="relative z-10 text-base font-semibold text-white [text-shadow:0_1px_3px_rgba(94,44,44,0.25)]">
        {children}
      </span>
    </button>
  );
}
