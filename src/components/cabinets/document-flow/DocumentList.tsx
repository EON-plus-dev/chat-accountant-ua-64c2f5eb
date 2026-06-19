import React, { useState } from "react";
import { ChevronRight, ChevronDown, FileText, AlertCircle, CheckCircle, StickyNote, Circle, Clock, Copy, Check, Link2 } from "lucide-react";
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
import {
  type Document,
  documentTypeConfigs,
  formatDocumentAmount,
  detectDocumentIssues,
  getDocumentRowStyles,
  hasDocumentCriticalIssue,
  documentIssueTypeConfig,
  type DocumentIssueType,
} from "@/config/documentFlowConfig";
import { getApprovalState, getSlaInfo, type SlaSeverity } from "@/config/approvalWorkflowConfig";
import { getBusinessStatus, type BusinessStatusResult } from "@/config/businessStatusConfig";
import type { CabinetType } from "@/types/cabinet";
import { calculateDocumentSummary, type DocumentSummary } from "@/lib/documentSummary";
import { useMemo } from "react";
import { toast } from "sonner";
import {
  getOperationalData,
  getPriorityFromTags,
  responsibleUsers,
} from "@/config/operationalMetadataConfig";

type SummaryFilterType = "all" | "signed" | "pending" | "issues" | "unpaid";

interface DocumentListProps {
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

/**
 * Smart date formatter - shows year only for non-current year dates
 * Current year: "15.12", Other years: "15.12.24"
 */
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

/**
 * Get due date display with urgency color
 */
const getDueDateDisplay = (dueDate?: string) => {
  if (!dueDate) return null;
  
  const date = new Date(dueDate);
  const now = new Date();
  const daysUntil = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  let colorClass = "text-muted-foreground";
  let icon = null;
  
  if (daysUntil < 0) {
    // Overdue
    colorClass = "text-destructive";
    icon = <Clock className="w-3 h-3" />;
  } else if (daysUntil <= 3) {
    // Critical - 3 days or less
    colorClass = "text-destructive";
  } else if (daysUntil <= 7) {
    // Warning - 7 days or less
    colorClass = "text-amber-600 dark:text-amber-400";
  }
  
  return {
    text: formatDate(dueDate),
    colorClass,
    icon,
    daysUntil,
  };
};

// Mobile summary card with clickable elements
const MobileSummaryCard = ({ 
  summary, 
  onFilterClick 
}: { 
  summary: DocumentSummary; 
  onFilterClick?: (filterType: SummaryFilterType) => void;
}) => (
  <Card className="bg-muted/30 border-dashed">
    <CardContent className="p-3">
      <button 
        className="flex items-center gap-2 mb-2 hover:text-primary transition-colors"
        onClick={() => onFilterClick?.("all")}
      >
        <FileText className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm font-semibold">Усього документів</span>
      </button>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <button 
          className="text-left hover:bg-accent rounded-sm p-1 -m-1 transition-colors"
          onClick={() => onFilterClick?.("all")}
        >
          <div className="text-muted-foreground text-xs">Кількість</div>
          <div className="font-medium">{summary.totalCount}</div>
        </button>
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
          className="text-left hover:bg-accent rounded-sm p-1 -m-1 transition-colors"
          onClick={() => onFilterClick?.("unpaid")}
        >
          <div className="text-muted-foreground text-xs">До оплати</div>
          <div className="font-medium tabular-nums text-amber-600 dark:text-amber-400">
            {formatDocumentAmount(summary.unpaidAmount)}
          </div>
        </button>
      </div>
      <div className="flex items-center gap-4 mt-3 pt-3 border-t text-xs">
        <button 
          className="flex items-center gap-1.5 hover:bg-accent py-1 px-1.5 -mx-1 rounded-sm transition-colors"
          onClick={() => onFilterClick?.("signed")}
        >
          <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
          <span>{summary.signedCount} підписано</span>
        </button>
        <button 
          className="flex items-center gap-1.5 hover:bg-accent py-1 px-1.5 -mx-1 rounded-sm transition-colors"
          onClick={() => onFilterClick?.("pending")}
        >
          <FileText className="w-3.5 h-3.5 text-muted-foreground" />
          <span>{summary.pendingCount} в роботі</span>
        </button>
        {summary.documentsWithIssues > 0 && (
          <button 
            className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 hover:bg-accent py-1 px-1.5 -mx-1 rounded-sm transition-colors"
            onClick={() => onFilterClick?.("issues")}
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{summary.documentsWithIssues} проблем</span>
          </button>
        )}
      </div>
    </CardContent>
  </Card>
);

// Mobile card component
const DocumentCard = ({ 
  doc, 
  onClick,
  isSelected,
  isSelectionMode,
  onToggleSelection,
  businessStatus,
  slaInfo,
  linkedDocs = [],
  isLinksExpanded = false,
  onToggleLinks,
  onLinkedDocClick,
  cabinetType,
}: { 
  doc: Document; 
  onClick: () => void;
  isSelected?: boolean;
  isSelectionMode?: boolean;
  onToggleSelection?: () => void;
  businessStatus: BusinessStatusResult;
  slaInfo?: { daysInState: number; severity: SlaSeverity };
  linkedDocs?: Document[];
  isLinksExpanded?: boolean;
  onToggleLinks?: (e: React.MouseEvent) => void;
  onLinkedDocClick?: (linked: Document) => void;
  cabinetType?: CabinetType;
}) => {
  const typeConfig = documentTypeConfigs[doc.type];
  
  // Detect issues and get unified row styles
  const issues = detectDocumentIssues(doc);
  const rowStyles = getDocumentRowStyles(doc.status, issues);
  const isCritical = hasDocumentCriticalIssue(issues);
  
  // Get operational data for indicators
  const opData = getOperationalData(doc.id);
  const priorityTag = getPriorityFromTags(opData.tags);
  const responsibleUser = opData.responsible 
    ? responsibleUsers.find(u => u.id === opData.responsible)
    : null;
  const hasNote = Boolean(opData.internalNote);

  return (
    <Card 
      className={cn(
        "cursor-pointer hover:border-primary/50 hover:shadow-md transition-all active:scale-[0.99]",
        rowStyles.border && `border-l-[3px] ${rowStyles.border} row-highlight-hover`,
        rowStyles.bg,
        rowStyles.bgDark,
        isSelected && "ring-2 ring-primary"
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
          {isSelectionMode && (
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => onToggleSelection?.()}
              onClick={(e) => e.stopPropagation()}
              className="mt-0.5 shrink-0"
            />
          )}
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
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
              <div className="flex items-center gap-1 shrink-0">
                {/* Operational indicators */}
                {priorityTag && priorityTag.priorityLevel && priorityTag.priorityLevel <= 2 && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Circle 
                          className={cn(
                            "w-2.5 h-2.5 fill-current",
                            priorityTag.priorityLevel === 1 
                              ? "text-destructive" 
                              : "text-warning"
                          )} 
                        />
                      </TooltipTrigger>
                      <TooltipContent>{priorityTag.label}</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
                {hasNote && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <StickyNote className="w-3 h-3 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>Є примітка</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
                {responsibleUser && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <span className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-medium text-primary">
                          {responsibleUser.name.charAt(0)}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>{responsibleUser.name}</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
                {linkedDocs.length > 0 && (
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onToggleLinks?.(e); }}
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
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            <div className="flex items-center gap-1">
              <Badge variant="status" className={cn("text-xs", businessStatus.color)}>
                {businessStatus.label}
              </Badge>
              {/* SLA badge for mobile */}
              {slaInfo && slaInfo.severity !== "ok" && slaInfo.daysInState > 0 && (
                <Badge 
                  variant="outline" 
                  className={cn(
                    "text-[10px] px-1.5 gap-0.5",
                    slaInfo.severity === "critical" && "border-red-400 text-red-600 bg-red-50 dark:bg-red-950/30 dark:text-red-400",
                    slaInfo.severity === "warning" && "border-amber-400 text-amber-600 bg-amber-50 dark:bg-amber-950/30 dark:text-amber-400"
                  )}
                >
                  <Clock className="w-2.5 h-2.5" />
                  {slaInfo.daysInState}д
                </Badge>
              )}
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
              const lApproval = getApprovalState(linked.id, linked.type, linked.amount, cabinetType);
              const lStatus = getBusinessStatus(linked, lApproval, cabinetType);
              return (
                <button
                  key={linked.id}
                  type="button"
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

export const DocumentList = ({
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
  cabinetType = "fop",
}: DocumentListProps) => {
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
  
  // Calculate summary using unified function
  const summary = useMemo(() => calculateDocumentSummary(documents), [documents]);

  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="text-muted-foreground text-sm">
          Документів не знайдено
        </div>
      </div>
    );
  }

  // Mobile view - cards
  if (isMobile) {
    return (
      <div className="space-y-2">
        {documents.map((doc) => {
          // Get business status for each document
          const approvalState = getApprovalState(doc.id, doc.type, doc.amount, cabinetType);
          const businessStatus = getBusinessStatus(doc, approvalState, cabinetType);
          const slaInfo = getSlaInfo(approvalState, doc.updatedAt, doc.id);
          
          return (
            <DocumentCard 
              key={doc.id} 
              doc={doc} 
              onClick={() => onDocumentClick(doc)}
              isSelected={selectedIds.has(doc.id)}
              isSelectionMode={isSelectionMode}
              onToggleSelection={() => onToggleSelection?.(doc.id)}
              businessStatus={businessStatus}
              slaInfo={slaInfo}
              linkedDocs={getResolvedLinkedDocs(doc)}
              isLinksExpanded={expandedLinksIds.has(doc.id)}
              onToggleLinks={(e) => toggleLinkedDocs(e, doc.id)}
              onLinkedDocClick={onDocumentClick}
              cabinetType={cabinetType}
            />
          );
        })}
        {showSummary && <MobileSummaryCard summary={summary} onFilterClick={onSummaryFilterClick} />}
      </div>
    );
  }

  // Desktop view - table
  return (
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
              className="w-[15%] sticky left-0 bg-muted dark:bg-card z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] dark:shadow-[2px_0_8px_-2px_rgba(0,0,0,0.3)]"
            />
            <SortableHeader
              field="priority"
              label="Статус"
              currentField={sortField}
              direction={sortDirection}
              onSort={onSortChange}
              className="w-[120px]"
            />
            <TableHead className="w-[10%]">Тип</TableHead>
            <TableHead className="w-[18%]">Контрагент</TableHead>
            <SortableHeader
              field="amount"
              label="Сума"
              currentField={sortField}
              direction={sortDirection}
              onSort={onSortChange}
              className="w-[11%]"
              align="right"
              numeric
            />
            <SortableHeader
              field="date"
              label="Дата"
              currentField={sortField}
              direction={sortDirection}
              onSort={onSortChange}
              className="w-[70px]"
            />
            <SortableHeader
              field="dueDate"
              label="Термін"
              currentField={sortField}
              direction={sortDirection}
              onSort={onSortChange}
              className="w-[70px]"
            />
            <TableHead className="w-[90px] hidden lg:table-cell">Відповідальний</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {documents.map((doc) => {
            const typeConfig = documentTypeConfigs[doc.type];
            
            // Detect issues and get unified row styles
            const issues = detectDocumentIssues(doc);
            const rowStyles = getDocumentRowStyles(doc.status, issues);
            const isCritical = hasDocumentCriticalIssue(issues);
            const isSelected = selectedIds.has(doc.id);
            
            // Get business status for derived label
            const approvalState = getApprovalState(doc.id, doc.type, doc.amount, cabinetType);
            const businessStatus = getBusinessStatus(doc, approvalState, cabinetType);
            const slaInfo = getSlaInfo(approvalState, doc.updatedAt, doc.id);
            
            // Get operational data for indicators
            const opData = getOperationalData(doc.id);
            const priorityTag = getPriorityFromTags(opData.tags);
            const responsibleUser = opData.responsible 
              ? responsibleUsers.find(u => u.id === opData.responsible)
              : null;
            const hasNote = Boolean(opData.internalNote);
            
            // Get due date display
            const dueDateInfo = getDueDateDisplay(doc.dueDate);
            
            // Get linked documents
            const linkedDocs = getResolvedLinkedDocs(doc);
            const isLinksExpanded = expandedLinksIds.has(doc.id);

            return (
              <React.Fragment key={doc.id}>
                <TableRow 
                  className={cn(
                    "cursor-pointer hover:bg-muted/50",
                    rowStyles.border && `border-l-[3px] ${rowStyles.border} row-highlight-hover`,
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
                  {/* № документа - sticky */}
                  <TableCell className={cn(
                    "font-medium sticky left-0 z-10",
                    rowStyles.stickyBg || "bg-card",
                    rowStyles.stickyBgDark || "dark:bg-card",
                    "shadow-[2px_0_5px_-2px_rgba(0,0,0,0.08)] dark:shadow-[2px_0_8px_-2px_rgba(0,0,0,0.4)]"
                  )}>
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
                      {linkedDocs.length > 0 && (
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
                    <div className="flex items-center gap-1.5">
                      {priorityTag && priorityTag.priorityLevel && priorityTag.priorityLevel <= 2 && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Circle 
                                className={cn(
                                  "w-2 h-2 fill-current",
                                  priorityTag.priorityLevel === 1 
                                    ? "text-destructive" 
                                    : "text-warning"
                                )} 
                              />
                            </TooltipTrigger>
                            <TooltipContent>{priorityTag.label}</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                      <Badge variant="status" className={cn("text-xs", businessStatus.color)}>
                        {businessStatus.label}
                      </Badge>
                      {/* SLA badge for desktop */}
                      {slaInfo.severity !== "ok" && slaInfo.daysInState > 0 && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge 
                                variant="outline" 
                                className={cn(
                                  "text-[10px] px-1.5 gap-0.5",
                                  slaInfo.severity === "critical" && "border-red-400 text-red-600 bg-red-50 dark:bg-red-950/30 dark:text-red-400",
                                  slaInfo.severity === "warning" && "border-amber-400 text-amber-600 bg-amber-50 dark:bg-amber-950/30 dark:text-amber-400"
                                )}
                              >
                                <Clock className="w-2.5 h-2.5" />
                                {slaInfo.daysInState}д
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              {slaInfo.severity === "critical" 
                                ? `Критично: на ${slaInfo.role ? slaInfo.role : "ролі"} вже ${slaInfo.daysInState} днів`
                                : `Увага: на ${slaInfo.role ? slaInfo.role : "ролі"} вже ${slaInfo.daysInState} днів`
                              }
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
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
                      {hasNote && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <StickyNote className="w-3 h-3 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>Є примітка</TooltipContent>
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
                  {/* Термін */}
                  <TableCell>
                    {dueDateInfo ? (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className={cn("flex items-center gap-1 text-sm", dueDateInfo.colorClass)}>
                              {dueDateInfo.icon}
                              <span>{dueDateInfo.text}</span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            {dueDateInfo.daysUntil < 0 
                              ? `Прострочено на ${Math.abs(dueDateInfo.daysUntil)} дн.`
                              : dueDateInfo.daysUntil === 0 
                                ? "Термін сьогодні"
                                : `Залишилось ${dueDateInfo.daysUntil} дн.`
                            }
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  {/* Відповідальний */}
                  <TableCell className="hidden lg:table-cell">
                    {responsibleUser ? (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center gap-1.5">
                              <span className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-medium text-primary shrink-0">
                                {responsibleUser.name.charAt(0)}
                              </span>
                              <span className="text-sm truncate max-w-[70px]">
                                {responsibleUser.name.split(" ")[0]}
                              </span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>{responsibleUser.name}</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                </TableRow>
                {/* Expanded linked documents row */}
                {isLinksExpanded && linkedDocs.length > 0 && (
                  <TableRow className="bg-muted/20 hover:bg-muted/30">
                    <TableCell colSpan={isSelectionMode ? 10 : 9} className="py-2 pl-10">
                      <div className="flex flex-wrap gap-2">
                        {linkedDocs.map((linkedDoc) => {
                          const linkedTypeConfig = documentTypeConfigs[linkedDoc.type];
                          const linkedApprovalState = getApprovalState(linkedDoc.id, linkedDoc.type, linkedDoc.amount, cabinetType);
                          const linkedBusinessStatus = getBusinessStatus(linkedDoc, linkedApprovalState, cabinetType);
                          
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
        </TableBody>
        {showSummary && (
          <TableFooter sticky>
            <TableRow className="bg-background/95 font-medium">
              {/* Sticky first cell */}
              <TableCell className="sticky left-0 bg-background z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]" colSpan={isSelectionMode ? 2 : 1}>
                <button 
                  className="flex items-center gap-2 hover:text-primary transition-colors"
                  onClick={() => onSummaryFilterClick?.("all")}
                  aria-label="Показати всі документи"
                >
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  <span>Усього: {summary.totalCount}</span>
                </button>
              </TableCell>
              {/* Status summary */}
              <TableCell>
                <div className="flex items-center gap-2 text-xs">
                  <button
                    className="flex items-center gap-1 hover:bg-accent hover:text-accent-foreground py-1 px-1.5 -mx-1 rounded-sm transition-colors"
                    onClick={() => onSummaryFilterClick?.("signed")}
                    aria-label={`Показати ${summary.signedCount} підписаних документів`}
                  >
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                    {summary.signedCount}
                  </button>
                  <button
                    className="flex items-center gap-1 hover:bg-accent hover:text-accent-foreground py-1 px-1.5 -mx-1 rounded-sm text-muted-foreground transition-colors"
                    onClick={() => onSummaryFilterClick?.("pending")}
                    aria-label={`Показати ${summary.pendingCount} документів в роботі`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    {summary.pendingCount}
                  </button>
                  {summary.documentsWithIssues > 0 && (
                    <button
                      className="flex items-center gap-1 hover:bg-accent py-1 px-1.5 -mx-1 rounded-sm text-amber-600 dark:text-amber-400 transition-colors"
                      onClick={() => onSummaryFilterClick?.("issues")}
                      aria-label={`Показати ${summary.documentsWithIssues} документів з проблемами`}
                    >
                      <AlertCircle className="w-3.5 h-3.5" />
                      {summary.documentsWithIssues}
                    </button>
                  )}
                </div>
              </TableCell>
              <TableCell />
              <TableCell />
              <TableCell className="text-right tabular-nums">
                {formatDocumentAmount(summary.totalAmount)}
              </TableCell>
              <TableCell>
                <span className="text-xs text-muted-foreground">
                  Оплачено: {formatDocumentAmount(summary.paidAmount)}
                </span>
              </TableCell>
              <TableCell>
                {summary.unpaidAmount > 0 && (
                  <button
                    onClick={() => onSummaryFilterClick?.("unpaid")}
                    aria-label={`Показати документи до оплати на суму ${formatDocumentAmount(summary.unpaidAmount)}`}
                  >
                    <Badge 
                      variant="outline" 
                      className="text-xs text-amber-600 dark:text-amber-400 border-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30 cursor-pointer transition-colors"
                    >
                      До оплати: {formatDocumentAmount(summary.unpaidAmount)}
                    </Badge>
                  </button>
                )}
              </TableCell>
              <TableCell className="hidden lg:table-cell" />
            </TableRow>
          </TableFooter>
        )}
      </Table>
    </div>
  );
};
