import { useState, useMemo, useCallback, useEffect } from "react";
import { useHubBreadcrumb } from "@/components/cabinets/shared/hub-breadcrumb/HubBreadcrumbContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UnifiedToolbar } from "@/components/ui/UnifiedToolbar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SortableHeader } from "@/components/ui/sortable-header";
import { 
  ClipboardCheck, 
  FolderOpen, 
  Sparkles,
  ChevronRight,
  Inbox,
  FileSearch,
  HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSortState } from "@/hooks/use-sort-state";
import type { Cabinet } from "@/types/cabinet";
import { 
  demoAudits, 
  TaxAudit, 
  auditStatusConfig,
  getAuditTypeLabel,
  getActiveAuditsCount,
  getResponseRequiredCount,
  getOverdueRequestsCount,
} from "@/config/taxAuditsConfig";
import { 
  demoEdoIncomingDocuments,
  getNewEdoDocumentsCount,
  getHighPriorityEdoDocuments,
} from "@/config/edoIntegrationConfig";
import { AuditsKPISection } from "./AuditsKPISection";
import { AuditDetailsView } from "./AuditDetailsView";
import { AuditsAttentionInbox } from "./AuditsAttentionInbox";
import { EdoInboxSection } from "./EdoInboxSection";
import { useNavigate } from "react-router-dom";
import { format, parseISO, differenceInDays } from "date-fns";
import { uk } from "date-fns/locale";
import emptyEvents from "@/assets/empty-events.png";

interface AuditsPageProps {
  cabinet: Cabinet;
  onNavigateToDocuments?: () => void;
  onNavigateToReports?: () => void;
}

type AuditMode = "audits" | "edo-inbox";
type SortKey = "type" | "period" | "status" | "deadline" | "requests" | "documents";
type TypeFilter = "all" | TaxAudit["type"];

const statusFilterOptions = [
  { value: "all", label: "Усі" },
  { value: "active", label: "Активні" },
  { value: "response-required", label: "Очікує відповіді" },
  { value: "completed", label: "Завершені" },
  { value: "appealed", label: "Оскаржені" },
];

const typeFilterOptions: { value: TypeFilter; label: string }[] = [
  { value: "all", label: "Усі типи" },
  { value: "documentary-scheduled", label: "Документальна планова" },
  { value: "documentary-unscheduled", label: "Документальна позапланова" },
  { value: "cameral", label: "Камеральна" },
  { value: "factual", label: "Фактична" },
];

// Custom empty state for audits
const AuditsEmptyState = ({ hasFilters, onPrepare }: { hasFilters: boolean; onPrepare: () => void }) => (
  <div className="flex flex-col items-center justify-center min-h-[300px] px-6 py-12 text-center animate-in fade-in duration-500">
    <div className="w-32 h-32 mb-6 relative opacity-80">
      <img 
        src={emptyEvents} 
        alt="Немає перевірок"
        className="w-full h-full object-contain"
      />
    </div>
    
    <h3 className="text-lg font-semibold text-foreground mb-2">
      {hasFilters ? "Перевірок за фільтром не знайдено" : "Ви ще не отримували перевірок"}
    </h3>
    
    <p className="text-muted-foreground max-w-md mb-6 text-sm leading-relaxed">
      {hasFilters 
        ? "Спробуйте змінити параметри пошуку або фільтри"
        : "Тут відображатимуться повідомлення про податкові перевірки від ДПС. Рекомендуємо завчасно підготувати документи."}
    </p>
    
    {!hasFilters && (
      <div className="flex flex-col sm:flex-row gap-2">
        <Button onClick={onPrepare} className="gap-1.5">
          <FolderOpen className="w-4 h-4" />
          Як підготуватись до перевірки?
        </Button>
      </div>
    )}
  </div>
);

export const AuditsPage = ({ cabinet, onNavigateToDocuments, onNavigateToReports }: AuditsPageProps) => {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [activeMode, setActiveMode] = useState<AuditMode>("audits");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [selectedAudit, setSelectedAudit] = useState<TaxAudit | null>(null);
  const [autoAnalysisRequestId, setAutoAnalysisRequestId] = useState<string | undefined>(undefined);
  const [autoResponseRequestId, setAutoResponseRequestId] = useState<string | undefined>(undefined);

  const { setExtraCrumbs } = useHubBreadcrumb();
  useEffect(() => {
    if (selectedAudit) {
      setExtraCrumbs([
        { id: `audit-${selectedAudit.id}`, label: `${getAuditTypeLabel(selectedAudit.type)} · ${selectedAudit.orderNumber}`, onSelect: () => setSelectedAudit(null) },
      ]);
    } else {
      setExtraCrumbs([]);
    }
    return () => setExtraCrumbs([]);
  }, [selectedAudit, setExtraCrumbs]);
  
  // Sorting state
  const { sort, handleSort } = useSortState<SortKey>("deadline", "asc");

  const handleOpenAuditById = useCallback((auditId: string) => {
    const audit = demoAudits.find((a) => a.id === auditId);
    if (audit) setSelectedAudit(audit);
  }, []);

  const handleOpenResponseFor = useCallback((auditId: string, requestId: string) => {
    const audit = demoAudits.find((a) => a.id === auditId);
    if (!audit) return;
    setAutoResponseRequestId(requestId);
    setAutoAnalysisRequestId(undefined);
    setSelectedAudit(audit);
  }, []);

  const handleOpenAppealById = useCallback(
    (auditId: string) => {
      navigate(`/appeals/${auditId}`);
    },
    [navigate],
  );

  const handleShowAllOverdue = useCallback(() => {
    setActiveMode("audits");
    setStatusFilter("response-required");
  }, []);

  // Metrics for SegmentControl
  const auditsMetrics = useMemo(() => {
    const active = getActiveAuditsCount(demoAudits);
    const pending = getResponseRequiredCount(demoAudits);
    const overdue = getOverdueRequestsCount(demoAudits);
    return { active, pending, overdue };
  }, []);

  const edoMetrics = useMemo(() => {
    const newCount = getNewEdoDocumentsCount(demoEdoIncomingDocuments);
    const urgent = getHighPriorityEdoDocuments(demoEdoIncomingDocuments).length;
    return { newCount, urgent };
  }, []);

  // Sorting function
  const getSortValue = useCallback((audit: TaxAudit, key: SortKey): string | number => {
    switch (key) {
      case "type":
        return getAuditTypeLabel(audit.type);
      case "period":
        return audit.period;
      case "status":
        return audit.status;
      case "deadline":
        return audit.responseDeadline ? new Date(audit.responseDeadline).getTime() : Infinity;
      case "requests":
        return audit.requests.filter(r => r.status === "pending").length;
      case "documents":
        return audit.documents.length;
      default:
        return 0;
    }
  }, []);

  // Filtering and sorting
  const filteredAndSortedAudits = useMemo(() => {
    let result = demoAudits.filter((audit) => {
      // Type filter
      if (typeFilter !== "all" && audit.type !== typeFilter) return false;

      // Status filter
      if (statusFilter === "active") {
        if (["completed", "appealed"].includes(audit.status)) return false;
      } else if (statusFilter === "response-required") {
        const hasPendingOrOverdueRequest = audit.requests.some(
          (r) => r.status === "pending" || r.status === "overdue",
        );
        if (audit.status !== "response-required" && !hasPendingOrOverdueRequest) {
          return false;
        }
      } else if (statusFilter !== "all" && audit.status !== statusFilter) {
        return false;
      }
      
      // Search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const typeLabel = getAuditTypeLabel(audit.type).toLowerCase();
        const matches = 
          typeLabel.includes(query) ||
          audit.period.toLowerCase().includes(query) ||
          audit.orderNumber.toLowerCase().includes(query) ||
          audit.taxOffice.toLowerCase().includes(query);
        if (!matches) return false;
      }
      
      return true;
    });

    // Sort
    result.sort((a, b) => {
      const valueA = getSortValue(a, sort.key);
      const valueB = getSortValue(b, sort.key);
      
      if (typeof valueA === "string" && typeof valueB === "string") {
        return sort.direction === "asc" 
          ? valueA.localeCompare(valueB, "uk")
          : valueB.localeCompare(valueA, "uk");
      }
      
      return sort.direction === "asc" 
        ? (valueA as number) - (valueB as number)
        : (valueB as number) - (valueA as number);
    });

    return result;
  }, [searchQuery, statusFilter, typeFilter, sort, getSortValue]);

  const hasFilters = searchQuery.trim() !== "" || statusFilter !== "all" || typeFilter !== "all";

  const handleKpiFilterChange = (filter: string) => {
    setStatusFilter(filter);
  };

  const handlePrepareDocuments = () => {
    toast({
      title: "Демо-режим",
      description: "Функція підготовки документів буде доступна після запуску",
    });
  };

  const handleAiCheck = () => {
    // Знайти найближчий за дедлайном pending/overdue запит
    const today = Date.now();
    const candidates = demoAudits.flatMap((a) =>
      a.requests
        .filter((r) => r.status === "pending" || r.status === "overdue")
        .map((r) => ({
          audit: a,
          request: r,
          ts: r.deadline ? new Date(r.deadline).getTime() : Number.POSITIVE_INFINITY,
        })),
    );
    if (candidates.length === 0) {
      toast({
        title: "Немає активних запитів",
        description: "Усі запити від ДПС опрацьовано — гаряча черга порожня.",
      });
      return;
    }
    candidates.sort((a, b) => a.ts - b.ts);
    const hottest = candidates[0];
    setAutoAnalysisRequestId(hottest.request.id);
    setSelectedAudit(hottest.audit);
  };

  const handleModeChange = (mode: AuditMode) => {
    setActiveMode(mode);
    setSearchQuery("");
    setStatusFilter("all");
    setTypeFilter("all");
  };

  // Details view
  if (selectedAudit) {
    return (
      <AuditDetailsView
        audit={selectedAudit}
        onBack={() => {
          setSelectedAudit(null);
          setAutoAnalysisRequestId(undefined);
          setAutoResponseRequestId(undefined);
        }}
        onNavigateToDocuments={onNavigateToDocuments}
        initialOpenAnalysisRequestId={autoAnalysisRequestId}
        initialOpenResponseRequestId={autoResponseRequestId}
      />
    );
  }

  return (
    <div className="space-y-4 min-w-0 overflow-x-hidden">
      {/* Simple SegmentControl */}
      <div className="flex justify-center">
        <div className="inline-flex items-center gap-1 p-1 bg-muted/50 border border-border/50 rounded-full max-w-full overflow-x-auto">
          {/* Audits Tab */}
          <button
            onClick={() => handleModeChange("audits")}
            className={cn(
              "relative flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200",
              activeMode === "audits"
                ? "bg-card text-foreground shadow-sm border border-border/50"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {/*
              Бейдж pending: ховаємо на активному табі (щоб не дублювати з KPI).
              Бейдж overdue (червоний): показуємо ЗАВЖДИ — це критичні дедлайни,
              користувач має їх бачити навіть з відкритого табу «Перевірки».
            */}
            {auditsMetrics.overdue > 0 ? (
              <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[16px] h-[16px] text-[10px] font-medium rounded-full bg-red-500 text-white animate-pulse">
                {auditsMetrics.overdue}
              </span>
            ) : auditsMetrics.pending > 0 && activeMode !== "audits" ? (
              <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[16px] h-[16px] text-[10px] font-medium rounded-full bg-amber-500 text-white">
                {auditsMetrics.pending}
              </span>
            ) : null}
            <ClipboardCheck className={cn("h-4 w-4", activeMode === "audits" && "text-primary")} />
            <span>Перевірки</span>
          </button>

          {/* DPS Inbox Tab */}
          <button
            onClick={() => handleModeChange("edo-inbox")}
            className={cn(
              "relative flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200",
              activeMode === "edo-inbox"
                ? "bg-card text-foreground shadow-sm border border-border/50"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {edoMetrics.urgent > 0 && activeMode !== "edo-inbox" && (
              <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[16px] h-[16px] text-[10px] font-medium rounded-full bg-red-500 text-white animate-pulse">
                {edoMetrics.urgent}
              </span>
            )}
            <Inbox className={cn("h-4 w-4", activeMode === "edo-inbox" && "text-primary")} />
            <span>Листи від ДПС</span>
          </button>
        </div>
      </div>

      {/* Content based on active mode */}
      {activeMode === "audits" ? (
        <>
          {/* Attention Inbox — критичні дедлайни поверх усього */}
          <AuditsAttentionInbox
            audits={demoAudits}
            onOpenAudit={handleOpenAuditById}
            onOpenAppeal={handleOpenAppealById}
            onOpenAllOverdue={handleShowAllOverdue}
            onOpenResponse={handleOpenResponseFor}
          />

          {/* KPI Section */}
          <AuditsKPISection 
            audits={demoAudits} 
            onFilterChange={handleKpiFilterChange}
            activeFilter={statusFilter}
          />

          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
            <div className="flex-1 min-w-0">
              <UnifiedToolbar
                searchValue={searchQuery}
                onSearchChange={setSearchQuery}
                filterOptions={statusFilterOptions}
                filterValue={statusFilter}
                onFilterChange={setStatusFilter}
                filterPlaceholder="Статус"
                resultsCount={{ shown: filteredAndSortedAudits.length, total: demoAudits.length }}
                sticky={false}
                className="px-0"
              />
            </div>
            <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as TypeFilter)}>
              <SelectTrigger className="h-9 w-full sm:w-[220px] shrink-0">
                <SelectValue placeholder="Тип перевірки" />
              </SelectTrigger>
              <SelectContent>
                {typeFilterOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Table / Cards / Empty State */}
          {filteredAndSortedAudits.length === 0 ? (
            <Card>
              <AuditsEmptyState hasFilters={hasFilters} onPrepare={handlePrepareDocuments} />
            </Card>
          ) : isMobile ? (
            // Mobile cards
            <div className="space-y-2">
              {filteredAndSortedAudits.map((audit) => {
                const statusConfig = auditStatusConfig[audit.status];
                const StatusIcon = statusConfig.icon;
                const pendingRequests = audit.requests.filter(r => r.status === "pending").length;
                const overdueRequests = audit.requests.filter(r => r.status === "overdue").length;
                
                return (
                  <Card 
                    key={audit.id}
                    className="cursor-pointer hover:border-primary/30 transition-colors"
                    onClick={() => setSelectedAudit(audit)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <ClipboardCheck className="w-4 h-4 text-muted-foreground shrink-0" />
                            <span className="font-medium text-sm truncate">
                              {getAuditTypeLabel(audit.type)}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {audit.period} • {audit.orderNumber}
                          </p>
                        </div>
                        <Badge variant="outline" className={cn("text-xs gap-1 shrink-0", statusConfig.color)}>
                          <StatusIcon className="w-3 h-3" />
                          {statusConfig.label}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between mt-3 pt-3 border-t">
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          {audit.responseDeadline && audit.status === "response-required" && (
                            <span className="text-amber-600 dark:text-amber-400 font-medium">
                              Дедлайн: {format(parseISO(audit.responseDeadline), "dd.MM", { locale: uk })}
                            </span>
                          )}
                          {overdueRequests > 0 && (
                            <span className="text-red-600 dark:text-red-400 font-medium">
                              {overdueRequests} прострочено!
                            </span>
                          )}
                          {pendingRequests > 0 && (
                            <span>{pendingRequests} запит{pendingRequests > 1 ? "и" : ""}</span>
                          )}
                          <span>{audit.documents.length} док.</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            // Desktop table with sorting
            <div className="border border-border/70 rounded-lg overflow-hidden">
              <Table>
                <TableHeader sticky>
                  <TableRow className="hover:bg-muted/80">
                    <SortableHeader
                      label="Тип"
                      field="type"
                      currentField={sort.key}
                      direction={sort.direction}
                      onSort={() => handleSort("type")}
                      style={{ width: "22%" }}
                    />
                    <SortableHeader
                      label="Період"
                      field="period"
                      currentField={sort.key}
                      direction={sort.direction}
                      onSort={() => handleSort("period")}
                      style={{ width: "12%" }}
                    />
                    <SortableHeader
                      label="Статус"
                      field="status"
                      currentField={sort.key}
                      direction={sort.direction}
                      onSort={() => handleSort("status")}
                      style={{ width: "16%" }}
                    />
                    <SortableHeader
                      label="Дедлайн"
                      field="deadline"
                      currentField={sort.key}
                      direction={sort.direction}
                      onSort={() => handleSort("deadline")}
                      style={{ width: "14%" }}
                    />
                    <SortableHeader
                      label="Запити"
                      field="requests"
                      currentField={sort.key}
                      direction={sort.direction}
                      onSort={() => handleSort("requests")}
                      numeric
                      style={{ width: "10%" }}
                    />
                    <SortableHeader
                      label="Документи"
                      field="documents"
                      currentField={sort.key}
                      direction={sort.direction}
                      onSort={() => handleSort("documents")}
                      numeric
                      style={{ width: "12%" }}
                    />
                    <TableHead compact style={{ width: "8%" }}></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedAudits.map((audit) => {
                    const statusConfig = auditStatusConfig[audit.status];
                    const StatusIcon = statusConfig.icon;
                    const pendingRequests = audit.requests.filter(r => r.status === "pending").length;
                    const overdueRequests = audit.requests.filter(r => r.status === "overdue").length;
                    const hasDeadline = audit.responseDeadline && audit.status === "response-required";
                    const daysUntil = hasDeadline ? differenceInDays(parseISO(audit.responseDeadline!), new Date()) : null;
                    
                    return (
                      <TableRow 
                        key={audit.id}
                        className="cursor-pointer"
                        onClick={() => setSelectedAudit(audit)}
                      >
                        <TableCell compact className="font-medium">
                          {getAuditTypeLabel(audit.type)}
                        </TableCell>
                        <TableCell compact>{audit.period}</TableCell>
                        <TableCell compact>
                          <Badge variant="outline" className={cn("text-xs gap-1", statusConfig.color)}>
                            <StatusIcon className="w-3 h-3" />
                            {statusConfig.label}
                          </Badge>
                        </TableCell>
                        <TableCell compact>
                          {hasDeadline ? (
                            <span className={cn(
                              "font-medium",
                              daysUntil !== null && daysUntil <= 3 && "text-red-600 dark:text-red-400",
                              daysUntil !== null && daysUntil > 3 && daysUntil <= 7 && "text-amber-600 dark:text-amber-400"
                            )}>
                              {format(parseISO(audit.responseDeadline!), "dd.MM.yyyy", { locale: uk })}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell compact numeric>
                          {overdueRequests > 0 ? (
                            <Badge variant="secondary" className="bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400">
                              {overdueRequests} !
                            </Badge>
                          ) : pendingRequests > 0 ? (
                            <Badge variant="secondary" className="bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400">
                              {pendingRequests}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">{audit.requests.length || "—"}</span>
                          )}
                        </TableCell>
                        <TableCell compact numeric>
                          {audit.documents.length || "—"}
                        </TableCell>
                        <TableCell compact>
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}

          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-2 pt-2">
            <Button size="sm" className="gap-1.5" onClick={handlePrepareDocuments}>
              <FolderOpen className="w-3.5 h-3.5" />
              Підготувати документи
            </Button>
            <Button 
              size="sm" 
              variant="secondary"
              className="gap-1.5 bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white border-0"
              onClick={handleAiCheck}
            >
              <Sparkles className="w-3.5 h-3.5" />
              AI-аналіз гарячого запиту
            </Button>
          </div>
        </>
      ) : (
        /* EDO Inbox Content */
        <EdoInboxSection 
          existingAudits={demoAudits}
          variant="embedded"
        />
      )}
    </div>
  );
};
