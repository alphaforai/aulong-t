"use client";

import React from "react";
import DisplayWalletOptions from "@/components/DisplayWalletOptions";
import { entrustAssets } from "@/components/entrust/assets";
import { EntrustImg } from "@/components/entrust/EntrustImg";
import { bsc } from "wagmi/chains";
import {
  useConnections,
  useDisconnect,
  useSignMessage,
  useSwitchChain,
} from "wagmi";
import { getNonce, logout, register, walletLogin } from "@/app/api/auth";
import { useAuthStore } from "@/app/store/authStore";
import { useUserInfoStore } from "@/app/store/userInfo";
import { useInviteCodeStore } from "@/app/store/inviteCode";
import { toast } from "sonner";

const iconDecorate = "/assets/images/section1/iconShield.png";
const iconError = "/assets/images/section1/iconGantanhao.svg";

function isApiSuccess(result: unknown) {
  if (!result || typeof result !== "object") return false;
  const r = result as { success?: boolean; code?: number };
  if (r.success === false) return false;
  if (typeof r.code === "number" && r.code !== 0) return false;
  return true;
}

/** 统一顶栏 — 视觉对齐 Figma TopBar，钱包逻辑来自 xwallet TopBar */
export default function AulongHeader() {
  const [showWalletModal, setShowWalletModal] = React.useState(false);
  const [showInviteCodeModal, setShowInviteCodeModal] = React.useState(false);
  const [inviteCode, setInviteCode] = React.useState("");
  const [inputError, setInputError] = React.useState("");
  const [registerPending, setRegisterPending] = React.useState(false);

  const connections = useConnections();
  const isConnected = connections.length > 0;
  const connectedAddress = connections[0]?.accounts?.[0];
  const { disconnect } = useDisconnect();
  const { signMessageAsync } = useSignMessage();
  const { switchChainAsync } = useSwitchChain();

  const signMessageAsyncRef = React.useRef(signMessageAsync);
  signMessageAsyncRef.current = signMessageAsync;

  const accessToken = useAuthStore((state) => state.accessToken);
  const setAccessToken = useAuthStore((state) => state.setAccessToken);
  const setUserInfo = useUserInfoStore((state) => state.setUserInfo);
  const resetUserInfo = useUserInfoStore((state) => state.resetUserInfo);

  React.useEffect(() => {
    if (!showInviteCodeModal) return;
    const fromStore = useInviteCodeStore.getState().inviteCode;
    setInviteCode(fromStore == null ? "" : String(fromStore).trim());
  }, [showInviteCodeModal]);

  const prevConnectedRef = React.useRef(isConnected);
  const authInFlightRef = React.useRef(false);
  const authedAddressRef = React.useRef<string | null>(null);
  const lastLoginProofRef = React.useRef({ nonce: "", signature: "" });

  React.useEffect(() => {
    if (!prevConnectedRef.current && isConnected && showWalletModal) {
      setShowWalletModal(false);
    }
    prevConnectedRef.current = isConnected;
  }, [isConnected, showWalletModal]);

  React.useEffect(() => {
    const clearLocalSession = () => {
      authedAddressRef.current = null;
      setShowWalletModal(false);
      setShowInviteCodeModal(false);
      setInviteCode("");
      setInputError("");
      lastLoginProofRef.current = { nonce: "", signature: "" };
    };

    const loginWithWallet = async () => {
      if (!connectedAddress || !isConnected || authInFlightRef.current) return;
      if (authedAddressRef.current === connectedAddress) return;

      authInFlightRef.current = true;
      try {
        const { data } = await getNonce(connectedAddress);
        const nonce = data?.nonce;
        if (nonce == null || nonce === "") {
          throw new Error("nonce is missing");
        }
        const message = String(nonce);

        const signature = await signMessageAsyncRef.current({
          message,
          account: connectedAddress,
        });
        lastLoginProofRef.current = { nonce: message, signature };

        const loginResult = await walletLogin({
          walletAddress: connectedAddress,
          nonce: message,
          signature,
        });

        const payload = loginResult.data;

        if (payload == null) {
          setAccessToken(null);
          resetUserInfo();
          setShowInviteCodeModal(true);
        } else {
          const token = payload.accessToken;
          if (!token) {
            throw new Error("accessToken is missing");
          }
          setAccessToken(token);
          if (payload.user != null) {
            setUserInfo(payload.user);
          }
          setShowInviteCodeModal(false);
        }

        authedAddressRef.current = connectedAddress;
      } catch (error) {
        disconnect();
        setAccessToken(null);
        resetUserInfo();
        clearLocalSession();
        console.error("wallet login failed:", error);
      } finally {
        authInFlightRef.current = false;
      }
    };

    if (isConnected && connectedAddress) {
      void loginWithWallet();
    } else if (!isConnected) {
      setAccessToken(null);
      resetUserInfo();
      clearLocalSession();
    }
  }, [
    connectedAddress,
    isConnected,
    disconnect,
    resetUserInfo,
    setAccessToken,
    setUserInfo,
  ]);

  async function endWalletSession() {
    try {
      const token = useAuthStore.getState().accessToken;
      if (token) await logout(token);
    } catch (error) {
      console.error("logout request failed:", error);
    }
    disconnect();
    setAccessToken(null);
    resetUserInfo();
    authedAddressRef.current = null;
    setShowWalletModal(false);
    setShowInviteCodeModal(false);
    setInviteCode("");
    setInputError("");
    lastLoginProofRef.current = { nonce: "", signature: "" };
  }

  async function openWalletModal() {
    setShowWalletModal(true);
    if (!isConnected || connections.length === 0) return;
    const chainId = connections[0]?.chainId;
    if (chainId === bsc.id) return;
    try {
      await switchChainAsync({ chainId: bsc.id });
    } catch (error: unknown) {
      const e = error as { shortMessage?: string; message?: string };
      toast.error(e?.shortMessage || e?.message || "切换到 BSC 网络失败");
    }
  }

  async function handleRegisterInvite() {
    const code = String(inviteCode).trim();
    if (!code) {
      setInputError("邀请码不能为空");
      return;
    }
    if (!connectedAddress) {
      setInputError("请先连接钱包");
      return;
    }
    const { nonce, signature } = lastLoginProofRef.current;
    if (!nonce || !signature) {
      setInputError("登录凭证已失效，请重新连接钱包");
      return;
    }

    setInputError("");
    setRegisterPending(true);
    try {
      const result = await register({
        walletAddress: connectedAddress,
        nonce,
        signature,
        inviteCode: code,
      });

      if (!isApiSuccess(result)) {
        const r = result as { msg?: string; message?: string };
        setInputError(r?.msg || r?.message || "注册失败");
        return;
      }

      const data = (result as { data?: { accessToken?: string; user?: object } })
        .data;
      if (data?.accessToken) setAccessToken(data.accessToken);
      if (data?.user != null) {
        setUserInfo(data.user as Parameters<typeof setUserInfo>[0]);
      }

      toast.success("绑定成功");
      setShowInviteCodeModal(false);
      setInviteCode("");
    } catch (error: unknown) {
      const e = error as { message?: string };
      setInputError(e?.message || "注册失败");
    } finally {
      setRegisterPending(false);
    }
  }

  const shortAddress =
    connectedAddress &&
    `${connectedAddress.slice(0, 4)}...${connectedAddress.slice(-2)}`;

  return (
    <>
      <header className="flex h-14 w-full shrink-0 items-center justify-center px-3">
        <div className="flex h-14 w-full max-w-[351px] items-center justify-between">
          <div className="relative h-11 w-[115px] overflow-hidden">
            <EntrustImg
              src={entrustAssets.logo}
              alt="Aulong"
              width={144}
              height={71}
              className="absolute max-w-none"
              style={{
                height: "161.39%",
                width: "125.34%",
                left: "-16.98%",
                top: "-29.7%",
              }}
              priority
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="切换语言"
              className="relative grid size-[30px] place-items-center"
            >
              <EntrustImg
                src={entrustAssets.langGlow}
                alt=""
                width={30}
                height={30}
                className="col-start-1 row-start-1 size-[30px] scale-[2.8] object-contain"
              />
              <EntrustImg
                src={entrustAssets.langIcon}
                alt=""
                width={22}
                height={22}
                className="col-start-1 row-start-1 ml-1 mt-1"
              />
            </button>

            <button
              type="button"
              onClick={() => void openWalletModal()}
              className="flex h-[30px] w-[108px] items-center justify-center gap-[5px] rounded-[7px] border border-black/20 px-3 py-2"
            >
              <EntrustImg
                src={entrustAssets.walletDot}
                alt=""
                width={7}
                height={7}
                className={`shrink-0 ${accessToken ? "opacity-100" : "opacity-40"}`}
              />
              <span className="text-sm leading-5 tracking-[0.1px] text-[#141414]">
                {shortAddress || "连接钱包"}
              </span>
            </button>
          </div>
        </div>
      </header>

      {showWalletModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-6"
          onClick={() => setShowWalletModal(false)}
        >
          <div
            className="w-full max-w-[329px] rounded-[12px] bg-[#FEFDFA] p-4 shadow-[0_12px_30px_rgba(0,0,0,0.18)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-base font-medium text-[#1E1917]">
                {isConnected ? "钱包管理" : "选择钱包"}
              </h3>
              <button
                type="button"
                onClick={() => setShowWalletModal(false)}
                className="text-sm text-[#9B8D7B]"
              >
                关闭
              </button>
            </div>
            {isConnected ? (
              <button
                type="button"
                onClick={() => void endWalletSession()}
                className="h-11 w-full rounded-[10px] border border-[#EADCC7] bg-[#FFF9EF] text-sm font-medium text-[#8B3A2E] transition-colors hover:bg-[#F7EBD7]"
              >
                断开连接
              </button>
            ) : (
              <div className="flex flex-col gap-2">
                <DisplayWalletOptions />
              </div>
            )}
          </div>
        </div>
      )}

      {showInviteCodeModal && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center px-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="invite-code-title"
          aria-busy={registerPending}
        >
          <button
            type="button"
            disabled={registerPending}
            aria-label={registerPending ? "绑定进行中" : "关闭并断开钱包"}
            className="absolute inset-0 z-0 h-full w-full cursor-pointer border-0 bg-black/50 p-0 disabled:cursor-wait"
            onClick={() => void endWalletSession()}
          />
          <div
            className="relative z-10 w-full max-w-[329px] rounded-[12px] bg-[#FCF9F4] p-4 shadow-[0_12px_30px_rgba(0,0,0,0.18)]"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={iconDecorate}
              alt=""
              className="pointer-events-none absolute right-0 top-[5px] h-[92px] w-[111px]"
            />

            <div className="min-h-[96px] pr-[116px]">
              <h3
                id="invite-code-title"
                className="text-2xl font-medium leading-normal text-black"
              >
                请输入邀请码
              </h3>
              <p className="mt-2 text-xs leading-normal text-[#9B8D7B]">
                当前账号尚未绑定邀请关系，请输入正确的邀请码后继续。
              </p>
            </div>

            <div className="mt-3 h-[38px] w-full rounded-[8px] border-[0.5px] border-[#C8DAF6] bg-white px-2 py-[10px]">
              <input
                type="text"
                value={inviteCode}
                onChange={(e) => {
                  setInviteCode(e.target.value);
                  if (inputError) setInputError("");
                }}
                placeholder="请输入邀请码"
                className="h-full w-full bg-transparent text-sm font-semibold leading-normal text-[#1E1917] outline-none placeholder:font-normal placeholder:text-[#B0A896]"
              />
            </div>

            {inputError && (
              <div className="mt-1 flex items-center gap-0.5">
                <img src={iconError} alt="" className="h-[13px] w-[13px]" />
                <span className="text-xs text-[#F70000]">{inputError}</span>
              </div>
            )}

            <div className="mt-5 flex h-10 items-center justify-center">
              <button
                type="button"
                disabled={registerPending}
                className="h-10 w-[135px] rounded-full bg-linear-to-l from-[#B18031] to-[#E9CB96] text-base font-medium leading-6 text-white shadow-[0_8px_9px_rgba(87,63,13,0.14)] disabled:opacity-60"
                onClick={() => void handleRegisterInvite()}
              >
                {registerPending ? "绑定中..." : "绑定"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
