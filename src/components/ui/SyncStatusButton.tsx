import { RefreshCw, CheckCircle, AlertCircle, Clock, Settings, Package, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { uk } from "date-fns/locale";
import type { CabinetType } from "@/types/cabinet";
import { 
  getDataSourcesForCabinet, 
  getStatusColor, 
  getOverallStatus, 
  getLatestSync,
  getNomenclatureContractorSources,
  type DataSource,
  type DataSourceVariant,
  type ContractorSyncSource
} from "@/config/dataSourcesConfig";

const getStatusIcon = (status: DataSource["status"]) => {
  switch (status) {
    case "active": return CheckCircle;
    case "pending": return Clock;
    case "error": return AlertCircle;
    default: return Clock;
  }
};

interface SyncStatusButtonProps {
  cabinetType: CabinetType;
  variant?: DataSourceVariant;
  customSources?: DataSource[];  // Override sources directly
  cabinetId?: string;            // For cabinet-specific sources
  isMobile?: boolean;
  onNavigateToSettings?: () => void;
}

export const SyncStatusButton = ({
  cabinetType,
  variant = "documents",
  customSources,
  cabinetId,
  isMobile,
  onNavigateToSettings,
}: SyncStatusButtonProps) => {
  // Use customSources if provided, otherwise get from config
  const sources = customSources ?? getDataSourcesForCabinet(cabinetType, variant, { cabinetId });
  
  // Get contractor sources for nomenclature variant
  const contractorSources = variant === "nomenclature" 
    ? getNomenclatureContractorSources(cabinetId)
    : [];
  
  const overallStatus = getOverallStatus(sources);
  const latestSync = getLatestSync(sources);

  const getTitle = () => {
    switch (variant) {
      case "documents": return "Синхронізація документів";
      case "income": return "Синхронізація даних";
      case "integrations": return "Статус інтеграцій";
      case "reports": return "Джерела даних звітності";
      case "nomenclature": return "Синхронізація номенклатури";
      default: return "Синхронізація";
    }
  };

  const getRecordsLabel = () => {
    switch (variant) {
      case "documents": return "док.";
      case "income": return "оп.";
      case "reports": return "зап.";
      case "nomenclature": return "поз.";
      default: return "";
    }
  };

  const handleRefresh = () => {
    toast({
      title: "Синхронізація",
      description: "Оновлення даних з усіх джерел (демо)",
    });
  };

  const Content = ({ showHeader = true }: { showHeader?: boolean }) => (
    <div className="space-y-4">
      {/* Header - hidden in Drawer (has DrawerTitle) */}
      {showHeader && (
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">{getTitle()}</span>
          {latestSync && (
            <span className="text-xs text-muted-foreground">
              {format(new Date(latestSync), "HH:mm", { locale: uk })}
            </span>
          )}
        </div>
      )}
      
      {/* Empty state or sources list */}
      {sources.length === 0 && contractorSources.length === 0 ? (
        <div className="text-center py-4">
          <p className="text-sm text-muted-foreground mb-3">Немає налаштованих джерел</p>
          {onNavigateToSettings && (
            <Button variant="link" size="sm" onClick={onNavigateToSettings}>
              Додати інтеграцію
            </Button>
          )}
        </div>
      ) : (
        <>
          {/* Last sync time for mobile (no header) */}
          {!showHeader && latestSync && (
            <div className="text-xs text-muted-foreground text-right">
              Останнє оновлення: {format(new Date(latestSync), "HH:mm", { locale: uk })}
            </div>
          )}
          
          <ScrollArea className="h-[280px]" scrollbarVariant="thin">
            <div className="space-y-4">
              {/* Provider Sources Section */}
              {sources.length > 0 && (
                <div className="space-y-2">
                  {variant === "nomenclature" && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium px-1">
                      <Package className="h-3.5 w-3.5" />
                      Провайдери
                    </div>
                  )}
                  {sources.map((source) => {
                    const StatusIcon = getStatusIcon(source.status);
                    return (
                      <div 
                        key={source.id}
                        className="flex items-center gap-3 p-2 rounded-lg bg-muted/50"
                      >
                        <div className={cn("w-2 h-2 rounded-full shrink-0", getStatusColor(source.status))} />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium">{source.name}</div>
                          {source.lastSync && (
                            <div className="text-xs text-muted-foreground">
                              {format(new Date(source.lastSync), "dd.MM HH:mm", { locale: uk })}
                              {source.recordsCount !== undefined && ` · ${source.recordsCount} ${getRecordsLabel()}`}
                            </div>
                          )}
                          {source.status === "pending" && (
                            <div className="text-xs text-amber-600">Очікує налаштування</div>
                          )}
                          {source.error && (
                            <div className="text-xs text-red-600">{source.error}</div>
                          )}
                        </div>
                        <StatusIcon className={cn(
                          "w-4 h-4 shrink-0",
                          source.status === "active" && "text-emerald-500",
                          source.status === "pending" && "text-amber-500",
                          source.status === "error" && "text-red-500",
                        )} />
                      </div>
                    );
                  })}
                </div>
              )}
              
              {/* Contractor Sources Section (nomenclature only) */}
              {contractorSources.length > 0 && (
                <>
                  {sources.length > 0 && <Separator className="my-2" />}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium px-1">
                      <Users className="h-3.5 w-3.5" />
                      Контрагенти
                    </div>
                    {contractorSources.map((contractor) => {
                      const StatusIcon = getStatusIcon(contractor.status);
                      return (
                        <div 
                          key={contractor.id}
                          className="flex items-center gap-3 p-2 rounded-lg bg-muted/50"
                        >
                          <div className={cn("w-2 h-2 rounded-full shrink-0", getStatusColor(contractor.status))} />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium">{contractor.name}</div>
                            {contractor.lastSync && (
                              <div className="text-xs text-muted-foreground">
                                {format(new Date(contractor.lastSync), "dd.MM HH:mm", { locale: uk })}
                                {contractor.recordsCount !== undefined && contractor.recordsCount > 0 && ` · ${contractor.recordsCount} ${getRecordsLabel()}`}
                              </div>
                            )}
                            {contractor.status === "pending" && (
                              <div className="text-xs text-amber-600">Очікує синхронізацію</div>
                            )}
                          </div>
                          <StatusIcon className={cn(
                            "w-4 h-4 shrink-0",
                            contractor.status === "active" && "text-emerald-500",
                            contractor.status === "pending" && "text-amber-500",
                            contractor.status === "error" && "text-red-500",
                          )} />
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </ScrollArea>
          
          {/* Actions */}
          <div className="flex gap-2 pt-2 border-t">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1 gap-1.5"
              onClick={handleRefresh}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Оновити все
            </Button>
            {onNavigateToSettings && (
              <Button 
                variant="ghost" 
                size="sm"
                className="gap-1.5"
                onClick={onNavigateToSettings}
              >
                <Settings className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
        </>
      )}
    </div>
  );

  const TriggerButton = (
    <Button variant="ghost" size="icon" className="relative h-8 w-8">
      <RefreshCw className="w-4 h-4" />
      <span className={cn(
        "absolute top-1 right-1 w-2 h-2 rounded-full",
        getStatusColor(overallStatus)
      )} />
    </Button>
  );

  if (isMobile) {
    return (
      <Drawer>
        <DrawerTrigger asChild>
          {TriggerButton}
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{getTitle()}</DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-6 flex-1 min-h-0 overflow-y-auto">
            <Content showHeader={false} />
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        {TriggerButton}
      </PopoverTrigger>
      <PopoverContent className="w-80 z-50 bg-background" align="end">
        <Content showHeader={true} />
      </PopoverContent>
    </Popover>
  );
};

// Re-export for backward compatibility (can be removed after full migration)
export { SyncStatusButton as DocumentSyncButton };
