import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Paperclip, 
  ChevronRight, 
  Clock,
  CheckCircle2,
  Eye,
  FileDown,
  Landmark,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format, parseISO, differenceInDays } from "date-fns";
import { uk } from "date-fns/locale";
import type { EdoIncomingDocument } from "@/config/edoIntegrationConfig";
import { 
  edoDocumentTypeConfig, 
  edoStatusConfig,
  formatFileSize,
} from "@/config/edoIntegrationConfig";

interface EdoDocumentCardProps {
  document: EdoIncomingDocument;
  onProcess?: (document: EdoIncomingDocument) => void;
  onView?: (document: EdoIncomingDocument) => void;
  compact?: boolean;
}

export const EdoDocumentCard = ({ 
  document, 
  onProcess, 
  onView,
  compact = false,
}: EdoDocumentCardProps) => {
  const typeConfig = edoDocumentTypeConfig[document.documentType];
  const statusConfig = edoStatusConfig[document.status];
  const TypeIcon = typeConfig.icon;
  const StatusIcon = statusConfig.icon;

  const isNew = document.status === "new";
  const hasDeadline = document.deadlineDate;
  const daysUntilDeadline = hasDeadline 
    ? differenceInDays(parseISO(document.deadlineDate!), new Date()) 
    : null;

  const deadlineUrgent = daysUntilDeadline !== null && daysUntilDeadline <= 3;
  const deadlineWarning = daysUntilDeadline !== null && daysUntilDeadline > 3 && daysUntilDeadline <= 7;

  if (compact) {
    return (
      <div 
        className={cn(
          "flex items-center gap-3 p-3 rounded-lg border transition-colors cursor-pointer",
          isNew 
            ? "bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-950/30" 
            : "bg-card hover:bg-muted/50 border-border"
        )}
        onClick={() => onView?.(document)}
      >
        <div className={cn("p-2 rounded-md shrink-0", typeConfig.color)}>
          <TypeIcon className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{document.subject}</p>
          <p className="text-xs text-muted-foreground">
            {format(parseISO(document.receivedAt), "dd.MM.yyyy HH:mm", { locale: uk })}
          </p>
        </div>
        {isNew && (
          <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 shrink-0">
            Новий
          </Badge>
        )}
        <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
      </div>
    );
  }

  return (
    <Card className={cn(
      "transition-all",
      isNew && "ring-2 ring-blue-500/20 border-blue-200 dark:border-blue-800"
    )}>
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className={cn("p-2.5 rounded-lg shrink-0", typeConfig.color)}>
            <TypeIcon className="w-5 h-5" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h4 className="font-medium text-sm leading-tight">
                  {document.subject}
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {document.senderName}
                </p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <Badge
                  variant="outline"
                  className="text-[10px] px-1.5 py-0 gap-1 bg-primary/10 text-primary border-primary/20"
                  title="Документ надійшов напряму від ДПС"
                >
                  <Landmark className="w-3 h-3" />
                  ДПС
                </Badge>
                <Badge variant="outline" className={cn("text-xs gap-1", statusConfig.color)}>
                  <StatusIcon className="w-3 h-3" />
                  {statusConfig.label}
                </Badge>
              </div>
            </div>

            {/* Meta info */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs text-muted-foreground">
              <span>№ {document.registrationNumber}</span>
              <span>•</span>
              <span>{format(parseISO(document.receivedAt), "dd.MM.yyyy HH:mm", { locale: uk })}</span>
              
              {document.attachments.length > 0 && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Paperclip className="w-3 h-3" />
                    {document.attachments.length} файл{document.attachments.length > 1 ? "и" : ""}
                  </span>
                </>
              )}
            </div>

            {/* Deadline warning */}
            {hasDeadline && isNew && (
              <div className={cn(
                "flex items-center gap-1.5 mt-2 text-xs font-medium",
                deadlineUrgent && "text-red-600 dark:text-red-400",
                deadlineWarning && "text-amber-600 dark:text-amber-400",
                !deadlineUrgent && !deadlineWarning && "text-muted-foreground"
              )}>
                <Clock className="w-3.5 h-3.5" />
                Дедлайн: {format(parseISO(document.deadlineDate!), "dd.MM.yyyy", { locale: uk })}
                {daysUntilDeadline !== null && daysUntilDeadline >= 0 && (
                  <span className="text-muted-foreground">
                    ({daysUntilDeadline === 0 ? "сьогодні" : `${daysUntilDeadline} дн.`})
                  </span>
                )}
              </div>
            )}

            {/* Processed info */}
            {document.status === "processed" && document.processedAt && (
              <div className="flex items-center gap-1.5 mt-2 text-xs text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Оброблено {format(parseISO(document.processedAt), "dd.MM.yyyy", { locale: uk })}
                {document.processedAction === "created-audit" && " • Створено перевірку"}
                {document.processedAction === "added-request" && " • Додано запит"}
                {document.processedAction === "info-only" && " • Інформаційний"}
              </div>
            )}
          </div>
        </div>

        {/* Content preview */}
        {document.content && (
          <p className="text-xs text-muted-foreground mt-3 line-clamp-2 pl-[52px]">
            {document.content.slice(0, 200)}...
          </p>
        )}

        {/* Attachments */}
        {document.attachments.length > 0 && (
          <div className="mt-3 pl-[52px] space-y-1">
            {document.attachments.slice(0, 2).map((attachment) => (
              <div 
                key={attachment.id}
                className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded px-2 py-1"
              >
                <Paperclip className="w-3 h-3" />
                <span className="truncate flex-1">{attachment.fileName}</span>
                <span className="shrink-0">{formatFileSize(attachment.fileSize)}</span>
                <Button variant="ghost" size="icon" className="h-5 w-5">
                  <FileDown className="w-3 h-3" />
                </Button>
              </div>
            ))}
            {document.attachments.length > 2 && (
              <p className="text-xs text-muted-foreground">
                +{document.attachments.length - 2} ще файл{document.attachments.length - 2 > 1 ? "и" : ""}
              </p>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 mt-4 pl-[52px]">
          {isNew ? (
            <Button 
              size="sm" 
              onClick={() => onProcess?.(document)}
              className="gap-1.5"
            >
              Обробити
            </Button>
          ) : (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onView?.(document)}
              className="gap-1.5"
            >
              <Eye className="w-3.5 h-3.5" />
              Переглянути
            </Button>
          )}
          
          {document.relatedAuditId && (
            <Badge variant="secondary" className="text-xs">
              Прив'язано до перевірки
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
