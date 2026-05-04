import { useState } from "react";
import { ThumbsUp, ThumbsDown, X } from "lucide-react";
import { useFeedback } from "@/hooks/useFeedback";

interface Props {
  action: string;
  label?: string;
  className?: string;
}

export function QuickRating({ action, label, className = "" }: Props) {
  const { submitRating, hasRated } = useFeedback();
  const [visible, setVisible] = useState(true);
  const [showFollowUp, setShowFollowUp] = useState(false);
  const [followUp, setFollowUp] = useState("");
  const [rated, setRated] = useState(false);

  if (hasRated(action) || !visible || rated) return null;

  const handleRate = (useful: boolean) => {
    submitRating(action, useful);
    setRated(true);
    if (useful) {
      setVisible(false);
    } else {
      setShowFollowUp(true);
    }
  };

  const handleFollowUp = () => {
    submitRating(action, false, followUp.trim());
    setShowFollowUp(false);
    setVisible(false);
  };

  if (showFollowUp) {
    return (
      <div className={`rounded-md border border-border bg-surface px-4 py-3 ${className}`}>
        <div className="flex items-start justify-between gap-2">
          <span className="text-xs font-medium text-foreground">
            What could be better?
          </span>
          <button
            type="button"
            onClick={() => {
              setShowFollowUp(false);
              setVisible(false);
            }}
            className="rounded p-0.5 text-muted-foreground hover:text-foreground"
          >
            <X className="size-3" />
          </button>
        </div>
        <textarea
          value={followUp}
          onChange={(e) => setFollowUp(e.target.value)}
          placeholder="Optional..."
          rows={2}
          className="mt-2 w-full resize-none rounded-md border border-border bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none"
        />
        <button
          type="button"
          onClick={handleFollowUp}
          className="mt-2 rounded-md bg-foreground px-3 py-1.5 text-[11px] font-semibold text-background transition-opacity hover:opacity-90"
        >
          Submit
        </button>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 rounded-md border border-border bg-surface px-4 py-2.5 ${className}`}>
      <span className="text-xs text-muted-foreground">
        {label ?? "Was this useful?"}
      </span>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => handleRate(true)}
          className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-[11px] font-medium text-foreground transition-colors hover:border-risk-low hover:text-risk-low"
        >
          <ThumbsUp className="size-3" /> Yes
        </button>
        <button
          type="button"
          onClick={() => handleRate(false)}
          className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-[11px] font-medium text-foreground transition-colors hover:border-risk-high hover:text-risk-high"
        >
          <ThumbsDown className="size-3" /> No
        </button>
      </div>
      <button
        type="button"
        onClick={() => setVisible(false)}
        className="ml-auto rounded p-0.5 text-muted-foreground hover:text-foreground"
      >
        <X className="size-3" />
      </button>
    </div>
  );
}
