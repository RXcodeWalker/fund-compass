import { Link } from "react-router-dom";
import { BookmarkCheck, Trash2, Share2 } from "lucide-react";
import { useGrowth } from "@/hooks/useGrowth";
import { funds } from "@/data/funds";
import { toast } from "sonner";

export function SavedComparisons() {
  const { savedComparisons, removeComparison } = useGrowth();

  if (savedComparisons.length === 0) return null;

  return (
    <div className="mb-6">
      <h3 className="label-eyebrow mb-3">Saved Comparisons</h3>
      <div className="flex flex-col gap-2">
        {savedComparisons.map((comp) => {
          const ids = comp.fundIds.join(",");
          const shareUrl = `/compare/${ids}?shared=1`;
          const fundNames = comp.fundIds
            .map((id) => funds.find((f) => f.id === id)?.name ?? id)
            .join(" vs ");

          return (
            <div
              key={comp.id}
              className="flex items-center gap-3 rounded-md border border-border bg-surface px-4 py-3"
            >
              <BookmarkCheck className="size-4 shrink-0 text-foreground" />
              <div className="flex-1 min-w-0">
                <Link
                  to={`/compare/${ids}`}
                  className="text-sm font-medium text-foreground transition-colors hover:underline"
                >
                  {fundNames}
                </Link>
                <p className="font-mono text-[10px] text-muted-foreground">
                  {comp.fundIds.length} funds · saved {new Date(comp.savedAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(
                        `${window.location.origin}${shareUrl}`
                      );
                      toast.success("Share link copied");
                    } catch {
                      toast.error("Could not copy link");
                    }
                  }}
                  className="rounded p-1.5 text-muted-foreground transition-colors hover:text-foreground"
                  title="Copy share link"
                >
                  <Share2 className="size-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => removeComparison(comp.id)}
                  className="rounded p-1.5 text-muted-foreground transition-colors hover:text-risk-high"
                  title="Remove saved comparison"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
