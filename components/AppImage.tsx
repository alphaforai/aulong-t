import Image from "next/image";
import type { CSSProperties } from "react";

type AppImageProps = {
  src: string;
  alt?: string;
  className?: string;
  width?: number;
  height?: number;
  fill?: boolean;
  style?: CSSProperties;
  sizes?: string;
  priority?: boolean;
};

function isSvg(src: string) {
  return src.endsWith(".svg");
}

/** CSS 改尺寸时不用 next/image，避免宽高比警告 */
function shouldUseNativeImg(style?: CSSProperties, className?: string) {
  if (
    typeof style?.width === "string" ||
    typeof style?.height === "string"
  ) {
    return true;
  }
  if (className) {
    if (/\b[hw]-\[[^\]]+%\]/.test(className)) return true;
    // Figma 裁切：size / inset 百分比定位
    if (/\b(size|left|top|right|bottom)-\[[^\]]*%\]/.test(className)) {
      return true;
    }
  }
  return false;
}

/** 全站图片：SVG / Figma 裁切用原生 img，常规位图用 next/image */
export function AppImage({
  src,
  alt = "",
  className,
  width,
  height,
  fill,
  style,
  sizes,
  priority,
}: AppImageProps) {
  if (isSvg(src)) {
    if (fill) {
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          className={className}
          style={{ ...style, width: "100%", height: "100%", objectFit: "fill" }}
        />
      );
    }
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={className}
        style={style}
      />
    );
  }

  if (fill) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        className={className}
        style={style}
        sizes={sizes ?? "(max-width: 375px) 100vw, 375px"}
        priority={priority}
        unoptimized={src.includes("logo")}
      />
    );
  }

  if (shouldUseNativeImg(style, className)) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={className}
        style={style}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width ?? 1}
      height={height ?? 1}
      className={className}
      style={style}
      priority={priority}
      unoptimized={src.includes("logo")}
    />
  );
}
