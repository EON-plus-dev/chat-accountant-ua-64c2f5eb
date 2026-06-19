import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  MessageSquare, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  FileText,
  Send,
  Building2,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AuditRequest } from "@/config/taxAuditsConfig";
import { format, parseISO, isPast } from "date-fns";
import { uk } from "date-fns/locale";
import { daysUntilDeadline, formatBusinessDaysLeft } from "@/lib/businessDaysUA";

interface AuditRequestCardProps {
  request: AuditRequest;
  onRespond?: (requestId: string) => void;
  onViewResponse?: (requestId: string) => void;
  onAnalyze?: (requestId: string) => void;
}

export const AuditRequestCard = ({ request, onRespond, onViewResponse, onAnalyze }: AuditRequestCardProps) => {
  const deadline = parseISO(request.deadline);
  const isOverdue = isPast(deadline) && request.status === "pending";
  // ПКУ за замовчуванням оперує робочими днями (п. 73.3, 86.7, 56.3).
  const deadlineType = request.deadlineType ?? "business";
  const daysUntil = daysUntilDeadline(deadline, deadlineType);
  
  const statusConfig = {
    pending: {
      label: isOverdue ? "Прострочено" : "Очікує відповіді",
      icon: isOverdue ? AlertTriangle : Clock,
      color: isOverdue 
        ? "text-red-600 bg-red-50 dark:bg-red-950/50 border-red-200" 
        : "text-amber-600 bg-amber-50 dark:bg-amber-950/50 border-amber-200",
    },
    answered: {
      label: "Надано відповідь",
      icon: CheckCircle2,
      color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200",
    },
    overdue: {
      label: "Прострочено",
      icon: AlertTriangle,
      color: "text-red-600 bg-red-50 dark:bg-red-950/50 border-red-200",
    },
  };
  
  const status = statusConfig[request.status];
  const StatusIcon = status.icon;

  return (
    <Card className={cn(
      "transition-all",
      request.status === "pending" && !isOverdue && "border-amber-200 dark:border-amber-800",
      isOverdue && "border-red-300 dark:border-red-800 bg-red-50/30 dark:bg-red-950/20"
    )}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">Запит {request.number}</span>
          </div>
          <Badge 
            variant="outline" 
            className={cn("text-xs font-medium gap-1", status.color)}
          >
            <StatusIcon className="w-3 h-3" />
            {status.label}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div>
          <h4 className="font-medium text-sm">{request.subject}</h4>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
            {request.description}
          </p>
        </div>
        
        {/* Дедлайн */}
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-muted-foreground">Дедлайн:</span>
            <span className={cn(
              "font-medium",
              isOverdue && "text-red-600 dark:text-red-400",
              !isOverdue && daysUntil <= 3 && "text-amber-600 dark:text-amber-400"
            )}>
              {format(deadline, "dd.MM.yyyy", { locale: uk })}
            </span>
            {request.status === "pending" && !isOverdue && daysUntil <= 7 && (
              <span
                className={cn(
                  "text-xs",
                  daysUntil <= 3 ? "text-red-600 dark:text-red-400" : "text-amber-600",
                )}
              >
                ({deadlineType === "business"
                  ? `лишилось ${formatBusinessDaysLeft(daysUntil)}`
                  : `${daysUntil} ${daysUntil === 1 ? "день" : daysUntil < 5 ? "дні" : "днів"}`})
              </span>
            )}
          </div>
        </div>
        
        {/* KWoD: контрагент, фігурує в запиті */}
        {request.relatedCounterparty && (
          <div
            className={cn(
              "flex items-center gap-2 p-2 rounded-md border text-xs",
              request.relatedCounterparty.isRisky
                ? "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800"
                : "bg-muted/40 border-border/60"
            )}
          >
            <Building2 className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="font-medium truncate">{request.relatedCounterparty.name}</p>
              {request.relatedCounterparty.code && (
                <p className="text-[10px] text-muted-foreground">
                  {request.relatedCounterparty.code}
                  {typeof request.relatedCounterparty.operationsLast12m === "number" && (
                    <> · {request.relatedCounterparty.operationsLast12m} опер. за рік</>
                  )}
                </p>
              )}
            </div>
            {typeof request.relatedCounterparty.reliabilityScore === "number" && (
              <Badge
                variant="outline"
                className={cn(
                  "text-[10px] gap-1",
                  request.relatedCounterparty.isRisky
                    ? "text-red-600 border-red-300 bg-red-100/50 dark:bg-red-950/40"
                    : request.relatedCounterparty.reliabilityScore >= 70
                      ? "text-emerald-700 border-emerald-300 bg-emerald-50 dark:bg-emerald-950/30"
                      : "text-amber-700 border-amber-300 bg-amber-50 dark:bg-amber-950/30"
                )}
              >
                {request.relatedCounterparty.isRisky ? (
                  <ShieldAlert className="w-3 h-3" />
                ) : (
                  <ShieldCheck className="w-3 h-3" />
                )}
                KWoD {request.relatedCounterparty.reliabilityScore}
              </Badge>
            )}
          </div>
        )}
        
        {/* Запитувані документи */}
        {request.documentsRequested && request.documentsRequested.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <FileText className="w-3 h-3" />
              Запитувані документи:
            </p>
            <div className="flex flex-wrap gap-1">
              {request.documentsRequested.map((doc, idx) => (
                <Badge key={idx} variant="secondary" className="text-xs font-normal">
                  {doc}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        {/* Відповідь (якщо є) */}
        {request.status === "answered" && request.responseDate && (
          <div className="pt-2 border-t">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                Відповідь від {format(parseISO(request.responseDate), "dd.MM.yyyy", { locale: uk })}
              </span>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 text-xs"
                onClick={() => onViewResponse?.(request.id)}
              >
                Переглянути
              </Button>
            </div>
            {request.responseText && (
              <p className="text-xs text-muted-foreground mt-1 italic">
                "{request.responseText}"
              </p>
            )}
          </div>
        )}
        
        {/* Кнопки дій */}
        {request.status === "pending" && (
          <div className="flex items-center justify-end gap-2 pt-1">
            {onAnalyze && (
              <Button
                size="sm"
                variant="ghost"
                className="h-8 gap-1.5"
                onClick={() => onAnalyze(request.id)}
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                AI-аналіз
              </Button>
            )}
            <Button
              size="sm"
              className="h-8 gap-1.5"
              variant={isOverdue ? "destructive" : "default"}
              onClick={() => onRespond?.(request.id)}
            >
              <Send className="w-3.5 h-3.5" />
              {isOverdue ? "Терміново відповісти" : "Відповісти"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
