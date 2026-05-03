import { funds, type Fund } from "./funds";

export interface Manager {
  id: string;
  name: string; // person
  firm: string;
  title: string;
  yearsExperience: number;
  aum: string;
  successfulExits: number; // VC/PE
  avgIrr: number; // %
  consistency: number; // 0-10 (lower stdev = higher)
  bio: string;
  trackRecord: { vintage: string; fund: string; netIrr: number; status: "Realized" | "Active" }[];
}

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const raw: Omit<Manager, "id">[] = [
  {
    name: "Eleanor Voss",
    firm: "Obsidian Capital Partners",
    title: "Managing Partner",
    yearsExperience: 18,
    aum: "$1.2B",
    successfulExits: 11,
    avgIrr: 22,
    consistency: 7,
    bio: "Former product lead at two enterprise SaaS exits; focused on early-stage infrastructure and developer tools.",
    trackRecord: [
      { vintage: "2014", fund: "Obsidian Alpha I", netIrr: 28, status: "Realized" },
      { vintage: "2017", fund: "Obsidian Alpha II", netIrr: 24, status: "Realized" },
      { vintage: "2019", fund: "Obsidian Alpha III", netIrr: 21, status: "Active" },
    ],
  },
  {
    name: "David Chen",
    firm: "Krypton Asset Management",
    title: "Head of Real Estate",
    yearsExperience: 22,
    aum: "$3.8B",
    successfulExits: 0,
    avgIrr: 14,
    consistency: 9,
    bio: "Two decades of disciplined commercial real estate underwriting across cycles. Conservative leverage philosophy.",
    trackRecord: [
      { vintage: "2012", fund: "Krypton RE I", netIrr: 13, status: "Realized" },
      { vintage: "2020", fund: "Krypton RE II", netIrr: 15, status: "Active" },
    ],
  },
  {
    name: "Marcus Reyes",
    firm: "Zephyr Credit Group",
    title: "Chief Investment Officer",
    yearsExperience: 16,
    aum: "$2.1B",
    successfulExits: 0,
    avgIrr: 17,
    consistency: 5,
    bio: "Previously ran distressed desk at a tier-one investment bank. Aggressive workout style; high-conviction positions.",
    trackRecord: [
      { vintage: "2015", fund: "Zephyr Distressed II", netIrr: 19, status: "Realized" },
      { vintage: "2018", fund: "Zephyr Distressed III", netIrr: 12, status: "Realized" },
      { vintage: "2021", fund: "Zephyr Distressed IV", netIrr: 18, status: "Active" },
    ],
  },
  {
    name: "Sofia Lindqvist",
    firm: "Lumina Equity Partners",
    title: "Founding Partner",
    yearsExperience: 25,
    aum: "$5.4B",
    successfulExits: 24,
    avgIrr: 19,
    consistency: 9,
    bio: "Founded Lumina in 2003. Operationally focused mid-market buyouts with sector specialization in healthcare and industrials.",
    trackRecord: [
      { vintage: "2010", fund: "Lumina III", netIrr: 21, status: "Realized" },
      { vintage: "2014", fund: "Lumina IV", netIrr: 18, status: "Realized" },
      { vintage: "2018", fund: "Lumina V", netIrr: 17, status: "Active" },
    ],
  },
  {
    name: "Priya Anand",
    firm: "Meridian Partners",
    title: "General Partner",
    yearsExperience: 12,
    aum: "$1.8B",
    successfulExits: 7,
    avgIrr: 20,
    consistency: 7,
    bio: "Growth-stage investor with deep network in fintech and climate. Two unicorn investments to date.",
    trackRecord: [
      { vintage: "2017", fund: "Meridian Growth I", netIrr: 22, status: "Active" },
      { vintage: "2020", fund: "Meridian Growth II", netIrr: 18, status: "Active" },
    ],
  },
  {
    name: "Henrik Bauer",
    firm: "Crestmont Infrastructure",
    title: "Managing Director",
    yearsExperience: 28,
    aum: "$4.2B",
    successfulExits: 0,
    avgIrr: 9,
    consistency: 10,
    bio: "Career infrastructure specialist; pioneered renewable yieldco structures in Europe.",
    trackRecord: [
      { vintage: "2008", fund: "Crestmont Power I", netIrr: 8, status: "Realized" },
      { vintage: "2017", fund: "Crestmont Sustainable I", netIrr: 9, status: "Active" },
    ],
  },
  {
    name: "Rachel Okonkwo",
    firm: "Northwind Credit",
    title: "Head of Direct Lending",
    yearsExperience: 19,
    aum: "$6.1B",
    successfulExits: 0,
    avgIrr: 10,
    consistency: 10,
    bio: "Built Northwind's senior lending platform from inception. Zero principal losses across two prior vehicles.",
    trackRecord: [
      { vintage: "2014", fund: "Northwind Lending I", netIrr: 9, status: "Realized" },
      { vintage: "2019", fund: "Northwind Lending II", netIrr: 10, status: "Active" },
    ],
  },
  {
    name: "Thomas Albrecht",
    firm: "Vertex Capital",
    title: "Partner, Secondaries",
    yearsExperience: 14,
    aum: "$2.9B",
    successfulExits: 9,
    avgIrr: 15,
    consistency: 8,
    bio: "Specialist in LP-led secondary transactions. Strong relationships with top-quartile primary sponsors.",
    trackRecord: [
      { vintage: "2016", fund: "Vertex Secondaries II", netIrr: 16, status: "Active" },
      { vintage: "2019", fund: "Vertex Secondaries III", netIrr: 14, status: "Active" },
    ],
  },
  {
    name: "Jordan Park",
    firm: "Atlas Ventures",
    title: "Solo GP",
    yearsExperience: 4,
    aum: "$420M",
    successfulExits: 1,
    avgIrr: 0,
    consistency: 3,
    bio: "First-time institutional fund manager; previously angel investor with strong early calls in AI tooling.",
    trackRecord: [
      { vintage: "2022", fund: "Atlas Seed I", netIrr: 0, status: "Active" },
    ],
  },
  {
    name: "Amelia Cortez",
    firm: "Harbor Realty Group",
    title: "Managing Principal",
    yearsExperience: 17,
    aum: "$1.6B",
    successfulExits: 0,
    avgIrr: 14,
    consistency: 8,
    bio: "Sun Belt multifamily specialist with hands-on operational platform and vertically-integrated property management.",
    trackRecord: [
      { vintage: "2016", fund: "Harbor Residential I", netIrr: 16, status: "Realized" },
      { vintage: "2020", fund: "Harbor Residential II", netIrr: 14, status: "Active" },
    ],
  },
  {
    name: "Robert Hughes",
    firm: "Sentinel Credit Partners",
    title: "Co-Founder",
    yearsExperience: 21,
    aum: "$1.9B",
    successfulExits: 0,
    avgIrr: 12,
    consistency: 8,
    bio: "Two decades structuring junior capital for sponsor-led transactions. Recognized authority in mezzanine markets.",
    trackRecord: [
      { vintage: "2015", fund: "Sentinel Mezz I (prior firm)", netIrr: 13, status: "Realized" },
      { vintage: "2020", fund: "Sentinel Mezz I", netIrr: 11, status: "Active" },
    ],
  },
  {
    name: "Ingrid Larsson",
    firm: "Polaris Capital",
    title: "Partner",
    yearsExperience: 20,
    aum: "$3.3B",
    successfulExits: 14,
    avgIrr: 17,
    consistency: 9,
    bio: "Minority growth equity investor in founder-led businesses. Notable for collaborative governance approach.",
    trackRecord: [
      { vintage: "2013", fund: "Polaris Growth II", netIrr: 19, status: "Realized" },
      { vintage: "2016", fund: "Polaris Growth III", netIrr: 17, status: "Active" },
      { vintage: "2018", fund: "Polaris Growth IV", netIrr: 15, status: "Active" },
    ],
  },
  {
    name: "Dr. Yuki Tanaka",
    firm: "Summit Frontier",
    title: "Founding Partner",
    yearsExperience: 11,
    aum: "$760M",
    successfulExits: 3,
    avgIrr: 16,
    consistency: 5,
    bio: "PhD in applied physics. Backs capital-intensive deep tech with long horizons; concentrated portfolio.",
    trackRecord: [
      { vintage: "2018", fund: "Summit Deep Tech I", netIrr: 19, status: "Active" },
      { vintage: "2021", fund: "Summit Deep Tech II", netIrr: 13, status: "Active" },
    ],
  },
  {
    name: "Margaret O'Connell",
    firm: "Evergreen Realty",
    title: "Chief Executive Officer",
    yearsExperience: 30,
    aum: "$8.4B",
    successfulExits: 0,
    avgIrr: 8,
    consistency: 10,
    bio: "Three decades of stabilized core real estate management. Income-first philosophy with institutional client base.",
    trackRecord: [
      { vintage: "2005", fund: "Evergreen Income Trust", netIrr: 7, status: "Realized" },
      { vintage: "2018", fund: "Evergreen Income REIT", netIrr: 8, status: "Active" },
    ],
  },
];

export const managers: Manager[] = raw.map((m) => ({ ...m, id: slug(m.firm) }));

export const managersByFirm: Record<string, Manager> = Object.fromEntries(
  managers.map((m) => [m.firm, m])
);

export const getManagerForFund = (fund: Fund): Manager | undefined =>
  managersByFirm[fund.manager];

export const getManagerById = (id: string): Manager | undefined =>
  managers.find((m) => m.id === id);

export const getFundsForManager = (managerId: string): Fund[] => {
  const m = getManagerById(managerId);
  if (!m) return [];
  return funds.filter((f) => f.manager === m.firm);
};

/**
 * Trust Score (0–100) — transparent, weighted blend.
 *  • Experience (30%): years of experience, capped at 25
 *  • Performance (35%): avg net IRR, capped at 25%
 *  • Consistency (25%): 0–10 self-rated stability of returns
 *  • Track record breadth (10%): number of prior funds
 */
export function computeTrustScore(m: Manager): number {
  const expScore = Math.min(m.yearsExperience, 25) / 25; // 0–1
  const perfScore = Math.min(Math.max(m.avgIrr, 0), 25) / 25;
  const consScore = m.consistency / 10;
  const breadthScore = Math.min(m.trackRecord.length, 4) / 4;
  const blended =
    expScore * 0.3 + perfScore * 0.35 + consScore * 0.25 + breadthScore * 0.1;
  return Math.round(blended * 100);
}

export type TrustTier = "Exceptional" | "Strong" | "Established" | "Emerging";

export function trustTier(score: number): TrustTier {
  if (score >= 85) return "Exceptional";
  if (score >= 70) return "Strong";
  if (score >= 55) return "Established";
  return "Emerging";
}

export type RiskFlag = {
  kind: "info" | "warn";
  label: string;
  detail: string;
};

export function riskFlags(m: Manager, fund?: Fund): RiskFlag[] {
  const flags: RiskFlag[] = [];
  if (m.yearsExperience < 7) {
    flags.push({
      kind: "warn",
      label: "New manager",
      detail: "Less than 7 years of professional investment experience.",
    });
  }
  if (m.consistency <= 5) {
    flags.push({
      kind: "warn",
      label: "Inconsistent returns",
      detail: "Historical fund returns show meaningful variation across vintages.",
    });
  }
  if (fund && fund.riskScore >= 8) {
    flags.push({
      kind: "info",
      label: "High volatility strategy",
      detail: "This fund's strategy carries above-average risk by design.",
    });
  }
  if (m.trackRecord.length <= 1) {
    flags.push({
      kind: "warn",
      label: "First institutional fund",
      detail: "Limited prior fund performance to evaluate.",
    });
  }
  return flags;
}