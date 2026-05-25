"use client";

import { entrustAssets } from "@/components/entrust/assets";
import { BannerCard } from "@/components/entrust/BannerCard";
import { PriceChartSection } from "@/components/entrust/PriceChartSection";
import { StrategyCard } from "@/components/entrust/StrategyCard";
import { TicketCard } from "@/components/entrust/TicketCard";
import { AulongPageShell } from "@/components/AulongPageShell";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { TicketSalesContract } from "@/lib/abis/ticketsales";
import { useUserInfoStore } from "@/lib/store";
import { toast } from "sonner";
import { useReadContract } from "wagmi";

export default function HomePage() {
  const { t } = useTranslation();
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

  const strategies = [
    {
      iconSrc: entrustAssets.strategyTrend,
      title: t("entrust.strategyTrendTitle"),
      description: t("entrust.strategyTrendDesc"),
      apr: "320",
      period: "30",
    },
    {
      iconSrc: entrustAssets.strategyArbitrage,
      title: t("entrust.strategyArbitrageTitle"),
      description: t("entrust.strategyArbitrageDesc"),
      apr: "480",
      period: "90",
    },
    {
      iconSrc: entrustAssets.strategyHedge,
      iconSize: 34,
      title: t("entrust.strategyHedgeTitle"),
      description: t("entrust.strategyHedgeDesc"),
      apr: "600",
      period: "360",
    },
  ] as const;

  return (
    <AulongPageShell panelClassName="bg-white">
      {showTicketCard && <TicketCard />}

      <BannerCard
        imageSrc={entrustAssets.projectBanner}
        variant="project"
        onClick={() => {
          toast.info(t("common.notOpen"));
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
        onClick={() => {
          toast.info(t("common.notOpen"));
        }}
        title={
          <>
            <span>{t("entrust.startAiPart1")}</span>
            <span className="text-[#ec0000]">{t("entrust.startAiPart2")}</span>
          </>
        }
        description={t("entrust.startAiDescCard")}
      />

      <div className="flex flex-col gap-3">
        {strategies.map((strategy, index) => (
          <StrategyCard key={index} {...strategy} />
        ))}
      </div>
    </AulongPageShell>
  );
}
