import { Link } from "react-router-dom";
import { ArrowRight, Search, GitCompare, Briefcase, Sparkles, ShieldCheck, TrendingUp, ChartBar as BarChart3, FileSpreadsheet, FileText, Clock, Eye, Zap, Target, Users, CircleCheck as CheckCircle2, X } from "lucide-react";
import { SiteHeader } from "@/components/funds/SiteHeader";
import { Onboarding } from "@/components/funds/Onboarding";
import { InviteReferral } from "@/components/funds/InviteReferral";
import { FeatureRequests } from "@/components/funds/FeatureRequests";
import { EarlyAccess } from "@/components/funds/EarlyAccess";

const Landing = () => {
  return (
    <div className="min-h-dvh bg-background">
      <SiteHeader />
      <Onboarding />

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-[1120px] px-6 pb-20 pt-24">
        <div className="max-w-2xl">
          <span className="label-eyebrow">Private Investment Intelligence</span>
          <h1 className="mt-4 text-5xl font-medium leading-[1.08] tracking-tight text-foreground">
            Compare, analyze, and track private investments in one place.
          </h1>
          <p className="mt-6 max-w-lg text-pretty text-base leading-relaxed text-muted-foreground">
            Stop juggling spreadsheets and scattered PDFs. Aethelgard gives you
            structured fund data, intelligent insights, and portfolio tracking
            — designed for clarity, not complexity.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              to="/funds"
              className="inline-flex items-center gap-2 rounded-md bg-foreground px-5 py-3 text-sm font-semibold text-background transition-opacity hover:opacity-90"
            >
              Start Comparing Funds <ArrowRight className="size-4" />
            </Link>
            <Link
              to="/recommend"
              className="inline-flex items-center gap-2 rounded-md border border-border bg-surface px-5 py-3 text-sm font-medium text-foreground transition-colors hover:border-foreground"
            >
              <Sparkles className="size-4" />
              Get Matched in 30s
            </Link>
          </div>
          <div className="mt-8 flex items-center gap-6 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="relative flex size-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-risk-low opacity-50" />
                <span className="relative inline-flex size-1.5 rounded-full bg-risk-low" />
              </span>
              Live data
            </span>
            <span>14 funds tracked</span>
            <span>4 asset classes</span>
          </div>
        </div>
      </section>

      {/* ── Why This Platform ─────────────────────────────────────────── */}
      <section className="border-t border-border bg-surface-muted/50">
        <div className="mx-auto max-w-[1120px] px-6 py-20">
          <span className="label-eyebrow">Why This Platform</span>
          <h2 className="mt-3 text-3xl font-medium tracking-tight text-foreground">
            Built for evaluating private investments.
          </h2>
          <p className="mt-3 max-w-lg text-sm text-muted-foreground">
            Every feature is designed to replace manual research with structured,
            actionable intelligence.
          </p>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Advantage
              icon={Sparkles}
              title="Intelligent recommendations"
              description="Answer a few questions and get matched to funds that fit your goals, risk tolerance, and timeline."
            />
            <Advantage
              icon={ShieldCheck}
              title="Manager trust scores"
              description="Transparent, weighted scores based on experience, performance, consistency, and track record breadth."
            />
            <Advantage
              icon={Briefcase}
              title="Portfolio tracking"
              description="Add funds, simulate returns, and monitor your portfolio with live-updating NAV and gain calculations."
            />
            <Advantage
              icon={TrendingUp}
              title="Insight-driven decisions"
              description="Rule-based insights flag risk, consistency, and concentration — so you see what the data means, not just what it says."
            />
          </div>
        </div>
      </section>

      {/* ── How It Works ──────────────────────────────────────────────── */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-[1120px] px-6 py-20">
          <span className="label-eyebrow">How It Works</span>
          <h2 className="mt-3 text-3xl font-medium tracking-tight text-foreground">
            Three steps to structured decisions.
          </h2>

          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            <Step number="1" icon={Search} title="Discover funds" description="Browse 14 funds across venture capital, private equity, real estate, and private debt. Filter by type, risk, and expected return." />
            <Step number="2" icon={GitCompare} title="Compare & analyze" description="Select up to 3 funds for a side-by-side breakdown. Get automatic insights on which has the highest return potential, lowest risk, and more." />
            <Step number="3" icon={Briefcase} title="Build & track portfolio" description="Save funds to your portfolio, set investment amounts, and watch simulated performance update in real time." />
          </div>
        </div>
      </section>

      {/* ── Differentiation ───────────────────────────────────────────── */}
      <section className="border-t border-border bg-surface-muted/50">
        <div className="mx-auto max-w-[1120px] px-6 py-20">
          <span className="label-eyebrow">Why Not Spreadsheets?</span>
          <h2 className="mt-3 text-3xl font-medium tracking-tight text-foreground">
            Structured data, not scattered files.
          </h2>
          <p className="mt-3 max-w-lg text-sm text-muted-foreground">
            Manual research means copying numbers into spreadsheets, guessing at
            comparisons, and missing critical signals. Aethelgard replaces all of
            that with purpose-built tools.
          </p>

          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            <DiffCard
              icon={Zap}
              title="Faster than manual research"
              detail="Side-by-side comparisons in seconds, not hours of copy-pasting between PDFs and spreadsheets."
            />
            <DiffCard
              icon={Eye}
              title="Clearer than raw data"
              detail="Insights are generated automatically — risk flags, consistency scores, and concentration warnings you'd miss on your own."
            />
            <DiffCard
              icon={Target}
              title="More actionable than a spreadsheet"
              detail="Every feature is built for one thing: helping you decide. No formatting, no formulas, no maintenance."
            />
          </div>
        </div>
      </section>

      {/* ── Before vs After ───────────────────────────────────────────── */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-[1120px] px-6 py-20">
          <span className="label-eyebrow">Before & After</span>
          <h2 className="mt-3 text-3xl font-medium tracking-tight text-foreground">
            From scattered to structured.
          </h2>

          <div className="mt-12 grid gap-8 md:grid-cols-2">
            {/* Before */}
            <div className="rounded-lg border border-risk-high/20 bg-risk-high/5 p-8">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-risk-high">
                <X className="size-4" />
                Before
              </h3>
              <ul className="mt-6 space-y-4">
                <PainPoint label="Messy spreadsheets" detail="Fund data copied by hand, never up to date" />
                <PainPoint label="Scattered PDFs" detail="Offering memos, quarterly reports, and fact sheets in different places" />
                <PainPoint label="Hard-to-compare data" detail="No side-by-side view, manual calculation for every metric" />
                <PainPoint label="No risk signals" detail="Volatility and concentration go unnoticed until it's too late" />
              </ul>
            </div>

            {/* After */}
            <div className="rounded-lg border border-risk-low/20 bg-risk-low/5 p-8">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-risk-low">
                <CheckCircle2 className="size-4" />
                After
              </h3>
              <ul className="mt-6 space-y-4">
                <GainPoint label="Clean comparisons" detail="Select funds, see differences instantly — highlighted automatically" />
                <GainPoint label="Structured insights" detail="Risk flags, consistency scores, and concentration warnings generated for you" />
                <GainPoint label="Faster decisions" detail="From browsing to comparing to deciding in minutes, not days" />
                <GainPoint label="Portfolio tracking" detail="Simulated performance, live NAV, and diversification analysis in one view" />
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── Use Cases ─────────────────────────────────────────────────── */}
      <section className="border-t border-border bg-surface-muted/50">
        <div className="mx-auto max-w-[1120px] px-6 py-20">
          <span className="label-eyebrow">Who Is This For</span>
          <h2 className="mt-3 text-3xl font-medium tracking-tight text-foreground">
            Built for anyone evaluating private investments.
          </h2>

          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            <UseCase
              icon={Users}
              title="Individual investors"
              description="Exploring private markets for the first time. Get matched to funds that fit your goals and risk tolerance without needing a team of analysts."
            />
            <UseCase
              icon={BarChart3}
              title="Analysts"
              description="Comparing multiple funds across vintages and strategies. Side-by-side comparisons and trust scores replace hours of manual research."
            />
            <UseCase
              icon={Target}
              title="Decision-makers"
              description="Who want structured investment decisions. Insights, alerts, and portfolio analysis give you the clarity to commit with confidence."
            />
          </div>
        </div>
      </section>

      {/* ── Trust & Credibility ────────────────────────────────────────── */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-[1120px] px-6 py-20">
          <span className="label-eyebrow">Built for Confidence</span>
          <h2 className="mt-3 text-3xl font-medium tracking-tight text-foreground">
            Designed for clarity, not complexity.
          </h2>

          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            <TrustCard statement="Structured data, not scattered spreadsheets" />
            <TrustCard statement="Transparent scoring — every metric is explainable" />
            <TrustCard statement="Rule-based insights — no black-box AI" />
          </div>

          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatBadge value="14" label="Funds analyzed" />
            <StatBadge value="4" label="Asset classes" />
            <StatBadge value="14" label="Fund managers" />
            <StatBadge value="8" label="Years of data" />
          </div>
        </div>
      </section>

      {/* ── Product Preview ───────────────────────────────────────────── */}
      <section className="border-t border-border bg-surface-muted/50">
        <div className="mx-auto max-w-[1120px] px-6 py-20">
          <span className="label-eyebrow">Product Preview</span>
          <h2 className="mt-3 text-3xl font-medium tracking-tight text-foreground">
            See it in action.
          </h2>

          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            <PreviewCard
              title="Comparison Table"
              description="Select up to 3 funds and see every metric side by side. Best values are highlighted automatically."
              link="/compare"
            />
            <PreviewCard
              title="Portfolio Dashboard"
              description="Track your investments with simulated performance, live NAV, and diversification analysis."
              link="/portfolio"
            />
            <PreviewCard
              title="Insights Panel"
              description="Rule-based insights flag risk, consistency, and concentration — so you see what the data means."
              link="/funds"
            />
          </div>
        </div>
      </section>

      {/* ── Final CTA ─────────────────────────────────────────────────── */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-[1120px] px-6 py-24 text-center">
          <h2 className="text-4xl font-medium tracking-tight text-foreground">
            Start making structured investment decisions.
          </h2>
          <p className="mx-auto mt-4 max-w-md text-pretty text-sm text-muted-foreground">
            Browse funds, compare side by side, and build your portfolio — all in
            one place. Free to start.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/funds"
              className="inline-flex items-center gap-2 rounded-md bg-foreground px-6 py-3 text-sm font-semibold text-background transition-opacity hover:opacity-90"
            >
              Start Comparing Funds <ArrowRight className="size-4" />
            </Link>
            <Link
              to="/portfolio"
              className="inline-flex items-center gap-2 rounded-md border border-border bg-surface px-6 py-3 text-sm font-medium text-foreground transition-colors hover:border-foreground"
            >
              Build Your Portfolio
            </Link>
            <Link
              to="/funds"
              className="inline-flex items-center gap-2 rounded-md border border-border bg-surface px-6 py-3 text-sm font-medium text-foreground transition-colors hover:border-foreground"
            >
              Explore Insights
            </Link>
          </div>
        </div>
      </section>

      {/* ── Feature Requests & Early Access ────────────────────────────── */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-[1120px] px-6 py-20">
          <div className="grid gap-10 lg:grid-cols-2">
            <FeatureRequests />
            <div className="flex flex-col gap-6">
              <EarlyAccess />
              <InviteReferral />
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────── */}
      <footer className="border-t border-border bg-surface-muted/50">
        <div className="mx-auto max-w-[1120px] px-6 py-12">
          <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
            <div className="max-w-xs">
              <div className="flex items-center gap-2">
                <div className="size-4 rounded-sm bg-primary" aria-hidden />
                <span className="text-sm font-semibold uppercase tracking-tight">
                  Aethelgard / Capital
                </span>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                Built for clarity in private investing. Structured data,
                intelligent insights, and portfolio tracking — designed to
                replace scattered research with confident decisions.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
              <div>
                <h4 className="label-eyebrow mb-3">Platform</h4>
                <ul className="space-y-2">
                  <li><Link to="/funds" className="text-xs text-muted-foreground transition-colors hover:text-foreground">Funds</Link></li>
                  <li><Link to="/compare" className="text-xs text-muted-foreground transition-colors hover:text-foreground">Compare</Link></li>
                  <li><Link to="/portfolio" className="text-xs text-muted-foreground transition-colors hover:text-foreground">Portfolio</Link></li>
                  <li><Link to="/recommend" className="text-xs text-muted-foreground transition-colors hover:text-foreground">Recommend</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="label-eyebrow mb-3">Account</h4>
                <ul className="space-y-2">
                  <li><Link to="/pricing" className="text-xs text-muted-foreground transition-colors hover:text-foreground">Pricing</Link></li>
                  <li><Link to="/pricing" className="text-xs text-muted-foreground transition-colors hover:text-foreground">Upgrade</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="label-eyebrow mb-3">About</h4>
                <ul className="space-y-2">
                  <li><span className="text-xs text-muted-foreground">Structured data, not spreadsheets</span></li>
                  <li><span className="text-xs text-muted-foreground">Rule-based insights</span></li>
                  <li><span className="text-xs text-muted-foreground">Transparent scoring</span></li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-10 border-t border-border pt-6">
            <p className="text-[11px] text-muted-foreground">
              Built for clarity in private investing. Simulated data for demonstration purposes.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

// ── Sub-components ──────────────────────────────────────────────────────────

function Advantage({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-surface p-6">
      <div className="flex size-9 items-center justify-center rounded-md border border-border bg-background">
        <Icon className="size-4 text-foreground" />
      </div>
      <h3 className="mt-4 text-sm font-semibold text-foreground">{title}</h3>
      <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

function Step({
  number,
  icon: Icon,
  title,
  description,
}: {
  number: string;
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-full border border-border bg-surface font-mono text-sm font-semibold text-foreground">
          {number}
        </div>
        <div className="flex size-8 items-center justify-center rounded-md border border-border bg-background">
          <Icon className="size-4 text-foreground" />
        </div>
      </div>
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      <p className="text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

function DiffCard({
  icon: Icon,
  title,
  detail,
}: {
  icon: React.ElementType;
  title: string;
  detail: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-surface p-6">
      <Icon className="size-5 text-foreground" />
      <h3 className="mt-4 text-sm font-semibold text-foreground">{title}</h3>
      <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">
        {detail}
      </p>
    </div>
  );
}

function PainPoint({ label, detail }: { label: string; detail: string }) {
  return (
    <li className="flex items-start gap-3">
      <X className="mt-0.5 size-4 shrink-0 text-risk-high" />
      <div>
        <span className="text-sm font-medium text-foreground">{label}</span>
        <p className="mt-0.5 text-[12px] text-muted-foreground">{detail}</p>
      </div>
    </li>
  );
}

function GainPoint({ label, detail }: { label: string; detail: string }) {
  return (
    <li className="flex items-start gap-3">
      <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-risk-low" />
      <div>
        <span className="text-sm font-medium text-foreground">{label}</span>
        <p className="mt-0.5 text-[12px] text-muted-foreground">{detail}</p>
      </div>
    </li>
  );
}

function UseCase({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-surface p-6">
      <Icon className="size-5 text-foreground" />
      <h3 className="mt-4 text-sm font-semibold text-foreground">{title}</h3>
      <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

function TrustCard({ statement }: { statement: string }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-border bg-surface p-5">
      <ShieldCheck className="mt-0.5 size-4 shrink-0 text-foreground" />
      <span className="text-sm font-medium text-foreground">{statement}</span>
    </div>
  );
}

function StatBadge({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-lg border border-border bg-surface px-4 py-4 text-center">
      <div className="font-mono text-2xl font-medium text-foreground">{value}</div>
      <div className="mt-1 text-[11px] text-muted-foreground">{label}</div>
    </div>
  );
}

function PreviewCard({
  title,
  description,
  link,
}: {
  title: string;
  description: string;
  link: string;
}) {
  return (
    <Link
      to={link}
      className="group rounded-lg border border-border bg-surface p-6 transition-colors hover:border-foreground"
    >
      <div className="flex h-32 items-center justify-center rounded-md border border-dashed border-border bg-surface-muted">
        <BarChart3 className="size-8 text-muted-foreground/40" />
      </div>
      <h3 className="mt-4 text-sm font-semibold text-foreground group-hover:underline">
        {title}
      </h3>
      <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">
        {description}
      </p>
      <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-foreground">
        Try it <ArrowRight className="size-3" />
      </span>
    </Link>
  );
}

export default Landing;
