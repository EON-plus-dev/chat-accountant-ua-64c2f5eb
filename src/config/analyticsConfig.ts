import { LucideIcon, Wallet, ShoppingCart, Building2, Calculator, Users, Shield, TrendingUp, TrendingDown, Package, FileText, AlertTriangle, Clock } from "lucide-react";

// Types
export type AnalyticsRole =
  | "fop-services"
  | "fop-ecommerce"
  | "tov-owner"
  | "accountant-single"
  | "accountant-multi"
  | "auditor";

export type PeriodType =
  | "this-month"
  | "last-month"
  | "this-quarter"
  | "this-year"
  | "custom";

export type ChartType =
  | "income-expense-line"
  | "orders-revenue-bar"
  | "report-calendar"
  | "companies-table"
  | "risk-heatmap";

export type BlockType =
  | "important-alerts"
  | "expense-structure"
  | "top-items"
  | "payment-funnel"
  | "data-quality"
  | "debtors"
  | "tasks"
  | "risk-zones"
  | "summary";

export interface KPIConfig {
  id: string;
  title: string;
  value: string | number;
  trend?: {
    value: number;
    direction: "up" | "down";
  };
  description?: string;
  icon?: LucideIcon;
  format?: "currency" | "number" | "percent";
}

export interface ChartConfig {
  type: ChartType;
  title: string;
  data: any[];
}

export interface BlockConfig {
  type: BlockType;
  title: string;
  data: any;
}

export interface RoleConfig {
  id: AnalyticsRole;
  label: string;
  subtitle: string;
  icon: LucideIcon;
  kpis: KPIConfig[];
  mainChart: ChartConfig;
  secondaryBlocks: BlockConfig[];
  chatPrompts: string[];
}

// Period options
export const periodOptions: { value: PeriodType; label: string }[] = [
  { value: "this-month", label: "Цей місяць" },
  { value: "last-month", label: "Минулий місяць" },
  { value: "this-quarter", label: "Цей квартал" },
  { value: "this-year", label: "Цей рік" },
  { value: "custom", label: "Користувацький..." },
];

// Role configurations with demo data
export const analyticsRolesConfig: Record<AnalyticsRole, RoleConfig> = {
  "fop-services": {
    id: "fop-services",
    label: "ФОП (послуги)",
    subtitle: "Огляд фінансового стану твого ФОП за обраний період.",
    icon: Wallet,
    kpis: [
      {
        id: "income",
        title: "Дохід за період",
        value: 45000,
        trend: { value: 12, direction: "up" },
        icon: TrendingUp,
        format: "currency",
      },
      {
        id: "expenses",
        title: "Витрати за період",
        value: 18500,
        trend: { value: 5, direction: "up" },
        icon: TrendingDown,
        format: "currency",
      },
      {
        id: "profit",
        title: "Попередній прибуток",
        value: 26500,
        trend: { value: 18, direction: "up" },
        icon: Wallet,
        format: "currency",
      },
      {
        id: "tax",
        title: "Орієнтовний ЄП",
        value: 2250,
        description: "5% від доходу",
        icon: Calculator,
        format: "currency",
      },
    ],
    mainChart: {
      type: "income-expense-line",
      title: "Динаміка доходів та витрат",
      data: [
        { week: "Тиж 1", income: 9500, expenses: 4200 },
        { week: "Тиж 2", income: 12300, expenses: 5100 },
        { week: "Тиж 3", income: 11200, expenses: 4800 },
        { week: "Тиж 4", income: 12000, expenses: 4400 },
      ],
    },
    secondaryBlocks: [
      {
        type: "important-alerts",
        title: "Важливе зараз",
        data: [
          {
            id: 1,
            type: "warning",
            message: "Через 5 днів граничний строк сплати єдиного податку за квартал.",
          },
          {
            id: 2,
            type: "info",
            message: "Витрати на рекламу цього місяця більші, ніж у середньому за останні 3 місяці.",
          },
        ],
      },
      {
        type: "expense-structure",
        title: "Структура витрат",
        data: [
          { name: "Оренда", value: 6500, fill: "hsl(var(--chart-1))" },
          { name: "Реклама", value: 4600, fill: "hsl(var(--chart-2))" },
          { name: "Підрядники", value: 5500, fill: "hsl(var(--chart-3))" },
          { name: "Інше", value: 1900, fill: "hsl(var(--chart-4))" },
        ],
      },
    ],
    chatPrompts: [
      "Поясни, чому цього місяця менший прибуток, ніж минулого.",
      "Скільки мені потрібно відкласти на податки до кінця кварталу?",
      "Покажи останні витрати на рекламу.",
    ],
  },

  "fop-ecommerce": {
    id: "fop-ecommerce",
    label: "ФОП (онлайн-продажі)",
    subtitle: "Огляд замовлень та продажів за обраний період.",
    icon: ShoppingCart,
    kpis: [
      {
        id: "revenue",
        title: "Дохід за період",
        value: 89000,
        trend: { value: 23, direction: "up" },
        icon: TrendingUp,
        format: "currency",
      },
      {
        id: "orders",
        title: "Кількість замовлень",
        value: 127,
        trend: { value: 15, direction: "up" },
        icon: Package,
        format: "number",
      },
      {
        id: "avg-check",
        title: "Середній чек",
        value: 701,
        trend: { value: 7, direction: "up" },
        icon: Wallet,
        format: "currency",
      },
      {
        id: "paid-percent",
        title: "Оплачено",
        value: 78,
        description: "99 з 127 замовлень",
        icon: Calculator,
        format: "percent",
      },
    ],
    mainChart: {
      type: "orders-revenue-bar",
      title: "Замовлення та виручка по днях",
      data: [
        { day: "Пн", orders: 15, revenue: 10500 },
        { day: "Вт", orders: 22, revenue: 15400 },
        { day: "Ср", orders: 18, revenue: 12600 },
        { day: "Чт", orders: 25, revenue: 17500 },
        { day: "Пт", orders: 28, revenue: 19600 },
        { day: "Сб", orders: 12, revenue: 8400 },
        { day: "Нд", orders: 7, revenue: 5000 },
      ],
    },
    secondaryBlocks: [
      {
        type: "payment-funnel",
        title: "Воронка оплат",
        data: {
          created: 127,
          invoiced: 115,
          paid: 99,
        },
      },
      {
        type: "top-items",
        title: "ТОП-5 товарів",
        data: [
          { name: "Смартфон Samsung A54", revenue: 28500 },
          { name: "Навушники AirPods Pro", revenue: 18200 },
          { name: "Чохол для iPhone 15", revenue: 12800 },
          { name: "Зарядка бездротова", revenue: 9400 },
          { name: "Кабель Type-C 2м", revenue: 6100 },
        ],
      },
    ],
    chatPrompts: [
      "Покажи неоплачені замовлення за цей місяць.",
      "Які товари приносять найбільше доходу?",
      "Скільки я заробив на онлайн-продажах за цей місяць?",
    ],
  },

  "tov-owner": {
    id: "tov-owner",
    label: "Власник ТОВ",
    subtitle: "Огляд фінансових показників компанії.",
    icon: Building2,
    kpis: [
      {
        id: "revenue",
        title: "Виручка за період",
        value: 450000,
        trend: { value: 8, direction: "up" },
        icon: TrendingUp,
        format: "currency",
      },
      {
        id: "opex",
        title: "Операційні витрати",
        value: 280000,
        trend: { value: 3, direction: "up" },
        icon: TrendingDown,
        format: "currency",
      },
      {
        id: "result",
        title: "Операційний результат",
        value: 170000,
        trend: { value: 15, direction: "up" },
        icon: Wallet,
        format: "currency",
      },
      {
        id: "payroll",
        title: "ФОП + податки",
        value: 95000,
        description: "Зарплата та нарахування",
        icon: Users,
        format: "currency",
      },
    ],
    mainChart: {
      type: "income-expense-line",
      title: "Виручка та витрати",
      data: [
        { week: "Тиж 1", income: 105000, expenses: 68000 },
        { week: "Тиж 2", income: 118000, expenses: 72000 },
        { week: "Тиж 3", income: 112000, expenses: 70000 },
        { week: "Тиж 4", income: 115000, expenses: 70000 },
      ],
    },
    secondaryBlocks: [
      {
        type: "debtors",
        title: "Дебіторська заборгованість",
        data: {
          total: 125000,
          items: [
            { name: "ТОВ «Промтех»", amount: 55000, days: 45 },
            { name: "ФОП Коваленко", amount: 38000, days: 32 },
            { name: "ТОВ «Будмайстер»", amount: 32000, days: 18 },
          ],
        },
      },
      {
        type: "important-alerts",
        title: "Ризики та сигнали",
        data: [
          {
            id: 1,
            type: "error",
            message: "Є 3 рахунки, прострочені більше ніж на 30 днів.",
          },
          {
            id: 2,
            type: "warning",
            message: "Звіт по ПДВ за цей місяць ще не сформований.",
          },
        ],
      },
    ],
    chatPrompts: [
      "Поясни, чому прибуток менший, ніж минулого місяця.",
      "Покажи найбільших боржників і суми боргу.",
      "Чи вистачить нам грошей на зарплати цього місяця?",
    ],
  },

  "accountant-single": {
    id: "accountant-single",
    label: "Бухгалтер компанії",
    subtitle: "Огляд стану обліку та звітності.",
    icon: Calculator,
    kpis: [
      {
        id: "operations",
        title: "Операцій за період",
        value: 234,
        trend: { value: 12, direction: "up" },
        icon: FileText,
        format: "number",
      },
      {
        id: "unposted",
        title: "Без проводок",
        value: 12,
        icon: AlertTriangle,
        format: "number",
      },
      {
        id: "unclosed",
        title: "Незакритих періодів",
        value: 1,
        description: "Листопад 2024",
        icon: Clock,
        format: "number",
      },
      {
        id: "reports",
        title: "Звітів до подачі",
        value: 3,
        description: "Найближчий: 20.12",
        icon: FileText,
        format: "number",
      },
    ],
    mainChart: {
      type: "report-calendar",
      title: "Календар звітності",
      data: [
        { report: "Декларація ЄП", deadline: "2024-12-20", status: "pending" },
        { report: "Податковий розрахунок (4ДФ)", deadline: "2024-12-31", status: "pending" },
        { report: "ПДВ декларація", deadline: "2024-12-20", status: "ready" },
        { report: "ЄСВ звіт", deadline: "2025-01-10", status: "pending" },
      ],
    },
    secondaryBlocks: [
      {
        type: "data-quality",
        title: "Відповідність",
        data: {
          noCategory: 8,
          noCounterparty: 15,
          duplicates: 3,
        },
      },
      {
        type: "tasks",
        title: "Робочі задачі",
        data: [
          "Провести банківські виписки за минулий тиждень.",
          "Закрити період за листопад.",
          "Перевірити документи по контрагенту ТОВ «Ромашка».",
        ],
      },
    ],
    chatPrompts: [
      "Покажи всі операції без категорії за цей місяць.",
      "Які звіти треба підготувати наступного тижня?",
      "Чи є документи без проводок?",
    ],
  },

  "accountant-multi": {
    id: "accountant-multi",
    label: "Бухгалтер (кілька компаній)",
    subtitle: "Огляд портфелю компаній в обслуговуванні.",
    icon: Users,
    kpis: [
      {
        id: "companies",
        title: "Активних компаній",
        value: 8,
        icon: Building2,
        format: "number",
      },
      {
        id: "at-risk",
        title: "З ризиками",
        value: 2,
        icon: AlertTriangle,
        format: "number",
      },
      {
        id: "reports",
        title: "Найближчих звітів",
        value: 12,
        description: "По всіх компаніях",
        icon: FileText,
        format: "number",
      },
      {
        id: "operations",
        title: "Операцій за період",
        value: 1450,
        trend: { value: 8, direction: "up" },
        icon: FileText,
        format: "number",
      },
    ],
    mainChart: {
      type: "companies-table",
      title: "Статус компаній",
      data: [
        { name: "ТОВ «Промтех»", status: "ok", comment: "Все в порядку" },
        { name: "ФОП Коваленко О.В.", status: "warning", comment: "Немає звіту ЄП" },
        { name: "ТОВ «Будмайстер»", status: "ok", comment: "Все в порядку" },
        { name: "ТОВ «Агро-Захід»", status: "error", comment: "Не проведені виписки" },
        { name: "ФОП Шевченко І.П.", status: "ok", comment: "Все в порядку" },
        { name: "ТОВ «Логістик Про»", status: "ok", comment: "Все в порядку" },
        { name: "ФОП Бондаренко Т.М.", status: "warning", comment: "Очікує документи" },
        { name: "ТОВ «Медіа Груп»", status: "ok", comment: "Все в порядку" },
      ],
    },
    secondaryBlocks: [],
    chatPrompts: [
      "Покажи компанії з найвищим ризиком зараз.",
      "Які компанії мають неподані звіти за поточний місяць?",
      "Сформуй коротке резюме по завантаженості на цей тиждень.",
    ],
  },

  auditor: {
    id: "auditor",
    label: "Аудитор",
    subtitle: "Огляд ризиків та аномалій в обліку.",
    icon: Shield,
    kpis: [
      {
        id: "anomalies",
        title: "Аномальних операцій",
        value: 15,
        icon: AlertTriangle,
        format: "number",
      },
      {
        id: "no-docs",
        title: "Без документів",
        value: 8,
        icon: FileText,
        format: "number",
      },
      {
        id: "suspicious",
        title: "Підозрілих витрат",
        value: 45000,
        icon: TrendingDown,
        format: "currency",
      },
      {
        id: "risk-periods",
        title: "Ризикових періодів",
        value: 2,
        description: "Вересень, Жовтень",
        icon: Clock,
        format: "number",
      },
    ],
    mainChart: {
      type: "risk-heatmap",
      title: "Розподіл ризиків по місяцях",
      data: [
        { month: "Січ", risks: 2 },
        { month: "Лют", risks: 1 },
        { month: "Бер", risks: 3 },
        { month: "Кві", risks: 1 },
        { month: "Тра", risks: 2 },
        { month: "Чер", risks: 4 },
        { month: "Лип", risks: 2 },
        { month: "Сер", risks: 6 },
        { month: "Вер", risks: 8 },
        { month: "Жов", risks: 7 },
        { month: "Лис", risks: 3 },
        { month: "Гру", risks: 2 },
      ],
    },
    secondaryBlocks: [
      {
        type: "risk-zones",
        title: "Ризикові зони",
        data: [
          "Високий відсоток витрат на ФОП-послуги.",
          "Часті кеш-операції без документів.",
          "Часті зміни в налаштуваннях обліку.",
        ],
      },
      {
        type: "summary",
        title: "Резюме для власника",
        data: "Загалом стан обліку задовільний, але є кілька зон ризику, які потребують уваги. Рекомендовано перевірити документацію по операціях за вересень-жовтень та забезпечити підтверджуючі документи для кеш-витрат.",
      },
    ],
    chatPrompts: [
      "Поясни, чому ти вважаєш певні витрати ризиковими.",
      "Покажи всі операції без підтверджуючих документів.",
      "Сформуй текстовий звіт для власника з головними ризиками.",
    ],
  },
};

// Helper to get role config
export const getRoleConfig = (role: AnalyticsRole): RoleConfig => {
  return analyticsRolesConfig[role];
};

// Re-export formatValue from centralized formatters for backward compatibility
export { formatValue } from "@/lib/formatters";
