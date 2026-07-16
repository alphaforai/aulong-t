import { TransactionDetailPage } from "@/components/earnings/TransactionDetailPage";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EarningsTransactionDetailRoute({
  params,
}: PageProps) {
  const { id } = await params;
  return <TransactionDetailPage transactionId={id} />;
}
