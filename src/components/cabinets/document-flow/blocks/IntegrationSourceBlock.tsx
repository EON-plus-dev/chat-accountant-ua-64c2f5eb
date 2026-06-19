/**
 * IntegrationSourceBlock — Блок "Джерело документа"
 * Відображає походження документа: завантажено, згенеровано, отримано
 */

import { 
  Upload, Sparkles, Building2, Download, Calendar, User,
  RefreshCw, Cloud, FileText, ExternalLink
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { uk } from "date-fns/locale";
import type { Document as FlowDocument, DocumentSource, ExternalSystem } from "@/config/documentFlowConfig";

interface IntegrationSourceBlockProps {
  document: FlowDocument;
  createdByName?: string;
  className?: string;
}

const sourceConfig: Record<string, {
  label: string;
  icon: typeof Upload;
  color: string;
}> = {
  upload: { 
    label: "Завантажено вручну", 
    icon: Upload, 
    color: "text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950/50" 
  },
  generated: { 
    label: "Згенеровано в системі", 
    icon: Sparkles, 
    color: "text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-950/50" 
  },
  received: { 
    label: "Отримано від контрагента", 
    icon: Building2, 
    color: "text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/50" 
  },
  imported: { 
    label: "Імпортовано", 
    icon: Download, 
    color: "text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/50" 
  },
};

const externalSystemConfig: Record<string, {
  label: string;
  icon: typeof Cloud;
}> = {
  "medoc": { label: "M.E.Doc", icon: Cloud },
  "1c": { label: "1С:Бухгалтерія", icon: FileText },
  "vchasno": { label: "Вчасно", icon: RefreshCw },
  diia: { label: "Дія", icon: Building2 },
  other: { label: "Інша система", icon: ExternalLink },
};

export const IntegrationSourceBlock = ({
  document,
  createdByName,
  className,
}: IntegrationSourceBlockProps) => {
  const source = document.source || "upload";
  const externalSystem = (document as any).externalSystem;
  
  const sourceInfo = sourceConfig[source];
  const SourceIcon = sourceInfo.icon;
  
  const externalSystemInfo = externalSystem ? externalSystemConfig[externalSystem] : null;
  const ExternalIcon = externalSystemInfo?.icon;
  
  // Format dates
  const createdAt = document.createdAt || document.date;
  const formattedDate = createdAt 
    ? format(new Date(createdAt), "dd MMMM yyyy 'о' HH:mm", { locale: uk })
    : "—";
  
  // Creator name with fallback
  const creator = createdByName || document.createdBy || "Невідомо";

  return (
    <Card className={cn("border-border/50", className)} data-section="document-integration-source">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Upload className="w-4 h-4 text-primary" />
          Джерело документа
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Source type */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Тип</span>
          <Badge 
            variant="outline" 
            className={cn("gap-1.5 font-medium border-0", sourceInfo.color)}
          >
            <SourceIcon className="w-3.5 h-3.5" />
            {sourceInfo.label}
          </Badge>
        </div>
        
        {/* External system (if imported) */}
        {externalSystemInfo && ExternalIcon && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Система</span>
            <div className="flex items-center gap-2">
              <ExternalIcon className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-sm font-medium">{externalSystemInfo.label}</span>
            </div>
          </div>
        )}
        
        {/* Created date */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            Додано
          </span>
          <span className="text-sm font-medium">{formattedDate}</span>
        </div>
        
        {/* Created by */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground flex items-center gap-1.5">
            <User className="w-3.5 h-3.5" />
            Ким
          </span>
          <span className="text-sm font-medium">{creator}</span>
        </div>
        
        {/* Sync indicator for external systems */}
        {externalSystem && (
          <Button variant="ghost" size="sm" className="w-full text-xs gap-1.5 text-muted-foreground">
            <RefreshCw className="w-3.5 h-3.5" />
            Остання синхронізація: {formattedDate}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
