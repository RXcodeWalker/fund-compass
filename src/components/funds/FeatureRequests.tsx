import { useState } from "react";
import { Lightbulb, ArrowUp, Check, Plus } from "lucide-react";
import { useFeedback } from "@/hooks/useFeedback";
import { toast } from "sonner";

export function FeatureRequests() {
  const { featureRequests, submitFeatureRequest, toggleUpvote } = useFeedback();
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const sorted = [...featureRequests].sort((a, b) => b.upvotes - a.upvotes);

  const handleSubmit = () => {
    if (!title.trim()) return;
    submitFeatureRequest(title.trim(), description.trim());
    setTitle("");
    setDescription("");
    setShowForm(false);
    toast.success("Feature request submitted!");
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="label-eyebrow">Feature Requests</h3>
        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-3 py-1.5 text-[11px] font-medium text-foreground transition-colors hover:border-foreground"
        >
          {showForm ? <Check className="size-3" /> : <Plus className="size-3" />}
          {showForm ? "Done" : "Request a feature"}
        </button>
      </div>

      {showForm && (
        <div className="mb-4 rounded-md border border-border bg-surface p-4">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Feature title"
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe what you'd like (optional)"
            rows={2}
            className="mt-2 w-full resize-none rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none"
          />
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!title.trim()}
            className="mt-2 rounded-md bg-foreground px-3 py-1.5 text-[11px] font-semibold text-background transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Submit request
          </button>
        </div>
      )}

      <div className="flex flex-col gap-2">
        {sorted.map((fr) => (
          <div
            key={fr.id}
            className="flex items-start gap-3 rounded-md border border-border bg-surface px-4 py-3"
          >
            <button
              type="button"
              onClick={() => toggleUpvote(fr.id)}
              className={[
                "mt-0.5 flex flex-col items-center gap-0.5 rounded-md border px-2 py-1.5 text-center transition-colors",
                fr.userUpvoted
                  ? "border-foreground bg-foreground text-background"
                  : "border-border bg-surface text-muted-foreground hover:border-foreground hover:text-foreground",
              ].join(" ")}
            >
              <ArrowUp className="size-3" />
              <span className="font-mono text-[11px] font-semibold">{fr.upvotes}</span>
            </button>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <Lightbulb className="size-3.5 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">{fr.title}</span>
              </div>
              {fr.description && (
                <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
                  {fr.description}
                </p>
              )}
              <span className="mt-1 inline-block font-mono text-[10px] text-muted-foreground">
                {new Date(fr.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
