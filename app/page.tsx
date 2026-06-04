"use client";

import { entrustAssets } from "@/components/entrust/assets";
import { BannerCard } from "@/components/entrust/BannerCard";
import { PriceChartSection } from "@/components/entrust/PriceChartSection";
import { StrategyCard } from "@/components/entrust/StrategyCard";
import {
  DeployAgent,
  DEPLOY_STRATEGIES,
  type DeployStrategy,
} from "@/components/entrust/DeployAgent";
import { TicketCard } from "@/components/entrust/TicketCard";
import { ProjectsInfo } from "@/components/entrust/ProjectsInfo";
import { AIStrategy } from "@/components/entrust/AIStrategy";
import { AulongPageShell } from "@/components/AulongPageShell";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { TicketSalesContract } from "@/lib/abis/ticketsales";
import { useUserInfoStore } from "@/lib/store";
import { useReadContract } from "wagmi";
import { useState } from "react";

export default function HomePage() {
  const { t } = useTranslation();
  const [showProjectsInfo, setShowProjectsInfo] = useState(false);
  const [showAIStrategy, setShowAIStrategy] = useState(false);
  const [deployStrategy, setDeployStrategy] = useState<DeployStrategy | null>(
    null,
  );
  const walletAddress = useUserInfoStore(
    (state) => state.userInfo.walletAddress,
  );
  const readEnabled = Boolean(walletAddress);

  const { data: purchasesData } = useReadContract({
    ...TicketSalesContract,
    functionName: "purchases",
    args: readEnabled ? [walletAddress as `0x${string}`] : undefined,
    query: {
      enabled: readEnabled,
    },
  });

  const hasPurchased = Boolean(purchasesData?.[0]);
  const showTicketCard = !hasPurchased;

  const strategies: DeployStrategy[] = (
    [
      {
        id: "trend" as const,
        iconSrc: entrustAssets.strategyTrend,
        title: t("entrust.strategyTrendTitle"),
        description: t("entrust.strategyTrendDesc"),
      },
      {
        id: "arbitrage" as const,
        iconSrc: entrustAssets.strategyArbitrage,
        title: t("entrust.strategyArbitrageTitle"),
        description: t("entrust.strategyArbitrageDesc"),
      },
      {
        id: "hedge" as const,
        iconSrc: entrustAssets.strategyHedge,
        iconSize: 34,
        title: t("entrust.strategyHedgeTitle"),
        description: t("entrust.strategyHedgeDesc"),
      },
    ] satisfies Omit<DeployStrategy, keyof (typeof DEPLOY_STRATEGIES)["trend"]>[]
  ).map((def) => ({ ...def, ...DEPLOY_STRATEGIES[def.id] }));

  return (
    <AulongPageShell panelClassName="bg-white">
      {showTicketCard && <TicketCard />}

      <BannerCard
        imageSrc={entrustAssets.projectBanner}
        variant="project"
        onClick={() => {
          setShowProjectsInfo(true);
        }}
        title={
          <>
            <span>{t("entrust.projectPart1")}</span>
            <span className="text-[#ec0000]">{t("entrust.projectPart2")}</span>
          </>
        }
        description={t("entrust.projectBannerDescCard")}
      />

      <PriceChartSection />

      <BannerCard
        imageSrc={entrustAssets.startAiBanner}
        variant="startAi"
        onClick={() => setShowAIStrategy(true)}
        title={
          <>
            <span>{t("entrust.startAiPart1")}</span>
            <span className="text-[#ec0000]">{t("entrust.startAiPart2")}</span>
          </>
        }
        description={t("entrust.startAiDescCard")}
      />

      <div className="flex flex-col gap-3">
        {strategies.map((strategy) => (
          <StrategyCard
            key={strategy.id}
            iconSrc={strategy.iconSrc}
            iconSize={strategy.iconSize}
            title={strategy.title}
            description={strategy.description}
            apr={strategy.apr}
            period={strategy.period}
            onStart={() => setDeployStrategy(strategy)}
          />
        ))}
      </div>

      <DeployAgent
        open={deployStrategy !== null}
        strategy={deployStrategy}
        strategies={strategies}
        onClose={() => setDeployStrategy(null)}
      />

      <AIStrategy
        open={showAIStrategy}
        onClose={() => setShowAIStrategy(false)}
      />

      <ProjectsInfo
        open={showProjectsInfo}
        onClose={() => setShowProjectsInfo(false)}
      />
    </AulongPageShell>
  );
}
