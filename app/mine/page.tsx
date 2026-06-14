import { AulongPageShell } from "@/components/AulongPageShell";
import { AssetSummaryCard } from "@/components/mine/AssetSummaryCard";
import { FundDetailsCard } from "@/components/mine/FundDetailsCard";
import { InviteBanner } from "@/components/mine/InviteBanner";
import { SwapBanner } from "@/components/mine/SwapBanner";

export default function MinePage() {
  return (
    <AulongPageShell panelClassName="bg-white">
      <AssetSummaryCard />
      <SwapBanner />
      <InviteBanner />
      <FundDetailsCard />
    </AulongPageShell>
  );
}
