"use client";

import React from "react";
import DisplayWalletOptions from "@/components/DisplayWalletOptions";
import { entrustAssets } from "@/components/entrust/assets";
import { AppImage } from "@/components/AppImage";
import { bsc } from "wagmi/chains";
import {
  useConnection,
  useDisconnect,
  useSignMessage,
  useSwitchChain,
} from "wagmi";
import { getNonce, logout, register, walletLogin } from "@/lib/api/auth";
import {
  useAuthStore,
  useInviteCodeStore,
  useUserInfoStore,
} from "@/lib/store";
import { toast } from "sonner";

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
  const [walletSheetEntered, setWalletSheetEntered] = React.useState(false);
  const [showInviteCodeModal, setShowInviteCodeModal] = React.useState(false);
  const [inviteSheetEntered, setInviteSheetEntered] = React.useState(false);
  const [inviteCode, setInviteCode] = React.useState("");
  const [inputError, setInputError] = React.useState("");
  const [registerPending, setRegisterPending] = React.useState(false);

  const { isConnected, address, chainId } = useConnection();
  const { disconnect } = useDisconnect();
  const { signMessageAsync } = useSignMessage();
  const { switchChainAsync } = useSwitchChain();

  const signMessageAsyncRef = React.useRef(signMessageAsync);
  signMessageAsyncRef.current = signMessageAsync;

  const accessToken = useAuthStore((state) => state.accessToken);
  const setAccessToken = useAuthStore((state) => state.setAccessToken);
  const setUserInfo = useUserInfoStore((state) => state.setUserInfo);
  const resetUserInfo = useUserInfoStore((state) => state.resetUserInfo);

  const closeWalletModal = React.useCallback(() => {
    setWalletSheetEntered(false);
    window.setTimeout(() => setShowWalletModal(false), 300);
  }, []);

  const closeInviteSheet = React.useCallback(() => {
    setInviteSheetEntered(false);
    window.setTimeout(() => {
      setShowInviteCodeModal(false);
      setInviteCode("");
      setInputError("");
    }, 300);
  }, []);

  React.useEffect(() => {
    if (!showWalletModal) {
      setWalletSheetEntered(false);
      return;
    }
    const frame = requestAnimationFrame(() => {
      requestAnimationFrame(() => setWalletSheetEntered(true));
    });
    return () => cancelAnimationFrame(frame);
  }, [showWalletModal]);

  React.useEffect(() => {
    if (!showInviteCodeModal) {
      setInviteSheetEntered(false);
      return;
    }
    const frame = requestAnimationFrame(() => {
      requestAnimationFrame(() => setInviteSheetEntered(true));
    });
    return () => cancelAnimationFrame(frame);
  }, [showInviteCodeModal]);

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
      closeWalletModal();
    }
    prevConnectedRef.current = isConnected;
  }, [isConnected, showWalletModal, closeWalletModal]);

  React.useEffect(() => {
    const clearLocalSession = () => {
      authedAddressRef.current = null;
      setShowWalletModal(false);
      setWalletSheetEntered(false);
      setShowInviteCodeModal(false);
      setInviteSheetEntered(false);
      setInviteCode("");
      setInputError("");
      lastLoginProofRef.current = { nonce: "", signature: "" };
    };

    const loginWithWallet = async () => {
      if (!address || !isConnected || authInFlightRef.current) return;
      if (authedAddressRef.current === address) return;

      authInFlightRef.current = true;
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
        lastLoginProofRef.current = { nonce: message, signature };

        const loginResult = await walletLogin({
          walletAddress: address,
          nonce: message,
          signature,
        });

        const payload = loginResult.data;
        console.log("wallet login result:", payload);

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
          setInviteSheetEntered(false);
        }

        authedAddressRef.current = address;
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

    if (isConnected && address) {
      void loginWithWallet();
    } else if (!isConnected) {
      setAccessToken(null);
      resetUserInfo();
      clearLocalSession();
    }
  }, [
    address,
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
    closeWalletModal();
    setInviteSheetEntered(false);
    setShowInviteCodeModal(false);
    setInviteCode("");
    setInputError("");
    lastLoginProofRef.current = { nonce: "", signature: "" };
  }

  async function openWalletModal() {
    setShowWalletModal(true);
    if (!isConnected) return;
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
    if (!address) {
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
        walletAddress: address,
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
      closeInviteSheet();
    } catch (error: unknown) {
      const e = error as { message?: string };
      setInputError(e?.message || "注册失败");
    } finally {
      setRegisterPending(false);
    }
  }

  const shortAddress =
    address && `${address.slice(0, 4)}...${address.slice(-2)}`;

  return (
    <>
      <header className="flex h-14 w-full shrink-0 items-center justify-center px-3">
        <div className="flex h-14 w-full max-w-[351px] items-center justify-between">
          <div className="relative h-11 w-[115px] overflow-hidden">
            <AppImage
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
              <AppImage
                src={entrustAssets.langGlow}
                alt=""
                width={30}
                height={30}
                className="col-start-1 row-start-1 size-[30px] scale-[2.8] object-contain"
              />
              <AppImage
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
              <AppImage
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
        <div className="fixed inset-0 z-60 flex flex-col justify-end">
          <button
            type="button"
            aria-label="关闭"
            className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ease-out ${
              walletSheetEntered ? "opacity-100" : "opacity-0"
            }`}
            onClick={closeWalletModal}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="wallet-sheet-title"
            className={`relative flex h-[50dvh] w-full flex-col rounded-t-2xl bg-white px-4 pt-3 pb-[max(env(safe-area-inset-bottom),20px)] shadow-[0_-12px_40px_rgba(0,0,0,0.15)] transition-transform duration-300 ease-out ${
              walletSheetEntered ? "translate-y-0" : "translate-y-full"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="mx-auto mb-4 h-1 w-10 rounded-full bg-[#e5e5e5]"
              aria-hidden
            />
            <div className="mb-3 flex items-center justify-between">
              <h3
                id="wallet-sheet-title"
                className="text-base font-semibold text-[#333]"
              >
                {isConnected ? "钱包管理" : "选择钱包"}
              </h3>
              <button
                type="button"
                onClick={closeWalletModal}
                className="text-sm text-[#8b8b8b]"
              >
                关闭
              </button>
            </div>
            {isConnected ? (
              <button
                type="button"
                onClick={() => void endWalletSession()}
                className="h-11 w-full rounded-[10px] border border-[#f0e0e0] bg-white text-sm font-medium text-[#ea4747] transition-colors hover:bg-[#fff8f8]"
              >
                断开连接
              </button>
            ) : (
              <div className="flex flex-col gap-3">
                <DisplayWalletOptions />
              </div>
            )}
            <div className="flex-1" aria-hidden />
          </div>
        </div>
      )}

      {showInviteCodeModal && (
        <div
          className="fixed inset-0 z-70 flex flex-col justify-end"
          role="dialog"
          aria-modal="true"
          aria-labelledby="invite-code-title"
          aria-busy={registerPending}
        >
          <button
            type="button"
            disabled={registerPending}
            aria-label={registerPending ? "绑定进行中" : "关闭并断开钱包"}
            className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ease-out disabled:cursor-wait ${
              inviteSheetEntered ? "opacity-100" : "opacity-0"
            }`}
            onClick={() => void endWalletSession()}
          />
          <div
            className={`relative flex h-[50dvh] w-full flex-col rounded-t-2xl bg-white px-4 pt-3 pb-[max(env(safe-area-inset-bottom),20px)] shadow-[0_-12px_40px_rgba(0,0,0,0.15)] transition-transform duration-300 ease-out ${
              inviteSheetEntered ? "translate-y-0" : "translate-y-full"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="mx-auto mb-4 h-1 w-10 rounded-full bg-[#e5e5e5]"
              aria-hidden
            />
            <div className="mb-3 flex items-center justify-between">
              <h3
                id="invite-code-title"
                className="text-base font-semibold text-[#333]"
              >
                绑定<span className="text-[#f82a2a]">邀请码</span>
              </h3>
              <button
                type="button"
                disabled={registerPending}
                onClick={() => void endWalletSession()}
                className="text-sm text-[#8b8b8b] disabled:cursor-wait disabled:opacity-50"
              >
                取消
              </button>
            </div>

            <p className="text-xs leading-relaxed text-[#8b8b8b]">
              当前账号尚未绑定邀请关系，请输入正确的邀请码后继续使用。
            </p>

            <div className="mt-4 flex h-11 w-full items-center rounded-[10px] border border-[#f0e0e0] bg-white px-3 transition-colors focus-within:border-[#ff3033]/40 focus-within:ring-2 focus-within:ring-[#ff3033]/10">
              <input
                type="text"
                value={inviteCode}
                disabled={registerPending}
                onChange={(e) => {
                  setInviteCode(e.target.value);
                  if (inputError) setInputError("");
                }}
                placeholder="请输入邀请码"
                className="h-full w-full bg-transparent text-sm font-medium text-[#333] outline-none placeholder:font-normal placeholder:text-[#bbb] disabled:cursor-wait"
              />
            </div>

            {inputError && (
              <p className="mt-2 text-xs text-[#f70000]">{inputError}</p>
            )}

            <button
              type="button"
              disabled={registerPending}
              className="mt-5 flex h-11 w-full items-center justify-center rounded-[10px] bg-linear-to-r from-[#ff4d00] via-[#ff3033] via-[53.846%] to-[#e90000] text-base font-semibold text-white shadow-[0_4px_12px_rgba(213,0,0,0.2)] transition-opacity disabled:cursor-wait disabled:opacity-60"
              onClick={() => void handleRegisterInvite()}
            >
              {registerPending ? "绑定中..." : "确认绑定"}
            </button>

            <div className="flex-1" aria-hidden />
          </div>
        </div>
      )}
    </>
  );
}
