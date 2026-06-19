/**
 * IntegrationPackagesBlock — Блок "Пакети та перевірки"
 * Відображає аудити та внутрішні перевірки, в які включено документ
 */

import { 
  FolderCheck, Plus, CheckCircle2, Clock, AlertCircle,
  FileSearch, ChevronRight, Archive, Shield
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { uk } from "date-fns/locale";
import { 
  getAuditsForDocument, 
  auditTypeConfig, 
  auditStatusConfig,
  type TaxAudit 
} from "@/config/taxAuditsConfig";

interface IntegrationPackagesBlockProps {
  documentId: string;
  audits?: TaxAudit[];
  onNavigateToAudit?: (auditId: string) => void;
  onAddToPackage?: () => void;
  className?: string;
}

const packageTypeIcons: Record<string, typeof FolderCheck> = {
  tax: Shield,
  internal: FileSearch,
  external: Archive,
  other: FolderCheck,
};

const statusIcons: Record<string, typeof CheckCircle2> = {
  draft: Clock,
  "in-progress": Clock,
  completed: CheckCircle2,
  scheduled: Clock,
};

export const IntegrationPackagesBlock = ({
  documentId,
  audits: providedAudits,
  onNavigateToAudit,
  onAddToPackage,
  className,
}: IntegrationPackagesBlockProps) => {
  // Get audits from config if not provided
  const audits = providedAudits || getAuditsForDocument(documentId);
  
  // Also create demo internal packages
  const internalPackages = [
    {
      id: "pkg-q1-2025",
      name: "Квартальна звітність Q1 2025",
      type: "report" as const,
      status: "completed" as const,
      date: "2025-01-15",
    },
    {
      id: "pkg-internal-feb",
      name: "Внутрішній аудит (лютий)",
      type: "internal" as const,
      status: "in-progress" as const,
      date: "2025-02-01",
    },
  ];

  const totalPackages = audits.length + (documentId ? internalPackages.length : 0);

  return (
    <Card className={cn("border-border/50", className)} data-section="document-integration-packages">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <FolderCheck className="w-4 h-4 text-primary" />
            Пакети та перевірки
            {totalPackages > 0 && (
              <Badge variant="secondary" className="text-[10px]">
                {totalPackages}
              </Badge>
            )}
          </div>
          {onAddToPackage && (
            <Button 
              variant="outline" 
              size="sm" 
              className="h-7 text-xs gap-1"
              onClick={onAddToPackage}
            >
              <Plus className="w-3.5 h-3.5" />
              Додати
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Tax audits */}
        {audits.length > 0 && (
          <div className="space-y-2">
            {audits.map((audit) => {
              const typeConfig = auditTypeConfig[audit.type];
              const statusConfig = auditStatusConfig[audit.status];
              const TypeIcon = packageTypeIcons[audit.type] || FolderCheck;
              const StatusIcon = statusIcons[audit.status] || Clock;
              
              return (
                <div 
                  key={audit.id}
                  className={cn(
                    "flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer",
                    "hover:bg-muted/50 transition-colors group",
                    audit.status === "completed" && "border-emerald-200 bg-emerald-50/30 dark:border-emerald-900 dark:bg-emerald-950/20",
                    audit.status === "in-progress" && "border-blue-200 bg-blue-50/30 dark:border-blue-900 dark:bg-blue-950/20"
                  )}
                  onClick={() => onNavigateToAudit?.(audit.id)}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                    "bg-background border"
                  )}>
                    <TypeIcon className="w-4 h-4 text-muted-foreground" />
                  </div>
                  
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {typeConfig?.label || audit.type}
                </p>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(audit.startDate), "dd.MM.yy", { locale: uk })}
                </p>
              </div>
              
              <Badge 
                variant="outline" 
                className={cn(
                  "text-[10px] gap-1 border-0",
                  audit.status === "completed" && "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
                  audit.status === "in-progress" && "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400"
                )}
                  >
                    <StatusIcon className="w-3 h-3" />
                    {statusConfig?.label || audit.status}
                  </Badge>
                  
                  <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              );
            })}
          </div>
        )}
        
        {/* Internal packages (demo) */}
        {documentId && internalPackages.map((pkg) => {
          const StatusIcon = statusIcons[pkg.status] || Clock;
          const TypeIcon = pkg.type === "internal" ? FileSearch : FolderCheck;
          
          return (
            <div 
              key={pkg.id}
              className={cn(
                "flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer",
                "hover:bg-muted/50 transition-colors group",
                pkg.status === "completed" && "border-emerald-200 bg-emerald-50/30 dark:border-emerald-900 dark:bg-emerald-950/20",
                pkg.status === "in-progress" && "border-blue-200 bg-blue-50/30 dark:border-blue-900 dark:bg-blue-950/20"
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                "bg-background border"
              )}>
                <TypeIcon className="w-4 h-4 text-muted-foreground" />
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{pkg.name}</p>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(pkg.date), "dd.MM.yyyy", { locale: uk })}
                </p>
              </div>
              
              <Badge 
                variant="outline" 
                className={cn(
                  "text-[10px] gap-1 border-0",
                  pkg.status === "completed" && "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
                  pkg.status === "in-progress" && "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400"
                )}
              >
                <StatusIcon className="w-3 h-3" />
                {pkg.status === "completed" ? "Завершено" : "На перевірці"}
              </Badge>
              
              <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          );
        })}
        
        {/* Empty state */}
        {totalPackages === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            Документ не включено в жодний пакет
          </p>
        )}
      </CardContent>
    </Card>
  );
};
