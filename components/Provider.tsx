"use client";

import { Suspense, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { Toaster } from "sonner";
import { config } from "@/lib/wagmiClient";
import { InviteCodeFromUrlSync } from "@/components/InviteCodeFromUrlSync";

export function Provider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <Suspense fallback={null}>
          <InviteCodeFromUrlSync />
        </Suspense>
        {children}
        <Toaster richColors position="top-center" />
      </QueryClientProvider>
    </WagmiProvider>
  );
}
