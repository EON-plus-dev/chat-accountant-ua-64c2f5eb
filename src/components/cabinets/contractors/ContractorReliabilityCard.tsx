import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Star, HelpCircle, TrendingUp, TrendingDown, Minus, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";
import { Sparkline } from "@/components/ui/Sparkline";

interface ScoreBreakdown {
  paymentTimeliness: number;
  documentCompleteness: number;
  cooperationDuration: number;
  operationVolume: number;
}

interface ContractorReliabilityCardProps {
  score: number;
  previousScore?: number;
  breakdown?: ScoreBreakdown;
  scoreHistory?: number[];
}

// Factor definitions with icons
const FACTORS = [
  { key: "paymentTimeliness", label: "Своєчасність оплат", max: 40, icon: "💳" },
  { key: "documentCompleteness", label: "Повнота документів", max: 30, icon: "📄" },
  { key: "cooperationDuration", label: "Тривалість співпраці", max: 20, icon: "🤝" },
  { key: "operationVolume", label: "Обсяг операцій", max: 10, icon: "📊" },
] as const;

// Circular progress component
const CircularProgress = ({ score, size = 48 }: { score: number; size?: number }) => {
  const radius = (size - 6) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  
  const getColor = () => {
    if (score >= 80) return "stroke-green-500";
    if (score >= 50) return "stroke-amber-500";
    return "stroke-destructive";
  };

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          className="stroke-muted"
          strokeWidth="3"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          className={cn("transition-all duration-500", getColor())}
          strokeWidth="3"
          strokeLinecap="round"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-sm font-bold">
        {score}
      </span>
    </div>
  );
};

// Factor segment component
const FactorSegment = ({ 
  label, 
  value, 
  max, 
  icon 
}: { 
  label: string; 
  value: number; 
  max: number; 
  icon: string;
}) => {
  const ratio = value / max;
  
  return (
    <div className="flex-1 text-center">
      <div className="h-1.5 rounded-full bg-muted overflow-hidden mb-1">
        <div 
          className={cn(
            "h-full rounded-full transition-all",
            ratio >= 0.8 ? "bg-green-500" :
            ratio >= 0.5 ? "bg-amber-500" : "bg-destructive"
          )}
          style={{ width: `${ratio * 100}%` }}
        />
      </div>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="text-[10px] text-muted-foreground cursor-help flex items-center justify-center gap-0.5">
            <span>{icon}</span>
            <span>{value}/{max}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">
          <p className="font-medium">{label}</p>
          <p className="text-muted-foreground">{value} з {max} балів</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
};

// Get primary impact note
const getPrimaryImpact = (breakdown: ScoreBreakdown) => {
  const factors = [
    { key: "paymentTimeliness", ratio: breakdown.paymentTimeliness / 40, label: "прострочені оплати" },
    { key: "documentCompleteness", ratio: breakdown.documentCompleteness / 30, label: "неповні документи" },
    { key: "cooperationDuration", ratio: breakdown.cooperationDuration / 20, label: "нетривала співпраця" },
    { key: "operationVolume", ratio: breakdown.operationVolume / 10, label: "малий обсяг операцій" },
  ];
  
  const weakest = factors.reduce((min, f) => f.ratio < min.ratio ? f : min);
  
  if (weakest.ratio >= 0.8) {
    return { type: "success" as const, text: "Всі показники в нормі" };
  }
  if (weakest.ratio < 0.5) {
    return { type: "warning" as const, text: `Головний фактор: ${weakest.label}` };
  }
  return { type: "info" as const, text: `Можна покращити: ${weakest.label}` };
};

export const ContractorReliabilityCard = ({
  score,
  previousScore,
  breakdown = {
    paymentTimeliness: 32,
    documentCompleteness: 25,
    cooperationDuration: 18,
    operationVolume: 10,
  },
  scoreHistory,
}: ContractorReliabilityCardProps) => {
  const getScoreColor = () => {
    if (score >= 80) return "text-green-600 dark:text-green-400";
    if (score >= 50) return "text-amber-600 dark:text-amber-400";
    return "text-destructive";
  };

  const getScoreLabel = () => {
    if (score >= 80) return "Надійний";
    if (score >= 50) return "Середній";
    return "Ненадійний";
  };

  const getTrend = () => {
    if (previousScore === undefined) return null;
    const diff = score - previousScore;
    if (diff > 0) return { icon: TrendingUp, color: "text-green-600", label: `+${diff}` };
    if (diff < 0) return { icon: TrendingDown, color: "text-destructive", label: `${diff}` };
    return { icon: Minus, color: "text-muted-foreground", label: "0" };
  };

  const trend = getTrend();
  const impact = getPrimaryImpact(breakdown);
  
  // Generate sparkline data if not provided
  const sparklineData = scoreHistory || [
    Math.max(0, score - 15),
    Math.max(0, score - 10),
    Math.max(0, score - 5),
    Math.max(0, score - 2),
    score
  ];

  const sparklineColor = score >= 80 ? "success" : score >= 50 ? "warning" : "destructive";

  return (
    <Card className="hover:shadow-md transition-all">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Star className={cn("h-5 w-5", getScoreColor())} />
            Рейтинг надійності
          </CardTitle>
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="text-muted-foreground hover:text-foreground p-1">
                <HelpCircle className="h-4 w-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="left" className="max-w-xs">
              <p className="text-sm">
                Рейтинг розраховується на основі історії оплат, повноти документів, 
                тривалості співпраці та обсягу операцій.
              </p>
            </TooltipContent>
          </Tooltip>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {/* Row 1: Circular Score + Label + Trend + Sparkline */}
        <div className="flex items-center gap-3">
          <CircularProgress score={score} size={48} />
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={cn("text-2xl font-bold", getScoreColor())}>{score}</span>
              <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", 
                score >= 80 ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400" :
                score >= 50 ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400" :
                "bg-destructive/10 text-destructive"
              )}>
                {getScoreLabel()}
              </span>
              {trend && (
                <div className={cn("flex items-center gap-0.5 text-xs", trend.color)}>
                  <trend.icon className="h-3 w-3" />
                  <span>{trend.label}</span>
                </div>
              )}
            </div>
          </div>
          
          <Sparkline
            data={sparklineData}
            width={80}
            height={24}
            color={sparklineColor}
            strokeWidth={1.5}
          />
        </div>
        
        {/* Row 2: Segmented Factor Bars */}
        <div className="flex gap-1 pt-1">
          {FACTORS.map((factor) => (
            <FactorSegment
              key={factor.key}
              label={factor.label}
              value={breakdown[factor.key]}
              max={factor.max}
              icon={factor.icon}
            />
          ))}
        </div>
        
        {/* Row 3: Primary Impact Note */}
        <div className={cn(
          "flex items-center gap-2 text-xs px-2 py-1.5 rounded-md",
          impact.type === "warning" ? "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400" :
          impact.type === "success" ? "bg-green-50 text-green-700 dark:bg-green-950/50 dark:text-green-400" :
          "bg-muted text-muted-foreground"
        )}>
          <Lightbulb className="h-3.5 w-3.5 flex-shrink-0" />
          <span>{impact.text}</span>
        </div>
      </CardContent>
    </Card>
  );
};
