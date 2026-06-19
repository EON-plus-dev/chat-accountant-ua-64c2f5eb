import { FileSearch, ChevronDown, Columns2, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { FieldConfidenceBreakdown } from "../FieldConfidenceBreakdown";
import type { IntelligenceCardExtractionProps } from "./types";

export const IntelligenceCardExtraction = ({
  fieldConfidences,
  onNavigateToFieldInPdf,
  onOpenSideBySide,
}: IntelligenceCardExtractionProps) => {
  if (!fieldConfidences || fieldConfidences.length === 0) {
    return null;
  }

  const fieldsNeedingReview = fieldConfidences.filter(
    f => f.needsReview || f.confidence < 80
  );
  
  const verifiedFields = fieldConfidences.filter(
    f => !f.needsReview && f.confidence >= 80
  );

  return (
    <Collapsible>
      <CollapsibleTrigger asChild>
        <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30 hover:bg-muted/50 cursor-pointer transition-colors">
          <div className="flex items-center gap-2">
            <FileSearch className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">Деталі витягування</span>
            {fieldsNeedingReview.length > 0 && (
              <Badge 
                variant="secondary" 
                className="text-[10px] bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300"
              >
                {fieldsNeedingReview.length} потребує перевірки
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {onOpenSideBySide && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-xs gap-1"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenSideBySide();
                }}
              >
                <Columns2 className="w-3.5 h-3.5" />
                Верифікація
              </Button>
            )}
            {/* Verified fields indicator with tooltip for clarity */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="outline" className="text-[10px] gap-1 cursor-help">
                    <Eye className="w-3 h-3" />
                    {verifiedFields.length}/{fieldConfidences.length}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">
                    Перевірено <span className="font-medium">{verifiedFields.length}</span> з{" "}
                    <span className="font-medium">{fieldConfidences.length}</span> витягнутих полів
                  </p>
                  {fieldsNeedingReview.length > 0 && (
                    <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                      ⚠ {fieldsNeedingReview.length} потребує перевірки
                    </p>
                  )}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          </div>
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-3">
        <FieldConfidenceBreakdown
          fields={fieldConfidences}
          onSelectAlternative={(fieldName, newValue) => {
            if (import.meta.env.DEV) console.log("Selected alternative:", fieldName, newValue);
          }}
          onFieldClick={(field) => {
            if (onNavigateToFieldInPdf) {
              onNavigateToFieldInPdf(field);
            }
          }}
        />
      </CollapsibleContent>
    </Collapsible>
  );
};
