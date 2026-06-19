import { Building2, TrendingUp, AlertTriangle, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatCompact } from "@/lib/formatters";
import type { Cabinet } from "@/types/cabinet";

type SummaryFilterType = "total" | "income" | "attention" | "deadlines" | null;

interface CabinetsSummaryProps {
  cabinets: Cabinet[];
  activeFilter?: SummaryFilterType;
  onFilterClick?: (filter: SummaryFilterType) => void;
}

const CabinetsSummary = ({ cabinets, activeFilter, onFilterClick }: CabinetsSummaryProps) => {
  const totalCabinets = cabinets.length;
  const totalIncome = cabinets.reduce((sum, c) => sum + (c.monthlyIncome || 0), 0);
  const needsAttention = cabinets.filter((c) => c.reportStatus === "tasks").length;
  const activeCabinets = cabinets.filter((c) => c.status === "active").length;

  // Calculate deadlines within this week (7 days)
  const now = new Date();
  const weekFromNow = new Date();
  weekFromNow.setDate(now.getDate() + 7);

  const cabinetsWithDeadlines = cabinets.filter((c) => {
    if (!c.nextDeadline || c.status === "archived") return false;
    const deadlineDate = new Date(c.nextDeadline);
    return deadlineDate >= now && deadlineDate <= weekFromNow;
  });
  const deadlinesCount = cabinetsWithDeadlines.length;

  const handleCardClick = (filterKey: SummaryFilterType) => {
    if (!onFilterClick) return;
    // Toggle: якщо клікнули на активний фільтр - скидаємо
    onFilterClick(activeFilter === filterKey ? null : filterKey);
  };

  const handleKeyDown = (e: React.KeyboardEvent, filterKey: SummaryFilterType, isClickable: boolean) => {
    if (!isClickable) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleCardClick(filterKey);
    }
  };

  const summaryItems: {
    key: SummaryFilterType;
    label: string;
    value: string | number;
    subValue: string;
    icon: typeof Building2;
    iconColor: string;
    clickable: boolean;
  }[] = [
    {
      key: "total",
      label: "Всього кабінетів",
      value: totalCabinets,
      subValue: `${activeCabinets} активних`,
      icon: Building2,
      iconColor: "text-primary",
      clickable: true,
    },
    {
      key: "income",
      label: "Загальний дохід",
      value: formatCompact(totalIncome),
      subValue: "за цей місяць",
      icon: TrendingUp,
      iconColor: "text-success",
      clickable: false,
    },
    {
      key: "attention",
      label: "Потребують уваги",
      value: needsAttention,
      subValue: needsAttention > 0 ? "є задачі" : "все добре",
      icon: AlertTriangle,
      iconColor: needsAttention > 0 ? "text-warning" : "text-muted-foreground",
      clickable: needsAttention > 0,
    },
    {
      key: "deadlines",
      label: "Найближчі дедлайни",
      value: deadlinesCount,
      subValue: deadlinesCount > 0 ? "у цьому тижні" : "немає",
      icon: Calendar,
      iconColor: deadlinesCount > 0 ? "text-destructive" : "text-muted-foreground",
      clickable: deadlinesCount > 0,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {summaryItems.map((item) => {
        const isActive = activeFilter === item.key;
        const isClickable = item.clickable && onFilterClick;

        return (
          <Card
            key={item.key}
            onClick={() => isClickable && handleCardClick(item.key)}
            onKeyDown={(e) => handleKeyDown(e, item.key, !!isClickable)}
            role={isClickable ? "button" : undefined}
            tabIndex={isClickable ? 0 : undefined}
            aria-pressed={isClickable ? isActive : undefined}
            aria-label={isClickable ? `Фільтрувати: ${item.label}` : undefined}
            className={cn(
              "border-border transition-all duration-200",
              isClickable && [
                "cursor-pointer",
                "hover:border-primary/50 hover:shadow-md",
                "active:scale-[0.98]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
              ],
              isActive && "ring-2 ring-primary border-primary/50 shadow-md",
              !isClickable && "cursor-default"
            )}
          >
            <CardContent className="p-3 md:p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1 min-w-0">
                  <p className="text-caption text-muted-foreground truncate">{item.label}</p>
                  <p className="text-kpi-number">{item.value}</p>
                  <p className="text-caption text-muted-foreground truncate">{item.subValue}</p>
                </div>
                <item.icon className={cn("w-4 h-4 flex-shrink-0", item.iconColor)} aria-hidden="true" />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default CabinetsSummary;