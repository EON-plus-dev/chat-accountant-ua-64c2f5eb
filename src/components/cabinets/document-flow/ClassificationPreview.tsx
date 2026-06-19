/**
 * ClassificationPreview — відображення результатів автокласифікації
 * в review step завантаження документа.
 */

import { useState } from "react";
import {
  Briefcase, Home, TrendingUp, Building2, CircleDot,
  Tag, AlertTriangle, ShieldCheck, ArrowRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import type {
  UploadClassificationResult,
  CabinetUpdate,
  IncomeSourceType,
} from "@/lib/documentAnalysis/classifyUploadedDocument";

interface ClassificationPreviewProps {
  classification: UploadClassificationResult;
  onUpdatesConfirm?: (updates: CabinetUpdate[]) => void;
}

const INCOME_ICONS: Record<IncomeSourceType, React.ElementType> = {
  salary: Briefcase,
  rent: Home,
  investment: TrendingUp,
  business: Building2,
  other: CircleDot,
};

export const ClassificationPreview = ({
  classification,
  onUpdatesConfirm,
}: ClassificationPreviewProps) => {
  const [selectedUpdates, setSelectedUpdates] = useState<Set<number>>(
    () => new Set(classification.cabinetUpdates.map((_, i) => i))
  );

  const toggleUpdate = (index: number) => {
    setSelectedUpdates((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const IncomeIcon = classification.incomeSource
    ? INCOME_ICONS[classification.incomeSource.type]
    : null;

  const hasContent =
    classification.incomeSource ||
    classification.taxScenario ||
    classification.cabinetUpdates.length > 0 ||
    classification.warnings.length > 0;

  if (!hasContent) return null;

  return (
    <Card className="border-primary/20">
      <CardContent className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-primary" />
          <span className="font-medium text-sm">Автокласифікація</span>
          <Badge variant="outline" className="ml-auto text-[10px]">
            {classification.categoryLabel}
          </Badge>
        </div>

        {/* Income Source + Tax Scenario row */}
        {(classification.incomeSource || classification.taxScenario) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Income Source */}
            {classification.incomeSource && IncomeIcon && (
              <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <IncomeIcon className="w-4.5 h-4.5 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] text-muted-foreground uppercase tracking-wide">
                    Джерело доходу
                  </p>
                  <p className="text-sm font-medium truncate">
                    {classification.incomeSource.label}
                  </p>
                </div>
              </div>
            )}

            {/* Tax Scenario */}
            {classification.taxScenario && (
              <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
                <div className="w-9 h-9 rounded-lg bg-accent/50 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-foreground">
                    {classification.taxScenario.rate.split("+")[0].trim()}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] text-muted-foreground uppercase tracking-wide">
                    Податковий сценарій
                  </p>
                  <p className="text-sm font-medium truncate">
                    {classification.taxScenario.label}
                  </p>
                  {classification.taxScenario.militaryTax && (
                    <p className="text-[11px] text-muted-foreground">
                      + {classification.taxScenario.militaryTax}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tags */}
        {classification.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {classification.tags.map((tag) => (
              <Badge key={tag} variant="secondary" size="sm" className="gap-1">
                <Tag className="w-3 h-3" />
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Warnings */}
        {classification.warnings.length > 0 && (
          <div className="space-y-2">
            {classification.warnings.map((warning, i) => (
              <div
                key={i}
                className="flex items-start gap-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-2.5"
              >
                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                <p className="text-xs text-amber-700 dark:text-amber-300">{warning}</p>
              </div>
            ))}
          </div>
        )}

        {/* Cabinet Updates */}
        {classification.cabinetUpdates.length > 0 && (
          <div className="space-y-2 pt-2 border-t">
            <p className="text-xs font-medium text-muted-foreground">
              Рекомендовані оновлення профілю
            </p>
            {classification.cabinetUpdates.map((update, index) => (
              <label
                key={index}
                className={cn(
                  "flex items-start gap-3 rounded-lg p-2.5 cursor-pointer transition-colors",
                  selectedUpdates.has(index)
                    ? "bg-primary/5 border border-primary/20"
                    : "bg-muted/30 border border-transparent"
                )}
              >
                <Checkbox
                  checked={selectedUpdates.has(index)}
                  onCheckedChange={() => toggleUpdate(index)}
                  className="mt-0.5"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <ArrowRight className="w-3 h-3 text-primary shrink-0" />
                    <span className="text-sm font-medium">{update.label}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {update.description}
                  </p>
                </div>
              </label>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
