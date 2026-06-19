import { Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { KeyDate } from "@/types/documentSummary";
import type { IntelligenceCardDatesProps } from "./types";

// Format date helper
const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString("uk-UA", { 
    day: "2-digit", 
    month: "2-digit", 
    year: "numeric" 
  });
};

// Key Date Item component
const KeyDateItem = ({ keyDate }: { keyDate: KeyDate }) => {
  const isUrgent = keyDate.daysUntil !== undefined && keyDate.daysUntil >= 0 && keyDate.daysUntil <= 7;
  const isCritical = keyDate.daysUntil !== undefined && keyDate.daysUntil < 0;
  
  return (
    <div className={cn(
      "flex items-center gap-2 px-2.5 py-1.5 rounded-md text-sm",
      isCritical 
        ? "bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300" 
        : isUrgent
        ? "bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300"
        : "bg-muted/50"
    )}>
      <Calendar className={cn(
        "w-3.5 h-3.5 shrink-0",
        isCritical 
          ? "text-red-500" 
          : isUrgent 
          ? "text-amber-500" 
          : "text-muted-foreground"
      )} />
      <span className="text-muted-foreground text-xs">{keyDate.label}:</span>
      <span className="font-medium">{formatDate(keyDate.date)}</span>
      {keyDate.daysUntil !== undefined && (
        <Badge 
          variant="secondary" 
          className={cn(
            "ml-auto text-[10px] px-1.5 py-0",
            isCritical && "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
            isUrgent && "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
          )}
        >
          {keyDate.daysUntil < 0 
            ? `${Math.abs(keyDate.daysUntil)} дн. тому` 
            : keyDate.daysUntil === 0 
            ? "Сьогодні"
            : `${keyDate.daysUntil} дн.`
          }
        </Badge>
      )}
    </div>
  );
};

export const IntelligenceCardDates = ({ keyDates }: IntelligenceCardDatesProps) => {
  if (!keyDates || keyDates.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
        Ключові дати
      </p>
      <div className="space-y-1.5">
        {keyDates.map((kd, i) => (
          <KeyDateItem key={i} keyDate={kd} />
        ))}
      </div>
    </div>
  );
};
