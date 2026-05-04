import { Share2 } from "lucide-react";
import { toast } from "sonner";
import { funds } from "@/data/funds";
import { fmtUSD, fmtPct, summarizePortfolio } from "@/lib/portfolio";
import type { Holding } from "@/hooks/usePortfolio";

interface Props {
  holdings: Holding[];
}

export function SharePortfolio({ holdings }: Props) {
  const summary = summarizePortfolio(funds, holdings);
  const topFunds = holdings
    .map((h) => {
      const fund = funds.find((f) => f.id === h.fundId);
      return fund ? { name: fund.name, amount: h.amount } : null;
    })
    .filter(Boolean)
    .sort((a, b) => (b?.amount ?? 0) - (a?.amount ?? 0))
    .slice(0, 3);

  const shareText = [
    `My Aethelgard Portfolio`,
    `Value: ${fmtUSD(summary.totalCurrent)} | Return: ${fmtPct(summary.returnPct)}`,
    `Holdings: ${holdings.length} funds`,
    ...topFunds.map((f) => f ? `  - ${f.name} (${fmtUSD(f.amount)})` : []),
    "",
    "Build your own at aethelgard.capital",
  ].join("\n");

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: "My Aethelgard Portfolio",
          text: shareText,
        });
      } else {
        await navigator.clipboard.writeText(shareText);
        toast.success("Portfolio summary copied to clipboard");
      }
    } catch {
      try {
        await navigator.clipboard.writeText(shareText);
        toast.success("Portfolio summary copied to clipboard");
      } catch {
        toast.error("Could not share portfolio");
      }
    }
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-3 py-2 text-xs font-medium text-foreground transition-colors hover:border-foreground"
    >
      <Share2 className="size-3.5" />
      Share portfolio
    </button>
  );
}
