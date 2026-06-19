import type { LucideIcon } from "lucide-react";

// ============================================
// REGISTRY SYNC TYPES
// ============================================

export type RegistrySource = 'edr' | 'vat-registry' | 'tax-cabinet' | 'pension-fund';

export interface RegistrySyncStatus {
  isVerified: boolean;
  lastSync?: string;
  source: RegistrySource;
}

export interface EdrSyncStatus extends RegistrySyncStatus {
  source: 'edr';
  readOnlyFields: string[]; // ["name", "taxId", "address", "kveds"]
}

export interface VatSyncStatus extends RegistrySyncStatus {
  source: 'vat-registry';
  vatNumber?: string;
  isVatPayer?: boolean;
}

export interface TaxSyncStatus extends RegistrySyncStatus {
  source: 'tax-cabinet';
  taxGroup?: 1 | 2 | 3;
  taxRate?: number;
}

export interface RegistrySync {
  edr?: EdrSyncStatus;
  vat?: VatSyncStatus;
  tax?: TaxSyncStatus;
}

// ============================================
// CABINET TYPE
// ============================================

/**
 * Можливості (capabilities) кабінету — визначають, які модулі ("Операції")
 * мають відображатися. Виводяться автоматично з профілю кабінету
 * (`deriveCapabilities`) або задаються явно через `Cabinet.capabilities`.
 */
export type CabinetCapability =
  | "warehouse"         // склад: оренда складу, ОЗ-склад або товарна номенклатура
  | "employees"         // наймані працівники → HR / Payroll
  | "vat"               // платник ПДВ → реєстрація ПН
  | "saas_business"     // SaaS-операції: CRM, підписки, партнерська мережа
  | "imports_exports"   // ЗЕД / валютні операції
  | "fixed_assets"      // основні засоби
  | "retail_prro"       // фіскальні чеки ПРРО / роздріб
  | "bookings"          // бронювання послуг від імені бізнесу (зонтична — для гейтів верхнього рівня)
  | "bookings:chair"    // салонна вертикаль (крісло як ресурс)
  | "bookings:court"    // тенісний клуб / спортивний клуб (корт)
  | "bookings:room"     // готель / хостел (номер, date-range)
  | "bookings:table"    // ресторан (столик)
  | "bookings_personal" // [legacy alias = bookings_personal:view] персональний перегляд бронювань (Календар layer)
  | "bookings_personal:view"    // RO-перегляд своїх бронювань у Календарі (будь-яка активна salon-master делегація)
  | "bookings_personal:operate" // повний операційний Щоденник: створення/редагування записів, картки клієнтів (ФОП з workspace_rental/hybrid)
  | "client_book"       // клієнтський хаб: картки клієнтів, RFM-сегменти, лояльність, CRM-sync
  | "goods_sales"       // продажі товарів клієнтам: ритейл, B2B, допродажі на візиті
  | "purchases"         // закупівлі у постачальників: PO, GRN, landed cost, scorecard
  | "delivery";         // курʼєрська доставка замовлень (ресторан/онлайн-магазин)

export interface Cabinet {
  id: string;
  name: string;
  taxId?: string; // ІПН (10 цифр) або ЄДРПОУ (8 цифр)
  type: "fop" | "tov" | "fop-group" | "individual";
  typeLabel: string;
  role: "owner" | "accountant" | "auditor";
  roleLabel: string;
  status: "active" | "archived";
  monthlyIncome?: number;
  reportStatus?: "ok" | "tasks";
  nextDeadline?: string; // ISO date string
  deadlineLabel?: string; // e.g., "Подача декларації"
  fopGroup?: 1 | 2 | 3; // Група ФОП (тільки для type: "fop")
  yearlyIncome?: number; // Дохід з початку року (для розрахунку ліміту ФОП)
  hasEmployees?: boolean; // Чи є наймані працівники (для ФОП)
  industry?: "it" | "trade" | "services" | "manufacturing" | "consulting" | "autorepair" | "dealer" | "investing" | "salon" | "tennis_club" | "restaurant" | "hotel"; // Галузь для бенчмаркінгу
  /** Явний override активних модулів. Якщо не заданий — `deriveCapabilities`. */
  capabilities?: CabinetCapability[];
  // Passive cabinet mode (for contractors who registered via invitation)
  accessMode?: "full" | "passive";
  invitedByCabinetId?: string;
  invitedAt?: string;
  // Registry synchronization status
  registrySync?: RegistrySync;
}

export interface EntityStyle {
  icon: LucideIcon;
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  badgeClass: string;
  dotColor: string;
  accentBorder: string;
  chipBorderColor: string;
  pillActiveClass: string;
}

export type CabinetType = Cabinet["type"];
export type CabinetRole = Cabinet["role"];
export type CabinetStatus = Cabinet["status"];
