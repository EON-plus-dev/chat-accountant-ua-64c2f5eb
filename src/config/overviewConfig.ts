import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Receipt,
  Building2,
  Users,
  AlertTriangle,
  FileText,
  CreditCard,
  Calendar,
  Clock,
  CheckCircle,
  Send,
  Download,
  UserCheck,
  BarChart3,
  Banknote,
  ShieldAlert,
  FileCheck,
  Percent
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { CabinetType } from "@/types/cabinet";

// KPI item type
export interface OverviewKPI {
  id: string;
  title: string;
  value: number;
  format: "currency" | "number" | "percent" | "days";
  trend?: { value: number; direction: "up" | "down" };
  description: string;
  icon: LucideIcon;
  semantic: "income" | "expense" | "neutral" | "warning";
}

// Attention item type
export interface AttentionItem {
  id: string;
  text: string;
  priority: "high" | "medium" | "low";
  icon: LucideIcon;
  cta: {
    label: string;
    action: "open" | "explain" | "operations";
  };
}

// Recent event type
export interface RecentEvent {
  id: string;
  text: string;
  time: string;
  icon: LucideIcon;
  type: "document" | "payment" | "report" | "system";
}

// Integration type
export interface Integration {
  id: string;
  name: string;
  icon: LucideIcon;
  status: "active" | "pending" | "inactive";
}

// Configuration for each cabinet type
export interface OverviewConfig {
  kpis: OverviewKPI[];
  attentionItems: AttentionItem[];
  recentEvents: RecentEvent[];
  chatPrompts: string[];
  integrations: Integration[];
  description: string;
}

// FOP configuration
const fopConfig: OverviewConfig = {
  description: "Фізична особа-підприємець",
  kpis: [
    { 
      id: "income", 
      title: "Дохід", 
      value: 85000, 
      format: "currency",
      trend: { value: 12, direction: "up" },
      description: "за цей місяць",
      icon: TrendingUp,
      semantic: "income"
    },
    { 
      id: "expenses", 
      title: "Витрати", 
      value: 28000, 
      format: "currency",
      trend: { value: 3, direction: "down" },
      description: "за цей місяць",
      icon: TrendingDown,
      semantic: "expense"
    },
    { 
      id: "ep-vz", 
      title: "Орієнтовний ЄП та ВЗ", 
      value: 5100, 
      format: "currency",
      description: "5%+1% від доходу",
      icon: Wallet,
      semantic: "neutral"
    },
    { 
      id: "esv", 
      title: "Орієнтовний ЄСВ", 
      value: 1760, 
      format: "currency",
      description: "мінімальний внесок",
      icon: Receipt,
      semantic: "neutral"
    },
  ],
  attentionItems: [
    { 
      id: "1", 
      text: "Завтра дедлайн подачі звіту ЄСВ", 
      priority: "high",
      icon: Calendar,
      cta: { label: "Відкрити", action: "open" }
    },
    { 
      id: "2", 
      text: "Неоплачений рахунок №1234 (прострочено 3 дні)", 
      priority: "high",
      icon: CreditCard,
      cta: { label: "Перейти до операцій", action: "operations" }
    },
    { 
      id: "3", 
      text: "Завантажте виписку банку за листопад", 
      priority: "medium",
      icon: Download,
      cta: { label: "Пояснити", action: "explain" }
    },
    { 
      id: "4", 
      text: "Перевищено ліміт доходу для 2 групи на 15%", 
      priority: "high",
      icon: AlertTriangle,
      cta: { label: "Пояснити", action: "explain" }
    },
  ],
  recentEvents: [
    { id: "1", text: "Створено рахунок №1234", time: "2 години тому", icon: FileText, type: "document" },
    { id: "2", text: "Отримано оплату 12 500 грн", time: "вчора", icon: CreditCard, type: "payment" },
    { id: "3", text: "Додано витрату на оренду", time: "вчора", icon: TrendingDown, type: "payment" },
    { id: "4", text: "Надіслано Податковий розрахунок (4ДФ)", time: "3 дні тому", icon: Send, type: "report" },
    { id: "5", text: "Імпортовано виписку Monobank", time: "4 дні тому", icon: Download, type: "system" },
  ],
  chatPrompts: [
    "Скільки ЄП потрібно заплатити?",
    "Коли дедлайн декларації?",
    "Покажи аналітику доходів за квартал",
    "Створи рахунок для клієнта",
  ],
  integrations: [
    { id: "1", name: "Monobank", icon: CreditCard, status: "active" },
    { id: "2", name: "Приват24", icon: Building2, status: "pending" },
    { id: "3", name: "vchasno", icon: FileCheck, status: "inactive" },
  ],
};

// TOV configuration
const tovConfig: OverviewConfig = {
  description: "Товариство з обмеженою відповідальністю",
  kpis: [
    { 
      id: "revenue", 
      title: "Виручка", 
      value: 1200000, 
      format: "currency",
      trend: { value: 8, direction: "up" },
      description: "за цей місяць",
      icon: TrendingUp,
      semantic: "income"
    },
    { 
      id: "opex", 
      title: "Операційні витрати", 
      value: 720000, 
      format: "currency",
      trend: { value: 5, direction: "up" },
      description: "за цей місяць",
      icon: TrendingDown,
      semantic: "expense"
    },
    { 
      id: "payroll", 
      title: "Фонд зарплати", 
      value: 280000, 
      format: "currency",
      description: "нараховано",
      icon: Users,
      semantic: "neutral"
    },
    { 
      id: "taxes", 
      title: "Податки", 
      value: 156000, 
      format: "currency",
      description: "до сплати",
      icon: Wallet,
      semantic: "warning"
    },
  ],
  attentionItems: [
    { 
      id: "1", 
      text: "Дедлайн подачі декларації ПДВ через 5 днів", 
      priority: "high",
      icon: Calendar,
      cta: { label: "Відкрити", action: "open" }
    },
    { 
      id: "2", 
      text: "Дебіторська заборгованість зросла на 25%", 
      priority: "high",
      icon: AlertTriangle,
      cta: { label: "Перейти до операцій", action: "operations" }
    },
    { 
      id: "3", 
      text: "Потрібно підтвердити акти звірки з 3 контрагентами", 
      priority: "medium",
      icon: FileCheck,
      cta: { label: "Відкрити", action: "open" }
    },
    { 
      id: "4", 
      text: "Нарахуйте зарплату за листопад", 
      priority: "medium",
      icon: Banknote,
      cta: { label: "Перейти до операцій", action: "operations" }
    },
    { 
      id: "5", 
      text: "Оновіть штатний розпис", 
      priority: "low",
      icon: UserCheck,
      cta: { label: "Пояснити", action: "explain" }
    },
  ],
  recentEvents: [
    { id: "1", text: "Підписано договір з ТОВ «Партнер»", time: "1 годину тому", icon: FileText, type: "document" },
    { id: "2", text: "Оплачено рахунок постачальнику", time: "3 години тому", icon: CreditCard, type: "payment" },
    { id: "3", text: "Нараховано зарплату (15 співробітників)", time: "вчора", icon: Users, type: "payment" },
    { id: "4", text: "Подано Податковий розрахунок (4ДФ)", time: "2 дні тому", icon: Send, type: "report" },
    { id: "5", text: "Створено акт виконаних робіт", time: "3 дні тому", icon: FileCheck, type: "document" },
  ],
  chatPrompts: [
    "Покажи дебіторську заборгованість",
    "Підготуй звіт для директора",
    "Яка рентабельність за квартал?",
    "Коли сплачувати ПДВ?",
  ],
  integrations: [
    { id: "1", name: "M.E.Doc", icon: FileCheck, status: "active" },
    { id: "2", name: "Monobank", icon: CreditCard, status: "active" },
    { id: "3", name: "1С:Бухгалтерія", icon: BarChart3, status: "active" },
    { id: "4", name: "vchasno", icon: FileText, status: "pending" },
  ],
};

// FOP Group configuration
const fopGroupConfig: OverviewConfig = {
  description: "Група підприємців під єдиним управлінням",
  kpis: [
    { 
      id: "total-income", 
      title: "Сумарний дохід", 
      value: 380000, 
      format: "currency",
      trend: { value: 15, direction: "up" },
      description: "за цей місяць",
      icon: TrendingUp,
      semantic: "income"
    },
    { 
      id: "fop-count", 
      title: "Кількість ФОП", 
      value: 5, 
      format: "number",
      description: "активних",
      icon: Users,
      semantic: "neutral"
    },
    { 
      id: "risks", 
      title: "Ризики", 
      value: 2, 
      format: "number",
      description: "потребують уваги",
      icon: ShieldAlert,
      semantic: "warning"
    },
    { 
      id: "average", 
      title: "Середній дохід", 
      value: 76000, 
      format: "currency",
      description: "на одного ФОП",
      icon: BarChart3,
      semantic: "neutral"
    },
  ],
  attentionItems: [
    { 
      id: "1", 
      text: "ФОП Коваленко перевищив ліміт 2 групи", 
      priority: "high",
      icon: AlertTriangle,
      cta: { label: "Пояснити", action: "explain" }
    },
    { 
      id: "2", 
      text: "ФОП Петренко: дедлайн звіту ЄСВ завтра", 
      priority: "high",
      icon: Calendar,
      cta: { label: "Відкрити", action: "open" }
    },
    { 
      id: "3", 
      text: "Потрібно подати декларації для 3 ФОП", 
      priority: "medium",
      icon: FileText,
      cta: { label: "Перейти до операцій", action: "operations" }
    },
    { 
      id: "4", 
      text: "ФОП Сидоренко не має виписки за листопад", 
      priority: "low",
      icon: Download,
      cta: { label: "Пояснити", action: "explain" }
    },
  ],
  recentEvents: [
    { id: "1", text: "ФОП Коваленко: отримано оплату 45 000 грн", time: "1 годину тому", icon: CreditCard, type: "payment" },
    { id: "2", text: "ФОП Петренко: подано декларацію", time: "вчора", icon: Send, type: "report" },
    { id: "3", text: "ФОП Іваненко: створено рахунок", time: "вчора", icon: FileText, type: "document" },
    { id: "4", text: "Груповий звіт за листопад готовий", time: "2 дні тому", icon: BarChart3, type: "report" },
    { id: "5", text: "ФОП Сидоренко: імпортовано виписку", time: "3 дні тому", icon: Download, type: "system" },
  ],
  chatPrompts: [
    "Порівняй ФОП за доходом",
    "Хто в зоні ризику?",
    "Покажи загальну статистику групи",
    "Які дедлайни наближаються?",
  ],
  integrations: [
    { id: "1", name: "Monobank", icon: CreditCard, status: "active" },
    { id: "2", name: "Приват24", icon: Building2, status: "active" },
    { id: "3", name: "ПУМБ", icon: Building2, status: "pending" },
  ],
};

// Individual configuration
const individualConfig: OverviewConfig = {
  description: "Фізична особа (громадянин)",
  kpis: [
    { 
      id: "taxes-ytd", 
      title: "Нараховано податків YTD", 
      value: 14500, 
      format: "currency",
      description: "з початку року",
      icon: Wallet,
      semantic: "expense"
    },
    { 
      id: "declarations", 
      title: "Декларацій подано", 
      value: 2, 
      format: "number",
      description: "за цей рік",
      icon: CheckCircle,
      semantic: "neutral"
    },
    { 
      id: "pending", 
      title: "Очікувані платежі", 
      value: 8400, 
      format: "currency",
      description: "до сплати",
      icon: Clock,
      semantic: "warning"
    },
    { 
      id: "next-deadline", 
      title: "Днів до дедлайну", 
      value: 15, 
      format: "days",
      description: "декларація про доходи",
      icon: Calendar,
      semantic: "neutral"
    },
  ],
  attentionItems: [
    { 
      id: "1", 
      text: "Подайте декларацію про майновий стан", 
      priority: "high",
      icon: FileText,
      cta: { label: "Відкрити", action: "open" }
    },
    { 
      id: "2", 
      text: "Сплатіть ПДФО за продаж нерухомості", 
      priority: "high",
      icon: Wallet,
      cta: { label: "Перейти до операцій", action: "operations" }
    },
    { 
      id: "3", 
      text: "Є право на податкову знижку (навчання)", 
      priority: "medium",
      icon: Percent,
      cta: { label: "Пояснити", action: "explain" }
    },
  ],
  recentEvents: [
    { id: "1", text: "Отримано довідку про доходи", time: "3 дні тому", icon: FileText, type: "document" },
    { id: "2", text: "Подано декларацію про доходи", time: "1 тиждень тому", icon: Send, type: "report" },
    { id: "3", text: "Сплачено ПДФО", time: "2 тижні тому", icon: CreditCard, type: "payment" },
    { id: "4", text: "Розраховано податкову знижку", time: "1 місяць тому", icon: Percent, type: "system" },
  ],
  chatPrompts: [
    "Коли платити податок?",
    "Яку декларацію подати?",
    "Чи маю право на податкову знижку?",
    "Як задекларувати продаж авто?",
  ],
  integrations: [
    { id: "1", name: "Дія", icon: FileCheck, status: "active" },
    { id: "2", name: "Monobank", icon: CreditCard, status: "pending" },
  ],
};

// Individual Declarant (demo-individual-declarant) — Ткаченко О.В.
const individualDeclarantConfig: OverviewConfig = {
  description: "Декларування доходів фізичної особи — інвестиції, іноземні доходи, продаж майна",
  kpis: [
    { 
      id: "total-income", 
      title: "Загальний дохід", 
      value: 891700, 
      format: "currency",
      description: "інвестиції + зарплата + оренда + авто + нерухомість",
      icon: TrendingUp,
      semantic: "income"
    },
    { 
      id: "investment-result", 
      title: "Інвестиційний результат", 
      value: 176700, 
      format: "currency",
      trend: { value: 23, direction: "up" },
      description: "FIFO: акції + дивіденди (IBKR)",
      icon: BarChart3,
      semantic: "income"
    },
    { 
      id: "pdfo-due", 
      title: "ПДФО до сплати", 
      value: 107420, 
      format: "currency",
      description: "сума всіх зобов'язань за рік",
      icon: Wallet,
      semantic: "warning"
    },
    { 
      id: "tax-refund", 
      title: "Потенційне повернення", 
      value: 12600, 
      format: "currency",
      description: "податкова знижка (навчання + медицина)",
      icon: Percent,
      semantic: "income"
    },
  ],
  attentionItems: [
    { 
      id: "1", 
      text: "Дедлайн подачі декларації 01.05.2025 — залишилось ~52 дні", 
      priority: "high",
      icon: Calendar,
      cta: { label: "Відкрити", action: "open" }
    },
    { 
      id: "2", 
      text: "Необхідний сертифікат резидентства для КУПО з Польщею (ст. 13 ПКУ)", 
      priority: "high",
      icon: AlertTriangle,
      cta: { label: "Пояснити", action: "explain" }
    },
    { 
      id: "3", 
      text: "Право на податкову знижку — потенційне повернення 12 600 ₴", 
      priority: "medium",
      icon: Percent,
      cta: { label: "Пояснити", action: "explain" }
    },
    { 
      id: "4", 
      text: "Продаж 1/2 квартири — пільга ст. 172.1 ПКУ підтверджена (0% ПДФО)", 
      priority: "medium",
      icon: CheckCircle,
      cta: { label: "Відкрити", action: "open" }
    },
    { 
      id: "5", 
      text: "Перевірте необхідність подання звіту КІК (контрольована іноземна компанія)", 
      priority: "low",
      icon: ShieldAlert,
      cta: { label: "Пояснити", action: "explain" }
    },
  ],
  recentEvents: [
    { id: "1", text: "Завантажено IBKR Annual Statement 2024", time: "2 дні тому", icon: Download, type: "document" },
    { id: "2", text: "Додано довідку про доходи з Польщі (Zaświadczenie)", time: "4 дні тому", icon: FileText, type: "document" },
    { id: "3", text: "Оформлено договір продажу авто Hyundai Tucson", time: "1 тиждень тому", icon: FileText, type: "document" },
    { id: "4", text: "Нотаріальний договір продажу 1/2 квартири", time: "1 тиждень тому", icon: FileCheck, type: "document" },
    { id: "5", text: "Розраховано інвестиційний результат FIFO", time: "2 тижні тому", icon: BarChart3, type: "system" },
  ],
  chatPrompts: [
    "Розрахуй ПДФО з інвестицій за FIFO",
    "Як застосувати КУПО з Польщею?",
    "Які документи потрібні для податкової знижки?",
    "Чи потрібно платити ПДФО за продаж квартири?",
  ],
  integrations: [
    { id: "1", name: "Interactive Brokers", icon: BarChart3, status: "active" },
    { id: "2", name: "Wise", icon: CreditCard, status: "active" },
    { id: "3", name: "Monobank", icon: CreditCard, status: "active" },
    { id: "4", name: "Дія", icon: FileCheck, status: "pending" },
  ],
};

// Export configurations by cabinet type
export const overviewConfigs: Record<CabinetType, OverviewConfig> = {
  fop: fopConfig,
  tov: tovConfig,
  "fop-group": fopGroupConfig,
  individual: individualConfig,
};

// Per-cabinet overrides (demo cabinets with specialized data)
const cabinetOverrides: Record<string, OverviewConfig> = {
  "demo-individual-declarant": individualDeclarantConfig,
};

// Helper to get config by cabinet type, with optional per-cabinet override
export const getOverviewConfig = (type: CabinetType, cabinetId?: string): OverviewConfig => {
  if (cabinetId && cabinetOverrides[cabinetId]) {
    return cabinetOverrides[cabinetId];
  }
  return overviewConfigs[type];
};
