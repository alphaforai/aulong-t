import { useAuthStore } from "@/lib/store/authStore";
import { useUserInfoStore } from "@/lib/store/userInfo";

export type WalletLoginProof = {
  nonce: string;
  signature: string;
};

/** 模块级会话状态，跨页面 Header 重挂载后仍保留 */
let authedAddress: string | null = null;
let authInFlight = false;
let lastLoginProof: WalletLoginProof = { nonce: "", signature: "" };

export function getLastLoginProof(): WalletLoginProof {
  return lastLoginProof;
}

export function isAuthInFlight() {
  return authInFlight;
}

export function setAuthInFlight(value: boolean) {
  authInFlight = value;
}

export function markWalletAuthed(address: string) {
  authedAddress = address;
}

export function setLastLoginProof(proof: WalletLoginProof) {
  lastLoginProof = proof;
}

export function clearWalletSession() {
  authedAddress = null;
  authInFlight = false;
  lastLoginProof = { nonce: "", signature: "" };
}

function normalizeAddress(address: string) {
  return address.toLowerCase();
}

/** 当前连接地址是否已与后端完成签名登录 */
export function isWalletSessionSynced(address: string | undefined): boolean {
  if (!address) return false;

  const token = useAuthStore.getState().accessToken;
  if (!token) return false;

  const normalized = normalizeAddress(address);
  if (
    authedAddress &&
    normalizeAddress(authedAddress) === normalized
  ) {
    return true;
  }

  const storedWallet = useUserInfoStore.getState().userInfo.walletAddress;
  if (
    storedWallet &&
    normalizeAddress(storedWallet) === normalized
  ) {
    authedAddress = address;
    return true;
  }

  return false;
}
