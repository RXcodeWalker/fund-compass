import { ShieldCheck } from "lucide-react";
import { trustTier } from "@/data/managers";

interface Props {
  score: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

const tierStyle: Record<string, string> = {
  Exceptional: "border-risk-low/40 text-risk-low",
  Strong: "border-risk-low/30 text-risk-low",
  Established: "border-border-strong text-foreground",
  Emerging: "border-risk-medium/40 text-risk-medium",
};

export function TrustBadge({ score, size = "sm", showLabel = true, className = "" }: Props) {
  const tier = trustTier(score);
  const style = tierStyle[tier];
  const sizing =
    size === "lg"
      ? "px-3 py-1.5 text-xs"
      : size === "md"
      ? "px-2.5 py-1 text-[11px]"
      : "px-2 py-0.5 text-[10px]";

  return (
    <span
      className={`machined-edge inline-flex items-center gap-1.5 rounded-full border bg-surface font-mono ${style} ${sizing} ${className}`}
      title={`Trust Score · ${tier}`}
    >
      <ShieldCheck className={size === "lg" ? "size-3.5" : "size-3"} strokeWidth={2.25} />
      <span className="tabular-nums">{score}</span>
      {showLabel && (
        <span className="text-muted-foreground">· {tier}</span>
      )}
    </span>
  );
}