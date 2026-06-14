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

/** /api/user/team/overview 响应 data 字段 */
type TeamOverview = {
  vipLevel?: number;
  smallAreaStake?: number;
  nextVipLevel?: number;
  nextLevelSmallAreaStake?: number;
  teamTotalCount?: number;
  teamWhitelistCount?: number;
  teamStakerCount?: number;
  personalStake?: number;
  directValidUserCount?: number;
  teamTodayWhitelistCount?: number;
  bigAreaStake?: number;
  teamTotalStake?: number;
  todayTotalStake?: number;
  smallAreaStakeYesterdayDelta?: number;
  smallAreaStakeChangeRate?: number;
  bigAreaStakeYesterdayDelta?: number;
  bigAreaStakeChangeRate?: number;
  teamTotalStakeYesterdayDelta?: number;
  teamTotalStakeChangeRate?: number;
  teamIncome?: number;
  referralIncome?: number;
};

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

  const overview = teamOverviewResponse?.data as TeamOverview | undefined;

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
        directValidUserCount={overview?.directValidUserCount}
        personalStake={overview?.personalStake}
        teamIncome={overview?.teamIncome}
        referralIncome={overview?.referralIncome}
      />
      <TeamPerformanceCard
        isPending={isPending}
        smallAreaStakeYesterdayDelta={overview?.smallAreaStakeYesterdayDelta}
        smallAreaStakeChangeRate={overview?.smallAreaStakeChangeRate}
        todayTotalStake={overview?.todayTotalStake}
        teamTotalStake={overview?.teamTotalStake}
      />
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
