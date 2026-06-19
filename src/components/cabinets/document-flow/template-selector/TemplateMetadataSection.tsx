/**
 * TemplateMetadataSection - "What's Inside" block
 * Shows field breakdown by source (cabinet, contractor, manual)
 */

import { useMemo } from "react";
import { Building2, Users, PenLine, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { DocumentTemplate } from "@/config/documentTemplatesConfig";

interface TemplateMetadataSectionProps {
  template: DocumentTemplate;
  className?: string;
}

export function TemplateMetadataSection({ template, className }: TemplateMetadataSectionProps) {
  const grouped = useMemo(() => ({
    cabinet: template.variables.filter(v => v.source === "cabinet"),
    contractor: template.variables.filter(v => v.source === "contractor"),
    manual: template.variables.filter(v => v.source === "manual"),
  }), [template]);
  
  const hasCabinet = grouped.cabinet.length > 0;
  const hasContractor = grouped.contractor.length > 0;
  const hasManual = grouped.manual.length > 0;
  
  return (
    <div className={cn("rounded-lg border bg-card p-4 space-y-4", className)}>
      <h4 className="text-sm font-medium flex items-center gap-2">
        <Info className="w-4 h-4 text-muted-foreground" />
        Що в шаблоні
      </h4>
      
      {/* Auto-fill sections grid */}
      {(hasCabinet || hasContractor) && (
        <div className="grid grid-cols-2 gap-4">
          {/* Cabinet fields */}
          {hasCabinet && (
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" />
                З вашого кабінету ({grouped.cabinet.length})
              </p>
              {grouped.cabinet.map(v => (
                <p key={v.key} className="text-xs text-muted-foreground pl-5">
                  • {v.label}
                </p>
              ))}
            </div>
          )}
          
          {/* Contractor fields */}
          {hasContractor && (
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                З контрагента ({grouped.contractor.length})
              </p>
              {grouped.contractor.map(v => (
                <p key={v.key} className="text-xs text-muted-foreground pl-5">
                  • {v.label}
                </p>
              ))}
            </div>
          )}
        </div>
      )}
      
      {/* Manual fields */}
      {hasManual && (
        <div className={cn("space-y-2", (hasCabinet || hasContractor) && "pt-3 border-t")}>
          <p className="text-xs font-medium text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
            <PenLine className="w-3.5 h-3.5" />
            Ввести вручну ({grouped.manual.length})
          </p>
          <div className="flex flex-wrap gap-1.5">
            {grouped.manual.map(v => (
              <Badge key={v.key} variant="outline" className="text-[10px] font-normal">
                {v.label}
              </Badge>
            ))}
          </div>
        </div>
      )}
      
      {/* Summary line */}
      <div className="pt-2 border-t flex items-center gap-4 text-[10px] text-muted-foreground">
        <span>
          Всього: <strong className="text-foreground">{template.variables.length}</strong> полів
        </span>
        {(hasCabinet || hasContractor) && (
          <span>
            Авто-заповнення: <strong className="text-emerald-600 dark:text-emerald-400">
              {grouped.cabinet.length + grouped.contractor.length}
            </strong>
          </span>
        )}
      </div>
    </div>
  );
}
