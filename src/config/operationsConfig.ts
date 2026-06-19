import type { LucideIcon } from "lucide-react";
import {
  FileText,
  BookOpen,
  Send,
  CreditCard,
  Users,
  Landmark,
  Briefcase,
  Package,
  Truck,
  ClipboardList,
  Home,
  ListChecks,
  BarChart3,
  Sparkles,
  Building2,
  FileCheck2,
  FileSignature,
  FileClock,
  FileArchive,
  Receipt,
  ScrollText,
  FolderOpen,
  FileSearch,
  FilePlus,
  ClipboardCheck,
  Calendar,
  GraduationCap,
  Activity,
  Handshake,
  Repeat,
  Bot,
  CalendarCheck,
  ShoppingCart,
  PackagePlus,
  ShoppingBag,
  MapPin,
  // Personal Office additional icons
  PiggyBank, Network as NetworkIcon, Heart, ShieldCheck, Stethoscope,
  Archive, Target, Wallet, Smartphone, Users2, Building, KeyRound,
  Workflow, Zap, Lock,
} from "lucide-react";
import type { Cabinet, CabinetType, CabinetRole, CabinetCapability } from "@/types/cabinet";
import { hasAllCapabilities } from "@/config/cabinetCapabilities";
import { getVerticalIdOrNull } from "@/core";

// Utility function to get first sub-tab for a cabinet type.
// Якщо передано cabinet — фільтрує модулі за capabilities та showCondition.
export const getFirstOperationsSubTab = (
  cabinetOrType: Cabinet | CabinetType,
): string => {
  // Усі типи кабінетів стартують з картки-хабу («Управління»),
  // а не з конкретного модуля. Individual — Life Launcher; business/fop — CabinetManagementHub.
  return "__launcher__";
};

export type RecordStatus = 
  | "draft" | "signed" | "sent" | "paid" | "pending" | "overdue"
  | "approved" | "ready" | "submitted" | "ok" | "warning" | "error";

export interface DemoRecord {
  id: string;
  columns: Record<string, string | number>;
  status?: RecordStatus;
  statusLabel?: string;
}

export interface TableColumn {
  key: string;
  label: string;
  width?: string;
  align?: "left" | "center" | "right";
}

export interface CtaButton {
  id: string;
  label: string;
  variant?: "default" | "outline" | "ghost" | "secondary";
  icon?: LucideIcon;
  aiAction?: boolean;
}

export interface OperationsSubTab {
  id: string;
  label: string;
  icon: LucideIcon;
  description: string;
  tableColumns?: TableColumn[];
  demoRecords?: DemoRecord[];
  ctaButtons?: CtaButton[];
  roleHints?: Partial<Record<CabinetRole, string>>;
  notice?: string;
  showCondition?: (cabinet: Cabinet) => boolean;
  /**
   * Capabilities, які мають бути активні в кабінеті, щоб модуль відображався.
   * Перевіряється через `deriveCapabilities(cabinet)` у `getOperationsSubTabs`.
   */
  requiresCapability?: CabinetCapability | CabinetCapability[];
}

const fopOperations: OperationsSubTab[] = [
  {
    id: "documents", label: "Документообіг", icon: FolderOpen,
    description: "Рахунки, акти, договори, чеки ПРРО — повний цикл документа",
    tableColumns: [
      { key: "number", label: "№ документа", width: "18%" },
      { key: "type", label: "Тип", width: "14%" },
      { key: "contractor", label: "Контрагент", width: "22%" },
      { key: "amount", label: "Сума", width: "14%", align: "right" },
      { key: "date", label: "Дата", width: "12%" },
      { key: "status", label: "Статус", width: "20%" },
    ],
    demoRecords: [
      { id: "doc-fop-001", columns: { number: "РАХ-2024-042", type: "Рахунок", contractor: "ТОВ «Діджитал Солюшнс»", amount: "15 000 ₴", date: "05.12.2024" }, status: "paid", statusLabel: "Оплачено" },
      { id: "doc-fop-002", columns: { number: "АКТ-2024-041", type: "Акт", contractor: "ТОВ «Діджитал Солюшнс»", amount: "15 000 ₴", date: "06.12.2024" }, status: "signed", statusLabel: "Підписано" },
      { id: "doc-fop-003", columns: { number: "РАХ-2025-001", type: "Рахунок", contractor: "ФОП Петренко І.В.", amount: "8 500 ₴", date: "15.01.2025" }, status: "draft", statusLabel: "Чернетка" },
      { id: "doc-fop-004", columns: { number: "ЧЕК-20241209", type: "Чек ПРРО", contractor: "—", amount: "2 500 ₴", date: "09.12.2024" }, status: "approved", statusLabel: "Фіскалізовано" },
      { id: "doc-fop-005", columns: { number: "ДОГ-2024-012", type: "Договір", contractor: "ФОП Петренко І.В.", amount: "—", date: "01.12.2024" }, status: "draft", statusLabel: "Чернетка" },
      { id: "doc-fop-006", columns: { number: "РАХ-2025-002", type: "Рахунок", contractor: "ТОВ «Веб-Студія»", amount: "25 000 ₴", date: "10.02.2025" }, status: "sent", statusLabel: "Відправлено" },
    ],
    ctaButtons: [
      { id: "create-invoice", label: "Створити рахунок", variant: "default", icon: FilePlus },
      { id: "create-act", label: "Створити акт", variant: "outline", icon: FileCheck2 },
      { id: "ai-find-unpaid", label: "AI: Неоплачені рахунки", variant: "secondary", icon: Sparkles, aiAction: true },
    ],
    roleHints: {
      accountant: "Перевірте підписані документи перед закриттям періоду",
      auditor: "Режим перегляду — зміни заборонені",
      owner: "2 рахунки очікують оплати",
    },
  },
  {
    id: "income-book", label: "Книга доходів", icon: BookOpen,
    description: "Облік доходів та витрат для єдиного податку",
    tableColumns: [
      { key: "date", label: "Дата", width: "12%" },
      { key: "description", label: "Опис", width: "30%" },
      { key: "amount", label: "Сума", width: "15%", align: "right" },
      { key: "type", label: "Тип", width: "12%" },
      { key: "source", label: "Джерело", width: "15%" },
      { key: "category", label: "Категорія", width: "16%" },
    ],
    demoRecords: [
      { id: "1", columns: { date: "09.12.2024", description: "Оплата за консалтинг", amount: "+15 000 ₴", type: "Дохід", source: "🏦 Monobank", category: "Консалтинг" }, status: "ok" },
      { id: "2", columns: { date: "08.12.2024", description: "Оренда офісу", amount: "-5 000 ₴", type: "Витрата", source: "Вручну", category: "Оренда" }, status: "ok" },
      { id: "3", columns: { date: "15.01.2025", description: "Канцтовари", amount: "-800 ₴", type: "Витрата", source: "🏦 Monobank", category: "⚠️ Без категорії" }, status: "warning" },
    ],
    ctaButtons: [
      { id: "add-record", label: "Додати запис", variant: "default", icon: BookOpen },
      { id: "import-bank", label: "Імпорт з банку (демо)", variant: "outline", icon: Landmark },
      { id: "ai-classify", label: "AI: Класифікувати", variant: "secondary", icon: Sparkles, aiAction: true },
    ],
    roleHints: { accountant: "Перевірте категорії перед формуванням звіту", owner: "1 запис без категорії" },
  },
  {
    id: "bookings", label: "Щоденник", icon: CalendarCheck,
    description: "Щоденник записів салону — календар, послуги, майстри, винагороди",
    requiresCapability: "bookings",
    roleHints: {
      owner: "Завантаженість майстрів і виторг — у реальному часі",
      accountant: "Кожне завершене бронювання — рядок у Книзі доходів і нарахування винагороди",
    },
  },
  {
    id: "clients", label: "Клієнти", icon: Users,
    description: "База клієнтів салону: картки, історія, RFM-сегменти, лояльність, синхронізація з зовнішньою CRM",
    requiresCapability: "client_book",
    showCondition: (c) => getVerticalIdOrNull(c) !== null,
    roleHints: {
      owner: "RFM-сегменти, churn-risk, бонусний баланс, інтеграція з Altegio/KeyCRM",
      accountant: "Бонусні нарахування і списання дзеркаляться у Книгу доходів",
      auditor: "Контакти маскуються згідно з ролі (RLS)",
    },
  },
  {
    id: "sales", label: "Продажі", icon: ShoppingCart,
    description: "Виторг по каналах (каса, B2B, онлайн, upsell), замовлення, прайс і знижки",
    requiresCapability: "goods_sales",
    roleHints: {
      owner: "Виторг товарів і послуг у режимі real-time. AI знаходить SKU з падінням продажів.",
      accountant: "Channel-розрахунок виторгу → дзеркало в Книгу доходів через ledger-bridge",
    },
  },
  {
    id: "purchases", label: "Закупки", icon: PackagePlus,
    description: "Замовлення постачальникам, прийом (GRN), landed cost, scorecard, мульти-валютність",
    requiresCapability: "purchases",
    roleHints: {
      owner: "Що замовити цього тижня — на основі min-stock + ADU + booking pipeline",
      accountant: "Landed cost розподіляється на собівартість пропорційно вартості позицій",
    },
  },
  {
    id: "delivery", label: "Доставка", icon: Truck,
    description: "Курʼєрська доставка замовлень: маршрути, статуси, ETA, зони доставки",
    requiresCapability: "delivery",
    roleHints: {
      owner: "Активні замовлення на доставку в реальному часі. Середній час доставки і % вчасно.",
      accountant: "Виторг по каналу 'delivery' дзеркалиться в Книгу доходів. Курʼєрські послуги — як платежі контрагентам.",
    },
  },
  {
    id: "employees", label: "Працівники", icon: Users,
    description: "Кадровий облік: працівники, посади, договори",
    requiresCapability: "employees",
  },
  {
    id: "finance", label: "Фінанси", icon: Landmark,
    description: "Залишок коштів на рахунках та в касі — стан грошей зараз",
    roleHints: {
      owner: "Сукупний баланс по всіх рахунках і касах",
      accountant: "Перевірте sync банк-рахунків перед формуванням платежів",
    },
  },
  {
    id: "taxes", label: "Податки", icon: Landmark,
    description: "Перелік та деталізація податків ФОП: ЄП, ЄСВ, ВЗ, ПДФО",
    roleHints: {
      accountant: "Огляд нарахувань, дедлайнів і санкцій по кожному податку",
      owner: "Скільки нараховано, сплачено, прострочено — по типах податків",
    },
  },
  {
    id: "payments", label: "Платежі", icon: CreditCard,
    description: "Податки, виплати працівникам та платежі контрагентам",
  },
  {
    id: "reports", label: "Звіти", icon: Send,
    description: "Формування та подача податкової звітності",
    tableColumns: [
      { key: "name", label: "Назва звіту", width: "35%" },
      { key: "period", label: "Період", width: "20%" },
      { key: "deadline", label: "Дедлайн", width: "20%" },
      { key: "status", label: "Статус", width: "25%" },
    ],
    demoRecords: [
      { id: "1", columns: { name: "Декларація ЄП", period: "IV кв. 2024", deadline: "09.02.2025" }, status: "draft", statusLabel: "Чернетка" },
      { id: "2", columns: { name: "Звіт ЄСВ", period: "IV кв. 2024", deadline: "09.02.2025" }, status: "ready", statusLabel: "Готово" },
      { id: "3", columns: { name: "Декларація ЄП", period: "III кв. 2024", deadline: "09.11.2024" }, status: "submitted", statusLabel: "Подано" },
    ],
    ctaButtons: [
      { id: "generate-report", label: "Згенерувати чернетку", variant: "default", icon: Send },
      { id: "ai-prepare", label: "AI: Підготувати звіт", variant: "secondary", icon: Sparkles, aiAction: true },
    ],
    roleHints: { accountant: "Перевірте дані перед подачею" },
  },
  {
    id: "audits", label: "Перевірки", icon: ClipboardCheck,
    description: "Податкові перевірки, запити від ДПС, документи для аудиту",
    roleHints: {
      accountant: "1 перевірка очікує відповіді",
      owner: "Активна перевірка ДПС",
    },
  },
];

const tovOperations: OperationsSubTab[] = [
  {
    id: "documents", label: "Документообіг", icon: FolderOpen,
    description: "Первинна документація, ПН, маршрути погодження, архівування",
    tableColumns: [
      { key: "number", label: "№ документа", width: "16%" },
      { key: "type", label: "Тип", width: "14%" },
      { key: "contractor", label: "Контрагент", width: "22%" },
      { key: "amount", label: "Сума", width: "14%", align: "right" },
      { key: "date", label: "Дата", width: "10%" },
      { key: "status", label: "Статус", width: "24%" },
    ],
    demoRecords: [
      { id: "doc-tov-001", columns: { number: "НКЛ-2024-127", type: "Накладна", contractor: "ТОВ «Постачальник Плюс»", amount: "48 000 ₴", date: "09.12.2024" }, status: "approved", statusLabel: "Погоджено" },
      { id: "doc-tov-002", columns: { number: "ПН-2024-089", type: "Под. накладна", contractor: "ТОВ «Клієнт Сервіс»", amount: "125 000 ₴", date: "08.12.2024" }, status: "submitted", statusLabel: "Зареєстровано ЄРПН" },
      { id: "doc-tov-003", columns: { number: "ДОГ-2025-001", type: "Договір", contractor: "ТОВ «Партнер Груп»", amount: "—", date: "10.01.2025" }, status: "pending", statusLabel: "На погодженні" },
      { id: "doc-tov-004", columns: { number: "РАХ-2024-156", type: "Рахунок", contractor: "ТОВ «Клієнт Сервіс»", amount: "85 000 ₴", date: "07.12.2024" }, status: "warning", statusLabel: "Частково оплачено" },
      { id: "doc-tov-005", columns: { number: "АКТ-ЗВ-Q4", type: "Акт звірки", contractor: "ТОВ «Постачальник Плюс»", amount: "—", date: "11.12.2024" }, status: "sent", statusLabel: "Відправлено" },
      { id: "doc-tov-006", columns: { number: "НКЗ-2025-001", type: "Наказ", contractor: "—", amount: "—", date: "15.01.2025" }, status: "signed", statusLabel: "Підписано КЕП" },
    ],
    ctaButtons: [
      { id: "create-doc", label: "Створити документ", variant: "default", icon: FilePlus },
      { id: "register-pn", label: "Зареєструвати ПН", variant: "outline", icon: ScrollText },
      { id: "ai-match-payments", label: "AI: Зіставити з оплатами", variant: "secondary", icon: Sparkles, aiAction: true },
    ],
    roleHints: {
      accountant: "2 документи очікують погодження, 1 ПН потребує реєстрації",
      auditor: "Режим перегляду — зміни заборонені",
    },
  },
  {
    id: "finance", label: "Фінанси", icon: Landmark,
    description: "Залишок коштів на рахунках та в касі — стан грошей зараз",
    roleHints: {
      owner: "Net-баланс по всіх рахунках, касах і валютних позиціях",
      accountant: "Контролюйте sync банків і Z-звіти ПРРО",
    },
  },
  {
    id: "hr-payroll", label: "HR / Payroll", icon: Briefcase,
    description: "Управління персоналом та зарплата",
    requiresCapability: "employees",
    tableColumns: [
      { key: "name", label: "Співробітник", width: "28%" },
      { key: "position", label: "Посада", width: "22%" },
      { key: "department", label: "Відділ", width: "20%" },
      { key: "salary", label: "Оклад", width: "15%", align: "right" },
      { key: "status", label: "Статус", width: "15%" },
    ],
    demoRecords: [
      { id: "1", columns: { name: "Бондаренко О.І.", position: "Директор", department: "Керівництво", salary: "45 000 ₴" }, status: "paid", statusLabel: "Виплачено" },
      { id: "2", columns: { name: "Кравченко М.С.", position: "Головбух", department: "Бухгалтерія", salary: "35 000 ₴" }, status: "paid", statusLabel: "Виплачено" },
      { id: "3", columns: { name: "Литвиненко А.В.", position: "Менеджер", department: "Продажі", salary: "28 000 ₴" }, status: "pending", statusLabel: "Нараховано" },
    ],
    ctaButtons: [
      { id: "add-employee", label: "Додати співробітника", variant: "default", icon: Users },
      { id: "create-payroll", label: "Сформувати відомість", variant: "outline", icon: Briefcase },
    ],
    roleHints: { accountant: "Перевірте нарахування за грудень" },
  },
  // ⛔ Модуль «Продажі» (універсальні рахунки) видалено: для SaaS-кабінетів
  // рахунки клієнтам генеруються з картки підписки і відображаються в
  // Документообігу. Універсальні B2B-рахунки тут — дублювання даних.
  {
    id: "sales", label: "Продажі", icon: ShoppingCart,
    description: "Замовлення клієнтам, виторг по каналах, прайс і знижки",
    requiresCapability: "goods_sales",
    roleHints: {
      owner: "Виторг товарів і послуг по каналах — real-time",
      accountant: "Channel-розрахунок виторгу → дзеркало в облік",
    },
  },
  {
    id: "purchases", label: "Закупки", icon: PackagePlus,
    description: "Замовлення постачальникам, прийом (GRN), landed cost, scorecard, мульти-валютність",
    requiresCapability: "purchases",
    roleHints: {
      owner: "Що замовити цього тижня — на основі min-stock + ADU",
      accountant: "Landed cost у собівартість пропорційно вартості позицій",
    },
  },
  {
    id: "warehouse", label: "Склад", icon: Truck,
    description: "Складський облік та рух товарів",
    requiresCapability: "warehouse",
    tableColumns: [
      { key: "sku", label: "Артикул", width: "15%" },
      { key: "name", label: "Товар", width: "35%" },
      { key: "quantity", label: "Залишок", width: "18%", align: "right" },
      { key: "lastMove", label: "Рух", width: "17%" },
      { key: "status", label: "Статус", width: "15%" },
    ],
    demoRecords: [
      { id: "1", columns: { sku: "SKU-001", name: "Комплектуючі А", quantity: "150 шт", lastMove: "Прихід 09.12.2024" }, status: "ok", statusLabel: "Норма" },
      { id: "2", columns: { sku: "SKU-002", name: "Матеріали Б", quantity: "45 шт", lastMove: "Витрата 08.12.2024" }, status: "warning", statusLabel: "Мало" },
      { id: "3", columns: { sku: "SKU-003", name: "Запчастини В", quantity: "0 шт", lastMove: "Витрата 05.01.2025" }, status: "error", statusLabel: "Немає" },
    ],
    ctaButtons: [
      { id: "add-income", label: "Прихід товару", variant: "default", icon: Truck },
      { id: "add-outcome", label: "Витрата", variant: "outline", icon: Truck },
    ],
    roleHints: { accountant: "2 позиції потребують поповнення" },
  },
  {
    id: "reports", label: "Звіти", icon: Send,
    description: "Податкова та управлінська звітність",
    tableColumns: [
      { key: "name", label: "Звіт", width: "35%" },
      { key: "period", label: "Період", width: "20%" },
      { key: "deadline", label: "Дедлайн", width: "20%" },
      { key: "status", label: "Статус", width: "25%" },
    ],
    demoRecords: [
      { id: "1", columns: { name: "Декларація ПДВ", period: "Листопад", deadline: "20.12.2024" }, status: "ready", statusLabel: "Готово" },
      { id: "2", columns: { name: "Звіт ЄСВ", period: "IV кв.", deadline: "09.02.2025" }, status: "draft", statusLabel: "Чернетка" },
      { id: "3", columns: { name: "Фінзвітність", period: "2024", deadline: "28.02.2025" }, status: "draft", statusLabel: "Чернетка" },
    ],
    ctaButtons: [
      { id: "generate-report", label: "Згенерувати звіт", variant: "default", icon: Send },
      { id: "ai-report", label: "AI: Перевірити звіт", variant: "secondary", icon: Sparkles, aiAction: true },
    ],
    roleHints: { accountant: "1 звіт готовий до подачі" },
  },
  {
    id: "audits", label: "Перевірки", icon: ClipboardCheck,
    description: "Податкові перевірки, запити від ДПС, документи для аудиту",
    roleHints: {
      accountant: "1 перевірка очікує відповіді",
      owner: "Активна перевірка ДПС",
    },
  },
  // ───── SaaS-модулі (capability "saas_business") ─────
  // Видимі будь-якому ТОВ-кабінету з активним SaaS-профілем.
  {
    id: "crm", label: "Клієнти (CRM)", icon: Users,
    description: "Воронка продажів, картки клієнтів, активності, MRR",
    requiresCapability: "saas_business",
    roleHints: {
      owner: "MRR 2,4 млн ₴/міс • 8 активних угод цього тижня",
    },
  },
  {
    id: "team-tasks", label: "Команда & Завдання", icon: ListChecks,
    description: "Робочі завдання команди, спринти, навантаження по людях",
    requiresCapability: "saas_business",
    roleHints: {
      owner: "12 людей у команді • 6 прострочених завдань",
    },
  },
];

// fopGroupOperations видалено: тип "fop-group" виведено з активного UI.
// operationsConfigByType["fop-group"] тепер фолбекає на fopOperations.

/**
 * ❗ Це leaf-конфіги (демо-таблиці майна та податкової знижки + старі id).
 * Експортуються лише для внутрішнього використання групами «Управління»
 * (`FinanceGroupPage`, `SavingsPage` тощо). В горизонтальному ряду пігулок
 * фізособи їх НЕ показуємо — там завжди 7 груп (див. `individualGroupOperations`).
 */
export const individualLeafOperations: OperationsSubTab[] = [
  // ────────────────────────────────────────────────────────────────────────
  // Робочий центр — задачі, цілі, погодження, календар
  // ────────────────────────────────────────────────────────────────────────
  {
    id: "tasks", label: "Завдання", icon: ListChecks,
    description: "Особисті та делеговані задачі — з пріоритетом, дедлайнами і AI-планом.",
    roleHints: { owner: "Що треба зробити сьогодні і цього тижня" },
  },
  {
    id: "lists", label: "Списки справ", icon: ClipboardList,
    description: "Тематичні списки: дім, подорож, авто, документи.",
  },
  {
    id: "approvals", label: "Погодження", icon: ClipboardCheck,
    description: "Документи, платежі та AI-дії, що чекають на ваше підтвердження.",
  },
  {
    id: "calendar", label: "Календар", icon: Calendar,
    description: "Усі дедлайни, події і нагадування в одному місці.",
  },
  {
    id: "diary", label: "Щоденник", icon: CalendarCheck,
    description: "Особистий графік майстра — записи з усіх активних делегацій (трудові та ФОП-послуг)",
    requiresCapability: "bookings_personal:operate",
    roleHints: {
      owner: "Усі ваші записи, заробіток і оренда — в одному місці",
    },
  },

  {
    id: "documents", label: "Документи", icon: FolderOpen,
    description: "Довідки, договори, квитанції для декларацій та податкової знижки",
    tableColumns: [
      { key: "number", label: "№ / Назва", width: "22%" },
      { key: "type", label: "Тип", width: "18%" },
      { key: "purpose", label: "Призначення", width: "22%" },
      { key: "date", label: "Дата", width: "12%" },
      { key: "amount", label: "Сума", width: "12%", align: "right" },
      { key: "status", label: "Статус", width: "14%" },
    ],
    demoRecords: [
      { id: "doc-ind-001", columns: { number: "ДОВ-2024-001", type: "Довідка", purpose: "Декларація 2024", date: "15.11.2024", amount: "—" }, status: "ok", statusLabel: "Отримано" },
      { id: "doc-ind-002", columns: { number: "ОР-2024-001", type: "Договір оренди", purpose: "ПДФО з оренди", date: "15.01.2024", amount: "15 000 ₴" }, status: "signed", statusLabel: "Активний" },
      { id: "doc-ind-003", columns: { number: "КВТ-2024-012", type: "Квитанція", purpose: "Податкова знижка", date: "20.08.2024", amount: "45 000 ₴" }, status: "approved", statusLabel: "Додано" },
      { id: "doc-ind-004", columns: { number: "ВИП-2024-001", type: "Виписка банку", purpose: "Підтвердження", date: "01.12.2024", amount: "—" }, status: "ok", statusLabel: "Отримано" },
      { id: "doc-ind-005", columns: { number: "ДОВ-2025-001", type: "Довідка", purpose: "Декларація 2025", date: "20.02.2025", amount: "—" }, status: "draft", statusLabel: "Чернетка" },
      { id: "doc-ind-006", columns: { number: "КВТ-2025-001", type: "Квитанція", purpose: "Податкова знижка", date: "10.03.2025", amount: "28 000 ₴" }, status: "ok", statusLabel: "Отримано" },
    ],
    ctaButtons: [
      { id: "add-document", label: "Додати документ", variant: "default", icon: FilePlus },
      { id: "upload-certificate", label: "Завантажити довідку", variant: "outline", icon: FileCheck2 },
      { id: "ai-what-needed", label: "AI: Що потрібно для декларації?", variant: "secondary", icon: Sparkles, aiAction: true },
    ],
    roleHints: {
      owner: "Зберіть усі документи для декларації до 01.05.2025",
    },
  },
  {
    id: "finance", label: "Фінанси", icon: Landmark,
    description: "Залишок коштів на особистих рахунках — стан грошей зараз",
    notice: "Лише особисті рахунки. Для рахунків ФОП відкрийте відповідний кабінет.",
    roleHints: {
      owner: "Net-баланс по особистих рахунках з курсом НБУ",
    },
  },
  {
    id: "property", label: "Майно", icon: Home,
    description: "Податкові події: нарахування, продажі, оренда",
    notice: "Реєстр усіх об'єктів → Налаштування → Довідники → Об'єкти майна",
    tableColumns: [
      { key: "type", label: "Тип", width: "13%" },
      { key: "description", label: "Опис", width: "25%" },
      { key: "event", label: "Подія", width: "15%" },
      { key: "area", label: "Площа", width: "12%" },
      { key: "taxYear", label: "Податок", width: "17%", align: "right" },
      { key: "status", label: "Статус", width: "18%" },
    ],
    demoRecords: [
      { id: "prop-1", columns: { type: "🏠 Квартира", description: "м. Київ, вул. Лесі Українки, 28", event: "Нарахування", area: "78 м²", taxYear: "2 335 ₴", year: "2025" }, status: "pending", statusLabel: "До сплати" },
      { id: "prop-2", columns: { type: "🏡 Будинок", description: "Київська обл., с. Вишневе", event: "Нарахування", area: "180 м²", taxYear: "7 782 ₴", year: "2024" }, status: "paid", statusLabel: "Сплачено" },
      { id: "prop-3", columns: { type: "🚗 Авто", description: "Toyota RAV4, 2020 р.в.", event: "Продаж", area: "—", taxYear: "0 ₴", year: "2024" }, status: "ok", statusLabel: "Продано 09/2024" },
      { id: "prop-4", columns: { type: "🌳 Ділянка", description: "Київська обл., с. Гатне (спадщина)", event: "Спадщина", area: "0.15 га", taxYear: "4 800 ₴", year: "2025" }, status: "pending", statusLabel: "До сплати" },
      { id: "prop-5", columns: { type: "🏠 Квартира", description: "м. Київ, пр. Перемоги, 67", event: "Продаж", area: "42 м²", taxYear: "—", year: "2026" }, status: "ok", statusLabel: "Продано 02/2026" },
      { id: "prop-6", columns: { type: "📦 Гараж", description: "м. Київ, Бортничі", event: "Продаж", area: "24 м²", taxYear: "—", year: "2024" }, status: "ok", statusLabel: "Продано 12/2024" },
      { id: "prop-7", columns: { type: "🏠 Квартира", description: "м. Київ, вул. Саксаганського (оренда)", event: "Оренда", area: "38 м²", taxYear: "41 400 ₴", year: "2025" }, status: "pending", statusLabel: "В оренді" },
      { id: "prop-9", columns: { type: "🏢 Офіс", description: "м. Київ, вул. Хрещатик, 10", event: "Нарахування", area: "65 м²", taxYear: "8 431 ₴", year: "2025" }, status: "pending", statusLabel: "Спільна власність" },
      { id: "prop-11", columns: { type: "🏠 Квартира", description: "Варшава, Польща (оренда)", event: "Оренда", area: "55 м²", taxYear: "69 000 ₴", year: "2025" }, status: "pending", statusLabel: "В оренді" },
    ],
    ctaButtons: [
      { id: "go-to-registry", label: "Перейти до реєстру", variant: "outline", icon: Home },
      { id: "ai-explain", label: "AI: Пояснити нарахування", variant: "secondary", icon: Sparkles, aiAction: true },
    ],
  },
  {
    id: "investments", label: "Інвестиції", icon: BarChart3,
    description: "Портфель цінних паперів, дивіденди, курсові різниці",
    tableColumns: [
      { key: "asset", label: "Актив", width: "20%" },
      { key: "operation", label: "Операція", width: "15%" },
      { key: "date", label: "Дата", width: "12%" },
      { key: "amountUsd", label: "Сума (USD)", width: "15%", align: "right" },
      { key: "rateNbu", label: "Курс НБУ", width: "12%", align: "right" },
      { key: "resultUah", label: "Результат (UAH)", width: "15%", align: "right" },
      { key: "status", label: "Статус", width: "11%" },
    ],
    demoRecords: [
      { id: "inv-1", columns: { asset: "Apple (AAPL)", operation: "Продаж", date: "15.08.2024", amountUsd: "+$1 200", rateNbu: "41.20", resultUah: "+49 440 ₴" }, status: "ok", statusLabel: "Задекларовано" },
      { id: "inv-2", columns: { asset: "NVIDIA (NVDA)", operation: "Продаж", date: "20.11.2024", amountUsd: "+$2 800", rateNbu: "41.20", resultUah: "+115 360 ₴" }, status: "ok", statusLabel: "Задекларовано" },
      { id: "inv-3", columns: { asset: "Microsoft (MSFT)", operation: "Дивіденди", date: "15.06.2024", amountUsd: "$340", rateNbu: "41.20", resultUah: "11 900 ₴" }, status: "ok", statusLabel: "Задекларовано" },
      { id: "inv-4", columns: { asset: "Tesla (TSLA)", operation: "Утримання", date: "—", amountUsd: "—", rateNbu: "—", resultUah: "—" }, status: "pending", statusLabel: "У портфелі" },
      { id: "inv-5", columns: { asset: "Google (GOOGL)", operation: "Продаж", date: "10.02.2025", amountUsd: "+$950", rateNbu: "41.50", resultUah: "+39 425 ₴" }, status: "pending", statusLabel: "Не задекларовано" },
    ],
    ctaButtons: [
      { id: "import-statement", label: "Імпорт IBKR Statement", variant: "default", icon: FilePlus },
      { id: "ai-fifo", label: "AI: Розрахунок FIFO", variant: "secondary", icon: Sparkles, aiAction: true },
    ],
    roleHints: { owner: "Інвестиційний прибуток: +$4 340 (176 700 ₴)" },
  },
  {
    id: "tax-discount", label: "Податкова знижка", icon: GraduationCap,
    description: "Повернення ПДФО за витрати на навчання, лікування, іпотеку (ст. 166 ПКУ)",
    notice: "Ліміт навчання: 3 × МЗП = 25 941 ₴ на кожну особу/рік. Дедлайн подання: 31.12.2026. Повернення ПДФО: до 60 днів після перевірки ДПС. ⚠️ Загальний ліміт: знижка не може перевищувати суму річного оподатковуваного доходу. *Лікування (ст. 166.3.4): знижка лише для осіб з інвалідністю, учасників бойових дій або дітей з інвалідністю.",
    tableColumns: [
      { key: "category", label: "Категорія витрат", width: "20%" },
      { key: "description", label: "Опис", width: "25%" },
      { key: "amount", label: "Витрати", width: "13%", align: "right" },
      { key: "limit", label: "Ліміт", width: "12%", align: "right" },
      { key: "refund", label: "Повернення", width: "15%", align: "right" },
      { key: "status", label: "Статус", width: "15%" },
    ],
    demoRecords: [
      { id: "td-1", columns: { category: "📚 Навчання", description: "Діджитал Академія (курс UI/UX)", amount: "66 000 ₴", limit: "25 941 ₴", refund: "4 669 ₴", year: "2024" }, status: "ok", statusLabel: "Документи зібрано" },
      { id: "td-2", columns: { category: "📚 Навчання дитини", description: "КНУ ім. Шевченка (1 курс, син)", amount: "42 000 ₴", limit: "25 941 ₴", refund: "4 669 ₴", year: "2024" }, status: "ok", statusLabel: "Документи зібрано" },
      { id: "td-3", columns: { category: "🏥 Лікування", description: "Стоматологія (протезування)", amount: "18 500 ₴", limit: "ст. 166.3.4*", refund: "3 330 ₴", year: "2024" }, status: "warning", statusLabel: "Перевірте право" },
      { id: "td-4", columns: { category: "🏠 Іпотека", description: "Відсотки за іпотекою (вул. Лесі Українки)", amount: "96 000 ₴", limit: "Площа ≤100 м²", refund: "17 280 ₴", year: "2025" }, status: "ok", statusLabel: "Документи зібрано" },
      { id: "td-5", columns: { category: "🛡️ Страхування", description: "Довгострокове страхування життя (10 р.)", amount: "15 000 ₴", limit: "12 106 ₴", refund: "2 179 ₴", year: "2024" }, status: "warning", statusLabel: "Потрібна довідка" },
      { id: "td-6", columns: { category: "🤝 Благодійність", description: "Фонд «Повернись живим»", amount: "24 000 ₴", limit: "4% доходу", refund: "4 320 ₴", year: "2025" }, status: "ok", statusLabel: "Квитанцію додано" },
      { id: "td-7", columns: { category: "⛽ Авто на газ", description: "Переобладнання Toyota RAV4 на ГБО", amount: "35 000 ₴", limit: "—", refund: "6 300 ₴", year: "2025" }, status: "pending", statusLabel: "Не розпочато" },
      { id: "td-8", columns: { category: "🍼 Репродуктивні технології", description: "Процедура ЕКЗ (клініка «Надія»)", amount: "85 000 ₴", limit: "—", refund: "15 300 ₴", year: "2024" }, status: "ok", statusLabel: "Документи зібрано" },
      { id: "td-9", columns: { category: "🏗️ Доступне житло", description: "Будівництво за держпрограмою", amount: "120 000 ₴", limit: "—", refund: "21 600 ₴", year: "2025" }, status: "pending", statusLabel: "Не розпочато" },
    ],
    ctaButtons: [
      { id: "add-expense", label: "Додати витрати", variant: "default", icon: FilePlus },
      { id: "upload-receipt", label: "Завантажити квитанцію", variant: "outline", icon: FileCheck2 },
      { id: "ai-calculate", label: "AI: Розрахувати повернення", variant: "secondary", icon: Sparkles, aiAction: true },
    ],
    roleHints: {
      owner: "Потенційне повернення ПДФО: 79 647 ₴ (9 категорій витрат). Зберіть усі документи до 31.12.2026",
    },
  },
  {
    id: "fin-monitoring", label: "Фін. моніторинг", icon: Activity,
    description: "Єдиний реєстр доходів та витрат з усіх джерел",
    tableColumns: [],
    demoRecords: [],
  },
  {
    id: "declarations", label: "Декларації", icon: Send,
    description: "Річні декларації про майновий стан і доходи",
    tableColumns: [
      { key: "name", label: "Назва", width: "40%" },
      { key: "year", label: "Рік", width: "15%" },
      { key: "deadline", label: "Дедлайн", width: "20%" },
      { key: "status", label: "Статус", width: "25%" },
    ],
    demoRecords: [
      { id: "1", columns: { name: "Декларація про майновий стан", year: "2024", deadline: "01.05.2025" }, status: "draft", statusLabel: "Чернетка" },
      { id: "2", columns: { name: "Декларація (податкова знижка)", year: "2024", deadline: "31.12.2025" }, status: "pending", statusLabel: "Не розпочато" },
      { id: "3", columns: { name: "Декларація про майновий стан", year: "2023", deadline: "01.05.2024" }, status: "submitted", statusLabel: "Подано" },
    ],
    ctaButtons: [
      { id: "create-declaration", label: "Створити декларацію", variant: "default", icon: Send },
      { id: "ai-prepare", label: "AI: Підготувати чернетку", variant: "secondary", icon: Sparkles, aiAction: true },
    ],
    roleHints: { owner: "Дедлайн — 01.05.2025" },
  },
  {
    id: "payments", label: "Платежі", icon: CreditCard,
    description: "Календар податкових платежів",
    tableColumns: [
      { key: "name", label: "Призначення", width: "35%" },
      { key: "amount", label: "Сума", width: "20%", align: "right" },
      { key: "dueDate", label: "До сплати", width: "20%" },
      { key: "status", label: "Статус", width: "25%" },
    ],
    demoRecords: [
      { id: "1", columns: { name: "ПДФО (інвестиційний дохід)", amount: "31 820 ₴", dueDate: "31.07.2025" }, status: "pending", statusLabel: "Не створено" },
      { id: "2", columns: { name: "ПДФО (іноземна зарплата)", amount: "43 200 ₴", dueDate: "31.07.2025" }, status: "pending", statusLabel: "Не створено" },
      { id: "3", columns: { name: "ПДФО (оренда)", amount: "32 400 ₴", dueDate: "30.04.2025" }, status: "paid", statusLabel: "Сплачено" },
      { id: "4", columns: { name: "ВЗ (оренда)", amount: "9 000 ₴", dueDate: "30.04.2025" }, status: "paid", statusLabel: "Сплачено" },
      { id: "5", columns: { name: "Податок на нерухомість", amount: "3 300 ₴", dueDate: "01.07.2024" }, status: "paid", statusLabel: "Сплачено" },
    ],
    ctaButtons: [
      { id: "generate-payment", label: "Сформувати платіжку", variant: "default", icon: CreditCard },
    ],
    roleHints: { owner: "3 платежі очікують формування" },
  },
  {
    id: "subscriptions", label: "Підписки", icon: MapPin,
    description: "Заклади, на які ви підписані — салони, готелі, корти, магазини. Записи, бонуси, статус.",
    roleHints: {
      owner: "Керуйте підписками на заклади: бонуси, нагадування, відписка",
    },
  },
  {
    id: "orders-bookings", label: "Замовлення та брон.", icon: ShoppingBag,
    description: "Замовлення товарів і послуг та бронювання — з усіх ваших закладів",
    notice: "Перелік закладів — у розділі «Управління → Підписки». Тут — лише транзакції.",
    roleHints: {
      owner: "Майбутні бронювання і історія замовлень з усіх ваших закладів",
    },
  },
  // ────────────────────────────────────────────────────────────────────────
  // Замовлення (Personal Office) — деталізація по типу
  // ────────────────────────────────────────────────────────────────────────
  {
    id: "purchases", label: "Магазин", icon: ShoppingCart,
    description: "Замовлення товарів — від отримання до гарантії.",
  },
  {
    id: "services", label: "Послуги", icon: Handshake,
    description: "Страхування, ремонт, консультації, побутові послуги.",
  },
  {
    id: "bookings-personal", label: "Бронювання", icon: CalendarCheck,
    description: "Записи до майстрів, кортів, готелів, ресторанів — з нагадуваннями.",
  },
  // ────────────────────────────────────────────────────────────────────────
  // Документи (Personal Office)
  // ────────────────────────────────────────────────────────────────────────
  {
    id: "personal-docs", label: "Особисті документи", icon: FileText,
    description: "Базові документи особи: ID-картка, закордонний паспорт, ІПН.",
  },
  {
    id: "diia", label: "Дія", icon: Smartphone,
    description: "Документи, доступні через застосунок «Дія».",
  },
  {
    id: "contracts", label: "Договори", icon: FileSignature,
    description: "Договори з другою стороною — оренда, послуги, додаткові угоди.",
  },
  {
    id: "insurance", label: "Страхування", icon: ShieldCheck,
    description: "Поліси КАСКО, ОСАЦВ, медичні і life-полiси.",
  },
  {
    id: "medical", label: "Медичні", icon: Stethoscope,
    description: "Карта здоров'я, аналізи, рецепти, щеплення.",
  },
  {
    id: "archive", label: "Архів", icon: Archive,
    description: "Старі документи та закриті справи.",
  },
  // ────────────────────────────────────────────────────────────────────────
  // Заощадження (Personal Office)
  // ────────────────────────────────────────────────────────────────────────
  {
    id: "goals-savings", label: "Цілі", icon: Target,
    description: "Подорож, перший внесок, освіта — цілі з прогресом і AI-планом.",
  },
  {
    id: "reserve", label: "Резервний фонд", icon: PiggyBank,
    description: "Подушка безпеки 3–6 місяців витрат.",
  },
  {
    id: "pension", label: "Пенсія", icon: Wallet,
    description: "Накопичувальна пенсія, ETF, депозити на довгий термін.",
  },
  {
    id: "kids-fund", label: "На дітей", icon: Heart,
    description: "Освіта дітей, перший внесок, навчальні плани.",
  },
  // ────────────────────────────────────────────────────────────────────────
  // Мережа (Personal Office)
  // ────────────────────────────────────────────────────────────────────────
  {
    id: "family", label: "Сім'я", icon: Users2,
    description: "Члени родини: ролі, доступи, спільні цілі.",
  },
  {
    id: "orgs", label: "Організації", icon: Building,
    description: "Банки, страхові, оператори, держоргани — все, з ким ви взаємодієте.",
  },
  {
    id: "experts", label: "Експерти", icon: Users,
    description: "Бухгалтери, лікарі, юристи, фінансові радники.",
  },
  {
    id: "accesses", label: "Доступи", icon: KeyRound,
    description: "Кому і що ви делегували; які доступи у вас до чужих сутностей.",
  },
  {
    id: "places", label: "Мої місця", icon: MapPin,
    description: "Заклади, на які ви підписані через L3 — салони, корти, готелі.",
  },
  // ────────────────────────────────────────────────────────────────────────
  // AI-центр (Personal Office)
  // ────────────────────────────────────────────────────────────────────────
  {
    id: "agents", label: "AI-агенти", icon: Bot,
    description: "Персональні агенти: помічник, бюджет, заощадження, здоров'я, родина.",
  },
  {
    id: "workflows", label: "Workflow", icon: Workflow,
    description: "Сценарії автоматизації, що поєднують декілька кроків.",
  },
  {
    id: "rules", label: "Правила", icon: Lock,
    description: "Що AI може робити сам, що — лише з підтвердженням.",
  },
  {
    id: "automations", label: "Автоматизації", icon: Zap,
    description: "Запущені автоправила: повторюваність, шаблони, recurring-операції.",
  },
];

/**
 * Горизонтальні пігулки під вкладкою «Управління» в кабінеті фізособи.
 * Рівно 7 груп — кожна відкриває власну сторінку-хаб з внутрішніми табами.
 * Будь-які попередні «листя» (Завдання, Інвестиції, Декларації, Майно тощо)
 * тепер живуть всередині відповідних груп як inner-таби (див. hub-сторінки
 * у `src/components/cabinets/{work-center,orders,documents,finance,savings,network,ai-center}`).
 */
const individualGroupOperations: OperationsSubTab[] = [
  {
    id: "work-center", label: "Робочий центр", icon: ListChecks,
    description: "Завдання, списки, цілі, погодження, планування і робоча стрічка.",
  },
  {
    id: "orders", label: "Замовлення", icon: ShoppingBag,
    description: "Каталог, покупки, послуги, бронювання, підписки, AI-замовлення.",
  },
  {
    id: "documents", label: "Документи", icon: FolderOpen,
    description: "Особисті, Дія, податкові, майнові, договори, страхування, медичні, архів.",
  },
  {
    id: "finance", label: "Фінанси", icon: Landmark,
    description: "Рахунки, платежі, бюджети, борги, податки і лояльність — один контекст.",
  },
  {
    id: "savings", label: "Заощадження", icon: PiggyBank,
    description: "Цілі, резерв, інвестиції, пенсія, дитячі накопичення, майно як актив.",
  },
  {
    id: "network", label: "Мережа", icon: NetworkIcon,
    description: "Сім'я, організації, експерти, делегації, спільні простори, мої місця.",
  },
  {
    id: "ai-center", label: "AI Центр", icon: Bot,
    description: "Особисті AI-агенти, workflow, правила, автоматизації, Safe Mode.",
  },
];

export const operationsConfigByType: Record<CabinetType, OperationsSubTab[]> = {
  fop: fopOperations,
  tov: tovOperations,
  // "fop-group" — застаріла сутність, кабінети цього типу більше не створюються;
  // fallback на fopOperations про всяк випадок для legacy-даних
  "fop-group": fopOperations,
  individual: individualGroupOperations,
};

/**
 * Повертає підтаби "Операції" для конкретного кабінету з урахуванням:
 *  - базового пресету за типом (`operationsConfigByType[cabinet.type]`)
 *  - capabilities (`requiresCapability`) — модуль приховується, якщо хоч однієї
 *    з потрібних capabilities немає (див. `deriveCapabilities`)
 *  - `showCondition(cabinet)` — додаткова умова видимості
 */
export const getOperationsSubTabs = (cabinet: Cabinet): OperationsSubTab[] => {
  const base = operationsConfigByType[cabinet.type] || [];
  return base.filter((tab) => {
    if (tab.showCondition && !tab.showCondition(cabinet)) return false;
    if (tab.requiresCapability && !hasAllCapabilities(cabinet, tab.requiresCapability)) return false;
    return true;
  });
};


// Get operations sub-tabs for passive cabinet - fixed set: Documents + Payments
export const getOperationsSubTabsForPassive = (
  cabinetType: CabinetType
): OperationsSubTab[] => {
  const allTabs = operationsConfigByType[cabinetType] || [];
  
  // Find documents tab from the cabinet type config
  const documentsTab = allTabs.find(tab => tab.id === "documents");
  
  // Create a fixed "Payments" tab for passive cabinets
  const paymentsTab: OperationsSubTab = {
    id: "payments",
    label: "Платежі",
    icon: CreditCard,
    description: "Вхідні та вихідні платежі в рамках співпраці",
    tableColumns: [],
    demoRecords: [],
  };
  
  // Return fixed set: Documents + Payments
  const result: OperationsSubTab[] = [];
  if (documentsTab) {
    result.push(documentsTab);
  }
  result.push(paymentsTab);
  
  return result;
};

// Get first operations sub-tab for passive cabinet
export const getFirstOperationsSubTabForPassive = (cabinetType: CabinetType): string => {
  const tabs = getOperationsSubTabsForPassive(cabinetType);
  return tabs[0]?.id || "documents";
};
