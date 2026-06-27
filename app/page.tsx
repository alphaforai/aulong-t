"use client";

import { entrustAssets } from "@/components/entrust/assets";
import { Announcement } from "@/components/entrust/Announcement";
import { AnnouncementList } from "@/components/entrust/AnnouncementList";
import { AnnouncementDetail } from "@/components/entrust/AnnouncementDetail";
import type { ArticleItem } from "@/components/entrust/announcementTypes";
import { ProjectBannerCard } from "@/components/entrust/ProjectBannerCard";
import { WorldCupBannerCard } from "@/components/entrust/WorldCupBannerCard";
import { StartAiBannerCard } from "@/components/entrust/StartAiBannerCard";
import { PriceChartSection } from "@/components/entrust/PriceChartSection";
import { StrategyCard } from "@/components/entrust/StrategyCard";
import {
  DeployAgent,
  type DeployStrategy,
} from "@/components/entrust/DeployAgent";
import { ProjectsInfo } from "@/components/entrust/ProjectsInfo";
import { AIStrategy } from "@/components/entrust/AIStrategy";
import { AulongPageShell } from "@/components/AulongPageShell";
import { getStakePlans } from "@/lib/api/users";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { useQuery } from "@tanstack/react-query";
import { useEntrustUiStore } from "@/lib/store";
import { useEffect, useMemo, useState } from "react";

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
  const { locale } = useTranslation();
  const [showProjectsInfo, setShowProjectsInfo] = useState(false);
  const [showAIStrategy, setShowAIStrategy] = useState(false);
  const pendingOpenAIStrategy = useEntrustUiStore(
    (state) => state.pendingOpenAIStrategy,
  );
  const clearPendingOpenAIStrategy = useEntrustUiStore(
    (state) => state.clearPendingOpenAIStrategy,
  );

  useEffect(() => {
    if (!pendingOpenAIStrategy) return;
    setShowAIStrategy(true);
    clearPendingOpenAIStrategy();
  }, [pendingOpenAIStrategy, clearPendingOpenAIStrategy]);
  const [showAnnouncementList, setShowAnnouncementList] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<ArticleItem | null>(
    null,
  );
  const [deployStrategy, setDeployStrategy] = useState<DeployStrategy | null>(
    null,
  );

  const { data: stakePlansResponse } = useQuery({
    queryKey: ["stakePlans", 1, locale],
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

  // 白名单购买与全站拦截已移至 WhitelistGate（AulongPageShell）
  return (
    <AulongPageShell panelClassName="bg-white">
      <Announcement onClick={() => setShowAnnouncementList(true)} />

      <WorldCupBannerCard />

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
