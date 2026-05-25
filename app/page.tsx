"use client";

import { entrustAssets } from "@/components/entrust/assets";
import { BannerCard } from "@/components/entrust/BannerCard";
import { PriceChartSection } from "@/components/entrust/PriceChartSection";
import { StrategyCard } from "@/components/entrust/StrategyCard";
import { TicketCard } from "@/components/entrust/TicketCard";
import { AulongPageShell } from "@/components/AulongPageShell";
import { TicketSalesContract } from "@/lib/abis/ticketsales";
import { useUserInfoStore } from "@/lib/store";
import { toast } from "sonner";
import { useReadContract } from "wagmi";

const STRATEGIES = [
  {
    iconSrc: entrustAssets.strategyTrend,
    title: "AI趋势策略",
    description: "AI 驱动趋势捕捉,顺势而为,获取超额收益",
    apr: "320",
    period: "30",
  },
  {
    iconSrc: entrustAssets.strategyArbitrage,
    title: "稳健套利策略",
    description: "多市场套利机会,低波动稳健收益",
    apr: "480",
    period: "90",
  },
  {
    iconSrc: entrustAssets.strategyHedge,
    iconSize: 34,
    title: "稳健套利策略",
    description: "对冲市场波动,追求稳定低回撤",
    apr: "600",
    period: "360",
  },
] as const;

export default function HomePage() {
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

  return (
    <AulongPageShell panelClassName="bg-white">
      {showTicketCard && <TicketCard />}

      <BannerCard
        imageSrc={entrustAssets.projectBanner}
        variant="project"
        onClick={() => {
          toast.info("暂未开放");
        }}
        title={
          <>
            <span>项目</span>
            <span className="text-[#ec0000]">资料</span>
          </>
        }
        description="了解Aulong 项目愿景、经济模型与AI 智能交易机制"
      />

      <PriceChartSection />

      <BannerCard
        imageSrc={entrustAssets.startAiBanner}
        variant="startAi"
        onClick={() => {
          toast.info("暂未开放");
        }}
        title={
          <>
            <span>启动</span>
            <span className="text-[#ec0000]">AI</span>
          </>
        }
        description="开启智能委托策略"
      />

      <div className="flex flex-col gap-3">
        {STRATEGIES.map((strategy, index) => (
          <StrategyCard key={index} {...strategy} />
        ))}
      </div>
    </AulongPageShell>
  );
}
