import type { Recommendation, Preferences } from "./recommend";
import { fmtUSD, fmtPct } from "./portfolio";

// ─── Types ───────────────────────────────────────────────────────────────────

export type DecisionMode = "aggressive" | "balanced" | "conservative";

export interface AllocationSlot {
  fundId: string;
  fundName: string;
  fundType: string;
  score: number;
  pct: number;          // percentage of total capital
  amount: number;       // dollar amount
  reasoning: string;
}

export interface AllocationPlan {
  mode: DecisionMode;
  totalAmount: number;
  slots: AllocationSlot[];
  insights: AllocationInsight[];
}

export interface AllocationInsight {
  id: string;
  tone: "positive" | "caution" | "neutral";
  title: string;
  detail: string;
}

// ─── Mode Configs ────────────────────────────────────────────────────────────

interface ModeConfig {
  concentrationCap: number;   // max % for a single fund
  topWeight: number;          // weight multiplier for top-scored fund
  diversificationBias: number; // how much to flatten the distribution
}

const modeConfigs: Record<DecisionMode, ModeConfig> = {
  aggressive: {
    concentrationCap: 0.60,
    topWeight: 2.0,
    diversificationBias: 0.3,
  },
  balanced: {
    concentrationCap: 0.45,
    topWeight: 1.4,
    diversificationBias: 0.6,
  },
  conservative: {
    concentrationCap: 0.35,
    topWeight: 1.0,
    diversificationBias: 1.0,
  },
};

const modeLabels: Record<DecisionMode, string> = {
  aggressive: "Aggressive",
  balanced: "Balanced",
  conservative: "Conservative",
};

const modeDescriptions: Record<DecisionMode, string> = {
  aggressive: "Concentrates capital in the highest-scoring fund for maximum alignment with your profile.",
  balanced: "Distributes capital with moderate concentration, balancing conviction and diversification.",
  conservative: "Spreads capital evenly across all recommended funds, minimizing concentration risk.",
};

// ─── Allocation Logic ─────────────────────────────────────────────────────────

export function generateAllocation(
  recs: Recommendation[],
  prefs: Preferences,
  mode: DecisionMode
): AllocationPlan {
  const config = modeConfigs[mode];
  const totalAmount = prefs.amount;

  if (recs.length === 0) {
    return { mode, totalAmount, slots: [], insights: [] };
  }

  // Weight scores by mode's topWeight for the best fund
  const weightedScores = recs.map((r, i) => {
    const base = r.score;
    const weight = i === 0 ? config.topWeight : 1;
    return base * weight;
  });

  // Apply diversification bias: blend weighted scores with uniform distribution
  const uniform = 1 / recs.length;
  const rawWeights = weightedScores.map((ws, i) => {
    const normalized = ws / weightedScores.reduce((a, b) => a + b, 0);
    return normalized * (1 - config.diversificationBias) + uniform * config.diversificationBias;
  });

  // Enforce concentration cap
  let allocations = rawWeights.map((w) => Math.min(w, config.concentrationCap));

  // Re-normalize after capping
  const total = allocations.reduce((a, b) => a + b, 0);
  allocations = allocations.map((w) => w / total);

  const slots: AllocationSlot[] = recs.map((rec, i) => {
    const pct = Math.round(allocations[i] * 1000) / 10; // one decimal
    const amount = Math.round(totalAmount * allocations[i]);
    const reasoning = buildReasoning(rec, prefs, mode, i === 0);

    return {
      fundId: rec.fund.id,
      fundName: rec.fund.name,
      fundType: rec.fund.type,
      score: rec.score,
      pct,
      amount,
      reasoning,
    };
  });

  const insights = generateAllocationInsights(slots, prefs, mode);

  return { mode, totalAmount, slots, insights };
}

function buildReasoning(
  rec: Recommendation,
  prefs: Preferences,
  mode: DecisionMode,
  isTop: boolean
): string {
  const parts: string[] = [];

  if (isTop && mode === "aggressive") {
    parts.push("Highest allocation due to strongest profile alignment");
  } else if (isTop) {
    parts.push("Largest allocation as the top-scoring match");
  }

  if (rec.breakdown.goal >= 0.85) {
    parts.push(`${prefs.goal.toLowerCase()}-oriented strategy`);
  }
  if (rec.breakdown.risk >= 0.8) {
    parts.push(`${prefs.risk.toLowerCase()}-risk match`);
  }
  if (rec.breakdown.duration >= 0.9) {
    parts.push(`${prefs.horizon.toLowerCase()}-term horizon fit`);
  }

  if (mode === "conservative") {
    parts.push("evenly weighted to reduce concentration");
  }

  return parts.length > 0 ? parts.join("; ") + "." : "Diversified allocation across recommended funds.";
}

function generateAllocationInsights(
  slots: AllocationSlot[],
  prefs: Preferences,
  mode: DecisionMode
): AllocationInsight[] {
  const insights: AllocationInsight[] = [];
  const id = () => Math.random().toString(36).slice(2, 8);

  // Concentration insight
  const topSlot = slots.reduce((a, b) => (a.pct > b.pct ? a : b));
  if (topSlot.pct >= 40) {
    insights.push({
      id: id(),
      tone: mode === "aggressive" ? "neutral" : "caution",
      title: `${topSlot.pct}% concentrated in ${topSlot.fundName}`,
      detail: mode === "aggressive"
        ? "Aggressive mode concentrates capital in your best match for maximum alignment."
        : "Consider conservative mode if you want a more even distribution.",
    });
  }

  // Diversification insight
  const types = new Set(slots.map((s) => s.fundType));
  if (types.size === 1 && slots.length > 1) {
    insights.push({
      id: id(),
      tone: "caution",
      title: "All recommendations are the same asset class",
      detail: `All ${slots.length} funds are ${[...types][0]}. Diversifying across asset classes could reduce risk.`,
    });
  } else if (types.size >= 2) {
    insights.push({
      id: id(),
      tone: "positive",
      title: "Diversified across asset classes",
      detail: `Your allocation spans ${types.size} asset classes: ${[...types].join(", ")}.`,
    });
  }

  // Mode-specific insight
  if (mode === "aggressive") {
    insights.push({
      id: id(),
      tone: "neutral",
      title: "Aggressive allocation mode",
      detail: "Capital is concentrated in your top match. Higher conviction, less diversification.",
    });
  } else if (mode === "conservative") {
    insights.push({
      id: id(),
      tone: "positive",
      title: "Conservative allocation mode",
      detail: "Capital is spread evenly. Lower concentration risk, but less conviction-driven returns.",
    });
  }

  // Minimum investment check
  const belowMin = slots.filter((s) => s.amount < 0); // This would need fund data; skip for now
  void belowMin;

  return insights;
}

export { modeLabels, modeDescriptions };
