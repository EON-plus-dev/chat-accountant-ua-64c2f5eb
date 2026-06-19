import { RefreshCw, CheckCircle, AlertCircle, Clock, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { uk } from "date-fns/locale";
import type { CabinetType } from "@/types/cabinet";

export interface DocumentSource {
  id: string;
  name: string;
  category: "edo" | "government" | "accounting" | "bank";
  status: "active" | "pending" | "error" | "inactive";
  lastSync?: string;
  documentsCount?: number;
  error?: string;
}

// Get document sources based on cabinet type
export const getDocumentSourcesForCabinet = (cabinetType: CabinetType): DocumentSource[] => {
  if (cabinetType === "tov") {
    return [
      { id: "medoc", name: "M.E.Doc", category: "edo", status: "active", lastSync: "2025-12-15T10:00:00", documentsCount: 423 },
      { id: "1c", name: "1С:Бухгалтерія", category: "accounting", status: "active", lastSync: "2025-12-15T06:00:00", documentsCount: 1520 },
      { id: "tax-register", name: "Реєстр ПН ДПС", category: "government", status: "active", lastSync: "2025-12-15T09:30:00", documentsCount: 89 },
      { id: "vchasno", name: "Vchasno", category: "edo", status: "pending" },
      { id: "bank-statements", name: "Банківські виписки", category: "bank", status: "active", lastSync: "2025-12-15T08:00:00", documentsCount: 156 },
    ];
  }
  
  if (cabinetType === "fop") {
    return [
      { id: "vchasno", name: "Vchasno", category: "edo", status: "active", lastSync: "2025-12-15T09:00:00", documentsCount: 56 },
      { id: "tax-register", name: "Реєстр ПН ДПС", category: "government", status: "active", lastSync: "2025-12-15T09:30:00", documentsCount: 12 },
      { id: "privat24-docs", name: "Виписки Приват24", category: "bank", status: "active", lastSync: "2025-12-15T08:00:00", documentsCount: 34 },
      { id: "mono-docs", name: "Monobank виписки", category: "bank", status: "active", lastSync: "2025-12-15T07:45:00", documentsCount: 28 },
    ];
  }
  
  // Default/Individual
  return [
    { id: "tax-register", name: "Реєстр ДПС", category: "government", status: "active", lastSync: "2025-12-15T09:30:00", documentsCount: 5 },
    { id: "privat24-docs", name: "Виписки Приват24", category: "bank", status: "pending" },
  ];
};

const getStatusColor = (status: DocumentSource["status"]) => {
  switch (status) {
    case "active": return "bg-emerald-500";
    case "pending": return "bg-amber-500";
    case "error": return "bg-red-500";
    case "inactive": return "bg-muted-foreground/40";
    default: return "bg-muted-foreground/40";
  }
};

const getStatusIcon = (status: DocumentSource["status"]) => {
  switch (status) {
    case "active": return CheckCircle;
    case "pending": return Clock;
    case "error": return AlertCircle;
    default: return Clock;
  }
};

interface DocumentSyncButtonProps {
  cabinetType: CabinetType;
  isMobile?: boolean;
  onNavigateToSettings?: () => void;
}

export const DocumentSyncButton = ({
  cabinetType,
  isMobile,
  onNavigateToSettings,
}: DocumentSyncButtonProps) => {
  const sources = getDocumentSourcesForCabinet(cabinetType);
  
  // Calculate overall status
  const hasError = sources.some(s => s.status === "error");
  const hasPending = sources.some(s => s.status === "pending");
  const overallStatus: DocumentSource["status"] = hasError ? "error" : hasPending ? "pending" : "active";
  
  // Find latest sync time
  const latestSync = sources
    .filter(s => s.lastSync)
    .sort((a, b) => new Date(b.lastSync!).getTime() - new Date(a.lastSync!).getTime())[0]?.lastSync;

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
          <span className="text-sm font-medium">Синхронізація документів</span>
          {latestSync && (
            <span className="text-xs text-muted-foreground">
              {format(new Date(latestSync), "HH:mm", { locale: uk })}
            </span>
          )}
        </div>
      )}
      
      {/* Empty state or sources list */}
      {sources.length === 0 ? (
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
          
          {/* Sources list */}
          <ScrollArea className="h-[200px]" scrollbarVariant="thin">
            <div className="space-y-2">
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
                          {source.documentsCount !== undefined && ` · ${source.documentsCount} док.`}
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
            <DrawerTitle>Синхронізація</DrawerTitle>
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
