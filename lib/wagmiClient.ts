import { createConfig, http, fallback } from "wagmi";
import { bsc } from "wagmi/chains";
import { injected, walletConnect } from "wagmi/connectors";

const projectId = process.env.NEXT_PUBLIC_PROJECT_ID;

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
    walletConnect({ projectId: projectId ?? "" }),
    // metaMask()
  ],
  ssr: true,
});
