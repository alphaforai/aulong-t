import { AppBottomNav } from "@/components/nav/AppBottomNav";
import { TopBar } from "@/components/entrust/TopBar";
import { MemberStatsCard } from "@/components/team/MemberStatsCard";
import { TeamLevelCard } from "@/components/team/TeamLevelCard";
import { TeamPerformanceCard } from "@/components/team/TeamPerformanceCard";
import { TeamTopStatsCard } from "@/components/team/TeamTopStatsCard";

export default function TeamPage() {
  return (
    <div className="min-h-dvh w-full md:py-8">
      <div className="relative mx-auto flex min-h-dvh w-full max-w-[375px] flex-col overflow-x-hidden bg-[#f8f8f8] md:min-h-[calc(100dvh-4rem)] md:overflow-hidden md:rounded-2xl md:shadow-[0_4px_32px_rgba(0,0,0,0.08)]">
        <div className="h-11 shrink-0" aria-hidden />
        <TopBar />
        <main className="mt-3 flex w-full min-w-0 flex-1 flex-col gap-3 px-3 pb-[100px]">
          <TeamLevelCard />
          <TeamTopStatsCard />
          <TeamPerformanceCard />
          <MemberStatsCard />
        </main>
        <AppBottomNav />
      </div>
    </div>
  );
}
