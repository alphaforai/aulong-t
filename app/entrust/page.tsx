import { entrustAssets } from "@/components/entrust/assets";
import { BannerCard } from "@/components/entrust/BannerCard";
import { AppBottomNav } from "@/components/nav/AppBottomNav";
import { PriceChartSection } from "@/components/entrust/PriceChartSection";
import { StrategyCard } from "@/components/entrust/StrategyCard";
import { TicketCard } from "@/components/entrust/TicketCard";
import { TopBar } from "@/components/entrust/TopBar";

const STRATEGIES = [
  {
    iconSrc: entrustAssets.strategyTrend,
    title: "AI趋势策略",
    description: "AI 驱动趋势捕捉,顺势而为,获取超额收益",
  },
  {
    iconSrc: entrustAssets.strategyArbitrage,
    title: "稳健套利策略",
    description: "多市场套利机会,低波动稳健收益",
  },
  {
    iconSrc: entrustAssets.strategyHedge,
    iconSize: 34,
    title: "稳健套利策略",
    description: "对冲市场波动,追求稳定低回撤",
  },
] as const;

export default function EntrustPage() {
  return (
    <div className="min-h-dvh w-full md:py-8">
      <div className="relative mx-auto flex min-h-dvh w-full max-w-[375px] flex-col overflow-x-hidden bg-white md:min-h-[calc(100dvh-4rem)] md:overflow-hidden md:rounded-2xl md:shadow-[0_4px_32px_rgba(0,0,0,0.08)]">
        <div className="h-11 shrink-0" aria-hidden />

        <TopBar />

        <main className="mt-3 flex w-full min-w-0 flex-1 flex-col gap-3 px-3 pb-[100px]">
          <TicketCard />

          <BannerCard
            imageSrc={entrustAssets.projectBanner}
            variant="project"
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
        </main>

        <AppBottomNav />
      </div>
    </div>
  );
}
