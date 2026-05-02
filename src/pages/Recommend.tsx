import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Sparkles, ArrowRight, Plus, Check } from "lucide-react";
import { SiteHeader } from "@/components/funds/SiteHeader";
import { RiskMeter } from "@/components/funds/RiskMeter";
import { SaveToPortfolio } from "@/components/funds/SaveToPortfolio";
import { useCompare, MAX_COMPARE } from "@/hooks/useCompare";
import { formatCurrency } from "@/data/funds";
import {
  recommend,
  explain,
  type Preferences,
  type Horizon,
  type Goal,
} from "@/lib/recommend";
import type { RiskLevel } from "@/data/funds";

const RISKS: RiskLevel[] = ["Low", "Medium", "High"];
const HORIZONS: { value: Horizon; label: string; sub: string }[] = [
  { value: "Short", label: "Short", sub: "1–3 yrs" },
  { value: "Medium", label: "Medium", sub: "3–7 yrs" },
  { value: "Long", label: "Long", sub: "7+ yrs" },
];
const GOALS: Goal[] = ["Growth", "Income", "Balanced"];

const Recommend = () => {
  const [prefs, setPrefs] = useState<Preferences>({
    risk: "Medium",
    horizon: "Long",
    goal: "Growth",
    amount: 250000,
  });
  const [submitted, setSubmitted] = useState<Preferences | null>(null);

  const results = useMemo(
    () => (submitted ? recommend(submitted, 3) : []),
    [submitted]
  );

  return (
    <div className="min-h-dvh bg-background">
      <SiteHeader />

      <main className="mx-auto max-w-[1280px] px-6 pb-32 pt-10">
        <header className="mb-10 flex flex-col gap-3">
          <span className="label-eyebrow inline-flex items-center gap-2">
            <Sparkles className="size-3" /> Recommendation Engine
          </span>
          <h1 className="max-w-3xl text-balance text-4xl font-medium leading-[1.1] tracking-tight text-foreground">
            Find funds that fit your profile.
          </h1>
          <p className="max-w-xl text-pretty text-sm text-muted-foreground">
            Tell us your risk appetite, horizon, and goal. We score every fund
            against your profile and surface the strongest matches.
          </p>
        </header>

        <div className="grid gap-8 lg:grid-cols-[420px_1fr]">
          <PreferencesPanel
            prefs={prefs}
            onChange={setPrefs}
            onSubmit={() => setSubmitted({ ...prefs })}
          />

          <ResultsPanel results={results} prefs={submitted} />
        </div>
      </main>
    </div>
  );
};

function PreferencesPanel({
  prefs,
  onChange,
  onSubmit,
}: {
  prefs: Preferences;
  onChange: (p: Preferences) => void;
  onSubmit: () => void;
}) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="machined-edge sticky top-20 flex h-fit flex-col gap-7 rounded-lg border border-border bg-surface p-6"
    >
      <div>
        <span className="label-eyebrow">Your Profile</span>
        <h2 className="mt-1 text-lg font-medium tracking-tight">Preferences</h2>
      </div>

      <Field label="Risk tolerance">
        <SegGroup
          options={RISKS}
          value={prefs.risk}
          onChange={(risk) => onChange({ ...prefs, risk })}
        />
      </Field>

      <Field label="Investment horizon">
        <div className="grid grid-cols-3 gap-1.5">
          {HORIZONS.map((h) => {
            const active = prefs.horizon === h.value;
            return (
              <button
                key={h.value}
                type="button"
                onClick={() => onChange({ ...prefs, horizon: h.value })}
                aria-pressed={active}
                className={[
                  "flex flex-col items-start rounded-md border px-3 py-2.5 text-left transition-all",
                  active
                    ? "border-foreground bg-foreground text-background"
                    : "border-border bg-background text-foreground hover:border-border-strong",
                ].join(" ")}
              >
                <span className="text-xs font-semibold">{h.label}</span>
                <span
                  className={[
                    "font-mono text-[10px]",
                    active ? "text-background/70" : "text-muted-foreground",
                  ].join(" ")}
                >
                  {h.sub}
                </span>
              </button>
            );
          })}
        </div>
      </Field>

      <Field label="Investment goal">
        <SegGroup
          options={GOALS}
          value={prefs.goal}
          onChange={(goal) => onChange({ ...prefs, goal })}
        />
      </Field>

      <Field label="Investment amount (USD)">
        <div className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2.5 focus-within:border-foreground">
          <span className="font-mono text-sm text-muted-foreground">$</span>
          <input
            type="number"
            min={0}
            step={5000}
            value={prefs.amount}
            onChange={(e) =>
              onChange({ ...prefs, amount: Math.max(0, Number(e.target.value) || 0) })
            }
            className="w-full bg-transparent font-mono text-sm text-foreground outline-none"
          />
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {[50000, 100000, 250000, 500000, 1000000].map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => onChange({ ...prefs, amount: v })}
              className={[
                "rounded-full border px-2.5 py-1 font-mono text-[10px] transition-colors",
                prefs.amount === v
                  ? "border-foreground bg-foreground text-background"
                  : "border-border text-muted-foreground hover:text-foreground",
              ].join(" ")}
            >
              {formatCurrency(v)}
            </button>
          ))}
        </div>
      </Field>

      <button
        type="submit"
        className="mt-2 inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
      >
        Generate recommendations
        <ArrowRight className="size-4" />
      </button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="label-eyebrow">{label}</span>
      {children}
    </div>
  );
}

function SegGroup<T extends string>({
  options,
  value,
  onChange,
}: {
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="grid grid-cols-3 gap-1.5">
      {options.map((opt) => {
        const active = opt === value;
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            aria-pressed={active}
            className={[
              "rounded-md border px-3 py-2.5 text-xs font-semibold transition-all",
              active
                ? "border-foreground bg-foreground text-background"
                : "border-border bg-background text-foreground hover:border-border-strong",
            ].join(" ")}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

function ResultsPanel({
  results,
  prefs,
}: {
  results: ReturnType<typeof recommend>;
  prefs: Preferences | null;
}) {
  if (!prefs) {
    return (
      <div className="machined-edge flex min-h-[400px] flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border bg-surface p-10 text-center">
        <Sparkles className="size-6 text-muted-foreground" />
        <h3 className="text-base font-medium text-foreground">
          Your matches will appear here
        </h3>
        <p className="max-w-sm text-sm text-muted-foreground">
          Set your preferences and we'll rank the top three funds for your
          profile with a transparent match score.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-baseline justify-between border-b border-border pb-3">
        <span className="label-eyebrow">Top Matches</span>
        <span className="font-mono text-[11px] text-muted-foreground">
          {prefs.risk} risk · {prefs.horizon} horizon · {prefs.goal} ·{" "}
          {formatCurrency(prefs.amount)}
        </span>
      </div>
      {results.map((r, i) => (
        <RecommendationCard key={r.fund.id} rec={r} prefs={prefs} rank={i + 1} />
      ))}
    </div>
  );
}

function RecommendationCard({
  rec,
  prefs,
  rank,
}: {
  rec: ReturnType<typeof recommend>[number];
  prefs: Preferences;
  rank: number;
}) {
  const { fund, score, breakdown } = rec;
  const { isSelected, toggle, isFull } = useCompare();
  const checked = isSelected(fund.id);
  const disabled = !checked && isFull;

  const tone =
    score >= 80 ? "text-risk-low" : score >= 60 ? "text-risk-medium" : "text-risk-high";

  const bars: { label: string; value: number }[] = [
    { label: "Risk", value: breakdown.risk },
    { label: "Duration", value: breakdown.duration },
    { label: "Return", value: breakdown.return },
    { label: "Goal fit", value: breakdown.goal },
    { label: "Access", value: breakdown.access },
  ];

  return (
    <article className="machined-edge rounded-lg border border-border bg-surface p-6 transition-colors hover:border-border-strong">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="flex size-9 items-center justify-center rounded-md border border-border-strong bg-background font-mono text-xs font-semibold text-foreground">
            {rank}
          </div>
          <div className="flex flex-col gap-1">
            <Link to={`/fund/${fund.id}`} className="group">
              <h3 className="text-lg font-semibold tracking-tight text-foreground group-hover:underline">
                {fund.name}
              </h3>
              <span className="font-mono text-[11px] text-muted-foreground">
                {fund.ticker} · {fund.type}
              </span>
            </Link>
            <p className="mt-2 max-w-lg text-sm text-foreground">
              {explain(rec, prefs)}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-end">
          <span className="label-eyebrow">Match</span>
          <div className="flex items-baseline gap-1">
            <span className={`font-mono text-3xl font-medium ${tone}`}>{score}</span>
            <span className="font-mono text-xs text-muted-foreground">/100</span>
          </div>
        </div>
      </div>

      {/* Breakdown bars */}
      <div className="mt-5 grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-5">
        {bars.map((b) => (
          <div key={b.label} className="flex flex-col gap-1">
            <div className="flex items-baseline justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {b.label}
              </span>
              <span className="font-mono text-[10px] text-foreground">
                {Math.round(b.value * 100)}
              </span>
            </div>
            <div className="h-1 overflow-hidden rounded-full bg-surface-muted">
              <div
                className="h-full rounded-full bg-foreground"
                style={{ width: `${Math.max(4, b.value * 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Footer row */}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
        <div className="flex flex-wrap items-center gap-5 text-xs">
          <Stat label="Return" value={`${fund.returnMin}–${fund.returnMax}%`} />
          <Stat label="Duration" value={`${fund.durationYears}y`} />
          <Stat label="Minimum" value={formatCurrency(fund.minInvestment)} />
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Risk
            </span>
            <RiskMeter risk={fund.risk} score={fund.riskScore} />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <SaveToPortfolio fund={fund} variant="compact" />
          <button
            type="button"
            onClick={() => toggle(fund.id)}
            disabled={disabled}
            title={disabled ? `Maximum ${MAX_COMPARE} funds` : undefined}
            className={[
              "inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-[11px] font-medium transition-colors",
              checked
                ? "border-foreground bg-foreground text-background"
                : "border-border text-foreground hover:bg-surface-muted",
              disabled && !checked ? "cursor-not-allowed opacity-40" : "",
            ].join(" ")}
          >
            {checked ? <Check className="size-3" /> : <Plus className="size-3" />}
            {checked ? "In compare" : "Add to compare"}
          </button>
          <Link
            to={`/fund/${fund.id}`}
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-[11px] font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            View details <ArrowRight className="size-3" />
          </Link>
        </div>
      </div>
    </article>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <span className="font-mono text-xs text-foreground">{value}</span>
    </div>
  );
}

export default Recommend;