import { useState, useMemo, useCallback, useEffect } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { UnifiedToolbar } from "@/components/ui/UnifiedToolbar";
import UnifiedFilterPopover from "@/components/ui/UnifiedFilterPopover";
import { EmployeesKPISection } from "./EmployeesKPISection";
import { buildEmployeesFilterSections } from "./EmployeesFilters";
import { EmployeesTable } from "./EmployeesTable";
import { EmployeeDetailsView } from "./EmployeeDetailsView";
import { EmployeeFormSheet } from "./EmployeeFormSheet";
import { getEmployeesForCabinet, type Employee } from "@/config/employeesConfig";
import type { Cabinet } from "@/types/cabinet";
import { useHubBreadcrumb } from "@/components/cabinets/shared/hub-breadcrumb/HubBreadcrumbContext";

interface EmployeesPageProps {
  cabinet: Cabinet;
  onChatPromptInsert?: (prompt: string) => void;
}

export const EmployeesPage = ({ cabinet, onChatPromptInsert }: EmployeesPageProps) => {
  const { toast } = useToast();
  
  // Отримуємо працівників для кабінету
  const allEmployees = useMemo(() => getEmployeesForCabinet(cabinet.id), [cabinet.id]);
  
  // Стан фільтрів
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [contractFilter, setContractFilter] = useState("all");
  const [militaryFilter, setMilitaryFilter] = useState("all");
  const [kpiFilter, setKpiFilter] = useState<string | null>(null);
  
  // Стан вибраного працівника
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  // Інтеграція з глобальним breadcrumb (Управління / Працівники / <ПІБ>)
  const { setExtraCrumbs } = useHubBreadcrumb();
  useEffect(() => {
    if (selectedEmployee) {
      setExtraCrumbs([
        {
          id: selectedEmployee.id,
          label: selectedEmployee.fullName,
          onSelect: () => setSelectedEmployee(null),
        },
      ]);
    } else {
      setExtraCrumbs([]);
    }
    return () => setExtraCrumbs([]);
  }, [selectedEmployee, setExtraCrumbs]);

  // Стан форми (додавання/редагування)
  const [isFormSheetOpen, setIsFormSheetOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  // Фільтрація працівників
  const filteredEmployees = useMemo(() => {
    let result = allEmployees;
    
    // KPI фільтр
    if (kpiFilter === "active") {
      result = result.filter(e => e.status === "active" || e.status === "probation");
    } else if (kpiFilter === "recent") {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      result = result.filter(e => {
        const startDate = new Date(e.startDate);
        const endDate = e.endDate ? new Date(e.endDate) : null;
        return startDate >= thirtyDaysAgo || (endDate && endDate >= thirtyDaysAgo);
      });
    }
    
    // Фільтр статусу
    if (statusFilter !== "all") {
      result = result.filter(e => e.status === statusFilter);
    }
    
    // Фільтр типу договору
    if (contractFilter !== "all") {
      result = result.filter(e => e.contractType === contractFilter);
    }
    
    // Фільтр військового обліку
    if (militaryFilter !== "all") {
      result = result.filter(e => e.militaryStatus === militaryFilter);
    }
    
    // Пошук
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(e => 
        e.fullName.toLowerCase().includes(query) ||
        e.position.toLowerCase().includes(query)
      );
    }
    
    return result;
  }, [allEmployees, kpiFilter, statusFilter, contractFilter, militaryFilter, searchQuery]);

  // Хендлери
  const handleKpiFilterChange = useCallback((filter: string | null) => {
    setKpiFilter(filter);
    // Скидаємо інші фільтри при виборі KPI
    if (filter) {
      setStatusFilter("all");
      setContractFilter("all");
      setMilitaryFilter("all");
    }
  }, []);

  const handleMilitaryFilterChange = useCallback((value: string) => {
    setMilitaryFilter(value);
    setKpiFilter(null);
  }, []);

  const handleStatusFilterChange = useCallback((value: string) => {
    setStatusFilter(value);
    setKpiFilter(null);
  }, []);

  const handleContractFilterChange = useCallback((value: string) => {
    setContractFilter(value);
    setKpiFilter(null);
  }, []);

  const handleResetFilters = useCallback(() => {
    setSearchQuery("");
    setStatusFilter("all");
    setContractFilter("all");
    setMilitaryFilter("all");
    setKpiFilter(null);
  }, []);

  const handleOpenEmployee = useCallback((employee: Employee) => {
    setSelectedEmployee(employee);
  }, []);

  const handleAddEmployee = useCallback(() => {
    setEditingEmployee(null);
    setIsFormSheetOpen(true);
  }, []);

  const handleEditEmployee = useCallback((employee: Employee) => {
    setEditingEmployee(employee);
    setIsFormSheetOpen(true);
  }, []);

  const handleFormSheetClose = useCallback((open: boolean) => {
    setIsFormSheetOpen(open);
    if (!open) {
      setEditingEmployee(null);
    }
  }, []);

  const hasActiveFilters = searchQuery.trim() !== "" || 
    statusFilter !== "all" || 
    contractFilter !== "all" || 
    militaryFilter !== "all" ||
    kpiFilter !== null;

  // Якщо вибрано працівника - показуємо детальний вигляд
  if (selectedEmployee) {
    return (
      <EmployeeDetailsView
        employee={selectedEmployee}
        onBack={() => setSelectedEmployee(null)}
        onChatPromptInsert={onChatPromptInsert}
      />
    );
  }

  const isMobile = useIsMobile();

  const filterSections = buildEmployeesFilterSections({
    statusFilter,
    contractFilter,
    militaryFilter,
    onStatusFilterChange: handleStatusFilterChange,
    onContractFilterChange: handleContractFilterChange,
    onMilitaryFilterChange: handleMilitaryFilterChange,
  });

  const activeFiltersCount =
    (statusFilter !== "all" ? 1 : 0) +
    (contractFilter !== "all" ? 1 : 0) +
    (militaryFilter !== "all" ? 1 : 0);

  const resetAllFilters = () => {
    setStatusFilter("all");
    setContractFilter("all");
    setMilitaryFilter("all");
    setKpiFilter(null);
  };

  return (
    <div className="pt-2 space-y-4">
      {/* KPI секція */}
      <EmployeesKPISection
        employees={allEmployees}
        onFilterChange={handleKpiFilterChange}
        activeFilter={kpiFilter}
        contractFilter={contractFilter}
        onContractTypeClick={(type) => {
          setContractFilter(contractFilter === type ? "all" : type);
          setKpiFilter(null);
        }}
      />

      {/* Toolbar: пошук + фільтри + Додати (компактний інлайн-патерн) */}
      <UnifiedToolbar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Пошук за ПІБ або посадою..."
        sticky={false}
        actions={
          <>
            <UnifiedFilterPopover
              sections={filterSections}
              activeFiltersCount={activeFiltersCount}
              onReset={resetAllFilters}
              title="Фільтри працівників"
              isMobile={isMobile}
              filteredCount={filteredEmployees.length}
              totalCount={allEmployees.length}
            />
            <Button
              size="sm"
              className="gap-1.5 h-8 shrink-0"
              onClick={handleAddEmployee}
              aria-label="Додати працівника"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Додати</span>
            </Button>
          </>
        }
      />

      {/* Результати */}
      {hasActiveFilters && (
        <p className="text-sm text-muted-foreground">
          Знайдено: {filteredEmployees.length} з {allEmployees.length} працівників
        </p>
      )}

      {/* Таблиця */}
      <EmployeesTable
        employees={filteredEmployees}
        onOpenEmployee={handleOpenEmployee}
        onEditEmployee={handleEditEmployee}
      />

      {/* Sheet додавання/редагування працівника */}
      <EmployeeFormSheet
        open={isFormSheetOpen}
        onOpenChange={handleFormSheetClose}
        cabinetId={cabinet.id}
        existingEmployeesCount={allEmployees.length}
        employee={editingEmployee}
        onSuccess={() => {
          toast({
            title: editingEmployee ? "Зміни збережено" : "Працівника додано",
            description: "Дані збережено (демо-режим)",
          });
        }}
      />
    </div>
  );
};
