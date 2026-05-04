import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, GitCompare, Briefcase, X, ArrowRight } from "lucide-react";
import { useGrowth } from "@/hooks/useGrowth";

const steps = [
  {
    icon: Search,
    title: "Discover funds",
    description: "Browse 14 private investment funds across venture capital, private equity, real estate, and private debt.",
    action: { label: "Browse funds", to: "/funds" },
  },
  {
    icon: GitCompare,
    title: "Compare & analyze",
    description: "Select up to 3 funds for a side-by-side breakdown with automatic insights on risk, return, and more.",
    action: { label: "Start comparing", to: "/compare" },
  },
  {
    icon: Briefcase,
    title: "Build your portfolio",
    description: "Save funds, set investment amounts, and track simulated performance with live-updating calculations.",
    action: { label: "Go to portfolio", to: "/portfolio" },
  },
];

export function Onboarding() {
  const { seenOnboarding, markOnboardingSeen } = useGrowth();
  const [open, setOpen] = useState(!seenOnboarding);

  if (!open || seenOnboarding) return null;

  const handleClose = () => {
    setOpen(false);
    markOnboardingSeen();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="relative mx-4 w-full max-w-md rounded-lg border border-border bg-surface p-6 shadow-[var(--shadow-elevated)]">
        <button
          type="button"
          onClick={handleClose}
          className="absolute right-3 top-3 rounded p-1 text-muted-foreground transition-colors hover:text-foreground"
        >
          <X className="size-4" />
        </button>

        <span className="label-eyebrow">Welcome to Aethelgard</span>
        <h2 className="mt-2 text-xl font-medium tracking-tight text-foreground">
          Get started in 3 steps
        </h2>
        <p className="mt-1 text-[12px] text-muted-foreground">
          A quick overview of what you can do here.
        </p>

        <ol className="mt-6 space-y-4">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <li key={step.title} className="flex items-start gap-3">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full border border-border bg-background font-mono text-xs font-semibold text-foreground">
                  {i + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Icon className="size-4 text-foreground" />
                    <span className="text-sm font-semibold text-foreground">{step.title}</span>
                  </div>
                  <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>

        <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
          <button
            type="button"
            onClick={handleClose}
            className="text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            Skip for now
          </button>
          <Link
            to="/funds"
            onClick={handleClose}
            className="inline-flex items-center gap-1.5 rounded-md bg-foreground px-4 py-2 text-xs font-semibold text-background transition-opacity hover:opacity-90"
          >
            Get started <ArrowRight className="size-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
