import { Link } from "react-router-dom";
import { Lock } from "lucide-react";

interface Props {
  feature: string;
  description?: string;
  compact?: boolean;
  className?: string;
}

/**
 * Inline upgrade prompt shown when a free user hits a feature limit
 * or tries to access premium functionality.
 */
export function UpgradePrompt({ feature, description, compact = false, className = "" }: Props) {
  if (compact) {
    return (
      <div className={`flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-2 ${className}`}>
        <Lock className="size-3 text-muted-foreground" />
        <span className="text-xs text-muted-foreground">{feature}</span>
        <Link
          to="/pricing"
          className="ml-auto text-xs font-semibold text-foreground underline-offset-4 transition-colors hover:underline"
        >
          Upgrade
        </Link>
      </div>
    );
  }

  return (
    <div className={`machined-edge rounded-lg border border-border bg-surface p-5 ${className}`}>
      <div className="flex items-start gap-3">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-full border border-border bg-background">
          <Lock className="size-3.5 text-muted-foreground" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-foreground">{feature}</h3>
          {description && (
            <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
              {description}
            </p>
          )}
          <Link
            to="/pricing"
            className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-foreground px-3 py-1.5 text-xs font-semibold text-background transition-opacity hover:opacity-90"
          >
            Upgrade to Pro
          </Link>
        </div>
      </div>
    </div>
  );
}
