import { Link } from "react-router-dom";
import { CircleCheck as CheckCircle2, ArrowRight } from "lucide-react";
import { SiteHeader } from "@/components/funds/SiteHeader";
import { useSubscription } from "@/hooks/useSubscription";

const UpgradeSuccess = () => {
  const { features } = useSubscription();

  return (
    <div className="min-h-dvh bg-background">
      <SiteHeader />

      <main className="mx-auto flex max-w-lg flex-col items-center px-6 pb-32 pt-24 text-center">
        <div className="flex size-16 items-center justify-center rounded-full border border-risk-low/30 bg-risk-low/5">
          <CheckCircle2 className="size-8 text-risk-low" />
        </div>

        <h1 className="mt-6 text-3xl font-medium tracking-tight text-foreground">
          Welcome to {features.label}
        </h1>
        <p className="mt-3 text-pretty text-sm text-muted-foreground">
          Your upgrade is confirmed. You now have access to all {features.label} features
          including full insights, portfolio tracking, and advanced analytics.
        </p>

        <div className="mt-8 machined-edge w-full rounded-lg border border-border bg-surface p-5">
          <h2 className="label-eyebrow mb-3">What you unlocked</h2>
          <ul className="space-y-2.5 text-left">
            {features.fullInsights && <UnlockedItem label="Full fund insights & analysis" />}
            {features.portfolioTracking && <UnlockedItem label="Portfolio tracking & simulation" />}
            {features.advancedFilters && <UnlockedItem label="Advanced fund filters" />}
            {features.trustScores && <UnlockedItem label="Manager trust scores" />}
            {features.smartAlerts && <UnlockedItem label="Smart alerts & signals" />}
            {features.portfolioAnalysis && <UnlockedItem label="Portfolio risk & diversification analysis" />}
            {features.comparisonInsights && <UnlockedItem label="Comparison insights" />}
            {features.prioritySupport && <UnlockedItem label="Priority support" />}
          </ul>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/"
            className="rounded-md bg-foreground px-5 py-2.5 text-xs font-semibold text-background transition-opacity hover:opacity-90"
          >
            Browse funds
          </Link>
          <Link
            to="/portfolio"
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-5 py-2.5 text-xs font-medium text-foreground transition-colors hover:border-foreground"
          >
            Go to portfolio <ArrowRight className="size-3" />
          </Link>
        </div>
      </main>
    </div>
  );
};

function UnlockedItem({ label }: { label: string }) {
  return (
    <li className="flex items-center gap-2.5">
      <CheckCircle2 className="size-3.5 shrink-0 text-risk-low" />
      <span className="text-sm text-foreground">{label}</span>
    </li>
  );
}

export default UpgradeSuccess;
