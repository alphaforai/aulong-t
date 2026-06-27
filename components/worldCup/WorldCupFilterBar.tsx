"use client";

import { useEffect, useState } from "react";
import { AppImage } from "@/components/AppImage";
import { teamAssets } from "@/components/team/assets";
import type { WorldCupCategory, WorldCupTab } from "@/lib/worldCup/constants";
import { WORLD_CUP_CATEGORIES } from "@/lib/worldCup/constants";

const GRADIENT_BTN =
  "relative overflow-hidden rounded-[16px] border border-white shadow-[0_8px_9px_rgba(240,24,30,0.2)]";
const GRADIENT_FILL =
  "pointer-events-none absolute top-0 right-0 bottom-0 left-0 rounded-[16px] bg-gradient-to-r from-[#ff4a1c] to-[#f0181e]";

/** 赛事分类筛选暂不开放，恢复时改为 true */
const SHOW_CATEGORY_FILTER = false;

const TAB_LABEL_KEYS: Record<WorldCupTab, string> = {
  all: "worldCup.tabAll",
  holding: "worldCup.tabHolding",
  history: "worldCup.tabHistory",
};

const CATEGORY_LABEL_KEYS: Record<WorldCupCategory, string> = {
  world_cup: "worldCup.categoryWorldCup",
};

type WorldCupFilterBarProps = {
  activeTab: WorldCupTab;
  categoryByTab: Record<WorldCupTab, WorldCupCategory>;
  onTabChange: (tab: WorldCupTab) => void;
  onCategoryChange: (tab: WorldCupTab, category: WorldCupCategory) => void;
  t: (key: string) => string;
};

function TabChevron({ expanded }: { expanded: boolean }) {
  return (
    <AppImage
      src={teamAssets.detailArrow}
      alt=""
      width={14}
      height={14}
      className={`size-3.5 brightness-0 invert transition-transform duration-300 ${
        expanded ? "rotate-0" : "rotate-180"
      }`}
    />
  );
}

/** 预测市场顶部 Tab + 可折叠赛事分类筛选（Android 9：实色底、max-height 动画） */
export function WorldCupFilterBar({
  activeTab,
  categoryByTab,
  onTabChange,
  onCategoryChange,
  t,
}: WorldCupFilterBarProps) {
  const [filterExpanded, setFilterExpanded] = useState(false);
  const activeCategory = categoryByTab[activeTab];

  useEffect(() => {
    setFilterExpanded(false);
  }, [activeTab]);

  return (
    <div className="shrink-0 rounded-[12px] bg-white px-1 py-2 shadow-[0_3px_6px_rgba(17,17,17,0.04)]">
      <div className="flex items-center justify-between px-0.5">
        {(["all", "holding", "history"] as const).map((tab) => {
          const active = tab === activeTab;
          if (active) {
            return (
              <div
                key={tab}
                className={`${GRADIENT_BTN} relative flex h-[34px] w-[118px] shrink-0 items-center justify-center rounded-[16px]`}
              >
                <span className={GRADIENT_FILL} aria-hidden />
                <button
                  type="button"
                  onClick={() => onTabChange(tab)}
                  className="relative flex flex-1 items-center justify-center text-sm font-extrabold text-white"
                >
                  {t(TAB_LABEL_KEYS[tab])}
                </button>
                {SHOW_CATEGORY_FILTER ? (
                  <button
                    type="button"
                    aria-label={t("worldCup.openCategoryFilter")}
                    aria-expanded={filterExpanded}
                    className="relative mr-2 flex size-3.5 items-center justify-center"
                    onClick={() => setFilterExpanded((prev) => !prev)}
                  >
                    <TabChevron expanded={filterExpanded} />
                  </button>
                ) : null}
              </div>
            );
          }

          return (
            <button
              key={tab}
              type="button"
              onClick={() => onTabChange(tab)}
              className="flex h-[34px] w-[118px] shrink-0 items-center justify-center rounded-[16px] text-sm font-normal text-[#5c5c5c]"
            >
              {t(TAB_LABEL_KEYS[tab])}
            </button>
          );
        })}
      </div>

      {SHOW_CATEGORY_FILTER ? (
        <div
          className={`overflow-hidden transition-[max-height,opacity] duration-300 ease-out ${
            filterExpanded ? "max-h-[48px] opacity-100" : "max-h-0 opacity-0"
          }`}
          aria-hidden={!filterExpanded}
        >
          <div
            className="mx-2.5 mt-2 h-px bg-[#f0f1f3]"
            role="separator"
            aria-hidden
          />
          <div className="flex items-center px-1 pt-2 pb-0.5">
            {WORLD_CUP_CATEGORIES.map((category) => {
              const active = category === activeCategory;
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => onCategoryChange(activeTab, category)}
                  className={`flex h-[26px] min-w-[72px] items-center justify-center rounded-full border px-5 py-1 text-xs ${
                    active
                      ? "border-[#f0181e] font-medium text-[#f0181e]"
                      : "border-[#f1f2f2] text-[#acacac]"
                  }`}
                >
                  {t(CATEGORY_LABEL_KEYS[category])}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
