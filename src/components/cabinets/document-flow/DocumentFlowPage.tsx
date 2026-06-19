import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { Plus, FileSignature, List, CalendarDays, Download, X, Upload, LayoutGrid, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Cabinet, CabinetType } from "@/types/cabinet";
import { DocumentList } from "./DocumentList";
import { GroupedDocumentList } from "./GroupedDocumentList";
import { DocumentDetailsSheet } from "./DocumentDetailsSheet";
import { CreateDocumentSheet } from "./CreateDocumentSheet";
import { UploadDocumentSheet } from "./UploadDocumentSheet";

import { DocumentFlowFilters, type DocumentFilterState, type DocumentQuickFilter } from "./DocumentFlowFilters";

import { SyncStatusButton } from "@/components/ui/SyncStatusButton";
import { DataQualityButton } from "@/components/ui/DataQualityButton";
import { RoleHintBanner } from "../RoleHintBanner";
import {
  type Document,
  type DocumentIssueType,
  fopDemoDocuments,
  tovDemoDocuments,
  individualDemoDocuments,
  detectDocumentIssues,
  documentIssueTypeConfig,
  getDocumentPriorityScore,
  isIncomingDocument,
} from "@/config/documentFlowConfig";
import { getApprovalState, getSlaInfo } from "@/config/approvalWorkflowConfig";
import { isDocumentAssignedToUser, countDocumentsOnMe, DEMO_CURRENT_USER_ROLE, DEMO_CURRENT_USER_ID } from "@/config/businessStatusConfig";
import { type DocumentTemplate } from "@/config/documentTemplatesConfig";
import { calculateDocumentSummary } from "@/lib/documentSummary";
import { useIsMobile } from "@/hooks/use-mobile";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useContainerWidth } from "@/hooks/use-container-width";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface DocumentFlowPageProps {
  cabinet: Cabinet;
  onChatPromptInsert?: (prompt: string) => void;
  onNavigateToSettings?: () => void;
  onNavigateToIncomeBook?: () => void;
  onNavigateToPayments?: () => void;
  onNavigateToCreateTemplate?: () => void;
  onNavigateToAddDocument?: () => void;
  onNavigateToDocumentDetail?: (documentId: string) => void;
  onScroll?: (isScrolled: boolean) => void;
}

type SortField = "number" | "date" | "amount" | "status" | "priority";
type SortDirection = "asc" | "desc";

// Get demo documents based on cabinet type
const getDemoDocuments = (cabinetType: CabinetType): Document[] => {
  switch (cabinetType) {
    case "fop":
      return fopDemoDocuments;
    case "tov":
      return tovDemoDocuments;
    case "individual":
      return individualDemoDocuments;
    default:
      return fopDemoDocuments;
  }
};

// Role hints for document flow
const roleHints: Record<string, string> = {
  owner: "Перевірте документи, що очікують вашого підпису",
  accountant: "Контролюйте статус оплати та терміни зберігання документів",
  auditor: "Режим перегляду: редагування документів недоступне",
};

export const DocumentFlowPage = ({ cabinet, onChatPromptInsert, onNavigateToSettings, onNavigateToIncomeBook, onNavigateToPayments, onNavigateToCreateTemplate, onNavigateToAddDocument, onNavigateToDocumentDetail, onScroll }: DocumentFlowPageProps) => {
  const isMobile = useIsMobile();
  // Container-driven layout: react to actual workspace width (not viewport),
  // so toolbar reflows when chat panel is collapsed/expanded.
  const toolbarRef = useRef<HTMLDivElement>(null);
  const toolbarWidth = useContainerWidth(toolbarRef);
  // Thresholds tuned to fit: search + filters + add | quality + sync + view + export
  const isWide = toolbarWidth >= 880; // single-row layout
  const isCompact = !isWide;          // 2-row layout (or mobile compact)
  const isPassive = cabinet.accessMode === "passive";
  
  // Local documents state (initialized from demo data, supports updates)
  const [documents, setDocuments] = useState<Document[]>(() => getDemoDocuments(cabinet.type));

  // View mode state with localStorage persistence
  const [viewMode, setViewMode] = useState<"list" | "grouped">(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("documents_view_mode");
      if (saved === "list" || saved === "grouped") {
        return saved;
      }
    }
    return "grouped";
  });

  // Persist view mode to localStorage
  useEffect(() => {
    localStorage.setItem("documents_view_mode", viewMode);
  }, [viewMode]);

  const [searchParams, setSearchParams] = useSearchParams();

  // Pick up filter from URL (deep-link from report review checklist)
  const initialQuickFilter = useMemo<DocumentFilterState["quickFilter"]>(() => {
    const v = searchParams.get("filter");
    const allowed: DocumentFilterState["quickFilter"][] = [
      "all", "pending-sign", "overdue", "unpaid", "archived", "has-issues", "pending-contractor",
    ];
    if (v && (allowed as string[]).includes(v)) {
      return v as DocumentFilterState["quickFilter"];
    }
    return "all";
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // State - for passive cabinets, default to incoming filter
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<DocumentFilterState>({
    types: [],
    statuses: [],
    quickFilter: initialQuickFilter,
    issueTypeFilter: null,
    dateRange: undefined,
    responsibleFilter: isPassive ? "incoming" : undefined,
  });

  // Clear filter param from URL after consuming + show toast
  useEffect(() => {
    if (searchParams.get("filter")) {
      const messages: Partial<Record<DocumentFilterState["quickFilter"], string>> = {
        "has-issues": "Показано документи, що потребують уваги",
        "pending-sign": "Показано документи, що очікують підпису",
        "overdue": "Показано прострочені документи",
        "unpaid": "Показано неоплачені документи",
        "archived": "Показано архівні документи",
        "pending-contractor": "Показано документи, що очікують контрагента",
      };
      const msg = messages[initialQuickFilter];
      if (msg) {
        toast({ title: "Фільтр застосовано", description: msg });
      }
      const next = new URLSearchParams(searchParams);
      next.delete("filter");
      setSearchParams(next, { replace: true });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const [sortField, setSortField] = useState<SortField>(isPassive ? "status" : "date");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  // Removed: createSheetOpen, uploadSheetOpen, templatesGalleryOpen - moved to AddDocumentPage
  const [selectedTemplateForCreate, setSelectedTemplateForCreate] = useState<DocumentTemplate | null>(null);
  
  // Batch selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  // Filter and sort documents
  const filteredDocuments = useMemo(() => {
    let filtered = [...documents];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((doc) => {
        const searchable = [
          doc.number,
          doc.title,
          doc.contractor?.name,
          doc.contractor?.code,
        ].filter(Boolean).join(" ").toLowerCase();
        return searchable.includes(query);
      });
    }

    // Type filter
    if (filters.types.length > 0) {
      filtered = filtered.filter((doc) => filters.types.includes(doc.type));
    }

    // Source type filter
    if (filters.sourceTypes && filters.sourceTypes.length > 0) {
      filtered = filtered.filter((doc) =>
        doc.sourceType && filters.sourceTypes!.includes(doc.sourceType)
      );
    }

    // Status filter
    if (filters.statuses.length > 0) {
      filtered = filtered.filter((doc) => filters.statuses.includes(doc.status));
    }

    // Date range filter
    if (filters.dateRange?.from) {
      filtered = filtered.filter((doc) => {
        const docDate = new Date(doc.date);
        const from = filters.dateRange!.from!;
        const to = filters.dateRange?.to || from;
        return docDate >= from && docDate <= to;
      });
    }

    // Issue type filter
    if (filters.issueTypeFilter) {
      filtered = filtered.filter((doc) => {
        const issues = detectDocumentIssues(doc);
        return issues.includes(filters.issueTypeFilter!);
      });
    }

    // Quick filters
    if (filters.quickFilter !== "all") {
      switch (filters.quickFilter) {
        case "pending-contractor":
          filtered = filtered.filter((doc) => doc.status === "draft-pending-contractor");
          break;
        case "pending-sign":
          filtered = filtered.filter((doc) => doc.status === "pending-sign");
          break;
        case "overdue":
          filtered = filtered.filter((doc) => {
            if (!doc.dueDate) return false;
            return new Date(doc.dueDate) < new Date() && doc.status !== "paid";
          });
          break;
        case "unpaid":
          filtered = filtered.filter((doc) => 
            doc.type === "invoice" && doc.status !== "paid" && doc.status !== "archived"
          );
          break;
        case "has-issues":
          filtered = filtered.filter((doc) => detectDocumentIssues(doc).length > 0);
          break;
        case "archived":
          filtered = filtered.filter((doc) => doc.status === "archived");
          break;
      }
    }

    // Responsible filter (Всі / Мої / Вхідні / На мені)
    if (filters.responsibleFilter && filters.responsibleFilter !== "all") {
      switch (filters.responsibleFilter) {
        case "my":
          // Документи, створені внутрішнім користувачем
          filtered = filtered.filter(doc => 
            ["owner", "user", "accountant", "admin"].includes(doc.createdBy.toLowerCase())
          );
          break;
        case "incoming":
          // Вхідні документи — отримані від контрагентів або імпортовані
          filtered = filtered.filter(doc => isIncomingDocument(doc));
          break;
        case "assigned-to-me":
          // Документи на мені — поточний користувач є активним погоджувачем
          // TODO: Replace DEMO_CURRENT_USER_ROLE with actual user role from auth context
          filtered = filtered.filter(doc => {
            const approvalState = getApprovalState(doc.id, doc.type, doc.amount, cabinet.type);
            return isDocumentAssignedToUser(doc, approvalState, DEMO_CURRENT_USER_ROLE);
          });
          break;
        default:
          // Фільтр за конкретним user ID (для майбутнього розширення)
          filtered = filtered.filter(doc => doc.createdBy === filters.responsibleFilter);
          break;
      }
    }

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case "number":
          comparison = a.number.localeCompare(b.number);
          break;
        case "date":
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case "amount":
          comparison = (a.amount || 0) - (b.amount || 0);
          break;
        case "status":
          comparison = a.status.localeCompare(b.status);
          break;
        case "priority":
          comparison = getDocumentPriorityScore(a) - getDocumentPriorityScore(b);
          break;
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });

    return filtered;
  }, [documents, searchQuery, filters, sortField, sortDirection]);

  // Calculate summary using unified function
  const summary = useMemo(() => calculateDocumentSummary(documents), [documents]);

  // Count documents assigned to current user
  const onMeCount = useMemo(() => 
    countDocumentsOnMe(documents, DEMO_CURRENT_USER_ROLE, DEMO_CURRENT_USER_ID, cabinet.type),
    [documents, cabinet.type]
  );

  // Check if has active filters
  const hasActiveFilters = 
    searchQuery ||
    filters.types.length > 0 ||
    filters.statuses.length > 0 ||
    filters.dateRange?.from ||
    filters.quickFilter !== "all" ||
    filters.issueTypeFilter ||
    (filters.responsibleFilter && filters.responsibleFilter !== "all") ||
    (filters.sourceTypes && filters.sourceTypes.length > 0);

  // Clear all filters handler
  const handleClearFilters = useCallback(() => {
    setSearchQuery("");
    setFilters({
      types: [],
      statuses: [],
      quickFilter: "all",
      issueTypeFilter: null,
      dateRange: undefined,
      responsibleFilter: "all",
      sourceTypes: [],
    });
  }, []);

  // Handlers
  const handleDocumentClick = useCallback((doc: Document) => {
    if (isSelectionMode) {
      toggleSelection(doc.id);
    } else if (onNavigateToDocumentDetail) {
      // Navigate to full document page
      onNavigateToDocumentDetail(doc.id);
    } else {
      // Fallback to sheet
      setSelectedDocument(doc);
      setDetailsOpen(true);
    }
  }, [isSelectionMode, onNavigateToDocumentDetail]);

  const handleSortChange = useCallback((field: string) => {
    if (field === sortField) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field as SortField);
      setSortDirection(field === "date" ? "desc" : "asc");
    }
  }, [sortField]);

  const handleQuickFilterChange = (quickFilter: DocumentQuickFilter) => {
    setFilters(prev => ({ ...prev, quickFilter, issueTypeFilter: null }));
  };

  const handleFilterByIssueType = useCallback((issueType: string) => {
    setFilters(prev => ({ 
      ...prev, 
      quickFilter: "has-issues",
      issueTypeFilter: issueType as DocumentIssueType 
    }));
    const config = documentIssueTypeConfig[issueType as DocumentIssueType];
    if (config) {
      toast({
        title: config.label,
        description: `Фільтр: "${config.shortLabel}"`,
      });
    }
    onChatPromptInsert?.(`Фільтрую документи: ${config?.label || issueType}`);
  }, [onChatPromptInsert]);

  const handleShowAllIssues = useCallback(() => {
    handleQuickFilterChange("has-issues");
  }, []);

  const handleSummaryFilter = useCallback((filterType: "all" | "signed" | "pending" | "issues" | "unpaid") => {
    switch (filterType) {
      case "all":
        setFilters(prev => ({ ...prev, statuses: [], quickFilter: "all", issueTypeFilter: null }));
        break;
      case "signed":
        setFilters(prev => ({ ...prev, statuses: ["signed", "sent", "confirmed", "paid", "registered"], quickFilter: "all", issueTypeFilter: null }));
        toast({ title: "Фільтр", description: "Показано підписані документи" });
        break;
      case "pending":
        setFilters(prev => ({ ...prev, statuses: ["draft", "pending-sign"], quickFilter: "all", issueTypeFilter: null }));
        toast({ title: "Фільтр", description: "Показано документи в роботі" });
        break;
      case "issues":
        setFilters(prev => ({ ...prev, statuses: [], quickFilter: "has-issues", issueTypeFilter: null }));
        toast({ title: "Фільтр", description: "Показано документи з проблемами" });
        break;
      case "unpaid":
        setFilters(prev => ({ ...prev, statuses: ["sent", "partially-paid"], quickFilter: "unpaid", issueTypeFilter: null }));
        toast({ title: "Фільтр", description: "Показано документи до оплати" });
        break;
    }
  }, []);

  // Removed: handleCreateDocument, handleTemplateSelect - moved to AddDocumentPage

  const handleDocumentCreated = () => {
    toast({
      title: "Документ створено",
      description: "Новий документ додано до списку",
    });
    setSelectedTemplateForCreate(null);
  };

  // Handle document update from edit mode
  const handleDocumentUpdate = useCallback((docId: string, updates: Partial<Document>) => {
    setDocuments(prev => prev.map(doc => 
      doc.id === docId 
        ? { ...doc, ...updates, updatedAt: new Date().toISOString() } 
        : doc
    ));
    
    // Update selected document if it's currently open
    if (selectedDocument?.id === docId) {
      setSelectedDocument(prev => prev ? { ...prev, ...updates, updatedAt: new Date().toISOString() } : null);
    }
  }, [selectedDocument?.id]);

  // Handle document status change
  const handleStatusChange = useCallback((docId: string, newStatus: Document["status"]) => {
    setDocuments(prev => prev.map(doc => 
      doc.id === docId 
        ? { ...doc, status: newStatus, updatedAt: new Date().toISOString() } 
        : doc
    ));
    
    // Update selected document if it's currently open
    if (selectedDocument?.id === docId) {
      setSelectedDocument(prev => prev ? { ...prev, status: newStatus, updatedAt: new Date().toISOString() } : null);
    }
  }, [selectedDocument?.id]);

  const handleMassSign = () => {
    if (selectedIds.size > 0) {
      toast({
        title: "Масовий підпис",
        description: `Обрано ${selectedIds.size} документів для підпису (демо)`,
      });
    } else {
      toast({
        title: "Масовий підпис",
        description: "Оберіть документи для підпису",
      });
    }
  };

  const handleExport = (format: "excel" | "pdf" | "csv") => {
    const count = selectedIds.size > 0 ? selectedIds.size : filteredDocuments.length;
    toast({
      title: `Експорт у ${format.toUpperCase()}`,
      description: `Експортовано ${count} документів (демо)`,
    });
  };

  // Selection handlers
  const toggleSelection = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectAll = () => {
    if (selectedIds.size === filteredDocuments.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredDocuments.map(d => d.id)));
    }
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
    setIsSelectionMode(false);
  };

  const roleHint = roleHints[cabinet.role] || roleHints.owner;

  return (
    <div className="space-y-2 pt-5">
      {/* Role Hint Banner — moved to top for max visibility */}
      <RoleHintBanner 
        hint={roleHint} 
        subtabId="documents"
        onAction={cabinet.role === "owner" ? () => handleQuickFilterChange("pending-sign") : undefined}
        actionLabel="Переглянути"
      />

      {/* Level 1: Global Toolbar — container-driven: 1 row when workspace is wide enough, 2 rows otherwise */}
      <div
        ref={toolbarRef}
        className={cn(
          "flex gap-2",
          isWide ? "flex-row items-center" : "flex-col",
        )}
      >
        {/* Primary row: Search + Filters + Add (compact only) */}
        <div className={cn("flex items-center gap-2", isWide ? "contents" : "")}>
          {/* Search + Filters (search expands to fill available space) */}
          <div className={cn("min-w-0", isWide ? "flex-none w-72" : "flex-1")}>
            <DocumentFlowFilters
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              filters={filters}
              onFiltersChange={setFilters}
              onQuickFilterChange={handleQuickFilterChange}
              isMobile={isMobile}
              isCompact={isCompact}
              filteredCount={filteredDocuments.length}
              totalCount={documents.length}
            />
          </div>

          {/* Add button — primary row on compact only */}
          {!isPassive && !isWide && (
            <Button
              onClick={() => onNavigateToAddDocument?.()}
              size="sm"
              className="gap-1.5 h-8 shrink-0"
              aria-label="Додати документ"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Додати</span>
            </Button>
          )}
        </div>

        {/* Secondary row: chips + view controls */}
        <div className={cn("flex items-center gap-2 min-w-0", isWide ? "flex-1" : "")}>
          {/* LEFT: chip buttons — scroll on mobile, wrap on tablet, inline on wide */}
          <div
            className={cn(
              "flex items-center gap-2 flex-1 min-w-0",
              isMobile
                ? "overflow-x-auto pr-2 [mask-image:linear-gradient(to_right,black_calc(100%-16px),transparent)] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                : isWide
                  ? "flex-nowrap"
                  : "flex-wrap",
            )}
          >
            {/* Quick "На мені" pill button */}
            {onMeCount > 0 && cabinet.type === "tov" && (
              <Button
                variant={filters.responsibleFilter === "assigned-to-me" ? "default" : "outline"}
                size="sm"
                className="gap-1.5 h-8 shrink-0"
                onClick={() => setFilters(prev => ({ 
                  ...prev, 
                  responsibleFilter: prev.responsibleFilter === "assigned-to-me" ? "all" : "assigned-to-me" 
                }))}
              >
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">На мені</span>
                <Badge 
                  variant={filters.responsibleFilter === "assigned-to-me" ? "secondary" : "outline"} 
                  className="ml-0.5 h-5 px-1.5 text-xs"
                >
                  {onMeCount}
                </Badge>
              </Button>
            )}

            {/* Data Quality Button */}
            <div className="shrink-0">
              <DataQualityButton
                summary={{
                  qualityPercent: summary.qualityPercent,
                  totalCount: summary.totalCount,
                  itemsWithIssues: summary.documentsWithIssues,
                  issuesByType: summary.issuesByType as Record<string, number>,
                }}
                issueTypeConfig={documentIssueTypeConfig}
                onShowAllIssues={handleShowAllIssues}
                onFilterByIssueType={handleFilterByIssueType}
                isMobile={isMobile}
                itemLabel="документів"
              />
            </div>

            {/* Sync Button */}
            <div className="shrink-0">
              <SyncStatusButton
                cabinetType={cabinet.type}
                variant="documents"
                isMobile={isMobile}
                onNavigateToSettings={onNavigateToSettings}
              />
            </div>
          </div>

          {/* RIGHT: view + export — always visible, fixed right */}
          <div className="flex items-center gap-2 shrink-0">
            {/* View mode toggle */}
            <ToggleGroup
              type="single"
              value={viewMode}
              onValueChange={(value) => value && setViewMode(value as "list" | "grouped")}
              className="shrink-0 bg-muted p-0.5 rounded-lg"
            >
              <ToggleGroupItem value="list" aria-label="Список" className="h-7 w-7 p-0 data-[state=on]:bg-background data-[state=on]:shadow-sm">
                <List className="w-3.5 h-3.5" />
              </ToggleGroupItem>
              <ToggleGroupItem value="grouped" aria-label="За днями" className="h-7 w-7 p-0 data-[state=on]:bg-background data-[state=on]:shadow-sm">
                <CalendarDays className="w-3.5 h-3.5" />
              </ToggleGroupItem>
            </ToggleGroup>

            {/* Export */}
            <DropdownMenu>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" className="h-8 w-8 shrink-0">
                      <Download className="w-3.5 h-3.5" />
                    </Button>
                  </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent>Експорт</TooltipContent>
              </Tooltip>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleExport("excel")}>
                  Експорт в Excel
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport("pdf")}>
                  Експорт в PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport("csv")}>
                  Експорт в CSV
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Add button — wide only (full label) */}
            {!isPassive && isWide && (
              <Button
                onClick={() => onNavigateToAddDocument?.()}
                size="sm"
                className="gap-1.5 h-8 shrink-0 inline-flex"
              >
                <Plus className="w-4 h-4" />
                Додати
              </Button>
            )}

            {/* Sign selected button for passive cabinets */}
            {isPassive && selectedIds.size > 0 && (
              <Button onClick={handleMassSign} size="sm" className="gap-1.5 h-8 shrink-0">
                <FileSignature className="w-4 h-4" />
                Підписати ({selectedIds.size})
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Level 2: Active Filters (conditional) */}
      {hasActiveFilters && (
        <div className="flex items-center gap-1.5 py-2 flex-wrap">
          <span className="text-xs text-muted-foreground">
            Знайдено: <span className="font-medium text-foreground">{filteredDocuments.length}</span> з {documents.length}
          </span>
          
          {/* Active type chips */}
          {filters.types.length > 0 && filters.types.length < 6 && (
            filters.types.map(type => (
              <Badge 
                key={type} 
                variant="secondary" 
                className="h-6 px-2 text-xs font-normal gap-1 cursor-pointer hover:bg-secondary/80"
              >
                {type === "invoice" ? "Рахунки" : 
                 type === "act" ? "Акти" : 
                 type === "contract" ? "Договори" : 
                 type === "waybill" ? "Накладні" : 
                 type === "tax-invoice" ? "ПН" : "Чеки"}
                <X 
                  className="w-3 h-3 hover:text-foreground" 
                  onClick={(e) => {
                    e.stopPropagation();
                    setFilters(prev => ({
                      ...prev,
                      types: prev.types.filter(t => t !== type)
                    }));
                  }}
                />
              </Badge>
            ))
          )}
          
          {/* Active status chips */}
          {filters.statuses.length > 0 && filters.statuses.length < 6 && (
            filters.statuses.map(status => (
              <Badge 
                key={status} 
                variant="secondary" 
                className="h-6 px-2 text-xs font-normal gap-1 cursor-pointer hover:bg-secondary/80"
              >
                {status === "draft" ? "Чернетки" : 
                 status === "pending-sign" ? "Очікують" : 
                 status === "signed" ? "Підписані" : 
                 status === "sent" ? "Відправлені" : 
                 status === "paid" ? "Оплачені" : "Архів"}
                <X 
                  className="w-3 h-3 hover:text-foreground" 
                  onClick={(e) => {
                    e.stopPropagation();
                    setFilters(prev => ({
                      ...prev,
                      statuses: prev.statuses.filter(s => s !== status)
                    }));
                  }}
                />
              </Badge>
            ))
          )}
          
          {/* Active quick filter chip */}
          {filters.quickFilter !== "all" && (
            <Badge 
              variant="secondary" 
              className="h-6 px-2 text-xs font-normal gap-1 cursor-pointer hover:bg-secondary/80"
            >
              {filters.quickFilter === "pending-sign" ? "Очікують підпису" :
               filters.quickFilter === "overdue" ? "Протерміновані" :
               filters.quickFilter === "unpaid" ? "Без оплати" :
               filters.quickFilter === "has-issues" ? "⚠ Потребують уваги" : "Архів"}
              <X 
                className="w-3 h-3 hover:text-foreground" 
                onClick={(e) => {
                  e.stopPropagation();
                  setFilters(prev => ({ ...prev, quickFilter: "all" }));
                }}
              />
            </Badge>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="text-muted-foreground hover:text-foreground h-6 px-2 text-xs"
          >
            <X className="w-3 h-3 mr-1" />
            Скинути
          </Button>
        </div>
      )}


      {/* Batch action bar */}
      {isSelectionMode && selectedIds.size > 0 && (
        <div className="flex items-center gap-3 p-3 bg-primary/5 border border-primary/20 rounded-lg animate-in slide-in-from-top-2">
          <Checkbox
            checked={selectedIds.size === filteredDocuments.length}
            onCheckedChange={selectAll}
          />
          <span className="text-sm font-medium">
            Обрано: {selectedIds.size}
          </span>
          <div className="flex-1" />
          <Button size="sm" variant="outline" onClick={handleMassSign} className="gap-1.5">
            <FileSignature className="w-4 h-4" />
            Підписати
          </Button>
          <Button size="sm" variant="outline" onClick={() => handleExport("excel")} className="gap-1.5">
            <Download className="w-4 h-4" />
            Експорт
          </Button>
          <Button size="sm" variant="ghost" onClick={clearSelection}>
            Скасувати
          </Button>
        </div>
      )}


      {/* Document list */}
      {viewMode === "grouped" ? (
        <GroupedDocumentList
          documents={filteredDocuments}
          onDocumentClick={handleDocumentClick}
          sortField={sortField}
          sortDirection={sortDirection}
          onSortChange={handleSortChange}
          selectedIds={selectedIds}
          isSelectionMode={isSelectionMode}
          onToggleSelection={toggleSelection}
          onSummaryFilterClick={handleSummaryFilter}
          allDocuments={documents}
          cabinetType={cabinet?.type}
        />
      ) : (
        <DocumentList
          documents={filteredDocuments}
          onDocumentClick={handleDocumentClick}
          sortField={sortField}
          sortDirection={sortDirection}
          onSortChange={handleSortChange}
          selectedIds={selectedIds}
          isSelectionMode={isSelectionMode}
          onToggleSelection={toggleSelection}
          onSummaryFilterClick={handleSummaryFilter}
          allDocuments={documents}
          cabinetType={cabinet?.type}
        />
      )}

      {/* Document details sheet */}
      <DocumentDetailsSheet
        document={selectedDocument}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        cabinet={cabinet}
        onChatPromptInsert={onChatPromptInsert}
        onStatusChange={handleStatusChange}
        onDocumentUpdate={handleDocumentUpdate}
        onNavigateToIncomeBook={onNavigateToIncomeBook ? () => onNavigateToIncomeBook() : undefined}
        onNavigateToPayments={onNavigateToPayments ? () => onNavigateToPayments() : undefined}
        isReadOnly={cabinet.role === "auditor"}
      />

      {/* Sheets removed - functionality moved to AddDocumentPage */}
    </div>
  );
};
