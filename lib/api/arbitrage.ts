import { request } from "@/lib/api/request";

export type ArbitrageLatestItem = {
  id?: string;
  chain?: string;
  walletAddress?: string;
  tokenAddress?: string;
  tokenSymbol?: string;
  buyTxHash?: string;
  sellTxHash?: string;
  openTime?: string;
  closeTime?: string;
  tokenAmount?: number;
  buyStableAmount?: number;
  sellStableAmount?: number;
  buyPlatform?: string;
  sellPlatform?: string;
  totalFeeAmount?: number;
  feeSymbol?: string;
  buyPrice?: number;
  sellPrice?: number;
  spreadRate?: number;
  profitAmount?: number;
  profitRate?: number;
};

type ArbitrageLatestResponse = {
  code: number;
  msg: string;
  data: ArbitrageLatestItem[] | null;
};

/** GET /api/solanablockinfo/arbitrage — 由后端统一代理返回最新套利交易 */
export async function getArbitrageLatest({
  chain,
  limit = 20,
}: {
  chain?: string;
  limit?: number;
} = {}): Promise<ArbitrageLatestResponse> {
  void chain;
  void limit;
  const response = (await request("/api/solanablockinfo/arbitrage", {
    method: "GET",
    auth: false,
  })) as ArbitrageLatestResponse;

  return response;
}
