"use client";

import { useEffect } from "react";
import { AulongPageShell } from "@/components/AulongPageShell";
import { MemberStatsCard } from "@/components/team/MemberStatsCard";
import { TeamLevelCard } from "@/components/team/TeamLevelCard";
import { TeamPerformanceCard } from "@/components/team/TeamPerformanceCard";
import { TeamTopStatsCard } from "@/components/team/TeamTopStatsCard";
import { getTeamOverview } from "@/lib/api/users";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { useUserInfoStore } from "@/lib/store";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

export default function TeamPage() {
  const { t } = useTranslation();
  const walletAddress = useUserInfoStore(
    (state) => state.userInfo.walletAddress,
  );
  const { data: teamOverviewResponse, isPending, isError } = useQuery({
    queryKey: ["teamOverview", walletAddress],
    queryFn: () => getTeamOverview(),
    enabled: Boolean(walletAddress),
  });

  useEffect(() => {
    if (isError) {
      toast.error(t("toast.teamOverviewFailed"));
    }
  }, [isError, t]);

  const overview = teamOverviewResponse?.data as
    | {
        vipLevel?: number;
        smallAreaStake?: number;
        nextVipLevel?: number;
        nextLevelSmallAreaStake?: number;
        teamTotalCount?: number;
        teamWhitelistCount?: number;
        teamStakerCount?: number;
        teamTodayWhitelistCount?: number;
        bigAreaStake?: number;
        teamTotalStake?: number;
        teamTodayStake?: number;
      }
    | undefined;

  return (
    <AulongPageShell panelClassName="bg-white">
      <TeamLevelCard
        isPending={isPending}
        vipLevel={overview?.vipLevel}
        smallAreaStake={overview?.smallAreaStake}
        nextVipLevel={overview?.nextVipLevel}
        nextLevelSmallAreaStake={overview?.nextLevelSmallAreaStake}
      />
      <TeamTopStatsCard
        isPending={isPending}
        smallAreaStake={overview?.smallAreaStake}
      />
      <TeamPerformanceCard isPending={isPending} />
      <MemberStatsCard
        isPending={isPending}
        teamTotalCount={overview?.teamTotalCount}
        teamWhitelistCount={overview?.teamWhitelistCount}
        teamStakerCount={overview?.teamStakerCount}
        teamTodayWhitelistCount={overview?.teamTodayWhitelistCount}
      />
    </AulongPageShell>
  );
}
