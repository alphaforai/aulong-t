"use client";

import React from "react";
import { useConnection, useDisconnect, useSignMessage } from "wagmi";
import { getNonce, walletLogin } from "@/lib/api/auth";
import {
  clearWalletSession,
  isAuthInFlight,
  isWalletSessionSynced,
  markWalletAuthed,
  setAuthInFlight,
  setLastLoginProof,
} from "@/lib/walletSession";
import { useAuthStore, useUserInfoStore } from "@/lib/store";

/**
 * 全局钱包登录同步：挂在 Provider 下，避免各页 AulongHeader 重挂载时重复签名。
 */
export function WalletSessionSync() {
  const { isConnected, address } = useConnection();
  const { disconnect } = useDisconnect();
  const { signMessageAsync } = useSignMessage();

  const signMessageAsyncRef = React.useRef(signMessageAsync);
  signMessageAsyncRef.current = signMessageAsync;

  const setAccessToken = useAuthStore((state) => state.setAccessToken);
  const setNeedsInviteRegister = useAuthStore(
    (state) => state.setNeedsInviteRegister,
  );
  const setUserInfo = useUserInfoStore((state) => state.setUserInfo);
  const resetUserInfo = useUserInfoStore((state) => state.resetUserInfo);

  React.useEffect(() => {
    const loginWithWallet = async () => {
      if (!address || !isConnected || isAuthInFlight()) return;
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
        disconnect();
        setAccessToken(null);
        resetUserInfo();
        clearWalletSession();
        setNeedsInviteRegister(false);
        console.error("wallet login failed:", error);
      } finally {
        setAuthInFlight(false);
      }
    };

    if (isConnected && address) {
      void loginWithWallet();
    } else if (!isConnected) {
      setAccessToken(null);
      resetUserInfo();
      clearWalletSession();
      setNeedsInviteRegister(false);
    }
  }, [
    address,
    isConnected,
    disconnect,
    resetUserInfo,
    setAccessToken,
    setNeedsInviteRegister,
    setUserInfo,
  ]);

  return null;
}
