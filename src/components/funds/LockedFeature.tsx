import { Link } from "react-router-dom";
import { Lock } from "lucide-react";

interface Props {
  feature: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Wraps premium content with a blur overlay and lock icon.
 * When the user is on the free tier, the content is blurred
 * and an upgrade prompt is shown.
 */
export function LockedFeature({ feature, children, className = "" }: Props) {
  return (
    <div className={`relative ${className}`}>
      {children}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-lg bg-background/60 backdrop-blur-[3px]">
        <div className="flex size-10 items-center justify-center rounded-full border border-border bg-surface">
          <Lock className="size-4 text-muted-foreground" />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-foreground">{feature}</p>
          <p className="mt-1 text-[12px] text-muted-foreground">Pro plan required</p>
        </div>
        <Link
          to="/pricing"
          className="rounded-md bg-foreground px-4 py-2 text-xs font-semibold text-background transition-opacity hover:opacity-90"
        >
          Upgrade to unlock
        </Link>
      </div>
    </div>
  );
}
