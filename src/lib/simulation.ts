import type { Fund } from "@/data/funds";

/**
 * Deterministic pseudo-random number generator seeded by fund id + date.
 * Produces stable values within a single day, shifting subtly each day.
 */
function seededRandom(seed: string): number {
  let h = 2166136261;
  for (let k = 0; k < seed.length; k++) {
    h ^= seed.charCodeAt(k);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967296; // 0..1
}

/** Today's date as a compact seed string */
function daySeed(): string {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

/**
 * Generate a daily change percentage for a fund.
 * High-risk funds have wider swings; low-risk funds are stable.
 * Returns a value like +1.2% or -0.4%.
 */
export function dailyChange(fund: Fund): number {
  const seed = `${fund.id}:daily:${daySeed()}`;
  const r = seededRandom(seed);
  // Map 0..1 to -1..1, then scale by risk
  const raw = (r - 0.5) * 2;
  const maxSwing = fund.riskScore * 0.35; // Low risk: ~1%, High risk: ~3.5%
  return Math.round(raw * maxSwing * 10) / 10;
}

/**
 * Generate a weekly change percentage for a fund.
 * Slightly larger range than daily.
 */
export function weeklyChange(fund: Fund): number {
  const seed = `${fund.id}:weekly:${daySeed()}`;
  const r = seededRandom(seed);
  const raw = (r - 0.5) * 2;
  const maxSwing = fund.riskScore * 0.6;
  return Math.round(raw * maxSwing * 10) / 10;
}

/**
 * Generate a monthly change percentage for a fund.
 */
export function monthlyChange(fund: Fund): number {
  const seed = `${fund.id}:monthly:${daySeed()}`;
  const r = seededRandom(seed);
  const raw = (r - 0.5) * 2;
  const maxSwing = fund.riskScore * 1.2;
  return Math.round(raw * maxSwing * 10) / 10;
}

/**
 * Generate recent 30-day performance data points for a fund.
 * Each point is a day with a simulated NAV value.
 */
export function recentPerformance(fund: Fund): { day: string; value: number }[] {
  const points: { day: string; value: number }[] = [];
  const baseValue = fund.performance[fund.performance.length - 1]?.value ?? 100;
  const today = new Date();

  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const seed = `${fund.id}:perf:${dateStr}`;
    const r = seededRandom(seed);
    const noise = (r - 0.5) * fund.riskScore * 0.8;
    const drift = ((fund.returnMin + fund.returnMax) / 2 / 100 / 365) * (30 - i);
    const value = Math.round((baseValue * (1 + drift + noise / 100)) * 10) / 10;
    points.push({ day: dateStr, value });
  }

  return points;
}

/**
 * Simulate a "current NAV" for a fund based on its last known value
 * plus the daily change.
 */
export function currentNav(fund: Fund): number {
  const lastValue = fund.performance[fund.performance.length - 1]?.value ?? 100;
  const change = dailyChange(fund) / 100;
  return Math.round(lastValue * (1 + change) * 100) / 100;
}

/**
 * Generate a simulated "last updated" timestamp for a fund.
 * Funds update at different intervals based on type.
 */
export function lastUpdatedForFund(fund: Fund): Date {
  const now = new Date();
  const seed = `${fund.id}:updated:${daySeed()}`;
  const r = seededRandom(seed);

  const intervals: Record<string, [number, number]> = {
    "Venture Capital": [2, 8],    // hours
    "Private Equity": [1, 6],
    "Real Estate": [4, 24],
    "Private Debt": [1, 4],
  };

  const [minH, maxH] = intervals[fund.type] ?? [1, 6];
  const hoursAgo = minH + r * (maxH - minH);

  const updated = new Date(now.getTime() - hoursAgo * 60 * 60 * 1000);
  return updated;
}

/**
 * Format a date as a relative time string.
 */
export function relativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/**
 * Format a change value as a signed percentage string.
 */
export function fmtChange(value: number): string {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
}

/**
 * CSS class for a change value (green for positive, red for negative).
 */
export function changeColor(value: number): string {
  if (value > 0) return "text-risk-low";
  if (value < 0) return "text-risk-high";
  return "text-muted-foreground";
}
