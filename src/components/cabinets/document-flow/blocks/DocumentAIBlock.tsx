import { useState } from "react";
import { Sparkles, ChevronDown, ChevronUp, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { DocumentSummaryCard } from "../DocumentSummaryCard";
import { DocumentChecklistCard } from "../DocumentChecklistCard";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import type { DocumentSummary, ContractSummary, DocumentChecklist, ChecklistItem } from "@/types/documentSummary";

interface DocumentAIBlockProps {
  summary?: DocumentSummary | ContractSummary;
  checklist?: DocumentChecklist;
  compact?: boolean;
  defaultExpanded?: boolean;
  onAction?: (item: ChecklistItem) => void;
  className?: string;
}

export const DocumentAIBlock = ({
  summary,
  checklist,
  compact = false,
  defaultExpanded = true,
  onAction,
  className,
}: DocumentAIBlockProps) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const handleAction = (item: ChecklistItem) => {
    if (onAction) {
      onAction(item);
    } else {
      toast({ title: item.action.label, description: item.description });
    }
  };

  if (!summary && !checklist) {
    return (
      <Card className={cn("overflow-hidden", className)}>
        <CardContent className="p-6 text-center">
          <Sparkles className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            AI-аналіз недоступний для цього документа
          </p>
        </CardContent>
      </Card>
    );
  }

  // Compact mode - show only warnings and critical items
  if (compact) {
    const criticalItems = checklist?.items.filter(i => i.priority === "critical" && i.status !== "done") || [];
    const warnings = summary?.compliance?.warnings || [];
    const hasIssues = criticalItems.length > 0 || warnings.length > 0;

    return (
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <Card className={cn("overflow-hidden", className)}>
          <CollapsibleTrigger asChild>
            <CardHeader className="pb-3 cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  AI-аналіз
                </CardTitle>
                <div className="flex items-center gap-2">
                  {summary && (
                    <Badge 
                      variant="secondary" 
                      className={cn(
                        "text-xs",
                        summary.confidence >= 90 
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400"
                          : summary.confidence >= 75
                          ? "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400"
                          : "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400"
                      )}
                    >
                      {summary.confidence}%
                    </Badge>
                  )}
                  {hasIssues && (
                    <Badge variant="destructive" className="text-xs">
                      {criticalItems.length + warnings.length}
                    </Badge>
                  )}
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          
          <CollapsibleContent>
            <CardContent className="pt-0 space-y-4">
              {/* Short Summary */}
              {summary && (
                <p className="text-sm text-muted-foreground">
                  {summary.shortSummary}
                </p>
              )}

              {/* Warnings */}
              {warnings.length > 0 && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
                  <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    {warnings.map((warning, i) => (
                      <p key={i} className="text-sm text-amber-800 dark:text-amber-200">{warning}</p>
                    ))}
                  </div>
                </div>
              )}

              {/* Critical Checklist Items */}
              {criticalItems.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
                    Критичні завдання
                  </p>
                  {criticalItems.slice(0, 3).map(item => (
                    <div 
                      key={item.id}
                      className="flex items-center gap-2 p-2 rounded-md bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800"
                    >
                      <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                      <span className="text-sm flex-1 truncate">{item.title}</span>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-7 text-xs shrink-0"
                        onClick={() => handleAction(item)}
                      >
                        {item.action.label}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    );
  }

  // Full mode
  return (
    <div className={cn("space-y-4", className)}>
      {summary && <DocumentSummaryCard summary={summary} />}
      {checklist && (
        <DocumentChecklistCard 
          checklist={checklist}
          onAction={handleAction}
        />
      )}
    </div>
  );
};
