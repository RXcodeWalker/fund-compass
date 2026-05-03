import { Link } from "react-router-dom";
import { X } from "lucide-react";
import { useCompare } from "@/hooks/useCompare";
import { useSubscription } from "@/hooks/useSubscription";
import { funds } from "@/data/funds";

export function CompareBar() {
  const { selected, remove, clear, maxCompare } = useCompare();
  const { isFree } = useSubscription();
  if (selected.length === 0) return null;

  const items = selected
    .map((id) => funds.find((f) => f.id === id))
    .filter((f): f is (typeof funds)[number] => Boolean(f));

  const isAtLimit = selected.length >= maxCompare;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-40 flex justify-center px-4">
      <div className="machined-edge pointer-events-auto flex w-full max-w-3xl flex-wrap items-center gap-4 rounded-xl border border-border bg-primary p-4 text-primary-foreground shadow-[var(--shadow-elevated)]">
        <div className="flex flex-col">
          <span className="label-eyebrow text-primary-foreground/60">Comparing</span>
          <span className="font-mono text-sm">
            {selected.length} of {maxCompare} selected
          </span>
        </div>
        <div className="flex flex-1 flex-wrap gap-2">
          {items.map((fund) => (
            <span
              key={fund.id}
              className="inline-flex items-center gap-1.5 rounded-md border border-primary-foreground/15 bg-primary-foreground/5 px-2 py-1 text-xs"
            >
              {fund.name}
              <button
                type="button"
                onClick={() => remove(fund.id)}
                className="rounded p-0.5 transition-colors hover:bg-primary-foreground/10"
                aria-label={`Remove ${fund.name}`}
              >
                <X className="size-3" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex items-center gap-2">
          {isFree && isAtLimit && (
            <Link
              to="/pricing"
              className="rounded-md border border-primary-foreground/20 px-3 py-2 text-xs font-medium text-primary-foreground/80 transition-colors hover:text-primary-foreground"
            >
              Upgrade for more
            </Link>
          )}
          <button
            type="button"
            onClick={clear}
            className="rounded-md px-3 py-2 text-xs font-medium text-primary-foreground/70 transition-colors hover:text-primary-foreground"
          >
            Clear
          </button>
          <Link
            to="/compare"
            className="rounded-md bg-background px-4 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-surface-muted"
          >
            Compare {selected.length > 1 ? "now" : "→"}
          </Link>
        </div>
      </div>
    </div>
  );
}
