import { funds, type Fund, type RiskLevel } from "@/data/funds";

export type Horizon = "Short" | "Medium" | "Long";
export type Goal = "Growth" | "Income" | "Balanced";

export interface Preferences {
  risk: RiskLevel;
  horizon: Horizon;
  goal: Goal;
  amount: number;
}

export interface Recommendation {
  fund: Fund;
  score: number; // 0-100
  breakdown: { risk: number; duration: number; return: number; goal: number; access: number };
  reasons: string[];
}

const riskScoreMap: Record<RiskLevel, number> = { Low: 2, Medium: 5, High: 8 };
const horizonRange: Record<Horizon, [number, number]> = {
  Short: [1, 3],
  Medium: [3, 7],
  Long: [7, 20],
};

// Target average return bands per goal (used as soft anchor)
const goalReturnAnchor: Record<Goal, number> = {
  Income: 9,
  Balanced: 13,
  Growth: 20,
};

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

function riskMatch(prefRisk: RiskLevel, fund: Fund) {
  const target = riskScoreMap[prefRisk];
  const diff = Math.abs(target - fund.riskScore);
  // 0 diff => 1.0, 7+ diff => 0
  return clamp01(1 - diff / 7);
}

function durationMatch(horizon: Horizon, fund: Fund) {
  const [lo, hi] = horizonRange[horizon];
  if (fund.durationYears >= lo && fund.durationYears <= hi) return 1;
  const dist = fund.durationYears < lo ? lo - fund.durationYears : fund.durationYears - hi;
  return clamp01(1 - dist / 6);
}

function returnMatch(goal: Goal, fund: Fund) {
  const avg = (fund.returnMin + fund.returnMax) / 2;
  const anchor = goalReturnAnchor[goal];
  // Within ±3% of anchor => excellent; degrade outwards.
  const diff = Math.abs(avg - anchor);
  return clamp01(1 - diff / 12);
}

function goalAlignment(goal: Goal, fund: Fund) {
  // Encourage fund types that fit the goal.
  const t = fund.type;
  if (goal === "Income") {
    if (t === "Private Debt") return 1;
    if (t === "Real Estate") return 0.85;
    if (t === "Private Equity") return 0.5;
    return 0.3; // VC
  }
  if (goal === "Growth") {
    if (t === "Venture Capital") return 1;
    if (t === "Private Equity") return 0.85;
    if (t === "Real Estate") return 0.45;
    return 0.35; // Debt
  }
  // Balanced
  if (t === "Private Equity" || t === "Real Estate") return 1;
  if (t === "Private Debt") return 0.7;
  return 0.6; // VC
}

function accessMatch(amount: number, fund: Fund) {
  if (amount >= fund.minInvestment) return 1;
  const ratio = amount / fund.minInvestment;
  // Soft penalty if user can't meet the minimum.
  return clamp01(ratio * 0.5);
}

const WEIGHTS = { risk: 0.3, duration: 0.2, return: 0.2, goal: 0.2, access: 0.1 };

export function recommend(prefs: Preferences, limit = 3): Recommendation[] {
  const scored: Recommendation[] = funds.map((fund) => {
    const breakdown = {
      risk: riskMatch(prefs.risk, fund),
      duration: durationMatch(prefs.horizon, fund),
      return: returnMatch(prefs.goal, fund),
      goal: goalAlignment(prefs.goal, fund),
      access: accessMatch(prefs.amount, fund),
    };
    const raw =
      breakdown.risk * WEIGHTS.risk +
      breakdown.duration * WEIGHTS.duration +
      breakdown.return * WEIGHTS.return +
      breakdown.goal * WEIGHTS.goal +
      breakdown.access * WEIGHTS.access;
    const score = Math.round(raw * 100);

    const reasons: string[] = [];
    if (breakdown.risk >= 0.8) reasons.push(`${prefs.risk.toLowerCase()}-risk profile`);
    if (breakdown.duration >= 0.9) reasons.push(`${prefs.horizon.toLowerCase()}-term horizon`);
    if (breakdown.goal >= 0.85) reasons.push(`${prefs.goal.toLowerCase()}-oriented strategy`);
    if (breakdown.return >= 0.8) reasons.push(`returns aligned to ${prefs.goal.toLowerCase()} target`);
    if (breakdown.access < 1) reasons.push(`minimum exceeds your amount`);

    return { fund, score, breakdown, reasons };
  });

  return scored.sort((a, b) => b.score - a.score).slice(0, limit);
}

export function explain(rec: Recommendation, prefs: Preferences): string {
  const positives = rec.reasons.filter((r) => !r.includes("exceeds"));
  if (positives.length === 0) {
    return `Partial match for your ${prefs.goal.toLowerCase()} profile.`;
  }
  const head = positives.slice(0, 2).join(" and ");
  return `Matches your ${head}.`;
}