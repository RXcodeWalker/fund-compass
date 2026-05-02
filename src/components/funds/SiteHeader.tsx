import { Link, NavLink, useLocation } from "react-router-dom";
import { useCompare } from "@/hooks/useCompare";

const nav = [
  { to: "/", label: "Funds" },
  { to: "/recommend", label: "Recommend" },
  { to: "/compare", label: "Compare" },
];

export function SiteHeader() {
  const { selected } = useCompare();
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-[1440px] items-center justify-between px-6">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="size-5 rounded-sm bg-primary" aria-hidden />
            <span className="text-sm font-semibold uppercase tracking-tight">
              Aethelgard / Capital
            </span>
          </Link>
          <div className="hidden h-4 w-px bg-border md:block" />
          <nav className="hidden items-center gap-6 text-[13px] font-medium md:flex">
            {nav.map((item) => {
              const active = item.to === "/" ? location.pathname === "/" : location.pathname.startsWith(item.to);
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
                </NavLink>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 font-mono text-[11px] sm:flex">
            <span className="size-1.5 rounded-full bg-risk-low" aria-hidden />
            Live data · 14 funds
          </div>
        </div>
      </div>
    </header>
  );
}