import {
  User,
  Building2,
  Receipt,
  FileCheck,
  Link,
  Database,
  FileText,
  Bot,
  Users,
  BookOpen,
  Briefcase,
  CreditCard,
  Shield,
  CheckCircle,
  AlertCircle,
  Clock,
  Globe,
  Smartphone,
  Building,
  Landmark,
  KeyRound,
  PenTool,
  Workflow,
  Languages,
  Zap,
  Bell,
  Target,
  Activity,
  UserPlus,
  Eye,
  Settings,
  Package,
  Warehouse,
  Home,
  TrendingUp,
  ScrollText,
  Scissors,
  Trophy,
  UtensilsCrossed,
  BedDouble,
  Network,
  LayoutGrid,
  type LucideIcon,
} from "lucide-react";

// ============ Financial Monitoring Status ============
export type FinMonStatus = 
  | "not-required"    // Не потребує (B2C, малі суми)
  | "pending"         // Очікує заповнення анкети
  | "completed"       // Анкета заповнена та актуальна
  | "expired"         // Анкета прострочена (потребує оновлення)
  | "flagged";        // Виявлено ознаки ризику
import type { Cabinet, CabinetType } from "@/types/cabinet";
import { getVerticalId } from "@/core";
import type { ReportType } from "@/config/reportsConfig";
import {
  isDemoCabinet,
  getDemoContractorsForCabinet,
} from "@/config/demoCabinetsData";

// ============ Report Automation Settings ============

export interface ReportAutomationSettings {
  // Master toggle - автогенерація увімкнена
  autoGenerationEnabled: boolean;
  // Коли генерувати (днів до дедлайну)
  generationDaysBefore: 10 | 7 | 5 | 3;
  // Коли сповіщати
  notificationDaysBefore: 7 | 5 | 3 | 1;
  // Автоматичне подання (без підтвердження)
  autoSubmitEnabled: boolean;
  autoSubmitOnlyIfPerfectScore: boolean;
  // Fallback при помилках
  fallbackBehavior: "pause" | "retry" | "notify-only";
  maxRetries: number;
  // Пріоритет типів звітів (порядок генерації)
  priorityOrder: ReportType[];
  // Паузи між генераціями
  cooldownMinutes: number;
}

export const generationTimeOptions = [
  { value: 10, label: "За 10 днів", description: "Рекомендовано — максимум часу на перевірку" },
  { value: 7, label: "За 7 днів", description: "Стандартний варіант" },
  { value: 5, label: "За 5 днів", description: "Швидка генерація" },
  { value: 3, label: "За 3 дні", description: "Мінімальний час" },
] as const;

export const notificationTimeOptions = [
  { value: 7, label: "За 7 днів" },
  { value: 5, label: "За 5 днів" },
  { value: 3, label: "За 3 дні" },
  { value: 1, label: "За 1 день" },
] as const;

export const fallbackBehaviorOptions = [
  { value: "pause", label: "Поставити на паузу", description: "Зачекати ручного втручання" },
  { value: "retry", label: "Повторити спробу", description: "Автоматично повторити до 3 разів" },
  { value: "notify-only", label: "Лише сповістити", description: "Сповістити і продовжити чергу" },
] as const;

export function getDefaultReportAutomationSettings(): ReportAutomationSettings {
  return {
    autoGenerationEnabled: true,
    generationDaysBefore: 10,
    notificationDaysBefore: 7,
    autoSubmitEnabled: false,
    autoSubmitOnlyIfPerfectScore: true,
    fallbackBehavior: "pause",
    maxRetries: 3,
    priorityOrder: ["ep", "esv", "vz", "1df"],
    cooldownMinutes: 5,
  };
}

export function getReportAutomationSettingsForCabinet(cabinet: Cabinet): ReportAutomationSettings {
  const defaults = getDefaultReportAutomationSettings();
  
  if (cabinet.type === "tov") {
    return {
      ...defaults,
      generationDaysBefore: 7,
      priorityOrder: ["1df", "esv-emp", "vz-emp", "stat"],
    };
  }
  
  return defaults;
}

// Sub-tab definition
export interface SettingsSubTab {
  id: string;
  label: string;
  icon: LucideIcon;
  description?: string;
}

// Get settings sub-tabs for a cabinet type
export const getSettingsSubTabs = (cabinetType: CabinetType, cabinet?: Cabinet): SettingsSubTab[] => {
  const baseTabs: SettingsSubTab[] = [
    { id: "profile-requisites", label: "Профіль та реквізити", icon: User, description: "Реквізити для документів" },
    { id: "tax-profile", label: "Податковий профіль", icon: Receipt, description: "Система оподаткування" },
    { id: "goals-budget", label: "Цілі та бюджет", icon: Target, description: "Плани та ліміти" },
    { id: "kved-licensing", label: "КВЕДи та ліцензування", icon: Briefcase, description: "Коди діяльності" },
    { id: "kep-signatures", label: "КЕП/Підпис", icon: KeyRound, description: "Електронні підписи" },
    { id: "signature-log", label: "Журнал підписів", icon: ScrollText, description: "Аудит-trail КЕП-підписів" },
    { id: "connections", label: "Підключення", icon: Link, description: "Синхронізація та інтеграції" },
    { id: "document-policies", label: "Політики документів", icon: FileText, description: "Шаблони та нумерація" },
    { id: "ai-actions", label: "AI-автодії", icon: Bot, description: "Автоматизація" },
    { id: "notifications", label: "Сповіщення", icon: Bell, description: "Правила сповіщень" },
    { id: "team-access", label: "Команда та делегування", icon: Users, description: "Доступи, ролі, КЕП-делегації" },
    { id: "network-partners", label: "Мої підписки на заклади", icon: Network, description: "Заклади, на які ви підписані (без КЕП)" },
    { id: "references", label: "Довідники", icon: BookOpen, description: "Контрагенти, категорії" },
  ];

  // Industry-specific tab: «Салон» / «Клуб» / «Ресторан» / «Готель»
  // Усі чотири індустрії використовують спільний SalonSettingsSection
  // (дані змодельовані через SalonWorkstation / SalonMaster / salonMasterDelegations),
  // тому id лишається "salon" — змінюються лише label/icon/description.
  const verticalId = getVerticalId(cabinet);
  if (cabinet?.industry === "salon" && verticalId === "salon") {
    baseTabs.splice(4, 0, {
      id: "salon",
      label: "Салон",
      icon: Scissors,
      description: "Робочі місця, майстри, прайс, винагороди",
    });
  } else if (verticalId === "tennis_club") {
    baseTabs.splice(4, 0, {
      id: "salon",
      label: "Клуб",
      icon: Trophy,
      description: "Корти, тренери, абонементи, прайс",
    });
  } else if (verticalId === "restaurant") {
    baseTabs.splice(4, 0, {
      id: "salon",
      label: "Ресторан",
      icon: UtensilsCrossed,
      description: "Столики, персонал, меню, доставка",
    });
  } else if (verticalId === "hotel") {
    baseTabs.splice(4, 0, {
      id: "salon",
      label: "Готель",
      icon: BedDouble,
      description: "Номери, тарифи, персонал, mini-bar",
    });
  }

  // For individual cabinets — custom set ordered by usage frequency.
  // «Підключення та приватність» (новий хаб) замінює стару `network-partners`
  // і поглинає `connections` (банки) у внутрішніх табах.
  if (cabinetType === "individual") {
    return [
      { id: "hub", label: "Огляд", icon: LayoutGrid, description: "Швидкий старт по всіх налаштуваннях" },
      { id: "notifications", label: "Сповіщення", icon: Bell, description: "Правила сповіщень" },
      {
        id: "connections-privacy",
        label: "Підключення та приватність",
        icon: Shield,
        description: "Підписки на заклади, банки, дозволи, журнал доступу, експорт даних",
      },
      { id: "ai-actions", label: "AI-автодії", icon: Bot, description: "Автоматизація" },
      { id: "profile-requisites", label: "Профіль та реквізити", icon: User, description: "Реквізити для документів" },
      { id: "goals-budget", label: "Цілі та бюджет", icon: Target, description: "Плани та ліміти" },
      { id: "tax-profile", label: "Податковий профіль", icon: Receipt, description: "Система оподаткування" },
      { id: "kep-signatures", label: "КЕП/Підпис", icon: KeyRound, description: "Електронні підписи" },
      { id: "signature-log", label: "Журнал підписів", icon: ScrollText, description: "Аудит-trail КЕП-підписів" },
      { id: "team-access", label: "Команда та делегування", icon: Users, description: "Доступи, ролі, КЕП-делегації" },
      { id: "references", label: "Довідники", icon: BookOpen, description: "Контрагенти, категорії" },
    ];
  }

  return baseTabs;
};

// Get first settings sub-tab — усі кабінети стартують з картки-хабу «Налаштування».
// Для individual це "hub" (legacy id), для business/fop ту саму роль виконує "__hub__"
// (CabinetSettingsPage рендерить generic CabinetSettingsHub за відсутністю валідного subtab).
export const getFirstSettingsSubTab = (cabinetType: CabinetType, _cabinet?: Cabinet): string => {
  if (cabinetType === "individual") return "hub";
  return "__hub__";
};

// Allowed settings tabs for passive cabinets (contractors)
const PASSIVE_CABINET_ALLOWED_TABS = [
  "profile-requisites",  // Керування реквізитами
  "kep-signatures",      // КЕП для підписання документів
  "signature-log",       // Read-only перегляд журналу підписів
  "connections",         // Базові інтеграції (банк)
  "notifications",       // Сповіщення про документи партнерів
  "references",          // Довідник контрагентів (для перегляду партнера)
];

// Get settings sub-tabs for passive cabinet (contractors)
export const getSettingsSubTabsForPassive = (cabinetType: CabinetType): SettingsSubTab[] => {
  const allTabs = getSettingsSubTabs(cabinetType);
  return allTabs.filter(tab => PASSIVE_CABINET_ALLOWED_TABS.includes(tab.id));
};

// Get first settings sub-tab for passive cabinet — теж хаб.
export const getFirstSettingsSubTabForPassive = (cabinetType: CabinetType): string => {
  if (cabinetType === "individual") return "hub";
  return "__hub__";
};

// Integration status
export type IntegrationStatus = "active" | "pending" | "inactive" | "error";

export interface Integration {
  id: string;
  name: string;
  icon: LucideIcon;
  category: "bank" | "edo" | "accounting" | "government" | "other";
  status: IntegrationStatus;
  lastSync?: string;
  recordsCount?: number;
  error?: string;
}

// Get integrations for a cabinet
export const getIntegrationsForCabinet = (cabinet: Cabinet): Integration[] => {
  // Passive cabinets have limited integrations - only bank connections
  if (cabinet.accessMode === "passive" || cabinet.id === "passive-demo-1") {
    return [
      { id: "monobank", name: "Monobank", icon: CreditCard, category: "bank", status: "active", lastSync: "2025-01-09T09:30:00", recordsCount: 12 },
      { id: "privat24", name: "Приват24", icon: CreditCard, category: "bank", status: "pending" },
    ];
  }

  const baseIntegrations: Integration[] = [];

  // Based on cabinet name/type, return different integrations
  if (cabinet.name.includes("Консалтинг") || cabinet.type === "fop-group") {
    return [
      { id: "monobank", name: "Monobank", icon: CreditCard, category: "bank", status: "active", lastSync: "2025-12-10T09:30:00", recordsCount: 1247 },
      { id: "privat24", name: "Приват24", icon: CreditCard, category: "bank", status: "active", lastSync: "2025-12-10T08:15:00", recordsCount: 892 },
      { id: "pumb", name: "ПУМБ", icon: CreditCard, category: "bank", status: "active", lastSync: "2025-12-09T18:00:00", recordsCount: 156 },
    ];
  }

  if (cabinet.type === "individual") {
    return [
      { id: "diia", name: "Дія", icon: Smartphone, category: "government", status: "active", lastSync: "2025-12-09T12:00:00" },
      { id: "monobank", name: "Monobank", icon: CreditCard, category: "bank", status: "pending", lastSync: undefined },
      { id: "tax-cabinet", name: "Кабінет платника податків", icon: Building, category: "government", status: "inactive" },
      { id: "property-registry", name: "Реєстри майна", icon: Home, category: "government", status: "inactive" },
    ];
  }

  if (cabinet.type === "tov") {
    return [
      { id: "medoc", name: "M.E.Doc", icon: FileCheck, category: "edo", status: "active", lastSync: "2025-12-10T10:00:00", recordsCount: 423 },
      { id: "monobank", name: "Monobank", icon: CreditCard, category: "bank", status: "active", lastSync: "2025-12-10T09:45:00", recordsCount: 2156 },
      { id: "1c", name: "1С:Бухгалтерія", icon: Building2, category: "accounting", status: "active", lastSync: "2025-12-10T06:00:00", recordsCount: 15420 },
      { id: "vchasno", name: "Vchasno", icon: FileCheck, category: "edo", status: "pending", error: "Очікує підтвердження" },
    ];
  }

  // Default FOP
  return [
    { id: "monobank", name: "Monobank", icon: CreditCard, category: "bank", status: "active", lastSync: "2025-12-10T09:30:00", recordsCount: 567 },
    { id: "privat24", name: "Приват24", icon: CreditCard, category: "bank", status: "active", lastSync: "2025-12-10T08:00:00", recordsCount: 234 },
    { id: "vchasno", name: "Vchasno", icon: FileCheck, category: "edo", status: "pending" },
  ];
};

// Team member definition
export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  roleLabel: string;
  status: "active" | "invited" | "inactive";
  lastActive?: string;
}

// Get team roles by cabinet type
export const getTeamRolesForType = (cabinetType: CabinetType): { id: string; label: string }[] => {
  switch (cabinetType) {
    case "tov":
      return [
        { id: "director", label: "Директор" },
        { id: "chief-accountant", label: "Головний бухгалтер" },
        { id: "accountant", label: "Бухгалтер" },
        { id: "hr", label: "HR/Payroll" },
        { id: "sales-manager", label: "Менеджер з продажу" },
        { id: "lawyer", label: "Юрист" },
        { id: "warehouse", label: "Комірник" },
        { id: "logist", label: "Логіст" },
        { id: "auditor", label: "Аудитор" },
      ];
    case "fop":
      return [
        { id: "owner", label: "Власник" },
        { id: "accountant", label: "Бухгалтер" },
        { id: "auditor", label: "Аудитор" },
      ];
    case "fop-group":
      return [
        { id: "group-admin", label: "Адміністратор групи" },
        { id: "group-accountant", label: "Бухгалтер групи" },
        { id: "viewer", label: "Перегляд" },
      ];
    case "individual":
      return [
        { id: "owner", label: "Власник" },
        { id: "consultant", label: "Податковий консультант" },
      ];
    default:
      return [{ id: "owner", label: "Власник" }];
  }
};

// Get demo team members for a cabinet
export const getTeamMembersForCabinet = (cabinet: Cabinet): TeamMember[] => {
  const baseMembers: TeamMember[] = [];

  if (cabinet.type === "tov") {
    return [
      { id: "1", name: "Олександр Петренко", email: "director@example.com", role: "director", roleLabel: "Директор", status: "active", lastActive: "2025-12-10T10:30:00" },
      { id: "2", name: "Марія Коваленко", email: "accountant@example.com", role: "chief-accountant", roleLabel: "Головний бухгалтер", status: "active", lastActive: "2025-12-10T09:15:00" },
      { id: "3", name: "Ігор Сидоренко", email: "hr@example.com", role: "hr", roleLabel: "HR/Payroll", status: "active", lastActive: "2025-12-09T16:00:00" },
      { id: "4", name: "Анна Шевченко", email: "sales@example.com", role: "sales-manager", roleLabel: "Менеджер з продажу", status: "invited" },
    ];
  }

  if (cabinet.type === "fop") {
    return [
      { id: "1", name: cabinet.name.replace("ФОП ", ""), email: "owner@example.com", role: "owner", roleLabel: "Власник", status: "active", lastActive: "2025-12-10T10:00:00" },
      { id: "2", name: "Бухгалтер Онлайн", email: "buh@example.com", role: "accountant", roleLabel: "Бухгалтер", status: "active", lastActive: "2025-12-10T08:30:00" },
    ];
  }

  if (cabinet.type === "fop-group") {
    return [
      { id: "1", name: "Адміністратор Консалтинг", email: "admin@consulting.com", role: "group-admin", roleLabel: "Адміністратор групи", status: "active", lastActive: "2025-12-10T10:00:00" },
      { id: "2", name: "Груповий Бухгалтер", email: "accountant@consulting.com", role: "group-accountant", roleLabel: "Бухгалтер групи", status: "active", lastActive: "2025-12-10T09:00:00" },
    ];
  }

  return [
    { id: "1", name: cabinet.name, email: "owner@example.com", role: "owner", roleLabel: "Власник", status: "active", lastActive: "2025-12-10T10:00:00" },
  ];
};

// KEP Certificate
export interface KepCertificate {
  id: string;
  owner: string;
  position: string;
  issuer: string;
  validFrom: string;
  validTo: string;
  status: "valid" | "expiring" | "expired";
}

// Get KEP certificates for cabinet
export const getKepCertificatesForCabinet = (cabinet: Cabinet): KepCertificate[] => {
  // Special case for passive demo cabinet
  if (cabinet.id === "passive-demo-1") {
    return [
      { 
        id: "kep-passive-1", 
        owner: "Марченко В.А.", 
        position: "Генеральний директор", 
        issuer: "АЦСК ПриватБанку", 
        validFrom: "2024-06-01", 
        validTo: "2026-06-01", 
        status: "valid" 
      },
    ];
  }

  if (cabinet.type === "tov") {
    return [
      { id: "1", owner: "Петренко О.І.", position: "Директор", issuer: "АЦСК ІДД ДПС", validFrom: "2025-01-15", validTo: "2026-01-15", status: "valid" },
      { id: "2", owner: "Коваленко М.В.", position: "Головний бухгалтер", issuer: "АЦСК ІДД ДПС", validFrom: "2025-03-01", validTo: "2026-03-01", status: "valid" },
      { id: "3", owner: "Іванов П.П.", position: "Уповноважена особа", issuer: "Приватбанк", validFrom: "2024-06-01", validTo: "2025-06-01", status: "expiring" },
    ];
  }

  if (cabinet.type === "fop") {
    const ownerName = cabinet.name.replace("ФОП ", "");
    return [
      { id: "1", owner: ownerName, position: "Власник", issuer: "АЦСК ІДД ДПС", validFrom: "2025-02-01", validTo: "2026-02-01", status: "valid" },
    ];
  }

  if (cabinet.type === "individual") {
    return [
      { id: "1", owner: cabinet.name, position: "Фізична особа", issuer: "Дія.Підпис", validFrom: "2025-01-01", validTo: "2026-01-01", status: "valid" },
    ];
  }

  return [];
};

// Data source for sync
export interface DataSource {
  id: string;
  name: string;
  type: "bank" | "edo" | "accounting" | "registry" | "crm";
  recordsImported: number;
  lastImport: string;
  dataQuality: "high" | "medium" | "low";
  status: "active" | "paused" | "error";
}

// Sync log entry
export interface SyncLogEntry {
  id: string;
  timestamp: string;
  source: string;
  action: string;
  recordsAffected: number;
  status: "success" | "warning" | "error";
  message?: string;
}

// Get sync log for cabinet
export const getSyncLogForCabinet = (cabinet: Cabinet): SyncLogEntry[] => {
  return [
    { id: "1", timestamp: "2025-12-10T10:30:00", source: "Monobank", action: "Імпорт виписки", recordsAffected: 15, status: "success" },
    { id: "2", timestamp: "2025-12-10T09:45:00", source: "M.E.Doc", action: "Синхронізація документів", recordsAffected: 3, status: "success" },
    { id: "3", timestamp: "2025-12-10T08:00:00", source: "Приват24", action: "Імпорт виписки", recordsAffected: 8, status: "success" },
    { id: "4", timestamp: "2025-12-09T18:30:00", source: "1С:Бухгалтерія", action: "Синхронізація залишків", recordsAffected: 124, status: "warning", message: "2 записи потребують перевірки" },
    { id: "5", timestamp: "2025-12-09T14:00:00", source: "Vchasno", action: "Спроба підключення", recordsAffected: 0, status: "error", message: "Очікує підтвердження" },
    { id: "6", timestamp: "2025-12-09T10:00:00", source: "Monobank", action: "Імпорт виписки", recordsAffected: 22, status: "success" },
    { id: "7", timestamp: "2025-12-08T16:00:00", source: "M.E.Doc", action: "Синхронізація звітів", recordsAffected: 1, status: "success" },
    { id: "8", timestamp: "2025-12-08T09:00:00", source: "Приват24", action: "Імпорт виписки", recordsAffected: 5, status: "success" },
  ];
};

// AI action log entry
export interface AiActionLogEntry {
  id: string;
  timestamp: string;
  action: string;
  result: string;
  status: "auto" | "suggested" | "rejected";
}

// Get AI action log
export const getAiActionLogForCabinet = (cabinet: Cabinet): AiActionLogEntry[] => {
  return [
    { id: "1", timestamp: "2025-12-10T10:35:00", action: "Автокатегоризація", result: "15 операцій категоризовано", status: "auto" },
    { id: "2", timestamp: "2025-12-10T09:50:00", action: "Зіставлення з документами", result: "3 рахунки прив'язано до оплат", status: "auto" },
    { id: "3", timestamp: "2025-12-10T08:00:00", action: "Перевірка КВЕДів", result: "Виявлено 1 операцію поза КВЕДами", status: "suggested" },
    { id: "4", timestamp: "2025-12-09T17:00:00", action: "Нагадування", result: "Дедлайн ЄСВ через 5 днів", status: "auto" },
    { id: "5", timestamp: "2025-12-09T12:00:00", action: "Контроль ліміту ФОП", result: "Ліміт використано на 87.6%", status: "suggested" },
  ];
};

// Reference category
export interface ReferenceCategory {
  id: string;
  label: string;
  icon: LucideIcon;
  count: number;
  description: string;
}

// Get reference categories for cabinet type
// Note: Document templates removed - now accessible via Document Flow gallery
export const getReferenceCategoriesForType = (cabinetType: CabinetType): ReferenceCategory[] => {
  // FOP-specific categories (no warehouses, no cost-items)
  if (cabinetType === "fop") {
    return [
      { id: "contractors", label: "Контрагенти", icon: Users, count: 24, description: "Постачальники та покупці" },
      { id: "income-categories", label: "Категорії доходів", icon: Receipt, count: 10, description: "Класифікація надходжень" },
      { id: "expense-categories", label: "Категорії витрат", icon: CreditCard, count: 18, description: "Класифікація видатків" },
      { id: "bank-rules", label: "Правила категоризації", icon: Zap, count: 6, description: "Автоматичні правила банку" },
      { id: "nomenclature", label: "Номенклатура", icon: Package, count: 5, description: "Послуги та товари" },
      { id: "fixed-assets", label: "Основні засоби", icon: Landmark, count: 5, description: "Облік та амортизація" },
    ];
  }

  // TOV - full set including warehouses and cost-items
  if (cabinetType === "tov") {
    return [
      { id: "contractors", label: "Контрагенти", icon: Users, count: 24, description: "Постачальники та покупці" },
      { id: "income-categories", label: "Категорії доходів", icon: Receipt, count: 10, description: "Класифікація надходжень" },
      { id: "expense-categories", label: "Категорії витрат", icon: CreditCard, count: 18, description: "Класифікація видатків" },
      { id: "bank-rules", label: "Правила категоризації", icon: Zap, count: 12, description: "Автоматичні правила банку" },
      { id: "nomenclature", label: "Номенклатура", icon: Package, count: 156, description: "Товари та послуги" },
      { id: "fixed-assets", label: "Основні засоби", icon: Landmark, count: 7, description: "Облік та амортизація" },
      { id: "cost-items", label: "Статті витрат", icon: Receipt, count: 22, description: "Бухгалтерські статті" },
      { id: "warehouses", label: "Склади та локації", icon: Warehouse, count: 3, description: "Місця зберігання" },
    ];
  }

  if (cabinetType === "fop-group") {
    return [
      { id: "contractors", label: "Контрагенти", icon: Users, count: 24, description: "Постачальники та покупці" },
      { id: "income-categories", label: "Категорії доходів", icon: Receipt, count: 10, description: "Класифікація надходжень" },
      { id: "expense-categories", label: "Категорії витрат", icon: CreditCard, count: 18, description: "Класифікація видатків" },
      { id: "bank-rules", label: "Правила категоризації", icon: Zap, count: 6, description: "Автоматичні правила банку" },
      { id: "master-references", label: "Master-довідники групи", icon: BookOpen, count: 5, description: "Спільні для всіх ФОП" },
    ];
  }

  if (cabinetType === "individual") {
    return [
      { id: "income-types", label: "Типи доходів", icon: Receipt, count: 4, description: "Зарплата, дивіденди, оренда" },
      { id: "property-objects", label: "Об'єкти майна", icon: Home, count: 2, description: "Нерухомість, транспорт, земля" },
      { id: "contractors", label: "Контрагенти", icon: Users, count: 5, description: "Орендарі, роботодавці" },
    ];
  }

  // Default fallback
  return [
    { id: "contractors", label: "Контрагенти", icon: Users, count: 24, description: "Постачальники та покупці" },
    { id: "income-categories", label: "Категорії доходів", icon: Receipt, count: 10, description: "Класифікація надходжень" },
    { id: "expense-categories", label: "Категорії витрат", icon: CreditCard, count: 18, description: "Класифікація видатків" },
    { id: "bank-rules", label: "Правила категоризації", icon: Zap, count: 6, description: "Автоматичні правила банку" },
  ];
};

// KVED entry
export interface KvedEntry {
  code: string;
  name: string;
  isMain: boolean;
}

// Get KVEDs for cabinet
export const getKvedsForCabinet = (cabinet: Cabinet): KvedEntry[] => {
  // Special case for passive demo cabinet (ТОВ Технопром Груп)
  if (cabinet.id === "passive-demo-1") {
    return [
      { code: "46.69", name: "Оптова торгівля іншими машинами й устаткуванням", isMain: true },
      { code: "47.41", name: "Роздрібна торгівля комп'ютерами, периферійним устаткуванням і програмним забезпеченням", isMain: false },
      { code: "62.09", name: "Інша діяльність у сфері інформаційних технологій і комп'ютерних систем", isMain: false },
    ];
  }

  if (cabinet.type === "tov") {
    return [
      { code: "62.01", name: "Комп'ютерне програмування", isMain: true },
      { code: "62.02", name: "Консультування з питань інформатизації", isMain: false },
      { code: "63.11", name: "Оброблення даних, розміщення інформації", isMain: false },
      { code: "70.22", name: "Консультування з питань комерційної діяльності", isMain: false },
    ];
  }

  if (cabinet.type === "fop") {
    switch (cabinet.id) {
      case "demo-consulting-3":
        return [
          { code: "70.22", name: "Консультування з питань комерційної діяльності та управління", isMain: true },
          { code: "74.90", name: "Інша професійна, наукова та технічна діяльність", isMain: false },
        ];
      case "demo-autorepair-2":
        return [
          { code: "45.20", name: "Технічне обслуговування та ремонт автотранспортних засобів", isMain: true },
          { code: "45.32", name: "Роздрібна торгівля деталями та приладдям для автотранспортних засобів", isMain: false },
        ];
      case "demo-dealer-2":
        return [
          { code: "46.90", name: "Неспеціалізована оптова торгівля", isMain: true },
          { code: "47.19", name: "Інші види роздрібної торгівлі в неспеціалізованих магазинах", isMain: false },
        ];
      case "demo-salon-3":
        return [
          { code: "96.02", name: "Надання послуг перукарнями та салонами краси", isMain: true },
          { code: "96.04", name: "Діяльність із забезпечення фізичного комфорту (масаж, SPA)", isMain: false },
          { code: "47.75", name: "Роздрібна торгівля косметичними товарами та туалетними приналежностями в спеціалізованих магазинах", isMain: false },
        ];
      case "demo-tennis-3":
        return [
          { code: "93.11", name: "Функціонування спортивних споруд (тенісні корти)", isMain: true },
          { code: "85.51", name: "Освіта у сфері спорту та відпочинку (тренування)", isMain: false },
          { code: "47.64", name: "Роздрібна торгівля спортивним обладнанням у спеціалізованих магазинах", isMain: false },
          { code: "56.30", name: "Обслуговування напоями (кафе)", isMain: false },
        ];
      case "demo-it-3":
      default:
        return [
          { code: "62.01", name: "Комп'ютерне програмування", isMain: true },
          { code: "62.02", name: "Консультування з питань інформатизації", isMain: false },
        ];
    }
  }

  return [];
};

// Document template
export interface DocumentTemplate {
  id: string;
  name: string;
  type: "invoice" | "act" | "contract" | "internal";
  lastModified: string;
}

// Signing policy
export interface SigningPolicy {
  id: string;
  documentType: string;
  signers: string[];
  description: string;
}

// Get signing policies for cabinet
export const getSigningPoliciesForCabinet = (cabinet: Cabinet): SigningPolicy[] => {
  if (cabinet.type === "tov") {
    return [
      { id: "1", documentType: "Договір", signers: ["Директор"], description: "Підписує директор" },
      { id: "2", documentType: "Акт виконаних робіт", signers: ["Директор", "Уповноважена особа"], description: "Директор або уповноважений" },
      { id: "3", documentType: "Звітність", signers: ["Директор", "Головний бухгалтер"], description: "Директор + Головбух" },
      { id: "4", documentType: "Рахунок-фактура", signers: ["Бухгалтер"], description: "Бухгалтер" },
    ];
  }

  if (cabinet.type === "fop") {
    return [
      { id: "1", documentType: "Всі документи", signers: ["Власник"], description: "Підписує власник" },
    ];
  }

  if (cabinet.type === "individual") {
    return [
      { id: "1", documentType: "Декларація", signers: ["Власник"], description: "Підписується власником" },
    ];
  }

  return [];
};

// ============================================
// КОНТРАГЕНТИ (Demo Data)
// ============================================

export type ContractorRole = "supplier" | "buyer" | "both" | "master";
export type ContractorStatus = "active" | "inactive" | "blocked";

// Data source for contractor requisites - determines editability
export type ContractorDataSource = "manual" | "edr" | "kep" | "sync" | "bank";

export interface ContractorContact {
  id: string;
  name: string;
  position?: string;
  phone?: string;
  email?: string;
  isPrimary?: boolean;
}

export type ContractorVerificationStatus = "verified" | "pending" | "unverified" | "warning";

export interface Contractor {
  id: string;
  name: string;                // Коротка назва (для відображення)
  fullName?: string;           // Повна офіційна назва з реєстру
  code: string;        // ЄДРПОУ (8 цифр) або ІПН (10 цифр)
  iban?: string;
  ibanConfirmed?: boolean;  // IBAN підтверджено банківською транзакцією
  email?: string;
  phone?: string;
  address?: string;
  isSynced?: boolean;  // Синхронізовано з контрагентом
  isPending?: boolean; // Очікує реєстрації (запрошений)
  type: "legal" | "individual" | "fop";
  // Extended fields
  role?: ContractorRole;
  balance?: number;
  lastActivityDate?: string;
  activeContractsCount?: number;
  reliabilityScore?: number;      // Рейтинг надійності (0-100)
  isEdrsVerified?: boolean;
  notes?: string;
  tags?: string[];
  status?: ContractorStatus;
  createdAt?: string;
  contacts?: ContractorContact[];
  // Verification status for unverified contractors
  verificationStatus?: ContractorVerificationStatus;
  // Fields from KEP onboarding
  director?: string;              // ПІБ керівника/власника
  directorPosition?: string;      // Посада
  kveds?: string[];               // Коди діяльності
  taxStatus?: string;             // "Платник ПДВ" | "Платник ЄП 3 група" тощо
  bankName?: string;              // Назва банку
  registrationDate?: string;      // Дата реєстрації в ЄДР
  // FinTech fields
  paymentTermsDays?: number;      // Термін оплати (нетто 30, 60, etc.)
  creditLimit?: number;           // Кредитний ліміт
  creditUsed?: number;            // Використаний ліміт
  // Linked cabinet (if contractor registered via onboarding)
  linkedCabinetId?: string;       // ID кабінету контрагента (якщо зареєстрований)
  // Invitation tracking
  invitedByCabinetId?: string;
  invitedByCabinetName?: string;
  invitedAt?: string;
  acceptedAt?: string;
  // Relationship type (renamed from role for clarity)
  relationshipType?: ContractorRole;
  // Financial Monitoring (СПФМ)
  finMonStatus?: FinMonStatus;
  finMonDueDate?: string;        // Дата закінчення дії анкети
  finMonCompletedAt?: string;    // Дата заповнення анкети
  // Pending contractor tracking (for draft-pending-contractor workflow)
  inviteId?: string;              // Унікальний ID запрошення
  onboardedAt?: string;           // Дата завершення онбордингу
  linkedDocumentIds?: string[];   // ID документів, що очікують цього контрагента
  // Data source and editability
  dataSource?: ContractorDataSource;  // Джерело даних реквізитів
  readOnlyFields?: string[];          // Поля, які не можна редагувати ["code", "name", "address", "kveds"]
}

// Get contractors for a cabinet
export const getContractorsForCabinet = (cabinet: Cabinet): Contractor[] => {
  // Check for specialized demo cabinets first (consulting, autorepair, IT, dealer)
  if (cabinet.id && isDemoCabinet(cabinet.id)) {
    return getDemoContractorsForCabinet(cabinet.id);
  }
  
  // Base contractors for all cabinet types
  const baseContractors: Contractor[] = [
{ 
      id: "c1", 
      name: "ТОВ \"Інноватех\"", 
      fullName: "ТОВАРИСТВО З ОБМЕЖЕНОЮ ВІДПОВІДАЛЬНІСТЮ \"ІННОВАТЕХ\"",
      code: "43215678",
      iban: "UA213223130000026007233566001",
      ibanConfirmed: true,  // Підтверджено транзакцією
      email: "info@innovatech.ua", 
      phone: "+380442345678",
      address: "м. Київ, вул. Інноваційна, 15",
      type: "legal", 
      isSynced: true,
      role: "buyer",
      balance: 15000,
      lastActivityDate: "2025-01-10",
      activeContractsCount: 2,
      reliabilityScore: 92,
      isEdrsVerified: true,
      status: "active",
      tags: ["VIP", "IT"],
      createdAt: "2023-06-15",
      contacts: [
        { id: "ct1", name: "Петренко Олександр", position: "Директор", phone: "+380501234567", email: "director@innovatech.ua", isPrimary: true },
        { id: "ct2", name: "Коваленко Марія", position: "Бухгалтер", phone: "+380672345678", email: "buh@innovatech.ua" },
      ],
      // KEP onboarding data
      director: "Петренко Олександр Васильович",
      directorPosition: "Директор",
      kveds: ["62.01 — Комп'ютерне програмування", "62.02 — Консультування з питань інформатизації"],
      taxStatus: "Платник ПДВ",
      bankName: "АТ КБ «ПриватБанк»",
      registrationDate: "2019-03-15",
      // FinTech fields
      paymentTermsDays: 30,
      creditLimit: 50000,
      creditUsed: 15000,
    },
{ 
      id: "c2", 
      name: "ФОП Мельник О.В.", 
      code: "3245678901", 
      iban: "UA513223130000026007211234567", 
      email: "melnyk@gmail.com", 
      phone: "+380671234567",
      type: "fop", 
      isSynced: true,
      role: "supplier",
      balance: -5000,
      lastActivityDate: "2025-01-08",
      activeContractsCount: 1,
      reliabilityScore: 78,
      isEdrsVerified: true,
      status: "active",
      tags: ["Постачальник"],
      createdAt: "2024-01-20",
      // KEP onboarding data
      director: "Мельник Олена Володимирівна",
      kveds: ["47.91 — Роздрібна торгівля через Інтернет"],
      taxStatus: "Платник ЄП 3 група",
      bankName: "АТ «Моноbank»",
      registrationDate: "2021-08-20",
      paymentTermsDays: 14,
    },
    { 
      id: "c3", 
      name: "ТОВ \"Глобал Трейд\"", 
      code: "38765432", 
      iban: "UA713223130000026007299887766", 
      type: "legal",
      role: "both",
      balance: 0,
      lastActivityDate: "2024-12-15",
      activeContractsCount: 0,
      reliabilityScore: 45,
      status: "inactive",
      createdAt: "2023-03-10",
    },
    { 
      id: "c4", 
      name: "ПП \"Сервіс Плюс\"", 
      fullName: "ПРИВАТНЕ ПІДПРИЄМСТВО \"СЕРВІС ПЛЮС\"",
      code: "41234567", 
      iban: "UA853223130000026004000012345",
      ibanConfirmed: false,
      email: "office@servisplus.ua",
      phone: "+380442567890",
      address: "м. Київ, вул. Промислова, 25, оф. 12",
      type: "legal", 
      isSynced: false,
      role: "buyer",
      balance: 8500,
      lastActivityDate: "2025-01-05",
      activeContractsCount: 1,
      reliabilityScore: 65,
      isEdrsVerified: false,
      status: "active",
      tags: ["Новий"],
      createdAt: "2024-11-01",
      director: "Кравченко Андрій Миколайович",
      directorPosition: "Директор",
      registrationDate: "2018-05-20",
      kveds: ["33.12 — Ремонт і технічне обслуговування машин і устаткування", "45.20 — Технічне обслуговування та ремонт автотранспортних засобів"],
      taxStatus: "Платник ЄП 3 група",
      bankName: "АТ «Укрсиббанк»",
      paymentTermsDays: 14,
      creditLimit: 15000,
      creditUsed: 0,
      contacts: [
        { 
          id: "c4-ct1", 
          name: "Кравченко Андрій", 
          position: "Директор", 
          phone: "+380501234890", 
          email: "director@servisplus.ua", 
          isPrimary: true 
        },
      ],
    },
    { 
      id: "c5", 
      name: "ФОП Коваленко І.П.", 
      code: "2987654321", 
      iban: "UA313223130000026007255443322", 
      type: "fop",
      role: "supplier",
      balance: -12000,
      lastActivityDate: "2024-12-28",
      activeContractsCount: 1,
      reliabilityScore: 55,
      status: "active",
      notes: "Потребує акт звірки за Q4 2024",
      createdAt: "2024-02-15",
    },
  ];

  if (cabinet.type === "tov") {
    return [
      ...baseContractors,
      { 
        id: "c6", 
        name: "АТ \"Укрзалізниця\"", 
        code: "40075815", 
        iban: "UA253223130000026007200000001", 
        type: "legal", 
        isSynced: true,
        role: "buyer",
        balance: 45000,
        lastActivityDate: "2025-01-09",
        activeContractsCount: 3,
        reliabilityScore: 88,
        isEdrsVerified: true,
        status: "active",
        tags: ["VIP", "Держ.сектор"],
        createdAt: "2022-01-15",
        contacts: [
          { id: "ct3", name: "Шевченко Іван", position: "Менеджер закупівель", email: "procurement@uz.gov.ua", isPrimary: true },
        ]
      },
      { 
        id: "c7", 
        name: "ТОВ \"Логістика Про\"", 
        code: "42876543", 
        type: "legal",
        role: "supplier",
        balance: -3500,
        lastActivityDate: "2025-01-02",
        activeContractsCount: 1,
        reliabilityScore: 72,
        status: "active",
        createdAt: "2024-06-20",
      },
      { 
        id: "c8", 
        name: "ПАТ \"Укртелеком\"", 
        code: "21560766", 
        iban: "UA753223130000026007200000002", 
        type: "legal", 
        isSynced: true,
        role: "supplier",
        balance: 0,
        lastActivityDate: "2025-01-01",
        activeContractsCount: 1,
        reliabilityScore: 95,
        isEdrsVerified: true,
        status: "active",
        createdAt: "2021-05-10",
      },
      { 
        id: "c9", 
        name: "ТОВ \"Хостинг Україна\"", 
        code: "39876543", 
        email: "billing@ukraine.com.ua", 
        type: "legal",
        role: "supplier",
        balance: -1200,
        lastActivityDate: "2024-12-20",
        activeContractsCount: 1,
        reliabilityScore: 68,
        status: "active",
        createdAt: "2023-09-01",
      },
      { 
        id: "c10", 
        name: "ФОП Бондаренко С.М.", 
        code: "3456789012", 
        type: "fop",
        role: "supplier",
        balance: 0,
        lastActivityDate: "2024-11-15",
        activeContractsCount: 0,
        reliabilityScore: 35,
        status: "inactive",
        notes: "Призупинив діяльність",
        createdAt: "2024-03-01",
      },
    ];
  }

  if (cabinet.type === "fop") {
    // Helper for calculating past dates
    const getDateInPast = (days: number): string => {
      const date = new Date();
      date.setDate(date.getDate() - days);
      return date.toISOString().split("T")[0];
    };
    
    return [
      ...baseContractors,
      // Pending contractor - очікує приєднання
      { 
        id: "c-pending-webstart", 
        name: "ТОВ «ВебСтарт»", 
        code: "",  // Порожній — очікує заповнення
        email: "info@webstart.ua", 
        type: "legal", 
        role: "buyer",
        balance: 0,
        status: "active",
        isPending: true,
        invitedAt: getDateInPast(5), // Запрошено 5 днів тому
        inviteId: "invite-webstart-001",
        linkedDocumentIds: ["doc-fop-pending-001"],
        createdAt: getDateInPast(5),
        notes: "Очікує реєстрації для заповнення реквізитів",
      },
      // Filled contractor - успішно онбордився
      {
        id: "c-filled-001",
        name: "ТОВ «ДіджиталМедіа»",
        code: "43876521",
        iban: "UA213223130000026007299887766",
        email: "info@digitalmedia.ua",
        phone: "+380442345678",
        address: "м. Київ, вул. Цифрова, 25",
        type: "legal",
        isSynced: true,
        role: "buyer",
        balance: 0,
        lastActivityDate: getDateInPast(1),
        activeContractsCount: 1,
        reliabilityScore: 85,
        isEdrsVerified: true,
        status: "active",
        tags: ["Маркетинг"],
        createdAt: getDateInPast(3),
        director: "Сидоренко Олексій Петрович",
        directorPosition: "Директор",
        kveds: ["73.11 — Рекламні агентства"],
        taxStatus: "Платник ПДВ",
        bankName: "АТ КБ «ПриватБанк»",
        onboardedAt: getDateInPast(1) + "T15:30:00Z",
      },
      { 
        id: "c6", 
        name: "ТОВ \"Клієнт Один\"", 
        code: "44332211", 
        email: "client1@example.com", 
        type: "legal", 
        isSynced: true,
        role: "buyer",
        balance: 25000,
        lastActivityDate: "2025-01-10",
        activeContractsCount: 1,
        isEdrsVerified: true,
        status: "active",
        tags: ["VIP"],
        createdAt: "2024-04-15",
      },
      { 
        id: "c7", 
        name: "Фізична особа Іванов П.П.", 
        code: "3123456789", 
        type: "individual",
        role: "buyer",
        balance: 0,
        lastActivityDate: "2024-10-20",
        status: "active",
        createdAt: "2024-10-01",
      },
    ];
  }

  if (cabinet.type === "fop-group") {
    return [
      ...baseContractors,
      { 
        id: "c6", 
        name: "ТОВ \"Корпоративний Клієнт\"", 
        code: "45678901", 
        type: "legal", 
        isSynced: true,
        role: "buyer",
        balance: 180000,
        lastActivityDate: "2025-01-10",
        activeContractsCount: 5,
        isEdrsVerified: true,
        status: "active",
        tags: ["VIP", "Enterprise"],
        createdAt: "2022-08-01",
      },
      { 
        id: "c7", 
        name: "ТОВ \"Партнер Груп\"", 
        code: "46789012", 
        type: "legal",
        role: "both",
        balance: -15000,
        lastActivityDate: "2025-01-08",
        activeContractsCount: 2,
        status: "active",
        createdAt: "2023-11-15",
      },
    ];
  }

  // Individual
  return [
    { 
      id: "c1", 
      name: "ТОВ \"Роботодавець\"", 
      code: "43215678", 
      type: "legal",
      role: "buyer",
      balance: 0,
      lastActivityDate: "2025-01-10",
      status: "active",
      createdAt: "2024-01-01",
    },
    { 
      id: "c2", 
      name: "Орендар Петренко В.І.", 
      code: "3111222333", 
      type: "individual",
      role: "buyer",
      balance: 5000,
      lastActivityDate: "2025-01-05",
      status: "active",
      notes: "Орендар квартири",
      createdAt: "2024-06-01",
    },
  ];
};

// ============================================
// НОМЕНКЛАТУРА (Demo Data)
// ============================================

export interface NomenclatureItem {
  id: string;
  name: string;
  code?: string;
  unit: string;            // "шт", "год", "міс" - from unitsConfig
  price: number;
  currency?: string;       // "UAH" - from currencyConfig
  vatRate?: 0 | 7 | 20;    // VAT rate percentage
  category: "service" | "product";
  description?: string;
  isActive?: boolean;
}

// Get nomenclature items for a cabinet
export const getNomenclatureForCabinet = (cabinet: Cabinet): NomenclatureItem[] => {
  if (cabinet.type === "tov") {
    return [
      { id: "n1", code: "CONS-001", name: "Консультаційні послуги", unit: "год", price: 1500, currency: "UAH", vatRate: 20, category: "service", isActive: true },
      { id: "n2", code: "DEV-001", name: "Розробка ПЗ", unit: "год", price: 2500, currency: "UAH", vatRate: 20, category: "service", isActive: true },
      { id: "n3", code: "SUP-001", name: "Технічна підтримка", unit: "міс", price: 15000, currency: "UAH", vatRate: 20, category: "service", isActive: true },
      { id: "n4", code: "EDU-001", name: "Навчання персоналу", unit: "сесія", price: 5000, currency: "UAH", vatRate: 20, category: "service", isActive: true },
      { id: "n5", code: "LIC-001", name: "Ліцензія ПЗ", unit: "шт", price: 25000, currency: "UAH", vatRate: 20, category: "product", isActive: true },
      { id: "n6", code: "SRV-001", name: "Сервер (оренда)", unit: "міс", price: 3500, currency: "UAH", vatRate: 20, category: "service", isActive: true },
      { id: "n7", code: "DSN-001", name: "Дизайн логотипу", unit: "шт", price: 8000, currency: "UAH", vatRate: 20, category: "service", isActive: true },
      { id: "n8", code: "SEO-001", name: "SEO-просування", unit: "міс", price: 12000, currency: "UAH", vatRate: 20, category: "service", isActive: true },
    ];
  }

  if (cabinet.type === "fop") {
    return [
      { id: "n1", code: "IT-001", name: "IT-консультація", unit: "год", price: 1200, currency: "UAH", vatRate: 0, category: "service", description: "Консультація з питань IT", isActive: true },
      { id: "n2", code: "DEV-001", name: "Розробка веб-сайту", unit: "проект", price: 35000, currency: "UAH", vatRate: 0, category: "service", isActive: true },
      { id: "n3", code: "SUP-001", name: "Підтримка сайту", unit: "міс", price: 5000, currency: "UAH", vatRate: 0, category: "service", isActive: true },
      { id: "n4", code: "MOB-001", name: "Розробка мобільного додатку", unit: "проект", price: 80000, currency: "UAH", vatRate: 0, category: "service", isActive: true },
      { id: "n5", code: "API-001", name: "Інтеграція API", unit: "шт", price: 15000, currency: "UAH", vatRate: 0, category: "service", isActive: true },
    ];
  }

  if (cabinet.type === "fop-group") {
    return [
      { id: "n1", code: "ACC-001", name: "Бухгалтерські послуги", unit: "міс", price: 8000, currency: "UAH", vatRate: 0, category: "service", isActive: true },
      { id: "n2", code: "TAX-001", name: "Податкове консультування", unit: "год", price: 1800, currency: "UAH", vatRate: 0, category: "service", isActive: true },
      { id: "n3", code: "AUD-001", name: "Аудит", unit: "проект", price: 25000, currency: "UAH", vatRate: 0, category: "service", isActive: true },
      { id: "n4", code: "REP-001", name: "Звітність ФОП", unit: "квартал", price: 3500, currency: "UAH", vatRate: 0, category: "service", isActive: true },
    ];
  }

  return [];
};

// ============================================
// PROLONGATION POLICY CONFIGURATION
// ============================================

/**
 * Prolongation policy defines default contract renewal behavior.
 * Applied when AI doesn't extract specific terms from contract text.
 * 
 * Priority hierarchy:
 * 1. AI extraction from contract text (highest)
 * 2. Cabinet-level policy (this configuration)
 * 3. System defaults (lowest)
 */
export interface ProlongationPolicy {
  defaultType: "auto" | "manual" | "none";
  noticePeriodDays: number; // Days before contract end to notify
  autoSetReminder: boolean; // Automatically create reminder
}

// Type labels for UI
export const prolongationTypeLabels: Record<ProlongationPolicy["defaultType"], string> = {
  auto: "Автоматична",
  manual: "За заявою сторони",
  none: "Без пролонгації",
};

// Notice period options
export const noticePeriodOptions = [
  { value: 7, label: "7 днів" },
  { value: 14, label: "14 днів" },
  { value: 30, label: "30 днів" },
  { value: 60, label: "60 днів" },
  { value: 90, label: "90 днів" },
] as const;

// System default policy
export const getDefaultProlongationPolicy = (): ProlongationPolicy => ({
  defaultType: "auto",
  noticePeriodDays: 30,
  autoSetReminder: true,
});

// Get prolongation policy for a cabinet (demo - would come from DB)
export const getProlongationPolicyForCabinet = (cabinet: Cabinet): ProlongationPolicy => {
  // Demo: different defaults based on cabinet type
  if (cabinet.type === "tov") {
    return {
      defaultType: "auto",
      noticePeriodDays: 60, // TOV needs more lead time
      autoSetReminder: true,
    };
  }
  
  if (cabinet.type === "fop-group") {
    return {
      defaultType: "manual",
      noticePeriodDays: 30,
      autoSetReminder: true,
    };
  }
  
  return getDefaultProlongationPolicy();
};

// Data source indicator for prolongation
export type ProlongationSource = "document" | "policy" | "system";

export interface ResolvedProlongation {
  type: ProlongationPolicy["defaultType"];
  noticePeriodDays: number;
  source: ProlongationSource;
  reminderDate?: string;
}

/**
 * Resolve prolongation settings from multiple sources.
 * Priority: document extraction > cabinet policy > system default
 */
export const resolveProlongation = (
  extractedFromDocument?: { type?: string; noticePeriod?: number },
  cabinetPolicy?: ProlongationPolicy,
  contractEndDate?: string
): ResolvedProlongation => {
  // Check document extraction first
  if (extractedFromDocument?.type) {
    const type = extractedFromDocument.type as ProlongationPolicy["defaultType"];
    const noticePeriodDays = extractedFromDocument.noticePeriod || cabinetPolicy?.noticePeriodDays || 30;
    
    return {
      type,
      noticePeriodDays,
      source: "document",
      reminderDate: contractEndDate ? calculateReminderDate(contractEndDate, noticePeriodDays) : undefined,
    };
  }
  
  // Use cabinet policy
  if (cabinetPolicy) {
    return {
      type: cabinetPolicy.defaultType,
      noticePeriodDays: cabinetPolicy.noticePeriodDays,
      source: "policy",
      reminderDate: contractEndDate && cabinetPolicy.autoSetReminder 
        ? calculateReminderDate(contractEndDate, cabinetPolicy.noticePeriodDays) 
        : undefined,
    };
  }
  
  // System default
  const defaultPolicy = getDefaultProlongationPolicy();
  return {
    type: defaultPolicy.defaultType,
    noticePeriodDays: defaultPolicy.noticePeriodDays,
    source: "system",
    reminderDate: contractEndDate && defaultPolicy.autoSetReminder 
      ? calculateReminderDate(contractEndDate, defaultPolicy.noticePeriodDays) 
      : undefined,
  };
};

// Calculate reminder date based on contract end and notice period
const calculateReminderDate = (contractEndDate: string, noticePeriodDays: number): string => {
  const endDate = new Date(contractEndDate);
  endDate.setDate(endDate.getDate() - noticePeriodDays);
  return endDate.toISOString().split('T')[0];
};
