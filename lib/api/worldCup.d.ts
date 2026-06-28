import {WorldCupParticipateStance} from "@/lib/worldCup/participateTypes";

export async function getWorldCupPredictionPage(params: {
  page?: number;
  limit?: number;
  searchCount?: boolean;
  listType: string;
  category: string;
}): Promise<unknown>;

export async function getWorldCupPredictionDetail(
  gameId: string,
): Promise<unknown>;

export async function getWorldCupOrderList(params: {
  page?: number;
  limit?: number;
  searchCount?: boolean;
  listType?: string;
}): Promise<unknown>;

export async function submitWorldCupParticipate(params: {
  betId: string;
  side: WorldCupParticipateStance;
  usdtAmount: number;
}): Promise<unknown>;

export async function previewWorldCupParticipate(params: {
  betId: number;
  side: WorldCupParticipateStance;
  usdtAmount: number;
}): Promise<unknown>;
