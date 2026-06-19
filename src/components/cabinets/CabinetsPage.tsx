import { useState, useMemo, useEffect, useCallback, memo } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Building2, X, Search, ArrowUpDown, LayoutGrid, List, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SortIndicator } from "@/components/ui/sort-indicator";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { 
  Drawer, 
  DrawerContent, 
  DrawerTrigger, 
  DrawerHeader, 
  DrawerTitle,
  DrawerClose,
} from "@/components/ui/drawer";
import { 
  Table, 
  TableHeader, 
  TableHead, 
  TableBody,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { mockCabinets, typeOptions, roleOptions, statusOptions } from "@/config/cabinetsData";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import CabinetCard from "./CabinetCard";
import CabinetRow from "./CabinetRow";
import CabinetsInlineSummary from "./CabinetsInlineSummary";
import CabinetFiltersPopover from "./CabinetFiltersPopover";
import type { Cabinet } from "@/types/cabinet";

type ViewMode = "grid" | "list";
type SummaryFilterType = "total" | "income" | "attention" | "deadlines" | null;
type SortField = "name" | "fopGroup" | "deadline";
type SortDirection = "asc" | "desc";

interface CabinetsPageProps {
  onCabinetEnter?: (cabinet: Cabinet) => void;
  onScroll?: (isScrolled: boolean) => void;
  onNavigateToAnalytics?: () => void;
}

const sortOptions = [
  { value: "name:asc", label: "Назва (А–Я)" },
  { value: "name:desc", label: "Назва (Я–А)" },
  { value: "fopGroup:asc", label: "Група ФОП (1 → 3)" },
  { value: "fopGroup:desc", label: "Група ФОП (3 → 1)" },
  { value: "deadline:asc", label: "Дедлайн (раніше → пізніше)" },
  { value: "deadline:desc", label: "Дедлайн (пізніше → раніше)" },
];

// Мемоізований компонент фільтрів для мобільного Sheet
interface MobileFiltersContentProps {
  typeFilter: string;
  roleFilter: string;
  statusFilter: string;
  onTypeChange: (value: string) => void;
  onRoleChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onReset: () => void;
}

const MobileFiltersContent = memo(function MobileFiltersContent({
  typeFilter,
  roleFilter,
  statusFilter,
  onTypeChange,
  onRoleChange,
  onStatusChange,
  onReset,
}: MobileFiltersContentProps) {
  const hasActiveFilters = typeFilter !== "all" || roleFilter !== "all" || statusFilter !== "active";
  
  return (
    <>
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Тип кабінету</Label>
        <Select value={typeFilter} onValueChange={onTypeChange}>
          <SelectTrigger className="h-9 w-full">
            <SelectValue placeholder="Тип" />
          </SelectTrigger>
          <SelectContent>
            {typeOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Роль</Label>
        <Select value={roleFilter} onValueChange={onRoleChange}>
          <SelectTrigger className="h-9 w-full">
            <SelectValue placeholder="Роль" />
          </SelectTrigger>
          <SelectContent>
            {roleOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Статус</Label>
        <Select value={statusFilter} onValueChange={onStatusChange}>
          <SelectTrigger className="h-9 w-full">
            <SelectValue placeholder="Статус" />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {hasActiveFilters && (
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onReset}
          className="w-full text-muted-foreground"
        >
          <X className="w-3.5 h-3.5 mr-1" />
          Скинути фільтри
        </Button>
      )}
    </>
  );
});

const CabinetsPage = ({ onCabinetEnter, onScroll, onNavigateToAnalytics }: CabinetsPageProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("active");
  const [activeSummaryFilter, setActiveSummaryFilter] = useState<SummaryFilterType>(null);
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    return (localStorage.getItem("cabinets-view") as ViewMode) || "grid";
  });

  useEffect(() => {
    localStorage.setItem("cabinets-view", viewMode);
  }, [viewMode]);

  // Мемоізовані handlers для фільтрів
  const handleTypeChange = useCallback((value: string) => {
    setTypeFilter(value);
    setActiveSummaryFilter(null);
  }, []);

  const handleRoleChange = useCallback((value: string) => {
    setRoleFilter(value);
    setActiveSummaryFilter(null);
  }, []);

  const handleStatusChange = useCallback((value: string) => {
    setStatusFilter(value);
    setActiveSummaryFilter(null);
  }, []);

  const handleSummaryFilterClick = useCallback((filter: SummaryFilterType) => {
    setActiveSummaryFilter(filter);
    setTypeFilter("all");
    setRoleFilter("all");
    if (filter === "total" || filter === "attention" || filter === "deadlines") {
      setStatusFilter("all");
    } else if (filter === null) {
      setStatusFilter("active");
    }
  }, []);

  const handleResetAllFilters = useCallback(() => {
    setTypeFilter("all");
    setRoleFilter("all");
    setStatusFilter("active");
    setActiveSummaryFilter(null);
    setSearchQuery("");
  }, []);

  const handleResetPopoverFilters = useCallback(() => {
    setTypeFilter("all");
    setRoleFilter("all");
    setStatusFilter("active");
    setActiveSummaryFilter(null);
  }, []);

  const handleCreateCabinet = () => {
    navigate('/add-cabinet');
  };

  const handleSortChange = (value: string) => {
    const [field, direction] = value.split(":");
    setSortField(field as SortField);
    setSortDirection((direction as SortDirection) ?? "asc");
  };

  const toggleSortDirection = () => {
    setSortDirection(prev => prev === "asc" ? "desc" : "asc");
  };

  const handleColumnSort = (field: SortField) => {
    if (sortField === field) {
      toggleSortDirection();
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const filteredAndSortedCabinets = useMemo(() => {
    const now = new Date();
    const weekFromNow = new Date();
    weekFromNow.setDate(now.getDate() + 7);

    const filtered = mockCabinets.filter((cabinet) => {
      const matchesSearch = cabinet.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesType = typeFilter === "all" || cabinet.type === typeFilter;
      const matchesRole = roleFilter === "all" || cabinet.role === roleFilter;
      const matchesStatus = statusFilter === "all" || cabinet.status === statusFilter;
      const matchesAttention = activeSummaryFilter !== "attention" || cabinet.reportStatus === "tasks";
      
      let matchesDeadlines = true;
      if (activeSummaryFilter === "deadlines") {
        if (!cabinet.nextDeadline) {
          matchesDeadlines = false;
        } else {
          const deadlineDate = new Date(cabinet.nextDeadline);
          matchesDeadlines = deadlineDate >= now && deadlineDate <= weekFromNow;
        }
      }

      return matchesSearch && matchesType && matchesRole && matchesStatus && matchesAttention && matchesDeadlines;
    });

    const sorted = [...filtered].sort((a, b) => {
      let comparison = 0;
      
      switch (sortField) {
        case "name":
          comparison = a.name.localeCompare(b.name, "uk");
          break;
        case "fopGroup":
          // ФОП з групою — спочатку, потім за номером групи
          const groupA = a.fopGroup || Infinity;
          const groupB = b.fopGroup || Infinity;
          comparison = groupA - groupB;
          break;
        case "deadline":
          const dateA = a.nextDeadline ? new Date(a.nextDeadline).getTime() : Infinity;
          const dateB = b.nextDeadline ? new Date(b.nextDeadline).getTime() : Infinity;
          comparison = dateA - dateB;
          break;
      }
      
      return sortDirection === "asc" ? comparison : -comparison;
    });

    return sorted;
  }, [searchQuery, typeFilter, roleFilter, statusFilter, activeSummaryFilter, sortField, sortDirection]);

  const handleEnter = (cabinet: Cabinet) => {
    onCabinetEnter?.(cabinet);
  };

  // Отримуємо labels для активних фільтрів
  const getActiveFilterChips = () => {
    const chips: { key: string; label: string; onRemove: () => void }[] = [];
    
    if (typeFilter !== "all") {
      const label = typeOptions.find(o => o.value === typeFilter)?.label || typeFilter;
      chips.push({ key: "type", label, onRemove: () => handleTypeChange("all") });
    }
    if (roleFilter !== "all") {
      const label = roleOptions.find(o => o.value === roleFilter)?.label || roleFilter;
      chips.push({ key: "role", label, onRemove: () => handleRoleChange("all") });
    }
    if (statusFilter !== "active" && statusFilter !== "all") {
      const label = statusOptions.find(o => o.value === statusFilter)?.label || statusFilter;
      chips.push({ key: "status", label, onRemove: () => handleStatusChange("active") });
    }
    if (activeSummaryFilter === "attention") {
      chips.push({ key: "attention", label: "Потребують уваги", onRemove: () => setActiveSummaryFilter(null) });
    }
    if (activeSummaryFilter === "deadlines") {
      chips.push({ key: "deadlines", label: "Найближчі дедлайни", onRemove: () => setActiveSummaryFilter(null) });
    }
    if (searchQuery) {
      chips.push({ key: "search", label: `"${searchQuery}"`, onRemove: () => setSearchQuery("") });
    }
    
    return chips;
  };

  const activeChips = getActiveFilterChips();
  const hasAnyFilters = activeChips.length > 0;

  return (
    <div 
      className="h-full md:overflow-auto p-4 md:p-6 space-y-5"
      onScroll={(e) => {
        const scrollTop = (e.target as HTMLDivElement).scrollTop;
        onScroll?.(scrollTop > 10);
      }}
    >
      {/* Header + Create Button */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Building2 className="w-5 h-5 text-primary" />
          <h1 className="text-lg md:text-xl font-bold">Кабінети</h1>
        </div>
        <Button 
          onClick={handleCreateCabinet}
          size="sm"
          className="gap-1.5 h-9"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Додати</span>
        </Button>
      </div>

      {/* Inline Summary Bar */}
      <CabinetsInlineSummary 
        cabinets={mockCabinets} 
        activeFilter={activeSummaryFilter}
        onFilterClick={handleSummaryFilterClick}
        onNavigateToAnalytics={onNavigateToAnalytics}
      />

      {/* Toolbar */}
      <div className="space-y-2 pb-3 mt-1">
        {/* Main toolbar row */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Search */}
          <div className="flex-1 min-w-[140px] sm:min-w-[200px] max-w-sm relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Пошук кабінетів..."
              className="pl-8 pr-8 h-9 sm:h-8 text-sm"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-muted"
              >
                <X className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            )}
          </div>
          
          {/* Filters Popover - desktop */}
          <div className="hidden sm:block">
            <CabinetFiltersPopover
              typeFilter={typeFilter}
              roleFilter={roleFilter}
              statusFilter={statusFilter}
              onTypeChange={handleTypeChange}
              onRoleChange={handleRoleChange}
              onStatusChange={handleStatusChange}
              onReset={handleResetPopoverFilters}
              isMobile={false}
            />
          </div>
          
          {/* Sort - desktop */}
          <Select value={`${sortField}:${sortDirection}`} onValueChange={handleSortChange}>
            <SelectTrigger className="hidden sm:flex w-[220px] h-8 text-sm gap-1.5">
              <ArrowUpDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {/* View Toggle - desktop */}
          <ToggleGroup 
            type="single" 
            value={viewMode} 
            onValueChange={(v) => v && setViewMode(v as ViewMode)}
            className="border border-border rounded-lg hidden sm:flex"
          >
            <ToggleGroupItem value="grid" className="h-8 w-8 data-[state=on]:bg-muted">
              <LayoutGrid className="w-4 h-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="list" className="h-8 w-8 data-[state=on]:bg-muted">
              <List className="w-4 h-4" />
            </ToggleGroupItem>
          </ToggleGroup>
          
          {/* Mobile: Drawer trigger */}
          <Drawer>
            <DrawerTrigger asChild>
              <Button variant="outline" size="icon" className="h-9 w-9 sm:hidden">
                <SlidersHorizontal className="w-4 h-4" />
              </Button>
            </DrawerTrigger>
            <DrawerContent className="max-h-[85dvh]">
              <DrawerHeader className="pb-2">
                <DrawerTitle>Фільтри та сортування</DrawerTitle>
              </DrawerHeader>
              <div className="px-4 pb-6 space-y-4">
                {/* Mobile Sort */}
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Сортування</Label>
                  <Select value={`${sortField}:${sortDirection}`} onValueChange={handleSortChange}>
                    <SelectTrigger className="w-full h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {sortOptions.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Mobile View Mode */}
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Вигляд</Label>
                  <ToggleGroup 
                    type="single" 
                    value={viewMode} 
                    onValueChange={(v) => v && setViewMode(v as ViewMode)}
                    className="justify-start"
                  >
                    <ToggleGroupItem value="grid" className="h-9 px-3 gap-1.5 data-[state=on]:bg-muted">
                      <LayoutGrid className="w-4 h-4" />
                      Сітка
                    </ToggleGroupItem>
                    <ToggleGroupItem value="list" className="h-9 px-3 gap-1.5 data-[state=on]:bg-muted">
                      <List className="w-4 h-4" />
                      Список
                    </ToggleGroupItem>
                  </ToggleGroup>
                </div>
                
                {/* Mobile Filters */}
                <MobileFiltersContent
                  typeFilter={typeFilter}
                  roleFilter={roleFilter}
                  statusFilter={statusFilter}
                  onTypeChange={handleTypeChange}
                  onRoleChange={handleRoleChange}
                  onStatusChange={handleStatusChange}
                  onReset={handleResetPopoverFilters}
                />
                
                <DrawerClose asChild>
                  <Button variant="default" className="w-full mt-4">Готово</Button>
                </DrawerClose>
              </div>
            </DrawerContent>
          </Drawer>
        </div>
        
        {/* Active filters row */}
        {(activeChips.length > 0 || filteredAndSortedCabinets.length !== mockCabinets.length) && (
          <div className="flex items-center gap-1.5 flex-wrap text-sm">
            <span className="text-sm text-muted-foreground">
              Знайдено: <span className="font-medium text-foreground">{filteredAndSortedCabinets.length}</span> з {mockCabinets.length}
            </span>
            {activeChips.map(chip => (
              <Badge 
                key={chip.key} 
                variant="outline" 
                className="h-6 px-2 text-xs font-normal gap-1 cursor-pointer bg-secondary/50 hover:bg-secondary/80 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); chip.onRemove(); }}}
              >
                {chip.label}
                <X className="w-3 h-3" onClick={chip.onRemove} />
              </Badge>
            ))}
            {activeChips.length > 1 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleResetAllFilters}
                className="h-6 px-2 text-xs text-muted-foreground"
              >
                Скинути всі
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Cabinets — grouped by ownership */}
      <div className="pt-1 space-y-6">
      {filteredAndSortedCabinets.length > 0 ? (
        (() => {
          const personal = filteredAndSortedCabinets.filter(
            (c) => c.type === "individual" && c.role === "owner",
          );
          const ownedBusiness = filteredAndSortedCabinets.filter(
            (c) => c.role === "owner" && c.type !== "individual",
          );
          const delegated = filteredAndSortedCabinets.filter((c) => c.role !== "owner");

          const renderGrid = (list: Cabinet[]) => (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {list.map((cabinet) => (
                <CabinetCard key={cabinet.id} cabinet={cabinet} onEnter={handleEnter} />
              ))}
            </div>
          );

          const renderTable = (list: Cabinet[]) => (
            <div className="border border-border rounded-xl overflow-hidden bg-card">
              <Table>
                <TableHeader sticky className="hidden md:table-header-group">
                  <TableRow className="hover:bg-muted/80">
                    <TableHead compact className="w-8" />
                    <TableHead
                      compact
                      sortable
                      sorted={sortField === "name"}
                      sortDirection={sortField === "name" ? sortDirection : null}
                      onSort={() => handleColumnSort("name")}
                      className="flex-1 min-w-0"
                    >
                      <span className="inline-flex items-center">
                        Назва
                        <SortIndicator active={sortField === "name"} direction={sortDirection} />
                      </span>
                    </TableHead>
                    <TableHead compact className="w-[88px] hidden lg:table-cell">Код</TableHead>
                    <TableHead compact className="w-[84px] text-center">Тип</TableHead>
                    <TableHead compact className="w-[72px] hidden sm:table-cell">Роль</TableHead>
                    <TableHead
                      compact
                      sortable
                      sorted={sortField === "fopGroup"}
                      sortDirection={sortField === "fopGroup" ? sortDirection : null}
                      onSort={() => handleColumnSort("fopGroup")}
                      className="w-16 text-center hidden lg:table-cell"
                    >
                      <span className="inline-flex items-center justify-center">
                        Група
                        <SortIndicator active={sortField === "fopGroup"} direction={sortDirection} />
                      </span>
                    </TableHead>
                    <TableHead
                      compact
                      sortable
                      sorted={sortField === "deadline"}
                      sortDirection={sortField === "deadline" ? sortDirection : null}
                      onSort={() => handleColumnSort("deadline")}
                      className="w-16 hidden md:table-cell text-center"
                    >
                      <span className="inline-flex items-center justify-center">
                        Дедлайн
                        <SortIndicator active={sortField === "deadline"} direction={sortDirection} />
                      </span>
                    </TableHead>
                    <TableHead compact className="w-6 text-center">Стан</TableHead>
                    <TableHead compact className="w-4" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {list.map((cabinet) => (
                    <CabinetRow key={cabinet.id} cabinet={cabinet} onEnter={handleEnter} />
                  ))}
                </TableBody>
              </Table>
            </div>
          );

          const renderList = (list: Cabinet[]) =>
            viewMode === "grid" || isMobile ? renderGrid(list) : renderTable(list);

          const Section = ({
            title,
            description,
            count,
            children,
          }: {
            title: string;
            description?: string;
            count: number;
            children: React.ReactNode;
          }) => (
            <section className="space-y-2.5">
              <div className="flex items-baseline justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    {title}
                    <Badge variant="secondary" className="h-5 px-1.5 text-[11px] font-medium">
                      {count}
                    </Badge>
                  </h2>
                  {description && (
                    <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
                  )}
                </div>
              </div>
              {children}
            </section>
          );

          return (
            <>
              {personal.length > 0 ? (
                <Section
                  title="Особистий кабінет"
                  description="Ваш кабінет фізособи: фінанси, податки, документи, побут."
                  count={personal.length}
                >
                  {renderList(personal)}
                </Section>
              ) : (
                <Section
                  title="Особистий кабінет"
                  description="Кабінет фізособи ще не створено."
                  count={0}
                >
                  <div className="border border-dashed border-border rounded-xl p-4 flex items-center justify-between gap-3">
                    <p className="text-sm text-muted-foreground">
                      Створіть особистий кабінет, щоб вести облік доходів, податків і
                      побутових фінансів.
                    </p>
                    <Button size="sm" onClick={handleCreateCabinet} className="gap-1.5">
                      <Plus className="w-4 h-4" />
                      Створити
                    </Button>
                  </div>
                </Section>
              )}

              {ownedBusiness.length > 0 && (
                <Section
                  title="Мої ФОП і компанії"
                  description="Кабінети, де ви — власник."
                  count={ownedBusiness.length}
                >
                  {renderList(ownedBusiness)}
                </Section>
              )}

              {delegated.length > 0 && (
                <Section
                  title="Делеговані кабінети"
                  description="Кабінети клієнтів і партнерів, у яких ви маєте дії за делегацією."
                  count={delegated.length}
                >
                  {renderList(delegated)}
                </Section>
              )}
            </>
          );
        })()
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Building2 className="w-12 h-12 text-muted-foreground/30 mb-3" />
          <p className="text-sm font-medium text-muted-foreground">
            Кабінетів не знайдено
          </p>
          <p className="text-xs text-muted-foreground/80 mt-1">
            Спробуйте змінити параметри пошуку або фільтрів
          </p>
          {hasAnyFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetAllFilters}
              className="mt-3"
            >
              Скинути всі фільтри
            </Button>
          )}
        </div>
      )}
      </div>
    </div>
  );
};

export default CabinetsPage;

