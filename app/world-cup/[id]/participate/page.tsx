/**
 * 参与预测下注页路由
 * 路径：/world-cup/[id]/participate?outcome=home|draw|away
 * id 为列表项 gameId；outcome 可选，未传时默认主胜
 */
import { Suspense } from "react";
import { WorldCupParticipatePage } from "@/components/worldCup/WorldCupParticipatePage";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function WorldCupParticipateRoute({ params }: PageProps) {
  const { id } = await params;

  // useSearchParams 需包在 Suspense 内（Next.js App Router）
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#f8f8f8] text-sm text-[#707070]">
          ...
        </div>
      }
    >
      <WorldCupParticipatePage matchId={id} />
    </Suspense>
  );
}
