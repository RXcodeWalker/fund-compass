import { create } from "zustand";
import { persist } from "zustand/middleware";

interface CompareState {
  selected: string[];
  toggle: (id: string) => void;
  clear: () => void;
  isSelected: (id: string) => boolean;
}

const MAX_COMPARE = 3;

export const useCompareStore = create<CompareState>()(
  persist(
    (set, get) => ({
      selected: [],
      toggle: (id) =>
        set((state) => {
          if (state.selected.includes(id)) {
            return { selected: state.selected.filter((s) => s !== id) };
          }
          if (state.selected.length >= MAX_COMPARE) return state;
          return { selected: [...state.selected, id] };
        }),
      clear: () => set({ selected: [] }),
      isSelected: (id) => get().selected.includes(id),
    }),
    { name: "compare-funds" }
  )
);

export { MAX_COMPARE };