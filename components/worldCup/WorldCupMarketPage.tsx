"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import AulongHeader from "@/components/AulongHeader";
import { AppImage } from "@/components/AppImage";
import { teamAssets } from "@/components/team/assets";
import { useWorldCupTranslation } from "@/lib/worldCup/useWorldCupTranslation";
import { scrollToTop, stackY3 } from "@/lib/mobileCompat";
import {
  WORLD_CUP_PAGE_SIZE,
  type WorldCupCategory,
  type WorldCupTab,
} from "@/lib/worldCup/constants";
import { fetchWorldCupPredictionPage } from "@/lib/worldCup/fetchPredictionPage";
import { getWorldCupErrorMessage } from "@/lib/worldCup/getErrorMessage";
import { buildWorldCupParticipateUrl } from "@/lib/worldCup/participateUrl";
import { cacheParticipateEvent } from "@/lib/worldCup/participateEventCache";
import {
  isWorldCupHoldingItem,
  isWorldCupHistoryItem,
  isWorldCupPredictionItem,
  type WorldCupMarketItem,
  type WorldCupListItem,
  type WorldCupOutcomeSide,
} from "@/lib/worldCup/types";
import { WorldCupEmptyState } from "./WorldCupEmptyState";
import { WorldCupFilterBar } from "./WorldCupFilterBar";
import { WorldCupHoldingCard } from "./WorldCupHoldingCard";
import { WorldCupHistoryCard } from "./WorldCupHistoryCard";
import { WorldCupPagination } from "./WorldCupPagination";
import { WorldCupPredictionCard } from "./WorldCupPredictionCard";

const DEFAULT_CATEGORY: WorldCupCategory = "world_cup";

function createDefaultCategoryByTab(): Record<WorldCupTab, WorldCupCategory> {
  return {
    all: DEFAULT_CATEGORY,
    holding: DEFAULT_CATEGORY,
    history: DEFAULT_CATEGORY,
  };
}

function WorldCupListCard({
  item,
  t,
  onParticipate,
  showDivider,
}: {
  item: WorldCupListItem;
  t: (key: string, params?: Record<string, string | number>) => string;
  onParticipate: (
    item: WorldCupMarketItem,
    selectedOutcome?: WorldCupOutcomeSide,
  ) => void;
  showDivider?: boolean;
}) {
  // 按 listType 渲染三种卡片（全部 / 持仓 / 历史）
  if (isWorldCupHoldingItem(item)) {
    return <WorldCupHoldingCard item={item} t={t} />;
  }

  if (isWorldCupHistoryItem(item)) {
    return <WorldCupHistoryCard item={item} t={t} />;
  }

  if (isWorldCupPredictionItem(item)) {
    return (
      <WorldCupPredictionCard
        item={item}
        t={t}
        onParticipate={onParticipate}
        showDivider={showDivider}
      />
    );
  }

  return null;
}

/** 预测市场主页面 — 三 Tab 分页列表，全部 Tab 可跳转下注页 */
export function WorldCupMarketPage() {
  const router = useRouter();
  const { t, locale } = useWorldCupTranslation();
  const listScrollRef = useRef<HTMLDivElement>(null);

  const [activeTab, setActiveTab] = useState<WorldCupTab>("all");
  const [categoryByTab, setCategoryByTab] = useState(createDefaultCategoryByTab);
  const [page, setPage] = useState(0);

  const activeCategory = categoryByTab[activeTab];

  useEffect(() => {
    setPage(0);
  }, [activeTab, activeCategory]);

  const {
    data,
    isPending,
    isFetching,
    isError,
    error,
  } = useQuery({
    queryKey: ["worldCupPredictions", locale, activeTab, activeCategory, page],
    queryFn: () =>
      fetchWorldCupPredictionPage({
        page,
        limit: WORLD_CUP_PAGE_SIZE,
        searchCount: true,
        listType: activeTab,
        category: activeCategory,
      }),
  });

  const records = data?.list ?? [];
  const totalRaw = Number(data?.total);
  const totalSafe = Number.isFinite(totalRaw)
    ? Math.max(0, Math.trunc(totalRaw))
    : 0;
  const totalPages = totalSafe === 0 ? 1 : Math.ceil(totalSafe / WORLD_CUP_PAGE_SIZE);
  const listPending = isPending || isFetching;

  const listErrorMessage = useMemo(
    () => getWorldCupErrorMessage(error, t("worldCup.loadFailed")),
    [error, t],
  );

  const listErrorToastRef = useRef<string | null>(null);
  useEffect(() => {
    if (!isError) {
      listErrorToastRef.current = null;
      return;
    }
    if (listErrorToastRef.current === listErrorMessage) return;
    listErrorToastRef.current = listErrorMessage;
    toast.error(listErrorMessage);
  }, [isError, listErrorMessage]);

  const goToPage = useCallback(
    (nextPage: number) => {
      setPage(Math.max(0, Math.min(nextPage, totalPages - 1)));
      scrollToTop(listScrollRef.current);
    },
    [totalPages],
  );

  const handleCategoryChange = useCallback(
    (tab: WorldCupTab, category: WorldCupCategory) => {
      setCategoryByTab((prev) => ({ ...prev, [tab]: category }));
    },
    [],
  );

  const handleParticipate = useCallback(
    (item: WorldCupMarketItem, selectedOutcome?: WorldCupOutcomeSide) => {
      if (!isWorldCupPredictionItem(item) || !item.gameId) return;
      cacheParticipateEvent(item.gameId, item);
      router.push(buildWorldCupParticipateUrl(item.gameId, selectedOutcome));
    },
    [router],
  );

  const listContent = useMemo(() => {
    if (isPending) {
      return (
        <p className="py-8 text-center text-sm text-[#707070]">
          {t("common.loading")}
        </p>
      );
    }
    if (isError) {
      return (
        <p className="py-8 text-center text-sm text-[#707070]">
          {listErrorMessage}
        </p>
      );
    }
    if (records.length === 0) {
      return <WorldCupEmptyState t={t} />;
    }

    if (activeTab === "all") {
      return (
        <div className="overflow-hidden rounded-[12px] bg-white shadow-[0_3px_6px_rgba(17,17,17,0.04)]">
          <ul role="list">
            {records.map((item, index) => (
              <li key={item.id} role="listitem">
                <WorldCupListCard
                  item={item}
                  t={t}
                  onParticipate={handleParticipate}
                  showDivider={index < records.length - 1}
                />
              </li>
            ))}
          </ul>
        </div>
      );
    }

    return (
      <ul className="flex flex-col space-y-3" role="list">
        {records.map((item) => (
          <li key={item.id} role="listitem">
            <WorldCupListCard
              item={item}
              t={t}
              onParticipate={handleParticipate}
            />
          </li>
        ))}
      </ul>
    );
  }, [activeTab, handleParticipate, isError, isPending, listErrorMessage, records, t]);

  return (
    <div className="min-h-screen w-full bg-[#f8f8f8] md:py-8">
      <div className="relative mx-auto flex min-h-screen w-full max-w-[430px] flex-col bg-[#f8f8f8] md:min-h-[calc(100vh-4rem)] md:overflow-hidden md:rounded-2xl md:shadow-[0_4px_32px_rgba(0,0,0,0.08)]">
        <div className="relative z-[70] h-11 shrink-0 bg-white" aria-hidden />
        <div className="relative z-[70] shrink-0">
          <AulongHeader />
        </div>

        <header className="relative flex h-12 shrink-0 items-center justify-center px-3">
          <button
            type="button"
            aria-label={t("common.back")}
            onClick={() => router.back()}
            className="absolute left-3 flex size-6 items-center justify-center"
          >
            <AppImage
              src={teamAssets.directBack}
              alt=""
              width={16}
              height={16}
              className="size-4"
            />
          </button>
          <h1 className="text-lg font-medium leading-[26px] text-[#333]">
            {t("worldCup.pageTitle")}
          </h1>
        </header>

        <div
          ref={listScrollRef}
          className={`${stackY3} min-h-0 flex-1 overflow-y-auto px-3 pb-safe-compat`}
        >
          <WorldCupFilterBar
            activeTab={activeTab}
            categoryByTab={categoryByTab}
            onTabChange={setActiveTab}
            onCategoryChange={handleCategoryChange}
            t={t}
          />

          <div
            className={`transition-opacity ${
              listPending && !isPending ? "opacity-70" : "opacity-100"
            }`}
          >
            {listContent}
          </div>

          {totalSafe > WORLD_CUP_PAGE_SIZE ? (
            <WorldCupPagination
              page={page}
              totalPages={totalPages}
              loading={listPending}
              onPageChange={goToPage}
              t={t}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
