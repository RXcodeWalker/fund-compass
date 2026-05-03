import { relativeTime } from "@/lib/simulation";

interface Props {
  date: Date;
  className?: string;
}

export function LastUpdated({ date, className = "" }: Props) {
  return (
    <span className={`inline-flex items-center gap-1.5 font-mono text-[10px] text-muted-foreground ${className}`}>
      <span className="size-1.5 rounded-full bg-risk-low animate-pulse" />
      Updated {relativeTime(date)}
    </span>
  );
}
