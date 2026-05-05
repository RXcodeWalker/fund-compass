import { useState } from "react";
import { Shield, TriangleAlert as AlertTriangle, Eye, FileText, ChevronDown, ChevronUp, CircleHelp as HelpCircle } from "lucide-react";
import { funds, type Fund } from "@/data/funds";
import {
  getRegulatoryProfile,
  getPortfolioRegulatorySummary,
  educationalContent,
  type RegulatoryProfile,
  type TransparencyLevel,
  type RegulatoryRiskFlag,
} from "@/lib/regulatory";

// ─── Main Regulatory Summary ────────────────────────────────────────────────

export function RegulatorySummary({ fund }: { fund: Fund }) {
  const profile = getRegulatoryProfile(fund);

  return (
    <div className="flex flex-col gap-4">
      {/* Confidence score + status row */}
      <div className="machined-edge grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-4">
        <RegulatoryScoreCard score={profile.regulatoryConfidence} />
        <StatusCard label="Reporting" value={profile.reportingStatus} />
        <StatusCard label="Transparency" value={profile.transparencyLevel} />
        <StatusCard label="Frequency" value={profile.reportingFrequency} />
      </div>

      {/* Component bars */}
      <div className="machined-edge rounded-lg border border-border bg-surface p-5">
        <h3 className="label-eyebrow mb-4">Confidence Breakdown</h3>
        <div className="flex flex-col gap-3">
          <ComponentBar
            label="Data availability"
            value={profile.dataAvailability}
            description="How much verifiable data is accessible"
          />
          <ComponentBar
            label="Reporting consistency"
            value={profile.reportingConsistency}
            description="Reliability and regularity of disclosures"
          />
          <ComponentBar
            label="Projection reliance"
            value={100 - profile.projectionReliance}
            inverseLabel={`Projection reliance: ${profile.projectionReliance}%`}
            description="Lower projection reliance means more realized data"
          />
        </div>
      </div>

      {/* Key disclosures */}
      {profile.keyDisclosures.length > 0 && (
        <div className="machined-edge rounded-lg border border-border bg-surface p-5">
          <h3 className="label-eyebrow mb-3">Key Disclosure Highlights</h3>
          <ul className="flex flex-col gap-2">
            {profile.keyDisclosures.map((d, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <FileText className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
                <span className="text-sm text-foreground">{d}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Risk flags */}
      {profile.riskFlags.length > 0 && (
        <div className="machined-edge rounded-lg border border-border bg-surface p-5">
          <h3 className="label-eyebrow mb-3">Disclosure Risk Flags</h3>
          <div className="flex flex-col gap-2">
            {profile.riskFlags.map((flag) => (
              <RiskFlagCard key={flag.id} flag={flag} />
            ))}
          </div>
        </div>
      )}

      {/* Educational sections */}
      <EducationalSections />
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function RegulatoryScoreCard({ score }: { score: number }) {
  const tone =
    score >= 70 ? "text-risk-low" :
    score >= 45 ? "text-risk-medium" :
    "text-risk-high";
  const bg =
    score >= 70 ? "bg-risk-low/5" :
    score >= 45 ? "bg-risk-medium/5" :
    "bg-risk-high/5";

  return (
    <div className={`flex flex-col gap-1 bg-surface px-6 py-5 ${bg}`}>
      <span className="label-eyebrow flex items-center gap-1.5">
        <Shield className="size-3" />
        Regulatory Confidence
      </span>
      <span className={`text-2xl font-medium tracking-tight font-mono ${tone}`}>
        {score}
      </span>
      <span className="text-[10px] text-muted-foreground">out of 100</span>
    </div>
  );
}

function StatusCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 bg-surface px-6 py-5">
      <span className="label-eyebrow">{label}</span>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  );
}

function ComponentBar({
  label,
  value,
  inverseLabel,
  description,
}: {
  label: string;
  value: number;
  inverseLabel?: string;
  description: string;
}) {
  const color =
    value >= 70 ? "bg-risk-low" :
    value >= 45 ? "bg-risk-medium" :
    "bg-risk-high";

  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="text-sm text-foreground">{label}</span>
        <span className="font-mono text-xs text-muted-foreground">
          {inverseLabel ?? `${value}%`}
        </span>
      </div>
      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-border">
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${value}%` }}
        />
      </div>
      <p className="mt-1 text-[11px] text-muted-foreground">{description}</p>
    </div>
  );
}

function RiskFlagCard({ flag }: { flag: RegulatoryRiskFlag }) {
  const [expanded, setExpanded] = useState(false);

  const severityStyles: Record<string, string> = {
    high: "border-risk-high/30 bg-risk-high/5",
    medium: "border-risk-medium/30 bg-risk-medium/5",
    low: "border-border bg-surface",
  };

  const iconStyles: Record<string, string> = {
    high: "text-risk-high",
    medium: "text-risk-medium",
    low: "text-muted-foreground",
  };

  return (
    <div className={`rounded-md border px-4 py-3 ${severityStyles[flag.severity]}`}>
      <div className="flex items-center gap-2">
        <AlertTriangle className={`size-4 shrink-0 ${iconStyles[flag.severity]}`} />
        <span className="flex-1 text-sm font-medium text-foreground">{flag.label}</span>
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="rounded p-1 text-muted-foreground transition-colors hover:text-foreground"
          aria-label={expanded ? "Collapse explanation" : "Expand explanation"}
        >
          {expanded ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
        </button>
      </div>
      {expanded && (
        <p className="mt-2 pl-6 text-[12px] leading-relaxed text-muted-foreground">
          {flag.explanation}
        </p>
      )}
    </div>
  );
}

// ─── Educational Sections ────────────────────────────────────────────────────

function EducationalSections() {
  const [openKey, setOpenKey] = useState<string | null>(null);

  const sections = [
    educationalContent.regulatoryReporting,
    educationalContent.transparency,
    educationalContent.confidenceScore,
    educationalContent.projectionReliance,
  ];

  return (
    <div className="machined-edge rounded-lg border border-border bg-surface p-5">
      <h3 className="label-eyebrow mb-3 flex items-center gap-1.5">
        <HelpCircle className="size-3" />
        Understanding Regulatory Signals
      </h3>
      <div className="flex flex-col gap-1.5">
        {sections.map((section, i) => {
          const key = `edu-${i}`;
          const isOpen = openKey === key;
          return (
            <div key={key} className="rounded-md border border-border bg-background">
              <button
                type="button"
                onClick={() => setOpenKey(isOpen ? null : key)}
                className="flex w-full items-center justify-between px-3 py-2.5 text-left"
              >
                <span className="text-sm font-medium text-foreground">{section.question}</span>
                {isOpen ? (
                  <ChevronUp className="size-3.5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="size-3.5 text-muted-foreground" />
                )}
              </button>
              {isOpen && (
                <div className="border-t border-border px-3 py-3">
                  <p className="text-[12px] leading-relaxed text-muted-foreground">
                    {section.answer}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Compact variants for comparison and portfolio ──────────────────────────

export function RegulatoryConfidenceBadge({ fund }: { fund: Fund }) {
  const profile = getRegulatoryProfile(fund);
  const tone =
    profile.regulatoryConfidence >= 70 ? "bg-risk-low/10 text-risk-low" :
    profile.regulatoryConfidence >= 45 ? "bg-risk-medium/10 text-risk-medium" :
    "bg-risk-high/10 text-risk-high";

  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-mono text-[10px] font-medium ${tone}`}>
      <Shield className="size-2.5" />
      {profile.regulatoryConfidence}
    </span>
  );
}

export function TransparencyBadge({ fund }: { fund: Fund }) {
  const profile = getRegulatoryProfile(fund);
  const tone: Record<TransparencyLevel, string> = {
    High: "bg-risk-low/10 text-risk-low",
    Medium: "bg-risk-medium/10 text-risk-medium",
    Low: "bg-risk-high/10 text-risk-high",
  };

  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-mono text-[10px] font-medium ${tone[profile.transparencyLevel]}`}>
      <Eye className="size-2.5" />
      {profile.transparencyLevel}
    </span>
  );
}

// ─── Portfolio-level summary ─────────────────────────────────────────────────

export function PortfolioRegulatorySummary({ fundIds }: { fundIds: string[] }) {
  const fundList = fundIds
    .map((id) => funds.find((f) => f.id === id))
    .filter((f): f is Fund => Boolean(f));
  const summary = getPortfolioRegulatorySummary(fundList);

  if (fundList.length === 0) return null;

  return (
    <div className="machined-edge rounded-lg border border-border bg-surface p-5">
      <h3 className="label-eyebrow mb-4 flex items-center gap-1.5">
        <Shield className="size-3" />
        Regulatory Overview
      </h3>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div>
          <span className="text-[11px] text-muted-foreground">Avg. Confidence</span>
          <div className={`mt-1 font-mono text-lg font-medium ${
            summary.avgConfidence >= 70 ? "text-risk-low" :
            summary.avgConfidence >= 45 ? "text-risk-medium" :
            "text-risk-high"
          }`}>
            {summary.avgConfidence}
          </div>
        </div>
        <div>
          <span className="text-[11px] text-muted-foreground">Avg. Transparency</span>
          <div className="mt-1 font-mono text-lg font-medium text-foreground">
            {summary.avgTransparency}%
          </div>
        </div>
        <div>
          <span className="text-[11px] text-muted-foreground">High Disclosure</span>
          <div className="mt-1 font-mono text-lg font-medium text-risk-low">
            {summary.highDisclosureCount}
          </div>
        </div>
        <div>
          <span className="text-[11px] text-muted-foreground">Low Disclosure</span>
          <div className={`mt-1 font-mono text-lg font-medium ${
            summary.lowDisclosureCount > 0 ? "text-risk-high" : "text-risk-low"
          }`}>
            {summary.lowDisclosureCount}
          </div>
        </div>
      </div>

      {summary.insights.length > 0 && (
        <div className="mt-4 flex flex-col gap-2">
          {summary.insights.map((insight, i) => (
            <div key={i} className="flex items-start gap-2 rounded-md border border-border bg-background px-3 py-2">
              <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-risk-medium" />
              <span className="text-[12px] text-muted-foreground">{insight}</span>
            </div>
          ))}
        </div>
      )}

      {summary.flags.length > 0 && (
        <div className="mt-4 flex flex-col gap-1.5">
          <span className="text-[11px] font-medium text-muted-foreground">Active flags</span>
          {summary.flags.slice(0, 3).map((flag) => (
            <div key={flag.id} className="flex items-center gap-2 text-[12px]">
              <AlertTriangle className={`size-3 shrink-0 ${
                flag.severity === "high" ? "text-risk-high" :
                flag.severity === "medium" ? "text-risk-medium" :
                "text-muted-foreground"
              }`} />
              <span className="text-foreground">{flag.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
