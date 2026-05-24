"use client";

import { Suspense, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { Toaster } from "sonner";
import { config } from "@/lib/wagmiClient";
import { InviteCodeFromUrlSync } from "@/components/InviteCodeFromUrlSync";
import { WalletSessionSync } from "@/components/WalletSessionSync";

export function Provider({ children }: { children: React.ReactNode }) {
  // 初始化函数只在组件首次渲染时执行一次，后续 re-render 继续使用同一个 queryClient，React Query 的缓存和请求状态能稳定保留
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <Suspense fallback={null}>
          <InviteCodeFromUrlSync />
        </Suspense>
        <WalletSessionSync />
        {children}
        <Toaster richColors position="top-center" />
      </QueryClientProvider>
    </WagmiProvider>
  );
}
