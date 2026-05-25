import { createConfig, http, fallback } from "wagmi";
import { bsc } from "wagmi/chains";
import { injected, walletConnect } from "wagmi/connectors";

const projectId = process.env.NEXT_PUBLIC_PROJECT_ID;

/** WalletConnect 回跳域名须与当前访问站点一致，否则钱包内浏览器会报 “This page couldn't load” */
function getDappOrigin(): string {
  const fromEnv =
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.NEXT_PUBLIC_BASE_INVITE_LINK ??
    "";
  const trimmed = fromEnv.trim().replace(/\/$/, "");
  if (trimmed) return trimmed;
  return "https://aulong.australianlobster.xyz";
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
