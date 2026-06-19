import { useState, useMemo, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Link2, 
  RefreshCw, 
  CheckCircle, 
  Clock, 
  XCircle, 
  AlertCircle, 
  Settings, 
  Plus,
  Activity,
  FileText,
  KeyRound,
  PlugZap,
  Search,
  LayoutGrid,
  Table as TableIcon,
  Pause,
  X,
} from "lucide-react";
import type { Cabinet } from "@/types/cabinet";
import { 
  getDataSourcesForCabinet, 
  availableIntegrations,
  categoryLabels,
  type DataSource, 
  type DataSourceStatus,
  type DataSourceCategory,
} from "@/config/dataSourcesConfig";
import { formatDistanceToNow } from "date-fns";
import { uk } from "date-fns/locale";
import { SyncLogSheet } from "./SyncLogSheet";
import { ConnectionSettingsSheet } from "./ConnectionSettingsSheet";
import { ConnectIntegrationSheet } from "./ConnectIntegrationSheet";
import { ConnectionsTable } from "./ConnectionsTable";
import { toast } from "sonner";
import { UnifiedToolbar, type SortOption, type FilterOption, type ActiveChip } from "@/components/ui/UnifiedToolbar";
import { DataQualityButton, type DataQualitySummary, type IssueTypeDefinition } from "@/components/ui/DataQualityButton";
import { TableEmptyState } from "@/components/ui/table-empty-state";
import { useIsMobile } from "@/hooks/use-mobile";

interface ConnectionsSectionProps {
  cabinet: Cabinet;
}

const statusConfig: Record<DataSourceStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: typeof CheckCircle; className?: string }> = {
  active: { label: "Підключено", variant: "default", icon: CheckCircle, className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
  pending: { label: "Очікує", variant: "outline", icon: Clock, className: "border-yellow-500/50 text-yellow-700 dark:text-yellow-400" },
  inactive: { label: "Не підключено", variant: "secondary", icon: XCircle },
  error: { label: "Помилка", variant: "destructive", icon: AlertCircle },
};

// Issue type config for DataQualityButton
const connectionIssueTypeConfig: Record<string, IssueTypeDefinition> = {
  missing_iban: { label: "Відсутній IBAN", shortLabel: "IBAN", color: "red", priority: 1 },
  duplicate: { label: "Дублікат", shortLabel: "Дублікат", color: "orange", priority: 2 },
  invalid_amount: { label: "Некоректна сума", shortLabel: "Сума", color: "amber", priority: 3 },
  missing_contractor: { label: "Відсутній контрагент", shortLabel: "Контрагент", color: "yellow", priority: 4 },
  unmatched: { label: "Не розпізнано", shortLabel: "Не розпізнано", color: "slate", priority: 5 },
};

// Sort options
const sortOptions: SortOption[] = [
  { value: "name", label: "Назва" },
  { value: "lastSync", label: "Остання синхр." },
  { value: "quality", label: "Якість" },
  { value: "records", label: "Записів" },
];

// Category filter options
const categoryFilterOptions: FilterOption[] = [
  { value: "all", label: "Всі категорії" },
  { value: "bank", label: "Банки" },
  { value: "edo", label: "ЕДО" },
  { value: "tax", label: "Податкова" },
  { value: "government", label: "Держсервіси" },
  { value: "accounting", label: "Облікові системи" },
  { value: "prro", label: "ПРРО" },
];

// Status filter options
const statusFilterOptions: FilterOption[] = [
  { value: "all", label: "Всі статуси" },
  { value: "active", label: "Активні" },
  { value: "pending", label: "Очікують" },
  { value: "error", label: "Помилки" },
];

export const ConnectionsSection = ({ cabinet }: ConnectionsSectionProps) => {
  const isMobile = useIsMobile();
  
  // View mode: list (table) is default, grid (cards) for visual preference
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  
  // Search and filter state
  const [searchValue, setSearchValue] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortField, setSortField] = useState("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  
  // Batch selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  
  // Marketplace search and category
  const [marketplaceSearch, setMarketplaceSearch] = useState("");
  const [marketplaceCategory, setMarketplaceCategory] = useState("all");
  
  // Sheet states
  const [syncLogOpen, setSyncLogOpen] = useState(false);
  const [selectedConnectionId, setSelectedConnectionId] = useState<string | undefined>();
  const [selectedConnectionName, setSelectedConnectionName] = useState<string | undefined>();
  const [settingsSheetOpen, setSettingsSheetOpen] = useState(false);
  const [selectedConnection, setSelectedConnection] = useState<DataSource | null>(null);
  const [connectSheetOpen, setConnectSheetOpen] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<DataSource | null>(null);

  // Get connections for this cabinet
  const connections = useMemo(() => {
    const docs = getDataSourcesForCabinet(cabinet.type, "documents");
    const integrations = getDataSourcesForCabinet(cabinet.type, "integrations");
    // Merge, avoiding duplicates by id
    const seen = new Set(docs.map(d => d.id));
    return [...docs, ...integrations.filter(i => !seen.has(i.id))];
  }, [cabinet.type]);


  // Filter and sort connections
  const filteredConnections = useMemo(() => {
    let filtered = [...connections];
    
    // Search
    if (searchValue) {
      const lowerSearch = searchValue.toLowerCase();
      filtered = filtered.filter(c => 
        c.name.toLowerCase().includes(lowerSearch) ||
        c.description?.toLowerCase().includes(lowerSearch)
      );
    }
    
    // Category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter(c => c.category === categoryFilter);
    }
    
    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(c => c.status === statusFilter);
    }
    
    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case "name":
          comparison = a.name.localeCompare(b.name, "uk");
          break;
        case "lastSync":
          comparison = (new Date(b.lastSync || 0).getTime()) - (new Date(a.lastSync || 0).getTime());
          break;
        case "quality":
          comparison = (b.dataQualityPercent || 0) - (a.dataQualityPercent || 0);
          break;
        case "records":
          comparison = (b.recordsCount || 0) - (a.recordsCount || 0);
          break;
      }
      return sortDirection === "asc" ? comparison : -comparison;
    });
    
    return filtered;
  }, [connections, searchValue, categoryFilter, statusFilter, sortField, sortDirection]);

  // Group by category
  const groupedConnections = useMemo(() => {
    return filteredConnections.reduce((acc, connection) => {
      const category = connection.category;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(connection);
      return acc;
    }, {} as Record<string, DataSource[]>);
  }, [filteredConnections]);

  // Filter marketplace integrations
  const filteredMarketplace = useMemo(() => {
    let filtered = availableIntegrations;
    
    if (marketplaceCategory !== "all") {
      filtered = filtered.filter(i => i.category === marketplaceCategory);
    }
    
    if (marketplaceSearch) {
      const lowerSearch = marketplaceSearch.toLowerCase();
      filtered = filtered.filter(i =>
        i.name.toLowerCase().includes(lowerSearch) ||
        i.description?.toLowerCase().includes(lowerSearch) ||
        i.features?.some(f => f.toLowerCase().includes(lowerSearch))
      );
    }
    
    return filtered;
  }, [marketplaceSearch, marketplaceCategory]);

  // Stats
  const stats = useMemo(() => {
    const active = connections.filter(c => c.status === "active").length;
    const pending = connections.filter(c => c.status === "pending").length;
    const errors = connections.filter(c => c.status === "error").length;
    const totalRecords = connections.reduce((sum, c) => sum + (c.recordsCount || 0), 0);
    const avgQuality = connections.filter(c => c.dataQualityPercent !== undefined).length > 0
      ? Math.round(
          connections
            .filter(c => c.dataQualityPercent !== undefined)
            .reduce((sum, c) => sum + (c.dataQualityPercent || 0), 0) / 
          connections.filter(c => c.dataQualityPercent !== undefined).length
        )
      : null;
    return { total: connections.length, active, pending, errors, totalRecords, avgQuality };
  }, [connections]);

  // Aggregate data quality summary for all connections
  const dataQualitySummary = useMemo((): DataQualitySummary => {
    const activeConnections = connections.filter(c => c.status === "active" && c.dataQualityPercent !== undefined);
    const issuesByType: Record<string, number> = {};
    
    activeConnections.forEach(c => {
      c.dataQualityIssues?.forEach(issue => {
        issuesByType[issue.type] = (issuesByType[issue.type] || 0) + issue.count;
      });
    });
    
    const totalIssues = Object.values(issuesByType).reduce((sum, count) => sum + count, 0);
    
    return {
      qualityPercent: stats.avgQuality ?? 100,
      totalCount: stats.totalRecords,
      itemsWithIssues: totalIssues,
      issuesByType,
    };
  }, [connections, stats]);

  // Active filter chips
  const activeChips = useMemo((): ActiveChip[] => {
    const chips: ActiveChip[] = [];
    if (categoryFilter !== "all") {
      chips.push({
        key: "category",
        label: categoryFilterOptions.find(o => o.value === categoryFilter)?.label || categoryFilter,
        onRemove: () => setCategoryFilter("all"),
      });
    }
    if (statusFilter !== "all") {
      chips.push({
        key: "status",
        label: statusFilterOptions.find(o => o.value === statusFilter)?.label || statusFilter,
        onRemove: () => setStatusFilter("all"),
      });
    }
    return chips;
  }, [categoryFilter, statusFilter]);

  const clearAllFilters = useCallback(() => {
    setSearchValue("");
    setCategoryFilter("all");
    setStatusFilter("all");
  }, []);

  const openSyncLog = (connectionId?: string, connectionName?: string) => {
    setSelectedConnectionId(connectionId);
    setSelectedConnectionName(connectionName);
    setSyncLogOpen(true);
  };

  const openSettingsSheet = (connection: DataSource) => {
    setSelectedConnection(connection);
    setSettingsSheetOpen(true);
  };

  const openConnectSheet = (integration: DataSource) => {
    setSelectedIntegration(integration);
    setConnectSheetOpen(true);
  };

  const handleFixError = (connection: DataSource) => {
    if (connection.errorType === "auth_expired" || connection.errorType === "invalid_credentials") {
      openSettingsSheet(connection);
    } else {
      toast.info("Повторюємо синхронізацію...");
    }
  };

  const handleFilterByIssueType = useCallback((issueType: string) => {
    toast.info(`Фільтр за типом: ${connectionIssueTypeConfig[issueType]?.label || issueType}`);
  }, []);

  const handleShowAllIssues = useCallback(() => {
    openSyncLog();
  }, []);

  // Batch actions
  const handleBatchSync = useCallback(() => {
    const count = selectedIds.size;
    toast.info(`Синхронізація ${count} підключень...`);
    setSelectedIds(new Set());
  }, [selectedIds]);

  const handleBatchPause = useCallback(() => {
    const count = selectedIds.size;
    toast.info(`Призупинено ${count} підключень`);
    setSelectedIds(new Set());
  }, [selectedIds]);

  const handleSyncClick = useCallback((connection: DataSource) => {
    toast.info(`Синхронізація "${connection.name}"...`);
  }, []);

  const handlePauseClick = useCallback((connection: DataSource) => {
    toast.info(`Призупинено "${connection.name}"`);
  }, []);

  const handleDisconnectClick = useCallback((connection: DataSource) => {
    toast.warning(`Відключити "${connection.name}"?`);
    openSettingsSheet(connection);
  }, []);

  const renderConnectionCard = (connection: DataSource) => {
    const status = statusConfig[connection.status];
    const StatusIcon = status.icon;
    const ConnectionIcon = connection.icon;

    // Build data quality summary for individual connection
    const connectionQualitySummary: DataQualitySummary | null = connection.status === "active" && connection.dataQualityPercent !== undefined
      ? {
          qualityPercent: connection.dataQualityPercent,
          totalCount: connection.recordsCount || 0,
          itemsWithIssues: connection.dataQualityIssues?.reduce((sum, i) => sum + i.count, 0) || 0,
          issuesByType: connection.dataQualityIssues?.reduce((acc, i) => {
            acc[i.type] = i.count;
            return acc;
          }, {} as Record<string, number>) || {},
        }
      : null;

    return (
      <Card key={connection.id} className="relative overflow-hidden hover:shadow-md transition-all">
        {connection.status === "active" && (
          <div className="absolute top-0 left-0 w-1 h-full bg-green-500" />
        )}
        {connection.status === "error" && (
          <div className="absolute top-0 left-0 w-1 h-full bg-destructive" />
        )}
        {connection.status === "pending" && (
          <div className="absolute top-0 left-0 w-1 h-full bg-yellow-500" />
        )}
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 min-w-0 flex-1">
              <div className="rounded-lg bg-muted p-2 shrink-0">
                <ConnectionIcon className="h-5 w-5" />
              </div>
              <div className="space-y-2 min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-medium truncate">{connection.name}</h4>
                  <Badge variant={status.variant} className={`text-xs shrink-0 ${status.className || ""}`}>
                    <StatusIcon className="h-3 w-3 mr-1" />
                    {status.label}
                  </Badge>
                </div>
                
                {/* Inline metrics */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  {connection.recordsCount !== undefined && (
                    <span>{connection.recordsCount.toLocaleString("uk-UA")} записів</span>
                  )}
                  {connection.lastSync && (
                    <span>
                      Синхр. {formatDistanceToNow(new Date(connection.lastSync), { addSuffix: true, locale: uk })}
                    </span>
                  )}
                </div>

                {/* Data quality with unified DataQualityButton */}
                {connectionQualitySummary && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Якість:</span>
                    <DataQualityButton
                      summary={connectionQualitySummary}
                      issueTypeConfig={connectionIssueTypeConfig}
                      onShowAllIssues={() => openSyncLog(connection.id, connection.name)}
                      onFilterByIssueType={handleFilterByIssueType}
                      isMobile={isMobile}
                      itemLabel="записів"
                    />
                  </div>
                )}

                {/* Error with fix button */}
                {connection.error && (
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-destructive truncate flex-1">{connection.error}</p>
                    {connection.errorType && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 text-xs shrink-0"
                        onClick={() => handleFixError(connection)}
                      >
                        {connection.errorType === "auth_expired" ? (
                          <>
                            <KeyRound className="h-3 w-3 mr-1" />
                            Оновити
                          </>
                        ) : (
                          <>
                            <RefreshCw className="h-3 w-3 mr-1" />
                            Повторити
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 shrink-0">
              {connection.status === "active" && (
                <>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => openSyncLog(connection.id, connection.name)}
                      >
                        <FileText className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Журнал</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => toast.info("Синхронізація...")}
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Синхронізувати</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => openSettingsSheet(connection)}
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Налаштування</TooltipContent>
                  </Tooltip>
                </>
              )}
              {connection.status === "pending" && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => openSettingsSheet(connection)}
                    >
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Підтвердити</TooltipContent>
                </Tooltip>
              )}
              {connection.status === "error" && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => openSettingsSheet(connection)}
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Налаштування</TooltipContent>
                </Tooltip>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const hasActiveFilters = searchValue || categoryFilter !== "all" || statusFilter !== "all";

  return (
    <div className="space-y-5">
      {/* Summary Stats */}
      <Card className="hover:shadow-md transition-all">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Link2 className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-base">Підключення та синхронізація</CardTitle>
          </div>
          <CardDescription>
            Сервіси, що автоматично синхронізують дані з вашим кабінетом
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-5">
            <div className="text-center">
              <p className="text-2xl font-bold tabular-nums">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Підключень</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold tabular-nums text-green-600">{stats.active}</p>
              <p className="text-sm text-muted-foreground">Активних</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold tabular-nums text-yellow-600">{stats.pending}</p>
              <p className="text-sm text-muted-foreground">Очікують</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold tabular-nums">{stats.totalRecords.toLocaleString("uk-UA")}</p>
              <p className="text-sm text-muted-foreground">Записів</p>
            </div>
            {stats.avgQuality !== null && (
              <div className="text-center">
                <p className={`text-2xl font-bold tabular-nums ${stats.avgQuality >= 90 ? "text-green-600" : stats.avgQuality >= 70 ? "text-yellow-600" : "text-red-600"}`}>
                  {stats.avgQuality}%
                </p>
                <p className="text-sm text-muted-foreground">Якість</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tabs: Active / Marketplace */}
      <Tabs defaultValue="active" className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <TabsList>
            <TabsTrigger value="active" className="gap-1.5">
              Активні
              <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                {stats.active + stats.pending + stats.errors}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="marketplace">Каталог</TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            {/* Aggregate Data Quality Button */}
            {stats.avgQuality !== null && dataQualitySummary.itemsWithIssues > 0 && (
              <DataQualityButton
                summary={dataQualitySummary}
                issueTypeConfig={connectionIssueTypeConfig}
                onShowAllIssues={handleShowAllIssues}
                onFilterByIssueType={handleFilterByIssueType}
                isMobile={isMobile}
                itemLabel="записів"
              />
            )}
            <Button variant="outline" size="sm" onClick={() => openSyncLog()}>
              <Activity className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Журнал імпорту</span>
              <span className="sm:hidden">Журнал</span>
            </Button>
            <Button variant="outline" size="sm" onClick={() => toast.info("Синхронізація всіх джерел...")}>
              <RefreshCw className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Синхронізувати все</span>
              <span className="sm:hidden">Синхр.</span>
            </Button>
          </div>
        </div>

        {/* Active Connections Tab */}
        <TabsContent value="active" className="space-y-4 mt-0">
          {/* UnifiedToolbar with View Toggle */}
          <UnifiedToolbar
            searchValue={searchValue}
            onSearchChange={setSearchValue}
            searchPlaceholder="Пошук підключень..."
            sortOptions={sortOptions}
            sortValue={sortField}
            sortDirection={sortDirection}
            onSortChange={setSortField}
            onSortDirectionToggle={() => setSortDirection(d => d === "asc" ? "desc" : "asc")}
            filterOptions={categoryFilterOptions}
            filterValue={categoryFilter}
            onFilterChange={setCategoryFilter}
            filterPlaceholder="Категорія"
            activeChips={activeChips}
            onClearAllFilters={clearAllFilters}
            resultsCount={{ shown: filteredConnections.length, total: connections.length }}
            sticky={false}
            className="bg-card rounded-lg border px-3"
            viewMode={viewMode}
            onViewModeChange={(mode) => setViewMode(mode as "list" | "grid")}
            showViewToggle
            mobileFilterContent={
              <div className="space-y-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Статус</label>
                  <div className="flex flex-wrap gap-2">
                    {statusFilterOptions.map(opt => (
                      <Button
                        key={opt.value}
                        variant={statusFilter === opt.value ? "default" : "outline"}
                        size="sm"
                        onClick={() => setStatusFilter(opt.value)}
                      >
                        {opt.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            }
          />

          {/* Batch Actions Bar */}
          {selectedIds.size > 0 && (
            <div className="flex items-center gap-3 p-2.5 bg-muted/60 rounded-lg border animate-in slide-in-from-top-2">
              <span className="text-sm font-medium">
                Обрано: {selectedIds.size}
              </span>
              <div className="flex items-center gap-1.5">
                <Button size="sm" variant="outline" onClick={handleBatchSync}>
                  <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                  Синхронізувати
                </Button>
                <Button size="sm" variant="outline" onClick={handleBatchPause}>
                  <Pause className="h-3.5 w-3.5 mr-1.5" />
                  Призупинити
                </Button>
              </div>
              <Button 
                size="sm" 
                variant="ghost" 
                className="ml-auto"
                onClick={() => setSelectedIds(new Set())}
              >
                <X className="h-3.5 w-3.5 mr-1" />
                Скасувати
              </Button>
            </div>
          )}

          {/* Connections View */}
          {filteredConnections.length > 0 ? (
            viewMode === "list" && !isMobile ? (
              <ConnectionsTable
                connections={filteredConnections}
                selectedIds={selectedIds}
                onSelectionChange={setSelectedIds}
                onSettingsClick={openSettingsSheet}
                onSyncClick={handleSyncClick}
                onLogClick={openSyncLog}
                onPauseClick={handlePauseClick}
                onDisconnectClick={handleDisconnectClick}
              />
            ) : (
              Object.entries(groupedConnections).map(([category, items]) => (
                <div key={category} className="space-y-3">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    {categoryLabels[category as DataSourceCategory] || category}
                  </h3>
                  <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
                    {items.map(renderConnectionCard)}
                  </div>
                </div>
              ))
            )
          ) : (
            <TableEmptyState
              icon={hasActiveFilters ? Search : PlugZap}
              title={hasActiveFilters ? "Підключень не знайдено" : "Немає підключених сервісів"}
              description={
                hasActiveFilters
                  ? "Спробуйте змінити параметри пошуку або фільтри"
                  : "Перейдіть до Каталогу, щоб підключити перший сервіс"
              }
              action={
                hasActiveFilters
                  ? { label: "Скинути фільтри", onClick: clearAllFilters }
                  : undefined
              }
            />
          )}
        </TabsContent>

        {/* Marketplace Tab */}
        <TabsContent value="marketplace" className="mt-0">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Доступні інтеграції</CardTitle>
              <CardDescription>
                Підключіть додаткові сервіси для розширення функціоналу
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Marketplace Search + Category Filter */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[200px] max-w-sm">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Пошук інтеграцій..."
                    value={marketplaceSearch}
                    onChange={(e) => setMarketplaceSearch(e.target.value)}
                    className="w-full pl-8 pr-3 h-9 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  />
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {categoryFilterOptions.map(opt => (
                    <Button
                      key={opt.value}
                      variant={marketplaceCategory === opt.value ? "secondary" : "ghost"}
                      size="sm"
                      className="h-8 text-xs"
                      onClick={() => setMarketplaceCategory(opt.value)}
                    >
                      {opt.label}
                    </Button>
                  ))}
                </div>
              </div>

              {filteredMarketplace.length > 0 ? (
                <Table containerClassName="max-h-[calc(100vh-400px)] overflow-auto rounded-lg border">
                  <TableHeader sticky>
                    <TableRow>
                      <TableHead>Інтеграція</TableHead>
                      <TableHead className="w-[100px] hidden md:table-cell">Категорія</TableHead>
                      <TableHead className="w-[50px]" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMarketplace.map((integration) => {
                      const IntegrationIcon = integration.icon;
                      return (
                        <TableRow 
                          key={integration.id} 
                          className="cursor-pointer"
                          onClick={() => openConnectSheet(integration)}
                        >
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="rounded-md bg-muted p-1.5 shrink-0">
                                <IntegrationIcon className="h-4 w-4" />
                              </div>
                              <div className="min-w-0">
                                <p className="font-medium truncate">{integration.name}</p>
                                {integration.description && (
                                  <p className="text-xs text-muted-foreground line-clamp-1">{integration.description}</p>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <Badge variant="outline" className="text-xs">
                              {categoryLabels[integration.category as DataSourceCategory] || integration.category}
                            </Badge>
                          </TableCell>
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8"
                              onClick={() => openConnectSheet(integration)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              ) : (
                <TableEmptyState
                  icon={Search}
                  title="Інтеграцій не знайдено"
                  description="Спробуйте змінити пошуковий запит або категорію"
                  action={{ label: "Скинути фільтри", onClick: () => { setMarketplaceSearch(""); setMarketplaceCategory("all"); } }}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Sheets */}
      <SyncLogSheet
        open={syncLogOpen}
        onOpenChange={setSyncLogOpen}
        cabinetType={cabinet.type}
        connectionId={selectedConnectionId}
        connectionName={selectedConnectionName}
      />

      <ConnectionSettingsSheet
        open={settingsSheetOpen}
        onOpenChange={setSettingsSheetOpen}
        connection={selectedConnection}
        onDisconnect={(id, keepHistory) => {
          toast.success(`Інтеграцію відключено${keepHistory ? " (дані збережено)" : ""}`);
        }}
      />

      <ConnectIntegrationSheet
        open={connectSheetOpen}
        onOpenChange={setConnectSheetOpen}
        integration={selectedIntegration}
        onSuccess={(data) => {
          toast.success(`${selectedIntegration?.name} успішно підключено!`);
        }}
      />
    </div>
  );
};

export default ConnectionsSection;
