import { useMemo, useState } from "react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  RefreshCw,
  Filter,
} from "lucide-react";
import { getSyncLogForCabinet, type SyncLogEntry } from "@/config/dataSourcesConfig";
import { format, formatDistanceToNow } from "date-fns";
import { uk } from "date-fns/locale";
import type { CabinetType } from "@/types/cabinet";

interface SyncLogSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cabinetType: CabinetType;
  connectionId?: string;
  connectionName?: string;
}

const statusConfig: Record<SyncLogEntry["status"], { icon: typeof CheckCircle; color: string; label: string }> = {
  success: { icon: CheckCircle, color: "text-green-600", label: "Успішно" },
  warning: { icon: AlertTriangle, color: "text-yellow-600", label: "Попередження" },
  error: { icon: XCircle, color: "text-destructive", label: "Помилка" },
};

export const SyncLogSheet = ({ 
  open, 
  onOpenChange, 
  cabinetType,
  connectionId, 
  connectionName 
}: SyncLogSheetProps) => {
  const [statusFilter, setStatusFilter] = useState<"all" | SyncLogEntry["status"]>("all");

  const allLogs = useMemo(() => getSyncLogForCabinet(cabinetType), [cabinetType]);

  // Filter logs
  const filteredLogs = useMemo(() => {
    let logs = allLogs;
    
    // Filter by connection if specified
    if (connectionId) {
      logs = logs.filter(log => log.connectionId === connectionId);
    }
    
    // Filter by status
    if (statusFilter !== "all") {
      logs = logs.filter(log => log.status === statusFilter);
    }
    
    return logs;
  }, [allLogs, connectionId, statusFilter]);

  // Stats
  const stats = useMemo(() => {
    const logs = connectionId ? allLogs.filter(l => l.connectionId === connectionId) : allLogs;
    return {
      success: logs.filter(l => l.status === "success").length,
      warning: logs.filter(l => l.status === "warning").length,
      error: logs.filter(l => l.status === "error").length,
    };
  }, [allLogs, connectionId]);

  const title = connectionName 
    ? `Журнал: ${connectionName}` 
    : "Журнал імпорту";

  const description = connectionName
    ? `Історія синхронізації для ${connectionName}`
    : "Всі операції синхронізації по підключеннях";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg">
        <SheetHeader className="space-y-1">
          <SheetTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            {title}
          </SheetTitle>
          <SheetDescription>{description}</SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {/* Stats summary */}
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>{stats.success}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <span>{stats.warning}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <XCircle className="h-4 w-4 text-destructive" />
              <span>{stats.error}</span>
            </div>
          </div>

          {/* Filter tabs */}
          <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">Всі</TabsTrigger>
              <TabsTrigger value="success">Успішні</TabsTrigger>
              <TabsTrigger value="warning">Попередж.</TabsTrigger>
              <TabsTrigger value="error">Помилки</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Log entries */}
          <ScrollArea className="h-[calc(100vh-280px)]">
            <div className="space-y-2 pr-4">
              {filteredLogs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-sm">Записів не знайдено</p>
                </div>
              ) : (
                filteredLogs.map((entry) => {
                  const status = statusConfig[entry.status];
                  const StatusIcon = status.icon;

                  return (
                    <div 
                      key={entry.id}
                      className="flex items-start justify-between gap-3 rounded-lg border p-3 hover:bg-muted/50 transition-all"
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <StatusIcon className={`h-4 w-4 shrink-0 mt-0.5 ${status.color}`} />
                        <div className="min-w-0 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-medium">{entry.source}</span>
                            <span className="text-xs text-muted-foreground">—</span>
                            <span className="text-sm">{entry.action}</span>
                          </div>
                          {entry.message && (
                            <p className="text-xs text-muted-foreground">{entry.message}</p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(entry.timestamp), "d MMM, HH:mm", { locale: uk })}
                            {" · "}
                            {formatDistanceToNow(new Date(entry.timestamp), { addSuffix: true, locale: uk })}
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        {entry.recordsAffected > 0 ? (
                          <Badge variant="secondary" className="text-xs">
                            +{entry.recordsAffected}
                          </Badge>
                        ) : entry.status === "error" ? (
                          <Button variant="ghost" size="icon" className="h-7 w-7">
                            <RefreshCw className="h-3.5 w-3.5" />
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default SyncLogSheet;
