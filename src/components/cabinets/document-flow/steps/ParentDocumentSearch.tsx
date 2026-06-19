/**
 * ParentDocumentSearch - Step 3: Search and select parent document
 * 
 * Features:
 * - View mode toggle (List/Grid) with localStorage persistence
 * - Keyboard navigation (Arrow keys + Enter + Escape)
 * - Status indicators (critical/warning/ok dots)
 * - Responsive behavior (desktop: list default, mobile: grid default)
 */

import { useState, useMemo, useEffect } from "react";
import { ArrowLeft, Search, FileText, ChevronRight, Calendar, Building2, SlidersHorizontal, List, LayoutGrid, ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import type { Cabinet } from "@/types/cabinet";
import { 
  type Document, 
  type DocumentType,
  type DocumentIssueType,
  documentTypeConfigs,
  getDocumentsForCabinet,
  detectDocumentIssues,
  documentIssueTypeConfig,
} from "@/config/documentFlowConfig";

// ============= Types =============

type ViewMode = "list" | "grid";
type SortField = "date" | "amount" | "contractor";
type SortDirection = "asc" | "desc";

const VIEW_MODE_KEY = "parent-doc-search-view";
const SORT_FIELD_KEY = "parent-doc-search-sort-field";
const SORT_DIR_KEY = "parent-doc-search-sort-dir";

const sortOptions = [
  { value: "date", label: "За датою" },
  { value: "amount", label: "За сумою" },
  { value: "contractor", label: "За контрагентом" },
] as const;

// ============= Status Indicator Component =============

interface StatusDotProps {
  doc: Document;
}

function StatusDot({ doc }: StatusDotProps) {
  const issues = detectDocumentIssues(doc);
  
  // Priority 1 (critical) = red, Priority 2 = amber, else = green
  const hasCritical = issues.some(
    (i: DocumentIssueType) => documentIssueTypeConfig[i]?.priority === 1
  );
  const hasWarning = issues.some(
    (i: DocumentIssueType) => documentIssueTypeConfig[i]?.priority === 2
  );
  
  const getTitle = () => {
    if (issues.length === 0) return "OK";
    return issues.map((i: DocumentIssueType) => documentIssueTypeConfig[i]?.shortLabel).join(", ");
  };
  
  if (hasCritical) {
    return (
      <span 
        className="w-2 h-2 rounded-full bg-destructive shrink-0" 
        title={getTitle()}
        aria-label={getTitle()}
      />
    );
  }
  if (hasWarning) {
    return (
      <span 
        className="w-2 h-2 rounded-full bg-warning shrink-0" 
        title={getTitle()}
        aria-label={getTitle()}
      />
    );
  }
  if (doc.status === "signed" || doc.status === "confirmed" || doc.status === "paid") {
    return (
      <span 
        className="w-2 h-2 rounded-full bg-success shrink-0" 
        title="OK"
        aria-label="Статус OK"
      />
    );
  }
  return <span className="w-2 h-2 shrink-0" />; // Placeholder for alignment
}

// ============= Main Component =============

interface ParentDocumentSearchProps {
  cabinet: Cabinet;
  onSelect: (document: Document) => void;
  onBack: () => void;
  filterByTypes?: DocumentType[];
}

// Document types that can be parents
const parentableTypes: DocumentType[] = [
  "contract",
  "supply-contract",
  "fop-service-contract",
  "rental-agreement",
  "invoice",
  "act",
];

export function ParentDocumentSearch({ 
  cabinet, 
  onSelect, 
  onBack,
  filterByTypes,
}: ParentDocumentSearchProps) {
  const isMobile = useIsMobile();
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<DocumentType | "all">("all");
  const [focusedIndex, setFocusedIndex] = useState(-1);
  
  // View mode with localStorage persistence
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    if (typeof window === "undefined") return "list";
    const stored = localStorage.getItem(VIEW_MODE_KEY) as ViewMode | null;
    return stored || "list";
  });

  // Sort state with localStorage persistence
  const [sortField, setSortField] = useState<SortField>(() => {
    if (typeof window === "undefined") return "date";
    return (localStorage.getItem(SORT_FIELD_KEY) as SortField) || "date";
  });

  const [sortDirection, setSortDirection] = useState<SortDirection>(() => {
    if (typeof window === "undefined") return "desc";
    return (localStorage.getItem(SORT_DIR_KEY) as SortDirection) || "desc";
  });

  // Persist view mode to localStorage
  useEffect(() => {
    localStorage.setItem(VIEW_MODE_KEY, viewMode);
  }, [viewMode]);

  // Persist sort preferences to localStorage
  useEffect(() => {
    localStorage.setItem(SORT_FIELD_KEY, sortField);
  }, [sortField]);

  useEffect(() => {
    localStorage.setItem(SORT_DIR_KEY, sortDirection);
  }, [sortDirection]);

  // Get documents for cabinet
  const allDocuments = useMemo(() => {
    return getDocumentsForCabinet(cabinet);
  }, [cabinet]);

  // Filter documents
  const filteredDocuments = useMemo(() => {
    let docs = allDocuments;

    // Filter by allowed types if specified
    if (filterByTypes && filterByTypes.length > 0) {
      docs = docs.filter(d => filterByTypes.includes(d.type));
    } else {
      // Default: show only parentable types
      docs = docs.filter(d => parentableTypes.includes(d.type));
    }

    // Type filter
    if (typeFilter !== "all") {
      docs = docs.filter(d => d.type === typeFilter);
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      docs = docs.filter(d => 
        d.number.toLowerCase().includes(query) ||
        d.title?.toLowerCase().includes(query) ||
        d.contractor?.name?.toLowerCase().includes(query) ||
        d.subject?.toLowerCase().includes(query)
      );
    }

    // Dynamic sorting
    const sorted = [...docs].sort((a, b) => {
      let comparison = 0;
      
      switch (sortField) {
        case "date":
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case "amount":
          comparison = (a.amount || 0) - (b.amount || 0);
          break;
        case "contractor":
          const nameA = a.contractor?.name || "";
          const nameB = b.contractor?.name || "";
          comparison = nameA.localeCompare(nameB, "uk");
          break;
      }
      
      return sortDirection === "asc" ? comparison : -comparison;
    });

    return sorted;
  }, [allDocuments, filterByTypes, typeFilter, searchQuery, sortField, sortDirection]);

  // Group by type (for grid mode)
  const groupedDocuments = useMemo(() => {
    const groups: Record<DocumentType, Document[]> = {} as Record<DocumentType, Document[]>;
    
    filteredDocuments.forEach(doc => {
      if (!groups[doc.type]) {
        groups[doc.type] = [];
      }
      groups[doc.type].push(doc);
    });

    return groups;
  }, [filteredDocuments]);

  // Reset focus when documents change
  useEffect(() => {
    setFocusedIndex(-1);
  }, [filteredDocuments.length, searchQuery, typeFilter]);

  // Keyboard navigation handler
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (filteredDocuments.length === 0) return;
    
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setFocusedIndex(prev => 
          prev < filteredDocuments.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setFocusedIndex(prev => 
          prev > 0 ? prev - 1 : filteredDocuments.length - 1
        );
        break;
      case "Enter":
        if (focusedIndex >= 0 && filteredDocuments[focusedIndex]) {
          onSelect(filteredDocuments[focusedIndex]);
        }
        break;
      case "Escape":
        setFocusedIndex(-1);
        break;
    }
  };

  // Auto-scroll to focused element
  useEffect(() => {
    if (focusedIndex >= 0) {
      const element = document.getElementById(`doc-item-${focusedIndex}`);
      element?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [focusedIndex]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("uk-UA", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatAmount = (amount?: number) => {
    if (!amount) return null;
    return `${amount.toLocaleString("uk-UA")} ₴`;
  };

  // Available types for filter
  const availableTypes = useMemo(() => {
    const types = new Set<DocumentType>();
    allDocuments.forEach(d => {
      if (!filterByTypes || filterByTypes.includes(d.type)) {
        if (parentableTypes.includes(d.type)) {
          types.add(d.type);
        }
      }
    });
    return Array.from(types);
  }, [allDocuments, filterByTypes]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b bg-background shrink-0">
        <Button variant="ghost" size="icon" onClick={onBack} className="h-8 w-8">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-base font-semibold truncate">Оберіть документ-основу</h1>
          <p className="text-xs text-muted-foreground truncate">
            {filteredDocuments.length} документів
          </p>
        </div>
      </div>

      {/* Search, Filter & View Toggle - All in one row */}
      <div className="p-3 border-b bg-background">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Search */}
          <div className="flex-1 min-w-[140px] max-w-xs relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Пошук за номером..."
              className="pl-9 h-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          {/* Type Filter */}
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <Select 
              value={typeFilter} 
              onValueChange={(v) => setTypeFilter(v as DocumentType | "all")}
            >
              <SelectTrigger className="h-9 text-xs w-[140px]">
                <SelectValue placeholder="Всі типи" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs">Всі типи</SelectItem>
                {availableTypes.map((type) => {
                  const config = documentTypeConfigs[type];
                  return (
                    <SelectItem key={type} value={type} className="text-xs">
                      {config.labelPlural}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
          
          {/* Sort Field */}
          <Select value={sortField} onValueChange={(v) => setSortField(v as SortField)}>
            <SelectTrigger className="h-9 text-xs w-[130px] gap-1">
              <ArrowUpDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map(opt => (
                <SelectItem key={opt.value} value={opt.value} className="text-xs">
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Sort Direction */}
          <Button 
            variant="outline" 
            size="icon" 
            className="h-9 w-9 shrink-0"
            onClick={() => setSortDirection(prev => prev === "asc" ? "desc" : "asc")}
            title={sortDirection === "asc" ? "За зростанням" : "За спаданням"}
          >
            {sortDirection === "asc" ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
          </Button>

          {/* View Mode Toggle - Desktop only */}
          {!isMobile && (
            <ToggleGroup 
              type="single" 
              value={viewMode} 
              onValueChange={(v) => v && setViewMode(v as ViewMode)}
              className="border border-border rounded-lg ml-auto"
            >
              <ToggleGroupItem 
                value="list" 
                className="h-9 w-9 data-[state=on]:bg-muted"
                title="Список"
              >
                <List className="w-4 h-4" />
              </ToggleGroupItem>
              <ToggleGroupItem 
                value="grid" 
                className="h-9 w-9 data-[state=on]:bg-muted"
                title="Плитки"
              >
                <LayoutGrid className="w-4 h-4" />
              </ToggleGroupItem>
            </ToggleGroup>
          )}
        </div>
      </div>

      {/* Document List */}
      <ScrollArea className="flex-1">
        {/* Empty state */}
        {filteredDocuments.length === 0 ? (
          <div className="text-center py-12 px-4">
            <FileText className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
            <p className="font-medium text-muted-foreground">
              {searchQuery ? "Нічого не знайдено" : "Немає документів"}
            </p>
            <p className="text-sm text-muted-foreground/70 mt-1">
              {searchQuery 
                ? "Спробуйте змінити пошуковий запит" 
                : "Спочатку створіть основний документ"
              }
            </p>
          </div>
        ) : viewMode === "list" || isMobile ? (
          /* Compact List Mode */
          <div 
            className="divide-y divide-border"
            onKeyDown={handleKeyDown}
            tabIndex={0}
            role="listbox"
            aria-label="Список документів"
          >
            {filteredDocuments.map((doc, idx) => (
              <button
                key={doc.id}
                id={`doc-item-${idx}`}
                onClick={() => onSelect(doc)}
                className={cn(
                  "w-full px-3 py-2.5 text-left transition-all",
                  "hover:bg-accent/50",
                  "flex items-center gap-3",
                  "min-h-[44px]", // Touch target
                  focusedIndex === idx && "bg-accent ring-2 ring-primary/20"
                )}
                role="option"
                aria-selected={focusedIndex === idx}
              >
                <StatusDot doc={doc} />
                <span className="font-medium text-sm truncate w-28 sm:w-36 shrink-0">
                  {doc.number}
                </span>
                <div className="flex items-center gap-1 text-xs text-muted-foreground truncate flex-1 min-w-0">
                  <Building2 className="w-3 h-3 shrink-0 hidden sm:block" />
                  <span className="truncate">{doc.contractor?.name || "—"}</span>
                </div>
                <span className="text-xs text-muted-foreground w-20 shrink-0 text-right hidden sm:block">
                  {formatDate(doc.date)}
                </span>
                <Badge 
                  variant="outline" 
                  className="text-[10px] shrink-0 w-20 justify-end hidden md:flex"
                >
                  {doc.amount ? formatAmount(doc.amount) : "—"}
                </Badge>
                <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
              </button>
            ))}
          </div>
        ) : (
          /* Grid Mode - Multi-column cards */
          <div className="p-2">
            {Object.entries(groupedDocuments).map(([type, docs]) => {
              const config = documentTypeConfigs[type as DocumentType];
              const TypeIcon = config.icon;

              return (
                <div key={type} className="mb-4">
                  {/* Type header */}
                  <div className="flex items-center gap-2 px-2 py-2">
                    <TypeIcon className="w-4 h-4 text-muted-foreground" />
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {config.labelPlural}
                    </p>
                    <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4 ml-auto">
                      {docs.length}
                    </Badge>
                  </div>

                  {/* Document grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {docs.map((doc) => (
                      <button
                        key={doc.id}
                        onClick={() => onSelect(doc)}
                        className={cn(
                          "p-3 rounded-lg border text-left transition-all",
                          "hover:bg-accent/50 hover:border-primary/30",
                          "min-h-[44px]" // Touch target
                        )}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <StatusDot doc={doc} />
                          <span className="font-medium text-sm truncate">{doc.number}</span>
                          {doc.amount && (
                            <Badge variant="outline" className="text-[10px] shrink-0 ml-auto">
                              {formatAmount(doc.amount)}
                            </Badge>
                          )}
                        </div>
                        
                        {doc.contractor?.name && (
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-0.5">
                            <Building2 className="w-3 h-3 shrink-0" />
                            <span className="truncate">{doc.contractor.name}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3 shrink-0" />
                          <span>{formatDate(doc.date)}</span>
                          {doc.subject && (
                            <>
                              <span className="mx-1">•</span>
                              <span className="truncate">{doc.subject}</span>
                            </>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
