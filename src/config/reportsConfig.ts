import { BookOpen, Users, Link, FileText, Calendar, AlertTriangle, CheckCircle2, Clock, XCircle, Send, FileEdit, Shield, Building2, Landmark, CalendarClock, Loader2, Eye } from "lucide-react";

// ========== ТИПИ ==========

// Типи звітів (розширено)
export type ReportType = 
  | "ep"      // Єдиний податок
  | "esv"     // ЄСВ (за себе)
  | "esv-emp" // ЄСВ (за працівників) - NEW
  | "vz"      // Військовий збір (з доходу ФОП)
  | "vz-emp"  // Військовий збір (з виплат працівникам) - NEW
  | "mpz"     // Мінімальне податкове зобов'язання
  | "pdfo"    // ПДФО (для ФОП із працівниками)
  | "1df"     // Об'єднаний звіт (ПДФО + ВЗ + ЄСВ) - NEW
  | "stat"    // Статистичний звіт
  | "other";

// Статуси звітів (Autonomous Report Lifecycle)
// Включає legacy статуси для зворотної сумісності з демо-даними
export type ReportStatus = 
  | "scheduled"       // Заплановано (AI знає дату генерації) - NEW (replaces not-formed)
  | "processing"      // Формується (AI обробляє дані) - NEW
  | "review"          // На перевірку (готово для користувача) - NEW (replaces draft)
  | "approved"        // Підтверджено (готово до подання) - NEW (replaces ready)
  | "submitted"       // Подано
  | "accepted"        // Прийнято
  | "rejected"        // Відхилено
  // Legacy (deprecated, use new statuses)
  | "draft"           // @deprecated - use "review"
  | "ready"           // @deprecated - use "approved"  
  | "not-formed";     // @deprecated - use "scheduled"

// Маппінг старих статусів на нові
export function migrateReportStatus(status: ReportStatus): ReportStatus {
  switch (status) {
    case "not-formed": return "scheduled";
    case "draft": return "review";
    case "ready": return "approved";
    default: return status;
  }
}

// Період звітності
export type ReportPeriod = "Q1" | "Q2" | "Q3" | "Q4" | "year" | "month";

// Джерела даних
export type ReportDataSource = "income-book" | "employees" | "integrations" | "manual";

// Групи ФОП
export type FopGroup = 1 | 2 | 3;

// Канал подання — єдиний офіційний (Електронний кабінет ДПС)
export type SubmissionChannelId = "tax-cabinet";

// Legacy ID-шники (для зворотної сумісності існуючих записів) — мігруються до "tax-cabinet"
export type LegacySubmissionChannelId = "dps-cabinet" | "diia" | "medoc" | "sonata" | "vchasno";

/** Мігрує застарілий канал подання до єдиного "tax-cabinet" */
export function migrateChannelId(channel: SubmissionChannelId | LegacySubmissionChannelId | undefined): SubmissionChannelId {
  return "tax-cabinet";
}

// ========== ІНТЕРФЕЙСИ ==========

// Конфігурація форми ДПС
export interface ReportFormConfig {
  formCode: string;         // F0103308
  formName: string;         // Декларація платника ЄП
  formVersion: string;      // Версія бланку
  downloadUrl?: string;     // Посилання на бланк ДПС
  instructions?: string;    // Інструкція з заповнення
}

// Канал подання
export interface SubmissionChannel {
  id: SubmissionChannelId;
  name: string;
  shortName: string;
  url: string;
  icon: typeof Building2;
  isAvailable: boolean;           // Чи підтримується
  supportedReportTypes: ReportType[];
  requiresKep: boolean;           // Чи потрібен КЕП
  description: string;
}

// Законодавча база
export interface LegalReference {
  article: string;          // ст. 295.1 ПКУ
  description: string;
  rate?: string;            // 5%, 1% тощо
  deadline?: string;        // Опис дедлайну
  effectiveFrom?: string;   // Дата набрання чинності
  deprecated?: boolean;     // Тип звіту deprecated (не показувати у "Створити")
}

// Розрахунок для ЄП
export interface EPCalculation {
  totalIncome: number;            // Загальний дохід за період
  taxRate: number;                // Ставка ЄП (5% для 3 групи, 0 для 2 групи - фіксований)
  calculatedTax: number;          // Розрахований ЄП
  paidAdvances?: number;          // Сплачені авансові платежі
  toPay: number;                  // До сплати
}

// Розрахунок для ЄСВ
export interface ESVCalculation {
  minContribution: number;        // Мінімальний внесок
  monthsCount: number;            // Кількість місяців
  totalESV: number;               // Сума ЄСВ
  paidAmount?: number;            // Вже сплачено
  toPay: number;                  // До сплати
}

// Розрахунок для Військового збору (NEW)
export interface VZCalculation {
  baseAmount: number;             // База оподаткування (чистий дохід)
  rate: number;                   // Ставка (1% або 5%)
  calculatedVZ: number;           // Розрахований ВЗ
  paidAmount?: number;            // Вже сплачено
  toPay: number;                  // До сплати
  isLinkedToEP: boolean;          // Чи прив'язаний до декларації ЄП
}

// Розрахунок для Об'єднаного звіту 1ДФ (NEW)
export interface OnedfCalculation {
  employeesCount: number;           // Кількість працівників
  totalSalary: number;              // Загальна нарахована ЗП
  pdfo: number;                     // ПДФО (18%)
  vz: number;                       // Військовий збір (5%)
  esv: number;                      // ЄСВ роботодавця (22%)
  totalTaxes: number;               // Всього податків
}

// Об'єднаний тип розрахунку
export type ReportCalculation = {
  type: "ep";
  data: EPCalculation;
} | {
  type: "esv";
  data: ESVCalculation;
} | {
  type: "vz";
  data: VZCalculation;
} | {
  type: "1df";
  data: OnedfCalculation;
};

// Історія змін
export interface ReportHistoryItem {
  date: string;
  action: string;
  user?: string;
  role?: string;
}

// Пов'язаний платіж
export interface RelatedPayment {
  id: string;
  type: "ep" | "esv" | "vz";
  amount: number;
  deadline: string;
  status: "pending" | "paid" | "overdue";
}

// Квитанція ДПС
export interface DPSReceipt {
  id: string;
  number: string;                  // Номер квитанції
  date: string;                    // ISO date
  documentId?: string;             // Посилання на документ в Document Flow
}

// Деталі відхилення звіту
export interface RejectionDetails {
  reason: string;                  // Текст помилки
  code?: string;                   // Код помилки ДПС
  date: string;                    // ISO date
  correctionDeadline?: string;     // Термін на виправлення
}

// Основний інтерфейс звіту (розширено)
export interface Report {
  id: string;
  type: ReportType;
  typeLabel: string;
  name: string;                    // "Декларація ЄП за ІІ квартал 2025"
  period: ReportPeriod;
  periodLabel: string;             // "ІІ квартал 2025"
  year: number;
  quarter?: number;
  month?: number;
  deadline: string;                // ISO date
  status: ReportStatus;
  statusLabel: string;
  draftProgress?: number;          // 0-100% готовності чернетки
  amountToPay?: number;            // Сума до сплати
  submittedDate?: string;          // Дата подання
  acceptedDate?: string;           // Дата прийняття
  dataSources: ReportDataSource[];
  calculation?: ReportCalculation;
  history?: ReportHistoryItem[];
  cabinetId: string;
  
  // Form & legal fields
  formCode?: string;               // Код форми ДПС (F0103308)
  militaryTax?: VZCalculation;     // Розрахунок Військового збору
  submissionChannel?: SubmissionChannelId | LegacySubmissionChannelId; // Обраний канал подання (legacy auto-migrated)
  legalBasis?: LegalReference;     // Законодавча підстава
  relatedPaymentIds?: string[];    // ID пов'язаних платежів
  fopGroup?: FopGroup;             // Група ФОП для визначення періодичності
  
  // Submission proof fields
  receipt1?: DPSReceipt;           // Квитанція №1 (підтвердження отримання)
  receipt2?: DPSReceipt;           // Квитанція №2 (прийняття ДПС)
  rejectionDetails?: RejectionDetails; // Деталі відхилення
  
  // Correction fields
  isCorrection?: boolean;              // Чи це коригуючий звіт
  correctionOf?: string;               // ID оригінального звіту
  correctionNumber?: number;           // Номер корекції (1, 2, 3...)
  correctionReason?: string;           // Причина корекції
  originalRejectionCode?: string;      // Код помилки оригінального звіту
  
  // Amendment diff (уточнююча декларація)
  amendmentDiff?: AmendmentDiffItem[]; // Порівняння з первинною декларацією

  // Payment lifecycle (independent from report submission lifecycle)
  paymentStatus?: "paid" | "pending" | "overdue"; // Статус сплати податку за звітом
  paymentDate?: string;            // Дата сплати (ISO)
  paymentReference?: string;       // № платіжного доручення (для трасування)
}

// Рядок порівняння уточнюючої декларації з первинною
export interface AmendmentDiffItem {
  field: string;                       // Технічна назва поля
  label: string;                       // Людська назва
  oldValue: string | number | null;    // Було (null = не було)
  newValue: string | number | null;    // Стало (null = видалено)
  changeType: "added" | "changed" | "removed";
}

// ========== КОНФІГУРАЦІЇ ==========

// Форми ДПС
export const reportFormConfigs: Record<string, ReportFormConfig> = {
  "ep-q3": { 
    formCode: "F0103308", 
    formName: "Декларація платника єдиного податку — фізичної особи-підприємця", 
    formVersion: "2024.01",
    downloadUrl: "https://tax.gov.ua/data/forms/F0103308.pdf",
    instructions: "Подається за результатами кварталу протягом 40 днів"
  },
  "ep-y12": { 
    formCode: "F0103406", 
    formName: "Декларація платника єдиного податку 1-2 групи (річна)", 
    formVersion: "2024.01",
    downloadUrl: "https://tax.gov.ua/data/forms/F0103406.pdf",
    instructions: "Подається за результатами року до 1 березня"
  },
  "esv": { 
    formCode: "F0133108", 
    formName: "Звіт про суми нарахованого ЄСВ", 
    formVersion: "2024.02",
    downloadUrl: "https://tax.gov.ua/data/forms/F0133108.pdf",
    instructions: "Подається разом з декларацією ЄП"
  },
  "esv-emp": { 
    formCode: "F0133108-D1", 
    formName: "ЄСВ за найманих працівників (Додаток 1)", 
    formVersion: "2024.02",
    downloadUrl: "https://tax.gov.ua/data/forms/F0133108.pdf",
    instructions: "Подається щомісяця до 20 числа наступного місяця"
  },
  "mpz": { 
    formCode: "F0133208", 
    formName: "Додаток 1 (МПЗ) до декларації ЄП", 
    formVersion: "2024.01",
    downloadUrl: "https://tax.gov.ua/data/forms/F0133208.pdf",
    instructions: "Обов'язковий для власників земельних ділянок"
  },
  "vz": {
    formCode: "F0103308-VZ",
    formName: "Військовий збір (включено до декларації ЄП)",
    formVersion: "2024.12",
    instructions: "Автоматично розраховується та включається до декларації ЄП"
  },
  "1df": {
    formCode: "F0500107",
    formName: "Податковий розрахунок сум доходу, нарахованого (сплаченого) на користь платників податків — фізичних осіб, і сум утриманого з них податку, а також сум нарахованого єдиного внеску (з Додатком 4ДФ)",
    formVersion: "2025.01",
    downloadUrl: "https://tax.gov.ua/data/forms/F0500107.pdf",
    instructions: "Подається щокварталу протягом 40 календарних днів після закінчення звітного кварталу"
  },
};

// Канал подання — єдиний офіційний (Електронний кабінет ДПС)
export const submissionChannels: SubmissionChannel[] = [
  {
    id: "tax-cabinet",
    name: "Електронний кабінет платника податків",
    shortName: "Кабінет ДПС",
    url: "https://cabinet.tax.gov.ua",
    icon: Landmark,
    isAvailable: true,
    supportedReportTypes: ["ep", "esv", "esv-emp", "vz", "vz-emp", "mpz", "pdfo", "1df", "stat", "other"],
    requiresKep: true,
    description: "Офіційний сервіс ДПС України (cabinet.tax.gov.ua). Потребує КЕП. Безкоштовно. Підтримує всі типи звітів."
  },
];

// Законодавча база за типами звітів
export const legalBasisConfig: Record<ReportType, LegalReference> = {
  ep: {
    article: "ст. 295-297 ПКУ",
    description: "Подається декларація з розрахунком єдиного податку",
    rate: "5% (3 група) / фіксована (1-2 група)",
    deadline: "40 днів після кварталу (3 група) / до 1 березня (1-2 група)"
  },
  esv: {
    article: "ст. 6, 7, 8 ЗУ «Про ЄСВ»",
    description: "ФОП на ЄП сплачує ЄСВ за себе щокварталу. Звіт подається у складі річної декларації ЄП.",
    rate: "22% від мінімальної зарплати",
    deadline: "До 19 числа місяця, наступного за звітним кварталом"
  },
  "esv-emp": {
    article: "ст. 7, 8 ЗУ «Про ЄСВ»",
    description: "ЄСВ роботодавця за найманих працівників. Окремо НЕ подається — входить до Додатку Д1 Податкового розрахунку (4ДФ).",
    rate: "22% від нарахованої зарплати",
    deadline: "У складі Податкового розрахунку (4ДФ) — 40 днів після кварталу",
    deprecated: true,
  },
  vz: {
    article: "п. 161.7 підрозд. 10 розд. XX ПКУ",
    description: "Військовий збір для ФОП 3 групи — 1% від доходу, для 1-2 групи — фіксована сума 10% від мінімальної зарплати.",
    rate: "1% від доходу (3 група) / фіксована сума (1-2 група)",
    deadline: "Разом з декларацією ЄП",
    effectiveFrom: "2024-10-01"
  },
  "vz-emp": {
    article: "п. 161 підрозд. 10 розд. XX ПКУ",
    description: "Військовий збір з виплат найманим працівникам. До 31.12.2024 — 1,5%; з 01.01.2025 — 5% (ЗУ №4015-IX).",
    rate: "1,5% (до 31.12.2024) / 5% (з 01.01.2025)",
    deadline: "У складі Податкового розрахунку (4ДФ) — 40 днів після кварталу",
    effectiveFrom: "2025-01-01"
  },
  mpz: {
    article: "ст. 38-1, п. 297.1 ПКУ",
    description: "Мінімальне податкове зобов'язання для власників земельних ділянок. УВАГА: дія МПЗ призупинена для деяких категорій земель на період воєнного стану (ЗУ №2120-IX).",
    rate: "Розраховується за формулою МПЗ",
    deadline: "Разом з річною декларацією"
  },
  pdfo: {
    article: "ст. 168-176 ПКУ",
    description: "Податок на доходи фізичних осіб з виплат працівникам. Утримання включається до Податкового розрахунку (4ДФ).",
    rate: "18%",
    deadline: "У складі Податкового розрахунку (4ДФ) — 40 днів після кварталу"
  },
  "1df": {
    article: "ст. 51, 70, 176 ПКУ",
    description: "Податковий розрахунок сум доходу, нарахованого на користь фізичних осіб, та утриманих податків (Додаток 4ДФ + Додатки Д1, Д5, Д6 по ЄСВ). Чинна форма F0500107.",
    rate: "ПДФО 18% + ВЗ 1,5% (до 2025) / 5% (з 01.01.2025) + ЄСВ 22%",
    deadline: "Протягом 40 календарних днів після закінчення звітного кварталу"
  },
  stat: {
    article: "ЗУ «Про державну статистику»",
    description: "Статистична звітність (за потреби)",
    deadline: "Згідно з вимогами органів статистики"
  },
  other: {
    article: "—",
    description: "Інші форми звітності"
  },
};

// Конфігурація типів звітів
export const reportTypeConfig: Record<ReportType, { 
  label: string; 
  shortLabel: string; 
  color: string;
  icon: typeof FileText;
}> = {
  ep: { label: "Єдиний податок (ЄП)", shortLabel: "ЄП", color: "emerald", icon: FileText },
  esv: { label: "Єдиний соціальний внесок (ЄСВ)", shortLabel: "ЄСВ", color: "blue", icon: FileText },
  "esv-emp": { label: "ЄСВ за працівників (Додаток Д1)", shortLabel: "Д1", color: "blue", icon: Users },
  vz: { label: "Військовий збір (ВЗ)", shortLabel: "ВЗ", color: "amber", icon: Shield },
  "vz-emp": { label: "ВЗ з виплат працівникам", shortLabel: "ВЗ ЗП", color: "amber", icon: Users },
  mpz: { label: "Мінімальне податкове зобов'язання", shortLabel: "МПЗ", color: "purple", icon: FileText },
  pdfo: { label: "ПДФО", shortLabel: "ПДФО", color: "rose", icon: FileText },
  "1df": { label: "Податковий розрахунок (4ДФ)", shortLabel: "4ДФ", color: "indigo", icon: Users },
  stat: { label: "Статистичний звіт", shortLabel: "Стат.", color: "slate", icon: FileText },
  other: { label: "Інший звіт", shortLabel: "Інше", color: "slate", icon: FileText },
};

// Конфігурація статусів (Autonomous Report Lifecycle)
export const reportStatusConfig: Record<ReportStatus, { 
  label: string; 
  description: string;
  icon: typeof CheckCircle2;
  className: string;
}> = {
  scheduled: { 
    label: "Очікує даних / в черзі AI", 
    description: "AI сформує автоматично за графіком, коли надійдуть дані",
    icon: CalendarClock,
    className: "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400"
  },
  processing: { 
    label: "Формується", 
    description: "AI обробляє дані",
    icon: Loader2,
    className: "bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400"
  },
  review: { 
    label: "На перевірку", 
    description: "Готово для вашої перевірки",
    icon: Eye,
    className: "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
  },
  approved: { 
    label: "Підтверджено", 
    description: "Готово до подання",
    icon: Send,
    className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
  },
  submitted: { 
    label: "Подано", 
    description: "Відправлено до ДПС",
    icon: Clock,
    className: "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400"
  },
  accepted: { 
    label: "Прийнято", 
    description: "Успішно прийнято ДПС",
    icon: CheckCircle2,
    className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
  },
  rejected: { 
    label: "Відхилено", 
    description: "Потребує корекції",
    icon: XCircle,
    className: "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400"
  },
  // Legacy statuses (deprecated - mapped to new ones in UI)
  draft: { 
    label: "На перевірку", 
    description: "Готово для вашої перевірки",
    icon: Eye,
    className: "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
  },
  ready: { 
    label: "Підтверджено", 
    description: "Готово до подання",
    icon: Send,
    className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
  },
  "not-formed": { 
    label: "Очікує даних / в черзі AI", 
    description: "AI сформує автоматично за графіком, коли надійдуть дані",
    icon: CalendarClock,
    className: "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400"
  },
};

// ========== Канонічні хелпери статусу (єдине джерело істини для UI) ==========

/**
 * Канонічний лейбл статусу — використовується в шапці звіту, таблиці, KPI.
 * Гарантує однакові лейбли в усіх місцях UI.
 */
export function getCanonicalStatusLabel(status: ReportStatus): string {
  const normalized = migrateReportStatus(status);
  switch (normalized) {
    case "scheduled":  return "Заплановано";
    case "processing": return "Формується AI";
    case "review":     return "На перевірку";
    case "approved":   return "Підтверджено";
    case "submitted":  return "Подано";
    case "accepted":   return "Прийнято ДПС";
    case "rejected":   return "Відхилено ДПС";
    default:           return normalized;
  }
}

/**
 * Позиція статусу в 6-кроковому lifecycle-stepper'і.
 * 1 Заплановано → 2 Формується → 3 На перевірку → 4 Підтверджено → 5 Подано → 6 Прийнято
 * `rejected` повертає крок 5 з прапорцем error.
 */
export function getLifecycleStep(status: ReportStatus): {
  current: number;
  total: number;
  hasError: boolean;
} {
  const normalized = migrateReportStatus(status);
  const total = 6;
  switch (normalized) {
    case "scheduled":  return { current: 1, total, hasError: false };
    case "processing": return { current: 2, total, hasError: false };
    case "review":     return { current: 3, total, hasError: false };
    case "approved":   return { current: 4, total, hasError: false };
    case "submitted":  return { current: 5, total, hasError: false };
    case "accepted":   return { current: 6, total, hasError: false };
    case "rejected":   return { current: 5, total, hasError: true };
    default:           return { current: 1, total, hasError: false };
  }
}

/**
 * Семантичний варіант кольору для бейджа статусу.
 */
export type StatusVariant = "sky" | "amber" | "emerald" | "destructive" | "muted";

export function getStatusVariant(status: ReportStatus): StatusVariant {
  const normalized = migrateReportStatus(status);
  switch (normalized) {
    case "scheduled":
    case "processing":
    case "submitted":  return "sky";
    case "review":     return "amber";
    case "approved":
    case "accepted":   return "emerald";
    case "rejected":   return "destructive";
    default:           return "muted";
  }
}

/**
 * Tailwind-класи для бейджа за варіантом (HSL semantic tokens-friendly).
 */
export function getStatusBadgeClasses(variant: StatusVariant): string {
  switch (variant) {
    case "sky":         return "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/30 dark:text-sky-300 dark:border-sky-800";
    case "amber":       return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-800";
    case "emerald":     return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-800";
    case "destructive": return "bg-destructive/10 text-destructive border-destructive/30";
    default:            return "bg-muted text-muted-foreground border-border";
  }
}

/**
 * Режим відображення реквізитів для PaymentRequisitesBlock на основі статусу звіту.
 * - hidden: до подання реквізити не показуємо (scheduled/processing/review)
 * - preview: реквізити без QR + жовтий банер «не сплачуйте до подання» (approved)
 * - full: повні реквізити з QR (submitted/accepted)
 */
export type RequisitesMode = "hidden" | "preview" | "full";

export function getRequisitesMode(status: ReportStatus): RequisitesMode {
  const normalized = migrateReportStatus(status);
  switch (normalized) {
    case "scheduled":
    case "processing":
    case "review":
    case "rejected":   return "hidden";
    case "approved":   return "preview";
    case "submitted":
    case "accepted":   return "full";
    default:           return "hidden";
  }
}

// Конфігурація джерел даних
export const dataSourceConfig: Record<ReportDataSource, { 
  label: string; 
  icon: typeof BookOpen;
}> = {
  "income-book": { label: "Книга доходів", icon: BookOpen },
  employees: { label: "Працівники", icon: Users },
  integrations: { label: "Інтеграції", icon: Link },
  manual: { label: "Вручну", icon: FileText },
};

// ========== КОНСТАНТИ ==========

// ЄСВ мінімальний внесок за роками (грн/міс)
export const ESV_MIN_BY_YEAR: Record<number, number> = {
  2023: 1474,
  2024: 1600,
  2025: 1760,
  2026: 1936, // прогноз
};

// Мінімальна зарплата за роками (грн)
export const MIN_SALARY_BY_YEAR: Record<number, number> = {
  2023: 6700,
  2024: 7100,
  2025: 8000,
  2026: 8800, // прогноз
};

// Фіксований ЄП 1 групи за роками (грн/міс, до 10% мін.ЗП)
export const EP_FIXED_GROUP_1: Record<number, number> = {
  2023: 268.4,
  2024: 302.4,
  2025: 302.4,
  2026: 352.0, // прогноз
};

// Фіксований ЄП 2 групи за роками (грн/міс, до 20% мін.ЗП)
export const EP_FIXED_GROUP_2: Record<number, number> = {
  2023: 1340,
  2024: 1420,
  2025: 1600,
  2026: 1760, // прогноз
};

// Мінімальний внесок ЄСВ на 2025 рік (для зворотної сумісності)
export const ESV_MIN_2025 = 1760; // грн/місяць

// Мінімальна зарплата 2025 (для зворотної сумісності)
export const MIN_SALARY_2025 = 8000; // грн

// Ставка ВЗ для ФОП 3 групи (з 01.12.2024)
export const VZ_RATE_GROUP_3 = 0.01; // 1%

// Фіксований ВЗ для ФОП 1-2 групи (з 01.12.2024)
export const VZ_FIXED_GROUP_1 = 800; // грн/міс
export const VZ_FIXED_GROUP_2 = 2000; // грн/міс

// ========== ДЕМО-ДАНІ ==========

// Демо-дані звітів
export const demoReports: Report[] = [
  // ФОП Іваненко (ID: "2", 3 група) — свіжий поданий звіт з відкритим боргом (демо потоку оплати)
  {
    id: "rep-ivanenko-2026-q1-ep-unpaid",
    cabinetId: "2",
    type: "ep",
    typeLabel: "Єдиний податок (ЄП)",
    name: "Декларація ЄП за I квартал 2026",
    period: "Q1",
    periodLabel: "I квартал 2026",
    year: 2026,
    quarter: 1,
    deadline: "2026-05-10",
    status: "submitted",
    statusLabel: "Подано",
    amountToPay: 23750,
    submittedDate: "2026-04-18",
    dataSources: ["income-book", "integrations"],
    formCode: "F0103308",
    fopGroup: 3,
    legalBasis: legalBasisConfig.ep,
    submissionChannel: "dps-cabinet",
    receipt1: {
      id: "rcpt1-2026q1",
      number: "9001234567892026",
      date: "2026-04-18T10:30:00Z",
    },
    calculation: {
      type: "ep",
      data: {
        totalIncome: 475000,
        taxRate: 5,
        calculatedTax: 23750,
        toPay: 23750,
      },
    },
    militaryTax: {
      baseAmount: 475000,
      rate: 1,
      calculatedVZ: 4750,
      toPay: 4750,
      isLinkedToEP: true,
    },
    paymentStatus: "pending",
    history: [
      { date: "2026-04-10", action: "Створено чернетку", role: "Бухгалтер" },
      { date: "2026-04-18", action: "Подано до ДПС (Квитанція №1)", role: "Власник" },
    ],
  },
  {
    id: "rep-1",
    cabinetId: "2",
    type: "ep",
    typeLabel: "Єдиний податок (ЄП)",
    name: "Декларація ЄП за I квартал 2025",
    period: "Q1",
    periodLabel: "I квартал 2025",
    year: 2025,
    quarter: 1,
    deadline: "2025-05-09",
    status: "accepted",
    statusLabel: "Прийнято",
    amountToPay: 21250,
    submittedDate: "2025-05-02",
    acceptedDate: "2025-05-05",
    dataSources: ["income-book", "integrations"],
    formCode: "F0103308",
    fopGroup: 3,
    legalBasis: legalBasisConfig.ep,
    submissionChannel: "dps-cabinet",
    // Докази подання
    receipt1: {
      id: "rcpt1-rep1",
      number: "9001234567890123",
      date: "2025-05-02T10:30:00Z",
    },
    receipt2: {
      id: "rcpt2-rep1",
      number: "9001234567890456",
      date: "2025-05-05T14:15:00Z",
    },
    calculation: {
      type: "ep",
      data: {
        totalIncome: 425000,
        taxRate: 5,
        calculatedTax: 21250,
        toPay: 21250,
      }
    },
    militaryTax: {
      baseAmount: 425000,
      rate: 1,
      calculatedVZ: 4250,
      toPay: 4250,
      isLinkedToEP: true,
    },
    relatedPaymentIds: ["tax-ep-q1-2025", "tax-vz-q1-2025"],
    paymentStatus: "paid",
    paymentDate: "2025-05-08",
    history: [
      { date: "2025-04-15", action: "Створено чернетку", role: "Бухгалтер" },
      { date: "2025-05-01", action: "Підготовлено до подання", role: "Бухгалтер" },
      { date: "2025-05-02", action: "Подано до ДПС (Квитанція №1)", role: "Власник" },
      { date: "2025-05-05", action: "Прийнято ДПС (Квитанція №2)", role: "Система" },
      { date: "2025-05-08", action: "Сплачено ЄП + ВЗ", role: "Власник" },
    ],
  },
  {
    id: "rep-2",
    cabinetId: "2",
    type: "esv",
    typeLabel: "ЄСВ",
    name: "Звіт ЄСВ за I квартал 2025",
    period: "Q1",
    periodLabel: "I квартал 2025",
    year: 2025,
    quarter: 1,
    deadline: "2025-05-09",
    status: "submitted",
    statusLabel: "Подано",
    amountToPay: 5280,
    submittedDate: "2025-05-02",
    dataSources: ["manual"],
    formCode: "F0133108",
    fopGroup: 3,
    legalBasis: legalBasisConfig.esv,
    submissionChannel: "dps-cabinet",
    // Квитанція №1 (очікується Квитанція №2)
    receipt1: {
      id: "rcpt1-rep2",
      number: "9001234567890789",
      date: "2025-05-02T11:00:00Z",
    },
    calculation: {
      type: "esv",
      data: {
        minContribution: ESV_MIN_2025,
        monthsCount: 3,
        totalESV: 5280,
        toPay: 5280,
      }
    },
    relatedPaymentIds: ["tax-esv-q1-2025"],
    paymentStatus: "paid",
    paymentDate: "2025-05-09",
    history: [
      { date: "2025-04-20", action: "Створено чернетку", role: "Бухгалтер" },
      { date: "2025-05-02", action: "Подано до ДПС (Квитанція №1)", role: "Власник" },
      { date: "2025-05-09", action: "Сплачено ЄСВ", role: "Власник" },
    ],
  },
  {
    id: "rep-3",
    cabinetId: "2",
    type: "ep",
    typeLabel: "Єдиний податок (ЄП)",
    name: "Декларація ЄП за II квартал 2025",
    period: "Q2",
    periodLabel: "II квартал 2025",
    year: 2025,
    quarter: 2,
    deadline: "2025-08-09",
    status: "review",
    statusLabel: "На перевірку",
    draftProgress: 80,
    amountToPay: 22500,
    dataSources: ["income-book", "integrations"],
    formCode: "F0103308",
    fopGroup: 3,
    legalBasis: legalBasisConfig.ep,
    calculation: {
      type: "ep",
      data: {
        totalIncome: 450000,
        taxRate: 5,
        calculatedTax: 22500,
        toPay: 22500,
      }
    },
    militaryTax: {
      baseAmount: 450000,
      rate: 1,
      calculatedVZ: 4500,
      toPay: 4500,
      isLinkedToEP: true,
    },
    paymentStatus: "pending",
    history: [
      { date: "2025-06-20", action: "Створено чернетку", role: "Система" },
      { date: "2025-07-01", action: "Оновлено дані з Книги доходів", role: "Система" },
    ],
  },
  {
    id: "rep-vz-1",
    cabinetId: "2",
    type: "vz",
    typeLabel: "Військовий збір",
    name: "Військовий збір за II квартал 2025",
    period: "Q2",
    periodLabel: "II квартал 2025",
    year: 2025,
    quarter: 2,
    deadline: "2025-08-09",
    status: "review",
    statusLabel: "На перевірку",
    draftProgress: 80,
    amountToPay: 4500,
    dataSources: ["income-book"],
    fopGroup: 3,
    legalBasis: legalBasisConfig.vz,
    calculation: {
      type: "vz",
      data: {
        baseAmount: 450000,
        rate: 1,
        calculatedVZ: 4500,
        toPay: 4500,
        isLinkedToEP: true,
      }
    },
    paymentStatus: "pending",
    history: [
      { date: "2025-06-20", action: "Автоматично створено з декларацією ЄП", role: "Система" },
    ],
  },
  {
    id: "rep-4",
    cabinetId: "2",
    type: "esv",
    typeLabel: "ЄСВ",
    name: "Звіт ЄСВ за II квартал 2025",
    period: "Q2",
    periodLabel: "II квартал 2025",
    year: 2025,
    quarter: 2,
    deadline: "2025-08-09",
    status: "review",
    statusLabel: "На перевірку",
    draftProgress: 50,
    amountToPay: 5280,
    dataSources: ["manual"],
    formCode: "F0133108",
    fopGroup: 3,
    legalBasis: legalBasisConfig.esv,
    calculation: {
      type: "esv",
      data: {
        minContribution: ESV_MIN_2025,
        monthsCount: 3,
        totalESV: 5280,
        toPay: 5280,
      }
    },
    paymentStatus: "pending",
    history: [
      { date: "2025-06-25", action: "Створено чернетку", role: "Система" },
    ],
  },
  {
    id: "rep-5",
    cabinetId: "2",
    type: "ep",
    typeLabel: "Єдиний податок (ЄП)",
    name: "Декларація ЄП за III квартал 2024",
    period: "Q3",
    periodLabel: "III квартал 2024",
    year: 2024,
    quarter: 3,
    deadline: "2024-11-09",
    status: "accepted",
    statusLabel: "Прийнято",
    amountToPay: 18750,
    submittedDate: "2024-11-01",
    acceptedDate: "2024-11-04",
    dataSources: ["income-book"],
    formCode: "F0103308",
    fopGroup: 3,
    calculation: {
      type: "ep",
      data: {
        totalIncome: 375000,
        taxRate: 5,
        calculatedTax: 18750,
        toPay: 18750,
      }
    },
    paymentStatus: "paid",
    paymentDate: "2024-11-08",
    history: [
      { date: "2024-10-15", action: "Створено чернетку", role: "Бухгалтер" },
      { date: "2024-11-01", action: "Подано до ДПС", role: "Власник" },
      { date: "2024-11-04", action: "Прийнято ДПС", role: "Система" },
      { date: "2024-11-08", action: "Сплачено ЄП", role: "Власник" },
    ],
  },
  {
    id: "rep-6",
    cabinetId: "2",
    type: "ep",
    typeLabel: "Єдиний податок (ЄП)",
    name: "Декларація ЄП за IV квартал 2024",
    period: "Q4",
    periodLabel: "IV квартал 2024",
    year: 2024,
    quarter: 4,
    deadline: "2025-02-09",
    status: "accepted",
    statusLabel: "Прийнято",
    amountToPay: 19500,
    submittedDate: "2025-02-01",
    acceptedDate: "2025-02-04",
    dataSources: ["income-book", "integrations"],
    formCode: "F0103308",
    fopGroup: 3,
    calculation: {
      type: "ep",
      data: {
        totalIncome: 390000,
        taxRate: 5,
        calculatedTax: 19500,
        toPay: 19500,
      }
    },
    // ВЗ за Q4 2024 — перший період після 01.12.2024
    militaryTax: {
      baseAmount: 130000, // тільки грудень 2024
      rate: 1,
      calculatedVZ: 1300,
      toPay: 1300,
      isLinkedToEP: true,
    },
    paymentStatus: "paid",
    paymentDate: "2025-02-08",
    history: [
      { date: "2025-01-10", action: "Створено чернетку", role: "Бухгалтер" },
      { date: "2025-02-01", action: "Подано до ДПС", role: "Власник" },
      { date: "2025-02-04", action: "Прийнято ДПС", role: "Система" },
      { date: "2025-02-08", action: "Сплачено ЄП + ВЗ", role: "Власник" },
    ],
  },
  {
    id: "rep-7",
    cabinetId: "2",
    type: "esv",
    typeLabel: "ЄСВ",
    name: "Звіт ЄСВ за IV квартал 2024",
    period: "Q4",
    periodLabel: "IV квартал 2024",
    year: 2024,
    quarter: 4,
    deadline: "2025-02-09",
    status: "accepted",
    statusLabel: "Прийнято",
    amountToPay: 5280,
    submittedDate: "2025-02-01",
    acceptedDate: "2025-02-04",
    dataSources: ["manual"],
    formCode: "F0133108",
    fopGroup: 3,
    paymentStatus: "paid",
    paymentDate: "2025-02-09",
    history: [
      { date: "2025-01-15", action: "Створено чернетку", role: "Бухгалтер" },
      { date: "2025-02-01", action: "Подано до ДПС", role: "Власник" },
      { date: "2025-02-04", action: "Прийнято ДПС", role: "Система" },
      { date: "2025-02-09", action: "Сплачено ЄСВ", role: "Власник" },
    ],
  },
  // ДЕМО: Відхилений звіт
  {
    id: "rep-rejected-demo",
    cabinetId: "2",
    type: "ep",
    typeLabel: "Єдиний податок (ЄП)",
    name: "Декларація ЄП за II квартал 2024 (відхилена)",
    period: "Q2",
    periodLabel: "II квартал 2024",
    year: 2024,
    quarter: 2,
    deadline: "2024-08-09",
    status: "rejected",
    statusLabel: "Відхилено",
    amountToPay: 17500,
    submittedDate: "2024-08-05",
    dataSources: ["income-book"],
    formCode: "F0103308",
    fopGroup: 3,
    legalBasis: legalBasisConfig.ep,
    submissionChannel: "dps-cabinet",
    receipt1: {
      id: "rcpt1-rej",
      number: "9000000000000001",
      date: "2024-08-05T09:00:00Z",
    },
    rejectionDetails: {
      reason: "Невідповідність коду КАТОТТГ. Вказаний код 8000000000 не відповідає зареєстрованому місцю проживання платника.",
      code: "E040",
      date: "2024-08-06T11:30:00Z",
      correctionDeadline: "2024-08-20",
    },
    calculation: {
      type: "ep",
      data: {
        totalIncome: 350000,
        taxRate: 5,
        calculatedTax: 17500,
        toPay: 17500,
      }
    },
    paymentStatus: "overdue",
    history: [
      { date: "2024-08-01", action: "Створено чернетку", role: "Бухгалтер" },
      { date: "2024-08-05", action: "Подано до ДПС (Квитанція №1)", role: "Власник" },
      { date: "2024-08-06", action: "Відхилено ДПС: E040", role: "Система" },
    ],
  },
  
  // Коригуючий звіт до відхиленого rep-rejected-demo
  {
    id: "rep-rejected-demo-corr-1",
    cabinetId: "2",
    type: "ep",
    typeLabel: "Єдиний податок (ЄП)",
    name: "Декларація ЄП за II квартал 2024 (коригуючий №1)",
    period: "Q2",
    periodLabel: "II квартал 2024",
    year: 2024,
    quarter: 2,
    deadline: "2024-08-20",
    status: "review",
    statusLabel: "На перевірку",
    amountToPay: 17500,
    dataSources: ["income-book"],
    formCode: "F0103308",
    fopGroup: 3,
    legalBasis: legalBasisConfig.ep,
    
    // Поля корекції
    isCorrection: true,
    correctionOf: "rep-rejected-demo",
    correctionNumber: 1,
    correctionReason: "Виправлення коду КАТОТТГ",
    originalRejectionCode: "E040",
    
    calculation: {
      type: "ep",
      data: {
        totalIncome: 350000,
        taxRate: 5,
        calculatedTax: 17500,
        toPay: 17500,
      }
    },
    history: [
      { date: "2024-08-07", action: "Створено коригуючий звіт на підставі відхилення (E040)", role: "Система" },
      { date: "2024-08-07", action: "Виправлено код КАТОТТГ: 8000000000 → 8036100000", role: "Бухгалтер" },
      { date: "2024-08-07", action: "Підготовлено до перевірки", role: "Система" },
    ],
  },
  
  // Прийнятий коригуючий звіт (повний цикл: відхилення → корекція → прийняття)
  {
    id: "rep-rejected-demo-corr-1-accepted",
    cabinetId: "2",
    type: "ep",
    typeLabel: "Єдиний податок (ЄП)",
    name: "Декларація ЄП за I квартал 2024 (коригуючий №1)",
    period: "Q1",
    periodLabel: "I квартал 2024",
    year: 2024,
    quarter: 1,
    deadline: "2024-05-15",
    status: "accepted",
    statusLabel: "Прийнято",
    amountToPay: 12500,
    submittedDate: "2024-05-10",
    acceptedDate: "2024-05-12",
    dataSources: ["income-book"],
    formCode: "F0103308",
    fopGroup: 3,
    legalBasis: legalBasisConfig.ep,
    submissionChannel: "dps-cabinet",
    
    // Поля корекції
    isCorrection: true,
    correctionOf: "rep-q1-2024-rejected",
    correctionNumber: 1,
    correctionReason: "Виправлення помилки в сумі доходу",
    originalRejectionCode: "C001",
    
    // Квитанції
    receipt1: {
      id: "rcpt1-corr-accepted",
      number: "9001234567890789",
      date: "2024-05-10T14:20:00Z",
    },
    receipt2: {
      id: "rcpt2-corr-accepted",
      number: "9001234567890790",
      date: "2024-05-12T09:45:00Z",
    },
    
    calculation: {
      type: "ep",
      data: {
        totalIncome: 250000,
        taxRate: 5,
        calculatedTax: 12500,
        toPay: 12500,
      }
    },
    history: [
      { date: "2024-05-01", action: "Оригінальний звіт відхилено ДПС (C001)", role: "Система" },
      { date: "2024-05-05", action: "Створено коригуючий звіт на підставі відхилення (C001)", role: "Система" },
      { date: "2024-05-05", action: "Виправлено суму доходу: 200000 → 250000", role: "Бухгалтер" },
      { date: "2024-05-08", action: "Затверджено до подання", role: "Власник" },
      { date: "2024-05-10", action: "Подано до ДПС (Квитанція №1)", role: "Власник" },
      { date: "2024-05-12", action: "Прийнято ДПС (Квитанція №2)", role: "Система" },
    ],
  },

  // ФОП Петренко (ID: "4", 2 група - фіксований податок)
  {
    id: "rep-8",
    cabinetId: "4",
    type: "ep",
    typeLabel: "Єдиний податок (ЄП)",
    name: "Декларація ЄП за 2024 рік",
    period: "year",
    periodLabel: "2024 рік",
    year: 2024,
    deadline: "2025-02-09",
    status: "accepted",
    statusLabel: "Прийнято",
    amountToPay: 0, // 2 група - фіксований, сплачується щомісяця
    submittedDate: "2025-02-01",
    acceptedDate: "2025-02-03",
    dataSources: ["income-book"],
    formCode: "F0103406",
    fopGroup: 2,
    legalBasis: legalBasisConfig.ep,
    submissionChannel: "diia",
    calculation: {
      type: "ep",
      data: {
        totalIncome: 980000,
        taxRate: 0, // Фіксований ставка
        calculatedTax: 0,
        paidAdvances: 16800, // 1400 * 12
        toPay: 0,
      }
    },
    // ВЗ для 2 групи (з 01.12.2024) - фіксований
    militaryTax: {
      baseAmount: 0,
      rate: 0,
      calculatedVZ: 2000, // фіксований за 1 місяць (грудень)
      toPay: 2000,
      isLinkedToEP: true,
    },
    history: [
      { date: "2025-01-20", action: "Створено чернетку", role: "Бухгалтер" },
      { date: "2025-02-01", action: "Подано через Дію", role: "Власник" },
      { date: "2025-02-03", action: "Прийнято ДПС", role: "Система" },
    ],
  },
  {
    id: "rep-9",
    cabinetId: "4",
    type: "esv",
    typeLabel: "ЄСВ",
    name: "Звіт ЄСВ за 2024 рік",
    period: "year",
    periodLabel: "2024 рік",
    year: 2024,
    deadline: "2025-02-09",
    status: "accepted",
    statusLabel: "Прийнято",
    amountToPay: 21120, // 1760 * 12
    submittedDate: "2025-02-01",
    acceptedDate: "2025-02-03",
    dataSources: ["manual"],
    formCode: "F0133108",
    fopGroup: 2,
    legalBasis: legalBasisConfig.esv,
    calculation: {
      type: "esv",
      data: {
        minContribution: ESV_MIN_2025,
        monthsCount: 12,
        totalESV: 21120,
        toPay: 21120,
      }
    },
    history: [
      { date: "2025-01-20", action: "Створено чернетку", role: "Бухгалтер" },
      { date: "2025-02-01", action: "Подано до ДПС", role: "Власник" },
      { date: "2025-02-03", action: "Прийнято ДПС", role: "Система" },
    ],
  },
  {
    id: "rep-10",
    cabinetId: "4",
    type: "ep",
    typeLabel: "Єдиний податок (ЄП)",
    name: "Декларація ЄП за 2025 рік",
    period: "year",
    periodLabel: "2025 рік",
    year: 2025,
    deadline: "2026-03-01",
    status: "not-formed",
    statusLabel: "Не сформовано",
    dataSources: [],
    formCode: "F0103406",
    fopGroup: 2,
    history: [],
  },
  {
    id: "rep-11",
    cabinetId: "4",
    type: "esv",
    typeLabel: "ЄСВ",
    name: "Звіт ЄСВ за 2025 рік",
    period: "year",
    periodLabel: "2025 рік",
    year: 2025,
    deadline: "2026-03-01",
    status: "not-formed",
    statusLabel: "Не сформовано",
    dataSources: [],
    formCode: "F0133108",
    fopGroup: 2,
    history: [],
  },
  {
    id: "rep-12",
    cabinetId: "4",
    type: "other",
    typeLabel: "Інший звіт (демо)",
    name: "Статистичний звіт (демо)",
    period: "Q2",
    periodLabel: "II квартал 2025",
    year: 2025,
    quarter: 2,
    deadline: "2025-07-20",
    status: "rejected",
    statusLabel: "Відхилено",
    dataSources: ["manual"],
    fopGroup: 2,
    history: [
      { date: "2025-07-10", action: "Створено чернетку", role: "Бухгалтер" },
      { date: "2025-07-15", action: "Подано до органу статистики", role: "Власник" },
      { date: "2025-07-18", action: "Відхилено: невірний формат", role: "Система" },
    ],
  },

  // ========== Звіти 1ДФ для ФОП Іваненко (кабінет "2") з працівниками ==========
  {
    id: "rep-1df-jan-2025",
    cabinetId: "2",
    type: "1df",
    typeLabel: "Податковий розрахунок (4ДФ)",
    name: "Податковий розрахунок (4ДФ) за Січень 2025",
    period: "month",
    periodLabel: "Січень 2025",
    year: 2025,
    month: 1,
    deadline: "2025-02-20",
    status: "accepted",
    statusLabel: "Прийнято",
    amountToPay: 0,
    submittedDate: "2025-02-15",
    acceptedDate: "2025-02-17",
    dataSources: ["employees"],
    formCode: "F0500107",
    fopGroup: 3,
    legalBasis: legalBasisConfig["1df"],
    submissionChannel: "dps-cabinet",
    calculation: {
      type: "1df",
      data: {
        employeesCount: 2,
        totalSalary: 32000,
        pdfo: 5760,
        vz: 1600,
        esv: 7040,
        totalTaxes: 14400,
      }
    },
    history: [
      { date: "2025-02-10", action: "Автоматично сформовано", role: "Система" },
      { date: "2025-02-15", action: "Подано до ДПС", role: "Бухгалтер" },
      { date: "2025-02-17", action: "Прийнято ДПС", role: "Система" },
    ],
  },
  {
    id: "rep-1df-feb-2025",
    cabinetId: "2",
    type: "1df",
    typeLabel: "Податковий розрахунок (4ДФ)",
    name: "Податковий розрахунок (4ДФ) за Лютий 2025",
    period: "month",
    periodLabel: "Лютий 2025",
    year: 2025,
    month: 2,
    deadline: "2025-03-20",
    status: "accepted",
    statusLabel: "Прийнято",
    amountToPay: 0,
    submittedDate: "2025-03-12",
    acceptedDate: "2025-03-14",
    dataSources: ["employees"],
    formCode: "F0500107",
    fopGroup: 3,
    legalBasis: legalBasisConfig["1df"],
    submissionChannel: "dps-cabinet",
    calculation: {
      type: "1df",
      data: {
        employeesCount: 2,
        totalSalary: 34000,
        pdfo: 6120,
        vz: 1700,
        esv: 7480,
        totalTaxes: 15300,
      }
    },
    history: [
      { date: "2025-03-05", action: "Автоматично сформовано", role: "Система" },
      { date: "2025-03-12", action: "Подано до ДПС", role: "Бухгалтер" },
      { date: "2025-03-14", action: "Прийнято ДПС", role: "Система" },
    ],
  },
  {
    id: "rep-1df-mar-2025",
    cabinetId: "2",
    type: "1df",
    typeLabel: "Податковий розрахунок (4ДФ)",
    name: "Податковий розрахунок (4ДФ) за Березень 2025",
    period: "month",
    periodLabel: "Березень 2025",
    year: 2025,
    month: 3,
    deadline: "2025-04-20",
    status: "accepted",
    statusLabel: "Прийнято",
    amountToPay: 0,
    submittedDate: "2025-04-10",
    acceptedDate: "2025-04-12",
    dataSources: ["employees"],
    formCode: "F0500107",
    fopGroup: 3,
    legalBasis: legalBasisConfig["1df"],
    submissionChannel: "dps-cabinet",
    calculation: {
      type: "1df",
      data: {
        employeesCount: 2,
        totalSalary: 32000,
        pdfo: 5760,
        vz: 1600,
        esv: 7040,
        totalTaxes: 14400,
      }
    },
    history: [
      { date: "2025-04-02", action: "Автоматично сформовано", role: "Система" },
      { date: "2025-04-10", action: "Подано до ДПС", role: "Бухгалтер" },
      { date: "2025-04-12", action: "Прийнято ДПС", role: "Система" },
    ],
  },
  {
    id: "rep-1df-apr-2025",
    cabinetId: "2",
    type: "1df",
    typeLabel: "Податковий розрахунок (4ДФ)",
    name: "Податковий розрахунок (4ДФ) за Квітень 2025",
    period: "month",
    periodLabel: "Квітень 2025",
    year: 2025,
    month: 4,
    deadline: "2025-05-20",
    status: "accepted",
    statusLabel: "Прийнято",
    amountToPay: 0,
    submittedDate: "2025-05-14",
    acceptedDate: "2025-05-16",
    dataSources: ["employees"],
    formCode: "F0500107",
    fopGroup: 3,
    legalBasis: legalBasisConfig["1df"],
    submissionChannel: "dps-cabinet",
    calculation: {
      type: "1df",
      data: {
        employeesCount: 2,
        totalSalary: 33000,
        pdfo: 5940,
        vz: 1650,
        esv: 7260,
        totalTaxes: 14850,
      }
    },
    history: [
      { date: "2025-05-05", action: "Автоматично сформовано", role: "Система" },
      { date: "2025-05-14", action: "Подано до ДПС", role: "Бухгалтер" },
      { date: "2025-05-16", action: "Прийнято ДПС", role: "Система" },
    ],
  },
  {
    id: "rep-1df-may-2025",
    cabinetId: "2",
    type: "1df",
    typeLabel: "Податковий розрахунок (4ДФ)",
    name: "Податковий розрахунок (4ДФ) за Травень 2025",
    period: "month",
    periodLabel: "Травень 2025",
    year: 2025,
    month: 5,
    deadline: "2025-06-20",
    status: "accepted",
    statusLabel: "Прийнято",
    amountToPay: 0,
    submittedDate: "2025-06-12",
    acceptedDate: "2025-06-14",
    dataSources: ["employees"],
    formCode: "F0500107",
    fopGroup: 3,
    legalBasis: legalBasisConfig["1df"],
    submissionChannel: "dps-cabinet",
    calculation: {
      type: "1df",
      data: {
        employeesCount: 2,
        totalSalary: 34000,
        pdfo: 6120,
        vz: 1700,
        esv: 7480,
        totalTaxes: 15300,
      }
    },
    history: [
      { date: "2025-06-03", action: "Автоматично сформовано", role: "Система" },
      { date: "2025-06-12", action: "Подано до ДПС", role: "Бухгалтер" },
      { date: "2025-06-14", action: "Прийнято ДПС", role: "Система" },
    ],
  },
  {
    id: "rep-1df-jun-2025",
    cabinetId: "2",
    type: "1df",
    typeLabel: "Податковий розрахунок (4ДФ)",
    name: "Податковий розрахунок (4ДФ) за Червень 2025",
    period: "month",
    periodLabel: "Червень 2025",
    year: 2025,
    month: 6,
    deadline: "2025-07-20",
    status: "draft",
    statusLabel: "Чернетка",
    draftProgress: 90,
    amountToPay: 0,
    dataSources: ["employees"],
    formCode: "F0500107",
    fopGroup: 3,
    legalBasis: legalBasisConfig["1df"],
    calculation: {
      type: "1df",
      data: {
        employeesCount: 2,
        totalSalary: 35000,
        pdfo: 6300,
        vz: 1750,
        esv: 7700,
        totalTaxes: 15750,
      }
    },
    history: [
      { date: "2025-07-02", action: "Автоматично сформовано", role: "Система" },
    ],
  },

  // ========== ІСТОРИЧНІ ЗВІТИ ФОП ІВАНЕНКО (кабінет "2", 3 група) ==========
  
  // 2023 Q1 - ЄП
  {
    id: "rep-ivanenko-2023-q1-ep",
    cabinetId: "2",
    type: "ep",
    typeLabel: "Єдиний податок (ЄП)",
    name: "Декларація ЄП за I квартал 2023",
    period: "Q1",
    periodLabel: "I квартал 2023",
    year: 2023,
    quarter: 1,
    deadline: "2023-05-10",
    status: "accepted",
    statusLabel: "Прийнято",
    amountToPay: 19000,
    submittedDate: "2023-05-05",
    acceptedDate: "2023-05-08",
    dataSources: ["income-book"],
    formCode: "F0103308",
    fopGroup: 3,
    legalBasis: legalBasisConfig.ep,
    submissionChannel: "dps-cabinet",
    calculation: {
      type: "ep",
      data: {
        totalIncome: 380000,
        taxRate: 5,
        calculatedTax: 19000,
        toPay: 19000,
      }
    },
    history: [
      { date: "2023-04-20", action: "Створено чернетку", role: "Бухгалтер" },
      { date: "2023-05-05", action: "Подано до ДПС", role: "Власник" },
      { date: "2023-05-08", action: "Прийнято ДПС", role: "Система" },
    ],
  },
  // 2023 Q1 - ЄСВ
  {
    id: "rep-ivanenko-2023-q1-esv",
    cabinetId: "2",
    type: "esv",
    typeLabel: "ЄСВ",
    name: "Звіт ЄСВ за I квартал 2023",
    period: "Q1",
    periodLabel: "I квартал 2023",
    year: 2023,
    quarter: 1,
    deadline: "2023-05-10",
    status: "accepted",
    statusLabel: "Прийнято",
    amountToPay: 4422,
    submittedDate: "2023-05-05",
    acceptedDate: "2023-05-08",
    dataSources: ["manual"],
    formCode: "F0133108",
    fopGroup: 3,
    legalBasis: legalBasisConfig.esv,
    calculation: {
      type: "esv",
      data: {
        minContribution: 1474,
        monthsCount: 3,
        totalESV: 4422,
        toPay: 4422,
      }
    },
    history: [
      { date: "2023-04-20", action: "Створено чернетку", role: "Бухгалтер" },
      { date: "2023-05-05", action: "Подано до ДПС", role: "Власник" },
      { date: "2023-05-08", action: "Прийнято ДПС", role: "Система" },
    ],
  },
  // 2023 Q2 - ЄП
  {
    id: "rep-ivanenko-2023-q2-ep",
    cabinetId: "2",
    type: "ep",
    typeLabel: "Єдиний податок (ЄП)",
    name: "Декларація ЄП за II квартал 2023",
    period: "Q2",
    periodLabel: "II квартал 2023",
    year: 2023,
    quarter: 2,
    deadline: "2023-08-09",
    status: "accepted",
    statusLabel: "Прийнято",
    amountToPay: 19750,
    submittedDate: "2023-08-02",
    acceptedDate: "2023-08-05",
    dataSources: ["income-book"],
    formCode: "F0103308",
    fopGroup: 3,
    calculation: {
      type: "ep",
      data: {
        totalIncome: 395000,
        taxRate: 5,
        calculatedTax: 19750,
        toPay: 19750,
      }
    },
    history: [
      { date: "2023-07-15", action: "Створено чернетку", role: "Бухгалтер" },
      { date: "2023-08-02", action: "Подано до ДПС", role: "Власник" },
      { date: "2023-08-05", action: "Прийнято ДПС", role: "Система" },
    ],
  },
  // 2023 Q2 - ЄСВ
  {
    id: "rep-ivanenko-2023-q2-esv",
    cabinetId: "2",
    type: "esv",
    typeLabel: "ЄСВ",
    name: "Звіт ЄСВ за II квартал 2023",
    period: "Q2",
    periodLabel: "II квартал 2023",
    year: 2023,
    quarter: 2,
    deadline: "2023-08-09",
    status: "accepted",
    statusLabel: "Прийнято",
    amountToPay: 4422,
    submittedDate: "2023-08-02",
    acceptedDate: "2023-08-05",
    dataSources: ["manual"],
    formCode: "F0133108",
    fopGroup: 3,
    calculation: {
      type: "esv",
      data: {
        minContribution: 1474,
        monthsCount: 3,
        totalESV: 4422,
        toPay: 4422,
      }
    },
    history: [
      { date: "2023-07-15", action: "Створено чернетку", role: "Бухгалтер" },
      { date: "2023-08-02", action: "Подано до ДПС", role: "Власник" },
      { date: "2023-08-05", action: "Прийнято ДПС", role: "Система" },
    ],
  },
  // 2023 Q3 - ЄП
  {
    id: "rep-ivanenko-2023-q3-ep",
    cabinetId: "2",
    type: "ep",
    typeLabel: "Єдиний податок (ЄП)",
    name: "Декларація ЄП за III квартал 2023",
    period: "Q3",
    periodLabel: "III квартал 2023",
    year: 2023,
    quarter: 3,
    deadline: "2023-11-09",
    status: "accepted",
    statusLabel: "Прийнято",
    amountToPay: 20500,
    submittedDate: "2023-11-02",
    acceptedDate: "2023-11-06",
    dataSources: ["income-book"],
    formCode: "F0103308",
    fopGroup: 3,
    calculation: {
      type: "ep",
      data: {
        totalIncome: 410000,
        taxRate: 5,
        calculatedTax: 20500,
        toPay: 20500,
      }
    },
    history: [
      { date: "2023-10-15", action: "Створено чернетку", role: "Бухгалтер" },
      { date: "2023-11-02", action: "Подано до ДПС", role: "Власник" },
      { date: "2023-11-06", action: "Прийнято ДПС", role: "Система" },
    ],
  },
  // 2023 Q3 - ЄСВ
  {
    id: "rep-ivanenko-2023-q3-esv",
    cabinetId: "2",
    type: "esv",
    typeLabel: "ЄСВ",
    name: "Звіт ЄСВ за III квартал 2023",
    period: "Q3",
    periodLabel: "III квартал 2023",
    year: 2023,
    quarter: 3,
    deadline: "2023-11-09",
    status: "accepted",
    statusLabel: "Прийнято",
    amountToPay: 4422,
    submittedDate: "2023-11-02",
    acceptedDate: "2023-11-06",
    dataSources: ["manual"],
    formCode: "F0133108",
    fopGroup: 3,
    calculation: {
      type: "esv",
      data: {
        minContribution: 1474,
        monthsCount: 3,
        totalESV: 4422,
        toPay: 4422,
      }
    },
    history: [
      { date: "2023-10-15", action: "Створено чернетку", role: "Бухгалтер" },
      { date: "2023-11-02", action: "Подано до ДПС", role: "Власник" },
      { date: "2023-11-06", action: "Прийнято ДПС", role: "Система" },
    ],
  },
  // 2023 Q4 - ЄП
  {
    id: "rep-ivanenko-2023-q4-ep",
    cabinetId: "2",
    type: "ep",
    typeLabel: "Єдиний податок (ЄП)",
    name: "Декларація ЄП за IV квартал 2023",
    period: "Q4",
    periodLabel: "IV квартал 2023",
    year: 2023,
    quarter: 4,
    deadline: "2024-02-09",
    status: "accepted",
    statusLabel: "Прийнято",
    amountToPay: 21000,
    submittedDate: "2024-02-02",
    acceptedDate: "2024-02-05",
    dataSources: ["income-book"],
    formCode: "F0103308",
    fopGroup: 3,
    calculation: {
      type: "ep",
      data: {
        totalIncome: 420000,
        taxRate: 5,
        calculatedTax: 21000,
        toPay: 21000,
      }
    },
    history: [
      { date: "2024-01-15", action: "Створено чернетку", role: "Бухгалтер" },
      { date: "2024-02-02", action: "Подано до ДПС", role: "Власник" },
      { date: "2024-02-05", action: "Прийнято ДПС", role: "Система" },
    ],
  },
  // 2023 Q4 - ЄСВ
  {
    id: "rep-ivanenko-2023-q4-esv",
    cabinetId: "2",
    type: "esv",
    typeLabel: "ЄСВ",
    name: "Звіт ЄСВ за IV квартал 2023",
    period: "Q4",
    periodLabel: "IV квартал 2023",
    year: 2023,
    quarter: 4,
    deadline: "2024-02-09",
    status: "accepted",
    statusLabel: "Прийнято",
    amountToPay: 4422,
    submittedDate: "2024-02-02",
    acceptedDate: "2024-02-05",
    dataSources: ["manual"],
    formCode: "F0133108",
    fopGroup: 3,
    calculation: {
      type: "esv",
      data: {
        minContribution: 1474,
        monthsCount: 3,
        totalESV: 4422,
        toPay: 4422,
      }
    },
    history: [
      { date: "2024-01-15", action: "Створено чернетку", role: "Бухгалтер" },
      { date: "2024-02-02", action: "Подано до ДПС", role: "Власник" },
      { date: "2024-02-05", action: "Прийнято ДПС", role: "Система" },
    ],
  },

  // 2024 Q1 - ЄП
  {
    id: "rep-ivanenko-2024-q1-ep",
    cabinetId: "2",
    type: "ep",
    typeLabel: "Єдиний податок (ЄП)",
    name: "Декларація ЄП за I квартал 2024",
    period: "Q1",
    periodLabel: "I квартал 2024",
    year: 2024,
    quarter: 1,
    deadline: "2024-05-09",
    status: "accepted",
    statusLabel: "Прийнято",
    amountToPay: 20000,
    submittedDate: "2024-05-03",
    acceptedDate: "2024-05-06",
    dataSources: ["income-book"],
    formCode: "F0103308",
    fopGroup: 3,
    calculation: {
      type: "ep",
      data: {
        totalIncome: 400000,
        taxRate: 5,
        calculatedTax: 20000,
        toPay: 20000,
      }
    },
    history: [
      { date: "2024-04-20", action: "Створено чернетку", role: "Бухгалтер" },
      { date: "2024-05-03", action: "Подано до ДПС", role: "Власник" },
      { date: "2024-05-06", action: "Прийнято ДПС", role: "Система" },
    ],
  },
  // 2024 Q1 - ЄСВ
  {
    id: "rep-ivanenko-2024-q1-esv",
    cabinetId: "2",
    type: "esv",
    typeLabel: "ЄСВ",
    name: "Звіт ЄСВ за I квартал 2024",
    period: "Q1",
    periodLabel: "I квартал 2024",
    year: 2024,
    quarter: 1,
    deadline: "2024-05-09",
    status: "accepted",
    statusLabel: "Прийнято",
    amountToPay: 4800,
    submittedDate: "2024-05-03",
    acceptedDate: "2024-05-06",
    dataSources: ["manual"],
    formCode: "F0133108",
    fopGroup: 3,
    calculation: {
      type: "esv",
      data: {
        minContribution: 1600,
        monthsCount: 3,
        totalESV: 4800,
        toPay: 4800,
      }
    },
    history: [
      { date: "2024-04-20", action: "Створено чернетку", role: "Бухгалтер" },
      { date: "2024-05-03", action: "Подано до ДПС", role: "Власник" },
      { date: "2024-05-06", action: "Прийнято ДПС", role: "Система" },
    ],
  },
  // 2024 Q2 - ЄП
  {
    id: "rep-ivanenko-2024-q2-ep",
    cabinetId: "2",
    type: "ep",
    typeLabel: "Єдиний податок (ЄП)",
    name: "Декларація ЄП за II квартал 2024",
    period: "Q2",
    periodLabel: "II квартал 2024",
    year: 2024,
    quarter: 2,
    deadline: "2024-08-09",
    status: "accepted",
    statusLabel: "Прийнято",
    amountToPay: 19250,
    submittedDate: "2024-08-02",
    acceptedDate: "2024-08-05",
    dataSources: ["income-book"],
    formCode: "F0103308",
    fopGroup: 3,
    calculation: {
      type: "ep",
      data: {
        totalIncome: 385000,
        taxRate: 5,
        calculatedTax: 19250,
        toPay: 19250,
      }
    },
    history: [
      { date: "2024-07-15", action: "Створено чернетку", role: "Бухгалтер" },
      { date: "2024-08-02", action: "Подано до ДПС", role: "Власник" },
      { date: "2024-08-05", action: "Прийнято ДПС", role: "Система" },
    ],
  },
  // 2024 Q2 - ЄСВ
  {
    id: "rep-ivanenko-2024-q2-esv",
    cabinetId: "2",
    type: "esv",
    typeLabel: "ЄСВ",
    name: "Звіт ЄСВ за II квартал 2024",
    period: "Q2",
    periodLabel: "II квартал 2024",
    year: 2024,
    quarter: 2,
    deadline: "2024-08-09",
    status: "accepted",
    statusLabel: "Прийнято",
    amountToPay: 4800,
    submittedDate: "2024-08-02",
    acceptedDate: "2024-08-05",
    dataSources: ["manual"],
    formCode: "F0133108",
    fopGroup: 3,
    calculation: {
      type: "esv",
      data: {
        minContribution: 1600,
        monthsCount: 3,
        totalESV: 4800,
        toPay: 4800,
      }
    },
    history: [
      { date: "2024-07-15", action: "Створено чернетку", role: "Бухгалтер" },
      { date: "2024-08-02", action: "Подано до ДПС", role: "Власник" },
      { date: "2024-08-05", action: "Прийнято ДПС", role: "Система" },
    ],
  },

  // 2024 1ДФ (липень-грудень)
  {
    id: "rep-1df-jul-2024",
    cabinetId: "2",
    type: "1df",
    typeLabel: "Податковий розрахунок (4ДФ)",
    name: "Податковий розрахунок (4ДФ) за Липень 2024",
    period: "month",
    periodLabel: "Липень 2024",
    year: 2024,
    month: 7,
    deadline: "2024-08-20",
    status: "accepted",
    statusLabel: "Прийнято",
    amountToPay: 0,
    submittedDate: "2024-08-15",
    acceptedDate: "2024-08-17",
    dataSources: ["employees"],
    formCode: "F0500107",
    fopGroup: 3,
    legalBasis: legalBasisConfig["1df"],
    submissionChannel: "dps-cabinet",
    calculation: {
      type: "1df",
      data: {
        employeesCount: 2,
        totalSalary: 28400,
        pdfo: 5112,
        vz: 426,
        esv: 6248,
        totalTaxes: 11786,
      }
    },
    history: [
      { date: "2024-08-10", action: "Автоматично сформовано", role: "Система" },
      { date: "2024-08-15", action: "Подано до ДПС", role: "Бухгалтер" },
      { date: "2024-08-17", action: "Прийнято ДПС", role: "Система" },
    ],
  },
  {
    id: "rep-1df-aug-2024",
    cabinetId: "2",
    type: "1df",
    typeLabel: "Податковий розрахунок (4ДФ)",
    name: "Податковий розрахунок (4ДФ) за Серпень 2024",
    period: "month",
    periodLabel: "Серпень 2024",
    year: 2024,
    month: 8,
    deadline: "2024-09-20",
    status: "accepted",
    statusLabel: "Прийнято",
    amountToPay: 0,
    submittedDate: "2024-09-14",
    acceptedDate: "2024-09-16",
    dataSources: ["employees"],
    formCode: "F0500107",
    fopGroup: 3,
    calculation: {
      type: "1df",
      data: {
        employeesCount: 2,
        totalSalary: 28400,
        pdfo: 5112,
        vz: 426,
        esv: 6248,
        totalTaxes: 11786,
      }
    },
    history: [
      { date: "2024-09-08", action: "Автоматично сформовано", role: "Система" },
      { date: "2024-09-14", action: "Подано до ДПС", role: "Бухгалтер" },
      { date: "2024-09-16", action: "Прийнято ДПС", role: "Система" },
    ],
  },
  {
    id: "rep-1df-sep-2024",
    cabinetId: "2",
    type: "1df",
    typeLabel: "Податковий розрахунок (4ДФ)",
    name: "Податковий розрахунок (4ДФ) за Вересень 2024",
    period: "month",
    periodLabel: "Вересень 2024",
    year: 2024,
    month: 9,
    deadline: "2024-10-20",
    status: "accepted",
    statusLabel: "Прийнято",
    amountToPay: 0,
    submittedDate: "2024-10-12",
    acceptedDate: "2024-10-14",
    dataSources: ["employees"],
    formCode: "F0500107",
    fopGroup: 3,
    calculation: {
      type: "1df",
      data: {
        employeesCount: 2,
        totalSalary: 29000,
        pdfo: 5220,
        vz: 435,
        esv: 6380,
        totalTaxes: 12035,
      }
    },
    history: [
      { date: "2024-10-05", action: "Автоматично сформовано", role: "Система" },
      { date: "2024-10-12", action: "Подано до ДПС", role: "Бухгалтер" },
      { date: "2024-10-14", action: "Прийнято ДПС", role: "Система" },
    ],
  },
  {
    id: "rep-1df-oct-2024",
    cabinetId: "2",
    type: "1df",
    typeLabel: "Податковий розрахунок (4ДФ)",
    name: "Податковий розрахунок (4ДФ) за Жовтень 2024",
    period: "month",
    periodLabel: "Жовтень 2024",
    year: 2024,
    month: 10,
    deadline: "2024-11-20",
    status: "accepted",
    statusLabel: "Прийнято",
    amountToPay: 0,
    submittedDate: "2024-11-14",
    acceptedDate: "2024-11-16",
    dataSources: ["employees"],
    formCode: "F0500107",
    fopGroup: 3,
    calculation: {
      type: "1df",
      data: {
        employeesCount: 2,
        totalSalary: 30000,
        pdfo: 5400,
        vz: 450,
        esv: 6600,
        totalTaxes: 12450,
      }
    },
    history: [
      { date: "2024-11-08", action: "Автоматично сформовано", role: "Система" },
      { date: "2024-11-14", action: "Подано до ДПС", role: "Бухгалтер" },
      { date: "2024-11-16", action: "Прийнято ДПС", role: "Система" },
    ],
  },
  {
    id: "rep-1df-nov-2024",
    cabinetId: "2",
    type: "1df",
    typeLabel: "Податковий розрахунок (4ДФ)",
    name: "Податковий розрахунок (4ДФ) за Листопад 2024",
    period: "month",
    periodLabel: "Листопад 2024",
    year: 2024,
    month: 11,
    deadline: "2024-12-20",
    status: "accepted",
    statusLabel: "Прийнято",
    amountToPay: 0,
    submittedDate: "2024-12-12",
    acceptedDate: "2024-12-14",
    dataSources: ["employees"],
    formCode: "F0500107",
    fopGroup: 3,
    calculation: {
      type: "1df",
      data: {
        employeesCount: 2,
        totalSalary: 30000,
        pdfo: 5400,
        vz: 450,
        esv: 6600,
        totalTaxes: 12450,
      }
    },
    history: [
      { date: "2024-12-05", action: "Автоматично сформовано", role: "Система" },
      { date: "2024-12-12", action: "Подано до ДПС", role: "Бухгалтер" },
      { date: "2024-12-14", action: "Прийнято ДПС", role: "Система" },
    ],
  },
  {
    id: "rep-1df-dec-2024",
    cabinetId: "2",
    type: "1df",
    typeLabel: "Податковий розрахунок (4ДФ)",
    name: "Податковий розрахунок (4ДФ) за Грудень 2024",
    period: "month",
    periodLabel: "Грудень 2024",
    year: 2024,
    month: 12,
    deadline: "2025-01-20",
    status: "accepted",
    statusLabel: "Прийнято",
    amountToPay: 0,
    submittedDate: "2025-01-14",
    acceptedDate: "2025-01-16",
    dataSources: ["employees"],
    formCode: "F0500107",
    fopGroup: 3,
    calculation: {
      type: "1df",
      data: {
        employeesCount: 2,
        totalSalary: 31000,
        pdfo: 5580,
        vz: 1550, // 5% з 01.12.2024
        esv: 6820,
        totalTaxes: 13950,
      }
    },
    history: [
      { date: "2025-01-08", action: "Автоматично сформовано", role: "Система" },
      { date: "2025-01-14", action: "Подано до ДПС", role: "Бухгалтер" },
      { date: "2025-01-16", action: "Прийнято ДПС", role: "Система" },
    ],
  },

  // 2025 Q3-Q4 - not-formed (планові)
  {
    id: "rep-ivanenko-2025-q3-ep",
    cabinetId: "2",
    type: "ep",
    typeLabel: "Єдиний податок (ЄП)",
    name: "Декларація ЄП за III квартал 2025",
    period: "Q3",
    periodLabel: "III квартал 2025",
    year: 2025,
    quarter: 3,
    deadline: "2025-11-09",
    status: "not-formed",
    statusLabel: "Не сформовано",
    dataSources: [],
    formCode: "F0103308",
    fopGroup: 3,
    history: [],
  },
  {
    id: "rep-ivanenko-2025-q3-esv",
    cabinetId: "2",
    type: "esv",
    typeLabel: "ЄСВ",
    name: "Звіт ЄСВ за III квартал 2025",
    period: "Q3",
    periodLabel: "III квартал 2025",
    year: 2025,
    quarter: 3,
    deadline: "2025-11-09",
    status: "not-formed",
    statusLabel: "Не сформовано",
    dataSources: [],
    formCode: "F0133108",
    fopGroup: 3,
    history: [],
  },
  {
    id: "rep-ivanenko-2025-q3-vz",
    cabinetId: "2",
    type: "vz",
    typeLabel: "Військовий збір",
    name: "Військовий збір за III квартал 2025",
    period: "Q3",
    periodLabel: "III квартал 2025",
    year: 2025,
    quarter: 3,
    deadline: "2025-11-09",
    status: "not-formed",
    statusLabel: "Не сформовано",
    dataSources: [],
    fopGroup: 3,
    history: [],
  },
  {
    id: "rep-ivanenko-2025-q4-ep",
    cabinetId: "2",
    type: "ep",
    typeLabel: "Єдиний податок (ЄП)",
    name: "Декларація ЄП за IV квартал 2025",
    period: "Q4",
    periodLabel: "IV квартал 2025",
    year: 2025,
    quarter: 4,
    deadline: "2026-02-09",
    status: "not-formed",
    statusLabel: "Не сформовано",
    dataSources: [],
    formCode: "F0103308",
    fopGroup: 3,
    history: [],
  },
  {
    id: "rep-ivanenko-2025-q4-esv",
    cabinetId: "2",
    type: "esv",
    typeLabel: "ЄСВ",
    name: "Звіт ЄСВ за IV квартал 2025",
    period: "Q4",
    periodLabel: "IV квартал 2025",
    year: 2025,
    quarter: 4,
    deadline: "2026-02-09",
    status: "not-formed",
    statusLabel: "Не сформовано",
    dataSources: [],
    formCode: "F0133108",
    fopGroup: 3,
    history: [],
  },
  {
    id: "rep-ivanenko-2025-q4-vz",
    cabinetId: "2",
    type: "vz",
    typeLabel: "Військовий збір",
    name: "Військовий збір за IV квартал 2025",
    period: "Q4",
    periodLabel: "IV квартал 2025",
    year: 2025,
    quarter: 4,
    deadline: "2026-02-09",
    status: "not-formed",
    statusLabel: "Не сформовано",
    dataSources: [],
    fopGroup: 3,
    history: [],
  },

  // 2025 1ДФ (липень-грудень)
  {
    id: "rep-1df-jul-2025",
    cabinetId: "2",
    type: "1df",
    typeLabel: "Податковий розрахунок (4ДФ)",
    name: "Податковий розрахунок (4ДФ) за Липень 2025",
    period: "month",
    periodLabel: "Липень 2025",
    year: 2025,
    month: 7,
    deadline: "2025-08-20",
    status: "draft",
    statusLabel: "Чернетка",
    draftProgress: 80,
    amountToPay: 0,
    dataSources: ["employees"],
    formCode: "F0500107",
    fopGroup: 3,
    calculation: {
      type: "1df",
      data: {
        employeesCount: 2,
        totalSalary: 36000,
        pdfo: 6480,
        vz: 1800,
        esv: 7920,
        totalTaxes: 16200,
      }
    },
    history: [
      { date: "2025-08-02", action: "Автоматично сформовано", role: "Система" },
    ],
  },
  {
    id: "rep-1df-aug-2025",
    cabinetId: "2",
    type: "1df",
    typeLabel: "Податковий розрахунок (4ДФ)",
    name: "Податковий розрахунок (4ДФ) за Серпень 2025",
    period: "month",
    periodLabel: "Серпень 2025",
    year: 2025,
    month: 8,
    deadline: "2025-09-20",
    status: "not-formed",
    statusLabel: "Не сформовано",
    dataSources: [],
    formCode: "F0500107",
    fopGroup: 3,
    history: [],
  },
  {
    id: "rep-1df-sep-2025",
    cabinetId: "2",
    type: "1df",
    typeLabel: "Податковий розрахунок (4ДФ)",
    name: "Податковий розрахунок (4ДФ) за Вересень 2025",
    period: "month",
    periodLabel: "Вересень 2025",
    year: 2025,
    month: 9,
    deadline: "2025-10-20",
    status: "not-formed",
    statusLabel: "Не сформовано",
    dataSources: [],
    formCode: "F0500107",
    fopGroup: 3,
    history: [],
  },
  {
    id: "rep-1df-oct-2025",
    cabinetId: "2",
    type: "1df",
    typeLabel: "Податковий розрахунок (4ДФ)",
    name: "Податковий розрахунок (4ДФ) за Жовтень 2025",
    period: "month",
    periodLabel: "Жовтень 2025",
    year: 2025,
    month: 10,
    deadline: "2025-11-20",
    status: "not-formed",
    statusLabel: "Не сформовано",
    dataSources: [],
    formCode: "F0500107",
    fopGroup: 3,
    history: [],
  },
  {
    id: "rep-1df-nov-2025",
    cabinetId: "2",
    type: "1df",
    typeLabel: "Податковий розрахунок (4ДФ)",
    name: "Податковий розрахунок (4ДФ) за Листопад 2025",
    period: "month",
    periodLabel: "Листопад 2025",
    year: 2025,
    month: 11,
    deadline: "2025-12-20",
    status: "not-formed",
    statusLabel: "Не сформовано",
    dataSources: [],
    formCode: "F0500107",
    fopGroup: 3,
    history: [],
  },
  {
    id: "rep-1df-dec-2025",
    cabinetId: "2",
    type: "1df",
    typeLabel: "Податковий розрахунок (4ДФ)",
    name: "Податковий розрахунок (4ДФ) за Грудень 2025",
    period: "month",
    periodLabel: "Грудень 2025",
    year: 2025,
    month: 12,
    deadline: "2026-01-20",
    status: "not-formed",
    statusLabel: "Не сформовано",
    dataSources: [],
    formCode: "F0500107",
    fopGroup: 3,
    history: [],
  },

  // ========== Q4 2025 — АКТУАЛЬНІ "ГАРЯЧІ" ЗВІТИ ФОП ІВАНЕНКО ==========
  {
    id: "rep-ivanenko-2025-q4-ep",
    cabinetId: "2",
    type: "ep",
    typeLabel: "Єдиний податок (ЄП)",
    name: "Декларація ЄП за IV квартал 2025",
    period: "Q4",
    periodLabel: "IV квартал 2025",
    year: 2025,
    quarter: 4,
    deadline: "2026-02-09",
    status: "scheduled",
    statusLabel: "Заплановано",
    amountToPay: 19000,
    dataSources: ["income-book", "integrations"],
    formCode: "F0103308",
    fopGroup: 3,
    legalBasis: legalBasisConfig.ep,
    calculation: {
      type: "ep",
      data: {
        totalIncome: 380000,
        taxRate: 5,
        calculatedTax: 19000,
        paidAdvances: 0,
        toPay: 19000,
      }
    },
    militaryTax: {
      baseAmount: 380000,
      rate: 1,
      calculatedVZ: 3800,
      toPay: 3800,
      isLinkedToEP: true,
    },
    history: [
      { date: "2026-01-05", action: "Автоматично сформовано чернетку", role: "Система" },
    ],
  },
  {
    id: "rep-ivanenko-2025-q4-vz",
    cabinetId: "2",
    type: "vz",
    typeLabel: "Військовий збір",
    name: "Військовий збір за IV квартал 2025",
    period: "Q4",
    periodLabel: "IV квартал 2025",
    year: 2025,
    quarter: 4,
    deadline: "2026-02-09",
    status: "scheduled",
    statusLabel: "Заплановано",
    amountToPay: 3800,
    dataSources: ["income-book"],
    fopGroup: 3,
    legalBasis: legalBasisConfig.vz,
    calculation: {
      type: "vz",
      data: {
        baseAmount: 380000,
        rate: 1,
        calculatedVZ: 3800,
        toPay: 3800,
        isLinkedToEP: true,
      }
    },
    history: [
      { date: "2026-01-05", action: "Автоматично сформовано чернетку (1% з 01.01.2025)", role: "Система" },
    ],
  },
  {
    id: "rep-ivanenko-2025-q4-esv",
    cabinetId: "2",
    type: "esv",
    typeLabel: "ЄСВ",
    name: "Звіт ЄСВ за IV квартал 2025",
    period: "Q4",
    periodLabel: "IV квартал 2025",
    year: 2025,
    quarter: 4,
    deadline: "2026-02-09",
    status: "scheduled",
    statusLabel: "Заплановано",
    amountToPay: 5280,
    dataSources: ["manual"],
    formCode: "F0133108",
    fopGroup: 3,
    legalBasis: legalBasisConfig.esv,
    calculation: {
      type: "esv",
      data: {
        minContribution: 1760,
        monthsCount: 3,
        totalESV: 5280,
        toPay: 5280,
      }
    },
    history: [
      { date: "2026-01-05", action: "Автоматично сформовано чернетку", role: "Система" },
    ],
  },

  // ========== 4ДФ за січень 2026 ==========
  {
    id: "rep-1df-jan-2026",
    cabinetId: "2",
    type: "1df",
    typeLabel: "Податковий розрахунок (4ДФ)",
    name: "Податковий розрахунок (4ДФ) за Січень 2026",
    period: "month",
    periodLabel: "Січень 2026",
    year: 2026,
    month: 1,
    deadline: "2026-02-19",
    status: "scheduled",
    statusLabel: "Заплановано",
    amountToPay: 0,
    dataSources: ["employees"],
    formCode: "F0500107",
    fopGroup: 3,
    legalBasis: legalBasisConfig["1df"],
    calculation: {
      type: "1df",
      data: {
        employeesCount: 2,
        totalSalary: 36000,
        pdfo: 6480,
        vz: 1800,
        esv: 7920,
        totalTaxes: 16200,
      }
    },
    history: [
      { date: "2026-02-01", action: "Автоматично сформовано на базі ЗП за січень 2026", role: "Система" },
    ],
  },

  // ========== 2026 Q1-Q2 — ПЛАНОВІ З ПОВНИМ РОЗРАХУНКОМ ==========
  {
    id: "rep-ivanenko-2026-q1-ep",
    cabinetId: "2",
    type: "ep",
    typeLabel: "Єдиний податок (ЄП)",
    name: "Декларація ЄП за I квартал 2026",
    period: "Q1",
    periodLabel: "I квартал 2026",
    year: 2026,
    quarter: 1,
    deadline: "2026-05-09",
    status: "scheduled",
    statusLabel: "Заплановано",
    amountToPay: 21250,
    dataSources: ["income-book", "integrations"],
    formCode: "F0103308",
    fopGroup: 3,
    legalBasis: legalBasisConfig.ep,
    calculation: {
      type: "ep",
      data: {
        totalIncome: 425000,
        taxRate: 5,
        calculatedTax: 21250,
        paidAdvances: 0,
        toPay: 21250,
      }
    },
    militaryTax: {
      baseAmount: 425000,
      rate: 1,
      calculatedVZ: 4250,
      toPay: 4250,
      isLinkedToEP: true,
    },
    history: [],
  },
  {
    id: "rep-ivanenko-2026-q1-esv",
    cabinetId: "2",
    type: "esv",
    typeLabel: "ЄСВ",
    name: "Звіт ЄСВ за I квартал 2026",
    period: "Q1",
    periodLabel: "I квартал 2026",
    year: 2026,
    quarter: 1,
    deadline: "2026-05-09",
    status: "scheduled",
    statusLabel: "Заплановано",
    amountToPay: 5280,
    dataSources: ["manual"],
    formCode: "F0133108",
    fopGroup: 3,
    legalBasis: legalBasisConfig.esv,
    calculation: {
      type: "esv",
      data: {
        minContribution: 1760, // МЗП 2026 × 22% = 8000 × 22%
        monthsCount: 3,
        totalESV: 5280,
        toPay: 5280,
      }
    },
    history: [],
  },
  {
    id: "rep-ivanenko-2026-q1-vz",
    cabinetId: "2",
    type: "vz",
    typeLabel: "Військовий збір",
    name: "Військовий збір за I квартал 2026",
    period: "Q1",
    periodLabel: "I квартал 2026",
    year: 2026,
    quarter: 1,
    deadline: "2026-05-09",
    status: "scheduled",
    statusLabel: "Заплановано",
    amountToPay: 4250,
    dataSources: ["income-book"],
    fopGroup: 3,
    legalBasis: legalBasisConfig.vz,
    calculation: {
      type: "vz",
      data: {
        baseAmount: 425000,
        rate: 1,
        calculatedVZ: 4250,
        toPay: 4250,
        isLinkedToEP: true,
      }
    },
    history: [],
  },
  {
    id: "rep-ivanenko-2026-q2-ep",
    cabinetId: "2",
    type: "ep",
    typeLabel: "Єдиний податок (ЄП)",
    name: "Декларація ЄП за II квартал 2026",
    period: "Q2",
    periodLabel: "II квартал 2026",
    year: 2026,
    quarter: 2,
    deadline: "2026-08-09",
    status: "scheduled",
    statusLabel: "Заплановано",
    amountToPay: 25500,
    dataSources: ["income-book", "integrations"],
    formCode: "F0103308",
    fopGroup: 3,
    legalBasis: legalBasisConfig.ep,
    calculation: {
      type: "ep",
      data: {
        totalIncome: 935000, // кумулятивно Q1+Q2: 425000 + 510000
        taxRate: 5,
        calculatedTax: 46750,
        paidAdvances: 21250, // ЄП Q1
        toPay: 25500,
      }
    },
    militaryTax: {
      baseAmount: 510000,
      rate: 1,
      calculatedVZ: 5100,
      toPay: 5100,
      isLinkedToEP: true,
    },
    history: [],
  },
  {
    id: "rep-ivanenko-2026-q2-esv",
    cabinetId: "2",
    type: "esv",
    typeLabel: "ЄСВ",
    name: "Звіт ЄСВ за II квартал 2026",
    period: "Q2",
    periodLabel: "II квартал 2026",
    year: 2026,
    quarter: 2,
    deadline: "2026-08-09",
    status: "scheduled",
    statusLabel: "Заплановано",
    amountToPay: 5280,
    dataSources: ["manual"],
    formCode: "F0133108",
    fopGroup: 3,
    legalBasis: legalBasisConfig.esv,
    calculation: {
      type: "esv",
      data: {
        minContribution: 1760,
        monthsCount: 3,
        totalESV: 5280,
        toPay: 5280,
      }
    },
    history: [],
  },
  {
    id: "rep-ivanenko-2026-q2-vz",
    cabinetId: "2",
    type: "vz",
    typeLabel: "Військовий збір",
    name: "Військовий збір за II квартал 2026",
    period: "Q2",
    periodLabel: "II квартал 2026",
    year: 2026,
    quarter: 2,
    deadline: "2026-08-09",
    status: "scheduled",
    statusLabel: "Заплановано",
    amountToPay: 5100,
    dataSources: ["income-book"],
    fopGroup: 3,
    legalBasis: legalBasisConfig.vz,
    calculation: {
      type: "vz",
      data: {
        baseAmount: 510000,
        rate: 1,
        calculatedVZ: 5100,
        toPay: 5100,
        isLinkedToEP: true,
      }
    },
    history: [],
  },

  // ========== ІСТОРИЧНІ ЗВІТИ ФОП ПЕТРЕНКО (кабінет "4", 2 група) ==========
  
  // 2023 рік
  {
    id: "rep-petrenko-2023-ep",
    cabinetId: "4",
    type: "ep",
    typeLabel: "Єдиний податок (ЄП)",
    name: "Декларація ЄП за 2023 рік",
    period: "year",
    periodLabel: "2023 рік",
    year: 2023,
    deadline: "2024-03-01",
    status: "accepted",
    statusLabel: "Прийнято",
    amountToPay: 0,
    submittedDate: "2024-02-20",
    acceptedDate: "2024-02-23",
    dataSources: ["income-book"],
    formCode: "F0103406",
    fopGroup: 2,
    legalBasis: legalBasisConfig.ep,
    submissionChannel: "diia",
    calculation: {
      type: "ep",
      data: {
        totalIncome: 920000,
        taxRate: 0,
        calculatedTax: 0,
        paidAdvances: 16080, // 1340 * 12
        toPay: 0,
      }
    },
    history: [
      { date: "2024-02-10", action: "Створено чернетку", role: "Бухгалтер" },
      { date: "2024-02-20", action: "Подано через Дію", role: "Власник" },
      { date: "2024-02-23", action: "Прийнято ДПС", role: "Система" },
    ],
  },
  {
    id: "rep-petrenko-2023-esv",
    cabinetId: "4",
    type: "esv",
    typeLabel: "ЄСВ",
    name: "Звіт ЄСВ за 2023 рік",
    period: "year",
    periodLabel: "2023 рік",
    year: 2023,
    deadline: "2024-03-01",
    status: "accepted",
    statusLabel: "Прийнято",
    amountToPay: 17688,
    submittedDate: "2024-02-20",
    acceptedDate: "2024-02-23",
    dataSources: ["manual"],
    formCode: "F0133108",
    fopGroup: 2,
    legalBasis: legalBasisConfig.esv,
    calculation: {
      type: "esv",
      data: {
        minContribution: 1474,
        monthsCount: 12,
        totalESV: 17688,
        toPay: 17688,
      }
    },
    history: [
      { date: "2024-02-10", action: "Створено чернетку", role: "Бухгалтер" },
      { date: "2024-02-20", action: "Подано до ДПС", role: "Власник" },
      { date: "2024-02-23", action: "Прийнято ДПС", role: "Система" },
    ],
  },

  // 2026 рік (планові)
  {
    id: "rep-petrenko-2026-ep",
    cabinetId: "4",
    type: "ep",
    typeLabel: "Єдиний податок (ЄП)",
    name: "Декларація ЄП за 2026 рік",
    period: "year",
    periodLabel: "2026 рік",
    year: 2026,
    deadline: "2027-03-01",
    status: "not-formed",
    statusLabel: "Не сформовано",
    dataSources: [],
    formCode: "F0103406",
    fopGroup: 2,
    history: [],
  },
  {
    id: "rep-petrenko-2026-esv",
    cabinetId: "4",
    type: "esv",
    typeLabel: "ЄСВ",
    name: "Звіт ЄСВ за 2026 рік",
    period: "year",
    periodLabel: "2026 рік",
    year: 2026,
    deadline: "2027-03-01",
    status: "not-formed",
    statusLabel: "Не сформовано",
    dataSources: [],
    formCode: "F0133108",
    fopGroup: 2,
    history: [],
  },
  {
    id: "rep-petrenko-2026-vz",
    cabinetId: "4",
    type: "vz",
    typeLabel: "Військовий збір",
    name: "Військовий збір за 2026 рік",
    period: "year",
    periodLabel: "2026 рік",
    year: 2026,
    deadline: "2027-03-01",
    status: "not-formed",
    statusLabel: "Не сформовано",
    dataSources: [],
    fopGroup: 2,
    history: [],
  },

  // ========== ЗВІТИ ФОП КОЗАЧЕНКО (кабінет "9", 1 група) ==========
  
  // 2023 рік
  {
    id: "rep-kozachenko-2023-ep",
    cabinetId: "9",
    type: "ep",
    typeLabel: "Єдиний податок (ЄП)",
    name: "Декларація ЄП за 2023 рік",
    period: "year",
    periodLabel: "2023 рік",
    year: 2023,
    deadline: "2024-03-01",
    status: "accepted",
    statusLabel: "Прийнято",
    amountToPay: 0,
    submittedDate: "2024-02-25",
    acceptedDate: "2024-02-27",
    dataSources: ["income-book"],
    formCode: "F0103406",
    fopGroup: 1,
    legalBasis: legalBasisConfig.ep,
    submissionChannel: "diia",
    calculation: {
      type: "ep",
      data: {
        totalIncome: 950000,
        taxRate: 0,
        calculatedTax: 0,
        paidAdvances: 3220.8, // 268.4 * 12
        toPay: 0,
      }
    },
    history: [
      { date: "2024-02-15", action: "Створено чернетку", role: "Власник" },
      { date: "2024-02-25", action: "Подано через Дію", role: "Власник" },
      { date: "2024-02-27", action: "Прийнято ДПС", role: "Система" },
    ],
  },
  {
    id: "rep-kozachenko-2023-esv",
    cabinetId: "9",
    type: "esv",
    typeLabel: "ЄСВ",
    name: "Звіт ЄСВ за 2023 рік",
    period: "year",
    periodLabel: "2023 рік",
    year: 2023,
    deadline: "2024-03-01",
    status: "accepted",
    statusLabel: "Прийнято",
    amountToPay: 17688,
    submittedDate: "2024-02-25",
    acceptedDate: "2024-02-27",
    dataSources: ["manual"],
    formCode: "F0133108",
    fopGroup: 1,
    legalBasis: legalBasisConfig.esv,
    calculation: {
      type: "esv",
      data: {
        minContribution: 1474,
        monthsCount: 12,
        totalESV: 17688,
        toPay: 17688,
      }
    },
    history: [
      { date: "2024-02-15", action: "Створено чернетку", role: "Власник" },
      { date: "2024-02-25", action: "Подано до ДПС", role: "Власник" },
      { date: "2024-02-27", action: "Прийнято ДПС", role: "Система" },
    ],
  },

  // 2024 рік
  {
    id: "rep-kozachenko-2024-ep",
    cabinetId: "9",
    type: "ep",
    typeLabel: "Єдиний податок (ЄП)",
    name: "Декларація ЄП за 2024 рік",
    period: "year",
    periodLabel: "2024 рік",
    year: 2024,
    deadline: "2025-03-01",
    status: "accepted",
    statusLabel: "Прийнято",
    amountToPay: 0,
    submittedDate: "2025-02-22",
    acceptedDate: "2025-02-25",
    dataSources: ["income-book"],
    formCode: "F0103406",
    fopGroup: 1,
    legalBasis: legalBasisConfig.ep,
    submissionChannel: "diia",
    calculation: {
      type: "ep",
      data: {
        totalIncome: 1020000,
        taxRate: 0,
        calculatedTax: 0,
        paidAdvances: 3628.8, // 302.4 * 12
        toPay: 0,
      }
    },
    // ВЗ для 1 групи (з 01.12.2024) - фіксований
    militaryTax: {
      baseAmount: 0,
      rate: 0,
      calculatedVZ: 800, // фіксований за 1 місяць (грудень)
      toPay: 800,
      isLinkedToEP: true,
    },
    history: [
      { date: "2025-02-10", action: "Створено чернетку", role: "Власник" },
      { date: "2025-02-22", action: "Подано через Дію", role: "Власник" },
      { date: "2025-02-25", action: "Прийнято ДПС", role: "Система" },
    ],
  },
  {
    id: "rep-kozachenko-2024-esv",
    cabinetId: "9",
    type: "esv",
    typeLabel: "ЄСВ",
    name: "Звіт ЄСВ за 2024 рік",
    period: "year",
    periodLabel: "2024 рік",
    year: 2024,
    deadline: "2025-03-01",
    status: "accepted",
    statusLabel: "Прийнято",
    amountToPay: 19200,
    submittedDate: "2025-02-22",
    acceptedDate: "2025-02-25",
    dataSources: ["manual"],
    formCode: "F0133108",
    fopGroup: 1,
    legalBasis: legalBasisConfig.esv,
    calculation: {
      type: "esv",
      data: {
        minContribution: 1600,
        monthsCount: 12,
        totalESV: 19200,
        toPay: 19200,
      }
    },
    history: [
      { date: "2025-02-10", action: "Створено чернетку", role: "Власник" },
      { date: "2025-02-22", action: "Подано до ДПС", role: "Власник" },
      { date: "2025-02-25", action: "Прийнято ДПС", role: "Система" },
    ],
  },
  {
    id: "rep-kozachenko-2024-vz",
    cabinetId: "9",
    type: "vz",
    typeLabel: "Військовий збір",
    name: "Військовий збір за 2024 рік",
    period: "year",
    periodLabel: "2024 рік",
    year: 2024,
    deadline: "2025-03-01",
    status: "accepted",
    statusLabel: "Прийнято",
    amountToPay: 800,
    submittedDate: "2025-02-22",
    acceptedDate: "2025-02-25",
    dataSources: ["manual"],
    fopGroup: 1,
    legalBasis: legalBasisConfig.vz,
    calculation: {
      type: "vz",
      data: {
        baseAmount: 0,
        rate: 0,
        calculatedVZ: 800,
        toPay: 800,
        isLinkedToEP: true,
      }
    },
    history: [
      { date: "2025-02-10", action: "Створено разом з декларацією ЄП", role: "Власник" },
      { date: "2025-02-22", action: "Подано до ДПС", role: "Власник" },
      { date: "2025-02-25", action: "Прийнято ДПС", role: "Система" },
    ],
  },

  // 2025 рік (draft)
  {
    id: "rep-kozachenko-2025-ep",
    cabinetId: "9",
    type: "ep",
    typeLabel: "Єдиний податок (ЄП)",
    name: "Декларація ЄП за 2025 рік",
    period: "year",
    periodLabel: "2025 рік",
    year: 2025,
    deadline: "2026-03-01",
    status: "draft",
    statusLabel: "Чернетка",
    draftProgress: 40,
    amountToPay: 0,
    dataSources: ["income-book"],
    formCode: "F0103406",
    fopGroup: 1,
    calculation: {
      type: "ep",
      data: {
        totalIncome: 1050000,
        taxRate: 0,
        calculatedTax: 0,
        paidAdvances: 3628.8,
        toPay: 0,
      }
    },
    militaryTax: {
      baseAmount: 0,
      rate: 0,
      calculatedVZ: 9600, // 800 * 12
      toPay: 9600,
      isLinkedToEP: true,
    },
    history: [
      { date: "2025-12-20", action: "Створено чернетку", role: "Система" },
    ],
  },
  {
    id: "rep-kozachenko-2025-esv",
    cabinetId: "9",
    type: "esv",
    typeLabel: "ЄСВ",
    name: "Звіт ЄСВ за 2025 рік",
    period: "year",
    periodLabel: "2025 рік",
    year: 2025,
    deadline: "2026-03-01",
    status: "draft",
    statusLabel: "Чернетка",
    draftProgress: 40,
    amountToPay: 21120,
    dataSources: ["manual"],
    formCode: "F0133108",
    fopGroup: 1,
    calculation: {
      type: "esv",
      data: {
        minContribution: 1760,
        monthsCount: 12,
        totalESV: 21120,
        toPay: 21120,
      }
    },
    history: [
      { date: "2025-12-20", action: "Створено чернетку", role: "Система" },
    ],
  },
  {
    id: "rep-kozachenko-2025-vz",
    cabinetId: "9",
    type: "vz",
    typeLabel: "Військовий збір",
    name: "Військовий збір за 2025 рік",
    period: "year",
    periodLabel: "2025 рік",
    year: 2025,
    deadline: "2026-03-01",
    status: "draft",
    statusLabel: "Чернетка",
    draftProgress: 40,
    amountToPay: 9600,
    dataSources: ["manual"],
    fopGroup: 1,
    calculation: {
      type: "vz",
      data: {
        baseAmount: 0,
        rate: 0,
        calculatedVZ: 9600,
        toPay: 9600,
        isLinkedToEP: true,
      }
    },
    history: [
      { date: "2025-12-20", action: "Створено разом з декларацією ЄП", role: "Система" },
    ],
  },

  // 2026 рік (not-formed)
  {
    id: "rep-kozachenko-2026-ep",
    cabinetId: "9",
    type: "ep",
    typeLabel: "Єдиний податок (ЄП)",
    name: "Декларація ЄП за 2026 рік",
    period: "year",
    periodLabel: "2026 рік",
    year: 2026,
    deadline: "2027-03-01",
    status: "not-formed",
    statusLabel: "Не сформовано",
    dataSources: [],
    formCode: "F0103406",
    fopGroup: 1,
    history: [],
  },
  {
    id: "rep-kozachenko-2026-esv",
    cabinetId: "9",
    type: "esv",
    typeLabel: "ЄСВ",
    name: "Звіт ЄСВ за 2026 рік",
    period: "year",
    periodLabel: "2026 рік",
    year: 2026,
    deadline: "2027-03-01",
    status: "not-formed",
    statusLabel: "Не сформовано",
    dataSources: [],
    formCode: "F0133108",
    fopGroup: 1,
    history: [],
  },
  {
    id: "rep-kozachenko-2026-vz",
    cabinetId: "9",
    type: "vz",
    typeLabel: "Військовий збір",
    name: "Військовий збір за 2026 рік",
    period: "year",
    periodLabel: "2026 рік",
    year: 2026,
    deadline: "2027-03-01",
    status: "not-formed",
    statusLabel: "Не сформовано",
    dataSources: [],
    fopGroup: 1,
    history: [],
  },

  // ========== QA: ФОП Іваненко (cabinetId: "2") — повне покриття lifecycle ==========
  // Додано для тестування 7 статусів життєвого циклу та фільтрів.

  // [QA-1] PROCESSING — AI формує Декларацію ЄП за I квартал 2026
  {
    id: "qa-ep-q1-2026-processing",
    cabinetId: "2",
    type: "ep",
    typeLabel: "Єдиний податок (ЄП)",
    name: "Декларація ЄП за I квартал 2026",
    period: "Q1",
    periodLabel: "I квартал 2026",
    year: 2026,
    quarter: 1,
    deadline: "2026-05-11",
    status: "processing",
    statusLabel: "Формується AI",
    draftProgress: 62,
    dataSources: ["income-book", "integrations"],
    formCode: "F0103308",
    fopGroup: 3,
    legalBasis: legalBasisConfig.ep,
    submissionChannel: "tax-cabinet",
    history: [
      { date: "2026-04-19", action: "AI почав формування звіту", role: "Система" },
    ],
  },

  // [QA-2] APPROVED — Декларація ЄП за III квартал 2025 (підтверджено, готово до подання)
  {
    id: "qa-ep-q3-2025-approved",
    cabinetId: "2",
    type: "ep",
    typeLabel: "Єдиний податок (ЄП)",
    name: "Декларація ЄП за III квартал 2025",
    period: "Q3",
    periodLabel: "III квартал 2025",
    year: 2025,
    quarter: 3,
    deadline: "2025-11-09",
    status: "approved",
    statusLabel: "Підтверджено",
    amountToPay: 23400,
    draftProgress: 100,
    dataSources: ["income-book", "integrations"],
    formCode: "F0103308",
    fopGroup: 3,
    legalBasis: legalBasisConfig.ep,
    submissionChannel: "tax-cabinet",
    calculation: {
      type: "ep",
      data: {
        totalIncome: 468000,
        taxRate: 5,
        calculatedTax: 23400,
        toPay: 23400,
      },
    },
    militaryTax: {
      baseAmount: 468000,
      rate: 1,
      calculatedVZ: 4680,
      toPay: 4680,
      isLinkedToEP: true,
    },
    history: [
      { date: "2025-10-20", action: "AI сформував звіт", role: "Система" },
      { date: "2025-10-25", action: "Користувач підтвердив звіт", role: "Власник" },
    ],
  },

  // [QA-3] APPROVED — 4ДФ за березень 2026
  {
    id: "qa-1df-mar-2026-approved",
    cabinetId: "2",
    type: "1df",
    typeLabel: "4ДФ (ПДФО+ВЗ+ЄСВ)",
    name: "4ДФ за березень 2026",
    period: "month",
    periodLabel: "березень 2026",
    year: 2026,
    month: 3,
    deadline: "2026-04-20",
    status: "approved",
    statusLabel: "Підтверджено",
    amountToPay: 18450,
    draftProgress: 100,
    dataSources: ["employees"],
    formCode: "F0500107",
    fopGroup: 3,
    submissionChannel: "tax-cabinet",
    history: [
      { date: "2026-04-10", action: "AI сформував звіт", role: "Система" },
      { date: "2026-04-15", action: "Користувач підтвердив звіт", role: "Власник" },
    ],
  },

  // [QA-4] SUBMITTED — 4ДФ за лютий 2026 (подано, очікує квитанцію №2)
  {
    id: "qa-1df-feb-2026-submitted",
    cabinetId: "2",
    type: "1df",
    typeLabel: "4ДФ (ПДФО+ВЗ+ЄСВ)",
    name: "4ДФ за лютий 2026",
    period: "month",
    periodLabel: "лютий 2026",
    year: 2026,
    month: 2,
    deadline: "2026-03-20",
    status: "submitted",
    statusLabel: "Подано",
    amountToPay: 17890,
    submittedDate: "2026-03-18",
    dataSources: ["employees"],
    formCode: "F0500107",
    fopGroup: 3,
    submissionChannel: "tax-cabinet",
    receipt1: {
      id: "rcpt1-qa-1df-feb",
      number: "9001234567894001",
      date: "2026-03-18T12:30:00Z",
    },
    history: [
      { date: "2026-03-15", action: "AI сформував звіт", role: "Система" },
      { date: "2026-03-17", action: "Користувач підтвердив звіт", role: "Власник" },
      { date: "2026-03-18", action: "Подано до ДПС (Квитанція №1)", role: "Власник" },
    ],
  },

  // [QA-5] ACCEPTED + PAID — 4ДФ за січень 2026 (повністю завершено)
  {
    id: "qa-1df-jan-2026-paid",
    cabinetId: "2",
    type: "1df",
    typeLabel: "4ДФ (ПДФО+ВЗ+ЄСВ)",
    name: "4ДФ за січень 2026",
    period: "month",
    periodLabel: "січень 2026",
    year: 2026,
    month: 1,
    deadline: "2026-02-20",
    status: "accepted",
    statusLabel: "Прийнято",
    amountToPay: 17500,
    submittedDate: "2026-02-18",
    acceptedDate: "2026-02-19",
    dataSources: ["employees"],
    formCode: "F0500107",
    fopGroup: 3,
    submissionChannel: "tax-cabinet",
    receipt1: {
      id: "rcpt1-qa-1df-jan",
      number: "9001234567893001",
      date: "2026-02-18T10:15:00Z",
    },
    receipt2: {
      id: "rcpt2-qa-1df-jan",
      number: "9001234567893002",
      date: "2026-02-19T16:40:00Z",
    },
    history: [
      { date: "2026-02-15", action: "AI сформував звіт", role: "Система" },
      { date: "2026-02-17", action: "Користувач підтвердив звіт", role: "Власник" },
      { date: "2026-02-18", action: "Подано до ДПС (Квитанція №1)", role: "Власник" },
      { date: "2026-02-19", action: "Прийнято ДПС (Квитанція №2)", role: "Система" },
      { date: "2026-02-20", action: "Сплачено повністю", role: "Власник" },
    ],
  },

  // [QA-6] REJECTED — Декларація ЄП за IV квартал 2024 (відхилено ДПС)
  {
    id: "qa-ep-q4-2024-rejected",
    cabinetId: "2",
    type: "ep",
    typeLabel: "Єдиний податок (ЄП)",
    name: "Декларація ЄП за IV квартал 2024",
    period: "Q4",
    periodLabel: "IV квартал 2024",
    year: 2024,
    quarter: 4,
    deadline: "2025-02-09",
    status: "rejected",
    statusLabel: "Відхилено",
    amountToPay: 19250,
    submittedDate: "2025-02-05",
    dataSources: ["income-book", "integrations"],
    formCode: "F0103308",
    fopGroup: 3,
    legalBasis: legalBasisConfig.ep,
    submissionChannel: "tax-cabinet",
    rejectionDetails: {
      reason: "Невідповідність суми доходу даним банківських виписок. Перевірте правильність відображення надходжень за грудень 2024.",
      code: "ERR-DPS-2841",
      date: "2025-02-07T09:20:00Z",
      correctionDeadline: "2025-02-25",
    },
    history: [
      { date: "2025-02-01", action: "AI сформував звіт", role: "Система" },
      { date: "2025-02-04", action: "Користувач підтвердив звіт", role: "Власник" },
      { date: "2025-02-05", action: "Подано до ДПС", role: "Власник" },
      { date: "2025-02-07", action: "Відхилено ДПС: ERR-DPS-2841", role: "Система" },
    ],
  },

  // [QA-7] REVIEW + OVERDUE — Звіт ЄСВ за 2025 рік (прострочено, на перевірці)
  {
    id: "qa-esv-2025-overdue",
    cabinetId: "2",
    type: "esv",
    typeLabel: "ЄСВ",
    name: "Звіт ЄСВ за 2025 рік",
    period: "year",
    periodLabel: "2025 рік",
    year: 2025,
    deadline: "2026-02-09",
    status: "review",
    statusLabel: "На перевірку",
    amountToPay: 21120,
    draftProgress: 100,
    dataSources: ["manual"],
    formCode: "F0133108",
    fopGroup: 3,
    legalBasis: legalBasisConfig.esv,
    submissionChannel: "tax-cabinet",
    calculation: {
      type: "esv",
      data: {
        minContribution: 1760,
        monthsCount: 12,
        totalESV: 21120,
        toPay: 21120,
      },
    },
    history: [
      { date: "2026-01-25", action: "AI сформував звіт", role: "Система" },
      { date: "2026-04-19", action: "⚠ Дедлайн прострочено", role: "Система" },
    ],
  },
];

// ========== ХЕЛПЕРИ ==========

import { isDemoCabinet, getDemoReportsForCabinet } from "@/config/demoCabinetsData";

// Отримати звіти кабінету
export function getReportsForCabinet(cabinetId: string): Report[] {
  // Check for specialized demo cabinets first
  if (isDemoCabinet(cabinetId)) {
    return getDemoReportsForCabinet(cabinetId);
  }
  // Fallback to filtering legacy demo reports
  return demoReports.filter(r => r.cabinetId === cabinetId);
}

// Отримати найближчі дедлайни
export function getUpcomingDeadlines(reports: Report[], days: number = 30): Report[] {
  const now = new Date();
  const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
  
  return reports
    .filter(r => {
      const deadline = new Date(r.deadline);
      return deadline >= now && deadline <= futureDate && r.status !== "accepted";
    })
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
}

// Визначити терміновість дедлайну
export function getDeadlineUrgency(deadline: string): "urgent" | "warning" | "normal" {
  const now = new Date();
  const deadlineDate = new Date(deadline);
  const daysLeft = Math.ceil((deadlineDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
  
  if (daysLeft <= 7) return "urgent";
  if (daysLeft <= 14) return "warning";
  return "normal";
}

// Підрахунок статистики (autonomous status system)
export function getReportsStats(reports: Report[], year: number) {
  const yearReports = reports.filter(r => r.year === year);
  
  const toSubmit = yearReports.filter(r => r.status === "review" || r.status === "approved" || r.status === "scheduled");
  const submitted = yearReports.filter(r => r.status === "submitted" || r.status === "accepted");
  const accepted = yearReports.filter(r => r.status === "accepted");
  const problems = yearReports.filter(r => r.status === "rejected");
  
  const epCount = toSubmit.filter(r => r.type === "ep").length;
  const esvCount = toSubmit.filter(r => r.type === "esv" || r.type === "esv-emp").length;
  const vzCount = toSubmit.filter(r => r.type === "vz" || r.type === "vz-emp").length;
  const onedfCount = toSubmit.filter(r => r.type === "1df").length;
  const pdfoCount = toSubmit.filter(r => r.type === "pdfo").length;
  
  return {
    toSubmitCount: toSubmit.length,
    submittedCount: submitted.length,
    acceptedCount: accepted.length,
    problemsCount: problems.length,
    epCount,
    esvCount,
    vzCount,
    onedfCount,
    pdfoCount,
    inProcessCount: yearReports.filter(r => r.status === "submitted").length,
  };
}

// Отримати канал подання за ID
export function getSubmissionChannel(id: SubmissionChannelId): SubmissionChannel | undefined {
  return submissionChannels.find(ch => ch.id === id);
}

// Отримати доступні канали для типу звіту
export function getAvailableChannels(reportType: ReportType): SubmissionChannel[] {
  return submissionChannels.filter(ch => 
    ch.isAvailable && ch.supportedReportTypes.includes(reportType)
  );
}

// Отримати конфігурацію форми
export function getReportFormConfig(report: Report): ReportFormConfig | undefined {
  if (!report.formCode) return undefined;
  
  // Map form codes to config keys
  const key = report.type === "ep" && report.fopGroup && report.fopGroup <= 2 
    ? "ep-y12" 
    : report.type === "ep" 
    ? "ep-q3"
    : report.type;
    
  return reportFormConfigs[key];
}
