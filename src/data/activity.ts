import { funds } from "./funds";
import { dailyChange, monthlyChange, relativeTime } from "@/lib/simulation";

export type ActivityKind =
  | "performance"
  | "asset_update"
  | "quarterly_results"
  | "capital_call"
  | "distribution"
  | "manager_update"
  | "nav_update";

export interface ActivityEntry {
  id: string;
  fundId: string;
  fundName: string;
  fundTicker: string;
  kind: ActivityKind;
  message: string;
  detail: string;
  timestamp: Date;
}

const kindIcons: Record<ActivityKind, string> = {
  performance: "TrendingUp",
  asset_update: "Building2",
  quarterly_results: "BarChart3",
  capital_call: "ArrowUpRight",
  distribution: "ArrowDownLeft",
  manager_update: "UserCheck",
  nav_update: "Activity",
};

export { kindIcons };

/**
 * Generate a deterministic set of recent activity entries.
 * Uses the current date as a seed so entries shift daily.
 */
function daySeedNum(): number {
  const d = new Date();
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}

function simpleHash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = Math.imul(31, h) + s.charCodeAt(i);
  }
  return h >>> 0;
}

const performanceTemplates = [
  (f: typeof funds[number], change: number) => ({
    message: `${f.name} reported ${change >= 0 ? "+" : ""}${change.toFixed(1)}% this month`,
    detail: `Monthly performance update for ${f.type} strategy.`,
  }),
  (f: typeof funds[number], change: number) => ({
    message: `${f.name} NAV updated to reflect ${change >= 0 ? "gain" : "loss"}`,
    detail: `Net asset value adjusted by ${change >= 0 ? "+" : ""}${change.toFixed(1)}% month-over-month.`,
  }),
];

const assetTemplates = [
  (f: typeof funds[number]) => ({
    message: `${f.name} added new ${f.type === "Real Estate" ? "property asset" : f.type === "Venture Capital" ? "portfolio company" : "credit position"}`,
    detail: `New ${f.type === "Real Estate" ? "acquisition closed" : f.type === "Venture Capital" ? "investment deployed" : "position originated"} in ${f.name}.`,
  }),
  (f: typeof funds[number]) => ({
    message: `${f.name} expanded ${f.type === "Real Estate" ? "real estate holdings" : f.type === "Venture Capital" ? "investment portfolio" : "lending book"}`,
    detail: `Additional capital deployed across the ${f.strategy.toLowerCase()} strategy.`,
  }),
];

const quarterlyTemplates = [
  (f: typeof funds[number]) => ({
    message: `${f.name} published quarterly results`,
    detail: `Q results now available for ${f.ticker}. Performance in line with strategy expectations.`,
  }),
  (f: typeof funds[number]) => ({
    message: `${f.name} quarterly report available`,
    detail: `Updated financials and portfolio metrics for ${f.name} released to investors.`,
  }),
];

const capitalCallTemplates = [
  (f: typeof funds[number]) => ({
    message: `${f.name} issued capital call notice`,
    detail: `Investors notified of upcoming capital commitment drawdown for ${f.ticker}.`,
  }),
];

const distributionTemplates = [
  (f: typeof funds[number]) => ({
    message: `${f.name} distributed returns to LPs`,
    detail: `Quarterly distribution from ${f.name} processed. Check your portfolio for details.`,
  }),
];

const managerTemplates = [
  (f: typeof funds[number]) => ({
    message: `${f.manager} updated fund outlook`,
    detail: `Manager commentary and forward guidance updated for ${f.name}.`,
  }),
];

export function generateActivityFeed(limit = 12): ActivityEntry[] {
  const seed = daySeedNum();
  const entries: ActivityEntry[] = [];

  // Generate 2-3 entries per fund, then sort by recency
  funds.forEach((fund, fi) => {
    const fundSeed = seed + fi * 7919;

    // Performance update
    const mc = monthlyChange(fund);
    const pIdx = simpleHash(`${fundSeed}:perf`) % performanceTemplates.length;
    const pTpl = performanceTemplates[pIdx](fund, mc);
    const pHoursAgo = 1 + (simpleHash(`${fundSeed}:perf:time`) % 12);
    entries.push({
      id: `${fund.id}-perf-${seed}`,
      fundId: fund.id,
      fundName: fund.name,
      fundTicker: fund.ticker,
      kind: "performance",
      message: pTpl.message,
      detail: pTpl.detail,
      timestamp: new Date(Date.now() - pHoursAgo * 3600000),
    });

    // Asset update (some funds)
    if (simpleHash(`${fundSeed}:asset`) % 3 !== 0) {
      const aIdx = simpleHash(`${fundSeed}:asset`) % assetTemplates.length;
      const aTpl = assetTemplates[aIdx](fund);
      const aHoursAgo = 6 + (simpleHash(`${fundSeed}:asset:time`) % 48);
      entries.push({
        id: `${fund.id}-asset-${seed}`,
        fundId: fund.id,
        fundName: fund.name,
        fundTicker: fund.ticker,
        kind: "asset_update",
        message: aTpl.message,
        detail: aTpl.detail,
        timestamp: new Date(Date.now() - aHoursAgo * 3600000),
      });
    }

    // Quarterly results (some funds)
    if (simpleHash(`${fundSeed}:quarter`) % 4 === 0) {
      const qIdx = simpleHash(`${fundSeed}:quarter`) % quarterlyTemplates.length;
      const qTpl = quarterlyTemplates[qIdx](fund);
      const qHoursAgo = 24 + (simpleHash(`${fundSeed}:quarter:time`) % 72);
      entries.push({
        id: `${fund.id}-quarter-${seed}`,
        fundId: fund.id,
        fundName: fund.name,
        fundTicker: fund.ticker,
        kind: "quarterly_results",
        message: qTpl.message,
        detail: qTpl.detail,
        timestamp: new Date(Date.now() - qHoursAgo * 3600000),
      });
    }

    // Distribution (some funds)
    if (simpleHash(`${fundSeed}:dist`) % 5 === 0) {
      const dTpl = distributionTemplates[0](fund);
      const dHoursAgo = 12 + (simpleHash(`${fundSeed}:dist:time`) % 96);
      entries.push({
        id: `${fund.id}-dist-${seed}`,
        fundId: fund.id,
        fundName: fund.name,
        fundTicker: fund.ticker,
        kind: "distribution",
        message: dTpl.message,
        detail: dTpl.detail,
        timestamp: new Date(Date.now() - dHoursAgo * 3600000),
      });
    }

    // Capital call (rare)
    if (simpleHash(`${fundSeed}:ccall`) % 7 === 0) {
      const cTpl = capitalCallTemplates[0](fund);
      const cHoursAgo = 48 + (simpleHash(`${fundSeed}:ccall:time`) % 120);
      entries.push({
        id: `${fund.id}-ccall-${seed}`,
        fundId: fund.id,
        fundName: fund.name,
        fundTicker: fund.ticker,
        kind: "capital_call",
        message: cTpl.message,
        detail: cTpl.detail,
        timestamp: new Date(Date.now() - cHoursAgo * 3600000),
      });
    }

    // Manager update (some)
    if (simpleHash(`${fundSeed}:mgr`) % 4 === 0) {
      const mTpl = managerTemplates[0](fund);
      const mHoursAgo = 8 + (simpleHash(`${fundSeed}:mgr:time`) % 48);
      entries.push({
        id: `${fund.id}-mgr-${seed}`,
        fundId: fund.id,
        fundName: fund.name,
        fundTicker: fund.ticker,
        kind: "manager_update",
        message: mTpl.message,
        detail: mTpl.detail,
        timestamp: new Date(Date.now() - mHoursAgo * 3600000),
      });
    }
  });

  // Sort by most recent first
  entries.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  return entries.slice(0, limit);
}
