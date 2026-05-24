import { AulongPageShell } from "@/components/AulongPageShell";
import { EarningsSummaryCard } from "@/components/earnings/EarningsSummaryCard";
import { TransactionRecordCard } from "@/components/earnings/TransactionRecordCard";

export default function EarningsPage() {
  return (
    <AulongPageShell>
      <EarningsSummaryCard />
      <TransactionRecordCard />
    </AulongPageShell>
  );
}
