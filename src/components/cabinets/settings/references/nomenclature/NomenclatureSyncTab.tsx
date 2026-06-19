/**
 * NOMENCLATURE SYNC TAB
 * 
 * Інформація про синхронізацію з зовнішніми системами
 */

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  RefreshCw,
  Database,
  FileCheck,
  Globe,
  CheckCircle,
  Clock,
  AlertTriangle,
  XCircle,
  Calendar,
  Link2,
  AlertCircle,
} from "lucide-react";
import type { NomenclatureItemV2, SyncStatus, SyncSource } from "@/config/nomenclatureConfig";
import {
  syncStatusLabels,
  syncStatusColors,
  syncSourceLabels,
} from "@/config/nomenclatureConfig";
import { formatSyncTime, getConflictFieldLabel } from "@/services/nomenclature/syncSimulator";
import { cn } from "@/lib/utils";

interface NomenclatureSyncTabProps {
  item: NomenclatureItemV2;
  onSync?: () => void;
}

export const NomenclatureSyncTab = ({ item, onSync }: NomenclatureSyncTabProps) => {
  const { sync } = item;

  const getSourceIcon = (source: SyncSource) => {
    switch (source) {
      case "1c":
        return <Database className="h-4 w-4" />;
      case "medoc":
      case "vchasno":
        return <FileCheck className="h-4 w-4" />;
      case "api":
        return <Globe className="h-4 w-4" />;
      default:
        return <Database className="h-4 w-4" />;
    }
  };

  const getStatusIcon = (status: SyncStatus) => {
    switch (status) {
      case "synced":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "pending":
        return <Clock className="h-4 w-4 text-amber-600" />;
      case "conflict":
        return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case "error":
        return <XCircle className="h-4 w-4 text-red-600" />;
    }
  };

  const getStatusBgColor = (status: SyncStatus): string => {
    switch (status) {
      case "synced":
        return "bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-800";
      case "pending":
        return "bg-amber-100 dark:bg-amber-900/30 border-amber-300 dark:border-amber-800";
      case "conflict":
        return "bg-orange-100 dark:bg-orange-900/30 border-orange-300 dark:border-orange-800";
      case "error":
        return "bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-800";
    }
  };

  const isManual = sync.source === "manual";

  return (
    <div className="space-y-4">
      {/* Sync Status Card */}
      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Статус синхронізації
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-4">
          {/* Status Badge */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Поточний статус</span>
            <Badge
              variant="outline"
              className={cn(
                "gap-1.5",
                syncStatusColors[sync.syncStatus],
                getStatusBgColor(sync.syncStatus)
              )}
            >
              {getStatusIcon(sync.syncStatus)}
              {syncStatusLabels[sync.syncStatus]}
            </Badge>
          </div>

          <Separator />

          {/* Source Info */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Джерело даних</span>
            <div className="flex items-center gap-2">
              {getSourceIcon(sync.source)}
              <span className="font-medium">{syncSourceLabels[sync.source]}</span>
            </div>
          </div>

          {/* External ID */}
          {sync.externalId && (
            <>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                  <Link2 className="h-3.5 w-3.5" />
                  Зовнішній ID
                </span>
                <Badge variant="outline" className="font-mono text-xs">
                  {sync.externalId}
                </Badge>
              </div>
            </>
          )}

          {/* Last Sync */}
          {sync.lastSyncAt && (
            <>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  Остання синхронізація
                </span>
                <span className="text-sm">{formatSyncTime(sync.lastSyncAt)}</span>
              </div>
            </>
          )}

          {/* Sync Button */}
          {!isManual && (
            <>
              <Separator />
              <Button
                onClick={onSync}
                className="w-full gap-2"
                variant={sync.syncStatus === "conflict" ? "destructive" : "default"}
              >
                <RefreshCw className="h-4 w-4" />
                {sync.syncStatus === "conflict" ? "Вирішити конфлікт" : "Синхронізувати зараз"}
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Conflict Details */}
      {sync.syncStatus === "conflict" && sync.conflictFields && sync.conflictFields.length > 0 && (
        <Card className="border-orange-300 dark:border-orange-800 bg-orange-50 dark:bg-orange-950/20">
          <CardHeader className="py-3">
            <CardTitle className="text-sm flex items-center gap-2 text-orange-700 dark:text-orange-400">
              <AlertTriangle className="h-4 w-4" />
              Конфліктуючі поля
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex flex-wrap gap-2">
              {sync.conflictFields.map((field) => (
                <Badge
                  key={field}
                  variant="outline"
                  className="text-orange-700 border-orange-400 bg-orange-100 dark:bg-orange-900/50"
                >
                  {getConflictFieldLabel(field)}
                </Badge>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Виберіть значення для кожного поля або використайте кнопку вище для автоматичного вирішення
            </p>
          </CardContent>
        </Card>
      )}

      {/* Error Details */}
      {sync.syncStatus === "error" && sync.syncError && (
        <Card className="border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950/20">
          <CardHeader className="py-3">
            <CardTitle className="text-sm flex items-center gap-2 text-red-700 dark:text-red-400">
              <XCircle className="h-4 w-4" />
              Помилка синхронізації
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm text-red-700 dark:text-red-400">{sync.syncError}</p>
            <p className="text-xs text-muted-foreground mt-2">
              Спробуйте синхронізувати ще раз або зверніться до підтримки
            </p>
          </CardContent>
        </Card>
      )}

      {/* Manual Source Notice */}
      {isManual && (
        <Card className="border-dashed">
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-muted-foreground shrink-0" />
              <div>
                <p className="text-sm font-medium">Ручне введення</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Ця позиція була створена вручну і не синхронізується з зовнішніми системами.
                  Підключіть 1C, M.E.Doc або Vchasno для автоматичного оновлення даних.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Field Mapping (for integration debugging) */}
      {sync.fieldMapping && Object.keys(sync.fieldMapping).length > 0 && (
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Link2 className="h-4 w-4" />
              Маппінг полів
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {Object.entries(sync.fieldMapping).map(([local, remote]) => (
                <div key={local} className="flex items-center justify-between text-xs">
                  <code className="px-1.5 py-0.5 bg-muted rounded">{local}</code>
                  <span className="text-muted-foreground">→</span>
                  <code className="px-1.5 py-0.5 bg-muted rounded">{remote}</code>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
