import { createConfig, http, fallback } from "wagmi";
import { bsc } from "wagmi/chains";
import { injected, walletConnect } from "wagmi/connectors";

const projectId = process.env.NEXT_PUBLIC_PROJECT_ID?.trim();

/**
 * WalletConnect metadata.url（见下方 walletConnect.metadata）
 */
function getDappOrigin(): string {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return "";
}

const dappOrigin = getDappOrigin();

const connectors = [
  injected(),
  ...(projectId
    ? [
        walletConnect({
          projectId,
          metadata: {
            name: "Aulong",
            description: "Aulong",
            url: dappOrigin,
            icons: [`${dappOrigin}/icon.png`],
          },
        }),
      ]
    : []),
];

export const config = createConfig({
  chains: [bsc],
  transports: {
    [bsc.id]: fallback([
      http(process.env.NEXT_PUBLIC_RPC_URL_BSCMAINNET),
      // viem default rpc url
      http(),
    ]),
  },
  connectors,
  ssr: true,
});
