/**
 * SYNC STATUS BADGE
 * 
 * Індикатор статусу синхронізації з зовнішньою системою
 */

import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CheckCircle, Clock, AlertTriangle, XCircle, Database, FileCheck, Globe } from "lucide-react";
import type { SyncMetadata, SyncStatus, SyncSource } from "@/config/nomenclatureConfig";
import {
  syncStatusLabels,
  syncStatusColors,
  syncSourceLabels,
} from "@/config/nomenclatureConfig";
import { formatSyncTime } from "@/services/nomenclature/syncSimulator";
import { cn } from "@/lib/utils";

interface SyncStatusBadgeProps {
  sync: SyncMetadata;
  compact?: boolean;
}

export const SyncStatusBadge = ({ sync, compact = false }: SyncStatusBadgeProps) => {
  const getStatusIcon = (status: SyncStatus) => {
    switch (status) {
      case "synced":
        return <CheckCircle className="h-3.5 w-3.5" />;
      case "pending":
        return <Clock className="h-3.5 w-3.5" />;
      case "conflict":
        return <AlertTriangle className="h-3.5 w-3.5" />;
      case "error":
        return <XCircle className="h-3.5 w-3.5" />;
    }
  };

  const getSourceIcon = (source: SyncSource) => {
    switch (source) {
      case "1c":
        return <Database className="h-3.5 w-3.5" />;
      case "medoc":
      case "vchasno":
        return <FileCheck className="h-3.5 w-3.5" />;
      case "api":
        return <Globe className="h-3.5 w-3.5" />;
      default:
        return null;
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

  if (compact) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={cn("cursor-default", syncStatusColors[sync.syncStatus])}>
            {getStatusIcon(sync.syncStatus)}
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              {getSourceIcon(sync.source)}
              <span className="font-medium">{syncSourceLabels[sync.source]}</span>
            </div>
            <p className="text-xs">{syncStatusLabels[sync.syncStatus]}</p>
            {sync.lastSyncAt && (
              <p className="text-xs text-muted-foreground">
                Останнє: {formatSyncTime(sync.lastSyncAt)}
              </p>
            )}
            {sync.conflictFields && sync.conflictFields.length > 0 && (
              <p className="text-xs text-orange-500">
                Конфлікт: {sync.conflictFields.join(", ")}
              </p>
            )}
            {sync.syncError && (
              <p className="text-xs text-red-500">{sync.syncError}</p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge
          variant="outline"
          className={cn(
            "gap-1 cursor-default",
            syncStatusColors[sync.syncStatus],
            getStatusBgColor(sync.syncStatus)
          )}
        >
          {getSourceIcon(sync.source)}
          {getStatusIcon(sync.syncStatus)}
        </Badge>
      </TooltipTrigger>
      <TooltipContent>
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            {getSourceIcon(sync.source)}
            <span className="font-medium">{syncSourceLabels[sync.source]}</span>
          </div>
          <p className="text-xs">{syncStatusLabels[sync.syncStatus]}</p>
          {sync.lastSyncAt && (
            <p className="text-xs text-muted-foreground">
              Останнє оновлення: {formatSyncTime(sync.lastSyncAt)}
            </p>
          )}
          {sync.externalId && (
            <p className="text-xs text-muted-foreground font-mono">
              ID: {sync.externalId}
            </p>
          )}
          {sync.conflictFields && sync.conflictFields.length > 0 && (
            <p className="text-xs text-orange-500">
              ⚠️ Конфлікт у полях: {sync.conflictFields.join(", ")}
            </p>
          )}
          {sync.syncError && (
            <p className="text-xs text-red-500">❌ {sync.syncError}</p>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  );
};
