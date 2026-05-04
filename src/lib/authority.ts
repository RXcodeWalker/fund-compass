import { funds, type Fund } from "@/data/funds";
import { getManagerForFund, computeTrustScore } from "@/data/managers";
import type { Preferences, Recommendation } from "./recommend";
import type { AllocationPlan } from "./allocate";
import type { Holding } from "@/hooks/usePortfolio";

// ─── Benchmarks ──────────────────────────────────────────────────────────────

export type BenchmarkRating = "Above average" | "Average" | "Below average";
export type BenchmarkCategory = "Return" | "Risk" | "Consistency";

export interface BenchmarkResult {
  category: BenchmarkCategory;
  rating: BenchmarkRating;
  detail: string;
  /** 0..1 — relative position vs peer category */
  percentile: number;
}

function consistencyScore(fund: Fund): number {
  const vals = fund.performance.map((p) => p.value);
  if (vals.length < 2) return 0.5;
  const diffs: number[] = [];
  for (let i = 1; i < vals.length; i++) diffs.push(((vals[i] - vals[i - 1]) / vals[i - 1]) * 100);
  const mean = diffs.reduce((a, b) => a + b, 0) / diffs.length;
  const variance = diffs.reduce((s, d) => s + (d - mean) ** 2, 0) / diffs.length;
  return Math.sqrt(variance); // lower is more consistent
}

export function benchmarkFund(fund: Fund): BenchmarkResult[] {
  const peers = funds.filter((f) => f.type === fund.type);

  // Return — midpoint expected return vs peer median
  const mids = peers.map((f) => (f.returnMin + f.returnMax) / 2).sort((a, b) => a - b);
  const fundMid = (fund.returnMin + fund.returnMax) / 2;
  const median = mids[Math.floor(mids.length / 2)];
  const returnRating: BenchmarkRating =
    fundMid >= median * 1.1 ? "Above average" : fundMid <= median * 0.9 ? "Below average" : "Average";
  const returnPercentile = mids.filter((m) => m <= fundMid).length / mids.length;

  // Risk — lower riskScore is "above average" (safer); higher is "below average"
  const risks = peers.map((f) => f.riskScore).sort((a, b) => a - b);
  const riskMedian = risks[Math.floor(risks.length / 2)];
  const riskRating: BenchmarkRating =
    fund.riskScore <= riskMedian - 1
      ? "Above average"
      : fund.riskScore >= riskMedian + 1
        ? "Below average"
        : "Average";
  const riskPercentile = 1 - risks.filter((r) => r <= fund.riskScore).length / risks.length;

  // Consistency — lower volatility is better
  const cons = peers.map((f) => consistencyScore(f)).sort((a, b) => a - b);
  const fundCons = consistencyScore(fund);
  const consMedian = cons[Math.floor(cons.length / 2)];
  const consRating: BenchmarkRating =
    fundCons <= consMedian * 0.85
      ? "Above average"
      : fundCons >= consMedian * 1.15
        ? "Below average"
        : "Average";
  const consPercentile = 1 - cons.filter((c) => c <= fundCons).length / cons.length;

  return [
    {
      category: "Return",
      rating: returnRating,
      detail: `Midpoint return ${fundMid.toFixed(0)}% vs ${fund.type} peer median ${median.toFixed(0)}%.`,
      percentile: returnPercentile,
    },
    {
      category: "Risk",
      rating: riskRating,
      detail: `Risk score ${fund.riskScore}/10 vs peer median ${riskMedian}/10. Lower is safer.`,
      percentile: riskPercentile,
    },
    {
      category: "Consistency",
      rating: consRating,
      detail: `Year-over-year volatility ${fundCons.toFixed(1)}% vs peer median ${consMedian.toFixed(1)}%.`,
      percentile: consPercentile,
    },
  ];
}

// ─── Confidence ──────────────────────────────────────────────────────────────

export type ConfidenceLevel = "High" | "Moderate" | "Low";

export interface ConfidenceAssessment {
  level: ConfidenceLevel;
  score: number; // 0..100
  factors: { label: string; met: boolean; note: string }[];
}

export function recommendationConfidence(rec: Recommendation, prefs: Preferences): ConfidenceAssessment {
  const manager = getManagerForFund(rec.fund);
  const trust = manager ? computeTrustScore(manager) : 50;
  const benchmarks = benchmarkFund(rec.fund);
  const consistencyOk = benchmarks.find((b) => b.category === "Consistency")?.rating !== "Below average";

  const factors = [
    {
      label: "Profile alignment",
      met: rec.score >= 70,
      note: `Match score ${rec.score}/100 against your stated risk, horizon, and goal.`,
    },
    {
      label: "Manager track record",
      met: trust >= 70,
      note: `Manager trust score ${trust}/100 based on experience and historical performance.`,
    },
    {
      label: "Performance consistency",
      met: consistencyOk,
      note: "Year-over-year returns fall within the expected range for the strategy.",
    },
    {
      label: "Investment access",
      met: rec.breakdown.access >= 1,
      note: prefs.amount >= rec.fund.minInvestment
        ? "Your stated amount meets the fund's minimum."
        : "Your stated amount is below the fund minimum.",
    },
  ];

  const met = factors.filter((f) => f.met).length;
  const score = Math.round((met / factors.length) * 100);
  const level: ConfidenceLevel = met >= 4 ? "High" : met >= 2 ? "Moderate" : "Low";
  return { level, score, factors };
}

export function portfolioConfidence(holdings: Holding[]): ConfidenceAssessment {
  const heldFunds = holdings
    .map((h) => funds.find((f) => f.id === h.fundId))
    .filter((f): f is Fund => Boolean(f));

  const types = new Set(heldFunds.map((f) => f.type));
  const count = heldFunds.length;
  const highRisk = heldFunds.filter((f) => f.risk === "High").length;
  const highRiskPct = count > 0 ? highRisk / count : 0;
  const avgTrust = heldFunds.length
    ? heldFunds.reduce((s, f) => {
        const m = getManagerForFund(f);
        return s + (m ? computeTrustScore(m) : 50);
      }, 0) / heldFunds.length
    : 0;

  const factors = [
    { label: "Sufficient holdings", met: count >= 3, note: `${count} holding${count === 1 ? "" : "s"} tracked.` },
    { label: "Asset diversification", met: types.size >= 2, note: `${types.size} asset class${types.size === 1 ? "" : "es"} represented.` },
    { label: "Risk balance", met: highRiskPct <= 0.6, note: `${Math.round(highRiskPct * 100)}% of holdings are high-risk.` },
    { label: "Manager quality", met: avgTrust >= 70, note: `Average manager trust ${avgTrust.toFixed(0)}/100.` },
  ];

  const met = factors.filter((f) => f.met).length;
  const score = Math.round((met / factors.length) * 100);
  const level: ConfidenceLevel = met >= 4 ? "High" : met >= 2 ? "Moderate" : "Low";
  return { level, score, factors };
}

export function allocationConfidence(plan: AllocationPlan): ConfidenceAssessment {
  const types = new Set(plan.slots.map((s) => s.fundType));
  const top = plan.slots.reduce((a, b) => (a.pct > b.pct ? a : b), plan.slots[0]);
  const avgScore = plan.slots.reduce((s, x) => s + x.score, 0) / Math.max(1, plan.slots.length);

  const factors = [
    { label: "Multiple holdings", met: plan.slots.length >= 3, note: `${plan.slots.length} funds in plan.` },
    { label: "Diversified across asset classes", met: types.size >= 2, note: `${types.size} asset class${types.size === 1 ? "" : "es"}.` },
    { label: "Concentration within limits", met: !top || top.pct <= 50, note: `Largest position is ${top?.pct ?? 0}% of capital.` },
    { label: "Strong average match score", met: avgScore >= 70, note: `Average match score ${avgScore.toFixed(0)}/100.` },
  ];

  const met = factors.filter((f) => f.met).length;
  const score = Math.round((met / factors.length) * 100);
  const level: ConfidenceLevel = met >= 4 ? "High" : met >= 2 ? "Moderate" : "Low";
  return { level, score, factors };
}

// ─── Why explanations ────────────────────────────────────────────────────────

export interface WhyExplanation {
  summary: string;
  factors: string[];
}

export function recommendationWhy(rec: Recommendation, prefs: Preferences): WhyExplanation {
  const factors: string[] = [];
  if (rec.breakdown.risk >= 0.8) factors.push(`Risk profile aligns with your ${prefs.risk.toLowerCase()} tolerance.`);
  else factors.push(`Risk profile is a partial match for your ${prefs.risk.toLowerCase()} tolerance.`);

  if (rec.breakdown.duration >= 0.9) factors.push(`Fund duration of ${rec.fund.durationYears} years fits your ${prefs.horizon.toLowerCase()}-term horizon.`);
  else factors.push(`Fund duration of ${rec.fund.durationYears} years differs from your ${prefs.horizon.toLowerCase()}-term horizon.`);

  if (rec.breakdown.goal >= 0.85) factors.push(`Strategy is structured for ${prefs.goal.toLowerCase()} objectives.`);
  if (rec.breakdown.return >= 0.8) factors.push(`Expected return band (${rec.fund.returnMin}–${rec.fund.returnMax}%) supports your ${prefs.goal.toLowerCase()} target.`);
  if (rec.breakdown.access >= 1) factors.push(`Your stated amount meets the ${rec.fund.minInvestment.toLocaleString()} USD minimum.`);
  else factors.push(`Your stated amount is below the fund minimum of ${rec.fund.minInvestment.toLocaleString()} USD.`);

  const summary = `Recommended because it aligns with your ${prefs.goal.toLowerCase()} goal, ${prefs.risk.toLowerCase()} risk tolerance, and ${prefs.horizon.toLowerCase()}-term horizon, with a profile match score of ${rec.score}/100.`;
  return { summary, factors };
}

// ─── Assumptions ─────────────────────────────────────────────────────────────

export const ASSUMPTIONS = {
  recommendation: [
    "Stated risk tolerance, horizon, and goal accurately reflect your investment intent.",
    "Fund characteristics (return ranges, risk score, duration) are taken at face value from the published profile.",
    "Match scoring weights risk (30%), duration (20%), return alignment (20%), goal fit (20%), and access (10%).",
  ],
  benchmark: [
    "Peer comparisons use funds of the same asset class within this catalog.",
    "Return benchmarks use the midpoint of each fund's stated return range.",
    "Consistency uses year-over-year change in indexed NAV; lower variance is treated as more consistent.",
  ],
  portfolio: [
    "Performance series are simulated using deterministic logic based on each fund's risk and return profile.",
    "Simulated values do not reflect fees, taxes, capital calls, or distribution timing.",
    "Diversification is measured by asset class and risk distribution only.",
  ],
  scenario: [
    "Scenario impacts apply uniform return shifts and risk multipliers to current holdings.",
    "Real markets exhibit correlations and second-order effects not modeled here.",
    "Results illustrate directional sensitivity, not point-in-time forecasts.",
  ],
  allocation: [
    "Capital is split among the top recommendations using the selected decision mode's weighting.",
    "Concentration caps and diversification bias are applied before normalization.",
    "Allocation does not account for fund minimums beyond the access score factor.",
  ],
} as const;

// ─── Educational glossary ────────────────────────────────────────────────────

export interface GlossaryEntry {
  term: string;
  short: string;
  detail: string;
}

export const GLOSSARY: Record<string, GlossaryEntry> = {
  "high risk": {
    term: "High risk",
    short: "Greater potential for loss in exchange for higher potential return.",
    detail:
      "A high-risk fund can experience larger swings in value and longer periods of underperformance. It is generally suited to investors with long horizons and capacity to absorb losses.",
  },
  "medium risk": {
    term: "Medium risk",
    short: "Balanced exposure to growth and downside.",
    detail:
      "Medium-risk funds aim for moderate growth with some volatility. They sit between income-oriented and growth-oriented strategies.",
  },
  "low risk": {
    term: "Low risk",
    short: "Prioritises capital preservation and steady income.",
    detail:
      "Low-risk funds focus on stable cash flows and limited drawdowns. Returns are typically lower than higher-risk strategies.",
  },
  diversification: {
    term: "Diversification",
    short: "Spreading capital across different assets to reduce single-position risk.",
    detail:
      "Diversification combines investments whose returns do not move in lockstep. A diversified portfolio is less exposed to the failure of any one fund, sector, or strategy.",
  },
  irr: {
    term: "IRR",
    short: "Internal Rate of Return — the annualised return on invested capital.",
    detail:
      "IRR is the discount rate at which the present value of cash flows equals zero. In private funds it accounts for the timing of capital calls and distributions.",
  },
  aum: {
    term: "AUM",
    short: "Assets Under Management.",
    detail: "Total market value of investments managed by the firm or fund. Higher AUM often signals scale but not necessarily performance.",
  },
  nav: {
    term: "NAV",
    short: "Net Asset Value — the per-share value of fund holdings.",
    detail: "NAV reflects the underlying value of fund assets net of liabilities. It is the standard reference for tracking value over time.",
  },
  "trust score": {
    term: "Trust score",
    short: "A 0–100 rating combining experience, performance, and consistency.",
    detail:
      "The trust score weights manager experience, average historical IRR, return consistency, and breadth of track record. It is a relative indicator, not a guarantee.",
  },
  "match score": {
    term: "Match score",
    short: "How closely a fund fits your stated profile.",
    detail:
      "The match score combines five weighted factors: risk alignment, duration fit, return alignment, goal fit, and access. A higher score indicates a stronger profile fit.",
  },
  consistency: {
    term: "Consistency",
    short: "How stable returns have been year over year.",
    detail:
      "Consistency is measured as the standard deviation of year-over-year NAV changes. Lower values indicate steadier performance across reporting periods.",
  },
};
