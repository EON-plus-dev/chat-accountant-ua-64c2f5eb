import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { Lock, Info, Sparkles, Calendar } from "lucide-react";
import { SortIndicator } from "@/components/ui/sort-indicator";
import { useSortState, type SortDirection } from "@/hooks/use-sort-state";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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
import { OperationCard, getTypeIcon, extractTypeLabel, getCategoryIcon } from "./OperationCard";
import { RoleHintBanner } from "./RoleHintBanner";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { UnifiedToolbar } from "@/components/ui/UnifiedToolbar";
import { IncomeBookPage } from "./income-book";
import { DocumentFlowPage } from "./document-flow";
import { ReportsPage } from "./reports";
import { EmployeesPage } from "./employees";
import { UnifiedPaymentsPage } from "./payments";
import { TaxesPage } from "./taxes";
import { AuditsPage } from "./audits";
import { InvestmentPortfolioPage } from "./investments";
import { FinMonitoringPage } from "./fin-monitoring/FinMonitoringPage";
import { FinancePage } from "./finance";
import FinanceGroupPage from "./finance/FinanceGroupPage";
import { BookingsPage } from "./bookings/BookingsPage";
import { SalonClientsPage } from "./clients-salon/SalonClientsPage";
import { SalesPage } from "./sales/SalesPage";
import { PurchasesPage } from "./purchases/PurchasesPage";
import { DeliveryPage } from "./delivery/DeliveryPage";
import { WarehousePage } from "./warehouse/WarehousePage";
import { DiaryPage } from "./diary/DiaryPage";
import { DeclarationSourceBreakdown } from "./declarations/DeclarationSourceBreakdown";
import { DeclarationCasesListPage } from "./declarations/DeclarationCasesListPage";
import { DeclarationCasePage } from "./declarations/DeclarationCasePage";
import { TaxCreditDeclarationPage } from "./declarations/TaxCreditDeclarationPage";
import { KikDeclarationPage } from "./declarations/KikDeclarationPage";
import { MonthlyVzDeclarationPage } from "./declarations/MonthlyVzDeclarationPage";
import type { UnifiedDeclaration } from "@/lib/declarations/unifiedDeclarations";
import { IndividualPaymentsPage } from "./payments/IndividualPaymentsPage";
import { SubtabNavigationHint } from "./SubtabNavigationHint";
import { TaxCalendarPage } from "./TaxCalendarPage";
import CrmSection from "./crm/CrmSection";
import TeamTasksSection from "./team-tasks/TeamTasksSection";
import { OrdersAndBookingsPage } from "./orders-bookings/OrdersAndBookingsPage";
import { SubscriptionsPage } from "./subscriptions/SubscriptionsPage";
// Personal Office section pages (reused as content for entry sub-tabs).
import WorkCenterPage from "./work-center/WorkCenterPage";
import OrdersPage from "./orders/OrdersPage";
import DocumentsHubPage from "./documents/DocumentsHubPage";
import SavingsPage from "./savings/SavingsPage";
import NetworkPage from "./network/NetworkPage";
import AiCenterPage from "./ai-center/AiCenterPage";
import { LifeLauncherPage } from "./management/LifeLauncherPage";
import { CabinetManagementHub } from "./management/CabinetManagementHub";
import {
  HubBreadcrumbProvider,
  useHubBreadcrumb,
  type HubCrumb,
} from "./shared/hub-breadcrumb/HubBreadcrumbContext";
import { HubBreadcrumbBar } from "./shared/hub-breadcrumb/HubBreadcrumbBar";
import { InsuranceHubPage } from "./management/hubs/InsuranceHubPage";
import { EducationHubPage } from "./management/hubs/EducationHubPage";
import { CareerHubPage } from "./management/hubs/CareerHubPage";
import { HealthHubPage } from "./management/hubs/HealthHubPage";
import { HomeHubPage } from "./management/hubs/HomeHubPage";
import { PersonalOrdersList } from "./orders/PersonalOrdersList";
import { PersonalDocumentsCategory } from "./documents/PersonalDocumentsCategory";
import { PersonalGoalsList } from "./savings/PersonalGoalsList";
import { FamilyMembersGrid } from "./network/FamilyMembersGrid";
import { PersonalOrgsList, PersonalExpertsList } from "./network/PersonalNetworkLists";
import { PersonalAgentsGrid } from "./ai-center/PersonalAgentsGrid";
import {
  operationsConfigByType,
  getOperationsSubTabs,
  getOperationsSubTabsForPassive, 
  type OperationsSubTab, 
  type DemoRecord,
  type RecordStatus,
} from "@/config/operationsConfig";
import type { Cabinet } from "@/types/cabinet";
import { cn } from "@/lib/utils";
import { DrillStackProvider, DrillStackHost } from "@/components/shared/drill-stack";
import { CartSheet } from "@/components/shared/cart/CartSheet";
import { CheckoutSheet } from "@/components/shared/cart/CheckoutSheet";
import { BookingFlowSheet } from "@/components/shared/booking/BookingFlowSheet";
import { CancellationWizard } from "@/components/shared/subscriptions/CancellationWizard";
import { ChangePlanSheet } from "@/components/shared/subscriptions/ChangePlanSheet";

import { hasCapability } from "@/config/cabinetCapabilities";

import { DemoRoleViewProvider } from "@/contexts/DemoRoleViewContext";
import { buildUrlWithTrail } from "@/hooks/useBackTrail";
import { peekPendingAction, subscribeMasterAction } from "./bookings/masterActionBus";

// Опції статусів для фільтра
const statusFilterOptions: { value: string; label: string }[] = [
  { value: "all", label: "Усі" },
  { value: "draft", label: "Чернетка" },
  { value: "signed", label: "Підписано" },
  { value: "sent", label: "Відправлено" },
  { value: "paid", label: "Оплачено" },
  { value: "pending", label: "Очікує" },
  { value: "overdue", label: "Прострочено" },
  { value: "approved", label: "Погоджено" },
  { value: "ready", label: "Готово" },
  { value: "submitted", label: "Подано" },
  { value: "ok", label: "Норма" },
  { value: "warning", label: "Увага" },
  { value: "error", label: "Проблема" },
];

// Хлібні крихти для розділу «Управління» (працює лише всередині HubBreadcrumbProvider)
function OperationsBreadcrumb({
  activeSubtab,
  currentLabel,
  onNavigate,
}: {
  activeSubtab?: string;
  currentLabel?: string;
  onNavigate: (target: string) => void;
}) {
  const { extraCrumbs } = useHubBreadcrumb();
  // Скидаємо локальний детальний стан сторінки (selectedEmployee/selectedAudit/...)
  // перед переходом по будь-якій крихті вище за extraCrumbs.
  const resetExtras = () => {
    for (const c of extraCrumbs) c.onSelect?.();
  };
  const trail: HubCrumb[] = [
    { id: "__launcher__", label: "Управління", onSelect: () => { resetExtras(); onNavigate("__launcher__"); } },
    ...(activeSubtab && activeSubtab !== "__launcher__" && currentLabel
      ? [
          {
            id: activeSubtab,
            label: currentLabel,
            onSelect: () => { resetExtras(); onNavigate(activeSubtab); },
          },
        ]
      : []),
    ...extraCrumbs,
  ];
  return <HubBreadcrumbBar crumbs={trail} />;
}


interface CabinetOperationsPageProps {
  cabinet: Cabinet;
  onHomeClick: () => void;
  activeSubTab?: string;
  onSubTabChange?: (subTab: string) => void;
  onNavigateToAnalytics?: () => void;
  onNavigateToSettings?: () => void;
  onNavigateToReferences?: () => void;
  onNavigateToCreateTemplate?: () => void;
  onNavigateToAddDocument?: () => void;
  onNavigateToDocumentDetail?: (documentId: string) => void;
  onScroll?: (isScrolled: boolean) => void;
  /** Deep-link target: highlight a specific report and auto-open it */
  initialHighlightReportId?: string | null;
}

// Статус бейдж з централізованими стилями
import { getStatusClassName, getAmountColor } from "@/config/semanticStyles";

const StatusBadge = ({ status, label }: { status?: RecordStatus; label?: string }) => {
  if (!status || !label) return null;
  
  return (
    <Badge 
      variant="secondary" 
      size="sm"
      className={cn("font-medium", getStatusClassName(status))}
    >
      {label}
    </Badge>
  );
};

// Extract year from a DemoRecord (checks 'year' column, then 'date'/'deadline' in dd.MM.YYYY format)
const extractYearFromRecord = (record: DemoRecord): string | null => {
  if (record.columns.year) return String(record.columns.year);
  for (const key of ["date", "deadline", "lastActivity", "lastMove", "lastRun"]) {
    const val = String(record.columns[key] || "");
    const match = val.match(/\d{2}\.\d{2}\.(\d{4})/);
    if (match) return match[1];
  }
  return null;
};

// Демо-таблиця з сортуванням
interface DemoTableProps {
  subtab: OperationsSubTab;
  onRowClick: (record: DemoRecord) => void;
  searchQuery: string;
  statusFilter: string;
  yearFilter: string;
  onResultsChange?: (shown: number, total: number) => void;
  isMobile?: boolean;
}

const DemoTable = ({ subtab, onRowClick, searchQuery, statusFilter, yearFilter, onResultsChange, isMobile }: DemoTableProps) => {
  const { sort, handleSort } = useSortState<string>("");

  // Фільтрація та сортування записів
  const processedRecords = useMemo(() => {
    if (!subtab.demoRecords) return [];
    
    let records = subtab.demoRecords.filter((record) => {
      if (statusFilter !== "all" && record.status !== statusFilter) {
        return false;
      }
      if (yearFilter !== "all") {
        const recordYear = extractYearFromRecord(record);
        if (recordYear && recordYear !== yearFilter) return false;
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = Object.values(record.columns).some((value) =>
          String(value).toLowerCase().includes(query)
        );
        if (!matchesSearch) return false;
      }
      return true;
    });

    // Сортування
    if (sort.key) {
      records = [...records].sort((a, b) => {
        let aVal: string | number;
        let bVal: string | number;

        if (sort.key === "status") {
          aVal = a.statusLabel || "";
          bVal = b.statusLabel || "";
        } else {
          aVal = a.columns[sort.key] ?? "";
          bVal = b.columns[sort.key] ?? "";
        }

        const aNum = parseFloat(String(aVal).replace(/[^\d.-]/g, ""));
        const bNum = parseFloat(String(bVal).replace(/[^\d.-]/g, ""));
        
        if (!isNaN(aNum) && !isNaN(bNum)) {
          return sort.direction === "asc" ? aNum - bNum : bNum - aNum;
        }

        const comparison = String(aVal).localeCompare(String(bVal), "uk");
        return sort.direction === "asc" ? comparison : -comparison;
      });
    }

    return records;
  }, [subtab.demoRecords, searchQuery, statusFilter, yearFilter, sort]);

  // Повідомляємо про результати
  useEffect(() => {
    if (onResultsChange && subtab.demoRecords) {
      onResultsChange(processedRecords.length, subtab.demoRecords.length);
    }
  }, [processedRecords.length, subtab.demoRecords, onResultsChange]);

  if (!subtab.tableColumns || !subtab.demoRecords) return null;

  if (processedRecords.length === 0) {
    return (
      <div className="border rounded-lg">
        <TableEmptyState
          title={searchQuery || statusFilter !== "all" 
            ? "Записів за вашим запитом не знайдено" 
            : "Немає записів"}
          description={searchQuery || statusFilter !== "all"
            ? "Спробуйте змінити параметри пошуку"
            : undefined}
        />
      </div>
    );
  }

  // Mobile: render cards
  if (isMobile) {
    return (
      <div className="space-y-2">
        {processedRecords.map((record) => (
          <OperationCard
            key={record.id}
            record={record}
            subtab={subtab}
            onClick={() => onRowClick(record)}
          />
        ))}
      </div>
    );
  }

  // Desktop: render table with FinTech optimizations
  return (
    <div className="border border-border/70 rounded-lg overflow-hidden">
      <Table>
        <TableHeader sticky>
          <TableRow className="hover:bg-muted/80">
            {subtab.tableColumns.map((col) => (
              <TableHead 
                key={col.key} 
                compact
                sortable
                style={{ width: col.width }}
                onSort={() => handleSort(col.key)}
                numeric={col.align === "right"}
                sorted={sort.key === col.key}
                sortDirection={sort.key === col.key ? sort.direction : null}
                className={cn(col.align === "center" && "text-center")}
              >
                <span className="inline-flex items-center">
                  {col.label}
                  <SortIndicator active={sort.key === col.key} direction={sort.direction} />
                </span>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {processedRecords.map((record: DemoRecord) => (
            <TableRow
              key={record.id} 
              className="cursor-pointer"
              onClick={() => onRowClick(record)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onRowClick(record);
                }
              }}
            >
              {subtab.tableColumns!.map((col) => (
                <TableCell 
                  key={col.key}
                  compact
                  numeric={col.align === "right"}
                  className={cn(
                    "text-sm",
                    col.align === "center" && "text-center"
                  )}
                >
                  {col.key === "status" ? (
                    <StatusBadge status={record.status} label={record.statusLabel} />
                  ) : col.key === "type" && subtab.id === "property" ? (() => {
                    const TypeIcon = getTypeIcon(record.columns[col.key]);
                    return (
                      <span className="inline-flex items-center gap-2">
                        <span className="shrink-0 rounded-md bg-primary/10 p-1.5">
                          <TypeIcon className="h-3.5 w-3.5 text-primary" />
                        </span>
                        <span>{extractTypeLabel(record.columns[col.key])}</span>
                      </span>
                    );
                  })() : col.key === "event" && subtab.id === "property" && record.columns[col.key] ? (
                    <Badge variant="outline" className="pointer-events-none">{record.columns[col.key]}</Badge>
                  ) : col.key === "area" && subtab.id === "property" ? (
                    <span className="text-muted-foreground tabular-nums">{record.columns[col.key]}</span>
                  ) : col.key === "category" && subtab.id === "tax-discount" ? (() => {
                    const CatIcon = getCategoryIcon(record.columns[col.key]);
                    return (
                      <span className="inline-flex items-center gap-2">
                        <span className="shrink-0 rounded-md bg-primary/10 p-1.5">
                          <CatIcon className="h-3.5 w-3.5 text-primary" />
                        </span>
                        <span>{extractTypeLabel(record.columns[col.key])}</span>
                      </span>
                    );
                  })() : col.key === "limit" && subtab.id === "tax-discount" ? (
                    <span className="text-muted-foreground tabular-nums">{record.columns[col.key]}</span>
                  ) : col.key === "refund" && subtab.id === "tax-discount" ? (
                    <span className="font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">{record.columns[col.key]}</span>
                  ) : col.key === "description" && (subtab.id === "property" || subtab.id === "tax-discount") ? (
                    <span className="text-muted-foreground">{record.columns[col.key]}</span>
                  ) : col.key === "amount" && subtab.id === "tax-discount" ? (
                    <span className="font-medium tabular-nums">{record.columns[col.key]}</span>
                  ) : (
                    <span className={cn(
                      col.key === "amount" && "font-medium",
                      getAmountColor(String(record.columns[col.key])),
                      String(record.columns[col.key]).includes("⚠️") && "text-amber-600 dark:text-amber-400"
                    )}>
                      {record.columns[col.key]}
                    </span>
                  )}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
        {subtab.id === "property" && (() => {
          const totalObjects = processedRecords.length;
          const parseCurrency = (s: string | number) => {
            const n = parseFloat(String(s).replace(/[^\d]/g, ""));
            return isNaN(n) ? 0 : n;
          };
          const totalTax = processedRecords.reduce((sum, r) => sum + parseCurrency(r.columns.taxYear || ""), 0);
          const paidTax = processedRecords.filter(r => r.status === "paid").reduce((sum, r) => sum + parseCurrency(r.columns.taxYear || ""), 0);
          const pendingTax = processedRecords.filter(r => r.status === "pending").reduce((sum, r) => sum + parseCurrency(r.columns.taxYear || ""), 0);
          const formatUAH = (n: number) => n > 0 ? `${new Intl.NumberFormat("uk-UA").format(n)} ₴` : "—";
          return (
            <TableFooter sticky>
              <TableRow className="hover:bg-transparent">
                <TableCell compact colSpan={2} className="text-sm font-medium">
                  Усього об'єктів: {totalObjects}
                </TableCell>
                <TableCell compact className="text-sm" />
                <TableCell compact className="text-sm text-muted-foreground">Податок:</TableCell>
                <TableCell compact numeric className="text-sm font-semibold tabular-nums">
                  {formatUAH(totalTax)}
                </TableCell>
                <TableCell compact className="text-sm">
                  {paidTax > 0 && <span className="text-emerald-600 dark:text-emerald-400 tabular-nums mr-2">✓ {formatUAH(paidTax)}</span>}
                  {pendingTax > 0 && <span className="text-amber-600 dark:text-amber-400 tabular-nums">⏳ {formatUAH(pendingTax)}</span>}
                </TableCell>
              </TableRow>
            </TableFooter>
          );
        })()}
        {subtab.id === "tax-discount" && (() => {
          const totalCategories = processedRecords.length;
          const parseCurrency = (s: string | number) => {
            const n = parseFloat(String(s).replace(/[^\d]/g, ""));
            return isNaN(n) ? 0 : n;
          };
          const totalExpenses = processedRecords.reduce((sum, r) => sum + parseCurrency(r.columns.amount || ""), 0);
          const totalRefund = processedRecords.reduce((sum, r) => sum + parseCurrency(r.columns.refund || ""), 0);
          const okCount = processedRecords.filter(r => r.status === "ok").length;
          const actionCount = processedRecords.filter(r => r.status === "warning" || r.status === "pending").length;
          const formatUAH = (n: number) => n > 0 ? `${new Intl.NumberFormat("uk-UA").format(n)} ₴` : "—";
          return (
            <TableFooter sticky>
              <TableRow className="hover:bg-transparent">
                <TableCell compact colSpan={2} className="text-sm font-medium">
                  Категорій: {totalCategories}
                </TableCell>
                <TableCell compact className="text-sm text-muted-foreground">Витрати:</TableCell>
                <TableCell compact numeric className="text-sm font-semibold tabular-nums">
                  {formatUAH(totalExpenses)}
                </TableCell>
                <TableCell compact className="text-sm text-muted-foreground">Повернення:</TableCell>
                <TableCell compact numeric className="text-sm font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
                  {formatUAH(totalRefund)}
                </TableCell>
                <TableCell compact className="text-sm">
                  {okCount > 0 && <span className="text-emerald-600 dark:text-emerald-400 mr-2">✓ {okCount}</span>}
                  {actionCount > 0 && <span className="text-amber-600 dark:text-amber-400">⚠️ {actionCount}</span>}
                </TableCell>
              </TableRow>
            </TableFooter>
          );
        })()}
      </Table>
    </div>
  );
};

// Import RecordEditorSheet after DemoTable is defined
import RecordEditorSheet from "./RecordEditorSheet";
import { PropertyTaxDetailSheet } from "./PropertyTaxDetailSheet";
import { TaxDiscountDetailSheet } from "./TaxDiscountDetailSheet";
import { AddExpenseSheet, ExpenseDetailSheet } from "./expenses";
import { TaxDiscountWizard } from "./tax-discount/TaxDiscountWizard";
import { BankDiscountScanner } from "./tax-discount/BankDiscountScanner";

const CabinetOperationsPage = ({ cabinet, onHomeClick, activeSubTab, onSubTabChange, onNavigateToAnalytics, onNavigateToSettings, onNavigateToReferences, onNavigateToCreateTemplate, onNavigateToAddDocument, onNavigateToDocumentDetail, onScroll, initialHighlightReportId }: CabinetOperationsPageProps) => {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  // Check if passive cabinet - restrict operations
  const isPassiveCabinet = cabinet.accessMode === "passive";
  
  // Фільтруємо підвкладки за умовою показу (з обмеженнями для пасивних кабінетів)
  const allSubtabs = isPassiveCabinet
    ? getOperationsSubTabsForPassive(cabinet.type)
    : getOperationsSubTabs(cabinet);
  const subtabs = allSubtabs;
  
  // Використовуємо зовнішній state якщо передано, інакше внутрішній
  const [internalSubtab, setInternalSubtab] = useState(subtabs[0]?.id || "");
  const activeSubtab = activeSubTab ?? internalSubtab;
  const handleSubtabChange = onSubTabChange ?? setInternalSubtab;
  const [editorOpen, setEditorOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<DemoRecord | null>(null);
  const [selectedSubtab, setSelectedSubtab] = useState<OperationsSubTab | null>(null);
  const [addExpenseOpen, setAddExpenseOpen] = useState(false);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);
  
  // Highlight report ID for navigation from Payments (or deep-link from URL)
  const [highlightReportId, setHighlightReportId] = useState<string | null>(initialHighlightReportId ?? null);
  const [activeCaseId, setActiveCaseId] = useState<string | null>(null);
  const [activeDeclaration, setActiveDeclaration] = useState<UnifiedDeclaration | null>(null);

  // Sync external highlight (deep-link) when prop changes
  useEffect(() => {
    if (initialHighlightReportId) {
      setHighlightReportId(initialHighlightReportId);
    }
  }, [initialHighlightReportId]);

  // Listen for master-driven actions (CTA "Переглянути в календарі" / "Створити запис").
  // Switch to bookings subtab so BookingsPage can consume the pending action.
  useEffect(() => {
    const apply = () => {
      const action = peekPendingAction();
      if (action && action.cabinetId === cabinet.id && activeSubtab !== "bookings") {
        handleSubtabChange("bookings");
      }
    };
    return subscribeMasterAction(apply);
  }, [cabinet.id, activeSubtab, handleSubtabChange]);

  // Legacy redirect: попередні leaf-id фізособи → одна з 7 груп + inner-таб.
  // Зберігає старі URL (?subtab=investments) робочими, навіть якщо в пігулках
  // тепер лише групи (work-center / orders / documents / finance / savings /
  // network / ai-center).
  useEffect(() => {
    if (cabinet.type !== "individual") return;
    const map: Record<string, [string, string]> = {
      tasks: ["work-center", "tasks"],
      lists: ["work-center", "lists"],
      approvals: ["work-center", "approvals"],
      diary: ["work-center", "tasks"],
      purchases: ["orders", "purchases"],
      services: ["orders", "services"],
      "bookings-personal": ["orders", "bookings"],
      subscriptions: ["orders", "subscriptions"],
      "orders-bookings": ["orders", "my-orders"],
      "personal-docs": ["documents", "personal"],
      diia: ["documents", "diia"],
      contracts: ["documents", "contracts"],
      insurance: ["documents", "insurance"],
      medical: ["documents", "medical"],
      archive: ["documents", "archive"],
      payments: ["finance", "payments"],
      "fin-monitoring": ["finance", "fin-monitoring"],
      declarations: ["finance", "declarations"],
      "tax-discount": ["finance", "tax-discount"],
      "goals-savings": ["savings", "goals"],
      reserve: ["savings", "reserve"],
      pension: ["savings", "pension"],
      "kids-fund": ["savings", "children"],
      investments: ["savings", "investments"],
      property: ["savings", "property"],
      family: ["network", "family"],
      orgs: ["network", "organizations"],
      experts: ["network", "experts"],
      accesses: ["network", "delegations"],
      places: ["network", "partner-catalogs"],
      agents: ["ai-center", "agents"],
      workflows: ["ai-center", "workflows"],
      rules: ["ai-center", "rules"],
      automations: ["ai-center", "auto-actions"],
    };
    const target = map[activeSubtab];
    if (target) {
      const [group, inner] = target;
      const sp = new URLSearchParams(window.location.search);
      sp.set("inner", inner);
      window.history.replaceState(null, "", `${window.location.pathname}?${sp.toString()}`);
      handleSubtabChange(group);
    }
  }, [cabinet.type, activeSubtab, handleSubtabChange]);

  // Пошук і фільтрація (окремо для кожної підвкладки)
  const [searchQueries, setSearchQueries] = useState<Record<string, string>>({});
  const [statusFilters, setStatusFilters] = useState<Record<string, string>>({});
  const [yearFilters, setYearFilters] = useState<Record<string, string>>({});
  const [resultsCounts, setResultsCounts] = useState<Record<string, { shown: number; total: number }>>({});

  const handleSearchChange = (subtabId: string, value: string) => {
    setSearchQueries((prev) => ({ ...prev, [subtabId]: value }));
  };

  const handleStatusFilterChange = (subtabId: string, value: string) => {
    setStatusFilters((prev) => ({ ...prev, [subtabId]: value }));
  };

  const handleYearFilterChange = (subtabId: string, value: string) => {
    setYearFilters((prev) => ({ ...prev, [subtabId]: value }));
  };

  const handleResultsChange = (subtabId: string, shown: number, total: number) => {
    setResultsCounts((prev) => ({ ...prev, [subtabId]: { shown, total } }));
  };

  const handleCtaClick = (buttonId: string, label: string) => {
    if (buttonId === "go-to-registry" && (onNavigateToReferences || onNavigateToSettings)) {
      (onNavigateToReferences || onNavigateToSettings)!();
      return;
    }
    // Open AddExpenseSheet for expense-related CTA buttons
    if (buttonId === "add-expense" || buttonId === "add-record") {
      setAddExpenseOpen(true);
      return;
    }
    toast({
      title: "Демо-режим",
      description: `«${label}» буде доступна після запуску`,
    });
  };

  const handleRowClick = (record: DemoRecord, subtab: OperationsSubTab) => {
    setSelectedRecord(record);
    setSelectedSubtab(subtab);
    setEditorOpen(true);
  };

  // Navigate to Reports with optional report highlighting
  const handleNavigateToReports = (reportId?: string) => {
    if (reportId) {
      setHighlightReportId(reportId);
    }
    handleSubtabChange("reports");
  };

  const handleClearHighlight = () => {
    setHighlightReportId(null);
  };

  // Глибока навігація в Книгу доходів з опційним періодом — пробрасуємо через URL ?year/?quarter
  const [searchParams, setSearchParams] = useSearchParams();
  const handleNavigateToIncomeBook = useCallback(
    (period?: { year: number; quarter?: number }) => {
      if (period?.year) {
        const next = new URLSearchParams(window.location.search);
        next.set("year", String(period.year));
        if (period.quarter) next.set("quarter", String(period.quarter));
        else next.delete("quarter");
        setSearchParams(next, { replace: true });
      }
      handleSubtabChange("income-book");
    },
    [handleSubtabChange, setSearchParams],
  );

  // Картковий хаб «Управління»:
  //  - individual → LifeLauncherPage (5 груп / 14 тайлів сфер життя)
  //  - business / fop → CabinetManagementHub (групи з operationsConfig + tile UI)
  // Рендериться, якщо subtab порожній або === "__launcher__".
  const isLauncher = !activeSubtab || activeSubtab === "__launcher__";

  if (isLauncher) {
    return (
      <DrillStackProvider>
        <div className="flex flex-col h-full">
          <div className="flex-1 pb-4 pt-2">
            {cabinet.type === "individual" ? (
              <LifeLauncherPage
                cabinet={cabinet}
                onOpenModule={(target, inner) => {
                  if (inner) {
                    const sp = new URLSearchParams(window.location.search);
                    sp.set("inner", inner);
                    window.history.replaceState(null, "", `${window.location.pathname}?${sp.toString()}`);
                  }
                  handleSubtabChange(target);
                }}
              />
            ) : (
              <CabinetManagementHub
                cabinet={cabinet}
                onOpenModule={(target) => handleSubtabChange(target)}
              />
            )}
          </div>
        </div>
      </DrillStackProvider>
    );
  }

  if (subtabs.length === 0) {
    return (
      <div className="p-4 md:p-6">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">
              Управління для цього типу кабінету не налаштоване.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentSubtab = subtabs.find(s => s.id === activeSubtab) || subtabs[0];
  const CurrentIcon = currentSubtab?.icon;
  const isAuditor = cabinet.role === "auditor";
  const roleHint = currentSubtab?.roleHints?.[cabinet.role];

  return (
    <DrillStackProvider>
    <HubBreadcrumbProvider resetKey={activeSubtab}>
    <div className="flex flex-col h-full">
      {/* Контент */}
      <div className="flex-1 pb-4 pt-2 space-y-5">
        {activeSubtab !== "__launcher__" && (
          <OperationsBreadcrumb
            activeSubtab={activeSubtab}
            currentLabel={currentSubtab?.label}
            onNavigate={handleSubtabChange}
          />
        )}
        {cabinet.type === "individual" && activeSubtab === "work-center" ? (
          <div className="px-4 md:px-6 min-w-0">
            <WorkCenterPage
              cabinet={cabinet}
              defaultInner={searchParams.get("inner") ?? undefined}
              onNavigateToLauncher={() => handleSubtabChange("__launcher__")}
            />
          </div>
        ) : cabinet.type === "individual" && activeSubtab === "orders" ? (
          <div className="min-w-0">
            <OrdersPage
              cabinet={cabinet}
              defaultInner={searchParams.get("inner") ?? undefined}
              onNavigateToOperations={(s) => s && handleSubtabChange(s)}
              onNavigateToLauncher={() => handleSubtabChange("__launcher__")}
            />
          </div>



        ) : cabinet.type === "individual" && activeSubtab === "documents" ? (
          <div className="px-4 md:px-6 min-w-0">
            <DocumentsHubPage
              cabinet={cabinet}
              defaultInner={searchParams.get("inner") ?? undefined}
              onNavigateToOperations={(s) => s && handleSubtabChange(s)}
            />
          </div>
        ) : cabinet.type === "individual" && activeSubtab === "finance" ? (
          <div className="px-4 md:px-6 min-w-0">
            <FinanceGroupPage
              cabinet={cabinet}
              defaultInner={searchParams.get("inner") ?? undefined}
              onNavigateToInner={(inner) => {
                const sp = new URLSearchParams(window.location.search);
                sp.set("inner", inner);
                window.history.replaceState(null, "", `${window.location.pathname}?${sp.toString()}`);
              }}
              onNavigateToDocumentDetail={onNavigateToDocumentDetail}
            />
          </div>
        ) : cabinet.type === "individual" && activeSubtab === "savings" ? (
          <div className="px-4 md:px-6 min-w-0">
            <SavingsPage
              cabinet={cabinet}
              defaultInner={searchParams.get("inner") ?? undefined}
              onNavigateToOperations={(s) => s && handleSubtabChange(s)}
              onGoToRegistry={onNavigateToReferences || onNavigateToSettings}
            />
          </div>
        ) : cabinet.type === "individual" && activeSubtab === "network" ? (
          <div className="px-4 md:px-6 min-w-0">
            <NetworkPage
              cabinet={cabinet}
              defaultInner={searchParams.get("inner") ?? undefined}
              onNavigateToSettings={(s) => s && handleSubtabChange(s)}
            />
          </div>
        ) : cabinet.type === "individual" && activeSubtab === "ai-center" ? (
          <div className="px-4 md:px-6 min-w-0">
            <AiCenterPage
              cabinet={cabinet}
              defaultInner={searchParams.get("inner") ?? undefined}
              onNavigateToSettings={(s) => s && handleSubtabChange(s)}
            />
          </div>
        ) : cabinet.type === "individual" && activeSubtab === "insurance" ? (
          <div className="px-4 md:px-6 min-w-0"><InsuranceHubPage cabinet={cabinet} /></div>
        ) : cabinet.type === "individual" && activeSubtab === "education" ? (
          <div className="px-4 md:px-6 min-w-0"><EducationHubPage cabinet={cabinet} /></div>
        ) : cabinet.type === "individual" && activeSubtab === "career" ? (
          <div className="px-4 md:px-6 min-w-0"><CareerHubPage cabinet={cabinet} /></div>
        ) : cabinet.type === "individual" && activeSubtab === "health" ? (
          <div className="px-4 md:px-6 min-w-0"><HealthHubPage cabinet={cabinet} /></div>
        ) : cabinet.type === "individual" && activeSubtab === "home" ? (
          <div className="px-4 md:px-6 min-w-0"><HomeHubPage cabinet={cabinet} /></div>
        ) :
        /* Умовний рендеринг: Книга доходів для ФОП */
        activeSubtab === "diary" ? (
          <div className="px-4 md:px-6 min-w-0">
            <DiaryPage cabinet={cabinet} />
          </div>
        ) : activeSubtab === "bookings" ? (
          <div className="px-4 md:px-6 min-w-0">
            <BookingsPage cabinet={cabinet} />
          </div>
        ) : activeSubtab === "clients" ? (
          <div className="px-4 md:px-6 min-w-0">
            <SalonClientsPage cabinet={cabinet} />
          </div>
        ) : activeSubtab === "sales" ? (
          <div className="px-4 md:px-6 min-w-0">
            <SalesPage cabinet={cabinet} />
          </div>
        ) : activeSubtab === "purchases" ? (
          <div className="px-4 md:px-6 min-w-0">
            <PurchasesPage cabinet={cabinet} />
          </div>
        ) : activeSubtab === "delivery" ? (
          <div className="px-4 md:px-6 min-w-0">
            <DeliveryPage cabinet={cabinet} />
          </div>
        ) : activeSubtab === "finance" ? (
          <div className="px-4 md:px-6 min-w-0">
            <FinancePage
              cabinet={cabinet}
              onNavigateToPayments={(params) => {
                handleSubtabChange("payments");
                if (params?.account) {
                  const sp = new URLSearchParams(window.location.search);
                  sp.set("account", params.account);
                  window.history.replaceState(null, "", `${window.location.pathname}?${sp.toString()}`);
                }
              }}
            />
          </div>
        ) : activeSubtab === "income-book" && cabinet.type === "fop" ? (
          <div className="px-4 md:px-6 min-w-0">
            <IncomeBookPage cabinet={cabinet} onNavigateToAnalytics={onNavigateToAnalytics} onNavigateToSettings={onNavigateToSettings} onScroll={onScroll} />
          </div>
        ) : activeSubtab === "employees" && cabinet.type === "fop" && cabinet.hasEmployees ? (
          <div className="px-4 md:px-6 min-w-0">
            <EmployeesPage cabinet={cabinet} />
          </div>
        ) : activeSubtab === "taxes" && cabinet.type === "fop" ? (
          <div className="px-4 md:px-6 min-w-0">
            <TaxesPage
              cabinet={cabinet}
              onNavigateToReport={(reportId) => handleNavigateToReports(reportId)}
              onNavigateToIncomeBook={handleNavigateToIncomeBook}
              onNavigateToCalendar={() => handleSubtabChange("calendar")}
            />
          </div>
        ) : activeSubtab === "payments" && (cabinet.type === "fop" || isPassiveCabinet) ? (
          <div className="px-4 md:px-6 min-w-0 flex-1 min-h-0 flex flex-col">
            <UnifiedPaymentsPage
              cabinet={cabinet} 
              onNavigateToDocumentDetail={onNavigateToDocumentDetail}
              // onNavigateToIncomeBook / onNavigateToContractor — навмисно НЕ передаємо.
              // UniversalPaymentDetailSheet відкриває drill-sheet (Stacked Sheet pattern),
              // зберігаючи контекст. Перехід у повний розділ — кнопкою всередині drill-view.
              onNavigateToEmployee={(employeeId) => {
                handleSubtabChange("employees");
                // Employee selection is handled within EmployeesPage
              }}
              onNavigateToReport={(reportId) => handleNavigateToReports(reportId)}
              onChatPromptInsert={undefined}
            />
          </div>
        ) : activeSubtab === "reports" && cabinet.type === "fop" ? (
          <div className="px-4 md:px-6 min-w-0">
            <ReportsPage
              cabinet={cabinet} 
              onNavigateToSettings={onNavigateToSettings} 
              highlightReportId={highlightReportId}
              onHighlightClear={handleClearHighlight}
              onNavigateToEmployee={(employeeId) => {
                handleSubtabChange("employees");
              }}
              onNavigateToPayment={(paymentId) => {
                handleSubtabChange("payments");
              }}
            />
          </div>
        ) : activeSubtab === "fin-monitoring" && cabinet.type === "individual" ? (
          <div className="px-4 md:px-6 min-w-0 space-y-4">
            <FinMonitoringPage cabinet={cabinet} onNavigateToDocumentDetail={onNavigateToDocumentDetail} onNavigateToTab={handleSubtabChange} />
            <SubtabNavigationHint nextLabel="Декларації" description="Річна звітність" onNavigate={() => handleSubtabChange("declarations")} />
          </div>
        ) : activeSubtab === "declarations" && cabinet.type === "individual" ? (
          <DemoRoleViewProvider>
            <div className="px-4 md:px-6 min-w-0 space-y-4">
              {activeCaseId ? (
                <DeclarationCasePage
                  caseId={activeCaseId}
                  onBack={() => setActiveCaseId(null)}
                />
              ) : activeDeclaration ? (
                activeDeclaration.kind === "tax_credit" ? (
                  <TaxCreditDeclarationPage
                    cabinetId={cabinet.id}
                    reportId={activeDeclaration.refId}
                    onBack={() => setActiveDeclaration(null)}
                  />
                ) : activeDeclaration.kind === "kik" ? (
                  <KikDeclarationPage
                    cabinetId={cabinet.id}
                    reportId={activeDeclaration.refId}
                    onBack={() => setActiveDeclaration(null)}
                  />
                ) : activeDeclaration.kind === "vz_monthly" ? (
                  <MonthlyVzDeclarationPage
                    cabinetId={cabinet.id}
                    reportId={activeDeclaration.refId}
                    onBack={() => setActiveDeclaration(null)}
                  />
                ) : null
              ) : (
                <>
                  <DeclarationCasesListPage
                    cabinetId={cabinet.id}
                    onOpenCase={(id) => setActiveCaseId(id)}
                    onOpenDeclaration={(decl) => {
                      if (decl.source === "case") {
                        setActiveCaseId(decl.refId);
                      } else {
                        setActiveDeclaration(decl);
                      }
                    }}
                  />
                  <DeclarationSourceBreakdown
                    cabinetId={cabinet.id}
                    onNavigateToFinMonitoring={() => handleSubtabChange("fin-monitoring")}
                  />
                  <SubtabNavigationHint nextLabel="Платежі" description="Сплата податкових зобов'язань" onNavigate={() => handleSubtabChange("payments")} />
                </>
              )}
            </div>
          </DemoRoleViewProvider>
        ) : activeSubtab === "subscriptions" && cabinet.type === "individual" ? (
          <div className="px-4 md:px-6 min-w-0">
            <SubscriptionsPage />
          </div>
        ) : activeSubtab === "orders-bookings" && cabinet.type === "individual" ? (
          <div className="px-4 md:px-6 min-w-0">
            <OrdersAndBookingsPage />
          </div>
        ) : activeSubtab === "payments" && cabinet.type === "individual" ? (
          <div className="px-4 md:px-6 min-w-0">
            <IndividualPaymentsPage cabinet={cabinet} onNavigateToFinMonitoring={handleSubtabChange} />
          </div>
        ) : activeSubtab === "investments" && cabinet.type === "individual" ? (
          <div className="px-4 md:px-6 min-w-0 space-y-4">
            <InvestmentPortfolioPage
              cabinet={cabinet}
              onNavigateToDeclarations={() => handleSubtabChange("declarations")}
            />
            <SubtabNavigationHint nextLabel="Податкова знижка" description="Витрати за ст. 166 ПКУ" onNavigate={() => handleSubtabChange("tax-discount")} />
          </div>
        ) : activeSubtab === "calendar" ? (
          <div className="px-4 md:px-6 min-w-0">
            <TaxCalendarPage cabinet={cabinet} />
          </div>
        ) : activeSubtab === "crm" ? (
          <CrmSection />
        ) : activeSubtab === "team-tasks" ? (
          <TeamTasksSection />
        ) : activeSubtab === "audits" ? (
          <div className="px-4 md:px-6 min-w-0">
            <AuditsPage
              cabinet={cabinet} 
              onNavigateToDocuments={() => handleSubtabChange("documents")}
              onNavigateToReports={() => handleSubtabChange("reports")}
            />
          </div>
        ) : activeSubtab === "warehouse" ? (
          <div className="px-4 md:px-6 min-w-0">
            <WarehousePage cabinet={cabinet} />
          </div>
        ) : activeSubtab === "documents" ? (
          <div className="px-4 md:px-6 min-w-0 space-y-4">
            <DocumentFlowPage
              cabinet={cabinet} 
              onNavigateToSettings={onNavigateToSettings} 
              onNavigateToIncomeBook={() => handleSubtabChange("income-book")}
              onNavigateToPayments={() => handleSubtabChange("payments")}
              onNavigateToCreateTemplate={onNavigateToCreateTemplate}
              onNavigateToAddDocument={onNavigateToAddDocument}
              onNavigateToDocumentDetail={onNavigateToDocumentDetail}
              onScroll={onScroll} 
            />
            {cabinet.type === "individual" && (
              <SubtabNavigationHint nextLabel="Майно" description="Податкові події з нерухомістю" onNavigate={() => handleSubtabChange("property")} />
            )}
          </div>
        ) : (
          <div className="px-4 md:px-6 min-w-0 space-y-5">
            {/* Year filter: compute available years */}
            {(() => {
              const years = new Set<string>();
              currentSubtab.demoRecords?.forEach(r => {
                const y = extractYearFromRecord(r);
                if (y) years.add(y);
              });
              const sortedYears = Array.from(years).sort((a, b) => b.localeCompare(a));
              const showYearFilter = sortedYears.length > 1;
              const currentYearFilter = yearFilters[activeSubtab] || "all";

              return (
                <>
                  {/* Unified Toolbar */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <UnifiedToolbar
                        searchValue={searchQueries[activeSubtab] || ""}
                        onSearchChange={(value) => handleSearchChange(activeSubtab, value)}
                        filterOptions={statusFilterOptions}
                        filterValue={statusFilters[activeSubtab] || "all"}
                        onFilterChange={(value) => handleStatusFilterChange(activeSubtab, value)}
                        filterPlaceholder="Статус"
                        resultsCount={resultsCounts[activeSubtab]}
                        sticky={false}
                        className="px-0"
                      />
                    </div>
                    {showYearFilter && (
                      <div className="flex items-center gap-1.5 shrink-0">
                        <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                        <select
                          value={currentYearFilter}
                          onChange={(e) => handleYearFilterChange(activeSubtab, e.target.value)}
                          className="h-8 rounded-md border border-input bg-background px-2 py-1 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                          aria-label="Фільтр по року"
                        >
                          <option value="all">Усі роки</option>
                          {sortedYears.map(y => (
                            <option key={y} value={y}>{y}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                </>
              );
            })()}

            {/* Role Hint Banner - показується тільки при першому відвідуванні */}
            {roleHint && (
              <RoleHintBanner hint={roleHint} subtabId={activeSubtab} />
            )}

            {/* Notice якщо є */}
            {currentSubtab.notice && (
              <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg text-sm">
                <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <span className="text-blue-800 dark:text-blue-300">{currentSubtab.notice}</span>
              </div>
            )}

            {/* Tax Discount Discovery Banner */}
            {activeSubtab === "tax-discount" && cabinet.type === "individual" && (
              <div className="rounded-xl bg-gradient-to-r from-primary/5 to-emerald-500/5 border border-primary/20 p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <Sparkles className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <div className="space-y-1">
                    <h3 className="font-semibold text-sm">Не знаєте, на що маєте право?</h3>
                    <p className="text-xs text-muted-foreground">
                      Пройдіть перевірку за 2 хвилини або відскануйте банківську виписку — ми знайдемо витрати автоматично.
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="default" onClick={() => setWizardOpen(true)}>
                    <Sparkles className="h-3.5 w-3.5 mr-1" /> Перевірити мої права
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setScannerOpen(true)}>
                    <Sparkles className="h-3.5 w-3.5 mr-1" /> Сканувати виписку
                  </Button>
                </div>
              </div>
            )}

            {/* Таблиця */}
            <DemoTable 
              subtab={currentSubtab} 
              onRowClick={(record) => handleRowClick(record, currentSubtab)} 
              searchQuery={searchQueries[activeSubtab] || ""}
              statusFilter={statusFilters[activeSubtab] || "all"}
              yearFilter={yearFilters[activeSubtab] || "all"}
              onResultsChange={(shown, total) => handleResultsChange(activeSubtab, shown, total)}
              isMobile={isMobile}
            />

            {/* CTA кнопки */}
            {currentSubtab.ctaButtons && currentSubtab.ctaButtons.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {currentSubtab.ctaButtons.map((btn) => {
                  const BtnIcon = btn.icon;
                  return (
                    <Button
                      key={btn.id}
                      variant={btn.variant || "default"}
                      size="sm"
                      onClick={() => handleCtaClick(btn.id, btn.label)}
                      disabled={isAuditor && !btn.aiAction}
                      className={cn(
                        "gap-1.5",
                        btn.aiAction && "bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white border-0"
                      )}
                    >
                      {btn.aiAction ? (
                        <Sparkles className="w-3.5 h-3.5" />
                      ) : BtnIcon ? (
                        <BtnIcon className="w-3.5 h-3.5" />
                      ) : null}
                      {btn.label}
                    </Button>
                  );
                })}
              </div>
            )}

            {/* Navigation hint for generic individual tabs */}
            {cabinet.type === "individual" && activeSubtab === "property" && (
              <SubtabNavigationHint nextLabel="Інвестиції" description="Цінні папери та FIFO" onNavigate={() => handleSubtabChange("investments")} />
            )}
            {cabinet.type === "individual" && activeSubtab === "tax-discount" && (
              <SubtabNavigationHint nextLabel="Фін. моніторинг" description="Зведений реєстр усіх операцій" onNavigate={() => handleSubtabChange("fin-monitoring")} />
            )}
          </div>
        )}
      </div>

      {/* Редактор */}
      {selectedSubtab?.id === "property" ? (
        <PropertyTaxDetailSheet
          open={editorOpen}
          onOpenChange={setEditorOpen}
          record={selectedRecord}
          onGoToRegistry={onNavigateToReferences || onNavigateToSettings}
        />
      ) : selectedSubtab?.id === "tax-discount" ? (
        <TaxDiscountDetailSheet
          open={editorOpen}
          onOpenChange={setEditorOpen}
          record={selectedRecord}
          subtab={selectedSubtab}
        />
      ) : selectedSubtab?.id === "income-book" ? (
        <ExpenseDetailSheet
          open={editorOpen}
          onOpenChange={setEditorOpen}
          record={selectedRecord}
          subtab={selectedSubtab}
        />
      ) : (
        <RecordEditorSheet
          open={editorOpen}
          onOpenChange={setEditorOpen}
          record={selectedRecord}
          subtab={selectedSubtab}
          isReadOnly={isAuditor}
        />
      )}

      {/* Додати витрату */}
      <AddExpenseSheet open={addExpenseOpen} onOpenChange={setAddExpenseOpen} cabinetId={cabinet.id} />

      {/* Tax Discount Wizard & Scanner */}
      <TaxDiscountWizard open={wizardOpen} onOpenChange={setWizardOpen} />
      <BankDiscountScanner open={scannerOpen} onOpenChange={setScannerOpen} />

      {/* Drill-stack host: контекстні drill-sheets для платіж → книга / контрагент / документ.
          Кнопки «Відкрити повний розділ» закривають стек і виконують справжню навігацію. */}
      <DrillStackHost
        onOpenIncomeBook={(recordId) => {
          // Перед перемиканням subtab — додаємо ?highlight=<recordId>,
          // щоб IncomeBookPage одразу відкрив потрібний запис.
          const sp = new URLSearchParams(window.location.search);
          sp.set("highlight", recordId);
          window.history.replaceState(null, "", `${window.location.pathname}?${sp.toString()}`);
          handleSubtabChange("income-book");
        }}
        onOpenContractorProfile={() => onNavigateToSettings?.()}
        onOpenDocument={(id) => onNavigateToDocumentDetail?.(id)}
        onOpenAudit={(id) => {
          // Escape з drill-sheet: переходимо на повну сторінку перевірки
          // з BackTrailBar, що повертає в поточне місце.
          const url = buildUrlWithTrail(`/audits/${id}`, {
            label: "Попередній екран",
            url: window.location.pathname + window.location.search,
          });
          window.location.assign(url);
        }}
        onOpenBooking={() => {
          // Master з повним Щоденником → /diary; salon-owner → /bookings.
          const target = hasCapability(cabinet, "bookings_personal:operate")
            ? "diary"
            : "bookings";
          handleSubtabChange(target);
        }}

        onOpenMasterEdit={() => onNavigateToSettings?.()}
        onOpenClient={() => handleSubtabChange("clients")}
        onOpenOrder={(_, direction) => handleSubtabChange(direction === "sale" ? "sales" : "purchases")}
        onOpenPersonalOrders={() => {
          const sp = new URLSearchParams(window.location.search);
          sp.set("inner", "my-orders");
          window.history.replaceState(null, "", `${window.location.pathname}?${sp.toString()}`);
          handleSubtabChange("orders");
        }}
        onOpenSubscriptions={() => {
          const sp = new URLSearchParams(window.location.search);
          sp.set("inner", "subscriptions");
          window.history.replaceState(null, "", `${window.location.pathname}?${sp.toString()}`);
          handleSubtabChange("orders");
        }}
        onOpenLoyalty={() => {
          const sp = new URLSearchParams(window.location.search);
          sp.set("inner", "loyalty");
          window.history.replaceState(null, "", `${window.location.pathname}?${sp.toString()}`);
          handleSubtabChange("orders");
        }}
        onOpenOffersTarget={(target) => {
          const innerMap: Record<typeof target, string> = {
            shop: "purchases",
            services: "services",
            bookings: "bookings",
            external: "offers",
          };
          const sp = new URLSearchParams(window.location.search);
          sp.set("inner", innerMap[target]);
          window.history.replaceState(null, "", `${window.location.pathname}?${sp.toString()}`);
          handleSubtabChange("orders");
        }}
        cabinetId={cabinet.id}
      />

      {/* Personal Orders P1: cart / checkout / booking flow / subscription wizards */}
      <CartSheet />
      <CheckoutSheet cabinetId={cabinet.id} />
      <BookingFlowSheet />
      <CancellationWizard />
      <ChangePlanSheet />
    </div>
    </HubBreadcrumbProvider>
    </DrillStackProvider>

  );
};

export default CabinetOperationsPage;