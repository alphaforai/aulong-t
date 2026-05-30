"use client";

import * as React from "react";
import { bsc } from "wagmi/chains";
import {
  type Connector,
  useConnect,
  useConnectors,
  useSwitchChain,
} from "wagmi";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { toast } from "sonner";

export default function DisplayWalletOptions() {
  const { t } = useTranslation();
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
          e?.shortMessage || e?.message || t("wallet.connectFailed"),
        );
      }
    },
    [connectAsync, switchChainAsync, t],
  );

  if (!connectors.length) {
    return <p className="text-sm text-[#8b8b8b]">{t("wallet.noWallets")}</p>;
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
  const { t } = useTranslation();
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    void (async () => {
      const provider = await connector.getProvider();
      setReady(!!provider);
    })();
  }, [connector]);

  const displayName =
    connector.name.toLowerCase() === "injected"
      ? t("wallet.injectedDefault")
      : connector.name;

  return (
    <button
      type="button"
      disabled={!ready}
      onClick={onClick}
      className="group relative flex h-14 w-full items-center justify-between overflow-hidden rounded-[10px] border border-[#f0e0e0] bg-white px-4 text-left text-sm font-medium text-[#333] shadow-[0_2px_6px_rgba(0,0,0,0.04)] transition-all enabled:hover:border-[#ff3033]/35 enabled:hover:bg-[#fff8f8] enabled:hover:shadow-[0_4px_10px_rgba(213,0,0,0.1)] disabled:cursor-not-allowed disabled:border-[#eee] disabled:bg-[#fafafa] disabled:text-[#bbb] disabled:shadow-none"
    >
      <span
        aria-hidden
        className={`absolute left-0 top-1/2 h-8 w-[3px] -translate-y-1/2 rounded-full transition-colors ${
          ready
            ? "bg-gradient-to-b from-[#ff4d00] to-[#e90000]"
            : "bg-[#e5e5e5] group-disabled:bg-[#eee]"
        }`}
      />
      <span className="pl-2">{displayName}</span>
      {ready ? (
        <span className="inline-flex h-6 shrink-0 items-center rounded-full bg-gradient-to-r from-[#ff4d00] via-[#ff3033] via-[53.846%] to-[#e90000] px-2 text-[10px] font-medium leading-none text-white shadow-[inset_0_-2px_2px_rgba(255,254,227,0.5)] sm:px-2.5 sm:text-xs">
          {t("common.available")}
        </span>
      ) : (
        <span className="text-xs text-[#8b8b8b]">{t("common.unavailable")}</span>
      )}
    </button>
  );
}
