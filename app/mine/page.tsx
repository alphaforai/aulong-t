import { AulongPageShell } from "@/components/AulongPageShell";
import { AssetSummaryCard } from "@/components/mine/AssetSummaryCard";
import { FundDetailsCard } from "@/components/mine/FundDetailsCard";
import { FundPagination } from "@/components/mine/FundPagination";
import { InviteBanner } from "@/components/mine/InviteBanner";

export default function MinePage() {
  return (
    <AulongPageShell>
      <AssetSummaryCard />
      <InviteBanner />
      <FundDetailsCard />
      <FundPagination />
    </AulongPageShell>
  );
}
