import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Check, Plus } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { SiteHeader } from "@/components/funds/SiteHeader";
import { CompareBar } from "@/components/funds/CompareBar";
import { RiskMeter } from "@/components/funds/RiskMeter";
import { funds, formatCurrency } from "@/data/funds";
import { useCompare, MAX_COMPARE } from "@/hooks/useCompare";

const FundDetail = () => {
  const { id } = useParams<{ id: string }>();
  const fund = funds.find((f) => f.id === id);
  const { isSelected, toggle, isFull } = useCompare();

  if (!fund) {
    return (
      <div className="min-h-dvh bg-background">
        <SiteHeader />
        <main className="mx-auto max-w-2xl px-6 py-24 text-center">
          <h1 className="text-xl font-medium">Fund not found</h1>
          <Link to="/" className="mt-4 inline-block text-sm underline">
            Back to fund registry
          </Link>
        </main>
      </div>
    );
  }

  const checked = isSelected(fund.id);
  const disabled = !checked && isFull;

  const metrics = [
    { label: "Expected Return", value: `${fund.returnMin}–${fund.returnMax}%` },
    { label: "Risk Level", value: fund.risk },
    { label: "Duration", value: `${fund.durationYears} years` },
    { label: "Min. Investment", value: formatCurrency(fund.minInvestment) },
    { label: "Strategy", value: fund.type },
    { label: "AUM", value: fund.aum },
    { label: "Inception", value: fund.inception },
    { label: "Manager", value: fund.manager },
  ];

  return (
    <div className="min-h-dvh bg-background">
      <SiteHeader />

      <main className="mx-auto max-w-[1280px] px-6 pb-32 pt-10">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          Back to all funds
        </Link>

        <header className="mt-6 flex flex-wrap items-end justify-between gap-6 border-b border-border pb-8">
          <div className="flex flex-col gap-3">
            <span className="label-eyebrow">{fund.type}</span>
            <h1 className="text-4xl font-medium tracking-tight text-foreground">
              {fund.name}
            </h1>
            <p className="font-mono text-xs text-muted-foreground">
              {fund.ticker} · Managed by {fund.manager}
            </p>
          </div>
          <button
            type="button"
            onClick={() => toggle(fund.id)}
            disabled={disabled}
            title={disabled ? `Maximum ${MAX_COMPARE} funds` : ""}
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
        </header>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1.4fr_1fr]">
          <section>
            <h2 className="label-eyebrow mb-3">Overview</h2>
            <p className="text-pretty text-base leading-relaxed text-foreground">
              {fund.description}
            </p>

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
                  <span className="text-xs text-muted-foreground">{m.label}</span>
                  {m.label === "Risk Level" ? (
                    <RiskMeter risk={fund.risk} score={fund.riskScore} />
                  ) : (
                    <span className="font-mono text-sm text-foreground">{m.value}</span>
                  )}
                </div>
              ))}
            </div>
          </aside>
        </div>
      </main>

      <CompareBar />
    </div>
  );
};

export default FundDetail;