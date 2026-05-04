import { useState } from "react";
import { MessageSquare, X, Send } from "lucide-react";
import { useFeedback } from "@/hooks/useFeedback";
import { toast } from "sonner";

type FeedbackType = "confusing" | "missing" | "like" | "general";

const feedbackOptions: { type: FeedbackType; label: string }[] = [
  { type: "confusing", label: "What's confusing?" },
  { type: "missing", label: "What's missing?" },
  { type: "like", label: "What do you like?" },
  { type: "general", label: "Other feedback" },
];

export function FeedbackWidget() {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<FeedbackType>("general");
  const [text, setText] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const { submitFeedback } = useFeedback();

  const handleSubmit = () => {
    if (!text.trim()) return;
    submitFeedback(type, text.trim());
    setText("");
    setSubmitted(true);
    toast.success("Thanks for your feedback!");
    setTimeout(() => {
      setSubmitted(false);
      setOpen(false);
    }, 1500);
  };

  return (
    <>
      {/* Floating button */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex size-11 items-center justify-center rounded-full border border-border bg-surface shadow-[var(--shadow-elevated)] transition-all hover:border-foreground"
        aria-label="Send feedback"
      >
        <MessageSquare className="size-4 text-foreground" />
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-end p-6 sm:items-center sm:justify-center">
          <div
            className="absolute inset-0 bg-background/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="relative w-full max-w-sm rounded-lg border border-border bg-surface p-5 shadow-[var(--shadow-elevated)]">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute right-3 top-3 rounded p-1 text-muted-foreground transition-colors hover:text-foreground"
            >
              <X className="size-4" />
            </button>

            {submitted ? (
              <div className="py-8 text-center">
                <div className="mx-auto mb-3 flex size-10 items-center justify-center rounded-full border border-risk-low/30 bg-risk-low/10">
                  <MessageSquare className="size-5 text-risk-low" />
                </div>
                <p className="text-sm font-medium text-foreground">Thanks for your feedback!</p>
                <p className="mt-1 text-[12px] text-muted-foreground">
                  It helps us improve the platform.
                </p>
              </div>
            ) : (
              <>
                <h3 className="text-sm font-semibold text-foreground">Send feedback</h3>
                <p className="mt-1 text-[12px] text-muted-foreground">
                  Quick and anonymous. Help us make Aethelgard better.
                </p>

                {/* Type selector */}
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {feedbackOptions.map((opt) => (
                    <button
                      key={opt.type}
                      type="button"
                      onClick={() => setType(opt.type)}
                      className={[
                        "rounded-full border px-3 py-1 text-[11px] font-medium transition-colors",
                        type === opt.type
                          ? "border-foreground bg-foreground text-background"
                          : "border-border bg-surface text-foreground hover:border-foreground",
                      ].join(" ")}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                {/* Text input */}
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder={
                    type === "confusing"
                      ? "What was hard to understand?"
                      : type === "missing"
                        ? "What feature or data is missing?"
                        : type === "like"
                          ? "What's working well for you?"
                          : "Tell us what you think..."
                  }
                  rows={3}
                  className="mt-3 w-full resize-none rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none"
                />

                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!text.trim()}
                  className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-md bg-foreground px-4 py-2 text-xs font-semibold text-background transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Send className="size-3" />
                  Send feedback
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
