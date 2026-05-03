import { Link } from "react-router-dom";
import { TrendingUp, Building2, ChartBar as BarChart3, ArrowUpRight, ArrowDownLeft, UserCheck, Activity } from "lucide-react";
import { generateActivityFeed, kindIcons, type ActivityEntry, type ActivityKind } from "@/data/activity";
import { relativeTime } from "@/lib/simulation";

const iconMap: Record<ActivityKind, React.ElementType> = {
  performance: TrendingUp,
  asset_update: Building2,
  quarterly_results: BarChart3,
  capital_call: ArrowUpRight,
  distribution: ArrowDownLeft,
  manager_update: UserCheck,
  nav_update: Activity,
};

const kindLabel: Record<ActivityKind, string> = {
  performance: "Performance",
  asset_update: "Asset Update",
  quarterly_results: "Quarterly",
  capital_call: "Capital Call",
  distribution: "Distribution",
  manager_update: "Manager",
  nav_update: "NAV Update",
};

const kindTone: Record<ActivityKind, string> = {
  performance: "text-risk-low",
  asset_update: "text-foreground",
  quarterly_results: "text-foreground",
  capital_call: "text-risk-medium",
  distribution: "text-risk-low",
  manager_update: "text-muted-foreground",
  nav_update: "text-foreground",
};

export function ActivityFeed({ limit = 8 }: { limit?: number }) {
  const entries = generateActivityFeed(limit);

  return (
    <section>
      <div className="mb-4 flex items-baseline justify-between border-b border-border pb-3">
        <span className="label-eyebrow">Recent Activity</span>
        <span className="font-mono text-[11px] text-muted-foreground">
          Simulated live feed
        </span>
      </div>
      <ul className="flex flex-col gap-0">
        {entries.map((entry) => (
          <ActivityItem key={entry.id} entry={entry} />
        ))}
      </ul>
    </section>
  );
}

function ActivityItem({ entry }: { entry: ActivityEntry }) {
  const Icon = iconMap[entry.kind];
  const tone = kindTone[entry.kind];
  const label = kindLabel[entry.kind];

  return (
    <li className="group flex items-start gap-3 border-b border-border py-3.5 last:border-b-0">
      <div className={`mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md border border-border bg-surface ${tone}`}>
        <Icon className="size-3.5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <Link
            to={`/fund/${entry.fundId}`}
            className="text-sm font-medium text-foreground transition-colors hover:underline"
          >
            {entry.message}
          </Link>
          <span className="shrink-0 font-mono text-[10px] text-muted-foreground">
            {relativeTime(entry.timestamp)}
          </span>
        </div>
        <div className="mt-1 flex items-center gap-2">
          <span className="rounded-full border border-border bg-surface px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
            {label}
          </span>
          <span className="font-mono text-[11px] text-muted-foreground">
            {entry.fundTicker}
          </span>
        </div>
        <p className="mt-1.5 text-[12px] leading-relaxed text-muted-foreground">
          {entry.detail}
        </p>
      </div>
    </li>
  );
}
