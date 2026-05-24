import { AulongPageShell } from "@/components/AulongPageShell";
import { EarningsSummaryCard } from "@/components/earnings/EarningsSummaryCard";
import { TransactionRecordCard } from "@/components/earnings/TransactionRecordCard";

export default function EarningsPage() {
  return (
    <AulongPageShell panelClassName="bg-white" mainClassName="flex min-h-0 flex-1 flex-col">
      <EarningsSummaryCard />
      <TransactionRecordCard />
    </AulongPageShell>
  );
}
