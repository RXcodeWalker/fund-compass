import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { ScenarioId, ScenarioAdjustment } from "@/lib/scenarios";

const STORAGE_KEY = "aethelgard-scenarios-v1";

export interface SavedScenario {
  id: string;
  name: string;
  adjustment: ScenarioAdjustment;
  savedAt: number;
}

interface ScenariosCtx {
  savedScenarios: SavedScenario[];
  saveScenario: (name: string, adjustment: ScenarioAdjustment) => void;
  removeScenario: (id: string) => void;
}

const Ctx = createContext<ScenariosCtx | null>(null);

function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

export function ScenariosProvider({ children }: { children: ReactNode }) {
  const [savedScenarios, setSavedScenarios] = useState<SavedScenario[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const data = JSON.parse(raw);
      return data.savedScenarios ?? [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const existing = raw ? JSON.parse(raw) : {};
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ ...existing, savedScenarios })
      );
    } catch {
      /* ignore */
    }
  }, [savedScenarios]);

  const saveScenario = useCallback((name: string, adjustment: ScenarioAdjustment) => {
    setSavedScenarios((prev) => [
      ...prev,
      { id: generateId(), name, adjustment, savedAt: Date.now() },
    ]);
  }, []);

  const removeScenario = useCallback((id: string) => {
    setSavedScenarios((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const value = useMemo<ScenariosCtx>(
    () => ({ savedScenarios, saveScenario, removeScenario }),
    [savedScenarios, saveScenario, removeScenario]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useScenarios() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useScenarios must be used inside ScenariosProvider");
  return ctx;
}
