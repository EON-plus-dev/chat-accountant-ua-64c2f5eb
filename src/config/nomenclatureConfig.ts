/**
 * NOMENCLATURE CONFIGURATION - Enterprise Level
 * 
 * Розширена модель номенклатури для B2B-документообігу з підтримкою:
 * - Інтеграцій (1C, M.E.Doc, Vchasno)
 * - Товарного обліку (залишки, резервування)
 * - Логістики (вага, габарити)
 * - Цінових політик (тієри, знижки)
 */

import type { LucideIcon } from "lucide-react";
import { Database, FileCheck, Globe, RefreshCw } from "lucide-react";

// ============================================
// STOCK STATUS TYPES
// ============================================

export type StockStatus = "in-stock" | "limited" | "out-of-stock" | "on-order";

export const stockStatusLabels: Record<StockStatus, string> = {
  "in-stock": "В наявності",
  "limited": "Обмежено",
  "out-of-stock": "Немає",
  "on-order": "Замовлено",
};

export const stockStatusColors: Record<StockStatus, string> = {
  "in-stock": "text-green-600 dark:text-green-400",
  "limited": "text-amber-600 dark:text-amber-400",
  "out-of-stock": "text-red-600 dark:text-red-400",
  "on-order": "text-blue-600 dark:text-blue-400",
};

export const stockStatusBgColors: Record<StockStatus, string> = {
  "in-stock": "bg-green-100 dark:bg-green-900/30",
  "limited": "bg-amber-100 dark:bg-amber-900/30",
  "out-of-stock": "bg-red-100 dark:bg-red-900/30",
  "on-order": "bg-blue-100 dark:bg-blue-900/30",
};

export const stockStatusIcons: Record<StockStatus, string> = {
  "in-stock": "🟢",
  "limited": "🟡",
  "out-of-stock": "🔴",
  "on-order": "📦",
};

// ============================================
// STOCK INFO
// ============================================

export interface StockInfo {
  quantity: number;        // Поточний залишок
  reserved: number;        // Заброньовано
  available: number;       // Доступно = quantity - reserved
  reorderPoint: number;    // Точка перезамовлення
  status: StockStatus;     // Розрахований статус
  lastUpdated: string;     // ISO дата оновлення
  warehouse?: string;      // ID складу (для TOV)
  batchNumber?: string;    // Номер партії
  expirationDate?: string; // Термін придатності
}

// Calculate stock status based on quantity and reorder point
export const calculateStockStatus = (
  available: number,
  reorderPoint: number,
  onOrder?: boolean
): StockStatus => {
  if (onOrder) return "on-order";
  if (available <= 0) return "out-of-stock";
  if (available <= reorderPoint) return "limited";
  return "in-stock";
};

// ============================================
// LOGISTICS INFO
// ============================================

export interface Dimensions {
  length: number;  // см
  width: number;   // см
  height: number;  // см
}

export interface LogisticsInfo {
  weight?: number;             // Вага в кг
  dimensions?: Dimensions;     // Габарити в см
  volumeWeight?: number;       // Об'ємна вага
  packagingType?: string;      // Тип упаковки
  storageConditions?: string;  // Умови зберігання
  shelfLife?: number;          // Термін придатності (днів)
  hazardClass?: string;        // Клас небезпеки
  temperatureRange?: string;   // Температурний режим
  countryOfOrigin?: string;    // Країна походження
}

// Calculate volume weight (for shipping)
export const calculateVolumeWeight = (dimensions: Dimensions, divisor = 5000): number => {
  return (dimensions.length * dimensions.width * dimensions.height) / divisor;
};

// ============================================
// PRICING INFO
// ============================================

export type VatRate = 0 | 7 | 20;

export interface PriceTier {
  minQuantity: number;
  price: number;
  description?: string;
}

export interface PricingInfo {
  // Базові поля продажу
  basePrice: number;               // Ціна продажу без ПДВ
  currency: string;                // Валюта продажу (UAH, USD, EUR)
  vatRate: VatRate;                // Ставка ПДВ
  priceWithVat: number;            // Ціна з ПДВ
  priceTiers?: PriceTier[];        // Цінові рівні (опт)
  lastPriceChange?: string;        // Дата останньої зміни ціни
  minMargin?: number;              // Мінімальна маржа %
  recommendedPrice?: number;       // Рекомендована ціна (застаріле, див. recommendedRetailPrice)
  
  // НОВІ поля закупівлі та маржі
  purchasePrice?: number;          // Закупівельна ціна без ПДВ
  purchaseCurrency?: string;       // Валюта закупівлі
  purchaseVatRate?: VatRate;       // ПДВ при закупівлі
  marginAmount?: number;           // Маржа в грошах (basePrice - purchasePrice)
  marginPercent?: number;          // Маржа у % ((basePrice - purchasePrice) / purchasePrice * 100)
  minSalePrice?: number;           // Мінімальна ціна продажу (нижче маржі)
  recommendedRetailPrice?: number; // РРЦ (рекомендована роздрібна ціна)
}

// Calculate price with VAT
export const calculatePriceWithVat = (basePrice: number, vatRate: VatRate): number => {
  return basePrice * (1 + vatRate / 100);
};

// Get price for quantity (considering tiers)
export const getPriceForQuantity = (pricing: PricingInfo, quantity: number): number => {
  if (!pricing.priceTiers || pricing.priceTiers.length === 0) {
    return pricing.basePrice;
  }
  
  // Find applicable tier (highest minQuantity that quantity meets)
  const applicableTier = pricing.priceTiers
    .filter(tier => quantity >= tier.minQuantity)
    .sort((a, b) => b.minQuantity - a.minQuantity)[0];
  
  return applicableTier?.price || pricing.basePrice;
};

// ============================================
// SYNC METADATA
// ============================================

export type SyncSource = "manual" | "1c" | "medoc" | "vchasno" | "api";
export type SyncStatus = "synced" | "pending" | "conflict" | "error";

export const syncSourceLabels: Record<SyncSource, string> = {
  manual: "Вручну",
  "1c": "1С:Бухгалтерія",
  medoc: "M.E.Doc",
  vchasno: "Vchasno",
  api: "API",
};

export const syncSourceIcons: Record<SyncSource, LucideIcon> = {
  manual: Database,
  "1c": Database,
  medoc: FileCheck,
  vchasno: FileCheck,
  api: Globe,
};

export const syncStatusLabels: Record<SyncStatus, string> = {
  synced: "Синхронізовано",
  pending: "Очікує",
  conflict: "Конфлікт",
  error: "Помилка",
};

export const syncStatusColors: Record<SyncStatus, string> = {
  synced: "text-green-600 dark:text-green-400",
  pending: "text-amber-600 dark:text-amber-400",
  conflict: "text-orange-600 dark:text-orange-400",
  error: "text-red-600 dark:text-red-400",
};

export const syncStatusIcons: Record<SyncStatus, string> = {
  synced: "✅",
  pending: "🔄",
  conflict: "⚠️",
  error: "❌",
};

export interface SyncMetadata {
  externalId?: string;       // ID в зовнішній системі
  source: SyncSource;
  lastSyncAt?: string;       // Остання синхронізація
  syncStatus: SyncStatus;
  conflictFields?: string[]; // Поля з конфліктами
  syncError?: string;        // Опис помилки
  fieldMapping?: Record<string, string>; // Маппінг полів
}

// ============================================
// PRODUCT SERVICE INFO (WARRANTY & RETURNS)
// ============================================

export type WarrantyType = "manufacturer" | "seller" | "extended";
export type ReturnPolicy = "full" | "exchange" | "none";

export const warrantyTypeLabels: Record<WarrantyType, string> = {
  manufacturer: "Гарантія виробника",
  seller: "Гарантія продавця",
  extended: "Розширена гарантія",
};

export const returnPolicyLabels: Record<ReturnPolicy, string> = {
  full: "Повне повернення",
  exchange: "Тільки обмін",
  none: "Без повернення",
};

export interface ProductServiceInfo {
  // Гарантія
  warrantyMonths?: number;          // Гарантійний термін (міс)
  warrantyType?: WarrantyType;
  warrantyNotes?: string;           // Умови гарантії

  // Повернення
  returnDays?: number;              // Термін повернення (днів)
  returnPolicy?: ReturnPolicy;
  returnNotes?: string;             // Умови повернення

  // Після-гарантійний сервіс
  afterWarrantyService?: boolean;
  serviceCenter?: string;           // Назва сервісного центру
  serviceCenterContact?: string;    // Контакти сервісу
  
  // Сертифікація
  certificates?: string[];          // Сертифікати якості
  expirationDate?: string;          // Термін придатності (для товарів)
}

// ============================================
// NOMENCLATURE ITEM V2 (ENTERPRISE)
// ============================================

export interface NomenclatureItemV2 {
  // Ідентифікація
  id: string;
  sku: string;               // Внутрішній артикул
  barcode?: string;          // EAN-13 / UPC
  uktzedCode?: string;       // Код УКТ ЗЕД (10 цифр: 0000 00 00 00)
  vendorCode?: string;       // Артикул постачальника
  
  // Базова інформація
  name: string;
  shortName?: string;        // Коротка назва для документів
  description?: string;
  
  // Класифікація
  category: "service" | "product";
  categoryId?: string;       // ID категорії номенклатури
  tags?: string[];
  
  // Одиниці виміру
  unitCode: string;          // Код з unitsConfig
  unitAlt?: string;          // Альтернативна одиниця
  conversionRate?: number;   // Коефіцієнт конвертації
  
  // Вкладені об'єкти
  pricing: PricingInfo;
  stock?: StockInfo;         // Тільки для товарів
  logistics?: LogisticsInfo; // Опціонально
  sync: SyncMetadata;
  productService?: ProductServiceInfo; // Гарантія, повернення, сервіс
  
  // Стан
  isActive: boolean;
  isArchived?: boolean;
  isFavorite?: boolean;      // Часто використовуваний
  createdAt: string;
  updatedAt: string;
}

// ============================================
// SYNC SOURCE CONFIGURATION
// ============================================

export interface SyncSourceConfig {
  id: string;
  name: string;
  icon: LucideIcon;
  type: SyncSource;
  status: "connected" | "pending" | "error" | "disconnected";
  lastSync?: string;
  itemsCount: number;
  autoSync: boolean;
  syncInterval?: number; // minutes
}

// ============================================
// SYNC RESULT
// ============================================

export interface SyncConflict {
  itemId: string;
  itemName: string;
  field: string;
  localValue: unknown;
  remoteValue: unknown;
  resolution?: "local" | "remote" | "manual";
}

export interface SyncResult {
  source: SyncSource;
  status: "success" | "partial" | "error";
  itemsProcessed: number;
  itemsCreated: number;
  itemsUpdated: number;
  itemsSkipped: number;
  conflicts: SyncConflict[];
  duration: number;    // мс
  timestamp: string;
}

// ============================================
// RESERVATION
// ============================================

export type ReservationStatus = "active" | "released" | "expired" | "converted";

export interface Reservation {
  id: string;
  itemId: string;
  itemName: string;
  quantity: number;
  documentId: string;
  documentType: string;
  documentNumber?: string;
  createdAt: string;
  expiresAt?: string;
  status: ReservationStatus;
  releasedAt?: string;
  releasedReason?: string;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Convert legacy NomenclatureItem to V2
 */
export const convertToV2 = (
  legacy: {
    id: string;
    name: string;
    code?: string;
    unit: string;
    price: number;
    currency?: string;
    vatRate?: VatRate;
    category: "service" | "product";
    description?: string;
    isActive?: boolean;
  }
): NomenclatureItemV2 => {
  const vatRate = legacy.vatRate || 0;
  const basePrice = legacy.price;
  
  return {
    id: legacy.id,
    sku: legacy.code || `SKU-${legacy.id}`,
    name: legacy.name,
    description: legacy.description,
    category: legacy.category,
    unitCode: legacy.unit,
    pricing: {
      basePrice,
      currency: legacy.currency || "UAH",
      vatRate,
      priceWithVat: calculatePriceWithVat(basePrice, vatRate),
    },
    sync: {
      source: "manual",
      syncStatus: "synced",
    },
    isActive: legacy.isActive ?? true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
};

/**
 * Convert V2 to legacy format for backward compatibility
 */
export const convertToLegacy = (
  item: NomenclatureItemV2
): {
  id: string;
  name: string;
  code?: string;
  unit: string;
  price: number;
  currency?: string;
  vatRate?: VatRate;
  category: "service" | "product";
  description?: string;
  isActive?: boolean;
} => ({
  id: item.id,
  name: item.name,
  code: item.sku,
  unit: item.unitCode,
  price: item.pricing.basePrice,
  currency: item.pricing.currency,
  vatRate: item.pricing.vatRate,
  category: item.category,
  description: item.description,
  isActive: item.isActive,
});

/**
 * Format price for display
 */
export const formatNomenclaturePrice = (
  price: number,
  currency = "UAH"
): string => {
  return new Intl.NumberFormat("uk-UA", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(price);
};

/**
 * Get stock indicator for display
 */
export const getStockIndicator = (stock?: StockInfo): {
  icon: string;
  label: string;
  color: string;
  bgColor: string;
} => {
  if (!stock) {
    return {
      icon: "➖",
      label: "Послуга",
      color: "text-muted-foreground",
      bgColor: "bg-muted",
    };
  }
  
  return {
    icon: stockStatusIcons[stock.status],
    label: `${stock.available} ${stockStatusLabels[stock.status].toLowerCase()}`,
    color: stockStatusColors[stock.status],
    bgColor: stockStatusBgColors[stock.status],
  };
};

/**
 * Get sync status indicator
 */
export const getSyncIndicator = (sync: SyncMetadata): {
  icon: string;
  label: string;
  color: string;
  source: string;
} => ({
  icon: syncStatusIcons[sync.syncStatus],
  label: syncStatusLabels[sync.syncStatus],
  color: syncStatusColors[sync.syncStatus],
  source: syncSourceLabels[sync.source],
});

/**
 * Validate EAN-13 barcode
 */
export const validateEAN13 = (barcode: string): boolean => {
  if (!/^\d{13}$/.test(barcode)) return false;
  
  const digits = barcode.split("").map(Number);
  const checksum = digits.slice(0, 12).reduce((sum, digit, index) => {
    return sum + digit * (index % 2 === 0 ? 1 : 3);
  }, 0);
  
  const checkDigit = (10 - (checksum % 10)) % 10;
  return checkDigit === digits[12];
};

/**
 * Generate mock barcode (for demo)
 */
export const generateMockBarcode = (prefix = "482"): string => {
  const random = Math.random().toString().slice(2, 12);
  const partial = prefix + random.slice(0, 9);
  
  const digits = partial.split("").map(Number);
  const checksum = digits.reduce((sum, digit, index) => {
    return sum + digit * (index % 2 === 0 ? 1 : 3);
  }, 0);
  
  const checkDigit = (10 - (checksum % 10)) % 10;
  return partial + checkDigit;
};
