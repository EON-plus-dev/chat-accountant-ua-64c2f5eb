import { Clock, AlertTriangle, Archive, Calendar } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  type RetentionCategory,
  retentionCategories,
  getDaysRemaining,
  getRetentionProgress,
  getArchiveEligibleDate,
} from "@/config/complianceConfig";

interface RetentionCountdownProps {
  createdAt: string;
  category: RetentionCategory;
  compact?: boolean;
  className?: string;
}

export const RetentionCountdown = ({
  createdAt,
  category,
  compact = false,
  className,
}: RetentionCountdownProps) => {
  const archiveDate = getArchiveEligibleDate(createdAt, category);
  const daysRemaining = getDaysRemaining(archiveDate);
  const progress = getRetentionProgress(createdAt, category);
  const config = retentionCategories[category];

  // Color based on urgency
  const getUrgencyColor = () => {
    if (daysRemaining > 365) return "emerald";
    if (daysRemaining > 90) return "amber";
    return "red";
  };

  const urgency = getUrgencyColor();
  
  const colorClasses = {
    emerald: {
      text: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-500",
      bgLight: "bg-emerald-50 dark:bg-emerald-950/30",
      border: "border-emerald-200 dark:border-emerald-800",
    },
    amber: {
      text: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-500",
      bgLight: "bg-amber-50 dark:bg-amber-950/30",
      border: "border-amber-200 dark:border-amber-800",
    },
    red: {
      text: "text-red-600 dark:text-red-400",
      bg: "bg-red-500",
      bgLight: "bg-red-50 dark:bg-red-950/30",
      border: "border-red-200 dark:border-red-800",
    },
  };

  const colors = colorClasses[urgency];

  const formatTimeRemaining = (): string => {
    if (daysRemaining === 0) return "Термін завершено";
    
    const years = Math.floor(daysRemaining / 365);
    const months = Math.floor((daysRemaining % 365) / 30);
    const days = daysRemaining % 30;

    if (years > 0) {
      return months > 0 
        ? `${years} р. ${months} міс.`
        : `${years} р.`;
    }
    if (months > 0) {
      return days > 0 
        ? `${months} міс. ${days} дн.`
        : `${months} міс.`;
    }
    return `${days} дн.`;
  };

  const handleExtendRetention = () => {
    toast({
      title: "Продовження зберігання",
      description: "Запит на продовження терміну зберігання відправлено (демо)",
    });
  };

  // Compact version for inline display
  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={cn(
              "inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium cursor-help",
              colors.bgLight,
              colors.text,
              className
            )}>
              {urgency === "red" ? (
                <AlertTriangle className="w-3 h-3" />
              ) : (
                <Clock className="w-3 h-3" />
              )}
              <span>{formatTimeRemaining()}</span>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <div className="space-y-1">
              <p className="font-medium">{config.labelUk} документ</p>
              <p className="text-xs">
                Архівування: {archiveDate.toLocaleDateString("uk-UA")}
              </p>
              <p className="text-xs text-muted-foreground">
                {config.legalBasis}
              </p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Full version
  return (
    <div className={cn(
      "rounded-lg border p-3 space-y-3",
      colors.bgLight,
      colors.border,
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {urgency === "red" ? (
            <AlertTriangle className={cn("w-4 h-4", colors.text)} />
          ) : (
            <Clock className={cn("w-4 h-4", colors.text)} />
          )}
          <span className="text-sm font-medium">Термін зберігання</span>
        </div>
        <Badge variant="outline" className="text-xs">
          {config.labelUk}
        </Badge>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex items-end justify-between">
          <span className={cn("text-2xl font-bold tabular-nums", colors.text)}>
            {formatTimeRemaining()}
          </span>
          <span className="text-xs text-muted-foreground">
            залишилось
          </span>
        </div>
        
        <div className="relative">
          <Progress 
            value={progress} 
            className="h-2"
          />
          {/* Progress indicator dot */}
          <div 
            className={cn(
              "absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-background shadow-sm",
              colors.bg
            )}
            style={{ left: `calc(${Math.min(progress, 98)}% - 6px)` }}
          />
        </div>
        
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Створено</span>
          <span>Архівування</span>
        </div>
      </div>

      {/* Archive Date */}
      <div className="flex items-center justify-between pt-2 border-t border-border/50">
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <span className="text-muted-foreground">До:</span>
          <span className="font-medium">
            {archiveDate.toLocaleDateString("uk-UA", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
          </span>
        </div>
        
        {urgency !== "emerald" && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-7 text-xs gap-1"
            onClick={handleExtendRetention}
          >
            <Archive className="w-3.5 h-3.5" />
            Продовжити
          </Button>
        )}
      </div>

      {/* Legal Basis */}
      <p className="text-xs text-muted-foreground">
        {config.legalBasis} — {config.description}
      </p>
    </div>
  );
};
