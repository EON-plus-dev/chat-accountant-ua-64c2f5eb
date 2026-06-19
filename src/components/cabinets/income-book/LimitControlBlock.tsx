import { TrendingUp, AlertTriangle, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { type MonthlyAggregate } from "@/config/incomeBookConfig";
import type { Cabinet } from "@/types/cabinet";
import { 
  validateIncomeLimit, 
  FOP_INCOME_LIMITS,
  formatCurrency,
  type IncomeLimitStatus,
} from "@/lib/businessRules";

interface LimitControlBlockProps {
  cabinet: Cabinet;
  yearlyAggregates: MonthlyAggregate[];
  selectedYear?: number;
  onChatPromptInsert?: (prompt: string) => void;
  onNavigateToAnalytics?: () => void;
  isMobile?: boolean;
}

const monthNames = [
  "", "січень", "лютий", "березень", "квітень", "травень", 
  "червень", "липень", "серпень", "вересень", "жовтень", "листопад", "грудень"
];

export const LimitControlBlock = ({
  cabinet,
  yearlyAggregates,
  selectedYear,
  onChatPromptInsert,
  onNavigateToAnalytics,
  isMobile,
}: LimitControlBlockProps) => {
  const displayYear = selectedYear || new Date().getFullYear();
  const fopGroup = (cabinet.fopGroup || 3) as 1 | 2 | 3;
  
  const totalIncome = yearlyAggregates.reduce((sum, agg) => sum + agg.inIncomeBook, 0);
  
  // Використовуємо централізовану валідацію лімітів
  const currentMonth = new Date().getMonth() + 1;
  const monthlyAverage = currentMonth > 0 ? totalIncome / currentMonth : 0;
  const limitValidation = validateIncomeLimit(fopGroup, totalIncome, monthlyAverage);
  
  const { limit, usedPercent, remainingAmount: remaining, monthsUntilLimit, status } = limitValidation;
  
  const limitExhaustMonth = monthsUntilLimit !== null && monthsUntilLimit > 0 && currentMonth + monthsUntilLimit <= 12
    ? currentMonth + monthsUntilLimit
    : null;

  const getProgressColor = () => {
    switch (status) {
      case 'exceeded':
      case 'critical':
        return "bg-destructive";
      case 'warning':
        return "bg-amber-500";
      default:
        return "bg-emerald-500";
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'exceeded':
        return "Ліміт вичерпано!";
      case 'critical':
        return "Критично близько до ліміту";
      case 'warning':
        return "Уважно: понад 75% ліміту";
      default:
        return "В межах норми";
    }
  };

  const getForecastText = () => {
    if (usedPercent >= 100) return "Вичерпано";
    if (!limitExhaustMonth) return "До кінця року";
    return `~${monthNames[limitExhaustMonth]}`;
  };

  // Контекстні AI chips
  const getContextualChips = () => {
    if (status === 'exceeded' || status === 'critical') {
      return [
        { label: "Що робити при перевищенні?", prompt: "Що робити якщо ФОП перевищив ліміт доходу?" },
        { label: "Перехід на іншу групу", prompt: "Як ФОП перейти на іншу групу оподаткування?" },
      ];
    }
    if (status === 'warning') {
      return [
        { label: "Як оптимізувати доходи?", prompt: "Як ФОП оптимізувати доходи до кінця року?" },
        { label: "Ризики перевищення", prompt: "Поясни ризики перевищення ліміту ФОП" },
      ];
    }
    return [
      { label: "Як розраховується ліміт?", prompt: "Як розраховується ліміт доходу ФОП за групами?" },
      { label: "Порівняй групи ФОП", prompt: "Порівняй групи ФОП за лімітами та податками" },
    ];
  };

  const chips = getContextualChips();

  // Останні 3 місяці для mobile
  const lastThreeMonths = yearlyAggregates.slice(-3);

  return (
    <Card className={cn(
      "mt-6 mb-4",
      status === 'exceeded' || status === 'critical'
        ? "bg-destructive/10 border-destructive/30" 
        : status === 'warning' 
          ? "bg-warning/10 border-warning/30" 
          : "bg-success/10 border-success/30"
    )}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <TrendingUp className="w-4 h-4" />
          Контроль ліміту {displayYear}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Використано ліміту</span>
            <span className={cn(
              "font-semibold",
              status === 'exceeded' || status === 'critical' ? "text-destructive" : 
              status === 'warning' ? "text-amber-600 dark:text-amber-400" : 
              "text-emerald-600 dark:text-emerald-400"
            )}>
              {usedPercent.toFixed(1)}%
            </span>
          </div>
          <div className="relative h-3 rounded-full bg-muted overflow-hidden">
            <div 
              className={cn("h-full transition-all duration-500", getProgressColor())}
              style={{ width: `${Math.min(usedPercent, 100)}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{getStatusText()}</span>
            {(status === 'warning' || status === 'critical' || status === 'exceeded') && (
              <AlertTriangle className={cn(
                "w-3.5 h-3.5",
                status === 'exceeded' || status === 'critical' ? "text-destructive" : "text-amber-500"
              )} />
            )}
          </div>
          
          {/* Recommendation from business rules */}
          {limitValidation.recommendation && (status === 'warning' || status === 'critical' || status === 'exceeded') && (
            <p className={cn(
              "text-xs mt-1",
              status === 'exceeded' || status === 'critical' ? "text-destructive" : "text-amber-600 dark:text-amber-400"
            )}>
              {limitValidation.recommendation}
            </p>
          )}
        </div>

        {/* Key metrics - 4 columns */}
        <div className={cn(
          "grid gap-3",
          isMobile ? "grid-cols-2" : "grid-cols-4"
        )}>
          <div className="p-3 bg-muted/30 rounded-lg text-center">
            <div className="text-xs text-muted-foreground mb-1">Ліміт на рік</div>
            <div className="text-sm sm:text-lg font-bold tabular-nums">{formatCurrency(limit)}</div>
          </div>
          <div className="p-3 bg-muted/30 rounded-lg text-center">
            <div className="text-xs text-muted-foreground mb-1">Використано</div>
            <div className="text-sm sm:text-lg font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
              {formatCurrency(totalIncome)}
            </div>
          </div>
          <div className="p-3 bg-muted/30 rounded-lg text-center">
            <div className="text-xs text-muted-foreground mb-1">Залишок</div>
            <div className={cn(
              "text-sm sm:text-lg font-bold tabular-nums",
              remaining === 0 ? "text-destructive" : ""
            )}>
              {formatCurrency(remaining)}
            </div>
          </div>
          <div className="p-3 bg-muted/30 rounded-lg text-center">
            <div className="text-xs text-muted-foreground mb-1">Прогноз</div>
            <div className={cn(
              "text-sm sm:text-lg font-medium",
              limitExhaustMonth ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground"
            )}>
              {getForecastText()}
            </div>
          </div>
        </div>

        {/* Mobile: last 3 months compact */}
        {isMobile && lastThreeMonths.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
            {lastThreeMonths.map((agg) => (
              <div key={agg.month} className="shrink-0 min-w-[90px] p-2 bg-background rounded-lg text-center border border-border/50">
                <div className="text-xs text-muted-foreground">{agg.label.split(" ")[0]}</div>
                <div className="text-sm font-semibold tabular-nums">
                  {formatCurrency(agg.inIncomeBook)}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CTA to analytics */}
        {!isMobile && onNavigateToAnalytics && (
          <div 
            className="flex items-center justify-between p-3 bg-background rounded-lg cursor-pointer hover:bg-muted/30 transition-colors border border-border/50"
            onClick={onNavigateToAnalytics}
          >
            <span className="text-sm text-muted-foreground">
              Детальний аналіз ризиків та прогноз
            </span>
            <Badge 
              variant="outline" 
              className="cursor-pointer hover:bg-primary/10 gap-1"
            >
              Аналітика <ArrowRight className="w-3 h-3" />
            </Badge>
          </div>
        )}

        {/* Contextual AI chips */}
        <div className="flex flex-wrap gap-2 pt-1">
          {chips.map((chip, i) => (
            <Badge
              key={i}
              variant="outline"
              className="cursor-pointer bg-background hover:bg-primary/10 hover:border-primary/50 px-3 py-1.5 text-sm"
              onClick={() => onChatPromptInsert?.(chip.prompt)}
            >
              {chip.label}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
