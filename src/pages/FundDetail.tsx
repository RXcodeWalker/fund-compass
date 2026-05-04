import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Check, Plus, TrendingUp, TrendingDown } from "lucide-react";
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
import { SiteHeader } from "@/components/funds/SiteHeader";
import { CompareBar } from "@/components/funds/CompareBar";
import { RiskMeter } from "@/components/funds/RiskMeter";
import { SaveToPortfolio } from "@/components/funds/SaveToPortfolio";
import { TrustBadge } from "@/components/funds/TrustBadge";
import { RiskFlagsList } from "@/components/funds/RiskFlagsList";
import { FundTimeline } from "@/components/funds/FundTimeline";
import { LastUpdated } from "@/components/funds/LastUpdated";
import { LiveIndicator } from "@/components/funds/LiveIndicator";
import { LockedFeature } from "@/components/funds/LockedFeature";
import { UpgradePrompt } from "@/components/funds/UpgradePrompt";
import { FavoriteButton } from "@/components/funds/FavoriteButton";
import { ShareInsight } from "@/components/funds/ShareInsight";
import { funds, formatCurrency } from "@/data/funds";
import { useCompare } from "@/hooks/useCompare";
import { useSubscription } from "@/hooks/useSubscription";
import {
  computeTrustScore,
  getManagerForFund,
  riskFlags,
} from "@/data/managers";
import { generateTimeline } from "@/data/timelines";
import { FundInsights } from "@/components/funds/FundInsights";
import { SmartAlerts } from "@/components/funds/SmartAlert";
import { generateFundInsights, generateFundAlerts } from "@/lib/insights";
import { benchmarkFund, ASSUMPTIONS } from "@/lib/authority";
import {
  BenchmarkBadges,
  AssumptionsNote,
  EducationalTerm,
} from "@/components/funds/AuthorityPanels";
import {
  dailyChange,
  weeklyChange,
  currentNav,
  lastUpdatedForFund,
  recentPerformance,
  fmtChange,
  changeColor,
} from "@/lib/simulation";

const FundDetail = () => {
  const { id } = useParams<{ id: string }>();
  const fund = funds.find((f) => f.id === id);
  const { isSelected, toggle, isFull } = useCompare();
  const { canAccess } = useSubscription();

  if (!fund) {
    return (
      <div className="min-h-dvh bg-background">
        <SiteHeader />
        <main className="mx-auto max-w-2xl px-6 py-24 text-center">
          <h1 className="text-xl font-medium">Fund not found</h1>
          <Link to="/funds" className="mt-4 inline-block text-sm underline">
            Back to funds
          </Link>
        </main>
      </div>
    );
  }

  const checked = isSelected(fund.id);
  const disabled = !checked && isFull;
  const { maxCompare } = useCompare();
  const manager = getManagerForFund(fund);
  const trust = manager ? computeTrustScore(manager) : 0;
  const flags = manager ? riskFlags(manager, fund) : [];

  const todayChange = dailyChange(fund);
  const weekChange = weeklyChange(fund);
  const nav = currentNav(fund);
  const lastUpdated = lastUpdatedForFund(fund);
  const recentPerf = useMemo(() => recentPerformance(fund), [fund]);
  const timeline = useMemo(() => generateTimeline(fund), [fund]);
  const fundInsights = useMemo(() => generateFundInsights(fund), [fund]);
  const fundAlerts = useMemo(() => generateFundAlerts(fund), [fund]);
  const benchmarks = useMemo(() => benchmarkFund(fund), [fund]);

  const metrics = [
    { label: "Current NAV", value: nav.toFixed(2), live: true },
    { label: "Today", value: fmtChange(todayChange), live: true, change: todayChange },
    { label: "This Week", value: fmtChange(weekChange), live: true, change: weekChange },
    { label: "Expected Return", value: `${fund.returnMin}–${fund.returnMax}%` },
    { label: "Risk Level", value: fund.risk, isRisk: true },
    { label: "Duration", value: `${fund.durationYears} years` },
    { label: "Min. Investment", value: formatCurrency(fund.minInvestment) },
    { label: "AUM", value: fund.aum },
    { label: "Inception", value: fund.inception },
    { label: "Manager", value: fund.manager },
  ];

  return (
    <div className="min-h-dvh bg-background">
      <SiteHeader />

      <main className="mx-auto max-w-[1280px] px-6 pb-32 pt-10">
        <Link
          to="/funds"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          Back to fund list
        </Link>

        <header className="mt-6 flex flex-wrap items-end justify-between gap-6 border-b border-border pb-8">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <span className="label-eyebrow">{fund.type}</span>
              <LiveIndicator label="Live" />
            </div>
            <h1 className="text-4xl font-medium tracking-tight text-foreground">
              {fund.name}
            </h1>
            <div className="flex flex-wrap items-center gap-3 font-mono text-xs text-muted-foreground">
              <span>{fund.ticker}</span>
              <span>·</span>
              {manager ? (
                <Link
                  to={`/manager/${manager.id}`}
                  className="underline-offset-4 transition-colors hover:text-foreground hover:underline"
                >
                  Managed by {manager.firm}
                </Link>
              ) : (
                <span>Managed by {fund.manager}</span>
              )}
              {manager && <TrustBadge score={trust} />}
              <span>·</span>
              <LastUpdated date={lastUpdated} />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <FavoriteButton fundId={fund.id} />
            <SaveToPortfolio fund={fund} />
            <button
              type="button"
              onClick={() => toggle(fund.id)}
              disabled={disabled}
              title={disabled ? `Maximum ${maxCompare} funds` : ""}
              className={[
                "machined-edge inline-flex items-center gap-2 rounded-md px-4 py-2 text-xs font-medium transition-all",
                checked
                  ? "bg-primary text-primary-foreground"
                  : "border border-border bg-surface text-foreground hover:border-foreground",
                disabled ? "cursor-not-allowed opacity-40" : "",
              ].join(" ")}
            >
              {checked ? <Check className="size-3.5" strokeWidth={3} /> : <Plus className="size-3.5" />}
              {checked ? "Added to comparison" : "Add to comparison"}
            </button>
          </div>
        </header>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1.4fr_1fr]">
          <section>
            <h2 className="label-eyebrow mb-3">Overview</h2>
            <p className="text-pretty text-base leading-relaxed text-foreground">
              {fund.description}
            </p>

            {/* Recent 30-day performance */}
            <div className="mt-10">
              <div className="mb-4 flex items-baseline justify-between">
                <h2 className="label-eyebrow">Recent Performance (30 days)</h2>
                <div className="flex items-center gap-3">
                  <span className={`inline-flex items-center gap-1 font-mono text-xs font-medium ${changeColor(todayChange)}`}>
                    {todayChange > 0 ? <TrendingUp className="size-3" /> : todayChange < 0 ? <TrendingDown className="size-3" /> : null}
                    {fmtChange(todayChange)} today
                  </span>
                </div>
              </div>
              <div className="machined-edge rounded-lg border border-border bg-surface p-4">
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={recentPerf} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="2 4" vertical={false} />
                      <XAxis
                        dataKey="day"
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(v) => v.slice(5)}
                      />
                      <YAxis
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                        width={40}
                        domain={["dataMin - 2", "dataMax + 2"]}
                      />
                      <Tooltip
                        cursor={{ stroke: "hsl(var(--border-strong))", strokeDasharray: "3 3" }}
                        contentStyle={{
                          backgroundColor: "hsl(var(--surface))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: 8,
                          fontSize: 12,
                        }}
                        labelStyle={{ color: "hsl(var(--muted-foreground))" }}
                        formatter={(value: number) => [value.toFixed(1), "NAV"]}
                      />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke={todayChange >= 0 ? "hsl(var(--risk-low))" : "hsl(var(--risk-high))"}
                        strokeWidth={1.5}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Historical NAV chart */}
            <div className="mt-10">
              <div className="mb-4 flex items-baseline justify-between">
                <h2 className="label-eyebrow">Net Asset Value (indexed)</h2>
                <span className="font-mono text-xs text-muted-foreground">
                  Base 100 · {fund.performance[0].year}–{fund.performance.at(-1)?.year}
                </span>
              </div>
              <div className="machined-edge rounded-lg border border-border bg-surface p-4">
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={fund.performance} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="navFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="hsl(var(--foreground))" stopOpacity={0.18} />
                          <stop offset="100%" stopColor="hsl(var(--foreground))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="2 4" vertical={false} />
                      <XAxis
                        dataKey="year"
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                        width={36}
                      />
                      <Tooltip
                        cursor={{ stroke: "hsl(var(--border-strong))", strokeDasharray: "3 3" }}
                        contentStyle={{
                          backgroundColor: "hsl(var(--surface))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: 8,
                          fontSize: 12,
                        }}
                        labelStyle={{ color: "hsl(var(--muted-foreground))" }}
                      />
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke="hsl(var(--foreground))"
                        strokeWidth={2}
                        fill="url(#navFill)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </section>

          <aside>
            {/* Smart Alerts */}
            {canAccess("smartAlerts") && fundAlerts.length > 0 ? (
              <div className="mb-6">
                <SmartAlerts alerts={fundAlerts} />
              </div>
            ) : !canAccess("smartAlerts") ? (
              <div className="mb-6">
                <UpgradePrompt feature="Smart Alerts" description="Get timely warnings about fund risk, volatility, and manager changes." compact />
              </div>
            ) : null}

            <h2 className="label-eyebrow mb-3">Key Metrics</h2>
            <div className="machined-edge overflow-hidden rounded-lg border border-border bg-surface">
              {metrics.map((m, i) => (
                <div
                  key={m.label}
                  className={[
                    "flex items-center justify-between px-4 py-3.5",
                    i !== metrics.length - 1 ? "border-b border-border" : "",
                  ].join(" ")}
                >
                  <span className="flex items-center gap-2 text-xs text-muted-foreground">
                    {m.label}
                    {m.live && (
                      <span className="size-1.5 rounded-full bg-risk-low animate-pulse" />
                    )}
                  </span>
                  {m.isRisk ? (
                    <RiskMeter risk={fund.risk} score={fund.riskScore} />
                  ) : (
                    <span className={`font-mono text-sm ${m.change !== undefined ? changeColor(m.change) : "text-foreground"}`}>
                      {m.value}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </aside>
        </div>

        {/* Key Insights */}
        <section className="mt-14 border-t border-border pt-10">
          <div className="mb-4 flex flex-wrap items-baseline justify-between gap-3">
            <h2 className="label-eyebrow">Benchmarks vs peer category</h2>
            <span className="font-mono text-[11px] text-muted-foreground">
              Compared against {fund.type} funds in this catalog
            </span>
          </div>
          <BenchmarkBadges benchmarks={benchmarks} />
          <div className="mt-4">
            <AssumptionsNote assumptions={ASSUMPTIONS.benchmark} title="How benchmarks are calculated" />
          </div>

          <h2 className="label-eyebrow mb-4 mt-10">Key Insights</h2>
          {canAccess("fullInsights") ? (
            <FundInsights insights={fundInsights} source={fund.name} />
          ) : (
            <LockedFeature feature="Full Fund Insights">
              <div className="space-y-3">
                {fundInsights.slice(0, 2).map((insight) => (
                  <div key={insight.id} className="rounded-md border border-border bg-surface p-4">
                    <span className="text-sm font-medium text-foreground">{insight.title}</span>
                    <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
                      {insight.detail.slice(0, 40)}...
                    </p>
                  </div>
                ))}
              </div>
            </LockedFeature>
          )}
        </section>

        {/* Fund Update Timeline */}
        <section className="mt-14 border-t border-border pt-10">
          <div className="mb-6 flex items-baseline justify-between">
            <h2 className="label-eyebrow">Fund Update Timeline</h2>
            <span className="font-mono text-[11px] text-muted-foreground">
              {timeline.length} events since inception
            </span>
          </div>
          <div className="machined-edge rounded-lg border border-border bg-surface p-6">
            <FundTimeline entries={timeline} initialShow={10} />
          </div>
        </section>

        {manager && (
          <section className="mt-14 grid gap-10 border-t border-border pt-10 lg:grid-cols-[1.4fr_1fr]">
            <div>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="label-eyebrow">Manager intelligence</h2>
                <Link
                  to={`/manager/${manager.id}`}
                  className="text-[11px] font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
                >
                  View full profile →
                </Link>
              </div>
              <div className="machined-edge rounded-lg border border-border bg-surface p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-base font-semibold text-foreground">
                      {manager.name}
                    </span>
                    <span className="font-mono text-[11px] text-muted-foreground">
                      {manager.title} · {manager.firm}
                    </span>
                  </div>
                  <TrustBadge score={trust} size="md" />
                </div>
                <p className="mt-4 text-sm leading-relaxed text-foreground">
                  {manager.bio}
                </p>
                <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[
                    { l: "Experience", v: `${manager.yearsExperience}y` },
                    { l: "AUM", v: manager.aum },
                    { l: "Avg IRR", v: manager.avgIrr ? `${manager.avgIrr}%` : "—" },
                    { l: "Exits", v: `${manager.successfulExits}` },
                  ].map((s) => (
                    <div
                      key={s.l}
                      className="rounded-md border border-border bg-background px-3 py-2.5"
                    >
                      <div className="label-eyebrow">{s.l}</div>
                      <div className="mt-1 font-mono text-sm text-foreground">{s.v}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div>
              <h2 className="label-eyebrow mb-3">Risk signals</h2>
              <RiskFlagsList flags={flags} />
            </div>
          </section>
        )}
      </main>

      <CompareBar />
    </div>
  );
};

export default FundDetail;
