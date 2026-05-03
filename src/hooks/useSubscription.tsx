import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type PlanTier = "free" | "pro" | "institutional";

export interface PlanFeatures {
  tier: PlanTier;
  label: string;
  price: string;
  period: string;
  maxCompare: number;
  fullInsights: boolean;
  portfolioTracking: boolean;
  advancedFilters: boolean;
  trustScores: boolean;
  smartAlerts: boolean;
  portfolioAnalysis: boolean;
  comparisonInsights: boolean;
  fundTimeline: boolean;
  activityFeed: boolean;
  prioritySupport: boolean;
  apiAccess: boolean;
  customReports: boolean;
}

export const plans: PlanFeatures[] = [
  {
    tier: "free",
    label: "Free",
    price: "$0",
    period: "forever",
    maxCompare: 2,
    fullInsights: false,
    portfolioTracking: false,
    advancedFilters: false,
    trustScores: false,
    smartAlerts: false,
    portfolioAnalysis: false,
    comparisonInsights: false,
    fundTimeline: true,
    activityFeed: true,
    prioritySupport: false,
    apiAccess: false,
    customReports: false,
  },
  {
    tier: "pro",
    label: "Pro",
    price: "$29",
    period: "/month",
    maxCompare: 3,
    fullInsights: true,
    portfolioTracking: true,
    advancedFilters: true,
    trustScores: true,
    smartAlerts: true,
    portfolioAnalysis: true,
    comparisonInsights: true,
    fundTimeline: true,
    activityFeed: true,
    prioritySupport: true,
    apiAccess: false,
    customReports: false,
  },
  {
    tier: "institutional",
    label: "Institutional",
    price: "$199",
    period: "/month",
    maxCompare: 10,
    fullInsights: true,
    portfolioTracking: true,
    advancedFilters: true,
    trustScores: true,
    smartAlerts: true,
    portfolioAnalysis: true,
    comparisonInsights: true,
    fundTimeline: true,
    activityFeed: true,
    prioritySupport: true,
    apiAccess: true,
    customReports: true,
  },
];

const STORAGE_KEY = "aethelgard-plan-v1";

interface SubscriptionCtx {
  tier: PlanTier;
  features: PlanFeatures;
  isPro: boolean;
  isFree: boolean;
  upgrade: (tier: PlanTier) => void;
  canAccess: (feature: keyof PlanFeatures) => boolean;
}

const Ctx = createContext<SubscriptionCtx | null>(null);

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const [tier, setTier] = useState<PlanTier>(() => {
    if (typeof window === "undefined") return "free";
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw === "pro" || raw === "institutional") return raw;
      return "free";
    } catch {
      return "free";
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, tier);
    } catch {
      /* ignore */
    }
  }, [tier]);

  const features = useMemo(() => plans.find((p) => p.tier === tier) ?? plans[0], [tier]);

  const upgrade = useCallback((newTier: PlanTier) => {
    setTier(newTier);
  }, []);

  const canAccess = useCallback(
    (feature: keyof PlanFeatures) => {
      return Boolean(features[feature]);
    },
    [features]
  );

  const value = useMemo<SubscriptionCtx>(
    () => ({
      tier,
      features,
      isPro: tier !== "free",
      isFree: tier === "free",
      upgrade,
      canAccess,
    }),
    [tier, features, upgrade, canAccess]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSubscription() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useSubscription must be used inside SubscriptionProvider");
  return ctx;
}
