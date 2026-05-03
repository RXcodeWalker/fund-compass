import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useSubscription } from "./useSubscription";

const STORAGE_KEY = "compare-funds-v1";

interface CompareCtx {
  selected: string[];
  toggle: (id: string) => void;
  remove: (id: string) => void;
  clear: () => void;
  isSelected: (id: string) => boolean;
  isFull: boolean;
  maxCompare: number;
}

const Ctx = createContext<CompareCtx | null>(null);

export function CompareProvider({ children }: { children: ReactNode }) {
  const { features } = useSubscription();
  const maxCompare = features.maxCompare;

  const [selected, setSelected] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as string[]) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(selected));
    } catch {
      /* ignore */
    }
  }, [selected]);

  const toggle = useCallback((id: string) => {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((s) => s !== id);
      if (prev.length >= maxCompare) return prev;
      return [...prev, id];
    });
  }, [maxCompare]);

  const remove = useCallback((id: string) => {
    setSelected((prev) => prev.filter((s) => s !== id));
  }, []);

  const clear = useCallback(() => setSelected([]), []);

  const value = useMemo<CompareCtx>(
    () => ({
      selected,
      toggle,
      remove,
      clear,
      isSelected: (id) => selected.includes(id),
      isFull: selected.length >= maxCompare,
      maxCompare,
    }),
    [selected, toggle, remove, clear, maxCompare]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCompare() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCompare must be used inside CompareProvider");
  return ctx;
}
