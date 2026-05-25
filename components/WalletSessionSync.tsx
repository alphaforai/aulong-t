"use client";

import React from "react";
import { useConnection, useDisconnect, useSignMessage } from "wagmi";
import { getNonce, walletLogin } from "@/lib/api/auth";
import {
  clearWalletSession,
  isAuthInFlight,
  isWalletSessionSynced,
  markWalletAuthed,
  resetSessionForAddressChange,
  setAuthInFlight,
  setLastLoginProof,
} from "@/lib/walletSession";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { useAuthStore, useUserInfoStore } from "@/lib/store";
import { toast } from "sonner";

function isUserRejected(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const e = error as { code?: number; name?: string };
  return e.code === 4001 || e.name === "UserRejectedRequestError";
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error) {
    const e = error as Error & { shortMessage?: string };
    return e.shortMessage || e.message || fallback;
  }
  return fallback;
}

/**
 * 全局钱包登录同步：挂在 Provider 下，避免各页 AulongHeader 重挂载时重复签名。
 */
export function WalletSessionSync() {
  const { t } = useTranslation();
  const { isConnected, address } = useConnection();
  const { disconnect } = useDisconnect();
  const { signMessageAsync } = useSignMessage();

  const signMessageAsyncRef = React.useRef(signMessageAsync);
  signMessageAsyncRef.current = signMessageAsync;
  const disconnectRef = React.useRef(disconnect);
  disconnectRef.current = disconnect;

  const setAccessToken = useAuthStore((state) => state.setAccessToken);
  const setNeedsInviteRegister = useAuthStore(
    (state) => state.setNeedsInviteRegister,
  );
  const setUserInfo = useUserInfoStore((state) => state.setUserInfo);
  const resetUserInfo = useUserInfoStore((state) => state.resetUserInfo);
  const prevAddressRef = React.useRef<string | undefined>(undefined);

  React.useEffect(() => {
    const loginWithWallet = async () => {
      if (!address || !isConnected || isAuthInFlight()) return;

      const prev = prevAddressRef.current;
      if (
        prev &&
        prev.toLowerCase() !== address.toLowerCase()
      ) {
        resetSessionForAddressChange();
        setNeedsInviteRegister(false);
        setAccessToken(null);
        resetUserInfo();
      }
      prevAddressRef.current = address;

      if (isWalletSessionSynced(address)) return;

      setAuthInFlight(true);
      try {
        const { data } = await getNonce(address);
        const nonce = data?.nonce;
        if (nonce == null || nonce === "") {
          throw new Error("nonce is missing");
        }
        const message = String(nonce);

        const signature = await signMessageAsyncRef.current({
          message,
          account: address,
        });
        setLastLoginProof({ nonce: message, signature });

        const loginResult = await walletLogin({
          walletAddress: address,
          nonce: message,
          signature,
        });

        const payload = loginResult.data;

        if (payload == null) {
          setAccessToken(null);
          resetUserInfo();
          setNeedsInviteRegister(true);
        } else {
          const token = payload.accessToken;
          if (!token) {
            throw new Error("accessToken is missing");
          }
          setAccessToken(token);
          if (payload.user != null) {
            setUserInfo(payload.user);
          }
          setNeedsInviteRegister(false);
        }

        markWalletAuthed(address);
      } catch (error) {
        disconnectRef.current();
        setAccessToken(null);
        resetUserInfo();
        clearWalletSession();
        setNeedsInviteRegister(false);
        if (!isUserRejected(error)) {
          toast.error(getErrorMessage(error, t("wallet.loginFailed")));
        }
        console.error("wallet login failed:", error);
      } finally {
        setAuthInFlight(false);
      }
    };

    if (isConnected && address) {
      void loginWithWallet();
    } else if (!isConnected) {
      prevAddressRef.current = undefined;
      setAccessToken(null);
      resetUserInfo();
      clearWalletSession();
      setNeedsInviteRegister(false);
    }
  }, [
    address,
    isConnected,
    resetUserInfo,
    setAccessToken,
    setNeedsInviteRegister,
    setUserInfo,
    t,
  ]);

  return null;
}
