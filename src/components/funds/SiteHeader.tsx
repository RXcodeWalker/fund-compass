import { Link, NavLink, useLocation } from "react-router-dom";
import { useCompare } from "@/hooks/useCompare";
import { usePortfolio } from "@/hooks/usePortfolio";
import { useSubscription } from "@/hooks/useSubscription";

const nav = [
  { to: "/funds", label: "Funds" },
  { to: "/recommend", label: "Recommend" },
  { to: "/compare", label: "Compare" },
  { to: "/portfolio", label: "Portfolio" },
  { to: "/scenarios", label: "Scenarios" },
  { to: "/pricing", label: "Pricing" },
  { to: "/analytics", label: "Analytics" },
];

export function SiteHeader() {
  const { selected } = useCompare();
  const { holdings } = usePortfolio();
  const { isPro, features } = useSubscription();
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-[1440px] items-center justify-between px-6">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="size-5 rounded-sm bg-primary" aria-hidden />
            <span className="text-sm font-semibold uppercase tracking-tight">
              ApexLedger
            </span>
          </Link>
          <div className="hidden h-4 w-px bg-border md:block" />
          <nav className="hidden items-center gap-6 text-[13px] font-medium md:flex">
            {nav.map((item) => {
              const active = item.to === "/funds" ? location.pathname === "/funds" || location.pathname.startsWith("/fund/") : location.pathname.startsWith(item.to);
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={
                    active
                      ? "text-foreground"
                      : "text-muted-foreground transition-colors hover:text-foreground"
                  }
                >
                  {item.label}
                  {item.label === "Compare" && selected.length > 0 && (
                    <span className="ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 font-mono text-[10px] text-primary-foreground">
                      {selected.length}
                    </span>
                  )}
                  {item.label === "Portfolio" && holdings.length > 0 && (
                    <span className="ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 font-mono text-[10px] text-primary-foreground">
                      {holdings.length}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 font-mono text-[11px] sm:flex">
            <span className="relative flex size-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-risk-low opacity-50" />
              <span className="relative inline-flex size-1.5 rounded-full bg-risk-low" />
            </span>
            Live · 14 funds
          </div>
          {isPro ? (
            <Link
              to="/pricing"
              className="hidden rounded-full border border-foreground/20 bg-foreground/5 px-3 py-1 text-[11px] font-semibold text-foreground transition-colors hover:bg-foreground/10 sm:inline-flex"
            >
              {features.label}
            </Link>
          ) : (
            <Link
              to="/pricing"
              className="hidden rounded-full bg-foreground px-3 py-1 text-[11px] font-semibold text-background transition-opacity hover:opacity-90 sm:inline-flex"
            >
              Upgrade
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
