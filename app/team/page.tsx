import { AulongPageShell } from "@/components/AulongPageShell";
import { MemberStatsCard } from "@/components/team/MemberStatsCard";
import { TeamLevelCard } from "@/components/team/TeamLevelCard";
import { TeamPerformanceCard } from "@/components/team/TeamPerformanceCard";
import { TeamTopStatsCard } from "@/components/team/TeamTopStatsCard";

export default function TeamPage() {
  return (
    <AulongPageShell>
      <TeamLevelCard />
      <TeamTopStatsCard />
      <TeamPerformanceCard />
      <MemberStatsCard />
    </AulongPageShell>
  );
}
