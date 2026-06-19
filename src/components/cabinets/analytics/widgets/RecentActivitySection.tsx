import { useState, useMemo } from "react";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatValue } from "@/lib/formatters";
import { SectionBlock } from "./SectionBlock";
import type { FilterChip } from "./SectionBlock";
import type { ActivityCategory, ActivityChipId, ActivityEvent } from "@/types/analyticsTypes";

// Relative time formatting
function relativeTime(timestamp: string): string {
  const now = new Date();
  const date = new Date(timestamp);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return "щойно";
  if (diffMin < 60) return `${diffMin} хв тому`;
  if (diffHours < 24) return `${diffHours} год тому`;
  if (diffDays === 1) return "вчора";
  if (diffDays < 7) return `${diffDays} дн тому`;
  return date.toLocaleDateString("uk-UA", { day: "numeric", month: "short" });
}

// Map ActivityCategory to chip ID for filtering
function categoryToChip(cat: ActivityCategory): ActivityChipId {
  switch (cat) {
    case "transaction_income":
    case "transaction_expense":
      return "transactions";
    case "integration_sync":
      return "integrations";
    case "limit_status_change":
      return "limits";
    case "compliance_event":
      return "compliance";
    case "system_event":
      return "transactions";
  }
}

// Category-based styles
const categoryStyles: Record<ActivityCategory, string> = {
  transaction_income: "text-success bg-success/10",
  transaction_expense: "text-destructive bg-destructive/10",
  limit_status_change: "text-warning bg-warning/10",
  integration_sync: "text-primary bg-primary/10",
  compliance_event: "text-destructive bg-destructive/10",
  system_event: "text-muted-foreground bg-muted/50",
};

// Category-based amount color
function amountColor(cat: ActivityCategory): string {
  if (cat === "transaction_income") return "text-success";
  if (cat === "transaction_expense" || cat === "compliance_event") return "text-destructive";
  return "text-foreground";
}

interface RecentActivitySectionProps {
  events: ActivityEvent[];
  onShowLog?: () => void;
}

export const RecentActivitySection = ({ events, onShowLog }: RecentActivitySectionProps) => {
  const [activeFilter, setActiveFilter] = useState<string>("all");

  // Filter
  const filteredItems = useMemo(() => {
    if (activeFilter === "all") return events;
    return events.filter(item => categoryToChip(item.category) === activeFilter);
  }, [events, activeFilter]);

  // Category counts for filter chips
  const filterChips: FilterChip[] = useMemo(() => {
    const counts: Record<string, number> = { all: events.length };
    events.forEach(item => {
      const chip = categoryToChip(item.category);
      counts[chip] = (counts[chip] || 0) + 1;
    });
    return [
      { id: "all", label: "Усі", count: counts.all },
      { id: "transactions", label: "Транзакції", count: counts.transactions || 0 },
      { id: "integrations", label: "Інтеграції", count: counts.integrations || 0 },
      { id: "limits", label: "Ліміти", count: counts.limits || 0 },
      { id: "compliance", label: "Перевірки", count: counts.compliance || 0 },
    ].filter(c => c.id === "all" || c.count > 0);
  }, [events]);

  if (events.length === 0) return null;

  return (
    <SectionBlock
      title="Останні події"
      icon={Clock}
      count={events.length}
      filterChips={filterChips}
      activeFilter={activeFilter}
      onFilterChange={setActiveFilter}
      fixedHeight="340px"
      showAllLabel={onShowLog ? "Показати журнал" : undefined}
      onShowAll={onShowLog}
    >
      <div className="space-y-1.5">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
          >
            <div className={cn("flex items-center justify-center w-8 h-8 rounded-full shrink-0", categoryStyles[item.category])}>
              <item.icon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{item.title}</p>
              <p className="text-xs text-muted-foreground">
                {item.subtitle || item.source}
                <span className="ml-1 opacity-60">· {relativeTime(item.timestamp)}</span>
              </p>
            </div>
            {item.amount && (
              <span className={cn(
                "text-sm font-semibold tabular-nums shrink-0",
                amountColor(item.category)
              )}>
                {formatValue(item.amount.value, "currency")}
              </span>
            )}
          </div>
        ))}
        {filteredItems.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-4">Немає подій у цій категорії</p>
        )}
      </div>
    </SectionBlock>
  );
};
