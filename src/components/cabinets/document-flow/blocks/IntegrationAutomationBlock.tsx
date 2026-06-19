/**
 * IntegrationAutomationBlock — Блок 4: "Автоматизація та правила (AI / автодії)"
 * Показує автоматичні правила та AI-сценарії
 */

import { 
  Zap, Check, AlertTriangle, XCircle, Clock, Calendar,
  Play, Sparkles
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { uk } from "date-fns/locale";
import type { 
  AutomationRule, 
  AutomationTriggerType, 
  AutomationResultStatus 
} from "@/config/documentFlowConfig";

interface IntegrationAutomationBlockProps {
  rules?: AutomationRule[];
  className?: string;
}

const triggerLabels: Record<AutomationTriggerType, string> = {
  on_create: "При створенні",
  on_status_change: "При зміні статусу",
  scheduled: "За розкладом",
  integration_event: "За подією інтеграції",
};

const resultConfig: Record<AutomationResultStatus, {
  label: string;
  icon: typeof Check;
  color: string;
  bgColor: string;
}> = {
  success: {
    label: "Успішно",
    icon: Check,
    color: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-emerald-50 dark:bg-emerald-950/50",
  },
  warning: {
    label: "З попередженнями",
    icon: AlertTriangle,
    color: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-50 dark:bg-amber-950/50",
  },
  error: {
    label: "Помилка",
    icon: XCircle,
    color: "text-destructive",
    bgColor: "bg-destructive/10",
  },
  pending: {
    label: "Очікує виконання",
    icon: Clock,
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-50 dark:bg-blue-950/50",
  },
  scheduled: {
    label: "Заплановано",
    icon: Calendar,
    color: "text-muted-foreground",
    bgColor: "bg-muted/50",
  },
};

export const IntegrationAutomationBlock = ({
  rules = [],
  className,
}: IntegrationAutomationBlockProps) => {
  if (rules.length === 0) {
    return (
      <Card className={cn("border-border/50", className)} data-section="document-integration-automation">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Zap className="w-4 h-4 text-primary" />
            Автоматизація та правила
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            Немає активних правил автоматизації
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("border-border/50", className)} data-section="document-integration-automation">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Zap className="w-4 h-4 text-primary" />
          Автоматизація та правила
          <Badge variant="secondary" className="ml-auto text-[10px]">
            {rules.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border/50">
          {rules.map((rule, index) => {
            const result = rule.lastResult ? resultConfig[rule.lastResult] : null;
            const ResultIcon = result?.icon || Play;
            const isAIRule = rule.ruleName.toLowerCase().includes("ai");
            
            return (
              <div 
                key={`${rule.ruleName}-${index}`}
                className="px-4 py-3"
              >
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div className={cn(
                    "w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                    isAIRule 
                      ? "bg-purple-100 dark:bg-purple-950/50" 
                      : "bg-muted/50"
                  )}>
                    {isAIRule ? (
                      <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                    ) : (
                      <Zap className="w-3.5 h-3.5 text-muted-foreground" />
                    )}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium">{rule.ruleName}</span>
                      <Badge variant="outline" className="text-[10px]">
                        {triggerLabels[rule.triggerType]}
                      </Badge>
                    </div>
                    
                    {/* Last run / scheduled info */}
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      {rule.lastRunAt && (
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(rule.lastRunAt), "dd.MM.yy HH:mm", { locale: uk })}
                        </span>
                      )}
                      {rule.scheduledAt && rule.lastResult === "scheduled" && (
                        <span className="text-xs text-muted-foreground">
                          Заплановано: {format(new Date(rule.scheduledAt), "dd.MM.yy", { locale: uk })}
                        </span>
                      )}
                    </div>
                    
                    {/* Actions summary */}
                    {rule.actionsSummary && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {rule.actionsSummary}
                      </p>
                    )}
                  </div>
                  
                  {/* Result badge */}
                  {result && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge 
                            variant="outline" 
                            className={cn(
                              "gap-1 border-0 shrink-0",
                              result.color,
                              result.bgColor
                            )}
                          >
                            <ResultIcon className="w-3 h-3" />
                            <span className="hidden sm:inline">{result.label}</span>
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{result.label}</p>
                          {rule.actionsSummary && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {rule.actionsSummary}
                            </p>
                          )}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
