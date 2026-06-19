import { useState, useMemo } from "react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Plus, Download, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import type { Cabinet } from "@/types/cabinet";
import { getContractorsForCabinet, type Contractor, type ContractorRole, type ContractorStatus } from "@/config/settingsConfig";
import { UnifiedToolbar } from "@/components/ui/UnifiedToolbar";
import { exportContractorsToCSV } from "@/lib/contractorExport";
import UnifiedFilterPopover, { FilterSection } from "@/components/ui/UnifiedFilterPopover";
import { useIsMobile } from "@/hooks/use-mobile";
import { ContractorsTable } from "./ContractorsTable";
import { ContractorFormSheet } from "./ContractorFormSheet";

interface ContractorsListSectionProps {
  cabinet: Cabinet;
  onNavigateToContractor?: (contractorId: string) => void;
  onAddContractor?: () => void;
  embedded?: boolean;
}

interface Filters {
  type: Contractor["type"] | "all";
  role: ContractorRole | "all";
  status: ContractorStatus | "all";
  balance: "all" | "debtors" | "creditors" | "zero";
}

export const ContractorsListSection = ({
  cabinet,
  onNavigateToContractor,
  onAddContractor,
  embedded = false,
}: ContractorsListSectionProps) => {
  const isMobile = useIsMobile();
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<Filters>({
    type: "all",
    role: "all",
    status: "all",
    balance: "all",
  });
  const [formSheetOpen, setFormSheetOpen] = useState(false);

  const allContractors = getContractorsForCabinet(cabinet);

  // Filter contractors
  const filteredContractors = useMemo(() => {
    const q = searchQuery.toLowerCase();
    let result = allContractors.filter(c => 
      c.name.toLowerCase().includes(q) ||
      c.code.includes(searchQuery) ||
      c.email?.toLowerCase().includes(q) ||
      c.phone?.includes(searchQuery) ||
      c.iban?.toLowerCase().includes(q)
    );

    if (filters.type !== "all") {
      result = result.filter(c => c.type === filters.type);
    }

    if (filters.role !== "all") {
      result = result.filter(c => c.role === filters.role);
    }

    if (filters.status !== "all") {
      result = result.filter(c => c.status === filters.status);
    }

    if (filters.balance !== "all") {
      result = result.filter(c => {
        const balance = c.balance || 0;
        switch (filters.balance) {
          case "debtors": return balance > 0;
          case "creditors": return balance < 0;
          case "zero": return balance === 0;
          default: return true;
        }
      });
    }

    return result;
  }, [allContractors, searchQuery, filters]);

  const activeFiltersCount = 
    (filters.type !== "all" ? 1 : 0) +
    (filters.role !== "all" ? 1 : 0) +
    (filters.status !== "all" ? 1 : 0) +
    (filters.balance !== "all" ? 1 : 0);

  const resetFilters = () => {
    setFilters({
      type: "all",
      role: "all",
      status: "all",
      balance: "all",
    });
  };

  const filterSections: FilterSection[] = [
    {
      id: "type",
      label: "Тип",
      options: [
        { value: "all", label: "Всі типи" },
        { value: "legal", label: "Юр. особа" },
        { value: "fop", label: "ФОП" },
        { value: "individual", label: "Фіз. особа" },
      ],
      value: filters.type,
      onChange: (v) => setFilters(f => ({ ...f, type: v as Filters["type"] })),
    },
    {
      id: "role",
      label: "Роль",
      options: [
        { value: "all", label: "Всі ролі" },
        { value: "buyer", label: "Покупець" },
        { value: "supplier", label: "Постачальник" },
        { value: "both", label: "Обидва" },
        { value: "master", label: "Майстер-партнер" },
      ],
      value: filters.role,
      onChange: (v) => setFilters(f => ({ ...f, role: v as Filters["role"] })),
    },
    {
      id: "status",
      label: "Статус",
      options: [
        { value: "all", label: "Всі статуси" },
        { value: "active", label: "Активні" },
        { value: "inactive", label: "Неактивні" },
        { value: "blocked", label: "Заблоковані" },
      ],
      value: filters.status,
      onChange: (v) => setFilters(f => ({ ...f, status: v as Filters["status"] })),
    },
    {
      id: "balance",
      label: "Баланс",
      options: [
        { value: "all", label: "Всі" },
        { value: "debtors", label: "Нам винні (+)" },
        { value: "creditors", label: "Ми винні (-)" },
        { value: "zero", label: "Нульовий" },
      ],
      value: filters.balance,
      onChange: (v) => setFilters(f => ({ ...f, balance: v as Filters["balance"] })),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Header - only show when not embedded */}
      {!embedded && (
        <Card className="hover:shadow-md transition-all">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-muted-foreground" />
                <CardTitle className="text-base">Контрагенти</CardTitle>
                <Badge variant="secondary">{allContractors.length}</Badge>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => window.open("/contractor-onboarding", "_blank")}
                  className="text-muted-foreground"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Демо онбордингу</span>
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    exportContractorsToCSV(filteredContractors);
                    toast.success("CSV експортовано");
                  }}
                >
                  <Download className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Експорт</span>
                </Button>
                <Button size="sm" onClick={() => setFormSheetOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Додати</span>
                </Button>
              </div>
            </div>
            <CardDescription>
              Постачальники, покупці та партнери
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* Toolbar */}
      <UnifiedToolbar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Пошук за назвою, кодом, email, телефоном..."
        sticky={false}
        filterSlot={
          <UnifiedFilterPopover
            sections={filterSections}
            activeFiltersCount={activeFiltersCount}
            onReset={resetFilters}
            title="Фільтри контрагентів"
            isMobile={isMobile}
          />
        }
      />

      {/* Active filter chips */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap items-center gap-1.5" aria-live="polite">
          {filters.type !== "all" && (
            <Badge variant="secondary" className="gap-1 pr-1 text-xs">
              Тип: {filters.type === "legal" ? "Юр. особа" : filters.type === "fop" ? "ФОП" : "Фіз. особа"}
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-4 w-4 ml-1 hover:bg-destructive/20"
                onClick={() => setFilters(f => ({ ...f, type: "all" }))}
              >
                <span className="sr-only">Видалити фільтр</span>
                ×
              </Button>
            </Badge>
          )}
          {filters.role !== "all" && (
            <Badge variant="secondary" className="gap-1 pr-1 text-xs">
              Роль: {filters.role === "buyer" ? "Покупець" : filters.role === "supplier" ? "Постачальник" : "Обидва"}
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-4 w-4 ml-1 hover:bg-destructive/20"
                onClick={() => setFilters(f => ({ ...f, role: "all" }))}
              >
                <span className="sr-only">Видалити фільтр</span>
                ×
              </Button>
            </Badge>
          )}
          {filters.status !== "all" && (
            <Badge variant="secondary" className="gap-1 pr-1 text-xs">
              Статус: {filters.status === "active" ? "Активні" : filters.status === "inactive" ? "Неактивні" : "Заблоковані"}
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-4 w-4 ml-1 hover:bg-destructive/20"
                onClick={() => setFilters(f => ({ ...f, status: "all" }))}
              >
                <span className="sr-only">Видалити фільтр</span>
                ×
              </Button>
            </Badge>
          )}
          {filters.balance !== "all" && (
            <Badge variant="secondary" className="gap-1 pr-1 text-xs">
              Баланс: {filters.balance === "debtors" ? "Нам винні" : filters.balance === "creditors" ? "Ми винні" : "Нульовий"}
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-4 w-4 ml-1 hover:bg-destructive/20"
                onClick={() => setFilters(f => ({ ...f, balance: "all" }))}
              >
                <span className="sr-only">Видалити фільтр</span>
                ×
              </Button>
            </Badge>
          )}
          {activeFiltersCount > 1 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 text-xs text-muted-foreground hover:text-foreground"
              onClick={resetFilters}
            >
              Скинути всі
            </Button>
          )}
        </div>
      )}

      {/* Table/Cards */}
      <ContractorsTable
        contractors={filteredContractors}
        onNavigate={onNavigateToContractor}
        searchQuery={searchQuery}
        onClearSearch={() => setSearchQuery("")}
      />

      {/* Add Contractor Sheet */}
      <ContractorFormSheet
        open={formSheetOpen}
        onOpenChange={setFormSheetOpen}
        contractor={null}
        onSuccess={() => {
          // In real app, would refresh data
        }}
      />
    </div>
  );
};
