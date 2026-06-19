import { useState, useMemo } from "react";
import { ChevronDown, History, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CreditUsageCard } from "./CreditUsageCard";
import { CreditUsageFilters, CreditUsageFiltersState } from "./CreditUsageFilters";
import { CreditUsageAnalytics } from "./CreditUsageAnalytics";
import { ViewModeToggle, CreditViewMode } from "@/components/ui/view-mode-toggle";
import { CreditUsageEntry } from "@/config/pricingData";
import { isToday, isThisMonth, differenceInDays, startOfDay, format } from "date-fns";
import { getRelativeLabel } from "@/lib/groupByDate";

interface CreditUsageListProps {
  entries: CreditUsageEntry[];
  initialCount?: number;
  showFilters?: boolean;
  standalone?: boolean;
}

/** Group entries by date string (yyyy-MM-dd) preserving order */
function groupEntriesByDate(entries: CreditUsageEntry[]) {
  const groups: Array<{ dateKey: string; label: string; total: number; items: CreditUsageEntry[] }> = [];
  const map = new Map<string, number>(); // dateKey -> index in groups

  entries.forEach((entry) => {
    const dateKey = entry.date.split("T")[0];
    const idx = map.get(dateKey);
    if (idx !== undefined) {
      groups[idx].items.push(entry);
      groups[idx].total += Math.abs(entry.amount);
    } else {
      map.set(dateKey, groups.length);
      groups.push({
        dateKey,
        label: getRelativeLabel(new Date(dateKey)),
        total: Math.abs(entry.amount),
        items: [entry],
      });
    }
  });

  return groups;
}

export const CreditUsageList = ({ 
  entries, 
  initialCount = 5,
  showFilters = true,
  standalone = true 
}: CreditUsageListProps) => {
  const [showAll, setShowAll] = useState(false);
  const [filters, setFilters] = useState<CreditUsageFiltersState>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<CreditViewMode>("list");

  // Extract unique cabinets for filter
  const cabinets = useMemo(() => {
    const uniqueCabinets = new Map<string, string>();
    entries.forEach(e => {
      if (e.cabinetId && e.cabinetName) {
        uniqueCabinets.set(e.cabinetId, e.cabinetName);
      } else if (e.cabinetName) {
        uniqueCabinets.set(e.cabinetName, e.cabinetName);
      }
    });
    return Array.from(uniqueCabinets).map(([id, name]) => ({ id, name }));
  }, [entries]);

  // Filter entries
  const filteredEntries = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return entries.filter(entry => {
      // Search filter
      if (q) {
        const matchDesc = entry.description.toLowerCase().includes(q);
        const matchCab = entry.cabinetName?.toLowerCase().includes(q);
        if (!matchDesc && !matchCab) return false;
      }

      // Category filter
      if (filters.category && entry.category !== filters.category) {
        return false;
      }

      // Period filter
      if (filters.period && filters.period !== "all") {
        const entryDate = new Date(entry.date);
        if (filters.period === "today" && !isToday(entryDate)) return false;
        if (filters.period === "week" && differenceInDays(startOfDay(new Date()), startOfDay(entryDate)) >= 7) return false;
        if (filters.period === "month" && !isThisMonth(entryDate)) return false;
      }

      // Cabinet filter
      if (filters.cabinetId) {
        const entryCabinetId = entry.cabinetId || entry.cabinetName;
        if (entryCabinetId !== filters.cabinetId) return false;
      }

      return true;
    });
  }, [entries, filters, searchQuery]);

  const displayedEntries = showAll ? filteredEntries : filteredEntries.slice(0, initialCount);
  const hasMore = filteredEntries.length > initialCount;

  const totalUsed = filteredEntries.reduce((sum, e) => sum + Math.abs(e.amount), 0);

  const hasActiveSearch = searchQuery.trim().length > 0;
  const hasActiveFilters = !!(filters.category || (filters.period && filters.period !== "all") || filters.cabinetId);

  const summaryStats = useMemo(() => {
    const todayTotal = entries
      .filter(e => isToday(new Date(e.date)))
      .reduce((sum, e) => sum + Math.abs(e.amount), 0);
    const monthTotal = entries
      .filter(e => isThisMonth(new Date(e.date)))
      .reduce((sum, e) => sum + Math.abs(e.amount), 0);
    const allTimeTotal = entries.reduce((sum, e) => sum + Math.abs(e.amount), 0);
    return { todayTotal, monthTotal, allTimeTotal };
  }, [entries]);

  // Group displayed entries by date
  const dateGroups = useMemo(() => groupEntriesByDate(displayedEntries), [displayedEntries]);

  const content = (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Пошук за описом або кабінетом..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-8 h-8 text-sm"
        />
      </div>

      {/* Filters */}
      {showFilters && (
        <CreditUsageFilters 
          filters={filters}
          onFiltersChange={setFilters}
          cabinets={cabinets}
          rightSlot={
            <ViewModeToggle
              mode="credits"
              value={viewMode}
              onChange={setViewMode}
            />
          }
        />
      )}

      {/* Results count when filtering */}
      {(hasActiveSearch || hasActiveFilters) && (
        <p className="text-xs text-muted-foreground">
          Знайдено: {filteredEntries.length} {filteredEntries.length === 1 ? "запис" : filteredEntries.length < 5 ? "записи" : "записів"}
        </p>
      )}

      {/* Content: list or analytics */}
      {viewMode === "analytics" ? (
        <CreditUsageAnalytics entries={filteredEntries} standalone={false} activePeriod={filters.period} />
      ) : (
        <>
          {/* Grouped entries */}
          <div className="space-y-1">
            {dateGroups.length > 0 ? (
              dateGroups.map((group) => (
                <div key={group.dateKey}>
                  <div className="flex items-center justify-between py-1.5 px-1">
                    <span className="text-xs font-medium text-muted-foreground">{group.label}</span>
                    <span className="text-xs font-medium text-muted-foreground tabular-nums">{group.total.toLocaleString()} кр.</span>
                  </div>
                  <div className="divide-y divide-border/50">
                    {group.items.map((entry) => (
                      <CreditUsageCard key={entry.id} entry={entry} showDate={false} />
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                Немає записів за обраними фільтрами
              </p>
            )}
          </div>

          {hasMore && (
            <Button
              variant="ghost"
              className="w-full gap-2"
              onClick={() => setShowAll(!showAll)}
            >
              <ChevronDown className={`h-4 w-4 transition-transform ${showAll ? "rotate-180" : ""}`} />
              {showAll ? "Згорнути" : `Показати ще ${filteredEntries.length - initialCount}`}
            </Button>
          )}
        </>
      )}
    </div>
  );

  if (!standalone) {
    return (
      <div className="space-y-3">
        <div className="grid grid-cols-3 gap-3">
          <div className={`rounded-lg p-2.5 text-center transition-colors ${filters.period === "today" ? "bg-primary/10 ring-1 ring-primary/30" : "bg-muted/50"}`}>
            <p className="text-xs text-muted-foreground">Сьогодні</p>
            <p className="text-sm font-semibold text-foreground tabular-nums">{summaryStats.todayTotal.toLocaleString()} кр.</p>
          </div>
          <div className={`rounded-lg p-2.5 text-center transition-colors ${filters.period === "month" ? "bg-primary/10 ring-1 ring-primary/30" : "bg-muted/50"}`}>
            <p className="text-xs text-muted-foreground">Цей місяць</p>
            <p className="text-sm font-semibold text-foreground tabular-nums">{summaryStats.monthTotal.toLocaleString()} кр.</p>
          </div>
          <div className={`rounded-lg p-2.5 text-center transition-colors ${!filters.period || filters.period === "all" ? "bg-primary/10 ring-1 ring-primary/30" : "bg-muted/50"}`}>
            <p className="text-xs text-muted-foreground">Весь час</p>
            <p className="text-sm font-semibold text-foreground tabular-nums">{summaryStats.allTimeTotal.toLocaleString()} кр.</p>
          </div>
        </div>
        {content}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <History className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <CardTitle className="text-lg">Історія списань кредитів</CardTitle>
              <p className="text-sm text-muted-foreground">
                Всього списано: <span className="font-medium text-foreground tabular-nums">{totalUsed.toLocaleString()}</span> кредитів
              </p>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">{content}</CardContent>
    </Card>
  );
};
