import { Fragment, useMemo } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, X, Share2, Bookmark, BookmarkCheck } from "lucide-react";
import { SiteHeader } from "@/components/funds/SiteHeader";
import { RiskMeter } from "@/components/funds/RiskMeter";
import { QuickRating } from "@/components/funds/QuickRating";
import { ComparisonInsights as ComparisonInsightsBar } from "@/components/funds/ComparisonInsights";
import { UpgradePrompt } from "@/components/funds/UpgradePrompt";
import { funds, formatCurrency, type Fund } from "@/data/funds";
import { useCompare } from "@/hooks/useCompare";
import { useSubscription } from "@/hooks/useSubscription";
import { useGrowth } from "@/hooks/useGrowth";
import { generateComparisonInsights } from "@/lib/insights";
import { RegulatoryConfidenceBadge, TransparencyBadge } from "@/components/funds/RegulatorySummary";
import { benchmarkFund, ASSUMPTIONS } from "@/lib/authority";
import { BenchmarkBadges, AssumptionsNote } from "@/components/funds/AuthorityPanels";
import { toast } from "sonner";

type Row = {
  label: string;
  get: (f: Fund) => string | number;
  render?: (f: Fund) => React.ReactNode;
  highlight?: "max" | "min";
  format?: (v: string | number) => string;
};

const rows: Row[] = [
  { label: "Fund Type", get: (f) => f.type },
  { label: "Strategy", get: (f) => f.strategy },
  {
    label: "Benchmarks",
    get: () => "",
    render: (f) => <BenchmarkBadges benchmarks={benchmarkFund(f)} compact />,
  },
  {
    label: "Expected Return",
    get: (f) => (f.returnMin + f.returnMax) / 2,
    render: (f) => (
      <span className="font-mono text-base font-medium text-foreground">
        {f.returnMin}–{f.returnMax}%
      </span>
    ),
    highlight: "max",
  },
  {
    label: "Risk",
    get: (f) => f.riskScore,
    render: (f) => <RiskMeter risk={f.risk} score={f.riskScore} />,
    highlight: "min",
  },
  {
    label: "Duration",
    get: (f) => f.durationYears,
    render: (f) => <span className="font-mono text-sm">{f.durationYears} years</span>,
    highlight: "min",
  },
  {
    label: "Minimum Investment",
    get: (f) => f.minInvestment,
    render: (f) => <span className="font-mono text-sm">{formatCurrency(f.minInvestment)}</span>,
    highlight: "min",
  },
  { label: "AUM", get: (f) => f.aum },
  { label: "Inception", get: (f) => f.inception },
  { label: "Manager", get: (f) => f.manager },
  {
    label: "Transparency",
    get: () => "",
    render: (f) => <TransparencyBadge fund={f} />,
  },
  {
    label: "Regulatory Confidence",
    get: () => "",
    render: (f) => <RegulatoryConfidenceBadge fund={f} />,
  },
];

const Compare = () => {
  const { selected, remove, clear, maxCompare } = useCompare();
  const { isFree, canAccess } = useSubscription();
  const { ids } = useParams<{ ids?: string }>();
  const [searchParams] = useSearchParams();
  const isShared = searchParams.get("shared") === "1";

  // If accessed via shared link, use the IDs from the URL
  const sharedIds = useMemo(() => {
    if (!ids) return [];
    return ids.split(",").filter(Boolean);
  }, [ids]);

  const activeIds = isShared ? sharedIds : selected;

  const items = activeIds
    .map((id) => funds.find((f) => f.id === id))
    .filter((f): f is Fund => Boolean(f));

  const showComparisonInsights = canAccess("comparisonInsights") || isShared;

  return (
    <div className="min-h-dvh bg-background">
      <SiteHeader />

      <main className="mx-auto max-w-[1280px] px-6 pb-32 pt-10">
        <Link
          to="/funds"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          Back to funds
        </Link>

        <header className="mt-6 flex flex-wrap items-end justify-between gap-4 border-b border-border pb-8">
          <div>
            <span className="label-eyebrow">Side-by-Side</span>
            <h1 className="mt-2 text-4xl font-medium tracking-tight text-foreground">
              {isShared ? "Shared comparison" : "Compare funds"}
            </h1>
            <p className="mt-2 max-w-lg text-sm text-muted-foreground">
              {isShared
                ? "Someone shared this comparison with you."
                : "Differences are highlighted so you can decide quickly. Best value in each row is marked with a soft accent."}
              {!isShared && isFree && (
                <span className="ml-1 font-mono text-[11px] text-muted-foreground">
                  (Free plan: up to {maxCompare} funds)
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {!isShared && items.length > 1 && (
              <ShareCompareButton items={items} />
            )}
            {items.length > 0 && !isShared && (
              <button
                type="button"
                onClick={clear}
                className="rounded-md border border-border px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Clear all
              </button>
            )}
          </div>
        </header>

        {items.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            {isShared && (
              <div className="mb-6 rounded-md border border-border bg-surface px-4 py-3 text-center text-sm text-muted-foreground">
                Create your own comparisons and track your portfolio.{" "}
                <Link to="/funds" className="font-semibold text-foreground underline-offset-4 hover:underline">
                  Get started
                </Link>
              </div>
            )}
            <ComparisonTable items={items} onRemove={isShared ? () => {} : remove} isShared={isShared} showInsights={showComparisonInsights} />
            <div className="mt-6">
              <AssumptionsNote assumptions={ASSUMPTIONS.benchmark} title="How benchmarks and highlights are calculated" />
            </div>
            {items.length > 1 && (
              <QuickRating action="comparison" label="Was this comparison useful?" className="mt-6" />
            )}
          </>
        )}
      </main>
    </div>
  );
};

function ShareCompareButton({ items }: { items: Fund[] }) {
  const { saveComparison, savedComparisons } = useGrowth();
  const ids = items.map((f) => f.id).join(",");
  const shareUrl = `${window.location.origin}/compare/${ids}?shared=1`;
  const label = items.map((f) => f.name).join(" vs ");

  const isSaved = savedComparisons.some((c) => c.fundIds.join(",") === ids);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Link copied to clipboard");
    } catch {
      toast.error("Could not copy link");
    }
  };

  const handleSave = () => {
    if (isSaved) return;
    saveComparison(items.map((f) => f.id), label);
    toast.success("Comparison saved");
  };

  return (
    <>
      <button
        type="button"
        onClick={handleShare}
        className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-3 py-2 text-xs font-medium text-foreground transition-colors hover:border-foreground"
      >
        <Share2 className="size-3.5" />
        Share link
      </button>
      <button
        type="button"
        onClick={handleSave}
        disabled={isSaved}
        className={[
          "inline-flex items-center gap-1.5 rounded-md border px-3 py-2 text-xs font-medium transition-colors",
          isSaved
            ? "border-border bg-surface text-muted-foreground cursor-default"
            : "border-border bg-surface text-foreground hover:border-foreground",
        ].join(" ")}
      >
        {isSaved ? <BookmarkCheck className="size-3.5" /> : <Bookmark className="size-3.5" />}
        {isSaved ? "Saved" : "Save"}
      </button>
    </>
  );
}

function EmptyState() {
  return (
    <div className="mt-12 rounded-lg border border-dashed border-border bg-surface px-8 py-20 text-center">
      <h2 className="text-lg font-medium text-foreground">
        No funds selected yet
      </h2>
      <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
        Tick the compare box on up to three funds in the registry, then return
        here for a side-by-side breakdown.
      </p>
      <Link
        to="/funds"
        className="mt-6 inline-block rounded-md bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90"
      >
        Browse funds
      </Link>
    </div>
  );
}

function ComparisonTable({
  items,
  onRemove,
  isShared,
  showInsights,
}: {
  items: Fund[];
  onRemove: (id: string) => void;
  isShared: boolean;
  showInsights: boolean;
}) {
  const compInsights = generateComparisonInsights(items);

  const bestIdxByRow: Record<string, number | null> = {};
  rows.forEach((row) => {
    if (!row.highlight) {
      bestIdxByRow[row.label] = null;
      return;
    }
    const values = items.map((f) => Number(row.get(f)));
    if (values.some((v) => Number.isNaN(v))) {
      bestIdxByRow[row.label] = null;
      return;
    }
    const target = row.highlight === "max" ? Math.max(...values) : Math.min(...values);
    if (values.every((v) => v === target)) {
      bestIdxByRow[row.label] = null;
    } else {
      bestIdxByRow[row.label] = values.indexOf(target);
    }
  });

  const colCount = items.length;
  const gridCols = `200px repeat(${colCount}, minmax(0, 1fr))`;

  return (
    <div className="mt-10 overflow-x-auto">
      {/* Comparison Insights */}
      {showInsights && compInsights.length > 0 ? (
        <div className="mb-6">
          <ComparisonInsightsBar insights={compInsights} />
        </div>
      ) : !showInsights ? (
        <div className="mb-6">
          <UpgradePrompt
            feature="Comparison Insights"
            description="See which fund has the highest return potential, lowest risk, and more — automatically."
            compact
          />
        </div>
      ) : null}

      <div className="min-w-[640px]">
        {/* Header */}
        <div
          className="grid items-stretch gap-px rounded-t-lg border border-border bg-border"
          style={{ gridTemplateColumns: gridCols }}
        >
          <div className="bg-surface-muted px-4 py-5">
            <span className="label-eyebrow">Fund</span>
          </div>
          {items.map((f) => (
            <div key={f.id} className="relative bg-surface px-5 py-5">
              {!isShared && (
                <button
                  type="button"
                  onClick={() => onRemove(f.id)}
                  aria-label={`Remove ${f.name}`}
                  className="absolute right-3 top-3 rounded p-1 text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground"
                >
                  <X className="size-3.5" />
                </button>
              )}
              <Link to={`/fund/${f.id}`} className="block pr-6">
                <span className="font-mono text-[11px] text-muted-foreground">
                  {f.ticker}
                </span>
                <h3 className="mt-1 text-base font-semibold leading-tight tracking-tight text-foreground">
                  {f.name}
                </h3>
              </Link>
            </div>
          ))}
        </div>

        {/* Rows */}
        <div
          className="grid gap-px border-x border-b border-border bg-border"
          style={{ gridTemplateColumns: gridCols }}
        >
          {rows.map((row) => {
            const bestIdx = bestIdxByRow[row.label];
            return (
              <Fragment key={row.label}>
                <div className="flex items-center bg-surface-muted px-4 py-4">
                  <span className="label-eyebrow">{row.label}</span>
                </div>
                {items.map((f, idx) => {
                  const isBest = bestIdx === idx;
                  return (
                    <div
                      key={f.id}
                      className={[
                        "flex items-center px-5 py-4 transition-colors",
                        isBest ? "bg-foreground/[0.04]" : "bg-surface",
                      ].join(" ")}
                    >
                      <div className="flex w-full items-center justify-between gap-3">
                        <div className="text-sm text-foreground">
                          {row.render ? row.render(f) : (
                            <span className="font-medium">{row.get(f)}</span>
                          )}
                        </div>
                        {isBest && (
                          <span className="rounded-full border border-border-strong bg-background px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-foreground">
                            Best
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Compare;
