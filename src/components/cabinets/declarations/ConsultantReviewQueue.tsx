import { useMemo } from "react";
import {
  AlertTriangle,
  Clock,
  ShieldCheck,
  Users,
  ArrowRight,
  Timer,
  Flame,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  demoDeclarationCases,
  STATUS_LABELS,
  PROFILE_TAG_LABELS,
  type DeclarationCase,
} from "@/config/demoCabinets/declarationCases";

interface ConsultantReviewQueueProps {
  cabinetId: string;
  onOpenCase: (id: string) => void;
}

type SlaState = "overdue" | "critical" | "warning" | "ok";

interface QueueItem {
  caseItem: DeclarationCase;
  hoursLeft: number;
  slaState: SlaState;
}

const PRIORITY_TONE: Record<NonNullable<DeclarationCase["reviewPriority"]>, string> = {
  critical: "bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/30",
  high: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30",
  normal: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30",
  low: "bg-muted text-muted-foreground border-transparent",
};

const PRIORITY_LABEL: Record<NonNullable<DeclarationCase["reviewPriority"]>, string> = {
  critical: "Критичний",
  high: "Високий",
  normal: "Звичайний",
  low: "Низький",
};

const SLA_TONE: Record<SlaState, string> = {
  overdue: "bg-red-500/15 text-red-700 dark:text-red-300 border-red-500/40",
  critical: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/40",
  warning: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-300 border-yellow-500/30",
  ok: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
};

function getSlaState(hoursLeft: number): SlaState {
  if (hoursLeft < 0) return "overdue";
  if (hoursLeft < 4) return "critical";
  if (hoursLeft < 24) return "warning";
  return "ok";
}

function formatSla(hoursLeft: number): string {
  const abs = Math.abs(hoursLeft);
  if (abs < 1) return `${Math.round(abs * 60)} хв`;
  if (abs < 48) return `${Math.round(abs)} год`;
  return `${Math.round(abs / 24)} дн`;
}

export function ConsultantReviewQueue({ cabinetId, onOpenCase }: ConsultantReviewQueueProps) {
  // У демо консультант бачить кейси, що вимагають перевірки, з усіх кабінетів.
  // Для презентації обмежуємо поточним cabinetId, але показуємо також "інші кабінети" як індикатор.
  const items = useMemo<QueueItem[]>(() => {
    const now = Date.now();
    return demoDeclarationCases
      .filter((c) => c.status === "in_review" || c.status === "reviewed")
      .map((c) => {
        const due = c.reviewSlaDueAt ? new Date(c.reviewSlaDueAt).getTime() : now + 86_400_000;
        const hoursLeft = (due - now) / 3_600_000;
        return { caseItem: c, hoursLeft, slaState: getSlaState(hoursLeft) };
      })
      .sort((a, b) => a.hoursLeft - b.hoursLeft);
  }, []);

  const stats = useMemo(() => {
    const total = items.length;
    const overdue = items.filter((i) => i.slaState === "overdue").length;
    const critical = items.filter((i) => i.slaState === "critical").length;
    const inMyCabinet = items.filter((i) => i.caseItem.cabinetId === cabinetId).length;
    return { total, overdue, critical, inMyCabinet };
  }, [items, cabinetId]);

  return (
    <div className="space-y-4">
      {/* Header with KPIs */}
      <Card className="border-primary/30">
        <CardContent className="p-4 md:p-5 space-y-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-lg md:text-xl font-semibold flex items-center gap-2">
                <ShieldCheck className="size-5 text-primary" /> Черга перевірок консультанта
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Кейси, що очікують експертної перевірки. Сортовано за SLA-дедлайном.
              </p>
            </div>
            <Badge variant="outline" className="gap-1">
              <Users className="size-3" /> Демо-роль: податковий консультант
            </Badge>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <KpiTile label="У черзі" value={stats.total} icon={Clock} />
            <KpiTile label="Прострочено SLA" value={stats.overdue} icon={Flame} tone="danger" />
            <KpiTile label="Критичні (<4 год)" value={stats.critical} icon={AlertTriangle} tone="warning" />
            <KpiTile label="У цьому кабінеті" value={stats.inMyCabinet} icon={ShieldCheck} tone="info" />
          </div>
        </CardContent>
      </Card>

      {/* Queue list */}
      {items.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-sm text-muted-foreground">
            <ShieldCheck className="size-8 mx-auto mb-2 text-emerald-500" />
            Черга порожня. Усі кейси перевірено.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {items.map(({ caseItem, hoursLeft, slaState }) => {
            const priority = caseItem.reviewPriority ?? "normal";
            const isOtherCabinet = caseItem.cabinetId !== cabinetId;
            return (
              <Card
                key={caseItem.id}
                className={cn(
                  "transition-colors hover:border-primary/40",
                  slaState === "overdue" && "border-red-500/40",
                  slaState === "critical" && "border-amber-500/40",
                )}
              >
                <CardContent className="p-3 md:p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-1.5 min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium truncate">{caseItem.title}</span>
                        <Badge variant="outline" className="font-mono text-[10px]">
                          {caseItem.reportingYear}
                        </Badge>
                        <Badge variant="outline" className={cn("text-[10px]", PRIORITY_TONE[priority])}>
                          {PRIORITY_LABEL[priority]}
                        </Badge>
                        <Badge variant="outline" className={cn("text-[10px] gap-1", SLA_TONE[slaState])}>
                          <Timer className="size-3" />
                          {slaState === "overdue" ? `Прострочено на ${formatSla(hoursLeft)}` : `SLA: ${formatSla(hoursLeft)}`}
                        </Badge>
                        {isOtherCabinet && (
                          <Badge variant="secondary" className="text-[10px]">Інший кабінет</Badge>
                        )}
                      </div>
                      {caseItem.reviewReason && (
                        <p className="text-xs text-muted-foreground leading-snug">
                          {caseItem.reviewReason}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-1">
                        {caseItem.profileTags.slice(0, 4).map((t) => (
                          <Badge key={t} variant="secondary" className="text-[10px] h-5">
                            {PROFILE_TAG_LABELS[t]}
                          </Badge>
                        ))}
                        <Badge variant="outline" className="text-[10px] h-5">
                          {STATUS_LABELS[caseItem.status]}
                        </Badge>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant={slaState === "overdue" || slaState === "critical" ? "default" : "outline"}
                      className="gap-1 shrink-0"
                      onClick={() => onOpenCase(caseItem.id)}
                      disabled={isOtherCabinet}
                    >
                      Перевірити <ArrowRight className="size-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function KpiTile({
  label,
  value,
  icon: Icon,
  tone = "default",
}: {
  label: string;
  value: number;
  icon: typeof Clock;
  tone?: "default" | "danger" | "warning" | "info";
}) {
  const toneClass: Record<string, string> = {
    default: "text-foreground",
    danger: "text-red-600 dark:text-red-400",
    warning: "text-amber-600 dark:text-amber-400",
    info: "text-blue-600 dark:text-blue-400",
  };
  return (
    <div className="rounded-md border bg-muted/30 p-2.5">
      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Icon className="size-3" /> {label}
      </div>
      <div className={cn("text-xl font-semibold tabular-nums mt-0.5", toneClass[tone])}>{value}</div>
    </div>
  );
}

export default ConsultantReviewQueue;
