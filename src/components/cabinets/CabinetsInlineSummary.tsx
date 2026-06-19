import { Building2, AlertTriangle, Calendar, ArrowRight, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Cabinet } from "@/types/cabinet";

type SummaryFilterType = "total" | "income" | "attention" | "deadlines" | null;

interface CabinetsInlineSummaryProps {
  cabinets: Cabinet[];
  activeFilter?: SummaryFilterType;
  onFilterClick?: (filter: SummaryFilterType) => void;
  onNavigateToAnalytics?: () => void;
}

const CabinetsInlineSummary = ({ cabinets, activeFilter, onFilterClick, onNavigateToAnalytics }: CabinetsInlineSummaryProps) => {
  const totalCabinets = cabinets.length;
  const needsAttention = cabinets.filter((c) => c.reportStatus === "tasks").length;
  const activeCabinets = cabinets.filter((c) => c.status === "active").length;

  // Calculate deadlines within this week (7 days)
  const now = new Date();
  const weekFromNow = new Date();
  weekFromNow.setDate(now.getDate() + 7);

  const deadlinesCount = cabinets.filter((c) => {
    if (!c.nextDeadline || c.status === "archived") return false;
    const deadlineDate = new Date(c.nextDeadline);
    return deadlineDate >= now && deadlineDate <= weekFromNow;
  }).length;

  const handleClick = (filterKey: SummaryFilterType) => {
    if (!onFilterClick) return;
    onFilterClick(activeFilter === filterKey ? null : filterKey);
  };

  const handleKeyDown = (e: React.KeyboardEvent, filterKey: SummaryFilterType, disabled?: boolean) => {
    if (disabled) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleClick(filterKey);
    }
  };

  return (
    <div 
      className="flex flex-wrap items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 bg-card rounded-xl border border-border/70 shadow-sm"
      role="group"
      aria-label="Фільтри за показниками"
    >
      {/* Total cabinets */}
      <button
        onClick={() => handleClick("total")}
        onKeyDown={(e) => handleKeyDown(e, "total")}
        aria-label={`Всього кабінетів: ${totalCabinets}, активних: ${activeCabinets}`}
        aria-pressed={activeFilter === "total"}
        className={cn(
          "flex items-center gap-1.5 px-2 py-1 rounded-lg transition-all",
          "hover:bg-background/80",
          activeFilter === "total" && "bg-primary/20 ring-2 ring-primary/50 text-primary shadow-sm"
        )}
      >
        <Building2 className="w-4 h-4 text-primary" aria-hidden="true" />
        <span className="text-amount-sm">{totalCabinets}</span>
        <span className="text-caption text-muted-foreground hidden xs:inline">кабінетів</span>
        <span className="text-caption text-muted-foreground/80 hidden sm:inline">({activeCabinets} акт.)</span>
      </button>

      <div className="h-4 w-0.5 bg-border/70 hidden sm:block" aria-hidden="true" />

      <div className="h-4 w-0.5 bg-border/70 hidden sm:block" aria-hidden="true" />

      {/* Needs attention */}
      <button
        onClick={() => needsAttention > 0 && handleClick("attention")}
        onKeyDown={(e) => handleKeyDown(e, "attention", needsAttention === 0)}
        disabled={needsAttention === 0}
        aria-disabled={needsAttention === 0}
        aria-label={`Потребують уваги: ${needsAttention}`}
        aria-pressed={activeFilter === "attention"}
        className={cn(
          "flex items-center gap-1.5 px-2 py-1 rounded-lg transition-all",
          needsAttention > 0 && "hover:bg-warning/10 cursor-pointer",
          needsAttention === 0 && "text-muted-foreground/50 cursor-not-allowed opacity-60",
          activeFilter === "attention" && "bg-warning/25 ring-2 ring-warning/50 text-warning shadow-sm"
        )}
      >
        <AlertTriangle className={cn("w-4 h-4", needsAttention > 0 ? "text-warning" : "text-muted-foreground")} aria-hidden="true" />
        <span className="text-amount-sm">{needsAttention}</span>
        <span className="text-caption hidden sm:inline">уваги</span>
      </button>

      {/* Deadlines */}
      <button
        onClick={() => deadlinesCount > 0 && handleClick("deadlines")}
        onKeyDown={(e) => handleKeyDown(e, "deadlines", deadlinesCount === 0)}
        disabled={deadlinesCount === 0}
        aria-disabled={deadlinesCount === 0}
        aria-label={`Найближчі дедлайни: ${deadlinesCount}`}
        aria-pressed={activeFilter === "deadlines"}
        className={cn(
          "flex items-center gap-1.5 px-2 py-1 rounded-lg transition-all",
          deadlinesCount > 0 && "hover:bg-destructive/10 cursor-pointer",
          deadlinesCount === 0 && "text-muted-foreground/50 cursor-not-allowed opacity-60",
          activeFilter === "deadlines" && "bg-destructive/25 ring-2 ring-destructive/50 text-destructive shadow-sm"
        )}
      >
        <Calendar className={cn("w-4 h-4", deadlinesCount > 0 ? "text-destructive" : "text-muted-foreground")} aria-hidden="true" />
        <span className="text-amount-sm">{deadlinesCount}</span>
        <span className="text-caption hidden sm:inline">дедлайни</span>
      </button>

      {/* Кнопка Аналітика */}
      {onNavigateToAnalytics && (
        <>
          <div className="h-4 w-0.5 bg-border/70 hidden sm:block" aria-hidden="true" />
          <button
            onClick={onNavigateToAnalytics}
            aria-label="Перейти до аналітики"
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-primary bg-primary/10 border border-transparent hover:border-primary/30 rounded-lg transition-colors"
          >
            <BarChart3 className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Аналітика</span>
            <ArrowRight className="w-3 h-3" aria-hidden="true" />
          </button>
        </>
      )}
    </div>
  );
};

export default CabinetsInlineSummary;
