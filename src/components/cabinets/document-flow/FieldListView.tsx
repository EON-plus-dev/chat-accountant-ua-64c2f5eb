/**
 * FieldListView - Vertical list of fields grouped by FieldGroup (EDIT mode, Schema sub-mode)
 * Read-only view, click on field triggers navigation to Editor
 */

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  FileText,
  Building2,
  Users,
  Package,
  Calculator,
  ScrollText,
  Truck,
  PenLine,
  Sparkles,
  Edit,
  ChevronRight,
} from "lucide-react";
import type { UnifiedTemplateField } from "@/types/templateField";
import type { FieldGroup, FieldSource } from "@/config/documentFormSchemas";

// Group icons
const groupIcons: Record<FieldGroup, React.ElementType> = {
  header: FileText,
  supplier: Building2,
  buyer: Users,
  employee: Users,
  positions: Package,
  totals: Calculator,
  terms: ScrollText,
  transport: Truck,
  signatures: PenLine,
};

// Group labels
const groupLabels: Record<FieldGroup, string> = {
  header: "Заголовок документа",
  supplier: "Постачальник/Виконавець",
  buyer: "Покупець/Замовник",
  employee: "Дані працівника",
  positions: "Табличні позиції",
  totals: "Підсумки",
  terms: "Умови",
  transport: "Транспортування",
  signatures: "Підписи",
};

// Source config
const sourceConfig: Record<FieldSource, { icon: React.ElementType; label: string; color: string }> = {
  cabinet: { icon: Building2, label: "Кабінет", color: "text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-950/40" },
  contractor: { icon: Users, label: "Контрагент", color: "text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-950/40" },
  employee: { icon: Users, label: "Працівник", color: "text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-950/40" },
  manual: { icon: Edit, label: "Вручну", color: "text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-800" },
  computed: { icon: Sparkles, label: "Обчислюване", color: "text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-950/40" },
};

interface FieldListViewProps {
  fields: UnifiedTemplateField[];
  onFieldClick: (fieldKey: string) => void;
  highlightedFieldKey?: string | null;
  className?: string;
}

export const FieldListView = ({
  fields,
  onFieldClick,
  highlightedFieldKey,
  className,
}: FieldListViewProps) => {
  // Group fields by FieldGroup
  const fieldsByGroup = useMemo(() => {
    return fields.reduce((acc, field) => {
      if (!acc[field.group]) acc[field.group] = [];
      acc[field.group].push(field);
      return acc;
    }, {} as Record<FieldGroup, UnifiedTemplateField[]>);
  }, [fields]);
  
  return (
    <ScrollArea className={cn("flex-1", className)}>
      <div className="p-4 sm:p-6 space-y-4">
        {/* Legend */}
        <Card className="p-4">
          <div className="flex flex-wrap gap-3">
            {Object.entries(sourceConfig).map(([key, config]) => {
              const Icon = config.icon;
              return (
                <div key={key} className="flex items-center gap-2">
                  <div className={cn("rounded p-1", config.color)}>
                    <Icon className="h-3 w-3" />
                  </div>
                  <span className="text-sm">{config.label}</span>
                </div>
              );
            })}
          </div>
        </Card>
        
        {/* Info banner */}
        <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
          <p className="text-sm text-muted-foreground">
            👆 Натисніть на поле, щоб перейти до редактора та відредагувати його властивості
          </p>
        </div>

        {/* Fields by Group */}
        {(Object.entries(fieldsByGroup) as [FieldGroup, UnifiedTemplateField[]][]).map(([group, groupFields]) => {
          const GroupIcon = groupIcons[group] || FileText;
          
          return (
            <Card key={group}>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <div className="rounded-md bg-primary/10 p-2">
                    <GroupIcon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">
                      {groupLabels[group] || group}
                    </CardTitle>
                    <CardDescription>
                      {groupFields.length} {groupFields.length === 1 ? "поле" : groupFields.length < 5 ? "поля" : "полів"}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {groupFields.sort((a, b) => a.order - b.order).map((field) => {
                    const config = sourceConfig[field.source];
                    const SourceIcon = config.icon;
                    const isHighlighted = highlightedFieldKey === field.key;
                    
                    return (
                      <button
                        key={field.key}
                        onClick={() => onFieldClick(field.key)}
                        className={cn(
                          "w-full flex items-center justify-between p-3 rounded-lg border bg-card transition-all",
                          "hover:bg-muted/50 hover:border-primary/30 hover:shadow-sm",
                          "text-left group",
                          isHighlighted && "ring-2 ring-primary ring-offset-2"
                        )}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={cn("rounded p-1.5 shrink-0", config.color)}>
                            <SourceIcon className="h-4 w-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-sm truncate">
                              {field.label}
                              {field.required && <span className="text-destructive ml-1">*</span>}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {field.dataType} · {config.label}
                              {field.sourceKey && ` · ${field.sourceKey}`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge variant="outline" className="text-xs">
                            {field.width || "full"}
                          </Badge>
                          <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}
        
        {/* Empty state */}
        {fields.length === 0 && (
          <Card className="p-8 text-center">
            <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground/40" />
            <p className="text-muted-foreground">Полів поки немає</p>
            <p className="text-sm text-muted-foreground/70 mt-1">
              Перейдіть до редактора, щоб додати поля
            </p>
          </Card>
        )}
      </div>
    </ScrollArea>
  );
};
