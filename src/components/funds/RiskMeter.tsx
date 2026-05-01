import type { RiskLevel } from "@/data/funds";

interface Props {
  risk: RiskLevel;
  score: number; // 1-10
  showLabel?: boolean;
  className?: string;
}

const colorByRisk: Record<RiskLevel, string> = {
  Low: "bg-risk-low",
  Medium: "bg-risk-medium",
  High: "bg-risk-high",
};

export function RiskMeter({ risk, score, showLabel = true, className = "" }: Props) {
  const pct = Math.min(100, Math.max(8, score * 10));
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-surface-muted">
        <div className={`h-full rounded-full ${colorByRisk[risk]}`} style={{ width: `${pct}%` }} />
      </div>
      {showLabel && (
        <span className="font-mono text-[11px] text-foreground">
          {risk}
        </span>
      )}
    </div>
  );
}