import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  FolderOpen,
  Users,
  Gavel,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { TaxAudit } from "@/config/taxAuditsConfig";
import {
  analyzeAuditReadiness,
  ReadinessLevel,
  ReadinessAction,
} from "@/lib/mockAuditReadiness";

const levelConfig: Record<
  ReadinessLevel,
  { label: string; color: string; icon: typeof CheckCircle2; barClass: string }
> = {
  ready: {
    label: "Готово",
    color: "text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300",
    icon: CheckCircle2,
    barClass: "bg-emerald-500",
  },
  attention: {
    label: "Потребує уваги",
    color: "text-amber-700 bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300",
    icon: AlertTriangle,
    barClass: "bg-amber-500",
  },
  critical: {
    label: "Критично",
    color: "text-red-700 bg-red-50 border-red-200 dark:bg-red-950/40 dark:text-red-300",
    icon: ShieldAlert,
    barClass: "bg-red-500",
  },
};

const factorDot: Record<"ok" | "warn" | "bad", string> = {
  ok: "bg-emerald-500",
  warn: "bg-amber-500",
  bad: "bg-red-500",
};

const actionIcon: Record<ReadinessAction["kind"], typeof ArrowRight> = {
  "open-response": ArrowRight,
  "open-requests-tab": Users,
  "attach-documents": FolderOpen,
  "open-counterparty": Users,
  "decide-ppr": Gavel,
};

interface AuditReadinessCardProps {
  audit: TaxAudit;
  onOpenResponse?: (requestId: string) => void;
  onOpenRequestsTab?: () => void;
  onAttachDocuments?: () => void;
  onOpenAppealOrPpr?: () => void;
}

export const AuditReadinessCard = ({
  audit,
  onOpenResponse,
  onOpenRequestsTab,
  onAttachDocuments,
  onOpenAppealOrPpr,
}: AuditReadinessCardProps) => {
  const report = analyzeAuditReadiness(audit);
  const cfg = levelConfig[report.level];
  const Icon = cfg.icon;

  const handleAction = (action: ReadinessAction) => {
    switch (action.kind) {
      case "open-response":
        if (action.payload?.requestId) onOpenResponse?.(action.payload.requestId);
        break;
      case "open-requests-tab":
      case "open-counterparty":
        onOpenRequestsTab?.();
        break;
      case "attach-documents":
        onAttachDocuments?.();
        break;
      case "decide-ppr":
        onOpenAppealOrPpr?.();
        break;
    }
  };

  return (
    <Card className="border-purple-100 dark:border-purple-900/50 bg-gradient-to-br from-purple-50/30 to-transparent dark:from-purple-950/10">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-500" />
            AI-оцінка готовності
          </CardTitle>
          <Badge variant="outline" className={cn("gap-1", cfg.color)}>
            <Icon className="w-3 h-3" />
            {cfg.label} · {report.score}/100
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Progress value={report.score} className="h-2" indicatorClassName={cfg.barClass} />
        <p className="text-sm text-muted-foreground">{report.summary}</p>

        <div className="space-y-3">
          {report.factors.map((f) => {
            const ActionIcon = f.action ? actionIcon[f.action.kind] : null;
            return (
              <div
                key={f.id}
                className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-3"
              >
                <div className="flex items-start gap-2.5 min-w-0 flex-1">
                  <div className={cn("w-2 h-2 rounded-full mt-1.5 shrink-0", factorDot[f.status])} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{f.label}</p>
                    <p className="text-xs text-muted-foreground">{f.detail}</p>
                  </div>
                </div>
                {f.action && (
                  <Button
                    size="sm"
                    variant={f.action.variant === "primary" ? "default" : "outline"}
                    className="h-8 shrink-0 self-start sm:self-auto sm:ml-2"
                    onClick={() => handleAction(f.action!)}
                  >
                    {ActionIcon && <ActionIcon className="w-3.5 h-3.5" />}
                    {f.action.label}
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
