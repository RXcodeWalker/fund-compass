import { useState } from "react";
import { Mail, CircleCheck as CheckCircle2 } from "lucide-react";
import { useFeedback } from "@/hooks/useFeedback";
import { toast } from "sonner";

export function EarlyAccess() {
  const { submitEarlyAccess, hasEarlyAccess } = useFeedback();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(hasEarlyAccess);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) {
      toast.error("Enter a valid email");
      return;
    }
    const ok = submitEarlyAccess(email.trim());
    if (ok) {
      setSubmitted(true);
      setEmail("");
      toast.success("You're on the list!");
    } else {
      toast.error("That email is already registered");
    }
  };

  return (
    <div className="machined-edge rounded-lg border border-border bg-surface p-5">
      <div className="flex items-start gap-3">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-full border border-border bg-background">
          <Mail className="size-4 text-foreground" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-foreground">
            Want early access to new features?
          </h3>
          <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
            Join the early access list and get new features before everyone else.
            Limited spots available.
          </p>

          {submitted ? (
            <div className="mt-3 flex items-center gap-2 text-xs text-risk-low">
              <CheckCircle2 className="size-3.5" />
              <span className="font-medium">You're on the list!</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-3 flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="flex-1 rounded-md border border-border bg-background px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none"
              />
              <button
                type="submit"
                className="rounded-md bg-foreground px-3 py-1.5 text-[11px] font-semibold text-background transition-opacity hover:opacity-90"
              >
                Join
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
