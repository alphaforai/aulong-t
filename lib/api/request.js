import { useAuthStore } from "@/lib/store/authStore";
import { refreshAccessToken } from "@/lib/api/auth";
import { getBcp47Tag } from "@/lib/local";
import { useLocaleStore } from "@/lib/store/locale";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

function buildApiUrl(path) {
  return `${API_BASE_URL.replace(/\/$/, "")}${path}`;
}

const getAccessToken = () => {
  return useAuthStore.getState().accessToken;
};

let refreshPromise = null;

export function clearAuthTokens() {
  useAuthStore.getState().setAccessToken(null);
  // refreshToken 由后端写入 HttpOnly Cookie，前端无法直接清除
}

function saveRefreshResult(result) {
  const data = result?.data ?? result;
  if (!data?.accessToken) {
    throw new Error("refresh token response missing accessToken");
  }
  useAuthStore.getState().setAccessToken(data.accessToken);

  return data.accessToken;
}

async function refreshStoredAccessToken() {
  if (refreshPromise) {
    return refreshPromise;
  }
  refreshPromise = (async () => {
    const accessToken = getAccessToken();
    const result = await refreshAccessToken(accessToken);
    if (!isBusinessSuccess(result)) {
      throw toError(result, "refresh accessToken failed");
    }

    return saveRefreshResult(result);
  })();

  try {
    return await refreshPromise;
  } finally {
    refreshPromise = null;
  }
}

function notifyLoginRequired(message = "登录已过期，请重新连接钱包") {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(
    new CustomEvent("auth:login-required", {
      detail: { message },
    }),
  );
}

// 处理空 body 或非 JSON 内容的响应
async function parseResponse(response) {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function isAccessTokenExpired(response, result) {
  return response.status === 401 || result?.code === 40103;
}

function getErrorMessage(result, fallback) {
  if (typeof result === "string") {
    return result;
  }
  return result?.msg || result?.message || fallback;
}

function isBusinessSuccess(result) {
  if (!result || typeof result !== "object") {
    return true;
  }
  if (result.success === false) {
    return false;
  }
  if (typeof result.code === "number" && result.code !== 0) {
    return false;
  }
  return true;
}

function toError(result, fallback, status) {
  const error = new Error(getErrorMessage(result, fallback));
  if (typeof result === "object" && result !== null) {
    error.code = result.code;
    error.data = result.data;
  }
  error.status = status;
  error.result = result;
  return error;
}

function shouldSetJsonContentType(body, headers) {
  return (
    body !== undefined &&
    !(body instanceof FormData) &&
    !(body instanceof URLSearchParams) &&
    typeof body !== "string" &&
    !headers.has("Content-Type")
  );
}

function serializeBody(body) {
  if (
    body === undefined ||
    body instanceof FormData ||
    body instanceof URLSearchParams ||
    typeof body === "string"
  ) {
    return body;
  }
  return JSON.stringify(body);
}

function buildRequestInit(options, accessToken) {
  const headers = new Headers(options.headers);

  if (accessToken && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  if (shouldSetJsonContentType(options.body, headers)) {
    headers.set("Content-Type", "application/json");
  }

  if (!headers.has("Accept-Language")) {
    headers.set(
      "Accept-Language",
      getBcp47Tag(useLocaleStore.getState().locale),
    );
  }

  return {
    ...options,
    headers,
    body: serializeBody(options.body),
  };
}

/**
 * 统一请求封装：
 * - 自动携带 accessToken
 * - accessToken 过期时自动刷新并重试一次
 * - 并发 refresh 锁（复用同一个 refreshPromise）
 * - 统一错误处理（HTTP 非 2xx / 业务 code 非 0）
 */
export async function request(path, options = {}) {
  const { auth = true, retryOnAuth = true, ...fetchOptions } = options;
  const accessToken = auth ? getAccessToken() : null;

  const firstResponse = await fetch(
    buildApiUrl(path),
    buildRequestInit(fetchOptions, accessToken),
  );
  const firstResult = await parseResponse(firstResponse);

  if (auth && retryOnAuth && isAccessTokenExpired(firstResponse, firstResult)) {
    try {
      const newAccessToken = await refreshStoredAccessToken();
      const retryResponse = await fetch(
        buildApiUrl(path),
        buildRequestInit(fetchOptions, newAccessToken),
      );
      const retryResult = await parseResponse(retryResponse);

      if (!retryResponse.ok || !isBusinessSuccess(retryResult)) {
        throw toError(retryResult, "request failed", retryResponse.status);
      }

      return retryResult;
    } catch (error) {
      clearAuthTokens();
      notifyLoginRequired(error?.message);
      throw error;
    }
  }

  if (!firstResponse.ok || !isBusinessSuccess(firstResult)) {
    throw toError(firstResult, "request failed", firstResponse.status);
  }

  return firstResult;
}
  
