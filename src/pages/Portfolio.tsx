import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ArrowRight, Briefcase, Sparkles, Trash2, TrendingDown, TrendingUp } from "lucide-react";
import { SiteHeader } from "@/components/funds/SiteHeader";
import { CompareBar } from "@/components/funds/CompareBar";
import { LiveIndicator } from "@/components/funds/LiveIndicator";
import { LastUpdated } from "@/components/funds/LastUpdated";
import { PortfolioAnalysisSection } from "@/components/funds/PortfolioAnalysis";
import { SmartAlerts } from "@/components/funds/SmartAlert";
import { funds } from "@/data/funds";
import { usePortfolio, type Holding } from "@/hooks/usePortfolio";
import { usePortfolioLiveData } from "@/hooks/useSimulation";
import { useCompare, MAX_COMPARE } from "@/hooks/useCompare";
import {
  fmtPct,
  fmtUSD,
  simulateHolding,
  summarizePortfolio,
} from "@/lib/portfolio";
import { analyzePortfolio, generatePortfolioAlerts } from "@/lib/insights";
import {
  dailyChange,
  weeklyChange,
  lastUpdatedForFund,
  fmtChange,
  changeColor,
} from "@/lib/simulation";
import { toast } from "sonner";

const Portfolio = () => {
  const { holdings, remove } = usePortfolio();

  const enriched = useMemo(
    () =>
      holdings
        .map((h) => {
          const fund = funds.find((f) => f.id === h.fundId);
          if (!fund) return null;
          return { holding: h, fund, sim: simulateHolding(fund, h) };
        })
        .filter((x): x is { holding: Holding; fund: typeof funds[number]; sim: ReturnType<typeof simulateHolding> } => Boolean(x))
        .sort((a, b) => b.holding.addedAt - a.holding.addedAt),
    [holdings]
  );

  const summary = useMemo(() => summarizePortfolio(funds, holdings), [holdings]);
  const positive = summary.totalGain >= 0;

  const fundIds = useMemo(() => holdings.map((h) => h.fundId), [holdings]);
  const liveData = usePortfolioLiveData(
    summary.totalInvested,
    summary.totalCurrent,
    fundIds
  );
  const portfolioAnalysis = useMemo(() => analyzePortfolio(holdings), [holdings]);
  const portfolioAlerts = useMemo(() => generatePortfolioAlerts(holdings), [holdings]);

  return (
    <div className="min-h-dvh bg-background">
      <SiteHeader />

      <main className="mx-auto max-w-[1280px] px-6 pb-32 pt-10">
        <header className="mb-10 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <span className="label-eyebrow inline-flex items-center gap-2">
              <Briefcase className="size-3" /> Portfolio
            </span>
            {enriched.length > 0 && <LiveIndicator label="Live" />}
          </div>
          <h1 className="max-w-3xl text-balance text-4xl font-medium leading-[1.1] tracking-tight text-foreground">
            Your private investment portfolio.
          </h1>
          <p className="max-w-xl text-pretty text-sm text-muted-foreground">
            Track the funds you've saved with simulated performance. Saved
            locally — nothing leaves your device.
          </p>
        </header>

        {enriched.length === 0 ? <EmptyState /> : (
          <>
            {/* Portfolio Alerts */}
            {portfolioAlerts.length > 0 && (
              <div className="mb-6">
                <SmartAlerts alerts={portfolioAlerts} compact />
              </div>
            )}

            <SummaryStrip
              invested={summary.totalInvested}
              current={summary.totalCurrent}
              gain={summary.totalGain}
              returnPct={summary.returnPct}
              count={enriched.length}
              dailyChange={liveData.dailyChangePct}
              weeklyChange={liveData.weeklyChangePct}
              lastUpdated={liveData.lastUpdated}
            />

            {summary.series.length > 1 && (
              <section className="machined-edge mt-8 rounded-lg border border-border bg-surface p-6">
                <div className="mb-4 flex items-baseline justify-between">
                  <div className="flex flex-col">
                    <span className="label-eyebrow">Portfolio Value</span>
                    <span className="mt-1 font-mono text-xs text-muted-foreground">
                      Simulated · monthly
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-2xl font-medium text-foreground">
                      {fmtUSD(summary.totalCurrent)}
                    </div>
                    <div className={`font-mono text-xs ${positive ? "text-risk-low" : "text-risk-high"}`}>
                      {fmtPct(summary.returnPct)} · {fmtUSD(summary.totalGain)}
                    </div>
                  </div>
                </div>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={summary.series} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="pfFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="hsl(var(--foreground))" stopOpacity={0.18} />
                          <stop offset="100%" stopColor="hsl(var(--foreground))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="2 4" vertical={false} />
                      <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} width={64} tickFormatter={(v) => fmtUSD(v as number)} />
                      <Tooltip
                        cursor={{ stroke: "hsl(var(--border-strong))", strokeDasharray: "3 3" }}
                        contentStyle={{ backgroundColor: "hsl(var(--surface))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                        labelStyle={{ color: "hsl(var(--muted-foreground))" }}
                        formatter={(value: number) => [fmtUSD(value), "Value"]}
                      />
                      <Area type="monotone" dataKey="value" stroke="hsl(var(--foreground))" strokeWidth={2} fill="url(#pfFill)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </section>
            )}

            <section className="mt-8">
              <div className="mb-4 flex items-baseline justify-between border-b border-border pb-3">
                <span className="label-eyebrow">Holdings · {enriched.length}</span>
                <Link
                  to="/compare"
                  className="font-mono text-[11px] text-muted-foreground transition-colors hover:text-foreground"
                >
                  Compare selected →
                </Link>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {enriched.map(({ fund, holding, sim }) => (
                  <HoldingCard
                    key={fund.id}
                    fund={fund}
                    holding={holding}
                    sim={sim}
                    onRemove={() => {
                      remove(fund.id);
                      toast.success(`${fund.name} removed`);
                    }}
                  />
                ))}
              </div>
            </section>

            {/* Portfolio Analysis */}
            <section className="mt-10 border-t border-border pt-10">
              <h2 className="label-eyebrow mb-6">Portfolio Analysis</h2>
              <PortfolioAnalysisSection analysis={portfolioAnalysis} />
            </section>
          </>
        )}
      </main>

      <CompareBar />
    </div>
  );
};

function SummaryStrip({
  invested,
  current,
  gain,
  returnPct,
  count,
  dailyChange: dailyChg,
  weeklyChange: weeklyChg,
  lastUpdated,
}: {
  invested: number;
  current: number;
  gain: number;
  returnPct: number;
  count: number;
  dailyChange: number;
  weeklyChange: number;
  lastUpdated: Date;
}) {
  const positive = gain >= 0;
  return (
    <section className="machined-edge grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border md:grid-cols-6">
      <Stat label="Total invested" value={fmtUSD(invested)} mono />
      <Stat label="Current value" value={fmtUSD(current)} mono accent />
      <Stat
        label="Total gain"
        value={fmtUSD(gain)}
        mono
        tone={positive ? "positive" : "negative"}
      />
      <Stat
        label="Overall return"
        value={fmtPct(returnPct)}
        mono
        tone={positive ? "positive" : "negative"}
        sub={`${count} holding${count === 1 ? "" : "s"}`}
      />
      <Stat
        label="Today"
        value={fmtChange(dailyChg)}
        mono
        tone={dailyChg >= 0 ? "positive" : "negative"}
        sub="simulated"
      />
      <Stat
        label="This week"
        value={fmtChange(weeklyChg)}
        mono
        tone={weeklyChg >= 0 ? "positive" : "negative"}
        footer={<LastUpdated date={lastUpdated} />}
      />
    </section>
  );
}

function Stat({
  label,
  value,
  sub,
  mono,
  accent,
  tone,
  footer,
}: {
  label: string;
  value: string;
  sub?: string;
  mono?: boolean;
  accent?: boolean;
  tone?: "positive" | "negative";
  footer?: React.ReactNode;
}) {
  const toneClass =
    tone === "positive" ? "text-risk-low" : tone === "negative" ? "text-risk-high" : "text-foreground";
  return (
    <div className={`flex flex-col gap-1 px-6 py-5 ${accent ? "bg-foreground text-background" : "bg-surface"}`}>
      <span className={`label-eyebrow ${accent ? "text-background/60" : ""}`}>{label}</span>
      <div className="flex items-baseline gap-2">
        <span className={`text-2xl font-medium tracking-tight ${mono ? "font-mono" : ""} ${accent ? "text-background" : toneClass}`}>
          {value}
        </span>
        {tone && (tone === "positive" ? <TrendingUp className="size-3.5 text-risk-low" /> : <TrendingDown className="size-3.5 text-risk-high" />)}
      </div>
      {sub && <span className={`font-mono text-[11px] ${accent ? "text-background/60" : "text-muted-foreground"}`}>{sub}</span>}
      {footer}
    </div>
  );
}

function HoldingCard({
  fund,
  holding,
  sim,
  onRemove,
}: {
  fund: typeof funds[number];
  holding: Holding;
  sim: ReturnType<typeof simulateHolding>;
  onRemove: () => void;
}) {
  const positive = sim.gain >= 0;
  const { isSelected, toggle, isFull } = useCompare();
  const checked = isSelected(fund.id);
  const disabled = !checked && isFull;

  const todayChg = dailyChange(fund);
  const weekChg = weeklyChange(fund);
  const lastUpd = lastUpdatedForFund(fund);

  return (
    <article className="machined-edge flex flex-col rounded-lg border border-border bg-surface p-5 transition-colors hover:border-border-strong">
      <div className="flex items-start justify-between gap-3">
        <Link to={`/fund/${fund.id}`} className="group flex-1">
          <span className="label-eyebrow">{fund.type}</span>
          <h3 className="mt-1 text-base font-semibold tracking-tight text-foreground group-hover:underline">
            {fund.name}
          </h3>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] text-muted-foreground">
              {fund.ticker} · since {holding.startDate}
            </span>
            <LastUpdated date={lastUpd} />
          </div>
        </Link>
        <button
          type="button"
          onClick={onRemove}
          aria-label="Remove from portfolio"
          className="rounded-md border border-border p-1.5 text-muted-foreground transition-colors hover:border-destructive hover:text-destructive"
        >
          <Trash2 className="size-3.5" />
        </button>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <MiniStat label="Invested" value={fmtUSD(holding.amount)} />
        <MiniStat label="Current" value={fmtUSD(sim.currentValue)} bold />
        <MiniStat
          label="Return"
          value={fmtPct(sim.returnPct)}
          tone={positive ? "positive" : "negative"}
        />
      </div>

      {/* Live change indicators */}
      <div className="mt-3 flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Today</span>
          <span className={`font-mono text-xs font-medium ${changeColor(todayChg)}`}>
            {fmtChange(todayChg)}
          </span>
          {todayChg > 0 ? <TrendingUp className="size-3 text-risk-low" /> : todayChg < 0 ? <TrendingDown className="size-3 text-risk-high" /> : null}
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Week</span>
          <span className={`font-mono text-xs font-medium ${changeColor(weekChg)}`}>
            {fmtChange(weekChg)}
          </span>
          {weekChg > 0 ? <TrendingUp className="size-3 text-risk-low" /> : weekChg < 0 ? <TrendingDown className="size-3 text-risk-high" /> : null}
        </div>
      </div>

      <div className="mt-4 h-24 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={sim.series} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <Tooltip
              cursor={{ stroke: "hsl(var(--border-strong))", strokeDasharray: "3 3" }}
              contentStyle={{ backgroundColor: "hsl(var(--surface))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 11, padding: "4px 8px" }}
              labelStyle={{ color: "hsl(var(--muted-foreground))" }}
              formatter={(value: number) => [fmtUSD(value), "Value"]}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke={positive ? "hsl(var(--risk-low))" : "hsl(var(--risk-high))"}
              strokeWidth={1.5}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
        <button
          type="button"
          onClick={() => toggle(fund.id)}
          disabled={disabled}
          title={disabled ? `Maximum ${MAX_COMPARE} funds` : undefined}
          className={[
            "rounded-md border px-2.5 py-1 text-[11px] font-medium transition-colors",
            checked
              ? "border-foreground bg-foreground text-background"
              : "border-border text-foreground hover:bg-surface-muted",
            disabled && !checked ? "cursor-not-allowed opacity-40" : "",
          ].join(" ")}
        >
          {checked ? "In compare" : "Add to compare"}
        </button>
        <Link
          to={`/fund/${fund.id}`}
          className="inline-flex items-center gap-1 font-mono text-[11px] text-muted-foreground transition-colors hover:text-foreground"
        >
          Details <ArrowRight className="size-3" />
        </Link>
      </div>
    </article>
  );
}

function MiniStat({
  label,
  value,
  tone,
  bold,
}: {
  label: string;
  value: string;
  tone?: "positive" | "negative";
  bold?: boolean;
}) {
  const toneClass = tone === "positive" ? "text-risk-low" : tone === "negative" ? "text-risk-high" : "text-foreground";
  return (
    <div className="flex flex-col gap-0.5 rounded-md border border-border bg-background px-3 py-2">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
      <span className={`font-mono text-sm ${bold ? "font-semibold" : ""} ${toneClass}`}>{value}</span>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="machined-edge flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-border bg-surface p-16 text-center">
      <Briefcase className="size-7 text-muted-foreground" />
      <div className="flex flex-col gap-1.5">
        <h3 className="text-lg font-medium text-foreground">Your portfolio is empty</h3>
        <p className="max-w-md text-sm text-muted-foreground">
          Save funds you're interested in to track their simulated performance,
          calculate returns, and revisit them anytime.
        </p>
      </div>
      <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
        <Link
          to="/"
          className="rounded-md bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          Browse funds
        </Link>
        <Link
          to="/recommend"
          className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-4 py-2 text-xs font-medium text-foreground transition-colors hover:border-foreground"
        >
          <Sparkles className="size-3.5" /> Get matched
        </Link>
      </div>
    </div>
  );
}

export default Portfolio;
