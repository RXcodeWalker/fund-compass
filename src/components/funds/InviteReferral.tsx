import { Users, Copy, Gift } from "lucide-react";
import { useGrowth } from "@/hooks/useGrowth";
import { useSubscription } from "@/hooks/useSubscription";
import { toast } from "sonner";

export function InviteReferral() {
  const { referral, referralLink, recordInvite } = useGrowth();
  const { isPro } = useSubscription();
  const neededForReward = 3;
  const progress = Math.min(referral.inviteCount, neededForReward);
  const earnedReward = progress >= neededForReward;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      recordInvite();
      toast.success("Invite link copied");
    } catch {
      toast.error("Could not copy link");
    }
  };

  return (
    <div className="machined-edge rounded-lg border border-border bg-surface p-5">
      <div className="flex items-start gap-3">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-full border border-border bg-background">
          <Users className="size-4 text-foreground" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-foreground">Invite a friend</h3>
          <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
            Share Aethelgard with someone evaluating private investments.
          </p>

          {!isPro && (
            <div className="mt-3 rounded-md border border-border bg-background px-3 py-2">
              <div className="flex items-center gap-2">
                <Gift className="size-3.5 text-risk-medium" />
                <span className="text-[11px] font-medium text-foreground">
                  {earnedReward
                    ? "Reward unlocked!"
                    : `Invite ${neededForReward - progress} more to unlock premium insights free`}
                </span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-border">
                <div
                  className="h-full rounded-full bg-foreground transition-all"
                  style={{ width: `${(progress / neededForReward) * 100}%` }}
                />
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={handleCopy}
            className="mt-3 inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-foreground"
          >
            <Copy className="size-3" />
            Copy invite link
          </button>
        </div>
      </div>
    </div>
  );
}
