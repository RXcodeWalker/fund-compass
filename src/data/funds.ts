export type FundType = "Venture Capital" | "Private Equity" | "Real Estate" | "Private Debt";
export type RiskLevel = "Low" | "Medium" | "High";

export interface Fund {
  id: string;
  ticker: string;
  name: string;
  strategy: string;
  type: FundType;
  risk: RiskLevel;
  riskScore: number; // 1-10
  returnMin: number;
  returnMax: number;
  durationYears: number;
  minInvestment: number; // USD
  inception: string;
  manager: string;
  aum: string;
  description: string;
  performance: { year: string; value: number }[];
}

const perf = (start: number, growth: number, vol: number) =>
  Array.from({ length: 8 }, (_, i) => {
    const drift = growth * i;
    const noise = Math.sin(i * 1.7) * vol;
    return { year: `${2017 + i}`, value: Math.round((start + drift + noise) * 10) / 10 };
  });

export const funds: Fund[] = [
  {
    id: "obs-alpha",
    ticker: "OAC-III",
    name: "Obsidian Alpha Core",
    strategy: "Early-stage technology venture",
    type: "Venture Capital",
    risk: "High",
    riskScore: 8,
    returnMin: 18,
    returnMax: 26,
    durationYears: 10,
    minInvestment: 250000,
    inception: "Q2 2019",
    manager: "Obsidian Capital Partners",
    aum: "$1.2B",
    description:
      "Concentrated portfolio of seed and Series A technology companies across enterprise software, AI infrastructure, and developer tools.",
    performance: perf(100, 14, 8),
  },
  {
    id: "krypton-re",
    ticker: "KRE-II",
    name: "Krypton Real Estate II",
    strategy: "Core-plus commercial real estate",
    type: "Real Estate",
    risk: "Medium",
    riskScore: 5,
    returnMin: 12,
    returnMax: 18,
    durationYears: 7,
    minInvestment: 100000,
    inception: "Q4 2020",
    manager: "Krypton Asset Management",
    aum: "$3.8B",
    description:
      "Diversified commercial properties across logistics, multi-family residential, and life-sciences office in tier-one US metros.",
    performance: perf(100, 9, 4),
  },
  {
    id: "zephyr-debt",
    ticker: "ZDD-IV",
    name: "Zephyr Distressed Debt IV",
    strategy: "Special situations credit",
    type: "Private Debt",
    risk: "High",
    riskScore: 7,
    returnMin: 14,
    returnMax: 22,
    durationYears: 6,
    minInvestment: 500000,
    inception: "Q1 2021",
    manager: "Zephyr Credit Group",
    aum: "$2.1B",
    description:
      "Opportunistic credit strategy targeting distressed and stressed corporate debt with active workout participation.",
    performance: perf(100, 12, 9),
  },
  {
    id: "lumina-pe",
    ticker: "LBO-V",
    name: "Lumina Buyout Partners V",
    strategy: "Mid-market private equity buyout",
    type: "Private Equity",
    risk: "Medium",
    riskScore: 6,
    returnMin: 15,
    returnMax: 20,
    durationYears: 8,
    minInvestment: 1000000,
    inception: "Q3 2018",
    manager: "Lumina Equity Partners",
    aum: "$5.4B",
    description:
      "Control-stake buyouts of profitable mid-market businesses in healthcare services, industrials, and B2B software.",
    performance: perf(100, 11, 5),
  },
  {
    id: "meridian-vc",
    ticker: "MGV-II",
    name: "Meridian Growth Ventures",
    strategy: "Growth-stage venture capital",
    type: "Venture Capital",
    risk: "High",
    riskScore: 7,
    returnMin: 16,
    returnMax: 24,
    durationYears: 8,
    minInvestment: 250000,
    inception: "Q1 2020",
    manager: "Meridian Partners",
    aum: "$1.8B",
    description:
      "Series B–D investments in category-defining companies across fintech, climate, and healthcare technology.",
    performance: perf(100, 13, 7),
  },
  {
    id: "crestmont-infra",
    ticker: "CSI-I",
    name: "Crestmont Sustainable Infra",
    strategy: "Renewable infrastructure",
    type: "Real Estate",
    risk: "Low",
    riskScore: 3,
    returnMin: 7,
    returnMax: 10,
    durationYears: 12,
    minInvestment: 50000,
    inception: "Q2 2017",
    manager: "Crestmont Infrastructure",
    aum: "$4.2B",
    description:
      "Long-duration infrastructure: solar, wind, battery storage, and water utilities in OECD markets with contracted cash flows.",
    performance: perf(100, 7, 2),
  },
  {
    id: "northwind-debt",
    ticker: "NDL-II",
    name: "Northwind Direct Lending",
    strategy: "Senior secured direct lending",
    type: "Private Debt",
    risk: "Low",
    riskScore: 3,
    returnMin: 8,
    returnMax: 11,
    durationYears: 5,
    minInvestment: 100000,
    inception: "Q3 2019",
    manager: "Northwind Credit",
    aum: "$6.1B",
    description:
      "First-lien senior secured loans to sponsor-backed mid-market borrowers with floating-rate income distributions.",
    performance: perf(100, 8, 2),
  },
  {
    id: "vertex-pe",
    ticker: "VSO-III",
    name: "Vertex Secondary Opportunities",
    strategy: "PE secondaries",
    type: "Private Equity",
    risk: "Medium",
    riskScore: 4,
    returnMin: 12,
    returnMax: 16,
    durationYears: 6,
    minInvestment: 250000,
    inception: "Q4 2019",
    manager: "Vertex Capital",
    aum: "$2.9B",
    description:
      "Acquires LP interests in mature private equity funds at a discount to NAV, accelerating cash returns to investors.",
    performance: perf(100, 10, 3),
  },
  {
    id: "atlas-vc",
    ticker: "ASV-I",
    name: "Atlas Seed Ventures",
    strategy: "Pre-seed and seed venture",
    type: "Venture Capital",
    risk: "High",
    riskScore: 9,
    returnMin: 20,
    returnMax: 30,
    durationYears: 10,
    minInvestment: 100000,
    inception: "Q1 2022",
    manager: "Atlas Ventures",
    aum: "$420M",
    description:
      "High-conviction pre-seed checks into 30 companies per vintage, with reserves for follow-on at Series A.",
    performance: perf(100, 16, 12),
  },
  {
    id: "harbor-re",
    ticker: "HRO-II",
    name: "Harbor Residential Opportunities",
    strategy: "Value-add multifamily",
    type: "Real Estate",
    risk: "Medium",
    riskScore: 5,
    returnMin: 13,
    returnMax: 17,
    durationYears: 7,
    minInvestment: 75000,
    inception: "Q2 2020",
    manager: "Harbor Realty Group",
    aum: "$1.6B",
    description:
      "Acquires and renovates Class B multifamily assets in Sun Belt growth markets, targeting NOI uplift over 3–5 years.",
    performance: perf(100, 10, 4),
  },
  {
    id: "sentinel-debt",
    ticker: "SMC-I",
    name: "Sentinel Mezzanine Credit",
    strategy: "Subordinated mezzanine debt",
    type: "Private Debt",
    risk: "Medium",
    riskScore: 5,
    returnMin: 11,
    returnMax: 14,
    durationYears: 6,
    minInvestment: 250000,
    inception: "Q3 2020",
    manager: "Sentinel Credit Partners",
    aum: "$1.9B",
    description:
      "Junior debt and structured equity to support sponsor-led acquisitions, blending current coupon with equity participation.",
    performance: perf(100, 9, 3),
  },
  {
    id: "polaris-pe",
    ticker: "PGE-IV",
    name: "Polaris Growth Equity",
    strategy: "Minority growth equity",
    type: "Private Equity",
    risk: "Medium",
    riskScore: 6,
    returnMin: 14,
    returnMax: 19,
    durationYears: 7,
    minInvestment: 500000,
    inception: "Q4 2018",
    manager: "Polaris Capital",
    aum: "$3.3B",
    description:
      "Minority growth investments in profitable, founder-led businesses in software, healthcare, and consumer.",
    performance: perf(100, 11, 4),
  },
  {
    id: "summit-vc",
    ticker: "SDV-II",
    name: "Summit Deep Tech Ventures",
    strategy: "Frontier technology venture",
    type: "Venture Capital",
    risk: "High",
    riskScore: 8,
    returnMin: 17,
    returnMax: 25,
    durationYears: 10,
    minInvestment: 250000,
    inception: "Q2 2021",
    manager: "Summit Frontier",
    aum: "$760M",
    description:
      "Capital-intensive deep tech: semiconductors, robotics, energy, and biotech platforms with long product cycles.",
    performance: perf(100, 12, 9),
  },
  {
    id: "evergreen-re",
    ticker: "ERY-I",
    name: "Evergreen Income REIT",
    strategy: "Core income real estate",
    type: "Real Estate",
    risk: "Low",
    riskScore: 2,
    returnMin: 6,
    returnMax: 9,
    durationYears: 10,
    minInvestment: 25000,
    inception: "Q1 2018",
    manager: "Evergreen Realty",
    aum: "$8.4B",
    description:
      "Stabilized, fully-leased commercial properties with long-term tenants delivering steady distributable income.",
    performance: perf(100, 6, 2),
  },
];

export const fundTypes: FundType[] = [
  "Venture Capital",
  "Private Equity",
  "Real Estate",
  "Private Debt",
];

export const riskLevels: RiskLevel[] = ["Low", "Medium", "High"];

export const formatCurrency = (n: number) => {
  if (n >= 1_000_000) return `$${n / 1_000_000}M`;
  if (n >= 1_000) return `$${n / 1_000}K`;
  return `$${n}`;
};