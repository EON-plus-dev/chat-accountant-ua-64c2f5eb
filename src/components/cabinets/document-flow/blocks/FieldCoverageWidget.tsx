/**
 * FieldCoverageWidget — Візуалізація покриття полів шаблону
 * Показує розподіл полів за джерелами даних з progress bars
 * Оптимізовано для мобільних пристроїв
 */

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, Users, Sparkles, Edit, PieChart, ArrowRight, CheckCircle2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { UnifiedTemplateField } from "@/types/templateField";

interface FieldCoverageWidgetProps {
  fields: UnifiedTemplateField[];
  onFieldClick?: (field: UnifiedTemplateField) => void;
  onNavigateToFields?: () => void;
  className?: string;
}

interface FieldStats {
  total: number;
  bySource: {
    cabinet: number;
    contractor: number;
    computed: number;
    manual: number;
  };
  required: number;
  optional: number;
  hasPositions: boolean;
  hasSignature: boolean;
}

interface SourceConfig {
  key: keyof FieldStats["bySource"];
  label: string;
  icon: typeof Building2;
  colorClass: string;
  bgClass: string;
  progressClass: string;
}

const SOURCE_CONFIGS: SourceConfig[] = [
  {
    key: "cabinet",
    label: "Мої дані",
    icon: Building2,
    colorClass: "text-blue-700 dark:text-blue-400",
    bgClass: "bg-blue-100 dark:bg-blue-900/30",
    progressClass: "[&>*]:bg-blue-500",
  },
  {
    key: "contractor",
    label: "Контрагент",
    icon: Users,
    colorClass: "text-purple-700 dark:text-purple-400",
    bgClass: "bg-purple-100 dark:bg-purple-900/30",
    progressClass: "[&>*]:bg-purple-500",
  },
  {
    key: "computed",
    label: "Обчислювані",
    icon: Sparkles,
    colorClass: "text-emerald-700 dark:text-emerald-400",
    bgClass: "bg-emerald-100 dark:bg-emerald-900/30",
    progressClass: "[&>*]:bg-emerald-500",
  },
  {
    key: "manual",
    label: "Ручне введення",
    icon: Edit,
    colorClass: "text-amber-700 dark:text-amber-400",
    bgClass: "bg-amber-100 dark:bg-amber-900/30",
    progressClass: "[&>*]:bg-amber-500",
  },
];

const calculateFieldStats = (fields: UnifiedTemplateField[]): FieldStats => {
  const bySource = {
    cabinet: fields.filter(f => f.source === "cabinet").length,
    contractor: fields.filter(f => f.source === "contractor").length,
    computed: fields.filter(f => f.source === "computed").length,
    manual: fields.filter(f => f.source === "manual").length,
  };

  return {
    total: fields.length,
    bySource,
    required: fields.filter(f => f.required).length,
    optional: fields.filter(f => !f.required).length,
    hasPositions: fields.some(f => f.fieldType === "positions"),
    hasSignature: fields.some(f => f.group === "signatures"),
  };
};

export const FieldCoverageWidget = ({
  fields,
  onFieldClick,
  onNavigateToFields,
  className,
}: FieldCoverageWidgetProps) => {
  const stats = useMemo(() => calculateFieldStats(fields), [fields]);
  
  // Calculate auto-fill percentage (cabinet + contractor + computed)
  const autoFillCount = stats.bySource.cabinet + stats.bySource.contractor + stats.bySource.computed;
  const autoFillPercentage = stats.total > 0 ? Math.round((autoFillCount / stats.total) * 100) : 0;

  if (stats.total === 0) {
    return (
      <Card className={cn("overflow-hidden", className)} data-section="field-coverage">
        <CardHeader className="pb-2 px-3 sm:px-6">
          <CardTitle className="text-sm flex items-center gap-2">
            <PieChart className="w-4 h-4 text-primary" />
            <span className="hidden sm:inline">Покриття полів</span>
            <span className="sm:hidden">Поля</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 sm:px-6">
          <p className="text-sm text-muted-foreground">
            Поля шаблону ще не визначені
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("overflow-hidden", className)} data-section="field-coverage">
      {/* Compact Header with inline percentage */}
      <CardHeader className="pb-2 px-3 sm:px-6">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <PieChart className="w-4 h-4 text-primary" />
            <span className="hidden sm:inline">Покриття полів</span>
            <span className="sm:hidden">Поля</span>
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs font-medium">
              {autoFillPercentage}% авто
            </Badge>
            {onNavigateToFields && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7"
                onClick={onNavigateToFields}
              >
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 px-3 sm:px-6">
        {/* Compact Auto-fill progress with inline count */}
        <div className="flex items-center gap-2">
          <Progress 
            value={autoFillPercentage} 
            className="h-2 flex-1 [&>*]:bg-primary"
          />
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {autoFillCount}/{stats.total}
          </span>
        </div>

        {/* Inline Source Breakdown - 1 row per source */}
        <div className="space-y-2">
          {SOURCE_CONFIGS.map(config => {
            const count = stats.bySource[config.key];
            if (count === 0) return null;
            
            const percentage = Math.round((count / stats.total) * 100);
            const Icon = config.icon;

            return (
              <div key={config.key} className="flex items-center gap-2">
                <div className={cn(
                  "w-5 h-5 rounded flex items-center justify-center shrink-0",
                  config.bgClass
                )}>
                  <Icon className={cn("w-3 h-3", config.colorClass)} />
                </div>
                <span className="text-xs sm:text-sm truncate min-w-0 flex-shrink">
                  {config.label}
                </span>
                <Progress 
                  value={percentage} 
                  className={cn("h-1.5 flex-1 min-w-[60px]", config.progressClass)}
                />
                <span className="text-xs text-muted-foreground tabular-nums shrink-0">
                  {count}
                </span>
              </div>
            );
          })}
        </div>

        {/* Compact Required/Optional + Feature badges in one row */}
        <div className="flex items-center flex-wrap gap-x-3 gap-y-1.5 pt-2 border-t text-xs">
          <div className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span className="font-medium">{stats.required}</span>
            <span className="text-muted-foreground hidden sm:inline">обов.</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Circle className="w-3.5 h-3.5" />
            <span>{stats.optional}</span>
            <span className="hidden sm:inline">опц.</span>
          </div>
          
          {stats.hasPositions && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5">
              📋
            </Badge>
          )}
          {stats.hasSignature && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5">
              ✍️
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
