import { useMemo } from "react";
import { Sparkles, CheckCircle2, MessageSquare, Columns2, AlertCircle } from "lucide-react";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { format, isToday, parseISO } from "date-fns";
import { uk } from "date-fns/locale";
import type { IntelligenceCardHeaderProps } from "./types";

export const IntelligenceCardHeader = ({
  analysisTime,
  checklist,
  isComplete = false,
  onAskAI,
  onOpenSideBySide,
  hasFieldsToReview = false,
}: IntelligenceCardHeaderProps) => {
  const hasChecklist = checklist && checklist.totalItems > 0;
  const fieldsToReviewCount = hasFieldsToReview ? 1 : 0; // Simplified - actual count would come from props
  
  // Format analysis time with context
  const formattedTime = useMemo(() => {
    if (!analysisTime) return null;
    
    // Handle both HH:mm format and ISO date strings
    if (analysisTime.includes(":") && !analysisTime.includes("-")) {
      // Already formatted as HH:mm, return with "сьогодні" prefix
      return `сьогодні о ${analysisTime}`;
    }
    
    try {
      const date = parseISO(analysisTime);
      if (isToday(date)) {
        return `сьогодні о ${format(date, "HH:mm")}`;
      }
      return `${format(date, "d MMM", { locale: uk })} о ${format(date, "HH:mm")}`;
    } catch {
      return analysisTime;
    }
  }, [analysisTime]);
  
  return (
    <CardHeader className="pb-2 sm:pb-3">
      <div className="flex items-center justify-between gap-2">
        {/* Left: Title */}
        <CardTitle className={cn(
          "text-sm flex items-center gap-2",
          isComplete && "text-emerald-700 dark:text-emerald-300"
        )}>
          {isComplete ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          ) : (
            <Sparkles className="w-4 h-4 text-primary" />
          )}
          Резюме документа
        </CardTitle>
        
        {/* Right: Actions + Verification Status + Timestamp */}
        <div className="flex items-center gap-2">
          {/* Verification Status Badge - clear text instead of "0/1" */}
          {onOpenSideBySide && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={hasFieldsToReview ? "secondary" : "ghost"}
                    size="sm"
                    className={cn(
                      "h-7 gap-1.5 text-xs",
                      hasFieldsToReview && "bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-950/30 dark:text-amber-400"
                    )}
                    onClick={onOpenSideBySide}
                  >
                    {hasFieldsToReview ? (
                      <>
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Перевірити</span>
                        <span className="sm:hidden">{fieldsToReviewCount}</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="hidden sm:inline">Верифіковано</span>
                      </>
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {hasFieldsToReview 
                    ? "Є поля, що потребують перевірки" 
                    : "AI-дані верифіковано з оригіналом"}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          
          {/* Ask AI Button - primary action */}
          {onAskAI && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="default"
                    size="sm"
                    className="h-7 gap-1.5 text-xs"
                    onClick={onAskAI}
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Запитати AI</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Запитати AI про документ</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          
          {/* AI Timestamp with full context */}
          <Badge variant="secondary" className="text-[10px] gap-1">
            <Sparkles className="w-3 h-3" />
            <span className="hidden sm:inline">{formattedTime}</span>
            <span className="sm:hidden">{analysisTime}</span>
          </Badge>
        </div>
      </div>
    </CardHeader>
  );
};
