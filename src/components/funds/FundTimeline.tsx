import { useState } from "react";
import { TrendingUp, Building2, ArrowDownLeft, Award, ShieldCheck, ChartBar as BarChart3 } from "lucide-react";
import type { TimelineEntry, TimelineKind } from "@/data/timelines";

const iconMap: Record<TimelineKind, React.ElementType> = {
  performance: TrendingUp,
  deployment: Building2,
  distribution: ArrowDownLeft,
  milestone: Award,
  governance: ShieldCheck,
  market: BarChart3,
};

const kindLabel: Record<TimelineKind, string> = {
  performance: "Performance",
  deployment: "Deployment",
  distribution: "Distribution",
  milestone: "Milestone",
  governance: "Governance",
  market: "Market",
};

const kindTone: Record<TimelineKind, string> = {
  performance: "text-risk-low",
  deployment: "text-foreground",
  distribution: "text-risk-low",
  milestone: "text-risk-medium",
  governance: "text-muted-foreground",
  market: "text-foreground",
};

const kindBorder: Record<TimelineKind, string> = {
  performance: "border-risk-low/40",
  deployment: "border-border-strong",
  distribution: "border-risk-low/30",
  milestone: "border-risk-medium/40",
  governance: "border-border",
  market: "border-border",
};

interface Props {
  entries: TimelineEntry[];
  initialShow?: number;
}

export function FundTimeline({ entries, initialShow = 8 }: Props) {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? entries : entries.slice(0, initialShow);
  const hasMore = entries.length > initialShow;

  // Group by quarter for visual clarity
  const grouped: { quarter: string; items: TimelineEntry[] }[] = [];
  let currentQuarter = "";
  for (const entry of visible) {
    const q = entry.quarter ?? entry.date.slice(0, 7);
    if (q !== currentQuarter) {
      grouped.push({ quarter: q, items: [] });
      currentQuarter = q;
    }
    grouped[grouped.length - 1].items.push(entry);
  }

  return (
    <div>
      {grouped.map((group) => (
        <div key={group.quarter} className="mb-6 last:mb-0">
          <div className="mb-3 flex items-center gap-2">
            <span className="label-eyebrow">{group.quarter}</span>
            <div className="h-px flex-1 bg-border" />
          </div>
          <ul className="flex flex-col gap-0">
            {group.items.map((entry, i) => (
              <TimelineItem key={entry.id} entry={entry} isLast={i === group.items.length - 1} />
            ))}
          </ul>
        </div>
      ))}

      {hasMore && !showAll && (
        <button
          type="button"
          onClick={() => setShowAll(true)}
          className="mt-4 rounded-md border border-border px-4 py-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          Show all {entries.length} entries
        </button>
      )}
    </div>
  );
}

function TimelineItem({ entry, isLast }: { entry: TimelineEntry; isLast: boolean }) {
  const Icon = iconMap[entry.kind];
  const tone = kindTone[entry.kind];
  const border = kindBorder[entry.kind];
  const label = kindLabel[entry.kind];

  return (
    <li className="flex items-start gap-3 pb-4 last:pb-0">
      {/* Timeline line + dot */}
      <div className="flex flex-col items-center">
        <div className={`flex size-6 shrink-0 items-center justify-center rounded-full border ${border} bg-surface ${tone}`}>
          <Icon className="size-3" />
        </div>
        {!isLast && <div className="w-px flex-1 bg-border" />}
      </div>

      {/* Content */}
      <div className="flex-1 pb-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">{entry.title}</span>
          <span className="rounded-full border border-border bg-surface px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
            {label}
          </span>
        </div>
        <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
          {entry.description}
        </p>
        <span className="mt-1 inline-block font-mono text-[10px] text-muted-foreground">
          {entry.date}
        </span>
      </div>
    </li>
  );
}
