import { AlertTriangle, Info } from "lucide-react";
import type { RiskFlag } from "@/data/managers";

export function RiskFlagsList({ flags }: { flags: RiskFlag[] }) {
  if (!flags.length) {
    return (
      <div className="rounded-md border border-dashed border-border bg-surface px-4 py-6 text-center text-xs text-muted-foreground">
        No risk signals identified.
      </div>
    );
  }
  return (
    <ul className="flex flex-col gap-2">
      {flags.map((f) => {
        const Icon = f.kind === "warn" ? AlertTriangle : Info;
        const tone =
          f.kind === "warn"
            ? "border-risk-medium/40 text-foreground"
            : "border-border text-foreground";
        const iconTone =
          f.kind === "warn" ? "text-risk-medium" : "text-muted-foreground";
        return (
          <li
            key={f.label}
            className={`machined-edge flex items-start gap-3 rounded-md border bg-surface px-3.5 py-3 ${tone}`}
          >
            <Icon className={`mt-0.5 size-3.5 shrink-0 ${iconTone}`} />
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-semibold">{f.label}</span>
              <span className="text-[11px] leading-relaxed text-muted-foreground">
                {f.detail}
              </span>
            </div>
          </li>
        );
      })}
    </ul>
  );
}