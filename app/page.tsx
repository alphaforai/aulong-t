"use client";

import { entrustAssets } from "@/components/entrust/assets";
import { Announcement } from "@/components/entrust/Announcement";
import { AnnouncementList } from "@/components/entrust/AnnouncementList";
import { AnnouncementDetail } from "@/components/entrust/AnnouncementDetail";
import type { ArticleItem } from "@/components/entrust/announcementTypes";
import { ProjectBannerCard } from "@/components/entrust/ProjectBannerCard";
import { StartAiBannerCard } from "@/components/entrust/StartAiBannerCard";
import { PriceChartSection } from "@/components/entrust/PriceChartSection";
import { StrategyCard } from "@/components/entrust/StrategyCard";
import {
  DeployAgent,
  type DeployStrategy,
} from "@/components/entrust/DeployAgent";
import { TicketCard } from "@/components/entrust/TicketCard";
import { ProjectsInfo } from "@/components/entrust/ProjectsInfo";
import { AIStrategy } from "@/components/entrust/AIStrategy";
import { AulongPageShell } from "@/components/AulongPageShell";
import { getStakePlans } from "@/lib/api/users";
import { useQuery } from "@tanstack/react-query";
import { TicketSalesContract } from "@/lib/abis/ticketsales";
import { useUserInfoStore } from "@/lib/store";
import { useReadContract } from "wagmi";
import { useMemo, useState } from "react";

type StakePlan = {
  id: number;
  name: string;
  planImageUrl: string;
  planIntro: string;
  displayApr: string;
  displayAprMin: number;
  displayAprMax: number;
  periodDays: number;
  dailyRate: number;
  dailyStakeLimit: number;
  accountMaxAmount: number;
  apr: number;
  status?: number;
};

function toDeployStrategy(plan: StakePlan): DeployStrategy {
  const aprEstimate =
    plan.displayApr ||
    (plan.displayAprMin != null && plan.displayAprMax != null
      ? `${plan.displayAprMin}%-${plan.displayAprMax}%`
      : "");

  return {
    id: plan.id,
    iconSrc: plan.planImageUrl || entrustAssets.strategyTrend,
    title: plan.name || "",
    description: plan.planIntro || "",
    apr: plan.apr != null ? String(plan.apr) : "",
    aprEstimate,
    period: plan.periodDays != null ? String(plan.periodDays) : "",
    periodDays: plan.periodDays ?? 0,
  };
}

export default function HomePage() {
  const [showProjectsInfo, setShowProjectsInfo] = useState(false);
  const [showAIStrategy, setShowAIStrategy] = useState(false);
  const [showAnnouncementList, setShowAnnouncementList] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<ArticleItem | null>(
    null,
  );
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

  const { data: stakePlansResponse } = useQuery({
    queryKey: ["stakePlans"],
    queryFn: () =>
      getStakePlans({
        page: 0,
        limit: undefined,
        searchCount: false,
        lastId: undefined,
        name: undefined,
        status: 1,
        planType: 1,
      }),
  });


  const strategies = useMemo(() => {
    const raw = stakePlansResponse?.data;
    if (!Array.isArray(raw)) return [];
    return raw
      .filter((plan) => {
        const status = (plan as StakePlan).status;
        return status === undefined || status === 1;
      })
      .map((plan) => toDeployStrategy(plan as StakePlan));
  }, [stakePlansResponse]);

  const hasPurchased = Boolean(purchasesData?.[0]);
  const showTicketCard = !hasPurchased;

  return (
    <AulongPageShell panelClassName="bg-white">
      {showTicketCard && <TicketCard />}

      <Announcement onClick={() => setShowAnnouncementList(true)} />

      <ProjectBannerCard
        onClick={() => {
          setShowProjectsInfo(true);
        }}
      />

      <PriceChartSection />

      <StartAiBannerCard onClick={() => setShowAIStrategy(true)} />

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
        onDeploySuccess={() => setShowAIStrategy(true)}
      />

      <AIStrategy
        open={showAIStrategy}
        onClose={() => setShowAIStrategy(false)}
      />

      <ProjectsInfo
        open={showProjectsInfo}
        onClose={() => setShowProjectsInfo(false)}
      />

      <AnnouncementList
        open={showAnnouncementList}
        onClose={() => {
          setShowAnnouncementList(false);
          setSelectedArticle(null);
        }}
        onSelectArticle={setSelectedArticle}
      />

      <AnnouncementDetail
        open={selectedArticle !== null}
        article={selectedArticle}
        onClose={() => setSelectedArticle(null)}
      />
    </AulongPageShell>
  );
}
