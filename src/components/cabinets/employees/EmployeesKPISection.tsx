import { useMemo } from "react";
import { Users, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Employee } from "@/config/employeesConfig";
import { getEmployeeStats } from "@/config/employeesConfig";

interface EmployeesKPISectionProps {
  employees: Employee[];
  onFilterChange?: (filter: string | null) => void;
  activeFilter?: string | null;
  contractFilter?: string;
  onContractTypeClick?: (type: "labor" | "civil" | "fop") => void;
}

type SegmentKey = "labor" | "civil" | "fop";

export const EmployeesKPISection = ({
  employees,
  onFilterChange,
  activeFilter,
  contractFilter = "all",
  onContractTypeClick,
}: EmployeesKPISectionProps) => {
  const stats = useMemo(() => getEmployeeStats(employees), [employees]);

  const segments: { key: SegmentKey; label: string; value: number }[] = useMemo(
    () => [
      { key: "labor", label: "Трудові", value: stats.laborCount },
      { key: "civil", label: "ЦПД", value: stats.civilCount },
      { key: "fop", label: "ФОП", value: stats.fopCount },
    ],
    [stats],
  );

  const visibleSegments = segments.filter((s) => s.value > 0);
  const hasChanges = stats.recentNew > 0 || stats.recentTerminated > 0;
  const isActiveKpi = activeFilter === "active";
  const isRecentKpi = activeFilter === "recent";

  const handleActiveClick = () => {
    onFilterChange?.(isActiveKpi ? null : "active");
  };

  const handleRecentClick = () => {
    onFilterChange?.(isRecentKpi ? null : "recent");
  };

  return (
    <Card className="border-border/70">
      <CardContent className="p-3 sm:p-4 space-y-2.5">
        {/* Top row: працівники + зміни за місяць */}
        <div className="flex items-center justify-between gap-3 min-w-0">
          <button
            type="button"
            onClick={handleActiveClick}
            className={cn(
              "flex items-center gap-2.5 min-w-0 text-left rounded-md -m-1 p-1 transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              isActiveKpi && "bg-primary/10",
            )}
            aria-pressed={isActiveKpi}
          >
            <div
              className={cn(
                "shrink-0 w-8 h-8 rounded-md flex items-center justify-center",
                isActiveKpi ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground",
              )}
            >
              <Users className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl sm:text-2xl font-semibold leading-none tabular-nums">
                  {stats.active}
                </span>
                <span className="text-xs text-muted-foreground">
                  {stats.active === 1 ? "активний" : "активних"}
                  {stats.terminated > 0 && ` · ${stats.terminated} завершено`}
                </span>
              </div>
              <div className="text-[11px] uppercase tracking-wide text-muted-foreground/80 mt-0.5">
                Працівники
              </div>
            </div>
          </button>

          {hasChanges && (
            <button
              type="button"
              onClick={handleRecentClick}
              className={cn(
                "shrink-0 inline-flex items-center gap-1.5 px-2 py-1 rounded-md border text-xs transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                isRecentKpi
                  ? "bg-primary/10 border-primary/40 text-primary"
                  : "border-border/70 text-muted-foreground hover:bg-muted/50",
              )}
              aria-pressed={isRecentKpi}
              title="Зміни за останні 30 днів"
            >
              {stats.recentNew > 0 && (
                <span className="inline-flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400">
                  <TrendingUp className="w-3 h-3" />+{stats.recentNew}
                </span>
              )}
              {stats.recentTerminated > 0 && (
                <span className="inline-flex items-center gap-0.5 text-red-600 dark:text-red-400">
                  <TrendingDown className="w-3 h-3" />−{stats.recentTerminated}
                </span>
              )}
              <span className="text-muted-foreground/80">за міс.</span>
            </button>
          )}
        </div>

        {/* Bottom row: типи договорів */}
        {visibleSegments.length > 0 && (
          <div className="flex items-center flex-wrap gap-1.5 pt-2 border-t border-border/60">
            {visibleSegments.map((seg) => {
              const isActive = contractFilter === seg.key;
              return (
                <button
                  key={seg.key}
                  type="button"
                  onClick={() => onContractTypeClick?.(seg.key)}
                  className={cn(
                    "inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs transition-colors",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted/60",
                  )}
                  aria-pressed={isActive}
                >
                  <span
                    aria-hidden
                    className={cn(
                      "w-1.5 h-1.5 rounded-full",
                      isActive ? "bg-primary" : "bg-muted-foreground/40",
                    )}
                  />
                  <span>{seg.label}</span>
                  <span className="font-semibold tabular-nums text-foreground">{seg.value}</span>
                </button>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
