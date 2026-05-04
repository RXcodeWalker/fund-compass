import { Share2 } from "lucide-react";
import { toast } from "sonner";

interface Props {
  title: string;
  detail: string;
  source?: string;
  className?: string;
}

export function ShareInsight({ title, detail, source, className = "" }: Props) {
  const shareText = [
    title,
    detail,
    source ? `Source: ${source}` : "",
    "",
    "Insight from Aethelgard Capital",
  ].filter(Boolean).join("\n");

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title,
          text: shareText,
        });
      } else {
        await navigator.clipboard.writeText(shareText);
        toast.success("Insight copied to clipboard");
      }
    } catch {
      try {
        await navigator.clipboard.writeText(shareText);
        toast.success("Insight copied to clipboard");
      } catch {
        toast.error("Could not share insight");
      }
    }
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      className={`inline-flex items-center gap-1 rounded p-1 text-muted-foreground transition-colors hover:text-foreground ${className}`}
      title="Share this insight"
    >
      <Share2 className="size-3" />
    </button>
  );
}
