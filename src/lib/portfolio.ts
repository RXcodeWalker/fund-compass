import type { Fund } from "@/data/funds";
import type { Holding } from "@/hooks/usePortfolio";

/**
 * Deterministic mock simulator.
 * Given a fund and a holding, produces a monthly NAV series indexed at 100,
 * and a current value. Growth follows the midpoint of the fund's expected
 * return band, with a deterministic noise function so values are stable.
 */
export interface SimPoint {
  date: string; // YYYY-MM
  value: number; // dollars
}

const monthsBetween = (startISO: string, endDate: Date) => {
  const s = new Date(startISO);
  if (Number.isNaN(s.getTime())) return 0;
  const months = (endDate.getFullYear() - s.getFullYear()) * 12 + (endDate.getMonth() - s.getMonth());
  return Math.max(0, months);
};

// Simple deterministic pseudo-noise from a string seed
const seededNoise = (seed: string, i: number) => {
  let h = 2166136261;
  const s = `${seed}:${i}`;
  for (let k = 0; k < s.length; k++) {
    h ^= s.charCodeAt(k);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 1000) / 1000 - 0.5; // -0.5..0.5
};

export function simulateHolding(fund: Fund, holding: Holding, now: Date = new Date()): {
  series: SimPoint[];
  currentValue: number;
  returnPct: number;
  gain: number;
} {
  const annualMid = (fund.returnMin + fund.returnMax) / 2 / 100;
  const monthlyRate = Math.pow(1 + annualMid, 1 / 12) - 1;
  const vol = (fund.riskScore / 10) * 0.04; // up to 4% monthly noise

  const totalMonths = Math.max(1, monthsBetween(holding.startDate, now));
  const series: SimPoint[] = [];

  let value = holding.amount;
  // start point
  const start = new Date(holding.startDate);
  const fmt = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  series.push({ date: fmt(start), value: Math.round(value) });

  for (let i = 1; i <= totalMonths; i++) {
    const noise = seededNoise(fund.id + holding.startDate, i) * vol;
    value = value * (1 + monthlyRate + noise);
    const d = new Date(start);
    d.setMonth(d.getMonth() + i);
    series.push({ date: fmt(d), value: Math.round(value) });
  }

  const currentValue = Math.round(value);
  const gain = currentValue - holding.amount;
  const returnPct = holding.amount > 0 ? (gain / holding.amount) * 100 : 0;

  return { series, currentValue, returnPct, gain };
}

export interface PortfolioSummary {
  totalInvested: number;
  totalCurrent: number;
  totalGain: number;
  returnPct: number;
  series: SimPoint[]; // aggregated portfolio value over time
}

export function summarizePortfolio(
  funds: Fund[],
  holdings: Holding[]
): PortfolioSummary {
  const sims = holdings
    .map((h) => {
      const f = funds.find((x) => x.id === h.fundId);
      return f ? { holding: h, sim: simulateHolding(f, h) } : null;
    })
    .filter((x): x is { holding: Holding; sim: ReturnType<typeof simulateHolding> } => Boolean(x));

  const totalInvested = sims.reduce((acc, x) => acc + x.holding.amount, 0);
  const totalCurrent = sims.reduce((acc, x) => acc + x.sim.currentValue, 0);

  // Aggregate by month: take the union of all dates, summing each holding's value
  // (using its last-known value if its series doesn't include that month yet).
  const allDates = new Set<string>();
  sims.forEach(({ sim }) => sim.series.forEach((p) => allDates.add(p.date)));
  const sortedDates = Array.from(allDates).sort();

  const series: SimPoint[] = sortedDates.map((date) => {
    let total = 0;
    for (const { holding, sim } of sims) {
      if (date < sim.series[0].date) continue; // not yet started
      // find latest point <= date
      let v = sim.series[0].value;
      for (const p of sim.series) {
        if (p.date <= date) v = p.value;
        else break;
      }
      total += v;
      // suppress unused warning
      void holding;
    }
    return { date, value: Math.round(total) };
  });

  return {
    totalInvested,
    totalCurrent,
    totalGain: totalCurrent - totalInvested,
    returnPct: totalInvested > 0 ? ((totalCurrent - totalInvested) / totalInvested) * 100 : 0,
    series,
  };
}

export const fmtUSD = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export const fmtPct = (n: number) =>
  `${n >= 0 ? "+" : ""}${n.toFixed(1)}%`;
