"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useUserInfoStore } from "@/lib/store";
import { useQuery } from "@tanstack/react-query";
import { getUserAssets, getXcoinPrice, getXpriceOverview } from "@/lib/api/users";
import { useChartLocale } from "@/lib/hooks/useChartLocale";
import { mapOverviewToChart, type PriceGranularity } from "./priceChartUtils";

const PRICE_CHART_POLL_INTERVAL_MS = 2000;

function formatAmount(value: unknown, fractionDigits = 2) {
  const num = Number(value);
  if (!Number.isFinite(num)) return "0.00";
  return num.toLocaleString("en-US", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });
}

function AmountWithUnit({ amount, unit }: { amount: string; unit: string }) {
  return (
    <div className="mt-0.5 inline-flex h-5 items-end gap-1 text-[#1e1917]">
      <span className="font-mulish text-[20px] font-bold leading-none">{amount}</span>
      <span className="text-xs font-medium leading-none">{unit}</span>
    </div>
  );
}

function ChartTooltipContent({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { value?: number }[];
}) {
  if (!active || !payload?.length) return null;
  const value = payload[0]?.value;
  return (
    <div className="rounded-md border border-[#f0e0e0] bg-white px-2 py-1 text-xs text-[#333] shadow-sm">
      ${formatAmount(value)}
    </div>
  );
}

export function PriceChartSection() {
  const { bcp47, rangeTabs, rangeDescMap, t } = useChartLocale();
  const userInfo = useUserInfoStore((state) => state.userInfo);
  const [granularity, setGranularity] = useState<PriceGranularity>("DAY");
  const [chartReady, setChartReady] = useState(false);

  useEffect(() => {
    setChartReady(true);
  }, []);

  const { data: assetsResponse } = useQuery({
    queryKey: ["userAssets", userInfo.walletAddress],
    queryFn: () => getUserAssets(),
    enabled: Boolean(userInfo.walletAddress),
    refetchInterval: PRICE_CHART_POLL_INTERVAL_MS,
    refetchOnWindowFocus: false,
  });

  const { data: xcoinPriceResponse } = useQuery({
    queryKey: ["xcoinPrice"],
    queryFn: () => getXcoinPrice(),
    refetchInterval: PRICE_CHART_POLL_INTERVAL_MS,
    refetchOnWindowFocus: false,
  });

  const {
    data: overviewResponse,
    isPending: chartPending,
    isError: chartError,
  } = useQuery({
    queryKey: ["xpriceOverview", granularity],
    queryFn: () => getXpriceOverview({ granularity }),
    refetchInterval: 5000,
    refetchOnWindowFocus: false,
  });

  const assets = assetsResponse?.data;
  const xcoinBalance = assets?.xCoinUnreleasedBalance ?? 0;
  const currentPrice = xcoinPriceResponse?.data?.currentPrice ?? 0;
  const dailyRate = xcoinPriceResponse?.data?.defaultDailyRate ?? 0;
  const dailyRateNum = Number(dailyRate);
  const isDailyRateNegative =
    Number.isFinite(dailyRateNum) && dailyRateNum < 0;
  const dailyRatePrefix =
    Number.isFinite(dailyRateNum) && dailyRateNum > 0 ? "+" : "";
  const holdingsUsd = Number(xcoinBalance) * Number(currentPrice);

  const chartData = useMemo(
    () => mapOverviewToChart(overviewResponse?.data, granularity, bcp47),
    [overviewResponse, granularity, bcp47],
  );

  const chartInitialLoading = chartPending && !overviewResponse;
  const showChart = chartData.length > 0 && !chartInitialLoading && !chartError;
  const lastPrice = chartData[chartData.length - 1]?.xPrice ?? currentPrice;

  return (
    <section className="relative z-0 flex w-full flex-col items-center gap-3 overflow-hidden rounded-[12px] border border-white bg-white px-4 py-3 shadow-[0_5px_5px_rgba(51,51,51,0.08)]">
      <div className="relative flex h-[90px] w-full min-w-0 shrink-0 flex-col rounded-[12px] shadow-[0_4px_5.2px_rgba(253,101,104,0.06)]">
        <div className="flex min-h-0 flex-1">
          <div className="flex min-w-0 flex-1 flex-col px-[18px] pt-2">
            <p className="text-sm text-[#5c5c5c]">{t("entrust.aulPrice")}</p>
            <AmountWithUnit amount={formatAmount(currentPrice)} unit="USDT" />
            <p
              className={`mt-1 text-sm leading-normal ${
                isDailyRateNegative ? "text-[#e90000]" : "text-[#16b86f]"
              }`}
            >
              {dailyRatePrefix}
              {formatAmount(dailyRate)}%
            </p>
          </div>

          <div className="my-3 w-px shrink-0 self-stretch bg-[#f3efeb]" />

          <div className="flex min-w-0 flex-1 flex-col px-[18px] pt-2">
            <p className="text-sm text-[#5c5c5c]">{t("entrust.holdAul")}</p>
            <AmountWithUnit amount={formatAmount(xcoinBalance)} unit="AUL" />
            <p className="mt-1 text-sm leading-normal text-[#5c5c5c]">
              ≈ {formatAmount(holdingsUsd)} USDT
            </p>
          </div>
        </div>
      </div>

      <div className="flex h-9 w-full items-center justify-between overflow-hidden rounded-[7px] bg-[#f4f4f4] p-1">
        {rangeTabs.map(({ granularity: g, label }) => {
          const active = g === granularity;
          return (
            <button
              key={g}
              type="button"
              onClick={() => setGranularity(g)}
              className={`flex h-7 min-w-0 flex-1 items-center justify-center rounded-lg text-[12px] font-medium leading-4 transition-colors ${
                active ? "bg-[#e90000] text-white" : "text-[#1e1917]"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      <div className="relative h-[144px] w-full min-h-[144px] min-w-0 shrink-0">
        {chartInitialLoading ? (
          <div className="flex h-full items-center justify-center text-sm text-[#8b8b8b]">
            {t("entrust.chartLoading")}
          </div>
        ) : chartError ? (
          <div className="flex h-full items-center justify-center text-sm text-[#ea4747]">
            {t("entrust.chartLoadFailed")}
          </div>
        ) : !showChart ? (
          <div className="flex h-full items-center justify-center text-sm text-[#8b8b8b]">
            {t("entrust.chartNoData", { range: rangeDescMap[granularity] })}
          </div>
        ) : (
          <div className="absolute inset-0 h-full w-full min-h-[144px] min-w-0">
            <div className="pointer-events-none absolute right-2 top-1 z-10 rounded-full bg-[#e90000] px-1.5 py-0.5">
              <span className="font-mulish text-[10px] font-semibold leading-normal text-white">
                ${formatAmount(lastPrice)}
              </span>
            </div>
            {chartReady ? (
              <ResponsiveContainer width="100%" height={144} minWidth={0}>
              <AreaChart
                data={chartData}
                margin={{ left: 0, right: 8, top: 8, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="aulPriceFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ff3033" stopOpacity={0.28} />
                    <stop offset="95%" stopColor="#ff3033" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="#f3efeb" />
                <XAxis
                  dataKey="time"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={6}
                  minTickGap={24}
                  tick={{ fill: "#9b4949", fontSize: 11 }}
                />
                <YAxis
                  width={40}
                  tickLine={false}
                  axisLine={false}
                  tickMargin={4}
                  tick={{ fill: "#000", fontSize: 10, fontWeight: 600 }}
                  tickFormatter={(v) => formatAmount(v)}
                />
                <Tooltip
                  cursor={{ stroke: "#ff3033", strokeWidth: 1 }}
                  content={<ChartTooltipContent />}
                />
                <Area
                  dataKey="xPrice"
                  type="monotone"
                  fill="url(#aulPriceFill)"
                  stroke="#e90000"
                  strokeWidth={2}
                  activeDot={{
                    r: 4,
                    fill: "#e90000",
                    stroke: "#fff",
                    strokeWidth: 2,
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
            ) : (
              <div className="h-[144px] w-full" aria-hidden />
            )}
          </div>
        )}
      </div>
    </section>
  );
}
