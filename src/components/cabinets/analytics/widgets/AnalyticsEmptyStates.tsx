import { CalendarX2, Lock, Clock, AlertTriangle, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Full-block empty states                                           */
/* ------------------------------------------------------------------ */

interface AnalyticsEmptyStateProps {
  onPrimaryAction?: () => void;
  onSecondaryAction?: () => void;
  metricLabel?: string;
  className?: string;
}

/** Обраний період не містить даних */
export const NoDataForPeriod = ({
  onPrimaryAction,
  onSecondaryAction,
  className,
}: AnalyticsEmptyStateProps) => (
  <div
    className={cn(
      "flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/20 p-8 text-center space-y-3",
      className,
    )}
  >
    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
      <CalendarX2 className="w-6 h-6 text-muted-foreground" />
    </div>
    <p className="text-sm font-medium text-foreground">
      За обраний період даних немає
    </p>
    <p className="text-xs text-muted-foreground max-w-xs">
      Спробуйте змінити період або підключіть додаткове джерело даних.
    </p>
    <div className="flex flex-wrap gap-2 justify-center pt-1">
      {onPrimaryAction && (
        <Button variant="outline" size="sm" onClick={onPrimaryAction}>
          Змінити період
        </Button>
      )}
      {onSecondaryAction && (
        <Button variant="ghost" size="sm" onClick={onSecondaryAction}>
          Підключити джерело
        </Button>
      )}
    </div>
  </div>
);

/** Метрика недоступна — потрібна інтеграція */
export const MetricLocked = ({
  metricLabel,
  onPrimaryAction,
  className,
}: AnalyticsEmptyStateProps) => (
  <div
    className={cn(
      "flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/20 p-8 text-center space-y-3",
      className,
    )}
  >
    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
      <Lock className="w-6 h-6 text-muted-foreground" />
    </div>
    <p className="text-sm font-medium text-foreground">
      {metricLabel
        ? `${metricLabel} — недоступно`
        : "Метрика недоступна"}
    </p>
    <p className="text-xs text-muted-foreground max-w-xs">
      Для цієї метрики потрібна додаткова інтеграція.
    </p>
    {onPrimaryAction && (
      <Button variant="outline" size="sm" onClick={onPrimaryAction}>
        Підключити
      </Button>
    )}
  </div>
);

/** Розбіжність даних між джерелами */
export const HighDiscrepancy = ({
  onPrimaryAction,
  className,
}: AnalyticsEmptyStateProps) => (
  <div
    className={cn(
      "flex flex-col items-center justify-center rounded-lg border border-dashed border-warning/40 bg-warning/5 p-8 text-center space-y-3",
      className,
    )}
  >
    <div className="w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center">
      <AlertTriangle className="w-6 h-6 text-warning" />
    </div>
    <p className="text-sm font-medium text-foreground">
      Виявлено розбіжності в даних
    </p>
    <p className="text-xs text-muted-foreground max-w-xs">
      Дані з різних джерел не збігаються. Перевірте налаштування інтеграцій.
    </p>
    {onPrimaryAction && (
      <Button variant="outline" size="sm" onClick={onPrimaryAction}>
        Переглянути джерела
      </Button>
    )}
  </div>
);

/* ------------------------------------------------------------------ */
/*  Inline compact states (badges / chips)                            */
/* ------------------------------------------------------------------ */

interface InlineEmptyStateProps {
  requiredMonths?: number;
  className?: string;
}

/** Недостатньо історії для seasonality pattern */
export const InsufficientHistory = ({
  requiredMonths = 12,
  className,
}: InlineEmptyStateProps) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge
          variant="outline"
          className={cn(
            "gap-1 cursor-default opacity-60 select-none",
            className,
          )}
        >
          <Clock className="w-3 h-3" />
          Сезонність
        </Badge>
      </TooltipTrigger>
      <TooltipContent>
        Потрібно ≥&nbsp;{requiredMonths} місяців історії
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

/** Недостатньо даних для прогнозу */
export const ForecastUnavailable = ({ className }: InlineEmptyStateProps) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge
          variant="outline"
          className={cn(
            "gap-1 cursor-default opacity-60 select-none",
            className,
          )}
        >
          <TrendingUp className="w-3 h-3" />
          Прогноз
        </Badge>
      </TooltipTrigger>
      <TooltipContent>Недостатньо даних для прогнозу</TooltipContent>
    </Tooltip>
  </TooltipProvider>
);
