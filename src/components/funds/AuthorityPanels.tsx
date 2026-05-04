import { useState } from "react";
import { Info, ChevronDown, Check, X, ShieldCheck, Lightbulb, BookOpen } from "lucide-react";
import {
  type BenchmarkResult,
  type ConfidenceAssessment,
  type WhyExplanation,
  GLOSSARY,
} from "@/lib/authority";

// ─── Why this recommendation ────────────────────────────────────────────────

export function WhyPanel({
  why,
  title = "Why this was suggested",
  factorsLabel = "Factors considered",
  defaultOpen = false,
}: {
  why: WhyExplanation;
  title?: string;
  factorsLabel?: string;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="machined-edge rounded-md border border-border bg-surface">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-start gap-3 px-4 py-3 text-left"
        aria-expanded={open}
      >
        <Lightbulb className="mt-0.5 size-4 shrink-0 text-foreground" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-3">
            <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              {title}
            </span>
            <ChevronDown className={`size-3.5 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
          </div>
          <p className="mt-1 text-sm leading-relaxed text-foreground">{why.summary}</p>
        </div>
      </button>
      {open && (
        <div className="border-t border-border px-4 py-3">
          <span className="label-eyebrow">{factorsLabel}</span>
          <ul className="mt-2 flex flex-col gap-1.5">
            {why.factors.map((f, i) => (
              <li key={i} className="flex items-start gap-2 text-[12px] leading-relaxed text-foreground">
                <span className="mt-1.5 size-1 shrink-0 rounded-full bg-muted-foreground" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ─── Benchmarks ──────────────────────────────────────────────────────────────

const ratingTone: Record<BenchmarkResult["rating"], string> = {
  "Above average": "border-risk-low/40 text-risk-low bg-risk-low/5",
  Average: "border-border text-foreground bg-surface",
  "Below average": "border-risk-high/40 text-risk-high bg-risk-high/5",
};

export function BenchmarkBadges({
  benchmarks,
  compact = false,
}: {
  benchmarks: BenchmarkResult[];
  compact?: boolean;
}) {
  if (compact) {
    return (
      <div className="flex flex-wrap gap-1.5">
        {benchmarks.map((b) => (
          <span
            key={b.category}
            title={b.detail}
            className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-medium ${ratingTone[b.rating]}`}
          >
            <span className="font-mono uppercase tracking-wider">{b.category}</span>
            <span>·</span>
            <span>{b.rating}</span>
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-2 sm:grid-cols-3">
      {benchmarks.map((b) => (
        <div key={b.category} className={`rounded-md border px-3 py-2.5 ${ratingTone[b.rating]}`}>
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-[0.15em]">{b.category}</span>
            <span className="text-xs font-medium">{b.rating}</span>
          </div>
          <p className="mt-1 text-[11px] leading-relaxed text-foreground/80">{b.detail}</p>
        </div>
      ))}
    </div>
  );
}

// ─── Confidence ──────────────────────────────────────────────────────────────

const levelTone = {
  High: "border-risk-low/40 text-risk-low bg-risk-low/5",
  Moderate: "border-risk-medium/40 text-risk-medium bg-risk-medium/5",
  Low: "border-risk-high/40 text-risk-high bg-risk-high/5",
} as const;

export function ConfidenceBadge({
  assessment,
  showFactors = false,
  label,
}: {
  assessment: ConfidenceAssessment;
  showFactors?: boolean;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={() => showFactors && setOpen((v) => !v)}
        className={`inline-flex items-center gap-2 self-start rounded-full border px-2.5 py-1 text-[11px] font-medium ${levelTone[assessment.level]} ${
          showFactors ? "cursor-pointer" : "cursor-default"
        }`}
      >
        <ShieldCheck className="size-3" />
        <span>
          {label ?? "Confidence"}: {assessment.level}
        </span>
        <span className="font-mono opacity-70">{assessment.score}/100</span>
        {showFactors && <ChevronDown className={`size-3 transition-transform ${open ? "rotate-180" : ""}`} />}
      </button>
      {showFactors && open && (
        <ul className="machined-edge flex flex-col gap-1.5 rounded-md border border-border bg-surface p-3">
          {assessment.factors.map((f) => (
            <li key={f.label} className="flex items-start gap-2 text-[12px]">
              {f.met ? (
                <Check className="mt-0.5 size-3.5 shrink-0 text-risk-low" />
              ) : (
                <X className="mt-0.5 size-3.5 shrink-0 text-risk-high" />
              )}
              <div>
                <span className="font-medium text-foreground">{f.label}</span>
                <p className="text-[11px] leading-relaxed text-muted-foreground">{f.note}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ─── Assumptions ─────────────────────────────────────────────────────────────

export function AssumptionsNote({
  assumptions,
  title = "Assumptions",
}: {
  assumptions: readonly string[];
  title?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-md border border-dashed border-border bg-surface/50 px-4 py-3">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 text-left"
        aria-expanded={open}
      >
        <div className="flex items-center gap-2">
          <Info className="size-3.5 text-muted-foreground" />
          <span className="label-eyebrow">{title}</span>
        </div>
        <ChevronDown className={`size-3.5 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <ul className="mt-3 flex flex-col gap-1.5 border-t border-border pt-3">
          {assumptions.map((a, i) => (
            <li key={i} className="flex items-start gap-2 text-[11px] leading-relaxed text-muted-foreground">
              <span className="mt-1.5 size-1 shrink-0 rounded-full bg-border-strong" />
              <span>{a}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ─── Educational glossary tooltip / inline term ─────────────────────────────

export function EducationalTerm({
  termKey,
  children,
}: {
  termKey: keyof typeof GLOSSARY | string;
  children?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const entry = GLOSSARY[termKey.toString().toLowerCase()];
  if (!entry) return <>{children}</>;
  return (
    <span className="relative inline-flex items-center gap-0.5">
      <span>{children ?? entry.term}</span>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={`What is ${entry.term}?`}
        className="inline-flex size-3.5 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
      >
        <BookOpen className="size-2" />
      </button>
      {open && (
        <span
          role="tooltip"
          className="absolute left-0 top-full z-30 mt-2 w-72 rounded-md border border-border bg-popover p-3 text-left shadow-lg"
        >
          <span className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            {entry.term}
          </span>
          <span className="mt-1 block text-xs font-medium text-foreground">{entry.short}</span>
          <span className="mt-1.5 block text-[11px] leading-relaxed text-muted-foreground">{entry.detail}</span>
        </span>
      )}
    </span>
  );
}
