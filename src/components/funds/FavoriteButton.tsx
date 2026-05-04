import { Star } from "lucide-react";
import { useGrowth } from "@/hooks/useGrowth";

interface Props {
  fundId: string;
  variant?: "default" | "compact";
  className?: string;
}

export function FavoriteButton({ fundId, variant = "default", className = "" }: Props) {
  const { isFavorite, toggleFavorite } = useGrowth();
  const active = isFavorite(fundId);

  return (
    <button
      type="button"
      onClick={() => toggleFavorite(fundId)}
      aria-pressed={active}
      title={active ? "Remove from favorites" : "Add to favorites"}
      className={[
        "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-[11px] font-medium transition-colors",
        active
          ? "border-foreground bg-foreground text-background"
          : "border-border bg-surface text-foreground hover:border-foreground",
        className,
      ].join(" ")}
    >
      <Star className={`size-3.5 ${active ? "fill-current" : ""}`} />
      {variant === "default" && (active ? "Favorited" : "Favorite")}
    </button>
  );
}
