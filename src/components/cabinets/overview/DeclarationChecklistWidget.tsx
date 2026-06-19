/**
 * DeclarationChecklistWidget
 * Shows automated document checklist for individual cabinets.
 * Analyzes uploaded documents to determine which tax scenarios are active
 * and what documents are missing.
 */

import { useMemo, useState } from "react";
import {
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  Upload,
  HelpCircle,
  ClipboardCheck,
  ExternalLink,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import type { Document } from "@/config/documentFlowConfig";
import {
  analyzeDocumentsForDeclaration,
  type ScenarioAnalysisResult,
} from "@/config/declarationChecklistConfig";

interface DeclarationChecklistWidgetProps {
  documents: Document[];
  onNavigateToDocuments?: () => void;
  onChatPromptInsert?: (prompt: string) => void;
  className?: string;
}

function ScenarioBlock({
  result,
  onNavigateToDocuments,
  onChatPromptInsert,
}: {
  result: ScenarioAnalysisResult;
  onNavigateToDocuments?: () => void;
  onChatPromptInsert?: (prompt: string) => void;
}) {
  const [open, setOpen] = useState(result.missingCount > 0);
  const Icon = result.scenario.icon;
  const isComplete = result.completionPercent === 100;

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <button
          className={cn(
            "w-full flex items-center gap-3 p-3 rounded-lg border transition-colors text-left",
            isComplete
              ? "border-border/50 bg-muted/20 hover:bg-muted/30"
              : "border-border hover:border-primary/30 hover:bg-muted/30"
          )}
        >
          <div
            className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
              isComplete ? "bg-emerald-100 dark:bg-emerald-950/50" : "bg-primary/10"
            )}
          >
            <Icon
              className={cn(
                "w-4 h-4",
                isComplete
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-primary"
              )}
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">{result.scenario.title}</span>
              <span className="text-[10px] text-muted-foreground font-mono">
                {result.scenario.taxArticle}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <Progress value={result.completionPercent} className="h-1 flex-1 max-w-[120px]" />
              <span className="text-xs text-muted-foreground tabular-nums">
                {result.completionPercent}%
              </span>
            </div>
          </div>

          {result.missingCount > 0 && (
            <Badge variant="warning" size="sm">
              {result.missingCount} бракує
            </Badge>
          )}
          {result.optionalMissingCount > 0 && result.missingCount === 0 && (
            <Badge variant="outline" size="sm">
              {result.optionalMissingCount} рекоменд.
            </Badge>
          )}
          {isComplete && (
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          )}

          <ChevronDown
            className={cn(
              "w-4 h-4 text-muted-foreground transition-transform shrink-0",
              open && "rotate-180"
            )}
          />
        </button>
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="pl-11 pr-3 pb-1 pt-2 space-y-1.5">
          {result.documents.map((docResult) => {
            const isFound = docResult.status === "found";
            const isOptionalMissing = docResult.status === "optional-missing";

            return (
              <div
                key={docResult.required.id}
                className="flex items-start gap-2 py-1.5"
              >
                {isFound ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                ) : isOptionalMissing ? (
                  <HelpCircle className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                )}

                <div className="flex-1 min-w-0">
                  <p
                    className={cn(
                      "text-sm",
                      isFound
                        ? "text-muted-foreground line-through"
                        : "text-foreground font-medium"
                    )}
                  >
                    {docResult.required.label}
                    {isOptionalMissing && (
                      <span className="text-xs text-muted-foreground ml-1">(рекомендовано)</span>
                    )}
                  </p>
                  {!isFound && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {docResult.required.description}
                    </p>
                  )}
                </div>

                {!isFound && (
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 gap-1 text-xs"
                      onClick={() => onNavigateToDocuments?.()}
                    >
                      <Upload className="w-3 h-3" />
                      <span className="hidden sm:inline">Завантажити</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={() =>
                        onChatPromptInsert?.(
                          `Поясни, навіщо потрібен "${docResult.required.label}" для сценарію "${result.scenario.title}" (${result.scenario.taxArticle})`
                        )
                      }
                    >
                      <HelpCircle className="w-3 h-3" />
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

export function DeclarationChecklistWidget({
  documents,
  onNavigateToDocuments,
  onChatPromptInsert,
  className,
}: DeclarationChecklistWidgetProps) {
  const analysis = useMemo(
    () => analyzeDocumentsForDeclaration(documents),
    [documents]
  );

  if (analysis.activeScenarios.length === 0) return null;

  return (
    <Card className={cn("border-border", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-base">
          <div className="flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-primary" />
            Чекліст документів для декларації
          </div>
          {analysis.readyToFile ? (
            <Badge variant="success" size="sm">
              Готово до подачі
            </Badge>
          ) : (
            <Badge variant="warning" size="sm">
              {analysis.totalMissing} бракує
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Загальна готовність</span>
            <span className="font-semibold tabular-nums">{analysis.completionPercent}%</span>
          </div>
          <Progress value={analysis.completionPercent} className="h-2" />
          <p className="text-xs text-muted-foreground">
            {analysis.activeScenarios.length} сценаріїв виявлено · {analysis.totalFound} з {analysis.totalRequired} обов'язкових документів
            {analysis.totalOptionalMissing > 0 && ` · ${analysis.totalOptionalMissing} рекомендованих`}
          </p>
        </div>

        {/* Scenarios */}
        <div className="space-y-2">
          {analysis.activeScenarios
            .sort((a, b) => a.completionPercent - b.completionPercent)
            .map((result) => (
              <ScenarioBlock
                key={result.scenario.id}
                result={result}
                onNavigateToDocuments={onNavigateToDocuments}
                onChatPromptInsert={onChatPromptInsert}
              />
            ))}
        </div>

        {/* Ready state */}
        {analysis.readyToFile && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
            <div className="flex-1">
              <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                Усі обов'язкові документи зібрано
              </span>
              <p className="text-xs text-emerald-600/80 dark:text-emerald-400/60 mt-0.5">
                Можна формувати декларацію
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="shrink-0 gap-1.5"
              onClick={() => {
                toast({
                  title: "Формування декларації",
                  description: "Перехід до генерації чернетки декларації",
                });
              }}
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Декларація
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
