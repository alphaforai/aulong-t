"use client";

import * as React from "react";
import { bsc } from "wagmi/chains";
import {
  type Connector,
  useConnect,
  useConnectors,
  useSwitchChain,
} from "wagmi";
import { toast } from "sonner";

export default function DisplayWalletOptions() {
  const { connectAsync } = useConnect();
  const { switchChainAsync } = useSwitchChain();
  const connectors = useConnectors();

  const handleConnect = React.useCallback(
    async (connector: Connector) => {
      try {
        const result = await connectAsync({
          connector,
          chainId: bsc.id,
        });
        if (result.chainId !== bsc.id) {
          await switchChainAsync({ chainId: bsc.id });
        }
      } catch (error: unknown) {
        const e = error as { shortMessage?: string; message?: string };
        toast.error(
          e?.shortMessage || e?.message || "连接钱包或切换网络失败",
        );
      }
    },
    [connectAsync, switchChainAsync],
  );

  if (!connectors.length) {
    return <p className="text-sm text-[#9B8D7B]">未检测到可用钱包</p>;
  }

  return (
    <>
      {connectors.map((connector) => (
        <WalletOption
          key={connector.uid}
          connector={connector}
          onClick={() => void handleConnect(connector)}
        />
      ))}
    </>
  );
}

function WalletOption({
  connector,
  onClick,
}: {
  connector: Connector;
  onClick: () => void;
}) {
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    void (async () => {
      const provider = await connector.getProvider();
      setReady(!!provider);
    })();
  }, [connector]);

  const displayName =
    connector.name.toLowerCase() === "injected" ? "内置的" : connector.name;

  return (
    <button
      type="button"
      disabled={!ready}
      onClick={onClick}
      className="flex h-11 w-full items-center justify-between rounded-[10px] border border-[#EADCC7] bg-[#FFF9EF] px-3 text-left text-sm font-medium text-[#5E4316] transition-colors enabled:hover:bg-[#F7EBD7] disabled:cursor-not-allowed disabled:border-[#EFE5D7] disabled:bg-[#F8F5F0] disabled:text-[#BBAF9F]"
    >
      {displayName}
      <span className="text-xs text-[#B9874C]">{ready ? "可用" : "不可用"}</span>
    </button>
  );
}
