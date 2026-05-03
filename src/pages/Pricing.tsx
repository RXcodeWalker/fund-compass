import { Link, useNavigate } from "react-router-dom";
import { Check, ArrowLeft, Sparkles, Building2, ShieldCheck } from "lucide-react";
import { SiteHeader } from "@/components/funds/SiteHeader";
import { plans, useSubscription, type PlanTier } from "@/hooks/useSubscription";

const featureLabels: { key: keyof typeof plans[number]; label: string }[] = [
  { key: "maxCompare", label: "Fund comparisons" },
  { key: "fullInsights", label: "Full fund insights" },
  { key: "portfolioTracking", label: "Portfolio tracking" },
  { key: "advancedFilters", label: "Advanced filters" },
  { key: "trustScores", label: "Manager trust scores" },
  { key: "smartAlerts", label: "Smart alerts" },
  { key: "portfolioAnalysis", label: "Portfolio analysis" },
  { key: "comparisonInsights", label: "Comparison insights" },
  { key: "fundTimeline", label: "Fund timeline" },
  { key: "activityFeed", label: "Activity feed" },
  { key: "prioritySupport", label: "Priority support" },
  { key: "apiAccess", label: "API access" },
  { key: "customReports", label: "Custom reports" },
];

function featureValue(plan: (typeof plans)[number], key: keyof typeof plan): string {
  const val = plan[key];
  if (typeof val === "number") return String(val);
  if (typeof val === "boolean") return val ? "yes" : "no";
  return String(val);
}

const Pricing = () => {
  const { tier, upgrade, isPro } = useSubscription();
  const navigate = useNavigate();

  const handleUpgrade = (newTier: PlanTier) => {
    upgrade(newTier);
    navigate("/upgrade-success");
  };

  return (
    <div className="min-h-dvh bg-background">
      <SiteHeader />

      <main className="mx-auto max-w-[1120px] px-6 pb-32 pt-10">
        <Link
          to="/funds"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          Back to funds
        </Link>

        <header className="mt-8 mb-14 text-center">
          <span className="label-eyebrow">Pricing</span>
          <h1 className="mt-3 text-4xl font-medium tracking-tight text-foreground">
            Choose the right plan for your needs
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-pretty text-sm text-muted-foreground">
            Start free with core fund data. Upgrade to Pro for full insights,
            portfolio tracking, and advanced analytics.
          </p>
        </header>

        {/* Plan cards */}
        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((plan) => {
            const isCurrent = plan.tier === tier;
            const isFree = plan.tier === "free";
            const isProPlan = plan.tier === "pro";
            const isInst = plan.tier === "institutional";

            return (
              <div
                key={plan.tier}
                className={[
                  "machined-edge relative flex flex-col rounded-lg border bg-surface p-6 transition-all",
                  isProPlan ? "border-foreground/20 shadow-md" : "border-border",
                  isCurrent ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : "",
                ].join(" ")}
              >
                {isProPlan && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-foreground px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-background">
                    Most Popular
                  </div>
                )}

                <div className="mb-6">
                  <div className="flex items-center gap-2">
                    {isFree && <ShieldCheck className="size-4 text-muted-foreground" />}
                    {isProPlan && <Sparkles className="size-4 text-foreground" />}
                    {isInst && <Building2 className="size-4 text-muted-foreground" />}
                    <h2 className="text-lg font-semibold text-foreground">{plan.label}</h2>
                  </div>
                  <div className="mt-3 flex items-baseline gap-1">
                    <span className="text-3xl font-medium tracking-tight text-foreground">
                      {plan.price}
                    </span>
                    <span className="text-sm text-muted-foreground">{plan.period}</span>
                  </div>
                </div>

                <ul className="mb-8 flex-1 space-y-3">
                  {featureLabels.map(({ key, label }) => {
                    const val = featureValue(plan, key);
                    const included = val !== "no" && val !== "0";
                    return (
                      <li key={key} className="flex items-start gap-2.5">
                        {included ? (
                          <Check className="mt-0.5 size-3.5 shrink-0 text-risk-low" />
                        ) : (
                          <span className="mt-0.5 size-3.5 shrink-0 rounded-full border border-border" />
                        )}
                        <span className={`text-sm ${included ? "text-foreground" : "text-muted-foreground"}`}>
                          {label}
                          {key === "maxCompare" && val !== "0" && (
                            <span className="ml-1 font-mono text-xs text-muted-foreground">
                              (up to {val})
                            </span>
                          )}
                        </span>
                      </li>
                    );
                  })}
                </ul>

                {isCurrent ? (
                  <div className="rounded-md border border-border bg-surface-muted px-4 py-2.5 text-center text-xs font-medium text-muted-foreground">
                    Current plan
                  </div>
                ) : isFree ? (
                  <div className="rounded-md border border-border bg-surface-muted px-4 py-2.5 text-center text-xs font-medium text-muted-foreground">
                    Default plan
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleUpgrade(plan.tier)}
                    className={[
                      "rounded-md px-4 py-2.5 text-xs font-semibold transition-opacity hover:opacity-90",
                      isProPlan
                        ? "bg-foreground text-background"
                        : "border border-border bg-surface text-foreground hover:border-foreground",
                    ].join(" ")}
                  >
                    Upgrade to {plan.label}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Feature comparison table */}
        <section className="mt-16">
          <h2 className="label-eyebrow mb-6 text-center">Feature Comparison</h2>
          <div className="machined-edge overflow-hidden rounded-lg border border-border bg-surface">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-muted">
                  <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
                    Feature
                  </th>
                  {plans.map((p) => (
                    <th key={p.tier} className="px-5 py-3 text-center text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
                      {p.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {featureLabels.map(({ key, label }, i) => (
                  <tr
                    key={key}
                    className={i !== featureLabels.length - 1 ? "border-b border-border" : ""}
                  >
                    <td className="px-5 py-3 text-foreground">{label}</td>
                    {plans.map((p) => {
                      const val = featureValue(p, key);
                      const included = val !== "no" && val !== "0";
                      return (
                        <td key={p.tier} className="px-5 py-3 text-center">
                          {key === "maxCompare" ? (
                            <span className="font-mono text-xs text-foreground">{val}</span>
                          ) : included ? (
                            <Check className="mx-auto size-4 text-risk-low" />
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Pricing;
