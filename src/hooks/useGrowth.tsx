import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

const STORAGE_KEY = "aethelgard-growth-v1";

export interface SavedComparison {
  id: string;
  fundIds: string[];
  label: string;
  savedAt: number;
}

export interface FavoriteFund {
  fundId: string;
  addedAt: number;
}

export interface ReferralState {
  inviteCount: number;
  referredBy: string | null;
}

interface GrowthCtx {
  savedComparisons: SavedComparison[];
  saveComparison: (fundIds: string[], label: string) => void;
  removeComparison: (id: string) => void;

  favorites: FavoriteFund[];
  toggleFavorite: (fundId: string) => void;
  isFavorite: (fundId: string) => boolean;

  referral: ReferralState;
  recordInvite: () => void;
  referralLink: string;

  seenOnboarding: boolean;
  markOnboardingSeen: () => void;
}

const Ctx = createContext<GrowthCtx | null>(null);

function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

export function GrowthProvider({ children }: { children: ReactNode }) {
  const [savedComparisons, setSavedComparisons] = useState<SavedComparison[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const data = JSON.parse(raw);
      return data.savedComparisons ?? [];
    } catch {
      return [];
    }
  });

  const [favorites, setFavorites] = useState<FavoriteFund[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const data = JSON.parse(raw);
      return data.favorites ?? [];
    } catch {
      return [];
    }
  });

  const [referral, setReferral] = useState<ReferralState>(() => {
    if (typeof window === "undefined") return { inviteCount: 0, referredBy: null };
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { inviteCount: 0, referredBy: null };
      const data = JSON.parse(raw);
      return data.referral ?? { inviteCount: 0, referredBy: null };
    } catch {
      return { inviteCount: 0, referredBy: null };
    }
  });

  const [seenOnboarding, setSeenOnboarding] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return false;
      const data = JSON.parse(raw);
      return data.seenOnboarding ?? false;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const existing = raw ? JSON.parse(raw) : {};
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          ...existing,
          savedComparisons,
          favorites,
          referral,
          seenOnboarding,
        })
      );
    } catch {
      /* ignore */
    }
  }, [savedComparisons, favorites, referral, seenOnboarding]);

  const saveComparison = useCallback((fundIds: string[], label: string) => {
    setSavedComparisons((prev) => {
      const existing = prev.find((c) => c.fundIds.join(",") === fundIds.join(","));
      if (existing) return prev;
      return [...prev, { id: generateId(), fundIds, label, savedAt: Date.now() }];
    });
  }, []);

  const removeComparison = useCallback((id: string) => {
    setSavedComparisons((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const toggleFavorite = useCallback((fundId: string) => {
    setFavorites((prev) => {
      if (prev.some((f) => f.fundId === fundId)) {
        return prev.filter((f) => f.fundId !== fundId);
      }
      return [...prev, { fundId, addedAt: Date.now() }];
    });
  }, []);

  const isFavorite = useCallback(
    (fundId: string) => favorites.some((f) => f.fundId === fundId),
    [favorites]
  );

  const recordInvite = useCallback(() => {
    setReferral((prev) => ({ ...prev, inviteCount: prev.inviteCount + 1 }));
  }, []);

  const referralLink = useMemo(() => {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}?ref=aethelgard`;
  }, []);

  const markOnboardingSeen = useCallback(() => {
    setSeenOnboarding(true);
  }, []);

  const value = useMemo<GrowthCtx>(
    () => ({
      savedComparisons,
      saveComparison,
      removeComparison,
      favorites,
      toggleFavorite,
      isFavorite,
      referral,
      recordInvite,
      referralLink,
      seenOnboarding,
      markOnboardingSeen,
    }),
    [
      savedComparisons,
      saveComparison,
      removeComparison,
      favorites,
      toggleFavorite,
      isFavorite,
      referral,
      recordInvite,
      referralLink,
      seenOnboarding,
      markOnboardingSeen,
    ]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useGrowth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useGrowth must be used inside GrowthProvider");
  return ctx;
}
