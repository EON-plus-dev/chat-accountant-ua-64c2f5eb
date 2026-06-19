import { useMemo } from "react";
import { Bot, CalendarClock, Loader2, ChevronRight, Sparkles, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  type ScheduledGeneration,
  getGenerationQueueStats,
  formatTimeUntilGeneration,
  getReportTypeShortLabel,
  getDaysUntilGeneration,
  GENERATION_CONFIG,
} from "@/lib/reportGenerationScheduler";

interface AutomationStatusBannerProps {
  schedule: ScheduledGeneration[];
  onGenerateNow?: (scheduled: ScheduledGeneration) => void;
  onViewQueue?: () => void;
  className?: string;
}

export function AutomationStatusBanner({
  schedule,
  onGenerateNow,
  onViewQueue,
  className,
}: AutomationStatusBannerProps) {
  const stats = useMemo(() => getGenerationQueueStats(schedule), [schedule]);

  // Якщо немає запланованих генерацій
  if (!stats.nextGeneration && stats.pendingCount === 0) {
    return null;
  }

  const { nextGeneration, pendingCount, inProgressCount } = stats;
  const isProcessing = inProgressCount > 0;

  // Прогрес до генерації (0-100)
  const progressToGeneration = useMemo(() => {
    if (!nextGeneration) return 100;
    const daysUntil = getDaysUntilGeneration(nextGeneration);
    const totalDays = GENERATION_CONFIG.DAYS_BEFORE_DEADLINE;
    if (daysUntil <= 0) return 100;
    return Math.max(0, Math.min(100, ((totalDays - daysUntil) / totalDays) * 100));
  }, [nextGeneration]);

  return (
    <Card className={cn("border-primary/20 bg-primary/5", className)}>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* AI Icon */}
          <div className="flex-shrink-0">
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center",
              isProcessing 
                ? "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400" 
                : "bg-primary/10 text-primary"
            )}>
              {isProcessing ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Bot className="h-5 w-5" />
              )}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-medium text-sm">
                {isProcessing ? "AI формує звіт..." : "Автоматична генерація"}
              </h4>
              <Badge variant="outline" className="text-xs">
                <Sparkles className="h-3 w-3 mr-1" />
                Автоматично
              </Badge>
            </div>

            {/* Processing State */}
            {isProcessing && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Обробляється {inProgressCount} {inProgressCount === 1 ? "звіт" : "звіти"}
                </p>
                <Progress value={45} className="h-1.5" />
              </div>
            )}

            {/* Next Generation */}
            {!isProcessing && nextGeneration && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  AI сформує{" "}
                  <span className="font-medium text-foreground">
                    {getReportTypeShortLabel(nextGeneration.reportType)} {nextGeneration.period}
                  </span>{" "}
                  <span className="text-primary font-medium">
                    {formatTimeUntilGeneration(nextGeneration)}
                  </span>
                </p>

                {/* Progress bar */}
                <div className="flex items-center gap-2">
                  <Progress value={progressToGeneration} className="h-1.5 flex-1" />
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    <Clock className="h-3 w-3 inline mr-1" />
                    {getDaysUntilGeneration(nextGeneration) <= 0 
                      ? "Готово" 
                      : `${getDaysUntilGeneration(nextGeneration)} дн.`
                    }
                  </span>
                </div>

                {/* Queue info */}
                {pendingCount > 1 && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <CalendarClock className="h-3 w-3" />
                    Ще {pendingCount - 1} {pendingCount - 1 === 1 ? "звіт" : "звітів"} у черзі
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex-shrink-0 flex items-center gap-2">
            {!isProcessing && nextGeneration && getDaysUntilGeneration(nextGeneration) <= 3 && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onGenerateNow?.(nextGeneration)}
              >
                Згенерувати зараз
              </Button>
            )}
            {pendingCount > 0 && (
              <Button
                size="sm"
                variant="ghost"
                onClick={onViewQueue}
                className="text-muted-foreground"
              >
                Черга
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
