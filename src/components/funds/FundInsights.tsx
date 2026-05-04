import { TrendingUp, TrendingDown, TriangleAlert as AlertTriangle, Minus } from "lucide-react";
import type { FundInsight, InsightTone } from "@/lib/insights";
import { ShareInsight } from "./ShareInsight";

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

interface Props {
  insights: FundInsight[];
  source?: string;
}

export function FundInsights({ insights, source }: Props) {
  return (
    <ul className="flex flex-col gap-3">
      {insights.map((insight) => (
        <InsightCard key={insight.id} insight={insight} source={source} />
      ))}
    </ul>
  );
}

function InsightCard({ insight, source }: { insight: FundInsight; source?: string }) {
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
        <div className="flex items-start justify-between gap-2">
          <span className="text-sm font-medium text-foreground">{insight.title}</span>
          <ShareInsight title={insight.title} detail={insight.detail} source={source} />
        </div>
        <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
          {insight.detail}
        </p>
      </div>
    </li>
  );
}
