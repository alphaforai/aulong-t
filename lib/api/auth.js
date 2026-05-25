const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

function buildApiUrl(path) {
  return `${API_BASE_URL.replace(/\/$/, "")}${path}`;
}

// 动态读取当前语言，与 request.js 保持一致
function getAcceptLanguage() {
  const { getBcp47Tag } = require("@/lib/local");
  const { useLocaleStore } = require("@/lib/store/locale");
  return getBcp47Tag(useLocaleStore.getState().locale);
}

/** 与 request.js 一致：HTTP 200 时仍可能 code !== 0 */
export function isApiSuccess(result) {
  if (!result || typeof result !== "object") return true;
  if (result.success === false) return false;
  if (typeof result.code === "number" && result.code !== 0) return false;
  return true;
}

function getApiErrorMessage(result, fallback) {
  if (typeof result === "string") return result;
  return result?.msg || result?.message || fallback;
}

function assertApiSuccess(result, fallback) {
  if (!isApiSuccess(result)) {
    throw new Error(getApiErrorMessage(result, fallback));
  }
}

/**
 * 获取签名 nonce
 */
export async function getNonce(address) {
  const response = await fetch(buildApiUrl("/api/auth/nonce"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept-Language": getAcceptLanguage(),
    },
    body: JSON.stringify({
      walletAddress: address,
    }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(getApiErrorMessage(result, "get nonce failed"));
  }
  assertApiSuccess(result, "get nonce failed");

  return result;
}

/**
 * 钱包签名登录
 * @param {object} walletLoginDTO 钱包签名登录请求
 * @param {string} walletLoginDTO.walletAddress 钱包地址
 * @param {string} walletLoginDTO.nonce 签名原文（nonce）
 * @param {string} walletLoginDTO.signature 签名
 * @returns {Promise<object>} 登录响应数据
 */
export async function walletLogin(walletLoginDTO) {
  const response = await fetch(buildApiUrl("/api/auth/login"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept-Language": getAcceptLanguage(),
    },
    body: JSON.stringify({
      walletAddress: walletLoginDTO.walletAddress,
      nonce: walletLoginDTO.nonce,
      signature: walletLoginDTO.signature,
    }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(getApiErrorMessage(result, "wallet login failed"));
  }
  assertApiSuccess(result, "wallet login failed");

  return result;
}

/**
 * 刷新 accessToken（refreshToken 在 HttpOnly Cookie 中，需 credentials: include）
 * @param {string|null|undefined} accessToken 当前 accessToken，放在 Authorization 头
 * @returns {Promise<object>} 刷新 token 响应数据
 */
export async function refreshAccessToken(accessToken) {
  const formBody = new URLSearchParams();

  const headers = {
    "Content-Type": "application/x-www-form-urlencoded",
    "Accept-Language": getAcceptLanguage(),
  };
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const response = await fetch(buildApiUrl("/api/auth/refresh"), {
    method: "POST",
    credentials: "include",
    headers,
    body: formBody.toString(),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result?.message || "refresh accessToken failed");
  }

  return result;
}

/**
 * log out
 * @returns {Promise<object>} 登出响应数据
 */
export async function logout(accessToken) {
  const formBody = new URLSearchParams();

  const headers = {
    "Content-Type": "application/x-www-form-urlencoded",
    "Accept-Language": getAcceptLanguage(),
  };
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const response = await fetch(buildApiUrl("/api/auth/logout"), {
    method: "POST",
    credentials: "include",
    headers,
    body: formBody.toString(),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result?.message || "logout failed");
  }

  return result;
}

// /api/auth/register
// post application/json
// {
//     "walletAddress": "",
//     "nonce": "",
//     "signature": "",
//     "inviteCode": ""
//   }
export async function register(registerDTO) {
  const response = await fetch(buildApiUrl("/api/auth/register"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept-Language": getAcceptLanguage(),
    },
    body: JSON.stringify({
      walletAddress: registerDTO.walletAddress,
      nonce: registerDTO.nonce,
      signature: registerDTO.signature,
      inviteCode: registerDTO.inviteCode,
    }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(getApiErrorMessage(result, "register failed"));
  }
  assertApiSuccess(result, "register failed");

  return result;
}
