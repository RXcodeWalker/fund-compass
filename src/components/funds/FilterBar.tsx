import { fundTypes, riskLevels, type FundType, type RiskLevel } from "@/data/funds";

export interface FilterState {
  type: "All" | FundType;
  risk: "All" | RiskLevel;
  minReturn: number;
  minTrust: number;
}

interface Props {
  value: FilterState;
  onChange: (next: FilterState) => void;
  resultCount: number;
}

const Segmented = <T extends string>({
  options,
  value,
  onChange,
}: {
  options: T[];
  value: T;
  onChange: (v: T) => void;
}) => (
  <div className="flex h-10 items-center gap-1 rounded-lg border border-border bg-surface p-1">
    {options.map((opt) => {
      const active = opt === value;
      return (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={[
            "rounded-[6px] px-3 py-1.5 text-xs font-medium transition-colors",
            active
              ? "bg-surface-muted text-foreground"
              : "text-muted-foreground hover:text-foreground",
          ].join(" ")}
        >
          {opt}
        </button>
      );
    })}
  </div>
);

export function FilterBar({ value, onChange, resultCount }: Props) {
  return (
    <section className="mb-8 flex flex-wrap items-end gap-6 border-b border-border pb-8">
      <div className="flex flex-col gap-2">
        <label className="label-eyebrow">Fund Type</label>
        <Segmented
          options={["All", ...fundTypes] as const}
          value={value.type}
          onChange={(v) => onChange({ ...value, type: v })}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="label-eyebrow">Risk Level</label>
        <Segmented
          options={["All", ...riskLevels] as const}
          value={value.risk}
          onChange={(v) => onChange({ ...value, risk: v })}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="label-eyebrow" htmlFor="min-return">
          Min Expected Return
        </label>
        <div className="flex h-10 w-56 items-center gap-3 rounded-lg border border-border bg-surface px-3">
          <input
            id="min-return"
            type="range"
            min={0}
            max={25}
            step={1}
            value={value.minReturn}
            onChange={(e) => onChange({ ...value, minReturn: Number(e.target.value) })}
            className="flex-1 accent-foreground"
          />
          <span className="font-mono text-sm tabular-nums text-foreground">
            {value.minReturn}%
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="label-eyebrow" htmlFor="min-trust">
          Min Trust Score
        </label>
        <div className="flex h-10 w-56 items-center gap-3 rounded-lg border border-border bg-surface px-3">
          <input
            id="min-trust"
            type="range"
            min={0}
            max={100}
            step={5}
            value={value.minTrust}
            onChange={(e) => onChange({ ...value, minTrust: Number(e.target.value) })}
            className="flex-1 accent-foreground"
          />
          <span className="font-mono text-sm tabular-nums text-foreground">
            {value.minTrust}
          </span>
        </div>
      </div>

      <div className="ml-auto flex flex-col items-end gap-1">
        <span className="label-eyebrow">Results</span>
        <span className="font-mono text-2xl font-light tracking-tight text-foreground">
          {resultCount.toString().padStart(2, "0")}
        </span>
      </div>
    </section>
  );
}