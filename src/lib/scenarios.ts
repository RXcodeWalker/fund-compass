import type { Fund, FundType, RiskLevel } from "@/data/funds";
import type { Holding } from "@/hooks/usePortfolio";
import { simulateHolding, fmtUSD, fmtPct } from "./portfolio";

// ─── Scenario Types ──────────────────────────────────────────────────────────

export type ScenarioId =
  | "boom"
  | "downturn"
  | "inflation"
  | "tech-surge"
  | "custom";

export interface ScenarioAdjustment {
  returnShift: number;       // percentage points added to returns
  riskMultiplier: number;    // multiplier on risk score (1 = no change)
  typeMultipliers: Partial<Record<FundType, number>>; // extra return shift per fund type
}

export interface ScenarioDefinition {
  id: ScenarioId;
  name: string;
  description: string;
  adjustment: ScenarioAdjustment;
}

export interface FundScenarioResult {
  fundId: string;
  fundName: string;
  fundType: FundType;
  risk: RiskLevel;
  riskScore: number;
  currentValue: number;
  scenarioValue: number;
  change: number;       // dollar change
  changePct: number;    // percentage change
  resilience: "high" | "medium" | "low";
}

export interface PortfolioScenarioResult {
  scenario: ScenarioDefinition;
  totalCurrent: number;
  totalScenarioValue: number;
  totalChange: number;
  totalChangePct: number;
  fundResults: FundScenarioResult[];
  insights: ScenarioInsight[];
}

export interface ScenarioInsight {
  id: string;
  tone: "positive" | "caution" | "negative" | "neutral";
  title: string;
  detail: string;
}

// ─── Predefined Scenarios ────────────────────────────────────────────────────

export const scenarios: ScenarioDefinition[] = [
  {
    id: "boom",
    name: "Market Boom",
    description: "Strong returns across most asset classes. Growth-oriented funds benefit most.",
    adjustment: {
      returnShift: 8,
      riskMultiplier: 0.8,
      typeMultipliers: {
        "Venture Capital": 6,
        "Private Equity": 4,
        "Real Estate": 2,
        "Private Debt": 1,
      },
    },
  },
  {
    id: "downturn",
    name: "Market Downturn",
    description: "Broad market decline. High-risk funds are hit hardest; debt funds show resilience.",
    adjustment: {
      returnShift: -12,
      riskMultiplier: 1.5,
      typeMultipliers: {
        "Venture Capital": -8,
        "Private Equity": -5,
        "Real Estate": -3,
        "Private Debt": -1,
      },
    },
  },
  {
    id: "inflation",
    name: "High Inflation",
    description: "Rising prices erode returns. Real assets and debt funds react differently.",
    adjustment: {
      returnShift: -3,
      riskMultiplier: 1.2,
      typeMultipliers: {
        "Venture Capital": -2,
        "Private Equity": 1,
        "Real Estate": 4,
        "Private Debt": -4,
      },
    },
  },
  {
    id: "tech-surge",
    name: "Tech Sector Surge",
    description: "Technology-driven growth boosts venture capital and growth equity significantly.",
    adjustment: {
      returnShift: 2,
      riskMultiplier: 0.9,
      typeMultipliers: {
        "Venture Capital": 12,
        "Private Equity": 5,
        "Real Estate": -1,
        "Private Debt": 0,
      },
    },
  },
];

// ─── Simulation Logic ───────────────────────────────────────────────────────

function computeScenarioReturn(fund: Fund, adj: ScenarioAdjustment): number {
  const baseReturn = (fund.returnMin + fund.returnMax) / 2;
  const typeMultiplier = adj.typeMultipliers[fund.type] ?? 0;
  const riskFactor = (fund.riskScore / 5) * (adj.riskMultiplier - 1) * baseReturn * 0.3;
  return baseReturn + adj.returnShift + typeMultiplier + riskFactor;
}

function resilienceLabel(riskScore: number, changePct: number): "high" | "medium" | "low" {
  if (changePct >= -5) return "high";
  if (changePct >= -15) return "medium";
  return "low";
}

export function simulateScenario(
  funds: Fund[],
  holdings: Holding[],
  scenario: ScenarioDefinition
): PortfolioScenarioResult {
  const fundResults: FundScenarioResult[] = holdings.map((h) => {
    const fund = funds.find((f) => f.id === h.fundId);
    if (!fund) {
      return {
        fundId: h.fundId,
        fundName: h.fundId,
        fundType: "Private Debt" as FundType,
        risk: "Medium" as RiskLevel,
        riskScore: 5,
        currentValue: h.amount,
        scenarioValue: h.amount,
        change: 0,
        changePct: 0,
        resilience: "medium" as const,
      };
    }

    const sim = simulateHolding(fund, h);
    const scenarioReturnPct = computeScenarioReturn(fund, scenario.adjustment);
    const scenarioValue = Math.round(h.amount * (1 + scenarioReturnPct / 100));
    const change = scenarioValue - sim.currentValue;
    const changePct = sim.currentValue > 0 ? (change / sim.currentValue) * 100 : 0;

    return {
      fundId: fund.id,
      fundName: fund.name,
      fundType: fund.type,
      risk: fund.risk,
      riskScore: fund.riskScore,
      currentValue: sim.currentValue,
      scenarioValue,
      change,
      changePct,
      resilience: resilienceLabel(fund.riskScore, changePct),
    };
  });

  const totalCurrent = fundResults.reduce((s, r) => s + r.currentValue, 0);
  const totalScenarioValue = fundResults.reduce((s, r) => s + r.scenarioValue, 0);
  const totalChange = totalScenarioValue - totalCurrent;
  const totalChangePct = totalCurrent > 0 ? (totalChange / totalCurrent) * 100 : 0;

  const insights = generateScenarioInsights(scenario, fundResults, totalChangePct);

  return {
    scenario,
    totalCurrent,
    totalScenarioValue,
    totalChange,
    totalChangePct,
    fundResults,
    insights,
  };
}

function generateScenarioInsights(
  scenario: ScenarioDefinition,
  results: FundScenarioResult[],
  totalChangePct: number
): ScenarioInsight[] {
  const insights: ScenarioInsight[] = [];
  const id = () => Math.random().toString(36).slice(2, 8);

  // Portfolio-level insight
  if (totalChangePct < -10) {
    insights.push({
      id: id(),
      tone: "negative",
      title: "Significant downside exposure",
      detail: `Under a ${scenario.name.toLowerCase()} scenario, your portfolio could lose ${Math.abs(totalChangePct).toFixed(1)}% of its value. Consider diversifying into more resilient asset classes.`,
    });
  } else if (totalChangePct < 0) {
    insights.push({
      id: id(),
      tone: "caution",
      title: "Moderate downside risk",
      detail: `Your portfolio shows a ${Math.abs(totalChangePct).toFixed(1)}% decline under this scenario. The impact is manageable but worth monitoring.`,
    });
  } else if (totalChangePct > 10) {
    insights.push({
      id: id(),
      tone: "positive",
      title: "Strong upside potential",
      detail: `A ${scenario.name.toLowerCase()} scenario could boost your portfolio by ${totalChangePct.toFixed(1)}%. Your allocation aligns well with this environment.`,
    });
  } else {
    insights.push({
      id: id(),
      tone: "neutral",
      title: "Modest impact expected",
      detail: `Under a ${scenario.name.toLowerCase()} scenario, your portfolio changes by ${totalChangePct.toFixed(1)}%. Current allocation is relatively neutral.`,
    });
  }

  // Most affected fund
  const sorted = [...results].sort((a, b) => a.changePct - b.changePct);
  const worst = sorted[0];
  const best = sorted[sorted.length - 1];

  if (worst && worst.changePct < -5) {
    insights.push({
      id: id(),
      tone: "negative",
      title: `${worst.fundName} is most affected`,
      detail: `This ${worst.fundType} fund could decline ${Math.abs(worst.changePct).toFixed(1)}% (${fmtUSD(worst.change)}) under this scenario due to its ${worst.risk.toLowerCase()} risk profile.`,
    });
  }

  // Most resilient fund
  if (best && best.changePct > worst.changePct + 5) {
    insights.push({
      id: id(),
      tone: "positive",
      title: `${best.fundName} shows resilience`,
      detail: `This ${best.fundType} fund changes only ${best.changePct.toFixed(1)}% under this scenario, making it your most resilient holding.`,
    });
  }

  // Concentration warning
  const typeCounts: Record<string, number> = {};
  results.forEach((r) => {
    typeCounts[r.fundType] = (typeCounts[r.fundType] || 0) + 1;
  });
  const dominant = Object.entries(typeCounts).find(([, c]) => c >= results.length * 0.5 && results.length > 1);
  if (dominant && totalChangePct < 0) {
    insights.push({
      id: id(),
      tone: "caution",
      title: `Heavy ${dominant[0]} concentration`,
      detail: `${dominant[1]} of ${results.length} holdings are ${dominant[0]} funds, amplifying your exposure to this scenario's impact on that sector.`,
    });
  }

  return insights;
}

// ─── Scenario Comparison ─────────────────────────────────────────────────────

export interface ScenarioComparison {
  scenarioA: PortfolioScenarioResult;
  scenarioB: PortfolioScenarioResult;
  deltaValue: number;
  deltaPct: number;
}

export function compareScenarios(
  a: PortfolioScenarioResult,
  b: PortfolioScenarioResult
): ScenarioComparison {
  const deltaValue = b.totalScenarioValue - a.totalScenarioValue;
  const deltaPct = a.totalScenarioValue > 0
    ? (deltaValue / a.totalScenarioValue) * 100
    : 0;
  return {
    scenarioA: a,
    scenarioB: b,
    deltaValue,
    deltaPct,
  };
}
