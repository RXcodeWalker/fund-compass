import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
} from "recharts";
import { ArrowLeft, TrendingUp, TrendingDown, TriangleAlert as AlertTriangle, Shield, Zap, DollarSign, Cpu, FileSliders as Sliders, Save, Trash2, GitCompare } from "lucide-react";
import { SiteHeader } from "@/components/funds/SiteHeader";
import { funds } from "@/data/funds";
import { usePortfolio } from "@/hooks/usePortfolio";
import { useScenarios } from "@/hooks/useScenarios";
import { useSubscription } from "@/hooks/useSubscription";
import { UpgradePrompt } from "@/components/funds/UpgradePrompt";
import {
  scenarios,
  simulateScenario,
  compareScenarios,
  type ScenarioDefinition,
  type ScenarioAdjustment,
  type PortfolioScenarioResult,
  type ScenarioComparison,
} from "@/lib/scenarios";
import { fmtUSD, fmtPct } from "@/lib/portfolio";
import { ASSUMPTIONS } from "@/lib/authority";
import { AssumptionsNote } from "@/components/funds/AuthorityPanels";
import { toast } from "sonner";

const scenarioIcons: Record<string, React.ElementType> = {
  boom: TrendingUp,
  downturn: TrendingDown,
  inflation: DollarSign,
  "tech-surge": Cpu,
  custom: Sliders,
};

const ScenarioSimulator = () => {
  const { holdings } = usePortfolio();
  const { canAccess } = useSubscription();
  const canSimulate = canAccess("portfolioTracking");

  const [selectedId, setSelectedId] = useState<string>("boom");
  const [compareId, setCompareId] = useState<string | null>(null);
  const [customAdj, setCustomAdj] = useState<ScenarioAdjustment>({
    returnShift: 0,
    riskMultiplier: 1,
    typeMultipliers: {},
  });
  const [showCustom, setShowCustom] = useState(false);

  const activeScenario: ScenarioDefinition = useMemo(() => {
    if (selectedId === "custom") {
      return {
        id: "custom",
        name: "Custom Scenario",
        description: "Manually configured market conditions.",
        adjustment: customAdj,
      };
    }
    return scenarios.find((s) => s.id === selectedId) ?? scenarios[0];
  }, [selectedId, customAdj]);

  const result = useMemo(
    () => (holdings.length > 0 ? simulateScenario(funds, holdings, activeScenario) : null),
    [holdings, activeScenario]
  );

  const compareScenario = useMemo(() => {
    if (!compareId || !holdings.length) return null;
    const s = scenarios.find((sc) => sc.id === compareId);
    if (!s) return null;
    return simulateScenario(funds, holdings, s);
  }, [compareId, holdings]);

  const comparison: ScenarioComparison | null = useMemo(() => {
    if (!result || !compareScenario) return null;
    return compareScenarios(result, compareScenario);
  }, [result, compareScenario]);

  return (
    <div className="min-h-dvh bg-background">
      <SiteHeader />

      <main className="mx-auto max-w-[1280px] px-6 pb-32 pt-10">
        <Link
          to="/portfolio"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          Back to portfolio
        </Link>

        <header className="mt-6 mb-10">
          <span className="label-eyebrow">What-If Simulator</span>
          <h1 className="mt-2 text-4xl font-medium tracking-tight text-foreground">
            Scenario Analysis
          </h1>
          <p className="mt-2 max-w-lg text-sm text-muted-foreground">
            Test how your portfolio performs under different market conditions.
            Select a scenario to see projected impact on each holding.
          </p>
        </header>

        {!canSimulate ? (
          <UpgradePrompt
            feature="Scenario Analysis"
            description="Upgrade to simulate your portfolio under different market conditions."
          />
        ) : holdings.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
            {/* Left: Scenario selection */}
            <aside>
              <ScenarioSelector
                selectedId={selectedId}
                onSelect={setSelectedId}
                showCustom={showCustom}
                onToggleCustom={() => setShowCustom(!showCustom)}
                customAdj={customAdj}
                onCustomChange={setCustomAdj}
                compareId={compareId}
                onCompareChange={setCompareId}
              />
            </aside>

            {/* Right: Results */}
            <div>
              {result && (
                <ScenarioResults
                  result={result}
                  comparison={comparison}
                />
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

// ─── Scenario Selector ──────────────────────────────────────────────────────

function ScenarioSelector({
  selectedId,
  onSelect,
  showCustom,
  onToggleCustom,
  customAdj,
  onCustomChange,
  compareId,
  onCompareChange,
}: {
  selectedId: string;
  onSelect: (id: string) => void;
  showCustom: boolean;
  onToggleCustom: () => void;
  customAdj: ScenarioAdjustment;
  onCustomChange: (adj: ScenarioAdjustment) => void;
  compareId: string | null;
  onCompareChange: (id: string | null) => void;
}) {
  const { savedScenarios, saveScenario, removeScenario } = useScenarios();

  const handleSaveCustom = () => {
    if (customAdj.returnShift === 0 && customAdj.riskMultiplier === 1) {
      toast.error("Adjust the scenario before saving");
      return;
    }
    saveScenario(`Custom (${customAdj.returnShift > 0 ? "+" : ""}${customAdj.returnShift}%)`, customAdj);
    toast.success("Custom scenario saved");
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Predefined scenarios */}
      <div className="machined-edge rounded-lg border border-border bg-surface p-4">
        <h3 className="label-eyebrow mb-3">Scenarios</h3>
        <div className="flex flex-col gap-1.5">
          {scenarios.map((s) => {
            const Icon = scenarioIcons[s.id] ?? AlertTriangle;
            const active = selectedId === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => onSelect(s.id)}
                className={[
                  "flex items-center gap-2.5 rounded-md border px-3 py-2.5 text-left transition-colors",
                  active
                    ? "border-foreground bg-foreground/5"
                    : "border-border bg-surface hover:border-foreground",
                ].join(" ")}
              >
                <Icon className={`size-4 ${active ? "text-foreground" : "text-muted-foreground"}`} />
                <div className="flex-1 min-w-0">
                  <span className={`text-sm font-medium ${active ? "text-foreground" : "text-muted-foreground"}`}>
                    {s.name}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom scenario builder */}
      <div className="machined-edge rounded-lg border border-border bg-surface p-4">
        <button
          type="button"
          onClick={onToggleCustom}
          className="flex w-full items-center justify-between"
        >
          <h3 className="label-eyebrow">Custom Scenario</h3>
          <Sliders className={`size-3.5 transition-transform ${showCustom ? "rotate-180" : ""} text-muted-foreground`} />
        </button>

        {showCustom && (
          <div className="mt-4 flex flex-col gap-4">
            <div>
              <label className="text-[11px] font-medium text-muted-foreground">
                Return shift: {customAdj.returnShift > 0 ? "+" : ""}{customAdj.returnShift}%
              </label>
              <input
                type="range"
                min={-20}
                max={20}
                step={1}
                value={customAdj.returnShift}
                onChange={(e) =>
                  onCustomChange({ ...customAdj, returnShift: Number(e.target.value) })
                }
                className="mt-1 w-full accent-foreground"
              />
            </div>
            <div>
              <label className="text-[11px] font-medium text-muted-foreground">
                Risk multiplier: {customAdj.riskMultiplier.toFixed(1)}x
              </label>
              <input
                type="range"
                min={0.5}
                max={2}
                step={0.1}
                value={customAdj.riskMultiplier}
                onChange={(e) =>
                  onCustomChange({ ...customAdj, riskMultiplier: Number(e.target.value) })
                }
                className="mt-1 w-full accent-foreground"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => onSelect("custom")}
                className={[
                  "flex-1 rounded-md border px-3 py-1.5 text-[11px] font-medium transition-colors",
                  selectedId === "custom"
                    ? "border-foreground bg-foreground text-background"
                    : "border-border bg-surface text-foreground hover:border-foreground",
                ].join(" ")}
              >
                Apply
              </button>
              <button
                type="button"
                onClick={handleSaveCustom}
                className="inline-flex items-center gap-1 rounded-md border border-border px-3 py-1.5 text-[11px] font-medium text-foreground transition-colors hover:border-foreground"
              >
                <Save className="size-3" /> Save
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Saved custom scenarios */}
      {savedScenarios.length > 0 && (
        <div className="machined-edge rounded-lg border border-border bg-surface p-4">
          <h3 className="label-eyebrow mb-3">Saved Scenarios</h3>
          <div className="flex flex-col gap-1.5">
            {savedScenarios.map((s) => (
              <div
                key={s.id}
                className="flex items-center gap-2 rounded-md border border-border px-3 py-2"
              >
                <button
                  type="button"
                  onClick={() => {
                    onCustomChange(s.adjustment);
                    onSelect("custom");
                    if (!showCustom) onToggleCustom();
                  }}
                  className="flex-1 text-left text-sm font-medium text-foreground transition-colors hover:underline"
                >
                  {s.name}
                </button>
                <button
                  type="button"
                  onClick={() => removeScenario(s.id)}
                  className="rounded p-1 text-muted-foreground transition-colors hover:text-risk-high"
                >
                  <Trash2 className="size-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Compare mode */}
      <div className="machined-edge rounded-lg border border-border bg-surface p-4">
        <h3 className="label-eyebrow mb-3 flex items-center gap-1.5">
          <GitCompare className="size-3" /> Compare Scenarios
        </h3>
        <select
          value={compareId ?? ""}
          onChange={(e) => onCompareChange(e.target.value || null)}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-foreground focus:outline-none"
        >
          <option value="">None</option>
          {scenarios.map((s) => (
            <option key={s.id} value={s.id}>
              vs {s.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

// ─── Scenario Results ───────────────────────────────────────────────────────

function ScenarioResults({
  result,
  comparison,
}: {
  result: PortfolioScenarioResult;
  comparison: ScenarioComparison | null;
}) {
  const positive = result.totalChangePct >= 0;

  return (
    <div className="flex flex-col gap-6">
      {/* Summary strip */}
      <div className="machined-edge grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-4">
        <SummaryStat label="Current value" value={fmtUSD(result.totalCurrent)} />
        <SummaryStat
          label={`${result.scenario.name} value`}
          value={fmtUSD(result.totalScenarioValue)}
          accent
        />
        <SummaryStat
          label="Change"
          value={fmtUSD(result.totalChange)}
          tone={positive ? "positive" : "negative"}
        />
        <SummaryStat
          label="Return"
          value={fmtPct(result.totalChangePct)}
          tone={positive ? "positive" : "negative"}
        />
      </div>

      {/* Comparison summary */}
      {comparison && (
        <div className="rounded-md border border-border bg-surface px-4 py-3">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <GitCompare className="size-4" />
            {comparison.scenarioA.scenario.name} vs {comparison.scenarioB.scenario.name}
          </div>
          <div className="mt-2 grid grid-cols-3 gap-4">
            <div>
              <span className="text-[11px] text-muted-foreground">{comparison.scenarioA.scenario.name}</span>
              <div className="font-mono text-sm font-medium text-foreground">
                {fmtUSD(comparison.scenarioA.totalScenarioValue)}
              </div>
            </div>
            <div>
              <span className="text-[11px] text-muted-foreground">{comparison.scenarioB.scenario.name}</span>
              <div className="font-mono text-sm font-medium text-foreground">
                {fmtUSD(comparison.scenarioB.totalScenarioValue)}
              </div>
            </div>
            <div>
              <span className="text-[11px] text-muted-foreground">Difference</span>
              <div className={`font-mono text-sm font-medium ${comparison.deltaPct >= 0 ? "text-risk-low" : "text-risk-high"}`}>
                {fmtUSD(comparison.deltaValue)} ({fmtPct(comparison.deltaPct)})
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Insights */}
      {result.insights.length > 0 && (
        <div className="flex flex-col gap-2">
          {result.insights.map((insight) => (
            <div
              key={insight.id}
              className={[
                "flex items-start gap-3 rounded-md border px-4 py-3",
                insight.tone === "positive"
                  ? "border-risk-low/30 bg-risk-low/5"
                  : insight.tone === "negative"
                    ? "border-risk-high/30 bg-risk-high/5"
                    : insight.tone === "caution"
                      ? "border-risk-medium/30 bg-risk-medium/5"
                      : "border-border bg-surface",
              ].join(" ")}
            >
              <div className={[
                "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full",
                insight.tone === "positive" ? "text-risk-low" :
                insight.tone === "negative" ? "text-risk-high" :
                insight.tone === "caution" ? "text-risk-medium" : "text-muted-foreground",
              ].join(" ")}>
                {insight.tone === "positive" ? <TrendingUp className="size-3" /> :
                 insight.tone === "negative" ? <TrendingDown className="size-3" /> :
                 insight.tone === "caution" ? <AlertTriangle className="size-3" /> :
                 <Shield className="size-3" />}
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium text-foreground">{insight.title}</span>
                <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
                  {insight.detail}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Fund impact chart */}
      <section className="machined-edge rounded-lg border border-border bg-surface p-5">
        <h3 className="label-eyebrow mb-4">Fund-Level Impact</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={result.fundResults.map((r) => ({
                name: r.fundName.length > 18 ? r.fundName.slice(0, 16) + "..." : r.fundName,
                current: r.currentValue,
                scenario: r.scenarioValue,
              }))}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="2 4" vertical={false} />
              <XAxis
                dataKey="name"
                stroke="hsl(var(--muted-foreground))"
                fontSize={10}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                width={64}
                tickFormatter={(v) => fmtUSD(v as number)}
              />
              <Tooltip
                cursor={{ fill: "hsl(var(--foreground))", opacity: 0.04 }}
                contentStyle={{
                  backgroundColor: "hsl(var(--surface))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 8,
                  fontSize: 11,
                }}
                formatter={(value: number, name: string) => [fmtUSD(value), name === "current" ? "Current" : result.scenario.name]}
              />
              <Legend
                formatter={(value) => (value === "current" ? "Current" : result.scenario.name)}
                wrapperStyle={{ fontSize: 11 }}
              />
              <Bar dataKey="current" fill="hsl(var(--muted-foreground))" radius={[2, 2, 0, 0]} />
              <Bar dataKey="scenario" radius={[2, 2, 0, 0]}>
                {result.fundResults.map((r, i) => (
                  <Cell
                    key={i}
                    fill={r.changePct >= 0 ? "hsl(var(--risk-low))" : "hsl(var(--risk-high))"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Per-fund breakdown */}
      <section>
        <h3 className="label-eyebrow mb-4">Per-Fund Breakdown</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
                <th className="px-3 py-2 text-left">Fund</th>
                <th className="px-3 py-2 text-left">Type</th>
                <th className="px-3 py-2 text-right">Current</th>
                <th className="px-3 py-2 text-right">{result.scenario.name}</th>
                <th className="px-3 py-2 text-right">Change</th>
                <th className="px-3 py-2 text-right">Resilience</th>
              </tr>
            </thead>
            <tbody>
              {result.fundResults.map((r) => (
                <tr key={r.fundId} className="border-b border-border/50 transition-colors hover:bg-surface-muted/50">
                  <td className="px-3 py-3 font-medium text-foreground">{r.fundName}</td>
                  <td className="px-3 py-3 text-muted-foreground">{r.fundType}</td>
                  <td className="px-3 py-3 text-right font-mono text-foreground">{fmtUSD(r.currentValue)}</td>
                  <td className="px-3 py-3 text-right font-mono text-foreground">{fmtUSD(r.scenarioValue)}</td>
                  <td className={`px-3 py-3 text-right font-mono ${r.changePct >= 0 ? "text-risk-low" : "text-risk-high"}`}>
                    {fmtUSD(r.change)} ({fmtPct(r.changePct)})
                  </td>
                  <td className="px-3 py-3 text-right">
                    <span className={[
                      "inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider",
                      r.resilience === "high" ? "bg-risk-low/10 text-risk-low" :
                      r.resilience === "medium" ? "bg-risk-medium/10 text-risk-medium" :
                      "bg-risk-high/10 text-risk-high",
                    ].join(" ")}>
                      {r.resilience === "high" ? <Shield className="size-2.5" /> :
                       r.resilience === "medium" ? <AlertTriangle className="size-2.5" /> :
                       <Zap className="size-2.5" />}
                      {r.resilience}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Comparison chart */}
      {comparison && (
        <section className="machined-edge rounded-lg border border-border bg-surface p-5">
          <h3 className="label-eyebrow mb-4">
            {comparison.scenarioA.scenario.name} vs {comparison.scenarioB.scenario.name}
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={comparison.scenarioA.fundResults.map((r, i) => {
                  const b = comparison.scenarioB.fundResults[i];
                  return {
                    name: r.fundName.length > 18 ? r.fundName.slice(0, 16) + "..." : r.fundName,
                    a: r.scenarioValue,
                    b: b?.scenarioValue ?? 0,
                  };
                })}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="2 4" vertical={false} />
                <XAxis
                  dataKey="name"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  width={64}
                  tickFormatter={(v) => fmtUSD(v as number)}
                />
                <Tooltip
                  cursor={{ fill: "hsl(var(--foreground))", opacity: 0.04 }}
                  contentStyle={{
                    backgroundColor: "hsl(var(--surface))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 8,
                    fontSize: 11,
                  }}
                  formatter={(value: number, name: string) => [
                    fmtUSD(value),
                    name === "a" ? comparison.scenarioA.scenario.name : comparison.scenarioB.scenario.name,
                  ]}
                />
                <Legend
                  formatter={(value) =>
                    value === "a" ? comparison.scenarioA.scenario.name : comparison.scenarioB.scenario.name
                  }
                  wrapperStyle={{ fontSize: 11 }}
                />
                <Bar dataKey="a" fill="hsl(var(--foreground))" radius={[2, 2, 0, 0]} />
                <Bar dataKey="b" fill="hsl(var(--risk-medium))" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

      <AssumptionsNote assumptions={ASSUMPTIONS.scenario} title="What this scenario assumes" />
    </div>
  );
}

function SummaryStat({
  label,
  value,
  accent,
  tone,
}: {
  label: string;
  value: string;
  accent?: boolean;
  tone?: "positive" | "negative";
}) {
  const toneClass =
    tone === "positive" ? "text-risk-low" : tone === "negative" ? "text-risk-high" : "text-foreground";
  return (
    <div className={`flex flex-col gap-1 px-6 py-5 ${accent ? "bg-foreground text-background" : "bg-surface"}`}>
      <span className={`label-eyebrow ${accent ? "text-background/60" : ""}`}>{label}</span>
      <span className={`text-2xl font-medium tracking-tight font-mono ${accent ? "text-background" : toneClass}`}>
        {value}
      </span>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="machined-edge flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-border bg-surface p-16 text-center">
      <Zap className="size-7 text-muted-foreground" />
      <div className="flex flex-col gap-1.5">
        <h3 className="text-lg font-medium text-foreground">No portfolio to simulate</h3>
        <p className="max-w-md text-sm text-muted-foreground">
          Add funds to your portfolio first, then come back to test them under
          different market scenarios.
        </p>
      </div>
      <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
        <Link
          to="/funds"
          className="rounded-md bg-foreground px-4 py-2 text-xs font-semibold text-background transition-opacity hover:opacity-90"
        >
          Browse funds
        </Link>
        <Link
          to="/portfolio"
          className="rounded-md border border-border bg-surface px-4 py-2 text-xs font-medium text-foreground transition-colors hover:border-foreground"
        >
          Go to portfolio
        </Link>
      </div>
    </div>
  );
}

export default ScenarioSimulator;
