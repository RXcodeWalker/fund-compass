import { TrendingUp, TriangleAlert as AlertTriangle, Minus, TrendingDown, ChartPie as PieChart } from "lucide-react";
import type { PortfolioAnalysis, PortfolioInsight, InsightTone } from "@/lib/insights";

const toneIcon: Record<InsightTone, React.ElementType> = {
  positive: TrendingUp,
  caution: AlertTriangle,
  neutral: Minus,
  negative: TrendingDown,
};

const toneColor: Record<InsightTone, string> = {
  positive: "text-risk-low",
  caution: "text-risk-medium",
  neutral: "text-muted-foreground",
  negative: "text-risk-high",
};

const toneBorder: Record<InsightTone, string> = {
  positive: "border-risk-low/30",
  caution: "border-risk-medium/30",
  neutral: "border-border",
  negative: "border-risk-high/30",
};

const toneBg: Record<InsightTone, string> = {
  positive: "bg-risk-low/5",
  caution: "bg-risk-medium/5",
  neutral: "bg-surface",
  negative: "bg-risk-high/5",
};

const riskBarColor: Record<string, string> = {
  low: "bg-risk-low",
  medium: "bg-risk-medium",
  high: "bg-risk-high",
};

const typeColor: Record<string, string> = {
  "Venture Capital": "bg-risk-high",
  "Private Equity": "bg-risk-medium",
  "Real Estate": "bg-risk-low",
  "Private Debt": "bg-risk-low",
};

interface Props {
  analysis: PortfolioAnalysis;
}

export function PortfolioAnalysisSection({ analysis }: Props) {
  const { riskDist, typeDist, diversificationLevel, insights } = analysis;
  const totalFunds = riskDist.low + riskDist.medium + riskDist.high;

  const divLevelColor =
    diversificationLevel === "High"
      ? "text-risk-low"
      : diversificationLevel === "Medium"
        ? "text-risk-medium"
        : "text-risk-high";

  return (
    <div className="space-y-6">
      {/* Risk Distribution */}
      <div>
        <h3 className="label-eyebrow mb-3">Risk Distribution</h3>
        <div className="machined-edge rounded-lg border border-border bg-surface p-4">
          <div className="flex h-3 overflow-hidden rounded-full bg-border">
            {totalFunds > 0 && (
              <>
                {riskDist.low > 0 && (
                  <div
                    className={`${riskBarColor.low} transition-all`}
                    style={{ width: `${(riskDist.low / totalFunds) * 100}%` }}
                  />
                )}
                {riskDist.medium > 0 && (
                  <div
                    className={`${riskBarColor.medium} transition-all`}
                    style={{ width: `${(riskDist.medium / totalFunds) * 100}%` }}
                  />
                )}
                {riskDist.high > 0 && (
                  <div
                    className={`${riskBarColor.high} transition-all`}
                    style={{ width: `${(riskDist.high / totalFunds) * 100}%` }}
                  />
                )}
              </>
            )}
          </div>
          <div className="mt-3 flex items-center gap-4">
            <RiskLabel label="Low" count={riskDist.low} total={totalFunds} color="bg-risk-low" />
            <RiskLabel label="Medium" count={riskDist.medium} total={totalFunds} color="bg-risk-medium" />
            <RiskLabel label="High" count={riskDist.high} total={totalFunds} color="bg-risk-high" />
          </div>
        </div>
      </div>

      {/* Asset Class Distribution */}
      <div>
        <h3 className="label-eyebrow mb-3">Asset Class Breakdown</h3>
        <div className="machined-edge rounded-lg border border-border bg-surface p-4">
          <div className="flex flex-col gap-2.5">
            {typeDist.map((td) => (
              <div key={td.type} className="flex items-center gap-3">
                <div className={`size-2.5 shrink-0 rounded-full ${typeColor[td.type] ?? "bg-muted-foreground"}`} />
                <span className="flex-1 text-sm text-foreground">{td.type}</span>
                <span className="font-mono text-xs text-muted-foreground">
                  {td.count} fund{td.count !== 1 ? "s" : ""} · {td.pct}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Diversification Level */}
      <div>
        <h3 className="label-eyebrow mb-3">Diversification</h3>
        <div className="machined-edge rounded-lg border border-border bg-surface p-4">
          <div className="flex items-center gap-3">
            <PieChart className={`size-5 ${divLevelColor}`} />
            <div>
              <span className={`text-sm font-semibold ${divLevelColor}`}>
                {diversificationLevel} diversification
              </span>
              <p className="mt-0.5 text-[12px] text-muted-foreground">
                {diversificationLevel === "High"
                  ? "Well spread across asset classes and risk levels."
                  : diversificationLevel === "Medium"
                    ? "Some diversification exists, but concentration is notable."
                    : "Heavily concentrated — consider adding variety."}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Insights */}
      {insights.length > 0 && (
        <div>
          <h3 className="label-eyebrow mb-3">Analysis</h3>
          <ul className="flex flex-col gap-3">
            {insights.map((insight) => (
              <InsightItem key={insight.id} insight={insight} />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function RiskLabel({
  label,
  count,
  total,
  color,
}: {
  label: string;
  count: number;
  total: number;
  color: string;
}) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-1.5">
      <div className={`size-2 rounded-full ${color}`} />
      <span className="font-mono text-[11px] text-muted-foreground">
        {label} {pct}%
      </span>
    </div>
  );
}

function InsightItem({ insight }: { insight: PortfolioInsight }) {
  const Icon = toneIcon[insight.tone];
  const color = toneColor[insight.tone];
  const border = toneBorder[insight.tone];
  const bg = toneBg[insight.tone];

  return (
    <li className={`flex items-start gap-3 rounded-md border ${border} ${bg} p-4`}>
      <div className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full ${color}`}>
        <Icon className="size-3" />
      </div>
      <div className="flex-1 min-w-0">
        <span className="text-sm font-medium text-foreground">{insight.title}</span>
        <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
          {insight.detail}
        </p>
      </div>
    </li>
  );
}
