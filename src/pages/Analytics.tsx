import { ChartBar as BarChart3, TrendingUp, MessageSquare, ThumbsUp, Eye, Star } from "lucide-react";
import { SiteHeader } from "@/components/funds/SiteHeader";
import { useFeedback } from "@/hooks/useFeedback";

const Analytics = () => {
  const { analytics, feedback, ratings, featureRequests } = useFeedback();

  return (
    <div className="min-h-dvh bg-background">
      <SiteHeader />

      <main className="mx-auto max-w-[1120px] px-6 pb-32 pt-10">
        <header className="mb-10">
          <span className="label-eyebrow">Internal</span>
          <h1 className="mt-2 text-4xl font-medium tracking-tight text-foreground">
            Analytics Dashboard
          </h1>
          <p className="mt-2 max-w-lg text-sm text-muted-foreground">
            Mock analytics for understanding usage patterns and feedback themes.
          </p>
        </header>

        {/* Summary stats */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <SummaryCard
            icon={MessageSquare}
            label="Total feedback"
            value={String(analytics.totalFeedback)}
          />
          <SummaryCard
            icon={ThumbsUp}
            label="Total ratings"
            value={String(analytics.totalRatings)}
          />
          <SummaryCard
            icon={TrendingUp}
            label="Useful rate"
            value={`${analytics.avgUseful}%`}
          />
          <SummaryCard
            icon={Star}
            label="Feature requests"
            value={String(featureRequests.length)}
          />
        </div>

        {/* Most used features */}
        <section className="mt-10">
          <h2 className="label-eyebrow mb-4">Most Used Features</h2>
          <div className="machined-edge rounded-lg border border-border bg-surface p-5">
            <div className="flex flex-col gap-3">
              {analytics.mostUsedFeatures.map((feat, i) => (
                <BarRow
                  key={feat.name}
                  label={feat.name}
                  value={feat.count}
                  max={analytics.mostUsedFeatures[0].count}
                  rank={i + 1}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Most viewed funds */}
        <section className="mt-10">
          <h2 className="label-eyebrow mb-4">Most Viewed Funds</h2>
          <div className="machined-edge rounded-lg border border-border bg-surface p-5">
            <div className="flex flex-col gap-3">
              {analytics.mostViewedFunds.map((fund, i) => (
                <BarRow
                  key={fund.id}
                  label={fund.name}
                  value={fund.views}
                  max={analytics.mostViewedFunds[0].views}
                  rank={i + 1}
                  suffix="views"
                />
              ))}
            </div>
          </div>
        </section>

        {/* Feedback themes */}
        <section className="mt-10">
          <h2 className="label-eyebrow mb-4">Feedback Themes</h2>
          <div className="machined-edge rounded-lg border border-border bg-surface p-5">
            <div className="flex flex-col gap-3">
              {analytics.feedbackThemes.map((theme) => (
                <BarRow
                  key={theme.theme}
                  label={theme.theme}
                  value={theme.count}
                  max={analytics.feedbackThemes[0].count}
                  suffix="mentions"
                />
              ))}
            </div>
          </div>
        </section>

        {/* Recent feedback */}
        {feedback.length > 0 && (
          <section className="mt-10">
            <h2 className="label-eyebrow mb-4">Recent Feedback</h2>
            <div className="flex flex-col gap-2">
              {feedback.slice(-10).reverse().map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-start gap-3 rounded-md border border-border bg-surface px-4 py-3"
                >
                  <span className={[
                    "mt-0.5 rounded-full px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider",
                    entry.type === "confusing" ? "bg-risk-high/10 text-risk-high" :
                    entry.type === "missing" ? "bg-risk-medium/10 text-risk-medium" :
                    entry.type === "like" ? "bg-risk-low/10 text-risk-low" :
                    "bg-surface-muted text-muted-foreground",
                  ].join(" ")}>
                    {entry.type}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground">{entry.text}</p>
                    <p className="mt-1 font-mono text-[10px] text-muted-foreground">
                      {entry.page} · {new Date(entry.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Recent ratings */}
        {ratings.length > 0 && (
          <section className="mt-10">
            <h2 className="label-eyebrow mb-4">Recent Ratings</h2>
            <div className="flex flex-col gap-2">
              {ratings.slice(-10).reverse().map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center gap-3 rounded-md border border-border bg-surface px-4 py-3"
                >
                  {entry.useful ? (
                    <ThumbsUp className="size-4 text-risk-low" />
                  ) : (
                    <ThumbsUp className="size-4 rotate-180 text-risk-high" />
                  )}
                  <div className="flex-1 min-w-0">
                    <span className="text-sm text-foreground">{entry.action}</span>
                    {entry.followUp && (
                      <p className="mt-0.5 text-[12px] text-muted-foreground">
                        {entry.followUp}
                      </p>
                    )}
                  </div>
                  <span className="font-mono text-[10px] text-muted-foreground">
                    {new Date(entry.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

function SummaryCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="machined-edge rounded-lg border border-border bg-surface p-5">
      <Icon className="size-4 text-muted-foreground" />
      <div className="mt-3 font-mono text-2xl font-medium text-foreground">{value}</div>
      <div className="mt-1 text-[11px] text-muted-foreground">{label}</div>
    </div>
  );
}

function BarRow({
  label,
  value,
  max,
  rank,
  suffix = "",
}: {
  label: string;
  value: number;
  max: number;
  rank?: number;
  suffix?: string;
}) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="flex items-center gap-3">
      {rank && (
        <span className="w-5 text-right font-mono text-[11px] text-muted-foreground">
          {rank}
        </span>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className="text-sm text-foreground">{label}</span>
          <span className="font-mono text-xs text-muted-foreground">
            {value} {suffix}
          </span>
        </div>
        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-border">
          <div
            className="h-full rounded-full bg-foreground/80 transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export default Analytics;
