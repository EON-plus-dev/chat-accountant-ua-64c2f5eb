/**
 * NOMENCLATURE SYNC SIMULATOR
 * 
 * Імітація інтеграцій з 1C, M.E.Doc, Vchasno
 * з реалістичними затримками, результатами та конфліктами
 */

import type {
  NomenclatureItemV2,
  SyncSource,
  SyncResult,
  SyncConflict,
  SyncSourceConfig,
} from "@/config/nomenclatureConfig";
import { Database, FileCheck, Globe } from "lucide-react";

// ============================================
// SYNC DELAYS (REALISTIC)
// ============================================

const SYNC_DELAYS: Record<SyncSource, { min: number; max: number }> = {
  "1c": { min: 1200, max: 3000 },      // 1C повільніший
  "medoc": { min: 600, max: 1500 },    // M.E.Doc швидше
  "vchasno": { min: 400, max: 1000 },  // Vchasno найшвидший
  "api": { min: 300, max: 800 },       // API direct
  "manual": { min: 100, max: 300 },    // Manual is instant
};

// ============================================
// SYNC OUTCOMES PROBABILITIES
// ============================================

const SYNC_OUTCOMES = {
  success: 0.80,      // 80% — повний успіх
  partial: 0.12,      // 12% — частковий успіх
  error: 0.08,        // 8% — помилка
};

// ============================================
// SYNC SOURCE CONFIGURATIONS
// ============================================

export const getSyncSourcesForCabinet = (cabinetId: string): SyncSourceConfig[] => {
  switch (cabinetId) {
    case "demo-consulting-3":
      return [
        {
          id: "1c-consulting",
          name: "1С:Бухгалтерія",
          icon: Database,
          type: "1c",
          status: "connected",
          lastSync: "2025-01-28T06:00:00Z",
          itemsCount: 8,
          autoSync: true,
          syncInterval: 60,
        },
        {
          id: "medoc-consulting",
          name: "M.E.Doc",
          icon: FileCheck,
          type: "medoc",
          status: "connected",
          lastSync: "2025-01-25T12:00:00Z",
          itemsCount: 2,
          autoSync: false,
        },
      ];

    case "demo-autorepair-2":
      return [
        {
          id: "1c-autorepair",
          name: "1С:Підприємство",
          icon: Database,
          type: "1c",
          status: "connected",
          lastSync: "2025-01-28T07:00:00Z",
          itemsCount: 10,
          autoSync: true,
          syncInterval: 30,
        },
      ];

    case "demo-it-3":
      return [
        {
          id: "vchasno-it",
          name: "Vchasno",
          icon: FileCheck,
          type: "vchasno",
          status: "connected",
          lastSync: "2025-01-27T16:00:00Z",
          itemsCount: 1,
          autoSync: false,
        },
        {
          id: "api-it",
          name: "Upwork API",
          icon: Globe,
          type: "api",
          status: "connected",
          lastSync: "2025-01-28T10:00:00Z",
          itemsCount: 2,
          autoSync: true,
          syncInterval: 120,
        },
      ];

    case "demo-dealer-2":
      return [
        {
          id: "1c-dealer",
          name: "1С:Торгівля",
          icon: Database,
          type: "1c",
          status: "connected",
          lastSync: "2025-01-28T06:00:00Z",
          itemsCount: 9,
          autoSync: true,
          syncInterval: 15,
        },
      ];

    default:
      return [];
  }
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

const getRandomDelay = (source: SyncSource): number => {
  const { min, max } = SYNC_DELAYS[source];
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const getRandomOutcome = (): "success" | "partial" | "error" => {
  const rand = Math.random();
  if (rand < SYNC_OUTCOMES.success) return "success";
  if (rand < SYNC_OUTCOMES.success + SYNC_OUTCOMES.partial) return "partial";
  return "error";
};

// ============================================
// CONFLICT GENERATION
// ============================================

const CONFLICT_FIELDS = [
  "pricing.basePrice",
  "stock.quantity",
  "stock.reserved",
  "name",
  "description",
  "isActive",
];

const generateMockConflicts = (
  items: NomenclatureItemV2[],
  maxConflicts = 3
): SyncConflict[] => {
  // 10-20% of items may have conflicts
  const conflictCount = Math.min(
    maxConflicts,
    Math.floor(items.length * (0.1 + Math.random() * 0.1))
  );

  if (conflictCount === 0) return [];

  const shuffled = [...items].sort(() => Math.random() - 0.5);
  const conflictItems = shuffled.slice(0, conflictCount);

  return conflictItems.map((item) => {
    const field = CONFLICT_FIELDS[Math.floor(Math.random() * CONFLICT_FIELDS.length)];
    
    let localValue: unknown;
    let remoteValue: unknown;

    switch (field) {
      case "pricing.basePrice":
        localValue = item.pricing.basePrice;
        remoteValue = Math.round(item.pricing.basePrice * (0.9 + Math.random() * 0.2));
        break;
      case "stock.quantity":
        localValue = item.stock?.quantity ?? 0;
        remoteValue = Math.floor(Math.random() * 50);
        break;
      case "stock.reserved":
        localValue = item.stock?.reserved ?? 0;
        remoteValue = Math.floor(Math.random() * 10);
        break;
      case "name":
        localValue = item.name;
        remoteValue = item.name + " (оновлено)";
        break;
      case "description":
        localValue = item.description || "—";
        remoteValue = "Оновлений опис товару";
        break;
      case "isActive":
        localValue = item.isActive;
        remoteValue = !item.isActive;
        break;
      default:
        localValue = "—";
        remoteValue = "—";
    }

    return {
      itemId: item.id,
      itemName: item.name,
      field,
      localValue,
      remoteValue,
    };
  });
};

// ============================================
// SYNC LOG HISTORY
// ============================================

export interface SyncLogEntry {
  id: string;
  source: SyncSource;
  sourceName: string;
  timestamp: string;
  status: "success" | "partial" | "error";
  itemsProcessed: number;
  itemsCreated: number;
  itemsUpdated: number;
  conflicts: number;
  duration: number;
  message?: string;
}

const syncHistoryCache: Record<string, SyncLogEntry[]> = {};

export const getSyncHistory = (cabinetId: string): SyncLogEntry[] => {
  if (syncHistoryCache[cabinetId]) {
    return syncHistoryCache[cabinetId];
  }

  // Generate initial demo history
  const history: SyncLogEntry[] = [
    {
      id: "sync-1",
      source: "1c",
      sourceName: "1С:Бухгалтерія",
      timestamp: "2025-01-28T06:00:00Z",
      status: "success",
      itemsProcessed: 45,
      itemsCreated: 0,
      itemsUpdated: 3,
      conflicts: 0,
      duration: 2150,
    },
    {
      id: "sync-2",
      source: "1c",
      sourceName: "1С:Бухгалтерія",
      timestamp: "2025-01-27T18:00:00Z",
      status: "partial",
      itemsProcessed: 45,
      itemsCreated: 0,
      itemsUpdated: 5,
      conflicts: 2,
      duration: 2800,
      message: "2 конфлікти потребують вирішення",
    },
    {
      id: "sync-3",
      source: "medoc",
      sourceName: "M.E.Doc",
      timestamp: "2025-01-25T12:00:00Z",
      status: "success",
      itemsProcessed: 8,
      itemsCreated: 0,
      itemsUpdated: 1,
      conflicts: 0,
      duration: 890,
    },
    {
      id: "sync-4",
      source: "1c",
      sourceName: "1С:Бухгалтерія",
      timestamp: "2025-01-26T06:00:00Z",
      status: "error",
      itemsProcessed: 0,
      itemsCreated: 0,
      itemsUpdated: 0,
      conflicts: 0,
      duration: 5200,
      message: "Помилка з'єднання з сервером 1С",
    },
  ];

  syncHistoryCache[cabinetId] = history;
  return history;
};

// ============================================
// MAIN SYNC SIMULATOR
// ============================================

export interface SyncProgress {
  phase: "connecting" | "fetching" | "comparing" | "applying" | "done";
  progress: number; // 0-100
  message: string;
}

export type SyncProgressCallback = (progress: SyncProgress) => void;

export const simulateSync = async (
  source: SyncSourceConfig,
  items: NomenclatureItemV2[],
  onProgress?: SyncProgressCallback
): Promise<SyncResult> => {
  const startTime = Date.now();
  const sourceType = source.type;
  const delay = getRandomDelay(sourceType);
  const stepDelay = delay / 5;

  // Phase 1: Connecting
  onProgress?.({
    phase: "connecting",
    progress: 0,
    message: `Підключення до ${source.name}...`,
  });
  await sleep(stepDelay);

  // Phase 2: Fetching
  onProgress?.({
    phase: "fetching",
    progress: 25,
    message: `Отримання даних з ${source.name}...`,
  });
  await sleep(stepDelay);

  // Phase 3: Comparing
  onProgress?.({
    phase: "comparing",
    progress: 50,
    message: `Порівняння ${items.length} позицій...`,
  });
  await sleep(stepDelay);

  // Determine outcome
  const outcome = getRandomOutcome();
  
  // Generate conflicts for partial success
  const conflicts = outcome === "partial" ? generateMockConflicts(items) : [];

  // Phase 4: Applying
  onProgress?.({
    phase: "applying",
    progress: 75,
    message: outcome === "error" 
      ? "Помилка синхронізації..." 
      : `Застосування змін...`,
  });
  await sleep(stepDelay);

  // Phase 5: Done
  const duration = Date.now() - startTime;
  
  onProgress?.({
    phase: "done",
    progress: 100,
    message: outcome === "success" 
      ? "Синхронізацію завершено" 
      : outcome === "partial"
        ? `Знайдено ${conflicts.length} конфліктів`
        : "Помилка синхронізації",
  });

  // Calculate results
  const itemsUpdated = outcome === "error" ? 0 : Math.floor(items.length * 0.1);
  const itemsSkipped = outcome === "error" ? items.length : conflicts.length;

  const result: SyncResult = {
    source: sourceType,
    status: outcome,
    itemsProcessed: outcome === "error" ? 0 : items.length,
    itemsCreated: 0,
    itemsUpdated,
    itemsSkipped,
    conflicts,
    duration,
    timestamp: new Date().toISOString(),
  };

  // Add to history
  const history = getSyncHistory("current");
  history.unshift({
    id: `sync-${Date.now()}`,
    source: sourceType,
    sourceName: source.name,
    timestamp: result.timestamp,
    status: outcome,
    itemsProcessed: result.itemsProcessed,
    itemsCreated: result.itemsCreated,
    itemsUpdated: result.itemsUpdated,
    conflicts: conflicts.length,
    duration,
    message: outcome === "error" 
      ? "Помилка з'єднання" 
      : outcome === "partial" 
        ? `${conflicts.length} конфліктів` 
        : undefined,
  });

  return result;
};

// ============================================
// CONFLICT RESOLUTION
// ============================================

export const simulateConflictResolution = async (
  conflict: SyncConflict,
  resolution: "local" | "remote",
  item: NomenclatureItemV2
): Promise<NomenclatureItemV2> => {
  await sleep(300 + Math.random() * 200);

  if (resolution === "local") {
    // Keep local value, just update sync status
    return {
      ...item,
      sync: {
        ...item.sync,
        syncStatus: "synced",
        conflictFields: undefined,
        lastSyncAt: new Date().toISOString(),
      },
      updatedAt: new Date().toISOString(),
    };
  }

  // Apply remote value
  const updated = { ...item };
  
  switch (conflict.field) {
    case "pricing.basePrice":
      updated.pricing = {
        ...updated.pricing,
        basePrice: conflict.remoteValue as number,
        priceWithVat: (conflict.remoteValue as number) * (1 + updated.pricing.vatRate / 100),
      };
      break;
    case "stock.quantity":
      if (updated.stock) {
        updated.stock = {
          ...updated.stock,
          quantity: conflict.remoteValue as number,
          available: (conflict.remoteValue as number) - updated.stock.reserved,
        };
      }
      break;
    case "stock.reserved":
      if (updated.stock) {
        updated.stock = {
          ...updated.stock,
          reserved: conflict.remoteValue as number,
          available: updated.stock.quantity - (conflict.remoteValue as number),
        };
      }
      break;
    case "name":
      updated.name = conflict.remoteValue as string;
      break;
    case "description":
      updated.description = conflict.remoteValue as string;
      break;
    case "isActive":
      updated.isActive = conflict.remoteValue as boolean;
      break;
  }

  updated.sync = {
    ...updated.sync,
    syncStatus: "synced",
    conflictFields: undefined,
    lastSyncAt: new Date().toISOString(),
  };
  updated.updatedAt = new Date().toISOString();

  return updated;
};

// ============================================
// BULK CONFLICT RESOLUTION
// ============================================

export const simulateBulkResolution = async (
  conflicts: SyncConflict[],
  resolution: "local" | "remote",
  items: NomenclatureItemV2[]
): Promise<NomenclatureItemV2[]> => {
  await sleep(500 + conflicts.length * 100);

  const itemsMap = new Map(items.map((item) => [item.id, item]));

  for (const conflict of conflicts) {
    const item = itemsMap.get(conflict.itemId);
    if (item) {
      const resolved = await simulateConflictResolution(conflict, resolution, item);
      itemsMap.set(conflict.itemId, resolved);
    }
  }

  return Array.from(itemsMap.values());
};

// ============================================
// FORMAT HELPERS
// ============================================

export const formatSyncDuration = (ms: number): string => {
  if (ms < 1000) return `${ms}мс`;
  return `${(ms / 1000).toFixed(1)}с`;
};

export const formatSyncTime = (isoString: string): string => {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Щойно";
  if (diffMins < 60) return `${diffMins} хв тому`;
  if (diffHours < 24) return `${diffHours} год тому`;
  if (diffDays === 1) return "Вчора";
  
  return date.toLocaleDateString("uk-UA", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const getConflictFieldLabel = (field: string): string => {
  const labels: Record<string, string> = {
    "pricing.basePrice": "Базова ціна",
    "stock.quantity": "Залишок",
    "stock.reserved": "Резерв",
    "name": "Назва",
    "description": "Опис",
    "isActive": "Статус активності",
  };
  return labels[field] || field;
};
