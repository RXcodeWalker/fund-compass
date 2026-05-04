import { TrendingUp, Sparkles, Bell } from "lucide-react";
import { usePortfolio } from "@/hooks/usePortfolio";
import { funds } from "@/data/funds";
import { summarizePortfolio } from "@/lib/portfolio";
import { useSubscription } from "@/hooks/useSubscription";

export function ReturnTriggers() {
  const { holdings } = usePortfolio();
  const { isPro } = useSubscription();

  if (holdings.length === 0) return null;

  const summary = summarizePortfolio(funds, holdings);
  const weeklyPct = summary.returnPct;
  const positive = weeklyPct >= 0;

  const notifications = [
    {
      icon: TrendingUp,
      text: positive
        ? `Your portfolio is up ${Math.abs(weeklyPct).toFixed(1)}% overall`
        : `Your portfolio is down ${Math.abs(weeklyPct).toFixed(1)}% overall`,
      tone: positive ? "text-risk-low" : "text-risk-high",
    },
    {
      icon: Sparkles,
      text: "New insights available for your funds",
      tone: "text-foreground",
    },
  ];

  if (!isPro) {
    notifications.push({
      icon: Bell,
      text: "Upgrade for smart alerts on portfolio changes",
      tone: "text-risk-medium",
    });
  }

  return (
    <div className="flex flex-col gap-2">
      {notifications.map((n, i) => {
        const Icon = n.icon;
        return (
          <div
            key={i}
            className="flex items-center gap-2.5 rounded-md border border-border bg-surface px-3 py-2"
          >
            <Icon className={`size-3.5 shrink-0 ${n.tone}`} />
            <span className="text-[12px] text-muted-foreground">{n.text}</span>
          </div>
        );
      })}
    </div>
  );
}
