const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

function buildApiUrl(path) {
  return `${API_BASE_URL.replace(/\/$/, "")}${path}`;
}

/**
 * 获取签名 nonce
 */
export async function getNonce(address) {
  const response = await fetch(buildApiUrl("/api/auth/nonce"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept-Language": "zh-CN",
    },
    body: JSON.stringify({
      walletAddress: address,
    }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result?.message || "get nonce failed");
  }

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
      "Accept-Language": "zh-CN",
    },
    body: JSON.stringify({
      walletAddress: walletLoginDTO.walletAddress,
      nonce: walletLoginDTO.nonce,
      signature: walletLoginDTO.signature,
    }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result?.message || "wallet login failed");
  }

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
    "Accept-Language": "zh-CN",
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
    "Accept-Language": "zh-CN",
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
      "Accept-Language": "zh-CN",
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
    throw new Error(result?.message || "register failed");
  }

  return result;
}
