import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * 维护模式：在环境变量中设置 MAINTENANCE_MODE=true
 * 除 /maintenance、/api、静态资源外，其余路径重定向到维护页
 */
export function proxy(request: NextRequest) {
  if (process.env.MAINTENANCE_MODE !== "true") {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/maintenance") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname === "/icon.png" ||
    pathname.startsWith("/assets")
  ) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = "/maintenance";
  url.search = "";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
