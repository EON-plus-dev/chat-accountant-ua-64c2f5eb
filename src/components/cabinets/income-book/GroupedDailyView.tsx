import { useMemo, useState, useCallback, useEffect, Fragment } from "react";
import { ChevronDown, ChevronRight, Bot, Building2, ChevronsDownUp, ChevronsUpDown, AlertTriangle, AlertCircle, ArrowUpDown, ArrowUp, ArrowDown, Undo2, X, CheckCircle2, XCircle, Tag } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TableEmptyState } from "@/components/ui/table-empty-state";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Collapsible,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { groupByDate, type DateGroup } from "@/lib/groupByDate";
import { InlineQuickActions, type InlineStatusAction } from "@/components/ui/InlineQuickActions";
import { SwipeableCard } from "@/components/ui/SwipeableCard";
import {
  formatCurrency,
  formatDate,
  formatDateShort,
  getPaymentTypeShortLabel,
  getPaymentTypeBadgeColor,
  getSourceLabel,
  getSourceEmoji,
  getStatusLabel,
  getStatusColor,
  getRowStyles,
  hasCriticalIssue,
  issueTypeConfig,
  type IncomeBookRecord,
  type IncomeRecordStatus,
} from "@/config/incomeBookConfig";
import { getIncomeCategoryByCode, getExpenseCategoryByCode } from "@/config/categoriesConfig";

type SortField = "date" | "cash" | "bank" | "card" | "income" | "count";
type SortDirection = "asc" | "desc";

export type IncomeBookSummaryFilterType = "all" | "income" | "needs-clarification" | "return";

// Map inline/swipe status action → record updates; clears issueType when classification is committed
export const buildStatusUpdate = (
  record: IncomeBookRecord,
  status: InlineStatusAction
): Partial<IncomeBookRecord> => {
  const inIncomeBook =
    status === "income" ? record.amount : status === "return" ? -record.amount : 0;
  return {
    status: status as IncomeRecordStatus,
    issueType: undefined,
    inIncomeBook,
  };
};

// Compute days since record date (for "age" badges on needs-clarification)
const ageInDays = (iso: string): number => {
  const d = new Date(iso).getTime();
  const now = Date.now();
  return Math.max(0, Math.floor((now - d) / 86_400_000));
};

interface GroupedDailyViewProps {
  records: IncomeBookRecord[];
  onRecordClick: (record: IncomeBookRecord) => void;
  isMobile?: boolean;
  showSummary?: boolean;
  summaryLabel?: string;
  onCopyId?: (id: string) => void;
  onToggleFlag?: (id: string) => void;
  onLink?: (id: string) => void;
  onQuickAction?: (id: string) => void;
  /** Inline status mutation (✓ дохід / ✗ не в дохід / ↩ повернення) — also used by mobile swipe */
  onStatusChange?: (id: string, updates: Partial<IncomeBookRecord>) => void;
  flaggedIds?: Set<string>;
  onSummaryFilterClick?: (filterType: IncomeBookSummaryFilterType) => void;
  defaultAllExpanded?: boolean;
  /** Bulk-select mode (controlled). When provided, checkboxes appear and bar logic is enabled by parent. */
  selectedIds?: Set<string>;
  onToggleSelected?: (id: string) => void;
  onToggleSelectAll?: (ids: string[], allOn: boolean) => void;
  /** Flat list view: hide day-summary headers and render all records as a single continuous list. Sorting/footer/selection unchanged. */
  flat?: boolean;
  /** External date sort direction (mobile toolbar). When set, overrides default desc ordering of day groups. */
  externalDateSort?: "asc" | "desc";
}

const getSourceIcon = getSourceEmoji;
// Helper to get category display info
const getCategoryBadge = (record: IncomeBookRecord) => {
  if (!record.categoryCode) return null;
  const incCat = getIncomeCategoryByCode(record.categoryCode);
  const expCat = getExpenseCategoryByCode(record.categoryCode);
  const cat = incCat || expCat;
  if (!cat) return null;
  return { icon: cat.icon || "📋", name: cat.name, confirmed: record.categoryConfirmed };
};

// Helper functions for date display logic
const DAYS_OF_WEEK = ["понеділок", "вівторок", "середа", "четвер", "п'ятниця", "субота", "неділя"];

const isRelativeSpecial = (label: string) => 
  label === "Сьогодні" || label === "Вчора" || DAYS_OF_WEEK.includes(label.toLowerCase());

const isDayOfWeekLabel = (label: string) =>
  DAYS_OF_WEEK.includes(label.toLowerCase());

// Mobile date header
const MobileDateHeader = ({
  group,
  isExpanded,
  onToggle,
}: {
  group: DateGroup<IncomeBookRecord>;
  isExpanded: boolean;
  onToggle: () => void;
}) => {
  const hasIssues = group.summary.issuesCount > 0;

  return (
    <div
      className={cn(
        "sticky top-[88px] sm:top-[120px] z-20 flex items-center justify-between gap-2 px-2.5 py-1.5",
        "bg-card/95 backdrop-blur rounded-md mb-1 border-b border-border/50",
        "cursor-pointer active:bg-muted transition-colors min-h-[36px]"
      )}
      onClick={onToggle}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onToggle();
        }
      }}
      role="button"
      tabIndex={0}
    >
      <div className="flex items-center gap-1.5 min-w-0">
        {isExpanded ? (
          <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
        ) : (
          <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
        )}
        <span className="font-semibold text-[13px] truncate">
          {isRelativeSpecial(group.relativeLabel) ? group.relativeLabel : group.label}
        </span>
        {!isDayOfWeekLabel(group.relativeLabel) && (
          <span className="text-[11px] text-muted-foreground truncate">· {group.dayOfWeek}</span>
        )}
        <Badge variant="secondary" className="h-4 px-1 text-[10px] font-normal shrink-0">
          {group.summary.count}
        </Badge>
        {hasIssues && (
          <Badge variant="outline" className="h-4 px-1 text-[10px] bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 shrink-0">
            ⚠
          </Badge>
        )}
      </div>
      <span className={cn(
        "font-semibold tabular-nums text-[13px] shrink-0",
        group.summary.inIncomeBook >= 0
          ? "text-emerald-600 dark:text-emerald-400"
          : "text-blue-600 dark:text-blue-400"
      )}>
        {group.summary.inIncomeBook >= 0 ? "+" : ""}{formatCurrency(group.summary.inIncomeBook)}
      </span>
    </div>
  );
};

// Mobile card content (used inside SwipeableCard) — compact 2-line layout
const RecordCardContent = ({ record, onClick }: { record: IncomeBookRecord; onClick: () => void }) => {
  const rowStyles = getRowStyles(record.status, record.issueType);
  const catInfo = getCategoryBadge(record);
  const amountColor =
    record.status === "return"
      ? "text-blue-600 dark:text-blue-400"
      : record.status === "income"
      ? "text-emerald-600 dark:text-emerald-400"
      : "text-foreground";

  return (
    <div
      className={cn(
        "cursor-pointer active:bg-muted/40 transition-colors px-3 py-2 bg-card border border-border/60 rounded-md",
        rowStyles.border && `border-l-[3px] ${rowStyles.border}`,
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
      {/* Row 1: status · description · amount */}
      <div className="flex items-center gap-2">
        <Badge
          variant="status"
          className={cn("text-[10px] h-4 px-1.5 font-medium shrink-0", getStatusColor(record.status))}
        >
          {getStatusLabel(record.status)}
        </Badge>
        <span className="font-medium text-[13px] line-clamp-1 flex-1 min-w-0 text-foreground">
          {record.description}
        </span>
        {record.aiNote && (
          <Bot className="w-3.5 h-3.5 text-amber-500 shrink-0" aria-label={record.aiNote} />
        )}
        <span className={cn("text-sm font-semibold tabular-nums shrink-0", amountColor)}>
          {record.status === "return" ? "−" : "+"}{formatCurrency(record.amount)}
        </span>
      </div>

      {/* Row 2: contractor · source · payment · category */}
      <div className="flex items-center gap-1.5 mt-1 text-[11px] text-muted-foreground line-clamp-1">
        {record.contractor && (
          <span className="truncate max-w-[45%]">{record.contractor}</span>
        )}
        {record.contractor && <span className="opacity-50">·</span>}
        <span className="shrink-0">{getSourceIcon(record.source)}</span>
        <span className="shrink-0">{getPaymentTypeShortLabel(record.paymentType)}</span>
        {catInfo && (
          <>
            <span className="opacity-50">·</span>
            <span className="shrink-0" aria-label={catInfo.name}>{catInfo.icon}</span>
            <span className={cn("truncate", !catInfo.confirmed && "italic opacity-70")}>
              {catInfo.name.length > 16 ? catInfo.name.slice(0, 16) + "…" : catInfo.name}
            </span>
          </>
        )}
      </div>
    </div>
  );
};

// Desktop detail operation row (nested inside day group)
interface DetailRowProps {
  record: IncomeBookRecord;
  onClick: () => void;
  onCopyId?: (id: string) => void;
  onToggleFlag?: (id: string) => void;
  onLink?: (id: string) => void;
  onStatusChange?: (id: string, updates: Partial<IncomeBookRecord>) => void;
  isFlagged?: boolean;
  // Selection
  selectable?: boolean;
  isSelected?: boolean;
  onToggleSelected?: (id: string) => void;
}

const DetailRow = ({
  record,
  onClick,
  onCopyId,
  onToggleFlag,
  onLink,
  onStatusChange,
  isFlagged,
  selectable,
  isSelected,
  onToggleSelected,
}: DetailRowProps) => {
  const rowStyles = getRowStyles(record.status, record.issueType);
  const isCritical = hasCriticalIssue(record.issueType);
  const age = record.status === "needs-clarification" ? ageInDays(record.date) : 0;

  const handleStatus = (id: string, status: InlineStatusAction) => {
    onStatusChange?.(id, buildStatusUpdate(record, status));
  };

  return (
    <TableRow
      className={cn(
        "cursor-pointer hover:bg-muted/50 group transition-colors",
        rowStyles.border && `border-l-2 ${rowStyles.border}`,
        rowStyles.bg,
        rowStyles.bgDark,
        isSelected && "bg-primary/5"
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
      {/* Selection checkbox */}
      {selectable && (
        <TableCell className="w-[36px] pl-3 pr-0" onClick={(e) => e.stopPropagation()}>
          <Checkbox
            checked={!!isSelected}
            onCheckedChange={() => onToggleSelected?.(record.id)}
            aria-label="Вибрати операцію"
          />
        </TableCell>
      )}
      {/* Indented date/time placeholder */}
      <TableCell className={cn(selectable ? "pl-2" : "pl-8", "w-[120px]")}>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-muted-foreground">{formatDateShort(record.date)}</span>
          <Badge variant="status" className={cn("text-[10px] h-4 px-1", getStatusColor(record.status))}>
            {getStatusLabel(record.status)}
            {age > 0 && (
              <span className="ml-1 opacity-70">· {age}д</span>
            )}
          </Badge>
          {isCritical && record.issueType && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <AlertCircle className="w-3 h-3 text-red-500" />
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
                  <Bot className="w-3 h-3 text-amber-500" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  {record.aiNote}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </TableCell>
      {/* Description + contractor + category */}
      <TableCell className="max-w-[200px]">
        <div className="space-y-0.5">
          <div className="font-medium text-sm line-clamp-1 flex items-center gap-1.5">
            <span className="line-clamp-1">{record.description}</span>
            {record.linkedReturnId && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge
                      variant="outline"
                      className="h-4 px-1 text-[10px] gap-0.5 bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800 shrink-0"
                    >
                      <Undo2 className="w-2.5 h-2.5" />
                      #{record.linkedReturnId.slice(-4)}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    Пов'язана операція #{record.linkedReturnId}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {record.contractor && (
              <span className="text-xs text-muted-foreground line-clamp-1 flex items-center gap-1">
                <Building2 className="w-3 h-3 shrink-0" />
                {record.contractor}
              </span>
            )}
            {(() => {
              const catInfo = getCategoryBadge(record);
              if (!catInfo) return null;
              return (
                <Badge
                  variant="outline"
                  size="sm"
                  aria-label={catInfo.name}
                  className={cn(
                    "text-[10px] h-4 px-1",
                    catInfo.confirmed
                      ? "bg-primary/5 border-primary/20 text-primary"
                      : "border-dashed border-muted-foreground/40 text-muted-foreground"
                  )}
                >
                  {catInfo.icon} {catInfo.name.length > 10 ? catInfo.name.slice(0, 10) + "…" : catInfo.name}
                </Badge>
              );
            })()}
          </div>
        </div>
      </TableCell>
      {/* Cash */}
      <TableCell className="text-right w-[100px] tabular-nums text-sm">
        {record.paymentType === "cash" ? (
          <span className="text-emerald-600 dark:text-emerald-400">
            {formatCurrency(record.status === "return" ? -record.amount : record.amount)}
          </span>
        ) : "—"}
      </TableCell>
      {/* Bank */}
      <TableCell className="text-right w-[100px] tabular-nums text-sm">
        {record.paymentType === "bank" ? (
          <span className="text-blue-600 dark:text-blue-400">
            {formatCurrency(record.status === "return" ? -record.amount : record.amount)}
          </span>
        ) : "—"}
      </TableCell>
      {/* Card */}
      <TableCell className="text-right w-[100px] tabular-nums text-sm">
        {record.paymentType === "card" ? (
          <span className="text-violet-600 dark:text-violet-400">
            {formatCurrency(record.status === "return" ? -record.amount : record.amount)}
          </span>
        ) : "—"}
      </TableCell>
      {/* In income book */}
      <TableCell className="text-right w-[100px]">
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
            "font-semibold tabular-nums text-sm",
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
      {/* Source + actions */}
      <TableCell className="w-[88px]">
        <div className="flex items-center justify-end gap-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <span className="text-sm">{getSourceIcon(record.source)}</span>
              </TooltipTrigger>
              <TooltipContent>
                {getSourceLabel(record.source)}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <InlineQuickActions
            id={record.id}
            isFlagged={isFlagged}
            onCopyId={onCopyId}
            onToggleFlag={onToggleFlag}
            onLink={onLink}
            onStatusChange={onStatusChange ? handleStatus : undefined}
            currentStatus={record.status}
          />
        </div>
      </TableCell>
    </TableRow>
  );
};

export const GroupedDailyView = ({
  records,
  onRecordClick,
  isMobile = false,
  showSummary = true,
  summaryLabel,
  onCopyId,
  onToggleFlag,
  onLink,
  onQuickAction,
  onStatusChange,
  flaggedIds = new Set(),
  onSummaryFilterClick,
  defaultAllExpanded = false,
  selectedIds,
  onToggleSelected,
  onToggleSelectAll,
  flat = false,
  externalDateSort,
}: GroupedDailyViewProps) => {
  const selectable = !!selectedIds && !!onToggleSelected;
  // Group records by date
  const dateGroups = useMemo(() => {
    const groups = groupByDate(records, {
      getDate: (r) => r.date,
      getAmount: (r) => r.amount,
      getStatus: (r) => r.status,
      getInIncomeBook: (r) => r.inIncomeBook,
      getPaymentType: (r) => r.paymentType,
    });
    // groupByDate returns desc (newest first). Reverse if caller asked for asc.
    return externalDateSort === "asc" ? [...groups].reverse() : groups;
  }, [records, externalDateSort]);
  
  // Track expanded state for each group (all collapsed by default for table view)
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    () => defaultAllExpanded ? new Set<string>() : new Set<string>()
  );

  // When defaultAllExpanded turns on (or records change while it's on), expand all
  useEffect(() => {
    if (defaultAllExpanded) {
      setExpandedGroups(new Set(dateGroups.map((g) => g.date)));
    }
  }, [defaultAllExpanded, dateGroups]);
  
  // Sorting state
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  
  const handleSort = useCallback((field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  }, [sortField]);
  
  // Sort date groups
  const sortedDateGroups = useMemo(() => {
    const sorted = [...dateGroups];
    sorted.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case "date":
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case "cash":
          comparison = a.summary.cashAmount - b.summary.cashAmount;
          break;
        case "bank":
          comparison = a.summary.bankAmount - b.summary.bankAmount;
          break;
        case "card":
          comparison = a.summary.cardAmount - b.summary.cardAmount;
          break;
        case "income":
          comparison = a.summary.inIncomeBook - b.summary.inIncomeBook;
          break;
        case "count":
          comparison = a.summary.count - b.summary.count;
          break;
      }
      return sortDirection === "asc" ? comparison : -comparison;
    });
    return sorted;
  }, [dateGroups, sortField, sortDirection]);
  
  const toggleGroup = useCallback((date: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(date)) {
        next.delete(date);
      } else {
        next.add(date);
      }
      return next;
    });
  }, []);
  
  const expandAll = useCallback(() => {
    setExpandedGroups(new Set(dateGroups.map((g) => g.date)));
  }, [dateGroups]);
  
  const collapseAll = useCallback(() => {
    setExpandedGroups(new Set());
  }, []);
  
  // Total summary
  const totalSummary = useMemo(() => {
    return {
      recordsCount: records.length,
      incomeCount: records.filter((r) => r.status === "income").length,
      returnCount: records.filter((r) => r.status === "return").length,
      clarificationCount: records.filter((r) => r.status === "needs-clarification").length,
      totalAmount: records.reduce((sum, r) => sum + (r.status === "return" ? -r.amount : r.amount), 0),
      totalReturns: records.filter((r) => r.status === "return").reduce((sum, r) => sum + r.amount, 0),
      totalInIncome: records.reduce((sum, r) => sum + r.inIncomeBook, 0),
      totalCash: records
        .filter((r) => r.paymentType === "cash")
        .reduce((sum, r) => sum + (r.status === "return" ? -r.amount : r.amount), 0),
      totalBank: records
        .filter((r) => r.paymentType === "bank")
        .reduce((sum, r) => sum + (r.status === "return" ? -r.amount : r.amount), 0),
      totalCard: records
        .filter((r) => r.paymentType === "card")
        .reduce((sum, r) => sum + (r.status === "return" ? -r.amount : r.amount), 0),
    };
  }, [records]);
  
  const allExpanded = expandedGroups.size === dateGroups.length && dateGroups.length > 0;
  const allCollapsed = expandedGroups.size === 0;
  
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
  
  // Mobile view
  if (isMobile) {
    return (
      <div className={cn(flat ? "space-y-1" : "space-y-1.5")}>
        {/* Expand/Collapse controls — hidden in flat mode */}
        {!flat && (
          <div className="flex items-center justify-end gap-1 pb-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={allExpanded ? collapseAll : expandAll}
              className="h-7 text-xs gap-1 text-muted-foreground"
            >
              {allExpanded ? (
                <>
                  <ChevronsDownUp className="w-3.5 h-3.5" />
                  Згорнути
                </>
              ) : (
                <>
                  <ChevronsUpDown className="w-3.5 h-3.5" />
                  Розгорнути
                </>
              )}
            </Button>
          </div>
        )}
        
        {/* Date groups */}
        {dateGroups.map((group) => {
          const isExpanded = flat ? true : expandedGroups.has(group.date);

          return (
            <Collapsible
              key={group.date}
              open={isExpanded}
              onOpenChange={() => !flat && toggleGroup(group.date)}
            >
              {!flat && (
                <MobileDateHeader
                  group={group}
                  isExpanded={isExpanded}
                  onToggle={() => toggleGroup(group.date)}
                />
              )}
              <CollapsibleContent>
                <div className={cn(flat ? "space-y-1" : "space-y-1 pb-1")}>
                  {group.items.map((record) => (
                    <SwipeableCard
                      key={record.id}
                      id={record.id}
                      onCopyId={onCopyId}
                      onToggleFlag={onToggleFlag}
                      onLink={onLink}
                      onQuickAction={record.status === "needs-clarification" ? onQuickAction : undefined}
                      onStatusChange={
                        onStatusChange
                          ? (id, status) => onStatusChange(id, buildStatusUpdate(record, status))
                          : undefined
                      }
                      rightSwipeStatus={record.status === "income" ? "return" : "income"}
                      leftSwipeStatus="not-income"
                      isFlagged={flaggedIds.has(record.id)}
                    >
                      <RecordCardContent
                        record={record}
                        onClick={() => onRecordClick(record)}
                      />
                    </SwipeableCard>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          );
        })}
        
        {/* Total summary card */}
        {showSummary && (
          <Card className="bg-muted/50 border-dashed mt-2">
            <CardContent className="p-3">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <span className="font-medium text-sm">{summaryLabel || "Усього"}</span>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{totalSummary.recordsCount} операцій</span>
                    <span>({dateGroups.length} днів)</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(totalSummary.totalInIncome)}
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
  
  // Desktop view - NEW TABLE STRUCTURE
  return (
    <div className="border border-border/70 rounded-lg overflow-hidden">
      {/* Expand/Collapse toolbar — hidden in flat mode */}
      {!flat && (
        <div className="flex items-center justify-between px-3 py-1.5 bg-muted/50 border-b border-border/70">
          <span className="text-xs text-muted-foreground">
            {dateGroups.length} днів · {records.length} операцій
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={allExpanded ? collapseAll : expandAll}
            className="h-6 px-2 text-xs gap-1"
          >
            {allExpanded ? (
              <>
                <ChevronsDownUp className="w-3 h-3" />
                Згорнути
              </>
            ) : (
              <>
                <ChevronsUpDown className="w-3 h-3" />
                Розгорнути
              </>
            )}
          </Button>
        </div>
      )}
      {flat && (
        <div className="flex items-center justify-between px-3 py-1.5 bg-muted/50 border-b border-border/70">
          <span className="text-xs text-muted-foreground">
            {records.length} операцій (список)
          </span>
        </div>
      )}
      
      <div className="rounded-md border border-border/70 overflow-hidden">
        <Table containerClassName="md:max-h-[calc(100vh-280px)] md:overflow-auto">
          <TableHeader sticky>
            <TableRow className="hover:bg-muted/80">
              {selectable && (
                <TableHead className="w-[36px] pl-3 pr-0">
                  {(() => {
                    const allIds = records.map((r) => r.id);
                    const allOn = allIds.length > 0 && allIds.every((id) => selectedIds!.has(id));
                    const someOn = !allOn && allIds.some((id) => selectedIds!.has(id));
                    return (
                      <Checkbox
                        checked={allOn ? true : someOn ? "indeterminate" : false}
                        onCheckedChange={() => onToggleSelectAll?.(allIds, !allOn)}
                        aria-label="Вибрати всі"
                      />
                    );
                  })()}
                </TableHead>
              )}
              <TableHead 
                className={cn(selectable ? "w-[110px]" : "w-[120px]", "font-semibold cursor-pointer hover:bg-muted/70 transition-colors select-none")}
                onClick={() => handleSort("date")}
              >
                <div className="flex items-center gap-1">
                  Дата
                  {sortField === "date" ? (
                    sortDirection === "asc" ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                  ) : (
                    <ArrowUpDown className="w-3 h-3 text-muted-foreground/50" />
                  )}
                </div>
              </TableHead>
              <TableHead className="font-semibold">Опис</TableHead>
              <TableHead 
                className="text-right w-[100px] font-semibold cursor-pointer hover:bg-muted/70 transition-colors select-none"
                onClick={() => handleSort("cash")}
              >
                <div className="flex items-center justify-end gap-1">
                  <span className="text-emerald-600 dark:text-emerald-400">Готівка</span>
                  {sortField === "cash" ? (
                    sortDirection === "asc" ? <ArrowUp className="w-3 h-3 text-emerald-600" /> : <ArrowDown className="w-3 h-3 text-emerald-600" />
                  ) : (
                    <ArrowUpDown className="w-3 h-3 text-muted-foreground/50" />
                  )}
                </div>
              </TableHead>
              <TableHead 
                className="text-right w-[100px] font-semibold cursor-pointer hover:bg-muted/70 transition-colors select-none"
                onClick={() => handleSort("bank")}
              >
                <div className="flex items-center justify-end gap-1">
                  <span className="text-blue-600 dark:text-blue-400">Безготівка</span>
                  {sortField === "bank" ? (
                    sortDirection === "asc" ? <ArrowUp className="w-3 h-3 text-blue-600" /> : <ArrowDown className="w-3 h-3 text-blue-600" />
                  ) : (
                    <ArrowUpDown className="w-3 h-3 text-muted-foreground/50" />
                  )}
                </div>
              </TableHead>
              <TableHead 
                className="text-right w-[100px] font-semibold cursor-pointer hover:bg-muted/70 transition-colors select-none"
                onClick={() => handleSort("card")}
              >
                <div className="flex items-center justify-end gap-1">
                  <span className="text-violet-600 dark:text-violet-400">Картки</span>
                  {sortField === "card" ? (
                    sortDirection === "asc" ? <ArrowUp className="w-3 h-3 text-violet-600" /> : <ArrowDown className="w-3 h-3 text-violet-600" />
                  ) : (
                    <ArrowUpDown className="w-3 h-3 text-muted-foreground/50" />
                  )}
                </div>
              </TableHead>
              <TableHead 
                className="text-right w-[100px] font-semibold cursor-pointer hover:bg-muted/70 transition-colors select-none"
                onClick={() => handleSort("income")}
              >
                <div className="flex items-center justify-end gap-1">
                  У дохід
                  {sortField === "income" ? (
                    sortDirection === "asc" ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                  ) : (
                    <ArrowUpDown className="w-3 h-3 text-muted-foreground/50" />
                  )}
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedDateGroups.map((group) => {
              const isExpanded = flat ? true : expandedGroups.has(group.date);
              const hasIssues = group.summary.issuesCount > 0;
              const { cashAmount, bankAmount, cardAmount } = group.summary;

              return (
                <Fragment key={group.date}>
                  {/* Day summary row (clickable to expand) — hidden in flat mode */}
                  {!flat && (
                  <TableRow
                    className={cn(
                      "cursor-pointer hover:bg-muted/80 transition-colors font-medium",
                      isExpanded ? "bg-muted" : "bg-muted/50"
                    )}
                    onClick={() => toggleGroup(group.date)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        toggleGroup(group.date);
                      }
                    }}
                  >
                    {selectable && <TableCell className="w-[36px] pl-3 pr-0" />}
                    <TableCell className="py-2">
                      <div className="flex items-center gap-2">
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        )}
                        <div className="flex flex-col">
                          <span className="font-semibold text-sm">
                            {isRelativeSpecial(group.relativeLabel) ? group.relativeLabel : group.label}
                          </span>
                          {!isDayOfWeekLabel(group.relativeLabel) && (
                            <span className="text-xs text-muted-foreground font-normal capitalize">
                              {group.dayOfWeek}
                            </span>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground font-normal">
                          {group.summary.count} операцій
                        </span>
                        {hasIssues && (
                          <Badge variant="outline" className="h-5 px-1.5 text-xs bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800">
                            <AlertTriangle className="w-3 h-3 mr-0.5" />
                            {group.summary.issuesCount}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right py-2 tabular-nums">
                      {cashAmount > 0 ? (
                        <span className="text-emerald-600 dark:text-emerald-400">
                          {formatCurrency(cashAmount)}
                        </span>
                      ) : (
                        <span className="text-muted-foreground/50">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right py-2 tabular-nums">
                      {bankAmount > 0 ? (
                        <span className="text-blue-600 dark:text-blue-400">
                          {formatCurrency(bankAmount)}
                        </span>
                      ) : (
                        <span className="text-muted-foreground/50">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right py-2 tabular-nums">
                      {cardAmount > 0 ? (
                        <span className="text-violet-600 dark:text-violet-400">
                          {formatCurrency(cardAmount)}
                        </span>
                      ) : (
                        <span className="text-muted-foreground/50">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right py-2">
                      <span className={cn(
                        "font-bold tabular-nums",
                        group.summary.inIncomeBook >= 0 
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-blue-600 dark:text-blue-400"
                      )}>
                        {formatCurrency(group.summary.inIncomeBook)}
                      </span>
                    </TableCell>
                  </TableRow>
                  )}

                  {/* Expanded detail rows */}
                  {isExpanded && group.items.map((record) => (
                    <DetailRow
                      key={record.id}
                      record={record}
                      onClick={() => onRecordClick(record)}
                      onCopyId={onCopyId}
                      onToggleFlag={onToggleFlag}
                      onLink={onLink}
                      onStatusChange={onStatusChange}
                      isFlagged={flaggedIds.has(record.id)}
                      selectable={selectable}
                      isSelected={selectedIds?.has(record.id)}
                      onToggleSelected={onToggleSelected}
                    />
                  ))}
                </Fragment>
              );
            })}
          </TableBody>
          
          {/* Sticky footer with total summary - clickable elements */}
          {showSummary && (
            <TableFooter sticky>
              <TableRow className="bg-muted font-semibold hover:bg-muted">
                {selectable && <TableCell className="w-[36px] pl-3 pr-0" />}
                <TableCell className="py-2.5">
                  <button 
                    className="font-bold hover:text-primary transition-colors"
                    onClick={() => onSummaryFilterClick?.("all")}
                    aria-label="Показати всі операції"
                  >
                    {summaryLabel || "Усього"}
                  </button>
                </TableCell>
                <TableCell className="py-2.5">
                  <div className="flex items-center gap-2 text-xs font-normal">
                    <span className="text-muted-foreground">
                      {totalSummary.recordsCount} оп. за {dateGroups.length} днів
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => onSummaryFilterClick?.("income")}
                        className="hover:bg-accent hover:text-accent-foreground py-1 px-1.5 -mx-1 rounded-sm transition-colors text-emerald-600 dark:text-emerald-400"
                        aria-label={`Показати ${totalSummary.incomeCount} операцій у дохід`}
                      >
                        {totalSummary.incomeCount}✓
                      </button>
                      {totalSummary.clarificationCount > 0 && (
                        <button
                          onClick={() => onSummaryFilterClick?.("needs-clarification")}
                          className="hover:bg-accent py-1 px-1.5 -mx-1 rounded-sm transition-colors text-amber-500"
                          aria-label={`Показати ${totalSummary.clarificationCount} операцій що потребують уваги`}
                        >
                          {totalSummary.clarificationCount}⚠
                        </button>
                      )}
                      {totalSummary.returnCount > 0 && (
                        <button
                          onClick={() => onSummaryFilterClick?.("return")}
                          className="hover:bg-accent py-1 px-1.5 -mx-1 rounded-sm transition-colors text-blue-600 dark:text-blue-400"
                          aria-label={`Показати ${totalSummary.returnCount} повернень`}
                        >
                          {totalSummary.returnCount}↩
                        </button>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-right py-2.5 tabular-nums">
                  {totalSummary.totalCash !== 0 ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                      {formatCurrency(totalSummary.totalCash)}
                    </span>
                  ) : (
                    <span className="text-muted-foreground/50">—</span>
                  )}
                </TableCell>
                <TableCell className="text-right py-2.5 tabular-nums">
                  {totalSummary.totalBank !== 0 ? (
                    <span className="text-blue-600 dark:text-blue-400 font-bold">
                      {formatCurrency(totalSummary.totalBank)}
                    </span>
                  ) : (
                    <span className="text-muted-foreground/50">—</span>
                  )}
                </TableCell>
                <TableCell className="text-right py-2.5 tabular-nums">
                  {totalSummary.totalCard !== 0 ? (
                    <span className="text-violet-600 dark:text-violet-400 font-bold">
                      {formatCurrency(totalSummary.totalCard)}
                    </span>
                  ) : (
                    <span className="text-muted-foreground/50">—</span>
                  )}
                </TableCell>
                <TableCell className="text-right py-2.5">
                  <span className="text-base font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(totalSummary.totalInIncome)}
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
