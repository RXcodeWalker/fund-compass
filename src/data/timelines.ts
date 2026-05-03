import type { Fund } from "./funds";

export type TimelineKind =
  | "performance"
  | "deployment"
  | "distribution"
  | "milestone"
  | "governance"
  | "market";

export interface TimelineEntry {
  id: string;
  date: string; // YYYY-MM-DD
  quarter?: string; // e.g. "Q3 2024"
  kind: TimelineKind;
  title: string;
  description: string;
}

/**
 * Generate a deterministic timeline for a fund.
 * Produces quarterly entries spanning the fund's lifetime.
 */
function simpleHash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = Math.imul(31, h) + s.charCodeAt(i);
  }
  return h >>> 0;
}

function quarterFromDate(d: Date): string {
  const q = Math.floor(d.getMonth() / 3) + 1;
  return `Q${q} ${d.getFullYear()}`;
}

const perfTitles = [
  "Quarterly NAV published",
  "Performance update released",
  "Interim valuation completed",
];

const perfDetails = [
  (f: Fund, q: string) => `Net asset value for ${q} reflects continued ${f.strategy.toLowerCase()} performance.`,
  (f: Fund, q: string) => `${q} results for ${f.ticker} show returns within the expected ${f.returnMin}–${f.returnMax}% band.`,
  (f: Fund, q: string) => `Independent valuation for ${q} completed. NAV adjusted for market conditions.`,
];

const deployTitles = [
  "Capital deployed in new opportunities",
  "Investment activity this quarter",
  "New positions added to portfolio",
];

const deployDetails = [
  (f: Fund, q: string) => {
    if (f.type === "Venture Capital") return `New portfolio companies added during ${q}. Due diligence completed on multiple targets.`;
    if (f.type === "Real Estate") return `Property acquisitions closed during ${q}. Asset improvement program on track.`;
    if (f.type === "Private Debt") return `New credit positions originated during ${q}. Portfolio diversification maintained.`;
    return `New investments deployed during ${q} across the ${f.strategy.toLowerCase()} strategy.`;
  },
  (f: Fund, q: string) => `${q} deployment activity for ${f.name}. Capital put to work in line with investment mandate.`,
];

const distTitles = [
  "Quarterly distribution to LPs",
  "Cash returns distributed",
  "Income distribution processed",
];

const distDetails = [
  (f: Fund, q: string) => `${q} distribution from ${f.name} processed. Income-oriented strategy delivering consistent yields.`,
  (f: Fund, q: string) => `LPs received cash distribution for ${q}. Cumulative distributions remain on track.`,
];

const milestoneTitles = [
  "Fund anniversary milestone",
  "Strategy review completed",
  "Portfolio company exit realized",
];

const milestoneDetails = [
  (f: Fund, q: string) => `${f.name} reached a portfolio milestone during ${q}. Strategy execution remains on plan.`,
  (f: Fund, q: string) => `Annual strategy review for ${f.ticker} completed during ${q}. No material changes to investment approach.`,
];

const governanceTitles = [
  "Advisory board meeting held",
  "Governance update",
  "LP communication issued",
];

const governanceDetails = [
  (f: Fund, q: string) => `Quarterly advisory board for ${f.name} convened during ${q}. Key decisions documented.`,
  (f: Fund, q: string) => `Governance and compliance review for ${q} completed. All regulatory filings current.`,
];

const marketTitles = [
  "Market commentary updated",
  "Sector outlook revised",
  "Macro environment assessment",
];

const marketDetails = [
  (f: Fund, q: string) => `Investment team updated market outlook for ${q}. Positioning adjusted where appropriate.`,
  (f: Fund, q: string) => `Macro conditions during ${q} reviewed. ${f.strategy} strategy positioned for current environment.`,
];

export function generateTimeline(fund: Fund): TimelineEntry[] {
  const entries: TimelineEntry[] = [];
  const inceptionYear = parseInt(fund.inception.match(/\d{4}/)?.[0] ?? "2020");
  const inceptionQ = parseInt(fund.inception.match(/Q(\d)/)?.[1] ?? "1");
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentQ = Math.floor(now.getMonth() / 3) + 1;

  let entryId = 0;

  for (let y = inceptionYear; y <= currentYear; y++) {
    const startQ = y === inceptionYear ? inceptionQ : 1;
    const endQ = y === currentYear ? currentQ : 4;

    for (let q = startQ; q <= endQ; q++) {
      const qLabel = `Q${q} ${y}`;
      const seed = `${fund.id}:${y}:${q}`;
      const h = simpleHash(seed);

      // Month for the quarter (middle month)
      const month = (q - 1) * 3 + 2;
      const dateStr = `${y}-${String(month).padStart(2, "0")}-15`;

      // Performance entry (always)
      const pIdx = h % perfTitles.length;
      const pdIdx = h % perfDetails.length;
      entries.push({
        id: `${fund.id}-tl-${entryId++}`,
        date: dateStr,
        quarter: qLabel,
        kind: "performance",
        title: perfTitles[pIdx],
        description: perfDetails[pdIdx](fund, qLabel),
      });

      // Deployment entry (most quarters)
      if (h % 4 !== 0) {
        const dIdx = (h >> 4) % deployTitles.length;
        const ddIdx = (h >> 4) % deployDetails.length;
        entries.push({
          id: `${fund.id}-tl-${entryId++}`,
          date: dateStr,
          quarter: qLabel,
          kind: "deployment",
          title: deployTitles[dIdx],
          description: deployDetails[ddIdx](fund, qLabel),
        });
      }

      // Distribution entry (income-oriented funds)
      if (fund.type === "Private Debt" || fund.type === "Real Estate") {
        if (h % 3 !== 0) {
          const diIdx = (h >> 6) % distTitles.length;
          const didIdx = (h >> 6) % distDetails.length;
          entries.push({
            id: `${fund.id}-tl-${entryId++}`,
            date: dateStr,
            quarter: qLabel,
            kind: "distribution",
            title: distTitles[diIdx],
            description: distDetails[didIdx](fund, qLabel),
          });
        }
      }

      // Milestone (rare)
      if (h % 8 === 0) {
        const mIdx = (h >> 8) % milestoneTitles.length;
        const mdIdx = (h >> 8) % milestoneDetails.length;
        entries.push({
          id: `${fund.id}-tl-${entryId++}`,
          date: dateStr,
          quarter: qLabel,
          kind: "milestone",
          title: milestoneTitles[mIdx],
          description: milestoneDetails[mdIdx](fund, qLabel),
        });
      }

      // Governance (some quarters)
      if (h % 3 === 0) {
        const gIdx = (h >> 3) % governanceTitles.length;
        const gdIdx = (h >> 3) % governanceDetails.length;
        entries.push({
          id: `${fund.id}-tl-${entryId++}`,
          date: dateStr,
          quarter: qLabel,
          kind: "governance",
          title: governanceTitles[gIdx],
          description: governanceDetails[gdIdx](fund, qLabel),
        });
      }

      // Market commentary (some quarters)
      if (h % 5 === 0) {
        const mkIdx = (h >> 5) % marketTitles.length;
        const mkdIdx = (h >> 5) % marketDetails.length;
        entries.push({
          id: `${fund.id}-tl-${entryId++}`,
          date: dateStr,
          quarter: qLabel,
          kind: "market",
          title: marketTitles[mkIdx],
          description: marketDetails[mkdIdx](fund, qLabel),
        });
      }
    }
  }

  // Sort newest first
  entries.sort((a, b) => b.date.localeCompare(a.date));

  return entries;
}
