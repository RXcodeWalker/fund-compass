import { useState, useEffect, useCallback, useRef } from "react";
import { funds, type Fund } from "@/data/funds";
import {
  dailyChange,
  weeklyChange,
  currentNav,
  lastUpdatedForFund,
  recentPerformance,
} from "@/lib/simulation";

export interface FundLiveData {
  fundId: string;
  dailyChangePct: number;
  weeklyChangePct: number;
  currentNav: number;
  lastUpdated: Date;
  recentPerf: { day: string; value: number }[];
}

/**
 * Hook that provides simulated live data for all funds.
 * Recalculates on a configurable interval (default 60s) to simulate
 * real-time updates. Values are deterministic within a day but
 * the interval triggers re-renders for "last updated" freshness.
 */
export function useFundLiveData(refreshIntervalMs = 60000) {
  const compute = useCallback(() => {
    const map = new Map<string, FundLiveData>();
    for (const fund of funds) {
      map.set(fund.id, {
        fundId: fund.id,
        dailyChangePct: dailyChange(fund),
        weeklyChangePct: weeklyChange(fund),
        currentNav: currentNav(fund),
        lastUpdated: lastUpdatedForFund(fund),
        recentPerf: recentPerformance(fund),
      });
    }
    return map;
  }, []);

  const [liveData, setLiveData] = useState<Map<string, FundLiveData>>(compute);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setLiveData(compute());
    }, refreshIntervalMs);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [refreshIntervalMs, compute]);

  const getLiveData = useCallback(
    (fundId: string): FundLiveData | undefined => liveData.get(fundId),
    [liveData]
  );

  const refresh = useCallback(() => {
    setLiveData(compute());
  }, [compute]);

  return { liveData, getLiveData, refresh };
}

/**
 * Simulated portfolio live data.
 * Adjusts portfolio values based on daily fund changes.
 */
export interface PortfolioLiveData {
  dailyChangePct: number;
  weeklyChangePct: number;
  lastUpdated: Date;
}

export function usePortfolioLiveData(
  invested: number,
  current: number,
  fundIds: string[],
  refreshIntervalMs = 60000
) {
  const compute = useCallback(() => {
    if (fundIds.length === 0 || invested === 0) {
      return { dailyChangePct: 0, weeklyChangePct: 0, lastUpdated: new Date() };
    }
    // Weight the daily/weekly changes by each fund's proportion of portfolio
    let weightedDaily = 0;
    let weightedWeekly = 0;
    let latestUpdate = new Date(0);

    for (const id of fundIds) {
      const fund = funds.find((f) => f.id === id);
      if (!fund) continue;
      const dc = dailyChange(fund);
      const wc = weeklyChange(fund);
      const lu = lastUpdatedForFund(fund);
      weightedDaily += dc;
      weightedWeekly += wc;
      if (lu > latestUpdate) latestUpdate = lu;
    }

    return {
      dailyChangePct: Math.round((weightedDaily / fundIds.length) * 10) / 10,
      weeklyChangePct: Math.round((weightedWeekly / fundIds.length) * 10) / 10,
      lastUpdated: latestUpdate,
    };
  }, [invested, current, fundIds]);

  const [data, setData] = useState<PortfolioLiveData>(compute);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setData(compute());
    }, refreshIntervalMs);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [refreshIntervalMs, compute]);

  return data;
}
