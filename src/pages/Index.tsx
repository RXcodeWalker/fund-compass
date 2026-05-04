import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Sparkles, ArrowRight } from "lucide-react";
import { SiteHeader } from "@/components/funds/SiteHeader";
import { FundRow } from "@/components/funds/FundRow";
import { FilterBar, type FilterState } from "@/components/funds/FilterBar";
import { CompareBar } from "@/components/funds/CompareBar";
import { ActivityFeed } from "@/components/funds/ActivityFeed";
import { LiveIndicator } from "@/components/funds/LiveIndicator";
import { SmartAlerts } from "@/components/funds/SmartAlert";
import { UpgradePrompt } from "@/components/funds/UpgradePrompt";
import { SavedComparisons } from "@/components/funds/SavedComparisons";
import { ReturnTriggers } from "@/components/funds/ReturnTriggers";
import { funds } from "@/data/funds";
import { computeTrustScore, getManagerForFund } from "@/data/managers";
import { generateFundAlerts } from "@/lib/insights";
import { useSubscription } from "@/hooks/useSubscription";
import { useCompare } from "@/hooks/useCompare";
import { useGrowth } from "@/hooks/useGrowth";

const Index = () => {
  const [filters, setFilters] = useState<FilterState>({
    type: "All",
    risk: "All",
    minReturn: 0,
    minTrust: 0,
  });
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const { favorites } = useGrowth();

  const filtered = useMemo(() => {
    return funds.filter((f) => {
      if (filters.type !== "All" && f.type !== filters.type) return false;
      if (filters.risk !== "All" && f.risk !== filters.risk) return false;
      if (f.returnMax < filters.minReturn) return false;
      if (filters.minTrust > 0) {
        const m = getManagerForFund(f);
        const t = m ? computeTrustScore(m) : 0;
        if (t < filters.minTrust) return false;
      }
      if (showFavoritesOnly && !favorites.some((fav) => fav.fundId === f.id)) return false;
      return true;
    });
  }, [filters]);

  // Collect notable alerts across visible funds
  const notableAlerts = useMemo(() => {
    const alerts: { id: string; tone: "info" | "warn" | "success"; message: string; detail: string }[] = [];
    for (const fund of filtered) {
      const fundAlerts = generateFundAlerts(fund);
      for (const a of fundAlerts) {
        if (a.tone === "warn" || a.tone === "success") {
          alerts.push({ ...a, message: `${fund.name}: ${a.message}` });
        }
      }
    }
    return alerts.slice(0, 4);
  }, [filters]);

  return (
    <div className="min-h-dvh bg-background">
      <SiteHeader />

      <main className="mx-auto max-w-[1440px] px-6 pb-32 pt-10">
        <header className="mb-10 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <span className="label-eyebrow">Fund Registry</span>
            <LiveIndicator label="Live" />
          </div>
          <h1 className="max-w-3xl text-balance text-4xl font-medium leading-[1.1] tracking-tight text-foreground">
            Compare private investment funds with clarity.
          </h1>
          <p className="max-w-xl text-pretty text-sm text-muted-foreground">
            A curated set of venture, private equity, real estate, and private
            debt funds. Select up to three to see them side by side.
          </p>
          <Link
            to="/recommend"
            className="machined-edge mt-4 inline-flex w-fit items-center gap-3 rounded-md border border-border bg-surface px-4 py-2.5 text-xs font-medium text-foreground transition-colors hover:border-foreground"
          >
            <Sparkles className="size-3.5" />
            Not sure where to start? Get matched in 30 seconds
            <ArrowRight className="size-3.5 text-muted-foreground" />
          </Link>
        </header>

        <div className="grid gap-10 xl:grid-cols-[1fr_380px]">
          <div>
            {/* Return triggers */}
            <div className="mb-4">
              <ReturnTriggers />
            </div>

            {/* Saved comparisons */}
            <SavedComparisons />

            {/* Notable fund alerts */}
            {notableAlerts.length > 0 && (
              <div className="mb-4">
                <SmartAlerts alerts={notableAlerts} compact />
              </div>
            )}

            <FilterBar value={filters} onChange={setFilters} resultCount={filtered.length} />

            {favorites.length > 0 && (
              <button
                type="button"
                onClick={() => setShowFavoritesOnly((v) => !v)}
                className={[
                  "mb-2 inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-[11px] font-medium transition-colors",
                  showFavoritesOnly
                    ? "border-foreground bg-foreground text-background"
                    : "border-border bg-surface text-foreground hover:border-foreground",
                ].join(" ")}
              >
                <span className={showFavoritesOnly ? "text-background" : "text-risk-medium"}>&#9733;</span>
                Favorites only ({favorites.length})
              </button>
            )}

            <div className="grid gap-1.5">
              <div className="grid grid-cols-[40px_1.6fr_1fr_1.1fr_1fr_100px_140px_200px] gap-4 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
                <div>Pick</div>
                <div>Fund</div>
                <div>Type</div>
                <div>Risk</div>
                <div>Expected Return</div>
                <div>Today</div>
                <div>Trust</div>
                <div className="text-right">Actions</div>
              </div>

              {filtered.length === 0 ? (
                <div className="rounded-md border border-dashed border-border bg-surface px-6 py-16 text-center">
                  <p className="text-sm text-muted-foreground">
                    No funds match your filters. Try widening your criteria.
                  </p>
                </div>
              ) : (
                filtered.map((fund) => <FundRow key={fund.id} fund={fund} />)
              )}
            </div>
          </div>

          <aside className="xl:sticky xl:top-20 xl:h-fit">
            <div className="machined-edge rounded-lg border border-border bg-surface p-5">
              <ActivityFeed limit={8} />
            </div>
          </aside>
        </div>
      </main>

      <CompareBar />
    </div>
  );
};

export default Index;
