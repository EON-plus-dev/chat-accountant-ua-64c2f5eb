/**
 * SYNC PANEL - Nomenclature Synchronization UI
 * 
 * Панель синхронізації з зовнішніми системами
 * (1C, M.E.Doc, Vchasno)
 */

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Clock,
  History,
  Zap,
  ChevronRight,
} from "lucide-react";
import type { Cabinet } from "@/types/cabinet";
import type { NomenclatureItemV2, SyncSourceConfig, SyncConflict } from "@/config/nomenclatureConfig";
import {
  getSyncSourcesForCabinet,
  simulateSync,
  getSyncHistory,
  formatSyncTime,
  formatSyncDuration,
  getConflictFieldLabel,
  type SyncProgress,
  type SyncLogEntry,
} from "@/services/nomenclature/syncSimulator";
import { toast } from "sonner";

interface SyncPanelProps {
  cabinet: Cabinet;
  items: NomenclatureItemV2[];
  onSyncComplete?: (conflicts: SyncConflict[]) => void;
}

export const SyncPanel = ({ cabinet, items, onSyncComplete }: SyncPanelProps) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState<SyncProgress | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  
  const syncSources = getSyncSourcesForCabinet(cabinet.id);
  const syncHistory = getSyncHistory(cabinet.id);
  
  // No sync sources available
  if (syncSources.length === 0) {
    return null;
  }

  const handleSync = useCallback(async (source: SyncSourceConfig) => {
    setIsSyncing(true);
    setSyncProgress({ phase: "connecting", progress: 0, message: "Підключення..." });

    try {
      const result = await simulateSync(source, items, (progress) => {
        setSyncProgress(progress);
      });

      if (result.status === "success") {
        toast.success(`Синхронізацію з ${source.name} завершено`, {
          description: `Оновлено ${result.itemsUpdated} позицій за ${formatSyncDuration(result.duration)}`,
        });
      } else if (result.status === "partial") {
        toast.warning(`Знайдено конфлікти при синхронізації`, {
          description: `${result.conflicts.length} позицій потребують уваги`,
        });
        onSyncComplete?.(result.conflicts);
      } else {
        toast.error(`Помилка синхронізації з ${source.name}`, {
          description: "Спробуйте ще раз пізніше",
        });
      }
    } catch (error) {
      toast.error("Помилка синхронізації");
    } finally {
      setIsSyncing(false);
      setSyncProgress(null);
    }
  }, [items, onSyncComplete]);

  const getSourceStatusBadge = (source: SyncSourceConfig) => {
    switch (source.status) {
      case "connected":
        return (
          <Badge variant="outline" className="text-green-600 border-green-300 bg-green-50 dark:bg-green-950/30">
            <CheckCircle className="h-3 w-3 mr-1" />
            Підключено
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50 dark:bg-amber-950/30">
            <Clock className="h-3 w-3 mr-1" />
            Очікує
          </Badge>
        );
      case "error":
        return (
          <Badge variant="outline" className="text-red-600 border-red-300 bg-red-50 dark:bg-red-950/30">
            <XCircle className="h-3 w-3 mr-1" />
            Помилка
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            Відключено
          </Badge>
        );
    }
  };

  const getHistoryStatusIcon = (status: SyncLogEntry["status"]) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "partial":
        return <AlertTriangle className="h-4 w-4 text-amber-600" />;
      case "error":
        return <XCircle className="h-4 w-4 text-red-600" />;
    }
  };

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-transparent to-transparent">
      <CardContent className="p-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Sync Sources */}
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Zap className="h-4 w-4 text-primary shrink-0" />
            <span className="text-sm font-medium">Синхронізація:</span>
            
            <div className="flex flex-wrap gap-2">
              {syncSources.map((source) => (
                <Tooltip key={source.id}>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 gap-1.5"
                      onClick={() => handleSync(source)}
                      disabled={isSyncing || source.status !== "connected"}
                    >
                      <source.icon className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">{source.name}</span>
                      {source.status === "connected" && (
                        <RefreshCw className={`h-3 w-3 ${isSyncing ? "animate-spin" : ""}`} />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {getSourceStatusBadge(source)}
                      </div>
                      {source.lastSync && (
                        <p className="text-xs text-muted-foreground">
                          Останнє: {formatSyncTime(source.lastSync)}
                        </p>
                      )}
                      <p className="text-xs">
                        {source.itemsCount} позицій • {source.autoSync ? "Авто-синхронізація" : "Ручна"}
                      </p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </div>

          {/* History Button */}
          <Sheet open={historyOpen} onOpenChange={setHistoryOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-1.5">
                <History className="h-4 w-4" />
                <span className="hidden sm:inline">Історія</span>
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Історія синхронізацій</SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-4">
                {syncHistory.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Історія синхронізацій порожня
                  </p>
                ) : (
                  syncHistory.map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                    >
                      {getHistoryStatusIcon(entry.status)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{entry.sourceName}</span>
                          <span className="text-xs text-muted-foreground">
                            {formatSyncTime(entry.timestamp)}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {entry.status === "error" ? (
                            <span className="text-red-600">{entry.message}</span>
                          ) : (
                            <>
                              Оброблено: {entry.itemsProcessed} • 
                              Оновлено: {entry.itemsUpdated}
                              {entry.conflicts > 0 && (
                                <span className="text-amber-600"> • Конфліктів: {entry.conflicts}</span>
                              )}
                            </>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          Тривалість: {formatSyncDuration(entry.duration)}
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  ))
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Sync Progress */}
        {isSyncing && syncProgress && (
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{syncProgress.message}</span>
              <span className="font-mono text-xs">{syncProgress.progress}%</span>
            </div>
            <Progress value={syncProgress.progress} className="h-1.5" />
          </div>
        )}
      </CardContent>
    </Card>
  );
};
