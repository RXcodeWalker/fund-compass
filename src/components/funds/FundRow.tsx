import { Link } from "react-router-dom";
import { Check } from "lucide-react";
import type { Fund } from "@/data/funds";
import { useCompare, MAX_COMPARE } from "@/hooks/useCompare";
import { RiskMeter } from "./RiskMeter";
import { SaveToPortfolio } from "./SaveToPortfolio";

interface Props {
  fund: Fund;
}

export function FundRow({ fund }: Props) {
  const { isSelected, toggle, isFull } = useCompare();
  const checked = isSelected(fund.id);
  const disabled = !checked && isFull;

  return (
    <div className="machined-edge group grid grid-cols-[40px_1.6fr_1fr_1.1fr_1fr_200px] items-center gap-4 rounded-md border border-border bg-surface px-4 py-4 transition-all hover:border-border-strong hover:shadow-sm">
      <button
        type="button"
        onClick={() => toggle(fund.id)}
        disabled={disabled}
        aria-pressed={checked}
        aria-label={`Compare ${fund.name}`}
        title={disabled ? `Maximum ${MAX_COMPARE} funds` : "Toggle compare"}
        className={[
          "flex size-5 items-center justify-center rounded-sm border transition-all",
          checked
            ? "border-primary bg-primary text-primary-foreground"
            : "border-border-strong bg-background hover:border-foreground",
          disabled ? "cursor-not-allowed opacity-40" : "cursor-pointer",
        ].join(" ")}
      >
        {checked && <Check className="size-3.5" strokeWidth={3} />}
      </button>

      <Link to={`/fund/${fund.id}`} className="flex flex-col gap-0.5">
        <span className="text-sm font-semibold tracking-tight text-foreground transition-colors group-hover:text-foreground">
          {fund.name}
        </span>
        <span className="font-mono text-[11px] text-muted-foreground">
          {fund.ticker} · {fund.strategy}
        </span>
      </Link>

      <span className="text-xs font-medium text-muted-foreground">{fund.type}</span>

      <RiskMeter risk={fund.risk} score={fund.riskScore} />

      <span className="font-mono text-sm font-medium text-foreground">
        {fund.returnMin}–{fund.returnMax}%
      </span>

      <div className="flex justify-end gap-2">
        <SaveToPortfolio fund={fund} variant="compact" />
        <Link
          to={`/fund/${fund.id}`}
          className="rounded-md border border-border px-3 py-1.5 text-[11px] font-medium text-foreground transition-colors hover:bg-surface-muted"
        >
          Details
        </Link>
      </div>
    </div>
  );
}