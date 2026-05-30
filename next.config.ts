import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  output: "standalone",
  /** 旧浏览器：对依赖包中的现代语法做降级编译（wagmi/viem 由 Turbopack 按 browserslist 处理） */
  transpilePackages: [
    "wagmi",
    "viem",
    "@walletconnect/ethereum-provider",
    "@tanstack/react-query",
    "zustand",
    "i18next",
    "react-i18next",
    "sonner",
    "recharts",
    "qrcode",
  ],
};

export default nextConfig;

