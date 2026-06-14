import { createConfig, http, fallback } from "wagmi";
import { bsc } from "wagmi/chains";
import { injected, walletConnect } from "wagmi/connectors";

const projectId = process.env.NEXT_PUBLIC_PROJECT_ID;

const DEFAULT_DAPP_ORIGIN = "https://aulong.australianlobster.xyz";

/**
 * WalletConnect metadata.url（见下方 walletConnect.metadata）
 * 须与当前浏览器地址一致；不要用 NEXT_PUBLIC_BASE_INVITE_LINK（那是邀请链接域名）
 */
function getDappOrigin(): string {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, "");
  if (appUrl) return appUrl;
  return DEFAULT_DAPP_ORIGIN;
}

const dappOrigin = getDappOrigin();

export const config = createConfig({
  chains: [bsc],
  transports: {
    [bsc.id]: fallback([
      http(process.env.NEXT_PUBLIC_RPC_URL_BSCMAINNET),
      // viem default rpc url
      http(),
    ]),
  },
  connectors: [
    injected(),
    walletConnect({
      projectId: projectId ?? "",
      metadata: {
        name: "Aulong",
        description: "Aulong",
        url: dappOrigin,
        icons: [`${dappOrigin}/icon.png`],
      },
    }),
  ],
  ssr: true,
});
