import Image from "next/image";
import type { CSSProperties } from "react";

type EntrustImgProps = {
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

/** 委托页图片：SVG 用原生 img，位图用 next/image */
export function EntrustImg({
  src,
  alt = "",
  className,
  width,
  height,
  fill,
  style,
  sizes,
  priority,
}: EntrustImgProps) {
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
        sizes={sizes}
        priority={priority}
        unoptimized={src.includes("logo")}
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
