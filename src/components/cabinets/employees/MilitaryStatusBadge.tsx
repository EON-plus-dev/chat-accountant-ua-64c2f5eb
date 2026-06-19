import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { format, parseISO, differenceInDays } from "date-fns";
import { uk } from "date-fns/locale";
import { AlertTriangle } from "lucide-react";
import type { MilitaryStatus } from "@/config/employeesConfig";
import { militaryStatusConfig } from "@/config/employeesConfig";

interface MilitaryStatusBadgeProps {
  status: MilitaryStatus;
  documentDate?: string;
  size?: "sm" | "default";
  showLabel?: boolean;
  className?: string;
}

export const MilitaryStatusBadge = ({
  status,
  documentDate,
  size = "default",
  showLabel = false,
  className,
}: MilitaryStatusBadgeProps) => {
  const config = militaryStatusConfig[status];
  const Icon = config.icon;
  
  // Перевірка застарілості документа (>30 днів)
  const isDocumentOutdated = documentDate 
    ? differenceInDays(new Date(), parseISO(documentDate)) > 30 
    : false;
  
  const formatDocDate = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), "dd.MM.yyyy", { locale: uk });
    } catch {
      return dateStr;
    }
  };

  const badge = (
    <Badge
      variant="secondary"
      size={size === "sm" ? "sm" : "default"}
      className={cn(
        config.className,
        size === "sm" && "text-[11px] px-1.5 py-0",
        className
      )}
    >
      <Icon className={cn("mr-1", size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5")} />
      {showLabel ? config.label : config.shortLabel}
      {isDocumentOutdated && (
        <AlertTriangle className={cn("ml-1 text-amber-600", size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5")} />
      )}
    </Badge>
  );

  // Якщо є дата документа, показуємо tooltip
  if (documentDate) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {badge}
          </TooltipTrigger>
          <TooltipContent>
            <div className="text-xs">
              <p>Дата документа: {formatDocDate(documentDate)}</p>
              {isDocumentOutdated && (
                <p className="text-amber-500 mt-1">
                  ⚠️ Документ потребує оновлення
                </p>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return badge;
};
