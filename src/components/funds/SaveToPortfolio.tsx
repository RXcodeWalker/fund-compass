import { useState } from "react";
import { Bookmark, Check } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { usePortfolio } from "@/hooks/usePortfolio";
import { formatCurrency, type Fund } from "@/data/funds";

interface Props {
  fund: Fund;
  variant?: "default" | "compact" | "ghost";
  className?: string;
}

const todayISO = () => new Date().toISOString().slice(0, 10);

export function SaveToPortfolio({ fund, variant = "default", className }: Props) {
  const { has, add, remove } = usePortfolio();
  const inPortfolio = has(fund.id);
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState<number>(fund.minInvestment);
  const [startDate, setStartDate] = useState<string>(todayISO());

  const handleClick = () => {
    if (inPortfolio) {
      remove(fund.id);
      toast.success(`${fund.name} removed from portfolio`);
      return;
    }
    setAmount(fund.minInvestment);
    setStartDate(todayISO());
    setOpen(true);
  };

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    add({ fundId: fund.id, amount: Math.max(0, amount), startDate });
    setOpen(false);
    toast.success("Added to portfolio", {
      description: `${fund.name} · ${formatCurrency(Math.max(0, amount))}`,
    });
  };

  const baseClasses =
    variant === "compact"
      ? "inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-[11px] font-medium transition-colors"
      : variant === "ghost"
      ? "inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-medium transition-colors"
      : "machined-edge inline-flex items-center gap-2 rounded-md px-4 py-2 text-xs font-medium transition-all";

  const stateClasses = inPortfolio
    ? variant === "ghost"
      ? "text-foreground hover:bg-surface-muted"
      : "border-foreground bg-foreground text-background"
    : variant === "ghost"
    ? "text-muted-foreground hover:text-foreground"
    : "border border-border bg-surface text-foreground hover:border-foreground";

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        aria-pressed={inPortfolio}
        className={[baseClasses, stateClasses, className ?? ""].join(" ")}
      >
        {inPortfolio ? <Check className="size-3.5" strokeWidth={3} /> : <Bookmark className="size-3.5" />}
        {inPortfolio ? "In portfolio" : "Save to portfolio"}
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-medium tracking-tight">
              Add to portfolio
            </DialogTitle>
            <DialogDescription className="font-mono text-[11px] text-muted-foreground">
              {fund.ticker} · {fund.name}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleConfirm} className="flex flex-col gap-5 pt-2">
            <div className="flex flex-col gap-2">
              <label className="label-eyebrow" htmlFor="pf-amount">
                Investment amount (USD)
              </label>
              <div className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2.5 focus-within:border-foreground">
                <span className="font-mono text-sm text-muted-foreground">$</span>
                <input
                  id="pf-amount"
                  type="number"
                  min={0}
                  step={1000}
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value) || 0)}
                  className="w-full bg-transparent font-mono text-sm text-foreground outline-none"
                  required
                />
              </div>
              <p className="font-mono text-[10px] text-muted-foreground">
                Suggested minimum: {formatCurrency(fund.minInvestment)}
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <label className="label-eyebrow" htmlFor="pf-date">
                Start date <span className="lowercase tracking-normal text-muted-foreground/70">(optional)</span>
              </label>
              <input
                id="pf-date"
                type="date"
                value={startDate}
                max={todayISO()}
                onChange={(e) => setStartDate(e.target.value || todayISO())}
                className="rounded-md border border-border bg-background px-3 py-2.5 font-mono text-sm text-foreground outline-none focus:border-foreground"
              />
            </div>

            <DialogFooter className="gap-2 sm:gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-md border border-border bg-surface px-4 py-2 text-xs font-medium text-foreground transition-colors hover:bg-surface-muted"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-md bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90"
              >
                Add to portfolio
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
