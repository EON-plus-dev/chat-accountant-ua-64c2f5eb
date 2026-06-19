import { useMemo } from "react";
import { AlertCircle, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { SortIndicator } from "@/components/ui/sort-indicator";
import { cn } from "@/lib/utils";
import { formatCurrency, type MonthlyAggregate } from "@/config/incomeBookConfig";
import type { SortDirection } from "@/hooks/use-sort-state";

export type MonthlySortField = "month" | "cash" | "bank" | "card" | "income";

interface MonthlyViewProps {
  aggregates: MonthlyAggregate[];
  onMonthClick: (month: string) => void;
  isMobile?: boolean;
  showYearlyTotal?: boolean;
  quarterLabel?: string;
  sortField?: MonthlySortField;
  sortDirection?: SortDirection;
  onSort?: (field: MonthlySortField) => void;
}

// Sortable header component
const SortableHeader = ({
  field,
  currentField,
  direction,
  onSort,
  children,
  className,
}: {
  field: MonthlySortField;
  currentField?: MonthlySortField;
  direction?: SortDirection;
  onSort?: (field: MonthlySortField) => void;
  children: React.ReactNode;
  className?: string;
}) => {
  const isActive = currentField === field;
  
  return (
    <TableHead
      className={cn(
        "cursor-pointer select-none hover:bg-muted/50 transition-colors",
        className
      )}
      onClick={() => onSort?.(field)}
      role="columnheader"
      aria-sort={isActive ? (direction === "asc" ? "ascending" : "descending") : "none"}
    >
      <div className="flex items-center gap-1 justify-end">
        <span>{children}</span>
        <SortIndicator
          active={isActive}
          direction={isActive ? direction : undefined}
          className="ml-1"
        />
      </div>
    </TableHead>
  );
};

// Mobile card view
const MonthCard = ({ aggregate, onClick }: { aggregate: MonthlyAggregate; onClick: () => void }) => {
  return (
    <Card 
      className="cursor-pointer hover:border-primary/50 hover:shadow-md transition-all active:scale-[0.99]"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <CardContent className="p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="font-medium">{aggregate.label}</span>
            <Badge variant="secondary" className="text-xs font-normal h-5 px-1.5">
              {aggregate.recordsCount} оп.
            </Badge>
          </div>
          <div className="flex items-center gap-1.5">
            {aggregate.hasIssues && (
              <AlertCircle className="w-4 h-4 text-amber-500" />
            )}
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-2 text-sm">
          <div>
            <div className="text-xs text-muted-foreground">Готівка</div>
            <div className="font-medium tabular-nums">
              {aggregate.cash.income > 0 ? formatCurrency(aggregate.cash.income - aggregate.cash.return) : "—"}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Безготівка</div>
            <div className="font-medium tabular-nums">
              {aggregate.bank.income > 0 ? formatCurrency(aggregate.bank.income - aggregate.bank.return) : "—"}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-muted-foreground">У дохід</div>
            <div className="font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
              {formatCurrency(aggregate.inIncomeBook)}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const MonthlyView = ({ 
  aggregates, 
  onMonthClick, 
  isMobile,
  showYearlyTotal = true,
  quarterLabel,
  sortField,
  sortDirection,
  onSort,
}: MonthlyViewProps) => {
  // Sort aggregates if sorting is enabled
  const sortedAggregates = useMemo(() => {
    if (!sortField || !sortDirection) return aggregates;
    
    return [...aggregates].sort((a, b) => {
      let aVal: number;
      let bVal: number;
      
      switch (sortField) {
        case "month":
          // Month sorting is by date (already sorted by default)
          aVal = new Date(a.month + "-01").getTime();
          bVal = new Date(b.month + "-01").getTime();
          break;
        case "cash":
          aVal = a.cash.income - a.cash.return;
          bVal = b.cash.income - b.cash.return;
          break;
        case "bank":
          aVal = a.bank.income - a.bank.return;
          bVal = b.bank.income - b.bank.return;
          break;
        case "card":
          aVal = a.card.income - a.card.return;
          bVal = b.card.income - b.card.return;
          break;
        case "income":
          aVal = a.inIncomeBook;
          bVal = b.inIncomeBook;
          break;
        default:
          return 0;
      }
      
      return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
    });
  }, [aggregates, sortField, sortDirection]);

  const totalIncome = aggregates.reduce((sum, agg) => sum + agg.inIncomeBook, 0);
  const totalCash = aggregates.reduce((sum, agg) => sum + (agg.cash.income - agg.cash.return), 0);
  const totalBank = aggregates.reduce((sum, agg) => sum + (agg.bank.income - agg.bank.return), 0);
  const totalCard = aggregates.reduce((sum, agg) => sum + (agg.card.income - agg.card.return), 0);
  
  const totalLabel = quarterLabel ? `Усього за ${quarterLabel}` : "Усього за рік";
  
  // Mobile: cards (no sorting)
  if (isMobile) {
    return (
      <div className="space-y-2">
        {sortedAggregates.map((agg) => (
          <MonthCard
            key={agg.month}
            aggregate={agg}
            onClick={() => onMonthClick(agg.month)}
          />
        ))}
        
        {/* Total */}
        {showYearlyTotal && (
          <Card className="bg-muted/50 border-dashed">
            <CardContent className="p-3">
              <div className="flex justify-between items-center">
                <span className="font-medium text-sm">{totalLabel}</span>
                <span className="text-lg font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(totalIncome)}
                </span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // Desktop: table with sortable headers
  return (
    <div className="space-y-3">
      <div className="rounded-md border border-border/70 overflow-hidden">
        <Table containerClassName="md:max-h-[calc(100vh-280px)] md:overflow-auto">
          <caption className="sr-only">Книга доходів за місяцями</caption>
          <TableHeader sticky>
            <TableRow className="hover:bg-muted/80">
              <TableHead className="w-[140px]">Місяць</TableHead>
              <SortableHeader
                field="cash"
                currentField={sortField}
                direction={sortDirection}
                onSort={onSort}
                className="w-[100px] text-right"
              >
                Готівка
              </SortableHeader>
              <SortableHeader
                field="bank"
                currentField={sortField}
                direction={sortDirection}
                onSort={onSort}
                className="w-[100px] text-right"
              >
                Безготівка
              </SortableHeader>
              <SortableHeader
                field="card"
                currentField={sortField}
                direction={sortDirection}
                onSort={onSort}
                className="w-[100px] text-right"
              >
                Картки/ПС
              </SortableHeader>
              <SortableHeader
                field="income"
                currentField={sortField}
                direction={sortDirection}
                onSort={onSort}
                className="w-[120px] text-right font-semibold"
              >
                У дохід
              </SortableHeader>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedAggregates.map((agg) => {
              const cashNet = agg.cash.income - agg.cash.return;
              const bankNet = agg.bank.income - agg.bank.return;
              const cardNet = agg.card.income - agg.card.return;
              
              return (
                <TableRow
                  key={agg.month}
                  className="cursor-pointer hover:bg-primary/5 group transition-colors"
                  onClick={() => onMonthClick(agg.month)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onMonthClick(agg.month);
                    }
                  }}
                >
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {agg.label}
                      <Badge variant="secondary" className="text-xs font-normal h-5 px-1.5">
                        {agg.recordsCount}
                      </Badge>
                      {agg.hasIssues && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge variant="outline" className="h-5 px-1.5 text-xs bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800">
                                <AlertCircle className="w-3 h-3" />
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>{agg.issueNote}</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                      <ChevronRight className="w-4 h-4 text-muted-foreground/0 group-hover:text-muted-foreground transition-colors ml-auto" />
                    </div>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {cashNet > 0 ? formatCurrency(cashNet) : <span className="text-muted-foreground/50">—</span>}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {bankNet > 0 ? formatCurrency(bankNet) : <span className="text-muted-foreground/50">—</span>}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {cardNet > 0 ? formatCurrency(cardNet) : <span className="text-muted-foreground/50">—</span>}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(agg.inIncomeBook)}
                    </span>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
          
          {/* Sticky footer with total */}
          {showYearlyTotal && (
            <TableFooter sticky>
              <TableRow className="bg-muted font-medium hover:bg-muted">
                <TableCell className="font-semibold">{totalLabel}</TableCell>
                <TableCell className="text-right tabular-nums font-semibold">
                  {totalCash > 0 ? formatCurrency(totalCash) : "—"}
                </TableCell>
                <TableCell className="text-right tabular-nums font-semibold">
                  {totalBank > 0 ? formatCurrency(totalBank) : "—"}
                </TableCell>
                <TableCell className="text-right tabular-nums font-semibold">
                  {totalCard > 0 ? formatCurrency(totalCard) : "—"}
                </TableCell>
                <TableCell className="text-right">
                  <span className="text-lg font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(totalIncome)}
                  </span>
                </TableCell>
              </TableRow>
            </TableFooter>
          )}
        </Table>
      </div>
    </div>
  );
};
