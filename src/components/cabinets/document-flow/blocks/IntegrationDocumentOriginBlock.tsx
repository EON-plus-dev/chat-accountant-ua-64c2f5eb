/**
 * IntegrationDocumentOriginBlock — Блок 1: "Як документ потрапив у систему"
 * Показує джерело походження та напрямок документа
 */

import { 
  Upload, Sparkles, Building2, Download, ArrowDownLeft, ArrowUpRight, FileText
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { 
  DocumentSourceType, 
  DocumentDirection,
  documentSourceTypeLabels,
  documentDirectionLabels
} from "@/config/documentFlowConfig";

interface IntegrationDocumentOriginBlockProps {
  sourceType?: DocumentSourceType;
  sourceChannel?: string;
  direction?: DocumentDirection;
  sourceUser?: string;
  className?: string;
}

const sourceTypeConfig: Record<DocumentSourceType, {
  label: string;
  icon: typeof Upload;
  color: string;
}> = {
  UPLOAD: { 
    label: "Завантажено вручну", 
    icon: Upload, 
    color: "text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950/50" 
  },
  GENERATED: { 
    label: "Створено в AI-Бухгалтер", 
    icon: Sparkles, 
    color: "text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-950/50" 
  },
  INTERNAL_RECEIVED: { 
    label: "Отримано від користувача платформи", 
    icon: Building2, 
    color: "text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/50" 
  },
  EXTERNAL_INTEGRATION: { 
    label: "Зовнішня інтеграція", 
    icon: Download, 
    color: "text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/50" 
  },
};

const directionConfig: Record<DocumentDirection, {
  label: string;
  icon: typeof ArrowDownLeft;
  color: string;
}> = {
  incoming: {
    label: "Вхідний документ від контрагента",
    icon: ArrowDownLeft,
    color: "text-green-600",
  },
  outgoing: {
    label: "Вихідний документ для контрагента",
    icon: ArrowUpRight,
    color: "text-blue-600",
  },
  internal: {
    label: "Внутрішній документ",
    icon: FileText,
    color: "text-slate-600",
  },
};

export const IntegrationDocumentOriginBlock = ({
  sourceType = "UPLOAD",
  sourceChannel,
  direction = "outgoing",
  sourceUser,
  className,
}: IntegrationDocumentOriginBlockProps) => {
  const sourceInfo = sourceTypeConfig[sourceType];
  const SourceIcon = sourceInfo.icon;
  
  const directionInfo = directionConfig[direction];
  const DirectionIcon = directionInfo.icon;

  // Build source label with channel
  const sourceLabel = sourceChannel 
    ? `${sourceInfo.label} · ${sourceChannel}` 
    : sourceInfo.label;

  return (
    <Card className={cn("border-border/50", className)} data-section="document-integration-origin">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Download className="w-4 h-4 text-primary" />
          Як документ потрапив у систему
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Source type with channel */}
        <div className="flex items-center justify-between gap-4">
          <span className="text-sm text-muted-foreground shrink-0">Джерело</span>
          <Badge 
            variant="outline" 
            className={cn("gap-1.5 font-medium border-0 truncate", sourceInfo.color)}
          >
            <SourceIcon className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{sourceLabel}</span>
          </Badge>
        </div>
        
        {/* Direction */}
        <div className="flex items-center justify-between gap-4">
          <span className="text-sm text-muted-foreground shrink-0">Напрямок</span>
          <div className="flex items-center gap-1.5">
            <DirectionIcon className={cn("w-4 h-4 shrink-0", directionInfo.color)} />
            <span className="text-sm font-medium truncate">{directionInfo.label}</span>
          </div>
        </div>
        
        {/* Initiator (optional) */}
        {sourceUser && (
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm text-muted-foreground shrink-0">Ініціатор</span>
            <span className="text-sm font-medium truncate">{sourceUser}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
