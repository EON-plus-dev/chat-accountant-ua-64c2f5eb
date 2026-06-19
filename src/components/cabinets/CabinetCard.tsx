import { AlertCircle, CheckCircle2, Calendar, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Cabinet } from "@/types/cabinet";
import { getEntityStyle } from "@/config/entityStyles";

// Helper for FOP group badge
const getFopGroupBadgeClass = (fopGroup: 1 | 2 | 3): string => {
  switch (fopGroup) {
    case 1: return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300";
    case 2: return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300";
    case 3: return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300";
  }
};
interface CabinetCardProps {
  cabinet: Cabinet;
  onEnter: (cabinet: Cabinet) => void;
}

const CabinetCard = ({ cabinet, onEnter }: CabinetCardProps) => {
  const entityStyle = getEntityStyle(cabinet.type);
  const EntityIcon = entityStyle.icon;

  const getDeadlineInfo = () => {
    if (!cabinet.nextDeadline) return null;
    
    const now = new Date();
    const deadline = new Date(cabinet.nextDeadline);
    const diffTime = deadline.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    let urgencyClass = "text-muted-foreground";
    let bgClass = "bg-muted/80";
    
    if (diffDays <= 0) {
      urgencyClass = "text-destructive";
      bgClass = "bg-destructive/10";
    } else if (diffDays <= 3) {
      urgencyClass = "text-destructive";
      bgClass = "bg-destructive/10";
    } else if (diffDays <= 7) {
      urgencyClass = "text-warning";
      bgClass = "bg-warning/10";
    }
    
    let dateLabel = "";
    if (diffDays <= 0) {
      dateLabel = "Сьогодні";
    } else if (diffDays === 1) {
      dateLabel = "Завтра";
    } else if (diffDays <= 7) {
      dateLabel = `Через ${diffDays} дн.`;
    } else {
      dateLabel = deadline.toLocaleDateString("uk-UA", { day: "numeric", month: "short" });
    }
    
    const label = cabinet.deadlineLabel 
      ? `${dateLabel} · ${cabinet.deadlineLabel}`
      : dateLabel;
    
    return { label, urgencyClass, bgClass };
  };

  const deadlineInfo = getDeadlineInfo();
  const isArchived = cabinet.status === "archived";

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onEnter(cabinet);
    }
  };

  return (
    <Card 
      onMouseDown={(e) => e.preventDefault()}
      onClick={() => onEnter(cabinet)}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`Відкрити кабінет ${cabinet.name}`}
      className={cn(
        "flex flex-col h-full group cursor-pointer",
        "border-border shadow-sm transition-all duration-200 border-l-4",
        "focus:outline-none focus-visible:border-primary/50",
        "active:scale-[0.99]",
        entityStyle.borderColor,
        isArchived 
          ? "opacity-60 grayscale" 
          : "hover:shadow-lg hover:border-primary/50"
      )}>
      <CardHeader className="pb-2 p-4">
        <div className="flex items-start gap-2.5">
          {/* Compact Avatar */}
          <div className={cn(
            "w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0",
            entityStyle.bgColor
          )}>
            <EntityIcon className={cn("w-4.5 h-4.5", entityStyle.color)} />
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <CardTitle 
              className="text-sm font-semibold leading-tight truncate" 
              title={cabinet.name}
            >
              {cabinet.name}
            </CardTitle>
            <div className="flex items-center gap-1.5 mt-1">
              <Badge className={cn("text-xs px-1.5 py-0.5", entityStyle.badgeClass)}>
                {entityStyle.label}
              </Badge>
              {cabinet.taxId && (
                <span className="text-xs text-muted-foreground tabular-nums">
                  {cabinet.taxId}
                </span>
              )}
              {isArchived && (
                <Badge variant="outline" className="text-xs px-1.5 py-0.5 text-muted-foreground">
                  Архів
                </Badge>
              )}
            </div>
          </div>
          
          {/* Subtle Arrow Indicator */}
          <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all flex-shrink-0 mt-1" />
        </div>
      </CardHeader>

      <CardContent className="pt-2 p-4 pb-4">
        {/* Stats row: FOP Group (if applicable) · Role · Status */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            {cabinet.type === "fop" && cabinet.fopGroup && (
              <>
                <Badge className={cn("text-xs px-1.5 py-0.5", getFopGroupBadgeClass(cabinet.fopGroup))}>
                  {cabinet.fopGroup} гр.
                </Badge>
                <span className="text-muted-foreground/70">·</span>
              </>
            )}
            <span className="text-muted-foreground text-xs">
              {cabinet.roleLabel}
            </span>
          </div>
          {cabinet.reportStatus === "ok" ? (
            <CheckCircle2 className="w-4 h-4 text-success" />
          ) : (
            <AlertCircle className="w-4 h-4 text-warning" />
          )}
        </div>

        {/* Compact Deadline Pill */}
        {deadlineInfo && !isArchived ? (
          <div className={cn(
            "rounded-md px-2 py-1 flex items-center gap-1.5 mt-2 w-fit",
            deadlineInfo.bgClass
          )}>
            <Calendar className={cn("w-3 h-3 flex-shrink-0", deadlineInfo.urgencyClass)} />
            <span className={cn("text-xs font-medium", deadlineInfo.urgencyClass)}>
              {deadlineInfo.label}
            </span>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
};

export default CabinetCard;