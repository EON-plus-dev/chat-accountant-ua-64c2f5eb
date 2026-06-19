// Уніфікована конфігурація джерел даних для всього проекту
// Замінює окремі реалізації в overviewConfig, DocumentSyncButton, incomeBookConfig

import { 
  CreditCard, 
  Building2, 
  FileCheck, 
  BarChart3, 
  FileText, 
  Receipt,
  Wallet,
  type LucideIcon 
} from "lucide-react";
import type { CabinetType } from "@/types/cabinet";

// Уніфіковані статуси джерел даних
export type DataSourceStatus = "active" | "pending" | "error" | "inactive";

// Категорії джерел даних
export type DataSourceCategory = "bank" | "edo" | "government" | "accounting" | "payment" | "prro";

// Типи автентифікації
export type AuthType = "oauth" | "api_key" | "token" | "credentials";

// Поле для автентифікації
export interface AuthField {
  name: string;
  label: string;
  type: "text" | "password" | "email";
  placeholder?: string;
  required: boolean;
  validation?: {
    pattern?: string;
    minLength?: number;
    maxLength?: number;
    errorMessage?: string;
  };
}

// Конфігурація автентифікації
export interface AuthConfig {
  type: AuthType;
  fields?: AuthField[];
  instructions?: string;
  oauthUrl?: string;
  testEndpoint?: string;
}

// Типи помилок
export type ErrorType = "auth_expired" | "rate_limit" | "invalid_credentials" | "service_unavailable" | "unknown";

// Проблема якості даних
export interface DataQualityIssue {
  type: string;
  label: string;
  count: number;
  priority: number;
  color: string;
}

// Частота синхронізації
export type SyncFrequency = "manual" | "15min" | "1h" | "6h" | "daily";

// Уніфікований інтерфейс джерела даних
export interface DataSource {
  id: string;
  name: string;
  icon: LucideIcon;
  category: DataSourceCategory;
  status: DataSourceStatus;
  lastSync?: string;
  recordsCount?: number;
  dataQualityPercent?: number;
  dataQualityIssues?: DataQualityIssue[];
  error?: string;
  errorType?: ErrorType;
  errorDetails?: string;
  description?: string;
  features?: string[];
  auth?: AuthConfig;
  syncFrequency?: SyncFrequency;
  createdAt?: string;
  lastCredentialsUpdate?: string;
}

// Інтерфейс запису журналу синхронізації
export interface SyncLogEntry {
  id: string;
  connectionId?: string;
  timestamp: string;
  source: string;
  action: string;
  recordsAffected: number;
  status: "success" | "warning" | "error";
  message?: string;
}

// Категорія labels
export const categoryLabels: Record<DataSourceCategory, string> = {
  bank: "Банки",
  edo: "Електронний документообіг",
  government: "Державні сервіси",
  accounting: "Облікові системи",
  payment: "Платіжні системи",
  prro: "ПРРО/Каси",
};

// Конфігурація індикаторів статусу
export const getStatusIndicator = (status: DataSourceStatus) => ({
  dot: status === "active" ? "bg-emerald-500" 
     : status === "pending" ? "bg-amber-500"
     : status === "error" ? "bg-red-500"
     : "bg-muted-foreground/40",
  label: status === "active" ? "Активна"
       : status === "pending" ? "Очікує"
       : status === "error" ? "Помилка"
       : "Неактивна",
});

export const getStatusColor = (status: DataSourceStatus) => {
  switch (status) {
    case "active": return "bg-emerald-500";
    case "pending": return "bg-amber-500";
    case "error": return "bg-red-500";
    case "inactive": return "bg-muted-foreground/40";
    default: return "bg-muted-foreground/40";
  }
};

// Обчислення загального статусу
export const getOverallStatus = (sources: DataSource[]): DataSourceStatus => {
  const hasError = sources.some(s => s.status === "error");
  const hasPending = sources.some(s => s.status === "pending");
  if (hasError) return "error";
  if (hasPending) return "pending";
  return "active";
};

// Знайти останню синхронізацію
export const getLatestSync = (sources: DataSource[]): string | undefined => {
  return sources
    .filter(s => s.lastSync)
    .sort((a, b) => new Date(b.lastSync!).getTime() - new Date(a.lastSync!).getTime())[0]?.lastSync;
};

// Мітки частоти синхронізації
export const syncFrequencyLabels: Record<SyncFrequency, string> = {
  manual: "Вручну",
  "15min": "Кожні 15 хвилин",
  "1h": "Кожну годину",
  "6h": "Кожні 6 годин",
  daily: "Раз на день",
};

// ============= Джерела для документообігу =============
const documentSourcesTov: DataSource[] = [
  { 
    id: "medoc", 
    name: "M.E.Doc", 
    icon: FileCheck, 
    category: "edo", 
    status: "active", 
    lastSync: "2025-12-15T10:00:00", 
    recordsCount: 423, 
    dataQualityPercent: 98,
    dataQualityIssues: [
      { type: "missing_iban", label: "Без IBAN", count: 3, priority: 1, color: "bg-yellow-500" },
      { type: "duplicate", label: "Дублікати", count: 2, priority: 2, color: "bg-orange-500" },
    ],
    description: "Електронний документообіг та звітність",
    syncFrequency: "1h",
    createdAt: "2024-06-15T10:00:00",
    lastCredentialsUpdate: "2025-01-10T14:30:00",
  },
  { 
    id: "1c", 
    name: "1С:Бухгалтерія", 
    icon: BarChart3, 
    category: "accounting", 
    status: "active", 
    lastSync: "2025-12-15T06:00:00", 
    recordsCount: 1520, 
    dataQualityPercent: 87,
    dataQualityIssues: [
      { type: "missing_category", label: "Без категорії", count: 45, priority: 1, color: "bg-yellow-500" },
      { type: "invalid_amount", label: "Некоректна сума", count: 12, priority: 2, color: "bg-red-500" },
      { type: "missing_contractor", label: "Без контрагента", count: 8, priority: 3, color: "bg-orange-500" },
    ],
    description: "Облік та синхронізація залишків",
    syncFrequency: "6h",
    createdAt: "2024-03-20T09:00:00",
    lastCredentialsUpdate: "2025-02-15T11:00:00",
  },
  { 
    id: "tax-register", 
    name: "Реєстр ПН ДПС", 
    icon: FileText, 
    category: "government", 
    status: "active", 
    lastSync: "2025-12-15T09:30:00", 
    recordsCount: 89, 
    dataQualityPercent: 100, 
    description: "Реєстр податкових накладних",
    syncFrequency: "daily",
    createdAt: "2024-01-15T08:00:00",
  },
  { 
    id: "vchasno", 
    name: "Vchasno", 
    icon: FileText, 
    category: "edo", 
    status: "pending", 
    error: "Очікує підтвердження авторизації",
    description: "Альтернативний ЕДО",
    createdAt: "2025-12-10T16:00:00",
  },
  { 
    id: "bank-statements", 
    name: "Банківські виписки", 
    icon: Building2, 
    category: "bank", 
    status: "error",
    error: "Токен авторизації застарів",
    errorType: "auth_expired",
    errorDetails: "Термін дії токена сплив 2 дні тому. Необхідна повторна авторизація через особистий кабінет банку.",
    lastSync: "2025-12-13T08:00:00", 
    recordsCount: 156, 
    dataQualityPercent: 95, 
    description: "Імпорт з декількох банків",
    syncFrequency: "15min",
    createdAt: "2024-02-01T10:00:00",
    lastCredentialsUpdate: "2025-11-01T09:00:00",
  },
];

const documentSourcesFop: DataSource[] = [
  { id: "vchasno", name: "Vchasno", icon: FileText, category: "edo", status: "active", lastSync: "2025-12-15T09:00:00", recordsCount: 56, dataQualityPercent: 96, description: "Електронний документообіг", syncFrequency: "1h", createdAt: "2024-05-10T12:00:00" },
  { id: "tax-register", name: "Реєстр ПН ДПС", icon: FileText, category: "government", status: "active", lastSync: "2025-12-15T09:30:00", recordsCount: 12, dataQualityPercent: 100, description: "Реєстр податкових накладних", syncFrequency: "daily", createdAt: "2024-01-15T08:00:00" },
  { id: "privat24-docs", name: "Виписки Приват24", icon: Building2, category: "bank", status: "active", lastSync: "2025-12-15T08:00:00", recordsCount: 34, dataQualityPercent: 94, description: "Банківські виписки", syncFrequency: "15min", createdAt: "2024-03-01T10:00:00" },
  { id: "mono-docs", name: "Monobank виписки", icon: CreditCard, category: "bank", status: "active", lastSync: "2025-12-15T07:45:00", recordsCount: 28, dataQualityPercent: 99, description: "Банківські виписки", syncFrequency: "15min", createdAt: "2024-04-05T14:00:00" },
];

const documentSourcesIndividual: DataSource[] = [
  { id: "tax-register", name: "Реєстр ДПС", icon: FileText, category: "government", status: "active", lastSync: "2025-12-15T09:30:00", recordsCount: 5, dataQualityPercent: 100, description: "Державна податкова служба", syncFrequency: "daily", createdAt: "2024-06-01T09:00:00" },
  { id: "privat24-docs", name: "Виписки Приват24", icon: Building2, category: "bank", status: "pending", description: "Банківські виписки", createdAt: "2025-12-01T11:00:00" },
];

// ============= Джерела для книги доходів (Income Book) =============
const incomeSourcesFop: DataSource[] = [
  { id: "monobank", name: "Monobank", icon: CreditCard, category: "bank", status: "active", lastSync: "2025-03-12T14:30:00Z", recordsCount: 156 },
  { id: "privat24", name: "Приват24", icon: Building2, category: "bank", status: "active", lastSync: "2025-03-12T14:25:00Z", recordsCount: 89 },
  { id: "way4pay", name: "Way4Pay", icon: CreditCard, category: "payment", status: "active", lastSync: "2025-03-12T14:00:00Z", recordsCount: 45 },
  { id: "liqpay", name: "LiqPay", icon: CreditCard, category: "payment", status: "pending", lastSync: "2025-03-11T18:00:00Z", recordsCount: 12 },
  { id: "prro", name: "ПРРО (каси)", icon: Receipt, category: "prro", status: "active", lastSync: "2025-03-12T14:15:00Z", recordsCount: 234 },
  { id: "vchasno", name: "Vchasno", icon: FileText, category: "edo", status: "active", lastSync: "2025-03-12T10:00:00Z", recordsCount: 28 },
];

const incomeSourcesTov: DataSource[] = [
  { id: "monobank", name: "Monobank", icon: CreditCard, category: "bank", status: "active", lastSync: "2025-03-12T14:30:00Z", recordsCount: 423 },
  { id: "privat24", name: "Приват24", icon: Building2, category: "bank", status: "active", lastSync: "2025-03-12T14:25:00Z", recordsCount: 312 },
  { id: "1c", name: "1С:Бухгалтерія", icon: BarChart3, category: "accounting", status: "active", lastSync: "2025-03-12T06:00:00Z", recordsCount: 1520 },
  { id: "prro", name: "ПРРО (каси)", icon: Receipt, category: "prro", status: "active", lastSync: "2025-03-12T14:15:00Z", recordsCount: 567 },
];

// ============= Інтеграції для паспорта кабінету (Overview) =============
const integrationsFop: DataSource[] = [
  { id: "monobank", name: "Monobank", icon: CreditCard, category: "bank", status: "active", lastSync: "2025-12-15T14:30:00" },
  { id: "privat24", name: "Приват24", icon: Building2, category: "bank", status: "pending" },
  { id: "vchasno", name: "Vchasno", icon: FileCheck, category: "edo", status: "inactive" },
];

const integrationsTov: DataSource[] = [
  { id: "medoc", name: "M.E.Doc", icon: FileCheck, category: "edo", status: "active", lastSync: "2025-12-15T10:00:00" },
  { id: "monobank", name: "Monobank", icon: CreditCard, category: "bank", status: "active", lastSync: "2025-12-15T14:30:00" },
  { id: "1c", name: "1С:Бухгалтерія", icon: BarChart3, category: "accounting", status: "active", lastSync: "2025-12-15T06:00:00" },
  { id: "vchasno", name: "Vchasno", icon: FileText, category: "edo", status: "pending" },
];

const integrationsFopGroup: DataSource[] = [
  { id: "monobank", name: "Monobank", icon: CreditCard, category: "bank", status: "active", lastSync: "2025-12-15T14:30:00" },
  { id: "privat24", name: "Приват24", icon: Building2, category: "bank", status: "active", lastSync: "2025-12-15T12:00:00" },
  { id: "pumb", name: "ПУМБ", icon: Building2, category: "bank", status: "pending" },
];

const integrationsIndividual: DataSource[] = [
  { id: "diia", name: "Дія", icon: FileCheck, category: "government", status: "active", lastSync: "2025-12-15T09:00:00" },
  { id: "monobank", name: "Monobank", icon: CreditCard, category: "bank", status: "pending" },
  { id: "property-registry", name: "Реєстри майна", icon: Building2, category: "government", status: "inactive", description: "Державний реєстр речових прав на нерухоме майно" },
];

// ============= Джерела для звітів (Reports) =============
const reportsSourcesFop: DataSource[] = [
  { id: "income-book", name: "Книга доходів", icon: BarChart3, category: "accounting", status: "active", lastSync: new Date().toISOString(), recordsCount: 156, dataQualityPercent: 98, description: "Дані про доходи ФОП", syncFrequency: "1h" },
  { id: "bank-statements", name: "Банківські виписки", icon: Building2, category: "bank", status: "active", lastSync: new Date().toISOString(), recordsCount: 89, dataQualityPercent: 95, description: "Виписки для звітності" },
  { id: "tax-calendar", name: "Податковий календар", icon: FileText, category: "government", status: "active", lastSync: new Date().toISOString(), description: "Дедлайни звітності" },
];

const reportsSourcesFopWithEmployees: DataSource[] = [
  ...reportsSourcesFop,
  { id: "employees", name: "Реєстр працівників", icon: FileCheck, category: "accounting", status: "active", lastSync: new Date().toISOString(), recordsCount: 3, dataQualityPercent: 100, description: "Дані для 4ДФ (Податковий розрахунок)" },
];

const reportsSourcesTov: DataSource[] = [
  { id: "1c", name: "1С:Бухгалтерія", icon: BarChart3, category: "accounting", status: "active", lastSync: new Date().toISOString(), recordsCount: 1520, dataQualityPercent: 92, description: "Облікові дані", syncFrequency: "6h" },
  { id: "employees", name: "Реєстр працівників", icon: FileCheck, category: "accounting", status: "active", lastSync: new Date().toISOString(), recordsCount: 12, dataQualityPercent: 100, description: "Дані для звітності" },
  { id: "tax-register", name: "Реєстр ПН ДПС", icon: FileText, category: "government", status: "active", lastSync: new Date().toISOString(), recordsCount: 89, description: "Податкові накладні" },
];

// ============= Джерела для номенклатури =============
const nomenclatureSourcesTov: DataSource[] = [
  { id: "1c", name: "1С:Бухгалтерія", icon: BarChart3, category: "accounting", status: "active", lastSync: "2026-01-28T06:00:00", recordsCount: 156, dataQualityPercent: 92, description: "Синхронізація номенклатури", syncFrequency: "6h" },
  { id: "medoc", name: "M.E.Doc", icon: FileCheck, category: "edo", status: "active", lastSync: "2026-01-25T12:00:00", recordsCount: 45, dataQualityPercent: 98, description: "Номенклатура з податкових накладних", syncFrequency: "daily" },
  { id: "vchasno", name: "Vchasno", icon: FileText, category: "edo", status: "pending", description: "Очікує налаштування" },
];

const nomenclatureSourcesFop: DataSource[] = [
  { id: "vchasno", name: "Vchasno", icon: FileText, category: "edo", status: "active", lastSync: "2026-01-28T09:00:00", recordsCount: 12, dataQualityPercent: 96, description: "Номенклатура послуг", syncFrequency: "1h" },
  { id: "manual", name: "Вручну", icon: FileText, category: "accounting", status: "active", lastSync: "2026-01-27T15:00:00", recordsCount: 8, description: "Введено вручну" },
];

const nomenclatureSourcesDealer: DataSource[] = [
  { id: "1c", name: "1С:Торгівля", icon: BarChart3, category: "accounting", status: "active", lastSync: "2026-01-28T06:00:00", recordsCount: 234, dataQualityPercent: 89, description: "Товарний облік", syncFrequency: "1h" },
  { id: "medoc", name: "M.E.Doc", icon: FileCheck, category: "edo", status: "active", lastSync: "2026-01-27T18:00:00", recordsCount: 67, dataQualityPercent: 95, description: "Податкові накладні", syncFrequency: "daily" },
  { id: "prro", name: "ПРРО Checkbox", icon: Receipt, category: "prro", status: "active", lastSync: "2026-01-28T10:15:00", recordsCount: 45, description: "Касові операції", syncFrequency: "15min" },
];

// ============= Джерела контрагентів для номенклатури =============
export interface ContractorSyncSource {
  id: string;
  name: string;
  type: "contractor";
  status: DataSourceStatus;
  lastSync?: string;
  recordsCount?: number;
}

const nomenclatureContractorSourcesTov: ContractorSyncSource[] = [
  { id: "contractor-1", name: "ТОВ Інноватех", type: "contractor", status: "active", lastSync: "2026-01-28T14:30:00", recordsCount: 12 },
  { id: "contractor-2", name: "ФОП Мельник О.В.", type: "contractor", status: "active", lastSync: "2026-01-27T10:00:00", recordsCount: 5 },
];

const nomenclatureContractorSourcesDealer: ContractorSyncSource[] = [
  { id: "contractor-1", name: "ТОВ Інноватех", type: "contractor", status: "active", lastSync: "2026-01-28T14:30:00", recordsCount: 8 },
  { id: "contractor-2", name: "ТОВ Дистриб'ютор Плюс", type: "contractor", status: "active", lastSync: "2026-01-28T09:00:00", recordsCount: 15 },
  { id: "contractor-3", name: "ФОП Коваленко", type: "contractor", status: "pending", recordsCount: 0 },
];

/**
 * Отримати джерела контрагентів для синхронізації номенклатури
 */
export const getNomenclatureContractorSources = (cabinetId?: string): ContractorSyncSource[] => {
  if (cabinetId === "demo-dealer-2") return nomenclatureContractorSourcesDealer;
  return nomenclatureContractorSourcesTov;
};

// ============= Публічні функції для отримання джерел =============

export type DataSourceVariant = "documents" | "income" | "integrations" | "reports" | "nomenclature";

/**
 * Отримати джерела даних для кабінету за типом та варіантом
 * @param cabinetType - тип кабінету (fop, tov, fop-group, individual)
 * @param variant - варіант використання (documents, income, integrations, nomenclature)
 */
export const getDataSourcesForCabinet = (
  cabinetType: CabinetType, 
  variant: DataSourceVariant = "documents",
  options?: { hasEmployees?: boolean; cabinetId?: string }
): DataSource[] => {
  switch (variant) {
    case "documents":
      if (cabinetType === "tov") return documentSourcesTov;
      if (cabinetType === "fop" || cabinetType === "fop-group") return documentSourcesFop;
      return documentSourcesIndividual;
      
    case "income":
      if (cabinetType === "tov") return incomeSourcesTov;
      return incomeSourcesFop; // FOP, FOP-group, Individual
      
    case "integrations":
      if (cabinetType === "tov") return integrationsTov;
      if (cabinetType === "fop") return integrationsFop;
      if (cabinetType === "fop-group") return integrationsFopGroup;
      return integrationsIndividual;
      
    case "reports":
      if (cabinetType === "tov") return reportsSourcesTov;
      if ((cabinetType === "fop" || cabinetType === "fop-group") && options?.hasEmployees) {
        return reportsSourcesFopWithEmployees;
      }
      return reportsSourcesFop;
      
    case "nomenclature":
      // Special handling for demo dealer cabinet
      if (options?.cabinetId === "demo-dealer-2") return nomenclatureSourcesDealer;
      if (cabinetType === "tov") return nomenclatureSourcesTov;
      return nomenclatureSourcesFop;
      
    default:
      return documentSourcesFop;
  }
};

/**
 * Отримати інтеграції для паспорта кабінету (Overview)
 * Синонім для getDataSourcesForCabinet з variant="integrations"
 */
export const getIntegrationsForCabinet = (cabinetType: CabinetType): DataSource[] => {
  return getDataSourcesForCabinet(cabinetType, "integrations");
};

// ============= Доступні інтеграції (Marketplace) =============
export const availableIntegrations: DataSource[] = [
  { 
    id: "nova-poshta", 
    name: "Нова Пошта", 
    icon: Building2, 
    category: "accounting", 
    status: "inactive", 
    description: "Інтеграція з ТТН та відстеження", 
    features: ["Створення ТТН", "Відстеження статусу", "Автозаповнення адрес"],
    auth: {
      type: "api_key",
      fields: [
        { 
          name: "apiKey", 
          label: "API-ключ", 
          type: "password", 
          required: true, 
          placeholder: "Введіть API-ключ з особистого кабінету",
          validation: { minLength: 32, maxLength: 36, errorMessage: "API-ключ має бути 32-36 символів" }
        }
      ],
      instructions: "Отримайте API-ключ в особистому кабінеті Нова Пошта → Налаштування → API",
    }
  },
  { 
    id: "checkbox", 
    name: "Checkbox", 
    icon: Receipt, 
    category: "prro", 
    status: "inactive", 
    description: "Програмний РРО", 
    features: ["Фіскальні чеки", "Z-звіти", "Автооблік каси"],
    auth: {
      type: "credentials",
      fields: [
        { name: "login", label: "Логін", type: "text", required: true, placeholder: "Логін з договору" },
        { name: "password", label: "Пароль", type: "password", required: true, placeholder: "Пароль" },
        { name: "licenseKey", label: "Ліцензійний ключ", type: "text", required: true, placeholder: "XXXX-XXXX-XXXX-XXXX" }
      ],
      instructions: "Використовуйте дані з вашого договору з Checkbox",
    }
  },
  { 
    id: "poster", 
    name: "Poster POS", 
    icon: CreditCard, 
    category: "prro", 
    status: "inactive", 
    description: "POS-система для HoReCa", 
    features: ["Синхр. продажів", "Залишки складу", "Зміни та чеки"],
    auth: {
      type: "api_key",
      fields: [
        { name: "accessToken", label: "Access Token", type: "password", required: true, placeholder: "Токен з налаштувань Poster" }
      ],
      instructions: "Отримайте токен в налаштуваннях Poster → Інтеграції → API",
    }
  },
  { 
    id: "odata-1c", 
    name: "OData 1С", 
    icon: BarChart3, 
    category: "accounting", 
    status: "inactive", 
    description: "Розширений обмін з 1С", 
    features: ["Двостороння синхр.", "Документи та довідники", "Залишки online"],
    auth: {
      type: "credentials",
      fields: [
        { name: "serverUrl", label: "Адреса сервера", type: "text", required: true, placeholder: "https://1c-server.company.ua/odata" },
        { name: "username", label: "Ім'я користувача", type: "text", required: true, placeholder: "Користувач 1С" },
        { name: "password", label: "Пароль", type: "password", required: true, placeholder: "Пароль" }
      ],
      instructions: "Налаштуйте OData публікацію на сервері 1С та вкажіть облікові дані",
    }
  },
  { 
    id: "diia", 
    name: "Дія.Бізнес", 
    icon: FileText, 
    category: "government", 
    status: "inactive", 
    description: "Державні послуги онлайн", 
    features: ["ЄСВ статус", "Ліцензії", "Довідки"],
    auth: {
      type: "oauth",
      oauthUrl: "https://diia.gov.ua/oauth/authorize",
      instructions: "Авторизуйтесь через Дія.Підпис або BankID",
    }
  },
  { 
    id: "pumb", 
    name: "ПУМБ Бізнес", 
    icon: Building2, 
    category: "bank", 
    status: "inactive", 
    description: "Бізнес-банкінг ПУМБ", 
    features: ["Виписки", "Платежі", "Залишки"],
    auth: {
      type: "oauth",
      oauthUrl: "https://business.pumb.ua/oauth/authorize",
      instructions: "Авторизуйтесь через свій обліковий запис ПУМБ Бізнес",
    }
  },
];

// ============= Журнал синхронізації =============
export const getSyncLogForCabinet = (cabinetType: CabinetType): SyncLogEntry[] => {
  return [
    { id: "1", connectionId: "monobank", timestamp: "2025-12-15T10:30:00", source: "Monobank", action: "Імпорт виписки", recordsAffected: 15, status: "success" },
    { id: "2", connectionId: "medoc", timestamp: "2025-12-15T09:45:00", source: "M.E.Doc", action: "Синхронізація документів", recordsAffected: 3, status: "success" },
    { id: "3", connectionId: "privat24", timestamp: "2025-12-15T08:00:00", source: "Приват24", action: "Імпорт виписки", recordsAffected: 8, status: "success" },
    { id: "4", connectionId: "1c", timestamp: "2025-12-14T18:30:00", source: "1С:Бухгалтерія", action: "Синхронізація залишків", recordsAffected: 124, status: "warning", message: "2 записи потребують перевірки" },
    { id: "5", connectionId: "vchasno", timestamp: "2025-12-14T14:00:00", source: "Vchasno", action: "Спроба підключення", recordsAffected: 0, status: "error", message: "Очікує підтвердження" },
    { id: "6", connectionId: "monobank", timestamp: "2025-12-14T10:00:00", source: "Monobank", action: "Імпорт виписки", recordsAffected: 22, status: "success" },
    { id: "7", connectionId: "medoc", timestamp: "2025-12-13T16:00:00", source: "M.E.Doc", action: "Синхронізація звітів", recordsAffected: 1, status: "success" },
    { id: "8", connectionId: "privat24", timestamp: "2025-12-13T09:00:00", source: "Приват24", action: "Імпорт виписки", recordsAffected: 5, status: "success" },
  ];
};
