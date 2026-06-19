import { AlertCircle, CheckCircle, ChevronRight } from "lucide-react";
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

export type QuarterlySortField = "quarter" | "cash" | "bank" | "card" | "income";

interface QuarterlyAggregate {
  quarter: string; // "Q1", "Q2", etc.
  label: string; // "I квартал"
  months: string[]; // ["2025-01", "2025-02", "2025-03"]
  cash: number;
  bank: number;
  card: number;
  inIncomeBook: number;
  recordsCount: number;
  hasIssues: boolean;
  issueNote?: string;
}

interface QuarterlyViewProps {
  aggregates: MonthlyAggregate[];
  year: number;
  onQuarterClick: (quarter: string) => void;
  isMobile?: boolean;
  sortField?: QuarterlySortField;
  sortDirection?: SortDirection;
  onSort?: (field: QuarterlySortField) => void;
}

const quarterLabels: Record<string, string> = {
  Q1: "I квартал",
  Q2: "II квартал",
  Q3: "III квартал",
  Q4: "IV квартал",
};

const quarterMonths: Record<string, string[]> = {
  Q1: ["01", "02", "03"],
  Q2: ["04", "05", "06"],
  Q3: ["07", "08", "09"],
  Q4: ["10", "11", "12"],
};

// Aggregate monthly data into quarters
function aggregateToQuarters(monthlyData: MonthlyAggregate[], year: number): QuarterlyAggregate[] {
  const quarters: QuarterlyAggregate[] = [];
  
  for (const [qKey, months] of Object.entries(quarterMonths)) {
    const quarterMonthKeys = months.map(m => `${year}-${m}`);
    const quarterData = monthlyData.filter(m => quarterMonthKeys.includes(m.month));
    
    if (quarterData.length === 0) continue;
    
    const aggregate: QuarterlyAggregate = {
      quarter: qKey,
      label: quarterLabels[qKey],
      months: quarterMonthKeys,
      cash: quarterData.reduce((sum, m) => sum + (m.cash.income - m.cash.return), 0),
      bank: quarterData.reduce((sum, m) => sum + (m.bank.income - m.bank.return), 0),
      card: quarterData.reduce((sum, m) => sum + (m.card.income - m.card.return), 0),
      inIncomeBook: quarterData.reduce((sum, m) => sum + m.inIncomeBook, 0),
      recordsCount: quarterData.reduce((sum, m) => sum + m.recordsCount, 0),
      hasIssues: quarterData.some(m => m.hasIssues),
      issueNote: quarterData.find(m => m.issueNote)?.issueNote,
    };
    
    quarters.push(aggregate);
  }
  
  return quarters;
}

// Mobile card view
const QuarterCard = ({ aggregate, onClick }: { aggregate: QuarterlyAggregate; onClick: () => void }) => {
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
              {aggregate.cash > 0 ? formatCurrency(aggregate.cash) : "—"}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Безготівка</div>
            <div className="font-medium tabular-nums">
              {aggregate.bank > 0 ? formatCurrency(aggregate.bank) : "—"}
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

// Sortable column header
const SortableHeader = ({
  field,
  label,
  currentField,
  direction,
  onSort,
  className,
  align = "left",
}: {
  field: QuarterlySortField;
  label: string;
  currentField?: QuarterlySortField;
  direction?: SortDirection;
  onSort?: (field: QuarterlySortField) => void;
  className?: string;
  align?: "left" | "center" | "right";
}) => {
  const isActive = currentField === field;
  
  return (
    <TableHead
      className={cn(
        "cursor-pointer select-none hover:bg-muted/50 transition-colors",
        align === "right" && "text-right",
        align === "center" && "text-center",
        className
      )}
      onClick={() => onSort?.(field)}
      role="columnheader"
      aria-sort={isActive ? (direction === "asc" ? "ascending" : "descending") : "none"}
    >
      <span className={cn(
        "inline-flex items-center gap-0.5",
        align === "right" && "justify-end",
        align === "center" && "justify-center"
      )}>
        {label}
        <SortIndicator active={isActive} direction={isActive ? direction : null} />
      </span>
    </TableHead>
  );
};

export const QuarterlyView = ({ 
  aggregates, 
  year,
  onQuarterClick, 
  isMobile,
  sortField = "quarter",
  sortDirection = "asc",
  onSort,
}: QuarterlyViewProps) => {
  const quarters = aggregateToQuarters(aggregates, year);
  
  // Sort quarters
  const sortedQuarters = [...quarters].sort((a, b) => {
    let comparison = 0;
    switch (sortField) {
      case "quarter":
        comparison = a.quarter.localeCompare(b.quarter);
        break;
      case "cash":
        comparison = a.cash - b.cash;
        break;
      case "bank":
        comparison = a.bank - b.bank;
        break;
      case "card":
        comparison = a.card - b.card;
        break;
      case "income":
        comparison = a.inIncomeBook - b.inIncomeBook;
        break;
    }
    return sortDirection === "asc" ? comparison : -comparison;
  });
  
  const totalIncome = quarters.reduce((sum, q) => sum + q.inIncomeBook, 0);
  const totalCash = quarters.reduce((sum, q) => sum + q.cash, 0);
  const totalBank = quarters.reduce((sum, q) => sum + q.bank, 0);
  const totalCard = quarters.reduce((sum, q) => sum + q.card, 0);
  
  // Mobile: cards
  if (isMobile) {
    return (
      <div className="space-y-2">
        {sortedQuarters.map((q) => (
          <QuarterCard
            key={q.quarter}
            aggregate={q}
            onClick={() => onQuarterClick(q.quarter)}
          />
        ))}
        
        {/* Total */}
        <Card className="bg-muted/50 border-dashed">
          <CardContent className="p-3">
            <div className="flex justify-between items-center">
              <span className="font-medium text-sm">Усього за рік</span>
              <span className="text-lg font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
                {formatCurrency(totalIncome)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Desktop: table with sortable headers
  return (
    <div className="space-y-3">
      <div className="rounded-md border border-border/70 overflow-hidden">
        <Table containerClassName="md:max-h-[calc(100vh-280px)] md:overflow-auto">
          <caption className="sr-only">Книга доходів за кварталами</caption>
          <TableHeader sticky>
            <TableRow className="hover:bg-muted/80">
              <SortableHeader
                field="quarter"
                label="Квартал"
                currentField={sortField}
                direction={sortDirection}
                onSort={onSort}
                className="w-[140px]"
              />
              <SortableHeader
                field="cash"
                label="Готівка"
                currentField={sortField}
                direction={sortDirection}
                onSort={onSort}
                className="w-[100px]"
                align="right"
              />
              <SortableHeader
                field="bank"
                label="Безготівка"
                currentField={sortField}
                direction={sortDirection}
                onSort={onSort}
                className="w-[100px]"
                align="right"
              />
              <SortableHeader
                field="card"
                label="Картки/ПС"
                currentField={sortField}
                direction={sortDirection}
                onSort={onSort}
                className="w-[100px]"
                align="right"
              />
              <SortableHeader
                field="income"
                label="У дохід"
                currentField={sortField}
                direction={sortDirection}
                onSort={onSort}
                className="w-[120px] font-semibold"
                align="right"
              />
              <TableHead className="w-[50px] text-center">⚠️</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedQuarters.map((q) => (
              <TableRow
                key={q.quarter}
                className="cursor-pointer hover:bg-primary/5 group transition-colors"
                onClick={() => onQuarterClick(q.quarter)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onQuarterClick(q.quarter);
                  }
                }}
              >
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    {q.label}
                    <Badge variant="secondary" className="text-xs font-normal h-5 px-1.5">
                      {q.recordsCount}
                    </Badge>
                    <ChevronRight className="w-4 h-4 text-muted-foreground/0 group-hover:text-muted-foreground transition-colors ml-auto" />
                  </div>
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {q.cash > 0 ? formatCurrency(q.cash) : <span className="text-muted-foreground/50">—</span>}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {q.bank > 0 ? formatCurrency(q.bank) : <span className="text-muted-foreground/50">—</span>}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {q.card > 0 ? formatCurrency(q.card) : <span className="text-muted-foreground/50">—</span>}
                </TableCell>
                <TableCell className="text-right">
                  <span className="font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(q.inIncomeBook)}
                  </span>
                </TableCell>
                <TableCell className="text-center">
                  {q.hasIssues ? (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <AlertCircle className="w-4 h-4 text-amber-500 mx-auto" />
                        </TooltipTrigger>
                        <TooltipContent>
                          {q.issueNote}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ) : (
                    <CheckCircle className="w-4 h-4 text-emerald-500/50 mx-auto" />
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          
          {/* Sticky footer with total */}
          <TableFooter sticky>
            <TableRow className="bg-muted font-medium hover:bg-muted">
              <TableCell className="font-semibold">Усього</TableCell>
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
              <TableCell />
            </TableRow>
          </TableFooter>
        </Table>
      </div>
    </div>
  );
};
