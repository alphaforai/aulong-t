import type { NextConfig } from "next";

const API_BACKEND = process.env.API_BACKEND_ORIGIN ?? "https://api.australianlobster.xyz";

const nextConfig: NextConfig = {
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // 允许局域网 IP 访问开发服务器（修复 HMR WebSocket 连接失败）
  allowedDevOrigins: ["192.168.0.164", "*.192.168.0.164"],

  async rewrites() {
    return [
      {
        // 把所有 /api/* 请求代理到后端
        source: "/api/:path*",
        destination: `${API_BACKEND}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
