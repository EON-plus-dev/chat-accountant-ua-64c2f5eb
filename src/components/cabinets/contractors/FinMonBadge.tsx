import { 
  Minus, 
  FileQuestion, 
  ShieldCheck, 
  ShieldAlert, 
  ShieldX,
  Clock,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { FinMonStatus } from "@/config/settingsConfig";
import { differenceInDays } from "date-fns";

interface FinMonBadgeProps {
  status: FinMonStatus;
  dueDate?: string;           // Для показу днів до закінчення
  size?: "sm" | "default";    // Розмір badge
  showLabel?: boolean;        // Показувати текст чи тільки іконку
  className?: string;
}

const statusConfig: Record<FinMonStatus, {
  icon: typeof ShieldCheck;
  label: string;
  shortLabel: string;
  className: string;
  tooltipText: string;
}> = {
  "not-required": {
    icon: Minus,
    label: "Не потребує",
    shortLabel: "—",
    className: "text-muted-foreground border-border bg-muted/50",
    tooltipText: "Фінансовий моніторинг не потрібен для цього контрагента",
  },
  "pending": {
    icon: FileQuestion,
    label: "Очікує анкети",
    shortLabel: "Анкета",
    className: "text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30",
    tooltipText: "Контрагент очікує заповнення анкети фінансового моніторингу",
  },
  "completed": {
    icon: ShieldCheck,
    label: "ФінМон ✓",
    shortLabel: "ФМ ✓",
    className: "text-green-600 dark:text-green-400 border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/30",
    tooltipText: "Анкета фінансового моніторингу заповнена та актуальна",
  },
  "expired": {
    icon: ShieldAlert,
    label: "Прострочено",
    shortLabel: "Простр.",
    className: "text-destructive border-destructive/30 bg-destructive/10 animate-pulse",
    tooltipText: "Анкета фінансового моніторингу прострочена і потребує оновлення",
  },
  "flagged": {
    icon: ShieldX,
    label: "Ризик!",
    shortLabel: "Ризик",
    className: "text-destructive border-destructive bg-destructive/10",
    tooltipText: "Виявлено ознаки ризику. Рекомендується додаткова перевірка",
  },
};

export const FinMonBadge = ({
  status,
  dueDate,
  size = "default",
  showLabel = false,
  className,
}: FinMonBadgeProps) => {
  const config = statusConfig[status];
  const Icon = config.icon;

  // Check if due date is within 14 days
  const daysUntilDue = dueDate ? differenceInDays(new Date(dueDate), new Date()) : null;
  const isExpiringSoon = daysUntilDue !== null && daysUntilDue > 0 && daysUntilDue <= 14;
  const isExpired = daysUntilDue !== null && daysUntilDue <= 0;

  // Build tooltip text
  let tooltipText = config.tooltipText;
  if (dueDate && status === "completed") {
    if (isExpiringSoon) {
      tooltipText = `Увага! Анкета закінчується через ${daysUntilDue} дн.`;
    } else if (isExpired) {
      tooltipText = `Анкета прострочена ${Math.abs(daysUntilDue)} дн. тому`;
    }
  }

  const badge = (
    <Badge
      variant="outline"
      className={cn(
        "gap-1",
        size === "sm" ? "text-[10px] h-5 px-1.5" : "text-xs h-6 px-2",
        config.className,
        isExpiringSoon && status === "completed" && "border-amber-400 dark:border-amber-600",
        className
      )}
    >
      <Icon className={cn(
        size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5"
      )} />
      {showLabel && (
        <span>{size === "sm" ? config.shortLabel : config.label}</span>
      )}
      {isExpiringSoon && status === "completed" && (
        <Clock className="h-3 w-3 text-amber-500" />
      )}
    </Badge>
  );

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {badge}
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltipText}</p>
          {dueDate && status !== "not-required" && (
            <p className="text-xs text-muted-foreground mt-0.5">
              Дійсна до: {new Date(dueDate).toLocaleDateString("uk-UA")}
            </p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
