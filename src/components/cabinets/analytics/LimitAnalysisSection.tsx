import { TrendingUp, ArrowRight, Lightbulb, Target, AlertTriangle, Settings, Calendar, TrendingDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { Cabinet } from "@/types/cabinet";
import { fopIncomeLimits } from "@/config/incomeBookConfig";
import { cn } from "@/lib/utils";
import { formatValue as formatValueUtil } from "@/lib/formatters";
import {
  detectIndustryType,
  calculateSeasonalForecast,
  getSeasonalInsight,
  getSeasonalRecommendations,
  MONTH_LABELS_SHORT,
  type IndustryType,
} from "@/lib/seasonalForecasting";

interface LimitAnalysisSectionProps {
  cabinet: Cabinet;
  onChatPromptInsert?: (prompt: string) => void;
  onNavigateToSettings?: () => void;
}

export const LimitAnalysisSection = ({ 
  cabinet, 
  onChatPromptInsert,
  onNavigateToSettings 
}: LimitAnalysisSectionProps) => {
  if (cabinet.type !== "fop" || !cabinet.fopGroup) return null;

  const fopGroup = cabinet.fopGroup;
  const limit = fopIncomeLimits[fopGroup] || fopIncomeLimits[3];
  const yearlyIncome = cabinet.yearlyIncome || 0;
  const remaining = Math.max(0, limit - yearlyIncome);
  const percentage = Math.min((yearlyIncome / limit) * 100, 100);
  
  // Detect industry for seasonal forecasting
  const industry = detectIndustryType(cabinet.id, cabinet.name);
  
  // Calculate current month (1-12)
  const currentMonth = new Date().getMonth() + 1;
  const monthlyAverage = currentMonth > 0 ? yearlyIncome / currentMonth : 0;
  
  // Status based on percentage
  let status: "safe" | "warning" | "critical" = "safe";
  if (percentage >= 90) status = "critical";
  else if (percentage >= 70) status = "warning";

  const getStatusStyles = () => {
    switch (status) {
      case "critical":
        return {
          progressColor: "bg-destructive",
          textColor: "text-destructive",
          bgColor: "bg-destructive/10",
          borderColor: "border-destructive/30",
        };
      case "warning":
        return {
          progressColor: "bg-warning",
          textColor: "text-warning",
          bgColor: "bg-warning/10",
          borderColor: "border-warning/30",
        };
      default:
        return {
          progressColor: "bg-success",
          textColor: "text-success",
          bgColor: "bg-success/10",
          borderColor: "border-success/30",
        };
    }
  };

  const styles = getStatusStyles();

  const formatValue = (value: number) => {
    return formatValueUtil(value, "currency");
  };

  // Scenarios with seasonal forecasting
  const scenarios = [
    {
      id: "pessimistic",
      label: "Песимістичний",
      growth: 1.2, // +20% to average
      icon: AlertTriangle,
      color: "text-destructive",
      description: "+20% зростання",
    },
    {
      id: "base",
      label: "Базовий",
      growth: 1.0,
      icon: Target,
      color: "text-foreground",
      description: "поточний темп",
    },
    {
      id: "optimistic",
      label: "Оптимістичний",
      growth: 0.8, // -20% from average
      icon: TrendingDown,
      color: "text-success",
      description: "-20% зменшення",
    },
  ];

  // Calculate seasonal forecasts
  const getSeasonalScenario = (growth: number) => {
    const forecast = calculateSeasonalForecast(
      yearlyIncome,
      limit,
      currentMonth,
      industry,
      growth
    );
    
    return {
      projectedYearEnd: forecast.projectedYearEnd,
      willExceed: forecast.willExceed,
      monthsUntil: forecast.monthsUntilLimit,
      peakMonth: forecast.peakMonth,
      avgMonthly: forecast.avgMonthlyForecast,
    };
  };

  // Get seasonal insight
  const seasonalInsight = getSeasonalInsight(industry, currentMonth);
  
  // Get recommendations with seasonal context
  const recommendations = getSeasonalRecommendations(industry, currentMonth, percentage);
  
  // Industry labels for display
  const industryLabels: Record<IndustryType, string> = {
    consulting: "Консалтинг",
    it: "IT",
    autorepair: "Автосервіс",
    dealer: "Торгівля",
    default: "Загальний",
  };

  return (
    <Card className={cn("border", styles.borderColor, styles.bgColor)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-base">
          <div className="flex items-center gap-2">
            <TrendingUp className={cn("w-5 h-5", styles.textColor)} />
            <span>Аналіз ліміту доходу</span>
          </div>
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="outline" className="font-normal cursor-help">
                    <Calendar className="w-3 h-3 mr-1" />
                    {industryLabels[industry]}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent side="left" className="max-w-[220px]">
                  <p className="text-xs">{seasonalInsight}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Badge variant="outline" className="font-normal">
              {fopGroup} група · {new Date().getFullYear()}
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Progress overview */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Використано ліміту</span>
            <span className={cn("font-semibold tabular-nums", styles.textColor)}>
              {percentage.toFixed(1)}%
            </span>
          </div>
          <div className="relative h-3 w-full overflow-hidden rounded-full bg-background">
            <div 
              className={cn("h-full transition-all duration-500", styles.progressColor)}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{formatValue(yearlyIncome)}</span>
            <span>з {formatValue(limit)}</span>
          </div>
        </div>

        {/* Seasonal Insight Banner */}
        {industry !== "default" && (
          <div className="p-2.5 rounded-lg bg-background/80 border border-border/50">
            <div className="flex items-start gap-2">
              <Calendar className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">{seasonalInsight}</p>
                {getSeasonalScenario(1.0).peakMonth > currentMonth - 1 && (
                  <p className="text-xs text-primary mt-1">
                    Пік очікується: {MONTH_LABELS_SHORT[getSeasonalScenario(1.0).peakMonth]}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Scenarios with seasonal forecasting */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <Target className="w-4 h-4" />
            Сценарії до кінця року
            <span className="text-xs text-muted-foreground font-normal">
              (з урахуванням сезонності)
            </span>
          </h4>
          <div className="grid gap-2">
            {scenarios.map((scenario) => {
              const forecast = getSeasonalScenario(scenario.growth);
              return (
                <div 
                  key={scenario.id}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-background/80"
                >
                  <div className="flex items-center gap-2">
                    <scenario.icon className={cn("w-4 h-4", scenario.color)} />
                    <div>
                      <span className="text-sm">{scenario.label}</span>
                      <span className="text-xs text-muted-foreground ml-1.5">
                        ({scenario.description})
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={cn("text-sm font-medium tabular-nums", forecast.willExceed ? "text-destructive" : "text-foreground")}>
                      {formatValue(forecast.projectedYearEnd)}
                    </p>
                    {forecast.willExceed && forecast.monthsUntil && (
                      <p className="text-xs text-destructive">
                        Перевищення через {forecast.monthsUntil} міс.
                      </p>
                    )}
                    {!forecast.willExceed && (
                      <p className="text-xs text-muted-foreground">
                        ~{formatValue(forecast.avgMonthly)}/міс
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Seasonal Recommendations */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-warning" />
            Рекомендації
          </h4>
          <ul className="space-y-1.5">
            {recommendations.map((rec, i) => (
              <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                <span className="text-muted-foreground/60">•</span>
                {rec}
              </li>
            ))}
          </ul>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2 pt-2">
          {onChatPromptInsert && (
            <Button 
              variant="outline" 
              size="sm" 
              className="text-xs gap-1"
              onClick={() => onChatPromptInsert(`Проаналізуй сезонний прогноз для ${industryLabels[industry]} та запропонуй стратегію дотримання ліміту`)}
            >
              <Lightbulb className="w-3.5 h-3.5" />
              Сезонна стратегія від AI
            </Button>
          )}
          {onNavigateToSettings && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs gap-1"
              onClick={onNavigateToSettings}
            >
              <Settings className="w-3.5 h-3.5" />
              Налаштування порогів
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};