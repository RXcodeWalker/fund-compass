import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, GitCompare, Briefcase, X, ArrowRight, CircleCheck as CheckCircle2 } from "lucide-react";
import { useGrowth } from "@/hooks/useGrowth";
import { useFeedback, type UserIntent } from "@/hooks/useFeedback";

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

const intentOptions: { value: UserIntent; label: string; icon: React.ElementType }[] = [
  { value: "compare", label: "Compare funds", icon: GitCompare },
  { value: "learn", label: "Learn about private investments", icon: Search },
  { value: "track", label: "Track investments", icon: Briefcase },
];

export function Onboarding() {
  const { seenOnboarding, markOnboardingSeen } = useGrowth();
  const { userIntent, setUserIntent } = useFeedback();
  const [open, setOpen] = useState(!seenOnboarding);
  const [step, setStep] = useState<"intent" | "overview">(
    userIntent ? "overview" : "intent"
  );
  const [selectedIntent, setSelectedIntent] = useState<UserIntent>(userIntent);

  if (!open || seenOnboarding) return null;

  const handleClose = () => {
    setOpen(false);
    markOnboardingSeen();
  };

  const handleIntentSubmit = () => {
    if (selectedIntent) {
      setUserIntent(selectedIntent);
    }
    setStep("overview");
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

        {step === "intent" ? (
          <>
            <span className="label-eyebrow">Welcome to Aethelgard</span>
            <h2 className="mt-2 text-xl font-medium tracking-tight text-foreground">
              What are you trying to do?
            </h2>
            <p className="mt-1 text-[12px] text-muted-foreground">
              This helps us tailor your experience.
            </p>

            <div className="mt-6 space-y-2">
              {intentOptions.map((opt) => {
                const Icon = opt.icon;
                const active = selectedIntent === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setSelectedIntent(opt.value)}
                    className={[
                      "flex w-full items-center gap-3 rounded-md border px-4 py-3 text-left transition-colors",
                      active
                        ? "border-foreground bg-foreground/5"
                        : "border-border bg-surface hover:border-foreground",
                    ].join(" ")}
                  >
                    <Icon className={`size-4 ${active ? "text-foreground" : "text-muted-foreground"}`} />
                    <span className={`text-sm font-medium ${active ? "text-foreground" : "text-muted-foreground"}`}>
                      {opt.label}
                    </span>
                    {active && <CheckCircle2 className="ml-auto size-4 text-foreground" />}
                  </button>
                );
              })}
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                Skip for now
              </button>
              <button
                type="button"
                onClick={handleIntentSubmit}
                disabled={!selectedIntent}
                className="inline-flex items-center gap-1.5 rounded-md bg-foreground px-4 py-2 text-xs font-semibold text-background transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Continue <ArrowRight className="size-3" />
              </button>
            </div>
          </>
        ) : (
          <>
            <span className="label-eyebrow">Quick Overview</span>
            <h2 className="mt-2 text-xl font-medium tracking-tight text-foreground">
              Get started in 3 steps
            </h2>
            <p className="mt-1 text-[12px] text-muted-foreground">
              Here's what you can do on Aethelgard.
            </p>

            <ol className="mt-6 space-y-4">
              {steps.map((s, i) => {
                const Icon = s.icon;
                return (
                  <li key={s.title} className="flex items-start gap-3">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full border border-border bg-background font-mono text-xs font-semibold text-foreground">
                      {i + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Icon className="size-4 text-foreground" />
                        <span className="text-sm font-semibold text-foreground">{s.title}</span>
                      </div>
                      <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
                        {s.description}
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
          </>
        )}
      </div>
    </div>
  );
}
