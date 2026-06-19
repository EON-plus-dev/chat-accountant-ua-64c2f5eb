import { useState, useMemo } from "react";
import { ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SectionBlock } from "./SectionBlock";
import type { FilterChip, SortOption } from "./SectionBlock";
import type { AnalyticsRisk } from "@/types/analyticsTypes";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface RisksSectionBlockProps {
  risks: AnalyticsRisk[];
  onChatPromptInsert?: (prompt: string) => void;
  onScrollTo?: (sectionId: string) => void;
  onShowAll?: () => void;
  compact?: boolean;
}

const severityDot: Record<string, string> = {
  critical: "bg-destructive",
  warning: "bg-warning",
  info: "bg-muted-foreground",
};

const categoryLabelMap: Record<string, string> = {
  limit: "Ліміт",
  data: "Дані",
  compliance: "Compliance",
  finance: "Фінансові",
  operations: "Операційні",
};

type SortKey = "priority" | "time" | "impact";

export const RisksSectionBlock = ({ risks, onChatPromptInsert, onScrollTo, onShowAll, compact }: RisksSectionBlockProps) => {
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [activeSort, setActiveSort] = useState<SortKey>("priority");
  

  // Category filter chips
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    risks.forEach(r => {
      const cat = r.category || "other";
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  }, [risks]);

  // Filter and sort
  const filteredRisks = useMemo(() => {
    let result = activeFilter === "all" ? risks : risks.filter(r => r.category === activeFilter);

    if (activeSort === "priority") {
      const order = { critical: 0, warning: 1, info: 2 };
      result = [...result].sort((a, b) => {
        if (a.priority !== b.priority) return a.priority - b.priority;
        return (order[a.severity] ?? 2) - (order[b.severity] ?? 2);
      });
    } else if (activeSort === "time") {
      result = [...result].sort((a, b) => {
        const timeA = a.time?.detectedAt ? new Date(a.time.detectedAt).getTime() : 0;
        const timeB = b.time?.detectedAt ? new Date(b.time.detectedAt).getTime() : 0;
        return timeB - timeA; // newest first
      });
    }

    return result;
  }, [risks, activeFilter, activeSort]);

  if (risks.length === 0) return null;



  const filterChips: FilterChip[] = [
    { id: "all", label: "Усі", count: risks.length },
    ...Object.entries(categoryCounts).map(([cat, count]) => ({
      id: cat,
      label: categoryLabelMap[cat] || cat,
      count,
    })),
  ];

  const sortOptions: SortOption[] = [
    { id: "priority", label: "За пріоритетом" },
    { id: "time", label: "За часом" },
  ];

  const handleAction = (actionType: string, payload: string) => {
    switch (actionType) {
      case "chat-prompt":
        onChatPromptInsert?.(payload);
        toast.success("Запит надіслано в AI-Бухгалтера", { duration: 3000 });
        break;
      case "scroll":
        onScrollTo?.(payload);
        break;
    }
  };

  return (
    <SectionBlock
      title="Ризики"
      icon={ShieldAlert}
      count={risks.length}
      filterChips={filterChips}
      activeFilter={activeFilter}
      onFilterChange={setActiveFilter}
      fixedHeight={compact ? undefined : "380px"}
      showAllLabel={onShowAll ? "Показати всі" : undefined}
      onShowAll={onShowAll}
      sortOptions={sortOptions}
      activeSort={activeSort}
      onSortChange={(id) => setActiveSort(id as SortKey)}
    >
      <div className={cn("space-y-1.5", compact && "max-h-[400px] overflow-y-auto")}>
        {filteredRisks.map((risk) => {
          const primaryAction = risk.recommendedActions[0];
          return (
            <div
              key={risk.id}
              className={cn(
                "flex items-center gap-2.5 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors",
                compact ? "p-2 gap-2" : "p-2.5 gap-2.5"
              )}
            >
              {/* Severity dot + icon */}
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <div className={cn("w-2 h-2 rounded-full", severityDot[risk.severity])} aria-hidden="true" />
                <span className="sr-only">{risk.severity === "critical" ? "Критичний" : risk.severity === "warning" ? "Попередження" : "Інформація"}</span>
                <risk.icon className="w-3.5 h-3.5 text-muted-foreground" />
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <p className={cn("truncate", compact ? "text-xs" : "text-sm")}>{risk.title || risk.text}</p>
                {(risk.subtitle || risk.impact || risk.deadline) && (
                  <p className="text-xs text-muted-foreground truncate">
                    {risk.subtitle ? risk.subtitle : (
                      <>
                        {risk.impact && <span>{risk.impact}</span>}
                        {risk.impact && risk.deadline && <span> · </span>}
                        {risk.deadline && <span className="text-warning">до {risk.deadline}</span>}
                      </>
                    )}
                  </p>
                )}
              </div>

              {/* Value badge */}
              {risk.value && (
                <Badge variant="outline" size="sm" className="font-mono text-[10px] flex-shrink-0">
                  {risk.value}
                </Badge>
              )}

              {/* CTA */}
              {primaryAction && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="min-h-[44px] md:min-h-0 text-xs text-primary px-2 h-7 flex-shrink-0"
                  onClick={() => handleAction(primaryAction.actionType, primaryAction.actionPayload)}
                >
                  {primaryAction.label}
                </Button>
              )}
            </div>
          );
        })}
        {filteredRisks.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-4">Немає ризиків у цій категорії</p>
        )}
      </div>
    </SectionBlock>
  );
};
