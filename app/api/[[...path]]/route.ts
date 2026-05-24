import { NextRequest, NextResponse } from "next/server";

/**
 * 同源 API 转发：浏览器只请求当前站点 /api/...，由 Node 再请求真实后端。
 * 浏览器侧不再触发对外域的 CORS。
 *
 * 环境变量（仅服务端）：API_BACKEND_ORIGIN，例如 https://api.example.com（不要末尾 /）
 */
const HOP_BY_HOP = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailers",
  "transfer-encoding",
  "upgrade",
  "host",
]);

/** Node fetch 可能已解压 body，但后端仍带这些头，浏览器会 ERR_CONTENT_DECODING_FAILED */
const STRIP_RESPONSE_HEADERS = new Set([
  "content-encoding",
  "content-length",
]);

function getBackendOrigin(): string {
  const origin =
    process.env.API_BACKEND_ORIGIN ?? process.env.BACKEND_API_ORIGIN ?? "";
  return origin.replace(/\/$/, "");
}

function buildTargetUrl(pathSegments: string[], search: string): string {
  const base = getBackendOrigin();
  if (!base) {
    throw new Error(
      "缺少 API_BACKEND_ORIGIN（或 BACKEND_API_ORIGIN），无法转发到后端",
    );
  }
  const suffix = pathSegments.length > 0 ? pathSegments.join("/") : "";
  const apiPath = suffix ? `/api/${suffix}` : "/api";
  return `${base}${apiPath}${search}`;
}

function forwardRequestHeaders(request: NextRequest): Headers {
  const out = new Headers();
  request.headers.forEach((value, key) => {
    const lower = key.toLowerCase();
    if (HOP_BY_HOP.has(lower)) return;
    out.set(key, value);
  });
  return out;
}

function sanitizeResponseHeaders(backendHeaders: Headers): Headers {
  const out = new Headers();
  backendHeaders.forEach((value, key) => {
    const lower = key.toLowerCase();
    if (HOP_BY_HOP.has(lower) || STRIP_RESPONSE_HEADERS.has(lower)) return;
    out.set(key, value);
  });
  return out;
}

async function proxy(request: NextRequest, pathSegments: string[]) {
  const url = buildTargetUrl(pathSegments, request.nextUrl.search);
  const headers = forwardRequestHeaders(request);
  headers.set("Accept-Encoding", "identity");

  const method = request.method.toUpperCase();
  const init: RequestInit = {
    method,
    headers,
    redirect: "manual",
  };

  if (method !== "GET" && method !== "HEAD") {
    const buf = await request.arrayBuffer();
    if (buf.byteLength > 0) {
      init.body = buf;
    }
  }

  const backendResponse = await fetch(url, init);
  const responseHeaders = sanitizeResponseHeaders(backendResponse.headers);

  if (method === "HEAD") {
    return new NextResponse(null, {
      status: backendResponse.status,
      statusText: backendResponse.statusText,
      headers: responseHeaders,
    });
  }

  const body = await backendResponse.arrayBuffer();
  return new NextResponse(body, {
    status: backendResponse.status,
    statusText: backendResponse.statusText,
    headers: responseHeaders,
  });
}

type RouteContext = { params: Promise<{ path?: string[] }> };

export async function GET(request: NextRequest, context: RouteContext) {
  const { path = [] } = await context.params;
  return proxy(request, path);
}

export async function POST(request: NextRequest, context: RouteContext) {
  const { path = [] } = await context.params;
  return proxy(request, path);
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const { path = [] } = await context.params;
  return proxy(request, path);
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { path = [] } = await context.params;
  return proxy(request, path);
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const { path = [] } = await context.params;
  return proxy(request, path);
}

export async function OPTIONS(request: NextRequest, context: RouteContext) {
  const { path = [] } = await context.params;
  return proxy(request, path);
}
