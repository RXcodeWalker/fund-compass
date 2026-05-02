import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Sparkles, ArrowRight } from "lucide-react";
import { SiteHeader } from "@/components/funds/SiteHeader";
import { FundRow } from "@/components/funds/FundRow";
import { FilterBar, type FilterState } from "@/components/funds/FilterBar";
import { CompareBar } from "@/components/funds/CompareBar";
import { funds } from "@/data/funds";

const Index = () => {
  const [filters, setFilters] = useState<FilterState>({
    type: "All",
    risk: "All",
    minReturn: 0,
  });

  const filtered = useMemo(() => {
    return funds.filter((f) => {
      if (filters.type !== "All" && f.type !== filters.type) return false;
      if (filters.risk !== "All" && f.risk !== filters.risk) return false;
      if (f.returnMax < filters.minReturn) return false;
      return true;
    });
  }, [filters]);

  return (
    <div className="min-h-dvh bg-background">
      <SiteHeader />

      <main className="mx-auto max-w-[1440px] px-6 pb-32 pt-10">
        <header className="mb-10 flex flex-col gap-3">
          <span className="label-eyebrow">Fund Registry</span>
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

        <FilterBar value={filters} onChange={setFilters} resultCount={filtered.length} />

        <div className="grid gap-1.5">
          <div className="grid grid-cols-[40px_1.6fr_1fr_1.1fr_1fr_200px] gap-4 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
            <div>Pick</div>
            <div>Fund</div>
            <div>Type</div>
            <div>Risk</div>
            <div>Expected Return</div>
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
      </main>

      <CompareBar />
    </div>
  );
};

export default Index;
