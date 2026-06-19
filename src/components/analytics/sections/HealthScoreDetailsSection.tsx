import { 
  FileCheck, 
  Wallet, 
  AlertTriangle, 
  Database,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { HealthScore, HealthScoreCategory } from "@/components/analytics/HealthScoreCard";

interface HealthScoreDetailsSectionProps {
  healthScore: HealthScore;
  onChatPromptInsert?: (prompt: string) => void;
  onCategoryClick?: (category: keyof HealthScore["categories"]) => void;
}

const categoryScrollTargets: Record<keyof HealthScore["categories"], string> = {
  compliance: "deadlines-section",
  finance: "income-chart-section",
  risks: "risks-section",
  dataQuality: "income-analytics-wrapper",
};

const categoryConfig: Record<keyof HealthScore["categories"], { 
  label: string; 
  description: string;
}> = {
  compliance: { 
    label: "Compliance", 
    description: "Звіти, дедлайни, статуси" 
  },
  finance: { 
    label: "Фінанси", 
    description: "Доходи, податки, виплати" 
  },
  risks: { 
    label: "Ризики", 
    description: "Перевірки, ліміти, борги" 
  },
  dataQuality: { 
    label: "Відповідність", 
    description: "Повнота, актуальність" 
  },
};

const getScoreStatus = (score: number): "good" | "warning" | "critical" => {
  if (score >= 80) return "good";
  if (score >= 60) return "warning";
  return "critical";
};

const getProgressColor = (score: number): string => {
  if (score >= 80) return "bg-success";
  if (score >= 60) return "bg-amber-500";
  return "bg-destructive";
};

const scoreColors = {
  good: "text-success",
  warning: "text-amber-600",
  critical: "text-destructive",
};

const gradeColors: Record<HealthScore["grade"], string> = {
  A: "bg-success text-success-foreground",
  B: "bg-emerald-500 text-white",
  C: "bg-amber-500 text-white",
  D: "bg-orange-500 text-white",
  F: "bg-destructive text-destructive-foreground",
};

export function HealthScoreDetailsSection({ 
  healthScore, 
  onChatPromptInsert,
  onCategoryClick,
}: HealthScoreDetailsSectionProps) {
  const categories = Object.entries(healthScore.categories) as [keyof HealthScore["categories"], HealthScoreCategory][];

  const handleCategoryClick = (category: keyof HealthScore["categories"]) => {
    const targetId = categoryScrollTargets[category];
    if (targetId) {
      const element = document.getElementById(targetId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
        element.classList.add("ring-2", "ring-primary", "ring-offset-2");
        setTimeout(() => {
          element.classList.remove("ring-2", "ring-primary", "ring-offset-2");
        }, 1500);
      }
    }
    onCategoryClick?.(category);
  };

  return (
    <Card id="health-score-details" className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              {/* Mini circular score indicator */}
              <svg className="w-12 h-12 transform -rotate-90">
                <circle
                  className="text-muted stroke-current"
                  strokeWidth="3"
                  fill="transparent"
                  r="20"
                  cx="24"
                  cy="24"
                />
                <circle
                  className={cn(
                    "stroke-current transition-all duration-500",
                    getScoreStatus(healthScore.total) === "good" ? "text-success" :
                    getScoreStatus(healthScore.total) === "warning" ? "text-amber-500" :
                    "text-destructive"
                  )}
                  strokeWidth="3"
                  strokeLinecap="round"
                  fill="transparent"
                  r="20"
                  cx="24"
                  cy="24"
                  strokeDasharray={`${(healthScore.total / 100) * 125.66} 125.66`}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={cn(
                  "text-sm font-bold",
                  scoreColors[getScoreStatus(healthScore.total)]
                )}>
                  {healthScore.total}
                </span>
              </div>
            </div>
            <div>
              <CardTitle className="text-base">Здоров'я портфеля</CardTitle>
              <CardDescription>Аналіз по 4 категоріях</CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={cn("text-sm px-2 py-0.5", gradeColors[healthScore.grade])}>
              {healthScore.grade}
            </Badge>
            {healthScore.trend.value !== 0 && (
              <span className={cn(
                "text-sm flex items-center gap-0.5",
                healthScore.trend.direction === "up" ? "text-success" : 
                healthScore.trend.direction === "down" ? "text-destructive" : 
                "text-muted-foreground"
              )}>
                {healthScore.trend.direction === "up" ? "↑" : healthScore.trend.direction === "down" ? "↓" : "→"}
                {healthScore.trend.value}%
              </span>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Categories Grid - 2x2 on desktop, 1 column on mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {categories.map(([key, category]) => {
            const Icon = category.icon;
            const config = categoryConfig[key];
            
            return (
              <button
                key={key}
                onClick={() => handleCategoryClick(key)}
                className={cn(
                  "flex flex-col gap-3 p-4 rounded-lg border text-left",
                  "transition-all duration-200",
                  "hover:border-primary/50 hover:shadow-md hover:bg-muted/30",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  "min-h-[120px]"
                )}
              >
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "p-1.5 rounded-md",
                      category.color
                    )}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{config.label}</p>
                      <p className="text-xs text-muted-foreground">{config.description}</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
                
                {/* Score bar */}
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center justify-between">
                    <span className={cn(
                      "text-lg font-bold",
                      scoreColors[getScoreStatus(category.score)]
                    )}>
                      {category.score}%
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Вага: {Math.round(category.weight * 100)}%
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={cn(
                        "h-full rounded-full transition-all duration-500",
                        getProgressColor(category.score)
                      )}
                      style={{ width: `${category.score}%` }}
                    />
                  </div>
                </div>
                
                {/* Factors - compact */}
                {category.factors.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {category.factors.slice(0, 3).map((factor, idx) => (
                      <Badge 
                        key={idx} 
                        variant="outline"
                        className={cn(
                          "text-[10px] px-1.5 py-0",
                          factor.status === "good" && "border-success/50 text-success",
                          factor.status === "warning" && "border-amber-500/50 text-amber-600",
                          factor.status === "critical" && "border-destructive/50 text-destructive"
                        )}
                      >
                        {factor.label}: {factor.value}%
                      </Badge>
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
