import React, { useState, useMemo } from "react";
import { ChevronDown, ChevronRight, ChevronsDownUp, ChevronsUpDown, CalendarDays, FileText, CheckCircle, AlertCircle, Clock, Copy, Check, Link2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table";
import { SortableHeader } from "@/components/ui/sortable-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { groupByDate, type DateGroup } from "@/lib/groupByDate";
import { SwipeableCard } from "@/components/ui/SwipeableCard";
import { toast } from "sonner";
import {
  type Document,
  type DocumentFlowStatus,
  documentTypeConfigs,
  formatDocumentAmount,
  detectDocumentIssues,
  getDocumentRowStyles,
  hasDocumentCriticalIssue,
  documentIssueTypeConfig,
} from "@/config/documentFlowConfig";
import { calculateDocumentSummary, type DocumentSummary } from "@/lib/documentSummary";
import { getBusinessStatusForDocument } from "@/config/businessStatusConfig";
import type { CabinetType } from "@/types/cabinet";

export type SummaryFilterType = "signed" | "pending" | "issues" | "unpaid" | "all";

interface GroupedDocumentListProps {
  documents: Document[];
  onDocumentClick: (doc: Document) => void;
  sortField?: string;
  sortDirection?: "asc" | "desc";
  onSortChange?: (field: string) => void;
  showSummary?: boolean;
  // Selection props
  selectedIds?: Set<string>;
  isSelectionMode?: boolean;
  onToggleSelection?: (id: string) => void;
  // Summary filter callback
  onSummaryFilterClick?: (filterType: SummaryFilterType) => void;
  // All documents for resolving linked documents
  allDocuments?: Document[];
  // Cabinet type for business status resolution
  cabinetType?: CabinetType;
}

// Use unified summary from lib
const calculateGroupSummary = (docs: Document[]): DocumentSummary => {
  return calculateDocumentSummary(docs);
};

// Format date helper for table cells - show year for past years
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  const now = new Date();
  const isCurrentYear = date.getFullYear() === now.getFullYear();
  
  if (isCurrentYear) {
    return date.toLocaleDateString("uk-UA", {
      day: "2-digit",
      month: "2-digit",
    });
  }
  
  return date.toLocaleDateString("uk-UA", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });
};

// Helper functions for date display logic (synced with GroupedDailyView)
const DAYS_OF_WEEK = ["понеділок", "вівторок", "середа", "четвер", "п'ятниця", "субота", "неділя"];

const isRelativeSpecial = (label: string) => 
  label === "Сьогодні" || label === "Вчора" || DAYS_OF_WEEK.includes(label.toLowerCase());

const isDayOfWeekLabel = (label: string) =>
  DAYS_OF_WEEK.includes(label.toLowerCase());

// Mobile document card content (used inside SwipeableCard)
interface DocumentCardContentProps {
  doc: Document;
  onClick: () => void;
  cabinetType?: CabinetType;
  linkedDocs?: Document[];
  isLinksExpanded?: boolean;
  onToggleLinks?: (e: React.MouseEvent) => void;
  onLinkedDocClick?: (linked: Document) => void;
}
const DocumentCardContent = ({ doc, onClick, cabinetType, linkedDocs = [], isLinksExpanded = false, onToggleLinks, onLinkedDocClick }: DocumentCardContentProps) => {
  const typeConfig = documentTypeConfigs[doc.type];
  const businessStatus = getBusinessStatusForDocument(doc, cabinetType);
  
  // Detect issues and get unified row styles
  const issues = detectDocumentIssues(doc);
  const rowStyles = getDocumentRowStyles(doc.status, issues);
  const isCritical = hasDocumentCriticalIssue(issues);

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
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center gap-2">
              <typeConfig.icon className="w-4 h-4 text-muted-foreground shrink-0" />
              <span className="text-sm font-medium truncate">{doc.number}</span>
            </div>
            {doc.contractor && (
              <div className="text-sm text-muted-foreground truncate">
                {doc.contractor.name}
              </div>
            )}
            <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-2 min-w-0">
                <span>{formatDate(doc.date)}</span>
                {doc.amount !== undefined && (
                  <>
                    <span>•</span>
                    <span className="font-medium text-foreground truncate">
                      {formatDocumentAmount(doc.amount, doc.currency)}
                    </span>
                  </>
                )}
              </div>
              {linkedDocs.length > 0 && onToggleLinks && (
                <button
                  onClick={(e) => { e.stopPropagation(); onToggleLinks(e); }}
                  className={cn(
                    "flex items-center gap-1 px-1.5 h-6 rounded text-[11px] transition-colors shrink-0",
                    isLinksExpanded
                      ? "bg-primary/10 text-primary"
                      : "bg-muted/60 text-muted-foreground"
                  )}
                  aria-expanded={isLinksExpanded}
                  aria-label={`${isLinksExpanded ? 'Згорнути' : 'Показати'} пов'язані документи (${linkedDocs.length})`}
                >
                  <Link2 className="w-3 h-3" />
                  <span>{linkedDocs.length}</span>
                  {isLinksExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                </button>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            <div className="flex items-center gap-1">
              <Badge variant="status" className={cn("text-xs", businessStatus.color)}>
                {businessStatus.label}
              </Badge>
              {isCritical && issues.length > 0 && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                    </TooltipTrigger>
                    <TooltipContent>
                      {documentIssueTypeConfig[issues[0]].label}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </div>
        </div>
        {isLinksExpanded && linkedDocs.length > 0 && (
          <div
            className="mt-2 pt-2 border-t border-dashed flex flex-wrap gap-1.5"
            onClick={(e) => e.stopPropagation()}
          >
            {linkedDocs.map((linked) => {
              const lTypeConfig = documentTypeConfigs[linked.type];
              const lStatus = getBusinessStatusForDocument(linked, cabinetType);
              return (
                <button
                  key={linked.id}
                  onClick={() => onLinkedDocClick?.(linked)}
                  className="flex items-center gap-1 px-2 h-7 rounded-md bg-background border hover:border-primary/50 active:scale-[0.98] transition-all text-[11px]"
                >
                  <lTypeConfig.icon className="w-3 h-3 text-muted-foreground" />
                  <span className="font-medium truncate max-w-[100px]">{linked.number}</span>
                  <Badge variant="status" className={cn("text-[10px] px-1 py-0 h-4", lStatus.color)}>
                    {lStatus.label}
                  </Badge>
                </button>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Day group header for desktop - unified column structure (like Income Book)
interface DayGroupHeaderProps {
  group: DateGroup<Document>;
  isExpanded: boolean;
  onToggle: () => void;
  isSelectionMode?: boolean;
}

const DayGroupHeader = ({ group, isExpanded, onToggle, isSelectionMode = false }: DayGroupHeaderProps) => {
  // Calculate aggregated stats for collapsed view - Binary split with critical escalation
  const groupStats = useMemo(() => {
    const totalAmount = group.items.reduce((sum, doc) => sum + (doc.amount || 0), 0);
    const uniqueTypes = new Set(group.items.map(d => d.type)).size;
    const uniqueContractors = new Set(group.items.filter(d => d.contractor).map(d => d.contractor!.name)).size;
    
    // Binary split: completed vs in-progress
    const completedStatuses: DocumentFlowStatus[] = ["signed", "confirmed", "paid", "archived"];
    const completedCount = group.items.filter(d => completedStatuses.includes(d.status)).length;
    const inProgressCount = group.items.filter(d => !completedStatuses.includes(d.status) && d.status !== "cancelled").length;
    
    // Critical = issues with priority 1 (overdue, missing-signature, etc.)
    const criticalCount = group.items.filter(d => {
      const issues = detectDocumentIssues(d);
      return issues.some(issue => documentIssueTypeConfig[issue]?.priority === 1);
    }).length;
    
    return { totalAmount, uniqueTypes, uniqueContractors, completedCount, inProgressCount, criticalCount };
  }, [group.items]);
  
  return (
    <TableRow 
      className="bg-muted hover:bg-muted/80 cursor-pointer font-medium"
      onClick={onToggle}
      tabIndex={0}
      role="button"
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onToggle();
        }
      }}
    >
      {/* Checkbox placeholder */}
      {isSelectionMode && <TableCell className="py-2" />}
      
      {/* Date with expand indicator - sticky */}
      <TableCell className="py-2 sticky left-0 bg-muted dark:bg-card z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] dark:shadow-[2px_0_8px_-2px_rgba(0,0,0,0.3)]">
        <div className="flex items-center gap-2">
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
          ) : (
            <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
          )}
          <div className="flex flex-col">
            <span className="font-semibold text-sm">
              {isRelativeSpecial(group.relativeLabel) ? group.relativeLabel : group.label}
            </span>
            {isRelativeSpecial(group.relativeLabel) && (
              <span className="text-xs text-muted-foreground">{group.label}</span>
            )}
            {!isDayOfWeekLabel(group.relativeLabel) && group.dayOfWeek && (
              <span className="text-xs text-muted-foreground capitalize">{group.dayOfWeek}</span>
            )}
          </div>
        </div>
      </TableCell>
      
      {/* Status summary - Binary split with critical escalation (now 2nd column) */}
      <TableCell className="py-2">
        <div className="flex items-center gap-2">
          {/* Critical first (highest priority) */}
          {groupStats.criticalCount > 0 && (
            <span className="flex items-center gap-1 text-xs font-medium text-red-600 dark:text-red-400">
              <AlertCircle className="w-3.5 h-3.5" />
              {groupStats.criticalCount}
            </span>
          )}
          
          {/* Completed */}
          {groupStats.completedCount > 0 && (
            <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
              <CheckCircle className="w-3.5 h-3.5" />
              {groupStats.completedCount}
            </span>
          )}
          
          {/* In progress */}
          {groupStats.inProgressCount > 0 && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="w-3.5 h-3.5" />
              {groupStats.inProgressCount}
            </span>
          )}
        </div>
      </TableCell>
      
      {/* Type summary */}
      <TableCell className="py-2 text-muted-foreground text-sm">
        {groupStats.uniqueTypes} {groupStats.uniqueTypes === 1 ? "тип" : "типи"}
      </TableCell>
      
      {/* Contractor summary */}
      <TableCell className="py-2 text-muted-foreground text-sm">
        {groupStats.uniqueContractors > 0 ? `${groupStats.uniqueContractors} контраг.` : "—"}
      </TableCell>
      
      {/* Amount - aggregated */}
      <TableCell className="py-2 text-right tabular-nums font-semibold">
        {groupStats.totalAmount > 0 
          ? formatDocumentAmount(groupStats.totalAmount, "UAH")
          : "—"
        }
      </TableCell>
      
      {/* Count (using Date column space) */}
      <TableCell className="py-2 text-muted-foreground text-sm">
        {group.summary.count} док.
      </TableCell>
    </TableRow>
  );
};

// Mobile day group header
interface MobileDayGroupHeaderProps {
  group: DateGroup<Document>;
  isExpanded: boolean;
  onToggle: () => void;
}

const MobileDayGroupHeader = ({ group, isExpanded, onToggle }: MobileDayGroupHeaderProps) => {
  const totalAmount = group.items.reduce((sum, doc) => sum + (doc.amount || 0), 0);
  
  // Binary split with critical escalation (same logic as desktop)
  const completedStatuses: DocumentFlowStatus[] = ["signed", "confirmed", "paid", "archived"];
  const completedCount = group.items.filter(d => completedStatuses.includes(d.status)).length;
  const inProgressCount = group.items.filter(d => !completedStatuses.includes(d.status) && d.status !== "cancelled").length;
  const criticalCount = group.items.filter(d => {
    const issues = detectDocumentIssues(d);
    return issues.some(issue => documentIssueTypeConfig[issue]?.priority === 1);
  }).length;

  return (
    <div 
      className="sticky top-0 z-10 bg-card border-b py-2 px-1 cursor-pointer"
      onClick={onToggle}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onToggle();
        }
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          )}
          <CalendarDays className="w-4 h-4 text-primary" />
          <div className="flex flex-col">
            <span className="font-medium text-sm">
              {isRelativeSpecial(group.relativeLabel) ? group.relativeLabel : group.label}
            </span>
            {!isDayOfWeekLabel(group.relativeLabel) && group.dayOfWeek && (
              <span className="text-xs text-muted-foreground">{group.dayOfWeek}</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-muted-foreground">{group.summary.count} док.</span>
          {totalAmount > 0 && (
            <span className="font-medium">
              {(totalAmount / 1000).toFixed(1)}К
            </span>
          )}
          {/* Binary split status indicators */}
          <div className="flex items-center gap-1.5">
            {criticalCount > 0 && (
              <span className="flex items-center gap-0.5 text-red-600 dark:text-red-400">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{criticalCount}</span>
              </span>
            )}
            {completedCount > 0 && (
              <span className="flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>{completedCount}</span>
              </span>
            )}
            {inProgressCount > 0 && (
              <span className="flex items-center gap-0.5 text-muted-foreground">
                <Clock className="w-3.5 h-3.5" />
                <span>{inProgressCount}</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Mobile total summary card with clickable elements
interface MobileTotalSummaryCardProps {
  summary: ReturnType<typeof calculateGroupSummary>;
  onFilterClick?: (filterType: SummaryFilterType) => void;
}

const MobileTotalSummaryCard = ({ summary, onFilterClick }: MobileTotalSummaryCardProps) => (
  <Card className="bg-muted/30 border-dashed">
    <CardContent className="p-3">
      <div className="flex items-center gap-2 mb-2">
        <FileText className="w-4 h-4 text-muted-foreground" />
        <button
          onClick={() => onFilterClick?.("all")}
          className="text-sm font-semibold hover:text-primary transition-colors"
        >
          Усього документів
        </button>
      </div>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <div className="text-muted-foreground text-xs">Кількість</div>
          <div className="font-medium">{summary.totalCount}</div>
        </div>
        <div>
          <div className="text-muted-foreground text-xs">Загальна сума</div>
          <div className="font-medium tabular-nums">{formatDocumentAmount(summary.totalAmount)}</div>
        </div>
        <div>
          <div className="text-muted-foreground text-xs">Оплачено</div>
          <div className="font-medium tabular-nums text-emerald-600 dark:text-emerald-400">
            {formatDocumentAmount(summary.paidAmount)}
          </div>
        </div>
        <button
          onClick={() => onFilterClick?.("unpaid")}
          className="text-left hover:bg-accent rounded-sm p-1 -m-1 transition-colors"
        >
          <div className="text-muted-foreground text-xs">До оплати</div>
          <div className="font-medium tabular-nums text-amber-600 dark:text-amber-400">
            {formatDocumentAmount(summary.unpaidAmount)}
          </div>
        </button>
      </div>
      <div className="flex items-center gap-4 mt-3 pt-3 border-t text-xs">
        <button
          onClick={() => onFilterClick?.("signed")}
          className="flex items-center gap-1.5 hover:bg-accent py-1 px-1.5 -mx-1 rounded-sm transition-colors"
        >
          <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
          <span>{summary.signedCount} підписано</span>
        </button>
        <button
          onClick={() => onFilterClick?.("pending")}
          className="flex items-center gap-1.5 hover:bg-accent py-1 px-1.5 -mx-1 rounded-sm transition-colors"
        >
          <FileText className="w-3.5 h-3.5 text-muted-foreground" />
          <span>{summary.pendingCount} в роботі</span>
        </button>
        {summary.documentsWithIssues > 0 && (
          <button
            onClick={() => onFilterClick?.("issues")}
            className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 hover:bg-accent py-1 px-1.5 -mx-1 rounded-sm transition-colors"
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{summary.documentsWithIssues} проблем</span>
          </button>
        )}
      </div>
    </CardContent>
  </Card>
);

export const GroupedDocumentList = ({
  documents,
  onDocumentClick,
  sortField,
  sortDirection,
  onSortChange,
  showSummary = true,
  selectedIds = new Set(),
  isSelectionMode = false,
  onToggleSelection,
  onSummaryFilterClick,
  allDocuments = [],
  cabinetType,
}: GroupedDocumentListProps) => {
  const isMobile = useIsMobile();
  
  // State for expanded linked documents rows
  const [expandedLinksIds, setExpandedLinksIds] = useState<Set<string>>(new Set());
  // State for copied document numbers
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  // Handler for copying document number
  const handleCopyNumber = (e: React.MouseEvent, doc: Document) => {
    e.stopPropagation();
    const formattedDate = new Date(doc.date).toLocaleDateString("uk-UA");
    const textToCopy = `${doc.number} від ${formattedDate}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedId(doc.id);
    toast.success(`Скопійовано: ${textToCopy}`, { duration: 1500 });
    setTimeout(() => setCopiedId(null), 1500);
  };
  
  // Handler for toggling linked documents expansion
  const toggleLinkedDocs = (e: React.MouseEvent, docId: string) => {
    e.stopPropagation();
    setExpandedLinksIds(prev => {
      const next = new Set(prev);
      if (next.has(docId)) {
        next.delete(docId);
      } else {
        next.add(docId);
      }
      return next;
    });
  };
  
  // Resolve linked documents for a given document
  const getResolvedLinkedDocs = (doc: Document): Document[] => {
    if (!doc.linkedDocuments?.length) return [];
    return doc.linkedDocuments
      .map(id => allDocuments.find(d => d.id === id))
      .filter((d): d is Document => Boolean(d));
  };
  
  // Calculate total summary
  const totalSummary = useMemo(() => calculateGroupSummary(documents), [documents]);
  
  // Group documents by date
  const groupedDocuments = useMemo(() => {
    return groupByDate(documents, {
      getDate: (doc) => doc.date,
      getAmount: (doc) => doc.amount || 0,
      getStatus: (doc) => doc.status === "pending-sign" ? "needs-clarification" : "income",
    });
  }, [documents]);

  // Expanded state for each group
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(() => {
    // All groups expanded by default
    return new Set(groupedDocuments.map(g => g.date));
  });

  // Update expanded groups when documents change
  useMemo(() => {
    setExpandedGroups(new Set(groupedDocuments.map(g => g.date)));
  }, [groupedDocuments]);

  const toggleGroup = (date: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(date)) {
        next.delete(date);
      } else {
        next.add(date);
      }
      return next;
    });
  };

  const expandAll = () => {
    setExpandedGroups(new Set(groupedDocuments.map(g => g.date)));
  };

  const collapseAll = () => {
    setExpandedGroups(new Set());
  };

  const allExpanded = expandedGroups.size === groupedDocuments.length;

  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="text-muted-foreground text-sm">
          Документів не знайдено
        </div>
      </div>
    );
  }

  // Mobile view
  if (isMobile) {
    return (
      <div className="space-y-1">
        {/* Expand/Collapse controls */}
        <div className="flex justify-end mb-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={allExpanded ? collapseAll : expandAll}
            className="text-xs h-7 gap-1"
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

        {groupedDocuments.map((group) => {
          const isExpanded = expandedGroups.has(group.date);
          
          return (
            <div key={group.date}>
              <MobileDayGroupHeader
                group={group}
                isExpanded={isExpanded}
                onToggle={() => toggleGroup(group.date)}
              />
              {isExpanded && (
                <div className="space-y-2 py-2">
                {group.items.map((doc) => (
                    <DocumentCardContent
                      key={doc.id}
                      doc={doc}
                      onClick={() => onDocumentClick(doc)}
                      cabinetType={cabinetType}
                      linkedDocs={getResolvedLinkedDocs(doc)}
                      isLinksExpanded={expandedLinksIds.has(doc.id)}
                      onToggleLinks={(e) => toggleLinkedDocs(e, doc.id)}
                      onLinkedDocClick={(linked) => onDocumentClick(linked)}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
        
        {/* Mobile total summary */}
        {showSummary && <MobileTotalSummaryCard summary={totalSummary} onFilterClick={onSummaryFilterClick} />}
      </div>
    );
  }

  // Desktop view
  return (
    <div className="space-y-2">
      {/* Expand/Collapse controls */}
      <div className="flex justify-end">
        <Button
          variant="ghost"
          size="sm"
          onClick={allExpanded ? collapseAll : expandAll}
          className="text-xs h-7 gap-1"
        >
          {allExpanded ? (
            <>
              <ChevronsDownUp className="w-3.5 h-3.5" />
              Згорнути все
            </>
          ) : (
            <>
              <ChevronsUpDown className="w-3.5 h-3.5" />
              Розгорнути все
            </>
          )}
        </Button>
      </div>

      <div className="rounded-md border overflow-hidden">
        <Table containerClassName="md:max-h-[calc(100vh-270px)] md:overflow-auto">
          <TableHeader sticky>
            <TableRow>
              {isSelectionMode && <TableHead className="w-10" />}
              <SortableHeader
                field="number"
                label="№ документа"
                currentField={sortField}
                direction={sortDirection}
                onSort={onSortChange}
                className="w-[16%] sticky left-0 bg-muted dark:bg-card z-30 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] dark:shadow-[2px_0_8px_-2px_rgba(0,0,0,0.3)]"
              />
              <SortableHeader
                field="priority"
                label="Статус"
                currentField={sortField}
                direction={sortDirection}
                onSort={onSortChange}
                className="w-[14%]"
              />
              <TableHead className="w-[12%]">Тип</TableHead>
              <TableHead className="w-[22%]">Контрагент</TableHead>
              <SortableHeader
                field="amount"
                label="Сума"
                currentField={sortField}
                direction={sortDirection}
                onSort={onSortChange}
                align="right"
                numeric
                className="w-[14%]"
              />
              <SortableHeader
                field="date"
                label="Дата"
                currentField={sortField}
                direction={sortDirection}
                onSort={onSortChange}
                className="w-[10%]"
              />
            </TableRow>
          </TableHeader>
          <TableBody>
            {groupedDocuments.map((group) => {
              const isExpanded = expandedGroups.has(group.date);
              
              return (
                <React.Fragment key={group.date}>
                  <DayGroupHeader
                    group={group}
                    isExpanded={isExpanded}
                    onToggle={() => toggleGroup(group.date)}
                    isSelectionMode={isSelectionMode}
                  />
                  {isExpanded && group.items.map((doc, docIndex) => {
                    const typeConfig = documentTypeConfigs[doc.type];
                    const businessStatus = getBusinessStatusForDocument(doc, cabinetType);
                    
                    // Detect issues and get unified row styles
                    const issues = detectDocumentIssues(doc);
                    const rowStyles = getDocumentRowStyles(doc.status, issues);
                    const isCritical = hasDocumentCriticalIssue(issues);
                    const isSelected = selectedIds.has(doc.id);
                    const linkedDocs = getResolvedLinkedDocs(doc);
                    const hasLinks = linkedDocs.length > 0;
                    const isLinksExpanded = expandedLinksIds.has(doc.id);
                    
                    // Use opaque stickyBg/stickyBgDark from semanticStyles (fallback to bg-card)
                    const stickyBgLight = rowStyles.stickyBg || "bg-card";
                    const stickyBgDark = rowStyles.stickyBgDark || "dark:bg-card";

                    return (
                      <React.Fragment key={doc.id}>
                        <TableRow 
                          className={cn(
                            "cursor-pointer hover:bg-muted/50 group row-highlight-hover",
                            rowStyles.border && `border-l-[3px] ${rowStyles.border}`,
                            rowStyles.bg,
                            rowStyles.bgDark,
                            isSelected && "bg-primary/5"
                          )}
                          onClick={() => onDocumentClick(doc)}
                        >
                          {isSelectionMode && (
                            <TableCell onClick={(e) => e.stopPropagation()}>
                              <Checkbox
                                checked={isSelected}
                                onCheckedChange={() => onToggleSelection?.(doc.id)}
                              />
                            </TableCell>
                          )}
                        {/* № документа - sticky with opaque background matching row */}
                        <TableCell className={cn("font-medium sticky left-0 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.08)] dark:shadow-[2px_0_8px_-2px_rgba(0,0,0,0.4)]", stickyBgLight, stickyBgDark)}>
                            <div className="flex items-center gap-2 group/cell">
                              <typeConfig.icon className="w-4 h-4 text-muted-foreground" />
                              <span>{doc.number}</span>
                              {/* Inline copy button - appears on hover */}
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <button
                                      onClick={(e) => handleCopyNumber(e, doc)}
                                      className="opacity-0 group-hover/cell:opacity-100 transition-opacity p-0.5 hover:bg-muted rounded"
                                    >
                                      {copiedId === doc.id ? (
                                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                                      ) : (
                                        <Copy className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
                                      )}
                                    </button>
                                  </TooltipTrigger>
                                  <TooltipContent side="top" className="text-xs">
                                    Копіювати номер
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              {/* Link badge - always visible if has links */}
                              {hasLinks && (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <button
                                        onClick={(e) => toggleLinkedDocs(e, doc.id)}
                                        className={cn(
                                          "flex items-center gap-1 px-1.5 py-0.5 rounded text-xs transition-colors",
                                          isLinksExpanded
                                            ? "bg-primary/10 text-primary"
                                            : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                                        )}
                                      >
                                        <Link2 className="w-3 h-3" />
                                        <span>{linkedDocs.length}</span>
                                        {isLinksExpanded ? (
                                          <ChevronDown className="w-3 h-3" />
                                        ) : (
                                          <ChevronRight className="w-3 h-3" />
                                        )}
                                      </button>
                                    </TooltipTrigger>
                                    <TooltipContent side="top" className="text-xs">
                                      {isLinksExpanded ? "Згорнути зв'язки" : "Показати зв'язані документи"}
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}
                            </div>
                          </TableCell>
                          {/* Статус - 2-га позиція */}
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Badge variant="status" className={cn("text-xs", businessStatus.color)}>
                                {businessStatus.label}
                              </Badge>
                              {isCritical && issues.length > 0 && (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger>
                                      <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      {documentIssueTypeConfig[issues[0]].label}
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}
                            </div>
                          </TableCell>
                          {/* Тип */}
                          <TableCell className="text-muted-foreground">
                            {typeConfig.label}
                          </TableCell>
                          {/* Контрагент */}
                          <TableCell>
                            {doc.contractor ? (
                              <div className="truncate max-w-[200px]">
                                {doc.contractor.name}
                              </div>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          {/* Сума */}
                          <TableCell className="text-right font-medium tabular-nums">
                            {doc.amount !== undefined 
                              ? formatDocumentAmount(doc.amount, doc.currency)
                              : <span className="text-muted-foreground">—</span>
                            }
                          </TableCell>
                          {/* Дата */}
                          <TableCell>{formatDate(doc.date)}</TableCell>
                        </TableRow>
                        {/* Expanded linked documents row */}
                        {isLinksExpanded && hasLinks && (
                          <TableRow className="bg-muted/50 hover:bg-muted/60">
                            <TableCell colSpan={isSelectionMode ? 7 : 6} className="py-2 pl-10 sticky left-0 bg-muted/50 z-10">
                              <div className="flex flex-wrap gap-2">
                                {linkedDocs.map((linkedDoc) => {
                                  const linkedTypeConfig = documentTypeConfigs[linkedDoc.type];
                                  const linkedBusinessStatus = getBusinessStatusForDocument(linkedDoc, cabinetType);
                                  return (
                                    <button
                                      key={linkedDoc.id}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onDocumentClick(linkedDoc);
                                      }}
                                      className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-background border hover:border-primary/50 hover:shadow-sm transition-all text-xs"
                                    >
                                      <linkedTypeConfig.icon className="w-3.5 h-3.5 text-muted-foreground" />
                                      <span className="font-medium">{linkedDoc.number}</span>
                                      <Badge variant="status" className={cn("text-[10px] px-1 py-0", linkedBusinessStatus.color)}>
                                        {linkedBusinessStatus.label}
                                      </Badge>
                                    </button>
                                  );
                                })}
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    );
                  })}
                </React.Fragment>
              );
            })}
          </TableBody>
          {showSummary && (
            <TableFooter sticky>
              <TableRow className="bg-muted font-medium">
                {/* Sticky first cell */}
                <TableCell className="sticky left-0 bg-muted z-25 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]" colSpan={isSelectionMode ? 2 : 1}>
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    <button
                      onClick={() => onSummaryFilterClick?.("all")}
                      className="hover:underline hover:text-primary transition-colors"
                      aria-label="Показати всі документи"
                    >
                      Усього: {totalSummary.totalCount}
                    </button>
                  </div>
                </TableCell>
                {/* Status summary */}
                <TableCell>
                  <div className="flex items-center gap-2 text-xs">
                    <button
                      onClick={() => onSummaryFilterClick?.("signed")}
                      className="flex items-center gap-1 hover:bg-accent hover:text-accent-foreground py-1 px-1.5 -mx-1 rounded-sm transition-colors"
                      aria-label={`Показати ${totalSummary.signedCount} підписаних документів`}
                    >
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                      {totalSummary.signedCount}
                    </button>
                    <button
                      onClick={() => onSummaryFilterClick?.("pending")}
                      className="flex items-center gap-1 hover:bg-accent hover:text-accent-foreground py-1 px-1.5 -mx-1 rounded-sm text-muted-foreground transition-colors"
                      aria-label={`Показати ${totalSummary.pendingCount} документів в роботі`}
                    >
                      <FileText className="w-3.5 h-3.5" />
                      {totalSummary.pendingCount}
                    </button>
                    {totalSummary.documentsWithIssues > 0 && (
                      <button
                        onClick={() => onSummaryFilterClick?.("issues")}
                        className="flex items-center gap-1 hover:bg-accent py-1 px-1.5 -mx-1 rounded-sm text-amber-600 dark:text-amber-400 transition-colors"
                        aria-label={`Показати ${totalSummary.documentsWithIssues} документів з проблемами`}
                      >
                        <AlertCircle className="w-3.5 h-3.5" />
                        {totalSummary.documentsWithIssues}
                      </button>
                    )}
                  </div>
                </TableCell>
                <TableCell />
                <TableCell />
                <TableCell className="text-right tabular-nums">
                  {formatDocumentAmount(totalSummary.totalAmount)}
                </TableCell>
                <TableCell>
                  <span className="text-xs text-muted-foreground">
                    Оплачено: {formatDocumentAmount(totalSummary.paidAmount)}
                  </span>
                  {totalSummary.unpaidAmount > 0 && (
                    <button
                      onClick={() => onSummaryFilterClick?.("unpaid")}
                      className="ml-2"
                      aria-label={`Показати документи до оплати на суму ${formatDocumentAmount(totalSummary.unpaidAmount)}`}
                    >
                      <Badge 
                        variant="outline" 
                        className="text-xs text-amber-600 dark:text-amber-400 border-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30 cursor-pointer transition-colors"
                      >
                        До оплати: {formatDocumentAmount(totalSummary.unpaidAmount)}
                      </Badge>
                    </button>
                  )}
                </TableCell>
              </TableRow>
            </TableFooter>
          )}
        </Table>
      </div>
    </div>
  );
};
