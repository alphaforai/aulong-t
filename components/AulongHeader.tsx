"use client";

import React from "react";
import DisplayWalletOptions from "@/components/DisplayWalletOptions";
import { entrustAssets } from "@/components/entrust/assets";
import { AppImage } from "@/components/AppImage";
import { bsc } from "wagmi/chains";
import {
  useConnection,
  useDisconnect,
  useSwitchChain,
} from "wagmi";
import { logout, register } from "@/lib/api/auth";
import {
  clearWalletSession,
  getLastLoginProof,
  markWalletAuthed,
} from "@/lib/walletSession";
import {
  useAuthStore,
  useInviteCodeStore,
  useUserInfoStore,
} from "@/lib/store";
import { useTranslation } from "@/lib/hooks/useTranslation";
import {
  bottomSheetOverlayFrame,
  bottomSheetOverlayRoot,
} from "@/lib/mobileShell";
import { isAlternateLocaleHeaderStyle } from "@/lib/local/locale-meta";
import { LanguagePickerSheet } from "@/components/LanguagePickerSheet";
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
  const { t, locale } = useTranslation();
  const [showLanguageSheet, setShowLanguageSheet] = React.useState(false);
  const [showWalletModal, setShowWalletModal] = React.useState(false);
  const alternateLangStyle = isAlternateLocaleHeaderStyle(locale);
  const [walletSheetEntered, setWalletSheetEntered] = React.useState(false);
  const [showInviteCodeModal, setShowInviteCodeModal] = React.useState(false);
  const [inviteSheetEntered, setInviteSheetEntered] = React.useState(false);
  const [inviteCode, setInviteCode] = React.useState("");
  const [inputError, setInputError] = React.useState("");
  const [registerPending, setRegisterPending] = React.useState(false);

  const { isConnected, address, chainId } = useConnection();
  const { disconnect } = useDisconnect();
  const { switchChainAsync } = useSwitchChain();

  const accessToken = useAuthStore((state) => state.accessToken);
  const needsInviteRegister = useAuthStore((state) => state.needsInviteRegister);
  const setAccessToken = useAuthStore((state) => state.setAccessToken);
  const setNeedsInviteRegister = useAuthStore(
    (state) => state.setNeedsInviteRegister,
  );
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

  React.useEffect(() => {
    setShowInviteCodeModal(Boolean(needsInviteRegister && isConnected));
  }, [needsInviteRegister, isConnected]);

  const prevConnectedRef = React.useRef(isConnected);

  React.useEffect(() => {
    if (!prevConnectedRef.current && isConnected && showWalletModal) {
      closeWalletModal();
    }
    prevConnectedRef.current = isConnected;
  }, [isConnected, showWalletModal, closeWalletModal]);

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
    clearWalletSession();
    setNeedsInviteRegister(false);
    closeWalletModal();
    setInviteSheetEntered(false);
    setShowInviteCodeModal(false);
    setInviteCode("");
    setInputError("");
  }

  async function openWalletModal() {
    setShowWalletModal(true);
    if (!isConnected) return;
    if (chainId === bsc.id) return;
    try {
      await switchChainAsync({ chainId: bsc.id });
    } catch (error: unknown) {
      const e = error as { shortMessage?: string; message?: string };
      toast.error(
        e?.shortMessage || e?.message || t("header.switchBscFailed"),
      );
    }
  }

  async function handleRegisterInvite() {
    const code = String(inviteCode).trim();
    if (!code) {
      setInputError(t("header.inviteCodeEmpty"));
      return;
    }
    if (!address) {
      setInputError(t("header.connectWalletFirst"));
      return;
    }
    const { nonce, signature } = getLastLoginProof();
    if (!nonce || !signature) {
      setInputError(t("header.loginProofExpired"));
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
        setInputError(r?.msg || r?.message || t("header.registerFailed"));
        return;
      }

      const data = (result as { data?: { accessToken?: string; user?: object } })
        .data;
      if (data?.accessToken) setAccessToken(data.accessToken);
      if (data?.user != null) {
        setUserInfo(data.user as Parameters<typeof setUserInfo>[0]);
      }
      setNeedsInviteRegister(false);
      markWalletAuthed(address);

      toast.success(t("header.bindSuccess"));
      closeInviteSheet();
    } catch (error: unknown) {
      const e = error as { message?: string };
      setInputError(e?.message || t("header.registerFailed"));
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
              aria-label={t("header.switchLanguage")}
              onClick={() => setShowLanguageSheet(true)}
              className={`relative grid size-[30px] place-items-center overflow-hidden rounded-full transition-colors duration-200 ${
                alternateLangStyle ? "bg-[#2e2e2e]" : "bg-transparent"
              }`}
            >
              <AppImage
                src={entrustAssets.langGlow}
                alt=""
                width={30}
                height={30}
                className={`col-start-1 row-start-1 size-[30px] scale-[2.8] object-contain transition-opacity duration-200 ${
                  alternateLangStyle ? "opacity-30" : "opacity-100"
                }`}
              />
              <AppImage
                src={entrustAssets.langIcon}
                alt=""
                width={22}
                height={22}
                className={`col-start-1 row-start-1 ml-1 mt-1 transition-[filter] duration-200 ${
                  alternateLangStyle ? "brightness-0 invert" : ""
                }`}
              />
            </button>

            <button
              type="button"
              onClick={() => void openWalletModal()}
              className={`flex h-[30px] max-w-[min(148px,38vw)] shrink-0 items-center justify-center gap-[5px] rounded-[7px] border border-black/20 px-2 py-2 ${
                shortAddress ? "w-[108px]" : "min-w-[4.75rem] w-auto"
              }`}
            >
              <AppImage
                src={entrustAssets.walletDot}
                alt=""
                width={7}
                height={7}
                className={`shrink-0 ${accessToken ? "opacity-100" : "opacity-40"}`}
              />
              <span
                className={`min-w-0 truncate text-center leading-none tracking-[0.1px] text-[#141414] ${
                  shortAddress
                    ? "text-sm"
                    : "text-xs font-medium sm:text-sm"
                }`}
              >
                {shortAddress || t("header.connectWalletBtn")}
              </span>
            </button>
          </div>
        </div>
      </header>

      <LanguagePickerSheet
        open={showLanguageSheet}
        onClose={() => setShowLanguageSheet(false)}
      />

      {showWalletModal && (
        <div className={`${bottomSheetOverlayRoot} z-60`}>
          <div className={bottomSheetOverlayFrame}>
            <button
              type="button"
              aria-label={t("common.close")}
              className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ease-out ${
                walletSheetEntered ? "opacity-100" : "opacity-0"
              }`}
              onClick={closeWalletModal}
            />
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="wallet-sheet-title"
              className={`relative flex h-[50dvh] w-full flex-col rounded-t-2xl bg-white px-4 pt-3 pb-[max(env(safe-area-inset-bottom),20px)] shadow-[0_-12px_40px_rgba(0,0,0,0.15)] transition-transform duration-300 ease-out md:rounded-t-2xl ${
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
                {isConnected
                  ? t("header.walletManageBtn")
                  : t("header.selectWalletBtn")}
              </h3>
              <button
                type="button"
                onClick={closeWalletModal}
                className="text-sm text-[#8b8b8b]"
              >
                {t("common.close")}
              </button>
            </div>
            {isConnected ? (
              <button
                type="button"
                onClick={() => void endWalletSession()}
                className="h-11 w-full rounded-[10px] border border-[#f0e0e0] bg-white text-sm font-medium text-[#ea4747] transition-colors hover:bg-[#fff8f8]"
              >
                {t("header.disconnectBtn")}
              </button>
            ) : (
              <div className="flex flex-col gap-3">
                <DisplayWalletOptions />
              </div>
            )}
            <div className="flex-1" aria-hidden />
            </div>
          </div>
        </div>
      )}

      {showInviteCodeModal && (
        <div
          className={`${bottomSheetOverlayRoot} z-70`}
          role="dialog"
          aria-modal="true"
          aria-labelledby="invite-code-title"
          aria-busy={registerPending}
        >
          <div className={bottomSheetOverlayFrame}>
            <button
              type="button"
              disabled={registerPending}
              aria-label={
                registerPending ? t("header.bindPending") : t("common.close")
              }
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
                {t("header.bindInviteTitle")}
              </h3>
              <button
                type="button"
                disabled={registerPending}
                onClick={() => void endWalletSession()}
                className="text-sm text-[#8b8b8b] disabled:cursor-wait disabled:opacity-50"
              >
                {t("common.cancel")}
              </button>
            </div>

            <p className="text-xs leading-relaxed text-[#8b8b8b]">
              {t("header.bindInviteHint")}
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
                placeholder={t("header.inviteCodePlaceholder")}
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
              {registerPending
                ? t("header.bindPendingBtn")
                : t("header.confirmBindBtn")}
            </button>

            <div className="flex-1" aria-hidden />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
