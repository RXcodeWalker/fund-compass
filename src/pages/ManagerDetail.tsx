import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { SiteHeader } from "@/components/funds/SiteHeader";
import { CompareBar } from "@/components/funds/CompareBar";
import { TrustBadge } from "@/components/funds/TrustBadge";
import { RiskFlagsList } from "@/components/funds/RiskFlagsList";
import {
  computeTrustScore,
  getFundsForManager,
  getManagerById,
  riskFlags,
  trustTier,
} from "@/data/managers";

const ManagerDetail = () => {
  const { id } = useParams<{ id: string }>();
  const manager = id ? getManagerById(id) : undefined;

  if (!manager) {
    return (
      <div className="min-h-dvh bg-background">
        <SiteHeader />
        <main className="mx-auto max-w-2xl px-6 py-24 text-center">
          <h1 className="text-xl font-medium">Manager not found</h1>
          <Link to="/" className="mt-4 inline-block text-sm underline">
            Back to fund registry
          </Link>
        </main>
      </div>
    );
  }

  const fundsManaged = getFundsForManager(manager.id);
  const trust = computeTrustScore(manager);
  const tier = trustTier(trust);
  const flags = riskFlags(manager);

  const stats = [
    { label: "Years experience", value: `${manager.yearsExperience}` },
    { label: "Assets under management", value: manager.aum },
    { label: "Avg. net IRR", value: manager.avgIrr ? `${manager.avgIrr}%` : "—" },
    { label: "Successful exits", value: `${manager.successfulExits}` },
    { label: "Funds raised", value: `${manager.trackRecord.length}` },
    { label: "Consistency", value: `${manager.consistency}/10` },
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
            <span className="label-eyebrow">Manager Profile</span>
            <h1 className="text-4xl font-medium tracking-tight text-foreground">
              {manager.name}
            </h1>
            <p className="font-mono text-xs text-muted-foreground">
              {manager.title} · {manager.firm}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <TrustBadge score={trust} size="lg" />
            <span className="font-mono text-[11px] text-muted-foreground">
              {tier} trust tier
            </span>
          </div>
        </header>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1.4fr_1fr]">
          <section className="flex flex-col gap-10">
            <div>
              <h2 className="label-eyebrow mb-3">Biography</h2>
              <p className="text-pretty text-base leading-relaxed text-foreground">
                {manager.bio}
              </p>
            </div>

            <div>
              <h2 className="label-eyebrow mb-3">Track record · Net IRR by vintage</h2>
              <div className="machined-edge rounded-lg border border-border bg-surface p-4">
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={manager.trackRecord.map((t) => ({
                        name: `${t.vintage} · ${t.fund}`,
                        irr: t.netIrr,
                        status: t.status,
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
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                        width={36}
                        tickFormatter={(v) => `${v}%`}
                      />
                      <Tooltip
                        cursor={{ fill: "hsl(var(--surface-muted))" }}
                        contentStyle={{
                          backgroundColor: "hsl(var(--surface))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: 8,
                          fontSize: 12,
                        }}
                        formatter={(v: number) => [`${v}%`, "Net IRR"]}
                      />
                      <Bar dataKey="irr" radius={[4, 4, 0, 0]}>
                        {manager.trackRecord.map((t, i) => (
                          <Cell
                            key={i}
                            fill={
                              t.status === "Realized"
                                ? "hsl(var(--foreground))"
                                : "hsl(var(--border-strong))"
                            }
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-3 flex items-center gap-4 font-mono text-[10px] text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="size-2 rounded-sm bg-foreground" /> Realized
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="size-2 rounded-sm bg-border-strong" /> Active
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h2 className="label-eyebrow mb-3">Funds managed on platform</h2>
              <div className="flex flex-col gap-2">
                {fundsManaged.length === 0 ? (
                  <div className="rounded-md border border-dashed border-border bg-surface px-4 py-8 text-center text-xs text-muted-foreground">
                    No active funds listed.
                  </div>
                ) : (
                  fundsManaged.map((f) => (
                    <Link
                      key={f.id}
                      to={`/fund/${f.id}`}
                      className="machined-edge flex items-center justify-between rounded-md border border-border bg-surface px-4 py-3.5 transition-colors hover:border-foreground"
                    >
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-semibold text-foreground">
                          {f.name}
                        </span>
                        <span className="font-mono text-[11px] text-muted-foreground">
                          {f.ticker} · {f.type}
                        </span>
                      </div>
                      <span className="font-mono text-xs text-foreground">
                        {f.returnMin}–{f.returnMax}%
                      </span>
                    </Link>
                  ))
                )}
              </div>
            </div>
          </section>

          <aside className="flex flex-col gap-8">
            <div>
              <h2 className="label-eyebrow mb-3">Key statistics</h2>
              <div className="machined-edge overflow-hidden rounded-lg border border-border bg-surface">
                {stats.map((s, i) => (
                  <div
                    key={s.label}
                    className={[
                      "flex items-center justify-between px-4 py-3.5",
                      i !== stats.length - 1 ? "border-b border-border" : "",
                    ].join(" ")}
                  >
                    <span className="text-xs text-muted-foreground">{s.label}</span>
                    <span className="font-mono text-sm text-foreground">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="label-eyebrow mb-3">Risk signals</h2>
              <RiskFlagsList flags={flags} />
            </div>
          </aside>
        </div>
      </main>

      <CompareBar />
    </div>
  );
};

export default ManagerDetail;