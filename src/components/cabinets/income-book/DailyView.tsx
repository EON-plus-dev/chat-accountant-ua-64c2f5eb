import { useMemo } from "react";
import { ChevronRight, Bot, Building2, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TableEmptyState } from "@/components/ui/table-empty-state";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { SortIndicator } from "@/components/ui/sort-indicator";
import { cn } from "@/lib/utils";
import {
  formatCurrency,
  formatDate,
  getPaymentTypeShortLabel,
  getPaymentTypeBadgeColor,
  getSourceLabel,
  getSourceEmoji,
  getStatusLabel,
  getRowStyles,
  hasCriticalIssue,
  issueTypeConfig,
  type IncomeBookRecord,
} from "@/config/incomeBookConfig";
import type { SortDirection } from "@/hooks/use-sort-state";

export type DailySortField = "date" | "amount" | "status" | "source";

interface DailyViewProps {
  records: IncomeBookRecord[];
  onRecordClick: (record: IncomeBookRecord) => void;
  isMobile?: boolean;
  // Sorting props
  sortField?: DailySortField;
  sortDirection?: SortDirection;
  onSort?: (field: DailySortField) => void;
  // Summary props
  showSummary?: boolean;
  summaryLabel?: string;
}

const getSourceIcon = getSourceEmoji;

// Mobile card view
const RecordCard = ({ record, onClick }: { record: IncomeBookRecord; onClick: () => void }) => {
  const rowStyles = getRowStyles(record.status, record.issueType);
  const isCritical = hasCriticalIssue(record.issueType);
  
  return (
    <Card
      className={cn(
        "cursor-pointer hover:border-primary/50 hover:shadow-md transition-all active:scale-[0.99]",
        rowStyles.border && `border-l-[3px] ${rowStyles.border} row-highlight-hover`,
        rowStyles.bg,
        rowStyles.bgDark
      )}
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
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{formatDate(record.date)}</span>
            <Badge variant="status" className={cn("text-xs h-5", rowStyles.badge)}>
              {getStatusLabel(record.status)}
            </Badge>
            {isCritical && record.issueType && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                  </TooltipTrigger>
                  <TooltipContent>
                    {issueTypeConfig[record.issueType].label}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
        </div>
        
        <div className="space-y-1.5">
          <div className="font-medium text-sm leading-tight line-clamp-2">
            {record.description}
          </div>
          
          {record.contractor && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Building2 className="w-3 h-3" />
              <span className="truncate">{record.contractor}</span>
            </div>
          )}
          
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span>{getSourceIcon(record.source)}</span>
              <span className="truncate max-w-[80px]">{getSourceLabel(record.source)}</span>
              <Badge variant="outline" className={cn("h-4 px-1 text-[10px] font-medium", getPaymentTypeBadgeColor(record.paymentType))}>
                {getPaymentTypeShortLabel(record.paymentType)}
              </Badge>
            </div>
            <div className={cn(
              "font-semibold tabular-nums",
              record.status === "return" 
                ? "text-blue-600 dark:text-blue-400"
                : record.status === "income"
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-muted-foreground"
            )}>
              {record.status === "return" ? "-" : "+"}{formatCurrency(record.amount)}
            </div>
          </div>
          
          {record.aiNote && (
            <div className="flex items-start gap-1.5 pt-1 text-xs text-amber-600 dark:text-amber-400">
              <Bot className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span className="line-clamp-2">{record.aiNote}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Sortable column header - uses unified TableHead with sortable props
const SortableHeader = ({
  field,
  label,
  currentField,
  direction,
  onSort,
  className,
  align = "left",
}: {
  field: DailySortField;
  label: string;
  currentField?: DailySortField;
  direction?: SortDirection;
  onSort?: (field: DailySortField) => void;
  className?: string;
  align?: "left" | "center" | "right";
}) => {
  const isActive = currentField === field;
  
  return (
    <TableHead
      sortable
      sorted={isActive}
      sortDirection={isActive ? direction : null}
      onSort={() => onSort?.(field)}
      numeric={align === "right"}
      className={cn(
        align === "center" && "text-center",
        className
      )}
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

export const DailyView = ({ 
  records, 
  onRecordClick, 
  isMobile,
  sortField = "date",
  sortDirection = "desc",
  onSort,
  showSummary = true,
  summaryLabel,
}: DailyViewProps) => {
  // Calculate summary data
  const summary = useMemo(() => {
    const incomeRecords = records.filter(r => r.status === "income");
    const returnRecords = records.filter(r => r.status === "return");
    const clarificationRecords = records.filter(r => r.status === "needs-clarification");

    const signed = (r: IncomeBookRecord) => (r.status === "return" ? -r.amount : r.amount);
    const sumByType = (type: IncomeBookRecord["paymentType"]) =>
      records.filter(r => r.paymentType === type).reduce((s, r) => s + signed(r), 0);

    const totalCash = sumByType("cash");
    const totalBank = sumByType("bank");
    const totalCard = sumByType("card");
    const totalPrro = sumByType("prro");
    // Net inflow across all payment types (with sign for returns)
    const totalAmount = totalCash + totalBank + totalCard + totalPrro;
    const totalReturns = returnRecords.reduce((sum, r) => sum + r.amount, 0);
    const totalInIncome = records.reduce((sum, r) => sum + r.inIncomeBook, 0);

    return {
      recordsCount: records.length,
      incomeCount: incomeRecords.length,
      returnCount: returnRecords.length,
      clarificationCount: clarificationRecords.length,
      totalAmount,
      totalReturns,
      totalInIncome,
      totalCash,
      totalBank,
      totalCard,
      totalPrro,
    };
  }, [records]);

  if (records.length === 0) {
    return (
      <div className="border rounded-lg">
        <TableEmptyState
          title="Операцій не знайдено"
          description="Спробуйте змінити параметри фільтрів або підключіть джерела даних"
        />
      </div>
    );
  }

  // Mobile: cards with summary
  if (isMobile) {
    return (
      <div className="space-y-2">
        {records.map((record) => (
          <RecordCard
            key={record.id}
            record={record}
            onClick={() => onRecordClick(record)}
          />
        ))}
        
        {/* Mobile summary card */}
        {showSummary && (
          <Card className="bg-muted/30 border-dashed mt-2">
            <CardContent className="p-3">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <span className="font-medium text-sm">{summaryLabel || "Усього"}</span>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{summary.recordsCount} операцій</span>
                    {summary.returnCount > 0 && (
                      <span className="text-blue-600 dark:text-blue-400">
                        ({summary.returnCount} поверн.)
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(summary.totalInIncome)}
                  </div>
                  <div className="text-xs text-muted-foreground">у дохід</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // Desktop: table with sortable headers
  return (
    <div className="border border-border/70 rounded-lg overflow-hidden">
      <ScrollArea className="w-full">
        <Table>
          <caption className="sr-only">Операції за період</caption>
          <TableHeader>
            <TableRow className="hover:bg-muted/80">
              <SortableHeader
                field="date"
                label="Дата"
                currentField={sortField}
                direction={sortDirection}
                onSort={onSort}
                className="w-[90px] sticky left-0 bg-muted/30 z-10"
              />
              <TableHead className="min-w-[200px]">Опис</TableHead>
              <TableHead className="w-[90px] text-right">
                <span className="text-emerald-600 dark:text-emerald-400">Готівка</span>
              </TableHead>
              <TableHead className="w-[90px] text-right">
                <span className="text-blue-600 dark:text-blue-400">Безготівка</span>
              </TableHead>
              <TableHead className="w-[90px] text-right">
                <span className="text-violet-600 dark:text-violet-400">Картки</span>
              </TableHead>
              <TableHead className="w-[80px] text-right">
                <span className="text-amber-600 dark:text-amber-400">РРО</span>
              </TableHead>
              <SortableHeader
                field="status"
                label="Статус"
                currentField={sortField}
                direction={sortDirection}
                onSort={onSort}
                className="w-[100px]"
                align="center"
              />
              <TableHead className="w-[110px] text-right">У дохід</TableHead>
              <SortableHeader
                field="source"
                label="Джерело"
                currentField={sortField}
                direction={sortDirection}
                onSort={onSort}
                className="w-[80px]"
                align="center"
              />
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.map((record) => {
              const rowStyles = getRowStyles(record.status, record.issueType);
              const isCritical = hasCriticalIssue(record.issueType);
              const signed = record.status === "return" ? -record.amount : record.amount;
              const isCash = record.paymentType === "cash";
              const isBank = record.paymentType === "bank";
              const isCard = record.paymentType === "card";
              const isPrro = record.paymentType === "prro";

              return (
              <TableRow
                key={record.id}
                className={cn(
                  "cursor-pointer hover:bg-muted/50 group transition-colors",
                  rowStyles.border && `border-l-[3px] ${rowStyles.border} row-highlight-hover`,
                  rowStyles.bg,
                  rowStyles.bgDark
                )}
                onClick={() => onRecordClick(record)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onRecordClick(record);
                  }
                }}
              >
                <TableCell className="font-medium sticky left-0 bg-background z-10">
                  {formatDate(record.date)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="space-y-0.5 flex-1 min-w-0">
                      <div className="font-medium text-sm line-clamp-1">
                        {record.description}
                      </div>
                      {record.contractor && (
                        <div className="text-xs text-muted-foreground line-clamp-1 flex items-center gap-1">
                          <Building2 className="w-3 h-3 shrink-0" />
                          {record.contractor}
                        </div>
                      )}
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground/0 group-hover:text-muted-foreground transition-colors shrink-0" />
                  </div>
                </TableCell>
                <TableCell className="text-right tabular-nums text-sm">
                  {isCash ? (
                    <span className="text-emerald-600 dark:text-emerald-400">{formatCurrency(signed)}</span>
                  ) : <span className="text-muted-foreground/50">—</span>}
                </TableCell>
                <TableCell className="text-right tabular-nums text-sm">
                  {isBank ? (
                    <span className="text-blue-600 dark:text-blue-400">{formatCurrency(signed)}</span>
                  ) : <span className="text-muted-foreground/50">—</span>}
                </TableCell>
                <TableCell className="text-right tabular-nums text-sm">
                  {isCard ? (
                    <span className="text-violet-600 dark:text-violet-400">{formatCurrency(signed)}</span>
                  ) : <span className="text-muted-foreground/50">—</span>}
                </TableCell>
                <TableCell className="text-right tabular-nums text-sm">
                  {isPrro ? (
                    <span className="text-amber-600 dark:text-amber-400">{formatCurrency(signed)}</span>
                  ) : <span className="text-muted-foreground/50">—</span>}
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Badge variant="status" className={cn("text-xs h-5", rowStyles.badge)}>
                      {getStatusLabel(record.status)}
                    </Badge>
                    {isCritical && record.issueType && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                          </TooltipTrigger>
                          <TooltipContent>
                            {issueTypeConfig[record.issueType].label}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                    {record.aiNote && !isCritical && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Bot className="w-3.5 h-3.5 text-amber-500" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            {record.aiNote}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  {record.inIncomeBook === 0 && record.status === "not-income" ? (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <span className="text-xs text-muted-foreground italic">не врах.</span>
                        </TooltipTrigger>
                        <TooltipContent>Не враховується в дохід</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ) : (
                    <span className={cn(
                      "font-semibold tabular-nums",
                      record.inIncomeBook > 0
                        ? "text-emerald-600 dark:text-emerald-400"
                        : record.inIncomeBook < 0
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-muted-foreground/50"
                    )}>
                      {record.inIncomeBook === 0 ? "—" : formatCurrency(record.inIncomeBook)}
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <span className="text-base">{getSourceIcon(record.source)}</span>
                        </TooltipTrigger>
                        <TooltipContent>
                          {getSourceLabel(record.source)}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <Badge variant="outline" className={cn("h-5 px-1.5 text-[10px] font-medium", getPaymentTypeBadgeColor(record.paymentType))}>
                      {getPaymentTypeShortLabel(record.paymentType)}
                    </Badge>
                  </div>
                </TableCell>
              </TableRow>
              );
            })}

            {/* Summary row — Total inflow (sum of payment types) */}
            {showSummary && (
              <TableRow className="bg-muted/50 hover:bg-muted/50 font-medium border-t-2 border-border">
                <TableCell className="font-semibold sticky left-0 bg-muted/50 z-10">
                  {summaryLabel || "Усього надходжень"}
                </TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground">
                    {summary.recordsCount} операцій
                    {summary.returnCount > 0 && (
                      <span className="text-blue-600 dark:text-blue-400 ml-1">
                        ({summary.returnCount} поверн. −{formatCurrency(summary.totalReturns)})
                      </span>
                    )}
                  </span>
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {summary.totalCash !== 0 ? (
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(summary.totalCash)}</span>
                  ) : <span className="text-muted-foreground/50">—</span>}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {summary.totalBank !== 0 ? (
                    <span className="font-bold text-blue-600 dark:text-blue-400">{formatCurrency(summary.totalBank)}</span>
                  ) : <span className="text-muted-foreground/50">—</span>}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {summary.totalCard !== 0 ? (
                    <span className="font-bold text-violet-600 dark:text-violet-400">{formatCurrency(summary.totalCard)}</span>
                  ) : <span className="text-muted-foreground/50">—</span>}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {summary.totalPrro !== 0 ? (
                    <span className="font-bold text-amber-600 dark:text-amber-400">{formatCurrency(summary.totalPrro)}</span>
                  ) : <span className="text-muted-foreground/50">—</span>}
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-1.5 text-xs">
                    <span className="text-emerald-600 dark:text-emerald-400">{summary.incomeCount}✓</span>
                    {summary.clarificationCount > 0 && (
                      <span className="text-amber-500">{summary.clarificationCount}⚠</span>
                    )}
                    {summary.returnCount > 0 && (
                      <span className="text-blue-600 dark:text-blue-400">{summary.returnCount}↩</span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="text-base font-bold tabular-nums text-emerald-600 dark:text-emerald-400 cursor-help border-b border-dashed border-emerald-600/40">
                          {formatCurrency(summary.totalInIncome)}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        «Усього у книзі» = сума колонки «У дохід» (з урахуванням повернень).
                        <br />
                        «Усього надходжень» = сума за типами оплати.
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableCell>
                <TableCell />
              </TableRow>
            )}
          </TableBody>
        </Table>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
};
