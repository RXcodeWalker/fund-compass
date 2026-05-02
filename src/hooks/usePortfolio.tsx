import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

const STORAGE_KEY = "portfolio-funds-v1";

export interface Holding {
  fundId: string;
  amount: number;       // initial investment USD
  startDate: string;    // ISO date (YYYY-MM-DD)
  addedAt: number;      // ms timestamp
}

interface PortfolioCtx {
  holdings: Holding[];
  add: (h: Omit<Holding, "addedAt">) => void;
  remove: (fundId: string) => void;
  has: (fundId: string) => boolean;
  get: (fundId: string) => Holding | undefined;
  clear: () => void;
}

const Ctx = createContext<PortfolioCtx | null>(null);

export function PortfolioProvider({ children }: { children: ReactNode }) {
  const [holdings, setHoldings] = useState<Holding[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as Holding[]) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(holdings));
    } catch {
      /* ignore */
    }
  }, [holdings]);

  const add = useCallback((h: Omit<Holding, "addedAt">) => {
    setHoldings((prev) => {
      const existing = prev.find((x) => x.fundId === h.fundId);
      if (existing) {
        return prev.map((x) => (x.fundId === h.fundId ? { ...x, ...h, addedAt: existing.addedAt } : x));
      }
      return [...prev, { ...h, addedAt: Date.now() }];
    });
  }, []);

  const remove = useCallback((fundId: string) => {
    setHoldings((prev) => prev.filter((x) => x.fundId !== fundId));
  }, []);

  const clear = useCallback(() => setHoldings([]), []);

  const value = useMemo<PortfolioCtx>(
    () => ({
      holdings,
      add,
      remove,
      has: (id) => holdings.some((h) => h.fundId === id),
      get: (id) => holdings.find((h) => h.fundId === id),
      clear,
    }),
    [holdings, add, remove, clear]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function usePortfolio() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("usePortfolio must be used inside PortfolioProvider");
  return ctx;
}
