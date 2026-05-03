import { funds, type Fund, type FundType } from "@/data/funds";
import { getManagerForFund, computeTrustScore } from "@/data/managers";
import type { Holding } from "@/hooks/usePortfolio";

// ─── Types ───────────────────────────────────────────────────────────────────

export type InsightTone = "positive" | "caution" | "neutral" | "negative";

export interface FundInsight {
  id: string;
  tone: InsightTone;
  title: string;
  detail: string;
}

export interface PortfolioInsight {
  id: string;
  tone: InsightTone;
  title: string;
  detail: string;
}

export interface ComparisonInsight {
  fundId: string;
  fundName: string;
  label: string;
  tone: InsightTone;
}

export interface RiskDistribution {
  low: number;
  medium: number;
  high: number;
}

export interface TypeDistribution {
  type: FundType;
  count: number;
  pct: number;
}

export interface PortfolioAnalysis {
  riskDist: RiskDistribution;
  typeDist: TypeDistribution[];
  diversificationLevel: "High" | "Medium" | "Low";
  insights: PortfolioInsight[];
}

// ─── Fund Insights ───────────────────────────────────────────────────────────

/**
 * Generate 3-5 insights for a single fund based on its data.
 * Uses rule-based logic: performance consistency, volatility, risk alignment,
 * manager quality, and strategy fit.
 */
export function generateFundInsights(fund: Fund): FundInsight[] {
  const insights: FundInsight[] = [];
  const manager = getManagerForFund(fund);
  const trust = manager ? computeTrustScore(manager) : 0;

  // 1. Performance consistency — check year-over-year changes in performance data
  const perfValues = fund.performance.map((p) => p.value);
  const yoyChanges: number[] = [];
  for (let i = 1; i < perfValues.length; i++) {
    yoyChanges.push(((perfValues[i] - perfValues[i - 1]) / perfValues[i - 1]) * 100);
  }
  const avgChange = yoyChanges.reduce((a, b) => a + b, 0) / yoyChanges.length;
  const volatility = Math.sqrt(
    yoyChanges.reduce((s, c) => s + Math.pow(c - avgChange, 2), 0) / yoyChanges.length
  );

  if (volatility < 5) {
    insights.push({
      id: "consistency",
      tone: "positive",
      title: "Consistent performance",
      detail: `Year-over-year returns have been stable with low volatility (${volatility.toFixed(1)}%), indicating reliable execution of the ${fund.strategy.toLowerCase()} strategy.`,
    });
  } else if (volatility > 12) {
    insights.push({
      id: "volatility",
      tone: "caution",
      title: "Higher volatility than peers",
      detail: `Returns have swung significantly year-to-year (${volatility.toFixed(1)}% standard deviation). This is common for ${fund.type} but worth monitoring.`,
    });
  } else {
    insights.push({
      id: "moderate-vol",
      tone: "neutral",
      title: "Moderate return variability",
      detail: `Performance shows typical fluctuations for a ${fund.type} fund with a ${fund.risk.toLowerCase()} risk profile.`,
    });
  }

  // 2. Risk-return alignment
  const midReturn = (fund.returnMin + fund.returnMax) / 2;
  const sameTypeFunds = funds.filter((f) => f.type === fund.type);
  const avgReturnSameType =
    sameTypeFunds.reduce((s, f) => s + (f.returnMin + f.returnMax) / 2, 0) / sameTypeFunds.length;

  if (midReturn > avgReturnSameType * 1.15) {
    insights.push({
      id: "return-premium",
      tone: "positive",
      title: "Above-average return potential",
      detail: `Expected midpoint of ${midReturn}% exceeds the ${fund.type} category average of ${avgReturnSameType.toFixed(0)}%.`,
    });
  } else if (midReturn < avgReturnSameType * 0.85) {
    insights.push({
      id: "return-below",
      tone: "caution",
      title: "Below-category return target",
      detail: `Expected midpoint of ${midReturn}% is below the ${fund.type} average of ${avgReturnSameType.toFixed(0)}%. This may reflect a more conservative approach.`,
    });
  }

  // 3. Manager quality
  if (manager && trust >= 80) {
    insights.push({
      id: "manager-strong",
      tone: "positive",
      title: "Highly trusted manager",
      detail: `${manager.name} has a trust score of ${trust}/100, backed by ${manager.yearsExperience} years of experience and ${manager.successfulExits} successful exits.`,
    });
  } else if (manager && trust < 50) {
    insights.push({
      id: "manager-emerging",
      tone: "caution",
      title: "Emerging manager profile",
      detail: `${manager.name} has a trust score of ${trust}/100. Limited track record — common for newer managers but worth noting.`,
    });
  }

  // 4. Strategy alignment with risk
  if (fund.risk === "Low" && fund.type === "Venture Capital") {
    insights.push({
      id: "risk-mismatch",
      tone: "caution",
      title: "Unusual risk-strategy pairing",
      detail: "Low risk rating for a venture capital fund is uncommon. Verify the risk assessment methodology.",
    });
  } else if (fund.risk === "High" && midReturn < 15) {
    insights.push({
      id: "risk-reward",
      tone: "caution",
      title: "Risk may not justify returns",
      detail: `High risk profile with a ${midReturn}% midpoint return. Consider whether the risk premium is adequate.`,
    });
  } else if (fund.risk === "Low" && fund.type === "Private Debt") {
    insights.push({
      id: "strategy-fit",
      tone: "positive",
      title: "Strong risk-strategy alignment",
      detail: "Low-risk private debt is a natural fit for capital preservation and steady income objectives.",
    });
  } else if (fund.risk === "Low" && fund.type === "Real Estate") {
    insights.push({
      id: "strategy-fit-re",
      tone: "positive",
      title: "Ideal for income-focused investors",
      detail: "Low-risk real estate with stable cash flows suits investors seeking predictable distributions.",
    });
  }

  // 5. Duration consideration
  if (fund.durationYears >= 10) {
    insights.push({
      id: "long-duration",
      tone: "neutral",
      title: "Long lock-up period",
      detail: `${fund.durationYears}-year commitment requires long-term capital allocation. Ensure liquidity needs are met before investing.`,
    });
  } else if (fund.durationYears <= 5) {
    insights.push({
      id: "short-duration",
      tone: "positive",
      title: "Shorter commitment window",
      detail: `${fund.durationYears}-year duration offers relatively quicker access to capital compared to typical private market funds.`,
    });
  }

  // 6. Minimum investment accessibility
  if (fund.minInvestment <= 50000) {
    insights.push({
      id: "accessible",
      tone: "positive",
      title: "Lower minimum investment",
      detail: `${formatCurrency(fund.minInvestment)} minimum makes this fund more accessible than most private market options.`,
    });
  } else if (fund.minInvestment >= 1000000) {
    insights.push({
      id: "high-min",
      tone: "neutral",
      title: "Institutional minimum",
      detail: `${formatCurrency(fund.minInvestment)} minimum is typical for institutional-grade private market access.`,
    });
  }

  return insights.slice(0, 5);
}

// ─── Portfolio Analysis ──────────────────────────────────────────────────────

/**
 * Analyze a portfolio of holdings and generate insights about
 * risk distribution, diversification, and concentration.
 */
export function analyzePortfolio(holdings: Holding[]): PortfolioAnalysis {
  const heldFunds = holdings
    .map((h) => funds.find((f) => f.id === h.fundId))
    .filter((f): f is Fund => Boolean(f));

  if (heldFunds.length === 0) {
    return {
      riskDist: { low: 0, medium: 0, high: 0 },
      typeDist: [],
      diversificationLevel: "Low",
      insights: [],
    };
  }

  // Risk distribution (by count)
  const riskDist: RiskDistribution = {
    low: heldFunds.filter((f) => f.risk === "Low").length,
    medium: heldFunds.filter((f) => f.risk === "Medium").length,
    high: heldFunds.filter((f) => f.risk === "High").length,
  };

  // Type distribution
  const typeCounts = new Map<FundType, number>();
  for (const f of heldFunds) {
    typeCounts.set(f.type, (typeCounts.get(f.type) ?? 0) + 1);
  }
  const typeDist: TypeDistribution[] = Array.from(typeCounts.entries())
    .map(([type, count]) => ({
      type,
      count,
      pct: Math.round((count / heldFunds.length) * 100),
    }))
    .sort((a, b) => b.count - a.count);

  // Diversification level
  const uniqueTypes = typeDist.length;
  const maxConcentration = typeDist[0]?.pct ?? 100;
  let diversificationLevel: "High" | "Medium" | "Low";
  if (uniqueTypes >= 3 && maxConcentration <= 50) {
    diversificationLevel = "High";
  } else if (uniqueTypes >= 2 && maxConcentration <= 70) {
    diversificationLevel = "Medium";
  } else {
    diversificationLevel = "Low";
  }

  // Generate insights
  const insights: PortfolioInsight[] = [];

  // Concentration warning
  if (maxConcentration >= 70) {
    const dominant = typeDist[0];
    insights.push({
      id: "concentration",
      tone: "negative",
      title: `High concentration in ${dominant.type}`,
      detail: `${dominant.pct}% of your portfolio is in ${dominant.type} funds. Consider diversifying across asset classes to reduce concentration risk.`,
    });
  } else if (maxConcentration >= 50) {
    const dominant = typeDist[0];
    insights.push({
      id: "moderate-concentration",
      tone: "caution",
      title: `Moderate ${dominant.type} exposure`,
      detail: `${dominant.pct}% of holdings are ${dominant.type}. Some diversification exists, but adding other asset types would improve resilience.`,
    });
  } else {
    insights.push({
      id: "good-diversification",
      tone: "positive",
      title: "Well-diversified portfolio",
      detail: "Holdings are spread across multiple asset classes, reducing the impact of any single sector downturn.",
    });
  }

  // Risk balance
  const totalHeld = heldFunds.length;
  const highRiskPct = Math.round((riskDist.high / totalHeld) * 100);
  const lowRiskPct = Math.round((riskDist.low / totalHeld) * 100);

  if (highRiskPct >= 70) {
    insights.push({
      id: "high-risk-bias",
      tone: "negative",
      title: "Portfolio risk has increased",
      detail: `${highRiskPct}% of holdings are high-risk. This may lead to larger drawdowns during market stress.`,
    });
  } else if (highRiskPct >= 50) {
    insights.push({
      id: "risk-tilt",
      tone: "caution",
      title: "Tilted toward higher risk",
      detail: "More than half of holdings carry high risk. Consider whether this matches your risk tolerance.",
    });
  } else if (lowRiskPct >= 60) {
    insights.push({
      id: "conservative-bias",
      tone: "neutral",
      title: "Conservative risk profile",
      detail: "Majority of holdings are low-risk. This prioritizes stability but may limit return potential.",
    });
  } else {
    insights.push({
      id: "balanced-risk",
      tone: "positive",
      title: "Balanced risk distribution",
      detail: "Risk is spread across low, medium, and high categories, providing both stability and growth potential.",
    });
  }

  // Low diversification across asset classes
  if (uniqueTypes === 1) {
    insights.push({
      id: "single-type",
      tone: "negative",
      title: "Low diversification across asset classes",
      detail: `All holdings are in ${typeDist[0].type}. Adding different asset types would reduce vulnerability to sector-specific risks.`,
    });
  }

  // Duration mismatch
  const longDuration = heldFunds.filter((f) => f.durationYears >= 8).length;
  if (longDuration === totalHeld && totalHeld > 1) {
    insights.push({
      id: "illiquid",
      tone: "caution",
      title: "All holdings are long-duration",
      detail: "Every fund has 8+ year lock-ups. Ensure you have sufficient liquidity outside this portfolio.",
    });
  }

  // Single holding
  if (totalHeld === 1) {
    insights.push({
      id: "single-holding",
      tone: "caution",
      title: "Single-holding portfolio",
      detail: "Adding at least 2-3 funds across different types would significantly improve diversification.",
    });
  }

  return { riskDist, typeDist, diversificationLevel, insights };
}

// ─── Comparison Insights ─────────────────────────────────────────────────────

/**
 * Generate automatic comparison labels for a set of funds being compared.
 * Identifies which fund is best for specific criteria.
 */
export function generateComparisonInsights(items: Fund[]): ComparisonInsight[] {
  if (items.length < 2) return [];

  const insights: ComparisonInsight[] = [];

  // Best for long-term growth — highest midpoint return
  const byReturn = [...items].sort(
    (a, b) => (b.returnMin + b.returnMax) / 2 - (a.returnMin + a.returnMax) / 2
  );
  const topReturn = byReturn[0];
  const secondReturn = byReturn[1];
  const topReturnMid = (topReturn.returnMin + topReturn.returnMax) / 2;
  const secondReturnMid = (secondReturn.returnMin + secondReturn.returnMax) / 2;
  if (topReturnMid > secondReturnMid) {
    insights.push({
      fundId: topReturn.id,
      fundName: topReturn.name,
      label: "Highest return potential",
      tone: "positive",
    });
  }

  // Lowest risk option
  const byRisk = [...items].sort((a, b) => a.riskScore - b.riskScore);
  const lowestRisk = byRisk[0];
  const secondRisk = byRisk[1];
  if (lowestRisk.riskScore < secondRisk.riskScore) {
    insights.push({
      fundId: lowestRisk.id,
      fundName: lowestRisk.name,
      label: "Lowest risk option",
      tone: "positive",
    });
  }

  // Best for income — lowest risk + debt/RE type
  const incomeFunds = items.filter(
    (f) => f.type === "Private Debt" || f.type === "Real Estate"
  );
  if (incomeFunds.length > 0) {
    const incomePick = incomeFunds.sort((a, b) => a.riskScore - b.riskScore)[0];
    // Only add if not already tagged as lowest risk
    if (!insights.some((i) => i.fundId === incomePick.id)) {
      insights.push({
        fundId: incomePick.id,
        fundName: incomePick.name,
        label: "Best for income",
        tone: "positive",
      });
    }
  }

  // Shortest commitment
  const byDuration = [...items].sort((a, b) => a.durationYears - b.durationYears);
  const shortest = byDuration[0];
  const secondShortest = byDuration[1];
  if (shortest.durationYears < secondShortest.durationYears) {
    insights.push({
      fundId: shortest.id,
      fundName: shortest.name,
      label: "Shortest commitment",
      tone: "neutral",
    });
  }

  // Most accessible — lowest minimum investment
  const byMinInv = [...items].sort((a, b) => a.minInvestment - b.minInvestment);
  const mostAccessible = byMinInv[0];
  const secondAccessible = byMinInv[1];
  if (mostAccessible.minInvestment < secondAccessible.minInvestment) {
    insights.push({
      fundId: mostAccessible.id,
      fundName: mostAccessible.name,
      label: "Most accessible",
      tone: "neutral",
    });
  }

  // Highest risk — flag if one fund is notably riskier
  const highestRisk = byRisk[byRisk.length - 1];
  const secondHighest = byRisk[byRisk.length - 2];
  if (highestRisk.riskScore >= 8 && highestRisk.riskScore > secondHighest.riskScore + 2) {
    insights.push({
      fundId: highestRisk.id,
      fundName: highestRisk.name,
      label: "Highest volatility",
      tone: "caution",
    });
  }

  return insights;
}

// ─── Smart Alerts ────────────────────────────────────────────────────────────

export interface SmartAlert {
  id: string;
  tone: "info" | "warn" | "success";
  message: string;
  detail: string;
}

/**
 * Generate contextual alerts for a fund based on recent simulated data.
 */
export function generateFundAlerts(fund: Fund): SmartAlert[] {
  const alerts: SmartAlert[] = [];

  // Check if fund underperformed its category
  const sameType = funds.filter((f) => f.type === fund.type);
  const avgReturn = sameType.reduce((s, f) => s + (f.returnMin + f.returnMax) / 2, 0) / sameType.length;
  const fundMid = (fund.returnMin + fund.returnMax) / 2;

  if (fundMid < avgReturn * 0.8) {
    alerts.push({
      id: "underperform",
      tone: "warn",
      message: "Underperforming its category",
      detail: `Expected return midpoint is below the ${fund.type} average. Review strategy alignment.`,
    });
  }

  // High risk flag
  if (fund.riskScore >= 8) {
    alerts.push({
      id: "high-risk",
      tone: "warn",
      message: "High volatility strategy",
      detail: "This fund carries significant risk. Only suitable for investors with high risk tolerance.",
    });
  }

  // New fund flag
  const inceptionYear = parseInt(fund.inception.match(/\d{4}/)?.[0] ?? "2020");
  if (inceptionYear >= 2021) {
    alerts.push({
      id: "new-fund",
      tone: "info",
      message: "Relatively new fund",
      detail: `Incepted in ${fund.inception}. Limited track record compared to established vehicles.`,
    });
  }

  // Strong manager
  const manager = getManagerForFund(fund);
  if (manager && manager.consistency >= 9) {
    alerts.push({
      id: "consistent-mgr",
      tone: "success",
      message: "Highly consistent manager",
      detail: `${manager.name} has a consistency rating of ${manager.consistency}/10 across prior funds.`,
    });
  }

  return alerts;
}

/**
 * Generate portfolio-level alerts.
 */
export function generatePortfolioAlerts(holdings: Holding[]): SmartAlert[] {
  const alerts: SmartAlert[] = [];
  const analysis = analyzePortfolio(holdings);

  for (const insight of analysis.insights) {
    if (insight.tone === "negative" || insight.tone === "caution") {
      alerts.push({
        id: insight.id,
        tone: insight.tone === "negative" ? "warn" : "info",
        message: insight.title,
        detail: insight.detail,
      });
    }
  }

  return alerts;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatCurrency(n: number): string {
  if (n >= 1_000_000) return `$${n / 1_000_000}M`;
  if (n >= 1_000) return `$${n / 1_000}K`;
  return `$${n}`;
}
