import { useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  CreditUsageCategory, 
  creditUsageCategoryLabels 
} from "@/config/pricingData";

export interface CreditUsageFiltersState {
  category?: CreditUsageCategory;
  period?: "today" | "week" | "month" | "all";
  cabinetId?: string;
}

interface CreditUsageFiltersProps {
  filters: CreditUsageFiltersState;
  onFiltersChange: (filters: CreditUsageFiltersState) => void;
  cabinets?: Array<{ id: string; name: string }>;
  rightSlot?: React.ReactNode;
}

export const CreditUsageFilters = ({
  filters,
  onFiltersChange,
  cabinets = [],
  rightSlot,
}: CreditUsageFiltersProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const hasNonPeriodFilters = !!(filters.category || filters.cabinetId);

  const clearFilters = () => {
    onFiltersChange({ period: filters.period });
  };

  const categoryOptions: Array<{ value: CreditUsageCategory; label: string }> = [
    { value: "ai_session", label: creditUsageCategoryLabels.ai_session },
    { value: "document", label: creditUsageCategoryLabels.document },
    { value: "document_pack", label: creditUsageCategoryLabels.document_pack },
    { value: "report", label: creditUsageCategoryLabels.report },
    { value: "payment", label: creditUsageCategoryLabels.payment },
    { value: "payroll", label: creditUsageCategoryLabels.payroll },
    { value: "verification", label: creditUsageCategoryLabels.verification },
    { value: "signature", label: creditUsageCategoryLabels.signature },
    { value: "other", label: creditUsageCategoryLabels.other },
  ];

  const periodOptions = [
    { value: "today", label: "Сьогодні" },
    { value: "week", label: "Тиждень" },
    { value: "month", label: "Місяць" },
    { value: "all", label: "Весь час" },
  ];

  const currentPeriod = filters.period || "all";

  return (
    <div className="space-y-3">
      {/* Period chips - always visible */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {periodOptions.map((opt) => (
          <Button
            key={opt.value}
            variant={currentPeriod === opt.value ? "default" : "outline"}
            size="sm"
            className="h-7 text-xs px-2.5 rounded-full"
            onClick={() =>
              onFiltersChange({
                ...filters,
                period: opt.value as CreditUsageFiltersState["period"],
              })
            }
          >
            {opt.label}
          </Button>
        ))}

        {/* Separator + Filter button for category/cabinet */}
        <div className="h-5 w-px bg-border mx-1" />
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "gap-1.5 h-7 text-xs px-2.5 rounded-full",
            hasNonPeriodFilters && "border-primary text-primary"
          )}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Фільтри
          {hasNonPeriodFilters && (
            <Badge variant="secondary" className="h-4 px-1 text-[10px]">
              {[filters.category, filters.cabinetId].filter(Boolean).length}
            </Badge>
          )}
        </Button>

        {(hasNonPeriodFilters) && (
          <Button
            variant="ghost"
            size="sm"
            className="gap-1 h-7 text-xs px-2 text-muted-foreground rounded-full"
            onClick={clearFilters}
          >
            <X className="h-3 w-3" />
            Скинути
          </Button>
        )}

        {rightSlot && (
          <>
            <div className="ml-auto" />
            {rightSlot}
          </>
        )}
      </div>

      {/* Expanded: category + cabinet filters */}
      {isExpanded && (
        <div className="flex flex-wrap gap-2 p-3 bg-muted/30 rounded-lg border">
          {/* Category Filter */}
          <Select
            value={filters.category || "all-categories"}
            onValueChange={(value) => 
              onFiltersChange({ 
                ...filters, 
                category: value === "all-categories" ? undefined : value as CreditUsageCategory 
              })
            }
          >
            <SelectTrigger className="w-[160px] h-8 text-sm">
              <SelectValue placeholder="Категорія" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-categories">Всі категорії</SelectItem>
              {categoryOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Cabinet Filter - only show if multiple cabinets */}
          {cabinets.length > 1 && (
            <Select
              value={filters.cabinetId || "all-cabinets"}
              onValueChange={(value) => 
                onFiltersChange({ 
                  ...filters, 
                  cabinetId: value === "all-cabinets" ? undefined : value 
                })
              }
            >
              <SelectTrigger className="w-[150px] h-8 text-sm">
                <SelectValue placeholder="Кабінет" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-cabinets">Всі кабінети</SelectItem>
                {cabinets.map((cab) => (
                  <SelectItem key={cab.id} value={cab.id}>
                    {cab.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      )}
    </div>
  );
};
