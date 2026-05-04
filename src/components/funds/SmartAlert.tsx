import { Info, TriangleAlert as AlertTriangle, CircleCheck as CheckCircle2 } from "lucide-react";
import type { SmartAlert } from "@/lib/insights";
import { ShareInsight } from "./ShareInsight";

const toneIcon: Record<SmartAlert["tone"], React.ElementType> = {
  info: Info,
  warn: AlertTriangle,
  success: CheckCircle2,
};

const toneColor: Record<SmartAlert["tone"], string> = {
  info: "text-foreground",
  warn: "text-risk-medium",
  success: "text-risk-low",
};

const toneBorder: Record<SmartAlert["tone"], string> = {
  info: "border-border",
  warn: "border-risk-medium/40",
  success: "border-risk-low/30",
};

const toneBg: Record<SmartAlert["tone"], string> = {
  info: "bg-surface",
  warn: "bg-risk-medium/5",
  success: "bg-risk-low/5",
};

interface Props {
  alerts: SmartAlert[];
  compact?: boolean;
}

export function SmartAlerts({ alerts, compact = false }: Props) {
  if (alerts.length === 0) return null;

  return (
    <div className={`flex flex-col gap-2 ${compact ? "" : "gap-3"}`}>
      {alerts.map((alert) => (
        <AlertBanner key={alert.id} alert={alert} compact={compact} />
      ))}
    </div>
  );
}

function AlertBanner({ alert, compact }: { alert: SmartAlert; compact: boolean }) {
  const Icon = toneIcon[alert.tone];
  const color = toneColor[alert.tone];
  const border = toneBorder[alert.tone];
  const bg = toneBg[alert.tone];

  if (compact) {
    return (
      <div className={`flex items-center gap-2 rounded-md border ${border} ${bg} px-3 py-2`}>
        <Icon className={`size-3.5 shrink-0 ${color}`} />
        <span className="text-xs font-medium text-foreground">{alert.message}</span>
      </div>
    );
  }

  return (
    <div className={`flex items-start gap-3 rounded-md border ${border} ${bg} px-4 py-3`}>
      <Icon className={`mt-0.5 size-4 shrink-0 ${color}`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <span className="text-sm font-medium text-foreground">{alert.message}</span>
          <ShareInsight title={alert.message} detail={alert.detail} />
        </div>
        <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
          {alert.detail}
        </p>
      </div>
    </div>
  );
}
