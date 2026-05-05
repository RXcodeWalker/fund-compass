import type { Fund, FundType } from "@/data/funds";

// ─── Types ──────────────────────────────────────────────────────────────────

export type TransparencyLevel = "High" | "Medium" | "Low";
export type ReportingStatus = "Regular reporting" | "Limited disclosure" | "Minimal disclosure";

export interface RegulatoryProfile {
  fundId: string;
  reportingStatus: ReportingStatus;
  transparencyLevel: TransparencyLevel;
  reportingFrequency: string;
  dataAvailability: number;       // 0-100
  reportingConsistency: number;   // 0-100
  projectionReliance: number;     // 0-100 (higher = more reliance on projections)
  regulatoryConfidence: number;  // 0-100 composite score
  keyDisclosures: string[];
  riskFlags: RegulatoryRiskFlag[];
}

export interface RegulatoryRiskFlag {
  id: string;
  severity: "high" | "medium" | "low";
  label: string;
  explanation: string;
}

export interface PortfolioRegulatorySummary {
  avgConfidence: number;
  avgTransparency: number;
  lowDisclosureCount: number;
  highDisclosureCount: number;
  flags: RegulatoryRiskFlag[];
  insights: string[];
}

// ─── Mock Data Generation ───────────────────────────────────────────────────
// Deterministic profiles based on fund type, risk, and inception year.

const typeDefaults: Record<FundType, {
  reportingStatus: ReportingStatus;
  transparencyLevel: TransparencyLevel;
  reportingFrequency: string;
  dataAvailability: number;
  reportingConsistency: number;
  projectionReliance: number;
}> = {
  "Venture Capital": {
    reportingStatus: "Limited disclosure",
    transparencyLevel: "Low",
    reportingFrequency: "Quarterly (estimated values)",
    dataAvailability: 35,
    reportingConsistency: 40,
    projectionReliance: 75,
  },
  "Private Equity": {
    reportingStatus: "Regular reporting",
    transparencyLevel: "Medium",
    reportingFrequency: "Quarterly",
    dataAvailability: 60,
    reportingConsistency: 65,
    projectionReliance: 45,
  },
  "Real Estate": {
    reportingStatus: "Regular reporting",
    transparencyLevel: "High",
    reportingFrequency: "Monthly",
    dataAvailability: 80,
    reportingConsistency: 85,
    projectionReliance: 20,
  },
  "Private Debt": {
    reportingStatus: "Regular reporting",
    transparencyLevel: "High",
    reportingFrequency: "Monthly",
    dataAvailability: 75,
    reportingConsistency: 80,
    projectionReliance: 15,
  },
};

// Deterministic adjustment based on fund id
function seededAdjustment(fundId: string, field: string, range: number): number {
  let h = 2166136261;
  const s = `${fundId}:${field}`;
  for (let k = 0; k < s.length; k++) {
    h ^= s.charCodeAt(k);
    h = Math.imul(h, 16777619);
  }
  return Math.round(((h >>> 0) % 1000) / 1000 * range * 2 - range);
}

const disclosureTemplates: Record<FundType, string[]> = {
  "Venture Capital": [
    "Fund reports quarterly estimated NAV based on fair value",
    "Limited historical track record disclosed",
    "High reliance on future projections for valuations",
    "Portfolio companies may have limited public financial data",
  ],
  "Private Equity": [
    "Fund reports quarterly performance with audit lag",
    "Historical track record available for prior vintages",
    "Valuations based on comparable transactions",
    "Carried interest structure disclosed in offering documents",
  ],
  "Real Estate": [
    "Monthly NAV reporting with independent appraisals",
    "Property-level financials available to investors",
    "Rental income and occupancy data updated quarterly",
    "Environmental compliance certifications on file",
  ],
  "Private Debt": [
    "Monthly payment status and default tracking",
    "Loan-level data available upon request",
    "Covenant compliance reported quarterly",
    "Interest rate sensitivity analysis provided",
  ],
};

const flagTemplates: {
  condition: (p: RegulatoryProfile, f: Fund) => boolean;
  severity: "high" | "medium" | "low";
  label: string;
  explanation: string;
}[] = [
  {
    condition: (p) => p.reportingConsistency < 50,
    severity: "medium",
    label: "Limited reporting history",
    explanation: "This fund has a shorter track record of consistent disclosures, which may reduce visibility into long-term performance patterns.",
  },
  {
    condition: (p) => p.projectionReliance > 60,
    severity: "high",
    label: "High uncertainty in projections",
    explanation: "A significant portion of this fund's reported value relies on forward-looking estimates rather than realized outcomes. Actual results may differ materially.",
  },
  {
    condition: (p) => p.dataAvailability < 40,
    severity: "medium",
    label: "Limited public data availability",
    explanation: "There is limited publicly available data for this fund's holdings, making independent verification of reported values more difficult.",
  },
  {
    condition: (p, f) => p.transparencyLevel === "Low" && f.riskScore >= 7,
    severity: "high",
    label: "High risk with low disclosure",
    explanation: "This fund combines elevated risk with limited transparency. Reduced visibility into holdings and valuations amplifies the uncertainty of outcomes.",
  },
  {
    condition: (p) => p.reportingStatus === "Minimal disclosure",
    severity: "medium",
    label: "Minimal disclosure status",
    explanation: "The fund provides only the minimum required disclosures. Investors have limited information to assess ongoing performance and risk.",
  },
  {
    condition: (p, f) => p.reportingConsistency < 60 && f.riskScore >= 5,
    severity: "low",
    label: "Inconsistent past disclosures",
    explanation: "Reporting has been inconsistent in prior periods. While not necessarily problematic, it reduces the reliability of trend analysis.",
  },
];

export function getRegulatoryProfile(fund: Fund): RegulatoryProfile {
  const defaults = typeDefaults[fund.type];

  const dataAvailability = Math.max(0, Math.min(100,
    defaults.dataAvailability + seededAdjustment(fund.id, "data", 15)
  ));
  const reportingConsistency = Math.max(0, Math.min(100,
    defaults.reportingConsistency + seededAdjustment(fund.id, "consistency", 15)
  ));
  const projectionReliance = Math.max(0, Math.min(100,
    defaults.projectionReliance + seededAdjustment(fund.id, "projection", 10)
  ));

  // Adjust transparency based on computed values
  let transparencyLevel: TransparencyLevel = defaults.transparencyLevel;
  if (dataAvailability >= 70 && reportingConsistency >= 70) {
    transparencyLevel = "High";
  } else if (dataAvailability < 40 || reportingConsistency < 40) {
    transparencyLevel = "Low";
  }

  let reportingStatus: ReportingStatus = defaults.reportingStatus;
  if (transparencyLevel === "High") {
    reportingStatus = "Regular reporting";
  } else if (transparencyLevel === "Low") {
    reportingStatus = "Limited disclosure";
  }

  // Composite regulatory confidence score
  const regulatoryConfidence = Math.round(
    (dataAvailability * 0.35) +
    (reportingConsistency * 0.35) +
    ((100 - projectionReliance) * 0.30)
  );

  // Key disclosures: pick 2-3 from templates
  const allDisclosures = disclosureTemplates[fund.type];
  const keyDisclosures = allDisclosures.filter((_, i) => {
    const seed = seededAdjustment(fund.id, `disc-${i}`, 50);
    return seed > -15;
  }).slice(0, 3);

  // Risk flags
  const profile: RegulatoryProfile = {
    fundId: fund.id,
    reportingStatus,
    transparencyLevel,
    reportingFrequency: defaults.reportingFrequency,
    dataAvailability,
    reportingConsistency,
    projectionReliance,
    regulatoryConfidence,
    keyDisclosures,
    riskFlags: [],
  };

  profile.riskFlags = flagTemplates
    .filter((t) => t.condition(profile, fund))
    .map((t, i) => ({
      id: `${fund.id}-flag-${i}`,
      severity: t.severity,
      label: t.label,
      explanation: t.explanation,
    }));

  return profile;
}

// ─── Portfolio-Level Summary ────────────────────────────────────────────────

export function getPortfolioRegulatorySummary(
  fundList: Fund[]
): PortfolioRegulatorySummary {
  if (fundList.length === 0) {
    return {
      avgConfidence: 0,
      avgTransparency: 0,
      lowDisclosureCount: 0,
      highDisclosureCount: 0,
      flags: [],
      insights: [],
    };
  }

  const profiles = fundList.map(getRegulatoryProfile);
  const avgConfidence = Math.round(
    profiles.reduce((s, p) => s + p.regulatoryConfidence, 0) / profiles.length
  );

  const transparencyScores: Record<TransparencyLevel, number> = {
    High: 100,
    Medium: 60,
    Low: 25,
  };
  const avgTransparency = Math.round(
    profiles.reduce((s, p) => s + transparencyScores[p.transparencyLevel], 0) / profiles.length
  );

  const lowDisclosureCount = profiles.filter(
    (p) => p.transparencyLevel === "Low"
  ).length;
  const highDisclosureCount = profiles.filter(
    (p) => p.transparencyLevel === "High"
  ).length;

  // Collect unique flags
  const seenLabels = new Set<string>();
  const flags: RegulatoryRiskFlag[] = [];
  for (const p of profiles) {
    for (const f of p.riskFlags) {
      if (!seenLabels.has(f.label)) {
        seenLabels.add(f.label);
        flags.push(f);
      }
    }
  }

  const insights: string[] = [];
  if (lowDisclosureCount >= 2) {
    insights.push(
      `Portfolio includes ${lowDisclosureCount} low-disclosure funds, which may reduce overall visibility into performance.`
    );
  }
  if (avgConfidence < 50) {
    insights.push(
      "Average regulatory confidence is below 50, indicating limited disclosure quality across holdings."
    );
  }
  if (highDisclosureCount === fundList.length) {
    insights.push(
      "All portfolio holdings have high disclosure standards, providing strong visibility into performance."
    );
  }

  return {
    avgConfidence,
    avgTransparency,
    lowDisclosureCount,
    highDisclosureCount,
    flags,
    insights,
  };
}

// ─── Educational Content ────────────────────────────────────────────────────

export const educationalContent: Record<string, { question: string; answer: string }> = {
  regulatoryReporting: {
    question: "What is regulatory reporting?",
    answer: "Private investment funds are required to report financial performance and material changes to investors at regular intervals. The frequency and detail of these reports varies by fund type and jurisdiction. More frequent, detailed reporting gives investors better visibility into how their capital is being used.",
  },
  transparency: {
    question: "Why does transparency matter?",
    answer: "Transparency reflects how much information a fund shares about its holdings, valuations, and decision-making. Higher transparency means investors can better assess risk and performance. Lower transparency increases uncertainty and makes it harder to independently verify reported results.",
  },
  confidenceScore: {
    question: "What is the regulatory confidence score?",
    answer: "The regulatory confidence score (0-100) combines data availability, reporting consistency, and projection reliance into a single indicator. A higher score means the fund provides more reliable, verifiable information. A lower score suggests greater reliance on estimates and limited disclosure history.",
  },
  projectionReliance: {
    question: "What does projection reliance mean?",
    answer: "Some funds report values based on estimated future outcomes rather than realized returns. Higher projection reliance means more of the fund's reported value depends on assumptions about the future, which introduces greater uncertainty. This is common in venture capital and early-stage investments.",
  },
};
