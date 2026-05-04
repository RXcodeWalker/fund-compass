import { TrendingUp, ShieldCheck, DollarSign, Clock, DoorOpen, TriangleAlert as AlertTriangle } from "lucide-react";
import type { ComparisonInsight, InsightTone } from "@/lib/insights";
import { ShareInsight } from "./ShareInsight";

const labelIcon: Record<string, React.ElementType> = {
  "Highest return potential": TrendingUp,
  "Lowest risk option": ShieldCheck,
  "Best for income": DollarSign,
  "Shortest commitment": Clock,
  "Most accessible": DoorOpen,
  "Highest volatility": AlertTriangle,
};

const toneColor: Record<InsightTone, string> = {
  positive: "text-risk-low border-risk-low/30 bg-risk-low/5",
  caution: "text-risk-medium border-risk-medium/30 bg-risk-medium/5",
  neutral: "text-foreground border-border bg-surface",
  negative: "text-risk-high border-risk-high/30 bg-risk-high/5",
};

interface Props {
  insights: ComparisonInsight[];
}

export function ComparisonInsights({ insights }: Props) {
  if (insights.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {insights.map((insight) => {
        const Icon = labelIcon[insight.label] ?? TrendingUp;
        const color = toneColor[insight.tone];
        return (
          <div
            key={`${insight.fundId}-${insight.label}`}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 ${color}`}
          >
            <Icon className="size-3" />
            <span className="text-[11px] font-medium">{insight.label}</span>
            <span className="text-[11px] text-muted-foreground">— {insight.fundName}</span>
            <ShareInsight title={insight.label} detail={`${insight.fundName}: ${insight.label}`} className="ml-0.5" />
          </div>
        );
      })}
    </div>
  );
}
