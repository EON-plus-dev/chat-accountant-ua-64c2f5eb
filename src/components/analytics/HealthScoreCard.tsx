import { useState } from "react";
import { 
  Trophy, 
  FileCheck, 
  Wallet, 
  AlertTriangle, 
  Database,
  ChevronDown,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

export interface HealthScoreFactor {
  label: string;
  value: number; // 0-100
  status: "good" | "warning" | "critical";
}

export interface HealthScoreCategory {
  score: number;
  weight: number;
  label: string;
  icon: typeof FileCheck;
  color: string;
  factors: HealthScoreFactor[];
}

export interface HealthScore {
  total: number;
  grade: "A" | "B" | "C" | "D" | "F";
  trend: { value: number; direction: "up" | "down" | "stable" };
  categories: {
    compliance: HealthScoreCategory;
    finance: HealthScoreCategory;
    risks: HealthScoreCategory;
    dataQuality: HealthScoreCategory;
  };
}

interface HealthScoreCardProps {
  healthScore: HealthScore;
  onCategoryClick?: (category: keyof HealthScore["categories"]) => void;
  compact?: boolean;
  scrollTargetId?: string;
  categoryScrollTargets?: Partial<Record<keyof HealthScore["categories"], string>>;
}

const gradeColors: Record<HealthScore["grade"], string> = {
  A: "bg-success text-success-foreground",
  B: "bg-emerald-500 text-white",
  C: "bg-amber-500 text-white",
  D: "bg-orange-500 text-white",
  F: "bg-destructive text-destructive-foreground",
};

const scoreColors = {
  good: "text-success",
  warning: "text-amber-600",
  critical: "text-destructive",
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

export function HealthScoreCard({ 
  healthScore, 
  onCategoryClick,
  compact = false,
  scrollTargetId,
  categoryScrollTargets,
}: HealthScoreCardProps) {
  const [isExpanded, setIsExpanded] = useState(!compact);
  
  const handleCardClick = () => {
    if (scrollTargetId) {
      const element = document.getElementById(scrollTargetId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
        element.classList.add("ring-2", "ring-primary/50");
        setTimeout(() => {
          element.classList.remove("ring-2", "ring-primary/50");
        }, 2000);
      }
    }
  };
  
  const handleCategoryClick = (category: keyof HealthScore["categories"]) => {
    const targetId = categoryScrollTargets?.[category];
    if (targetId) {
      const element = document.getElementById(targetId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
        element.classList.add("ring-2", "ring-primary/50");
        setTimeout(() => {
          element.classList.remove("ring-2", "ring-primary/50");
        }, 2000);
      }
    }
    onCategoryClick?.(category);
  };
  const categories = Object.entries(healthScore.categories) as [keyof HealthScore["categories"], HealthScoreCategory][];

  const TrendIcon = healthScore.trend.direction === "up" 
    ? TrendingUp 
    : healthScore.trend.direction === "down" 
    ? TrendingDown 
    : Minus;

  if (compact) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 border">
        <Trophy className="h-4 w-4 text-amber-500" />
        <span className="text-sm font-semibold">{healthScore.total}</span>
        <span className="text-xs text-muted-foreground">/100</span>
        <Badge className={cn("text-xs px-1.5 py-0", gradeColors[healthScore.grade])}>
          {healthScore.grade}
        </Badge>
        {healthScore.trend.value !== 0 && (
          <span className={cn(
            "text-xs flex items-center gap-0.5",
            healthScore.trend.direction === "up" ? "text-success" : 
            healthScore.trend.direction === "down" ? "text-destructive" : 
            "text-muted-foreground"
          )}>
            <TrendIcon className="h-3 w-3" />
            {healthScore.trend.value}%
          </span>
        )}
      </div>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-amber-500/10">
              <Trophy className="h-5 w-5 text-amber-500" />
            </div>
            <CardTitle className="text-base">Здоров'я портфеля</CardTitle>
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
                <TrendIcon className="h-4 w-4" />
                {healthScore.trend.value}%
              </span>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Main Score Circle */}
        <div className="flex items-center justify-center py-4">
          <div className="relative">
            {/* Circular progress background */}
            <svg className="w-32 h-32 transform -rotate-90">
              <circle
                className="text-muted stroke-current"
                strokeWidth="8"
                fill="transparent"
                r="54"
                cx="64"
                cy="64"
              />
              <circle
                className={cn(
                  "stroke-current transition-all duration-500",
                  getScoreStatus(healthScore.total) === "good" ? "text-success" :
                  getScoreStatus(healthScore.total) === "warning" ? "text-amber-500" :
                  "text-destructive"
                )}
                strokeWidth="8"
                strokeLinecap="round"
                fill="transparent"
                r="54"
                cx="64"
                cy="64"
                strokeDasharray={`${(healthScore.total / 100) * 339.292} 339.292`}
              />
            </svg>
            {/* Score value */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={cn(
                "text-4xl font-bold",
                scoreColors[getScoreStatus(healthScore.total)]
              )}>
                {healthScore.total}
              </span>
              <span className="text-sm text-muted-foreground">/100</span>
            </div>
          </div>
        </div>

        {/* Category Breakdown */}
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleTrigger className="flex items-center justify-center gap-1 w-full py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <span>{isExpanded ? "Згорнути деталі" : "Показати деталі"}</span>
            <ChevronDown className={cn(
              "h-4 w-4 transition-transform",
              isExpanded && "rotate-180"
            )} />
          </CollapsibleTrigger>
          
          <CollapsibleContent className="space-y-3 pt-2">
            {categories.map(([key, category]) => {
              const Icon = category.icon;
              return (
                <button
                  key={key}
                  onClick={() => handleCategoryClick(key)}
                  className="w-full text-left"
                >
                  <div className="flex items-center gap-3 group">
                    <div className={cn(
                      "p-1.5 rounded-md transition-colors",
                      category.color
                    )}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium group-hover:text-primary transition-colors">
                          {category.label}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "text-sm font-semibold",
                            scoreColors[getScoreStatus(category.score)]
                          )}>
                            {category.score}%
                          </span>
                          <span className="text-xs text-muted-foreground">
                            ({Math.round(category.weight * 100)}%)
                          </span>
                        </div>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div 
                          className={cn(
                            "h-full rounded-full transition-all duration-500",
                            getProgressColor(category.score)
                          )}
                          style={{ width: `${category.score}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Factors (shown on hover or always in expanded mode) */}
                  {category.factors.length > 0 && (
                    <div className="ml-10 mt-2 space-y-1">
                      {category.factors.map((factor, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">{factor.label}</span>
                          <span className={cn(
                            "font-medium",
                            scoreColors[factor.status]
                          )}>
                            {factor.value}%
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}
