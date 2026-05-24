import { createConfig, http } from "wagmi";
import { bsc } from "wagmi/chains";
import { injected, walletConnect } from "wagmi/connectors";

const projectId = process.env.NEXT_PUBLIC_PROJECT_ID;

export const config = createConfig({
  chains: [bsc],
  transports: {
    [bsc.id]: http(process.env.NEXT_PUBLIC_RPC_URL_BSCMAINNET),
  },
  connectors: [injected(), walletConnect({ projectId: projectId ?? "" })],
  ssr: true,
});
