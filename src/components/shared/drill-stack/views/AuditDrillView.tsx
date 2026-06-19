/**
 * AuditDrillView — компактний preview перевірки ДПС.
 * Викликається з місць, де користувач НЕ хоче втрачати поточну сторінку
 * (платіж, контрагент, документ, AttentionInbox у дашборді).
 */

import { ArrowRight, ExternalLink, ClipboardCheck, Calendar, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { format, parseISO, differenceInCalendarDays } from "date-fns";
import { uk } from "date-fns/locale";
import { DrillSheet } from "../DrillSheet";
import { useDrillStack } from "../DrillStackProvider";
import {
  demoAudits,
  auditStatusConfig,
  getAuditTypeLabel,
} from "@/config/taxAuditsConfig";

interface Props {
  auditId: string;
  sourceLabel?: string;
  onOpenFullAudit?: (id: string) => void;
}

export function AuditDrillView({ auditId, sourceLabel, onOpenFullAudit }: Props) {
  const { popAll } = useDrillStack();
  const audit = demoAudits.find((a) => a.id === auditId);

  if (!audit) {
    return (
      <DrillSheet matchKind="audit" matchId={auditId} title="Перевірку не знайдено" sourceLabel={sourceLabel}>
        <p className="text-sm text-muted-foreground">
          Перевірка з ID {auditId} відсутня в кабінеті.
        </p>
      </DrillSheet>
    );
  }

  const statusCfg = auditStatusConfig[audit.status];
  const StatusIcon = statusCfg.icon;
  const pendingRequests = audit.requests.filter((r) => r.status === "pending").length;
  const overdueRequests = audit.requests.filter((r) => r.status === "overdue").length;

  const daysToDeadline = audit.responseDeadline
    ? differenceInCalendarDays(parseISO(audit.responseDeadline), new Date())
    : null;

  return (
    <DrillSheet
      matchKind="audit"
      matchId={auditId}
      title={getAuditTypeLabel(audit.type)}
      sourceLabel={sourceLabel}
      footer={
        <Button
          size="sm"
          className="w-full"
          onClick={() => {
            popAll();
            onOpenFullAudit?.(auditId);
          }}
        >
          <ExternalLink className="h-4 w-4 mr-1.5" />
          Відкрити повну сторінку
          <ArrowRight className="h-4 w-4 ml-1.5" />
        </Button>
      }
    >
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <ClipboardCheck className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium leading-tight">
              {getAuditTypeLabel(audit.type)}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">{audit.orderNumber}</p>
            <Badge variant="outline" className={`mt-1.5 text-xs gap-1 ${statusCfg.color}`}>
              <StatusIcon className="w-3 h-3" />
              {statusCfg.label}
            </Badge>
          </div>
        </div>

        <Separator />

        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" /> Період
            </span>
            <span>{audit.period}</span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground shrink-0">
              <Building2 className="h-3.5 w-3.5" /> ДПС
            </span>
            <span className="text-right truncate">{audit.taxOffice}</span>
          </div>
          {audit.responseDeadline && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Дедлайн</span>
              <span
                className={
                  daysToDeadline !== null && daysToDeadline < 0
                    ? "text-destructive font-medium"
                    : daysToDeadline !== null && daysToDeadline <= 3
                      ? "text-amber-600 dark:text-amber-400 font-medium"
                      : ""
                }
              >
                {format(parseISO(audit.responseDeadline), "dd.MM.yyyy", { locale: uk })}
                {daysToDeadline !== null && (
                  <span className="text-xs text-muted-foreground ml-1">
                    ({daysToDeadline < 0 ? `прострочено ${Math.abs(daysToDeadline)} дн.` : `через ${daysToDeadline} дн.`})
                  </span>
                )}
              </span>
            </div>
          )}
          {(pendingRequests > 0 || overdueRequests > 0) && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Запити</span>
              <span>
                {overdueRequests > 0 && (
                  <span className="text-destructive font-medium mr-2">
                    {overdueRequests} прострочено
                  </span>
                )}
                {pendingRequests > 0 && <span>{pendingRequests} активних</span>}
              </span>
            </div>
          )}
        </div>

        <div className="text-xs text-muted-foreground leading-relaxed border-t pt-3">
          Швидкий перегляд. У повній картці — таймлайн, запити, документи,
          результат і оскарження.
        </div>
      </div>
    </DrillSheet>
  );
}
