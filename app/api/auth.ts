const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

function buildApiUrl(path: string) {
  return `${API_BASE_URL.replace(/\/$/, "")}${path}`;
}

export async function getNonce(address: string) {
  const response = await fetch(buildApiUrl("/api/auth/nonce"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept-Language": "zh-CN",
    },
    body: JSON.stringify({ walletAddress: address }),
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result?.message || "get nonce failed");
  }
  return result;
}

export async function walletLogin(walletLoginDTO: {
  walletAddress: string;
  nonce: string;
  signature: string;
}) {
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

export async function refreshAccessToken(accessToken: string | null) {
  const headers: Record<string, string> = {
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
    body: new URLSearchParams().toString(),
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result?.message || "refresh accessToken failed");
  }
  return result;
}

export async function logout(accessToken: string) {
  const headers: Record<string, string> = {
    "Content-Type": "application/x-www-form-urlencoded",
    "Accept-Language": "zh-CN",
    Authorization: `Bearer ${accessToken}`,
  };

  const response = await fetch(buildApiUrl("/api/auth/logout"), {
    method: "POST",
    credentials: "include",
    headers,
    body: new URLSearchParams().toString(),
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result?.message || "logout failed");
  }
  return result;
}

export async function register(registerDTO: {
  walletAddress: string;
  nonce: string;
  signature: string;
  inviteCode: string;
}) {
  const response = await fetch(buildApiUrl("/api/auth/register"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept-Language": "zh-CN",
    },
    body: JSON.stringify(registerDTO),
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result?.message || "register failed");
  }
  return result;
}
