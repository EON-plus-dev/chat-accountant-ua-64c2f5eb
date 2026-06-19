import {
  FileText,
  CreditCard,
  Send,
  Settings,
  Clock,
  Bell,
  Download,
  Upload,
  Users,
  AlertTriangle,
  CheckCircle,
  Building2,
  Wallet,
  Receipt,
  Calculator,
  ClipboardCheck,
  ScrollText,
  ExternalLink,
  Bot,
  AtSign,
  MessageCircle,
  CheckSquare,
  CalendarCheck,
  type LucideIcon
} from "lucide-react";
import type { CabinetType } from "@/types/cabinet";

export type EventType = "document" | "payment" | "report" | "system" | "deadline" | "notification" | "report-lifecycle" | "comment" | "mention" | "task" | "booking";

export type EventPriority = "high" | "medium" | "low";
export type DocumentType = "invoice" | "act" | "contract" | "report" | "receipt" | "statement";
export type DocumentStatus = "draft" | "sent" | "paid" | "overdue" | "cancelled" | "pending";

export interface RelatedDocument {
  id: string;
  type: DocumentType;
  title: string;
  number?: string;
  date: Date;
  amount?: number;
  status: DocumentStatus;
}

export interface EventActivity {
  id: string;
  timestamp: Date;
  action: string;
  user?: string;
  details?: string;
}

export interface JournalEvent {
  id: string;
  date: Date;
  title: string;
  description?: string;
  type: EventType;
  priority: EventPriority;
  icon: LucideIcon;
  metadata?: {
    amount?: number;
    documentNumber?: string;
    relatedEntity?: string;
  };
  // Extended fields for detail page
  fullDescription?: string;
  relatedDocuments?: RelatedDocument[];
  activityLog?: EventActivity[];
  tags?: string[];
  assignee?: string;
  dueDate?: Date;
  sourceSystem?: string;
}

// Document type configuration
export const documentTypeConfig: Record<DocumentType, { label: string; icon: LucideIcon; color: string }> = {
  invoice: { label: "Рахунок", icon: FileText, color: "text-primary" },
  act: { label: "Акт", icon: ClipboardCheck, color: "text-purple-500" },
  contract: { label: "Договір", icon: ScrollText, color: "text-blue-500" },
  report: { label: "Звіт", icon: Send, color: "text-success" },
  receipt: { label: "Чек", icon: Receipt, color: "text-muted-foreground" },
  statement: { label: "Виписка", icon: Download, color: "text-orange-500" },
};

// Document status configuration
export const documentStatusConfig: Record<DocumentStatus, { label: string; bgColor: string; textColor: string }> = {
  draft: { label: "Чернетка", bgColor: "bg-muted", textColor: "text-muted-foreground" },
  sent: { label: "Надіслано", bgColor: "bg-blue-100 dark:bg-blue-900/30", textColor: "text-blue-700 dark:text-blue-400" },
  paid: { label: "Оплачено", bgColor: "bg-success/10", textColor: "text-success" },
  overdue: { label: "Прострочено", bgColor: "bg-destructive/10", textColor: "text-destructive" },
  cancelled: { label: "Скасовано", bgColor: "bg-muted", textColor: "text-muted-foreground line-through" },
  pending: { label: "Очікується", bgColor: "bg-warning/10", textColor: "text-warning" },
};

export interface EventTypeConfig {
  label: string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
}

export const eventTypeConfig: Record<EventType, EventTypeConfig> = {
  document: {
    label: "Документи",
    icon: FileText,
    color: "text-primary",
    bgColor: "bg-primary/10"
  },
  payment: {
    label: "Платежі",
    icon: CreditCard,
    color: "text-success",
    bgColor: "bg-success/10"
  },
  report: {
    label: "Звіти",
    icon: Send,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10"
  },
  system: {
    label: "Система",
    icon: Settings,
    color: "text-muted-foreground",
    bgColor: "bg-muted"
  },
  deadline: {
    label: "Дедлайни",
    icon: Clock,
    color: "text-destructive",
    bgColor: "bg-destructive/10"
  },
  notification: {
    label: "Сповіщення",
    icon: Bell,
    color: "text-warning",
    bgColor: "bg-warning/10"
  },
  "report-lifecycle": {
    label: "Звіти AI",
    icon: Bot,
    color: "text-violet-500",
    bgColor: "bg-violet-500/10"
  },
  comment: {
    label: "Коментарі",
    icon: MessageCircle,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10"
  },
  mention: {
    label: "Згадки",
    icon: AtSign,
    color: "text-amber-500",
    bgColor: "bg-amber-500/10"
  },
  task: {
    label: "Завдання",
    icon: CheckSquare,
    color: "text-indigo-500",
    bgColor: "bg-indigo-500/10"
  },
  booking: {
    label: "Бронювання",
    icon: CalendarCheck,
    color: "text-primary",
    bgColor: "bg-primary/10"
  }
};


// Helper to create dates relative to today
const daysAgo = (days: number, hours: number = 12, minutes: number = 0): Date => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(hours, minutes, 0, 0);
  return date;
};

// FOP Events
const fopEvents: JournalEvent[] = [
  // Today
  {
    id: "f1",
    date: daysAgo(0, 14, 32),
    title: "Створено рахунок №1234",
    description: "Рахунок для ТОВ «Партнер» на послуги консалтингу",
    type: "document",
    priority: "medium",
    icon: FileText,
    metadata: { amount: 25000, documentNumber: "1234", relatedEntity: "ТОВ «Партнер»" }
  },
  {
    id: "f2",
    date: daysAgo(0, 10, 15),
    title: "Отримано оплату 12 500 грн",
    description: "Оплата від Клієнт А за рахунком №1230",
    type: "payment",
    priority: "low",
    icon: CreditCard,
    metadata: { amount: 12500, documentNumber: "1230", relatedEntity: "Клієнт А" }
  },
  {
    id: "f3",
    date: daysAgo(0, 9, 0),
    title: "Імпортовано виписку Monobank",
    description: "45 транзакцій за листопад 2024",
    type: "system",
    priority: "low",
    icon: Download
  },
  // Yesterday
  {
    id: "f4",
    date: daysAgo(1, 18, 45),
    title: "Надіслано звіт ЄСВ",
    description: "Квартальний звіт Q4 2024 подано успішно",
    type: "report",
    priority: "high",
    icon: Send
  },
  {
    id: "f5",
    date: daysAgo(1, 11, 20),
    title: "Дедлайн наближається",
    description: "Декларація ЄП — залишилось 3 дні",
    type: "deadline",
    priority: "high",
    icon: Clock
  },
  {
    id: "f6",
    date: daysAgo(1, 9, 30),
    title: "Додано витрату на оренду",
    description: "Оренда офісу за грудень",
    type: "document",
    priority: "low",
    icon: Receipt,
    metadata: { amount: 8500 }
  },
  // 2 days ago
  {
    id: "f7",
    date: daysAgo(2, 16, 0),
    title: "Оплачено рахунок №1228",
    description: "Послуги зв'язку Київстар",
    type: "payment",
    priority: "low",
    icon: Wallet,
    metadata: { amount: 450, documentNumber: "1228" }
  },
  {
    id: "f8",
    date: daysAgo(2, 14, 30),
    title: "Нагадування: ЄП",
    description: "Не забудьте сплатити єдиний податок",
    type: "notification",
    priority: "medium",
    icon: Bell
  },
  // 3 days ago
  {
    id: "f9",
    date: daysAgo(3, 12, 0),
    title: "Отримано оплату 45 000 грн",
    description: "Великий проєкт завершено",
    type: "payment",
    priority: "medium",
    icon: CreditCard,
    metadata: { amount: 45000, relatedEntity: "ТОВ «Інновації»" }
  },
  {
    id: "f10",
    date: daysAgo(3, 10, 15),
    title: "Створено акт виконаних робіт",
    description: "Акт №45 для ТОВ «Інновації»",
    type: "document",
    priority: "medium",
    icon: FileText,
    metadata: { documentNumber: "45", relatedEntity: "ТОВ «Інновації»" }
  },
  // 5 days ago
  {
    id: "f11",
    date: daysAgo(5, 15, 20),
    title: "Сплачено ЄСВ",
    description: "Щомісячний платіж ЄСВ",
    type: "payment",
    priority: "high",
    icon: Calculator,
    metadata: { amount: 1760.00 }
  },
  {
    id: "f12",
    date: daysAgo(5, 9, 0),
    title: "Автоматичний бекап даних",
    description: "Всі дані збережено",
    type: "system",
    priority: "low",
    icon: Upload
  },
  // Week ago
  {
    id: "f13",
    date: daysAgo(7, 11, 30),
    title: "Підключено інтеграцію Приват24",
    description: "Автоматичний імпорт виписок активовано",
    type: "system",
    priority: "medium",
    icon: Settings
  },
  {
    id: "f14",
    date: daysAgo(7, 10, 0),
    title: "Створено рахунок №1225",
    description: "Рахунок для ФОП Петренко",
    type: "document",
    priority: "low",
    icon: FileText,
    metadata: { amount: 15000, documentNumber: "1225" }
  },
  // 10 days ago
  {
    id: "f15",
    date: daysAgo(10, 14, 0),
    title: "Звіт ЄП за Q3 подано",
    description: "Декларація прийнята ДПС",
    type: "report",
    priority: "high",
    icon: CheckCircle
  },
  // 2 weeks ago
  {
    id: "f16",
    date: daysAgo(14, 16, 30),
    title: "Отримано оплату 8 000 грн",
    type: "payment",
    priority: "low",
    icon: CreditCard,
    metadata: { amount: 8000 }
  },
  {
    id: "f17",
    date: daysAgo(14, 10, 0),
    title: "Дедлайн: Звіт ЄП",
    description: "Останній день подачі квартального звіту",
    type: "deadline",
    priority: "high",
    icon: AlertTriangle
  },
  // 3 weeks ago
  {
    id: "f18",
    date: daysAgo(21, 12, 0),
    title: "Оновлено банківські реквізити",
    description: "Додано новий рахунок Monobank",
    type: "system",
    priority: "low",
    icon: Settings
  },
  // Month ago
  {
    id: "f19",
    date: daysAgo(30, 9, 0),
    title: "Імпортовано виписку за жовтень",
    description: "38 транзакцій оброблено",
    type: "system",
    priority: "low",
    icon: Download
  },
  {
    id: "f20",
    date: daysAgo(30, 15, 0),
    title: "Сплачено ЄП за Q3",
    description: "Платіж 4 250 грн",
    type: "payment",
    priority: "high",
    icon: Calculator,
    metadata: { amount: 4250 }
  }
];

// TOV Events
const tovEvents: JournalEvent[] = [
  // Today
  {
    id: "t1",
    date: daysAgo(0, 16, 0),
    title: "Підписано договір №125",
    description: "Договір поставки з ТОВ «Постачальник»",
    type: "document",
    priority: "high",
    icon: FileText,
    metadata: { documentNumber: "125", relatedEntity: "ТОВ «Постачальник»" }
  },
  {
    id: "t2",
    date: daysAgo(0, 14, 30),
    title: "Нараховано зарплату",
    description: "Зарплата за листопад для 12 співробітників",
    type: "document",
    priority: "high",
    icon: Users,
    metadata: { amount: 280000 }
  },
  {
    id: "t3",
    date: daysAgo(0, 11, 0),
    title: "Отримано оплату 156 000 грн",
    description: "Від ТОВ «Клієнт Плюс» за договором",
    type: "payment",
    priority: "medium",
    icon: CreditCard,
    metadata: { amount: 156000, relatedEntity: "ТОВ «Клієнт Плюс»" }
  },
  // Yesterday
  {
    id: "t4",
    date: daysAgo(1, 17, 30),
    title: "Подано декларацію ПДВ",
    description: "Звітність за листопад прийнята",
    type: "report",
    priority: "high",
    icon: Send
  },
  {
    id: "t5",
    date: daysAgo(1, 15, 0),
    title: "Дебіторська заборгованість",
    description: "ТОВ «Боржник» — прострочено 45 днів",
    type: "deadline",
    priority: "high",
    icon: AlertTriangle,
    metadata: { amount: 78000, relatedEntity: "ТОВ «Боржник»" }
  },
  {
    id: "t6",
    date: daysAgo(1, 10, 0),
    title: "Створено видаткову накладну",
    description: "Накладна №892 для ТОВ «Покупець»",
    type: "document",
    priority: "low",
    icon: FileText,
    metadata: { documentNumber: "892", relatedEntity: "ТОВ «Покупець»" }
  },
  // 2 days ago
  {
    id: "t7",
    date: daysAgo(2, 14, 0),
    title: "Сплачено ПДФО та ВЗ",
    description: "Податки із зарплати за листопад",
    type: "payment",
    priority: "high",
    icon: Calculator,
    metadata: { amount: 52000 }
  },
  {
    id: "t8",
    date: daysAgo(2, 11, 30),
    title: "Нагадування: Податковий розрахунок (4ДФ)",
    description: "Подача до 10 числа наступного місяця",
    type: "notification",
    priority: "medium",
    icon: Bell
  },
  // 3 days ago
  {
    id: "t9",
    date: daysAgo(3, 16, 0),
    title: "Імпортовано банківську виписку",
    description: "Приват24: 78 транзакцій",
    type: "system",
    priority: "low",
    icon: Download
  },
  {
    id: "t10",
    date: daysAgo(3, 12, 0),
    title: "Підписано акт звірки",
    description: "З ТОВ «Партнер Груп»",
    type: "document",
    priority: "medium",
    icon: CheckCircle,
    metadata: { relatedEntity: "ТОВ «Партнер Груп»" }
  },
  // Week ago
  {
    id: "t11",
    date: daysAgo(7, 15, 0),
    title: "Оплачено оренду офісу",
    description: "Платіж за грудень",
    type: "payment",
    priority: "low",
    icon: Building2,
    metadata: { amount: 45000 }
  },
  {
    id: "t12",
    date: daysAgo(7, 10, 0),
    title: "Отримано товар на склад",
    description: "Прихідна накладна №445",
    type: "document",
    priority: "medium",
    icon: Receipt,
    metadata: { documentNumber: "445", amount: 125000 }
  },
  // 10 days ago
  {
    id: "t13",
    date: daysAgo(10, 14, 0),
    title: "Сплачено ПДВ",
    description: "Податкове зобов'язання за жовтень",
    type: "payment",
    priority: "high",
    icon: Calculator,
    metadata: { amount: 89000 }
  },
  {
    id: "t14",
    date: daysAgo(10, 9, 30),
    title: "Дедлайн ПДВ",
    description: "Останній день сплати",
    type: "deadline",
    priority: "high",
    icon: Clock
  },
  // 2 weeks ago
  {
    id: "t15",
    date: daysAgo(14, 16, 0),
    title: "Проведено інвентаризацію",
    description: "Річна інвентаризація складу",
    type: "system",
    priority: "medium",
    icon: Settings
  },
  // 3 weeks ago
  {
    id: "t16",
    date: daysAgo(21, 11, 0),
    title: "Подано звіт ЄСВ",
    description: "Квартальний звіт прийнято",
    type: "report",
    priority: "high",
    icon: Send
  },
  // Month ago
  {
    id: "t17",
    date: daysAgo(30, 14, 0),
    title: "Виплачено дивіденди",
    description: "Засновникам за Q3",
    type: "payment",
    priority: "high",
    icon: Wallet,
    metadata: { amount: 200000 }
  },
  {
    id: "t18",
    date: daysAgo(30, 10, 0),
    title: "Оновлено статут компанії",
    description: "Зміни зареєстровано",
    type: "document",
    priority: "medium",
    icon: FileText
  }
];

// FOP Group Events
const fopGroupEvents: JournalEvent[] = [
  // Today
  {
    id: "g1",
    date: daysAgo(0, 15, 0),
    title: "Груповий звіт доходів",
    description: "Консолідований звіт по 5 ФОП",
    type: "report",
    priority: "medium",
    icon: Send
  },
  {
    id: "g2",
    date: daysAgo(0, 12, 30),
    title: "ФОП Петренко — ризик перевищення",
    description: "Досягнуто 85% ліміту групи 3",
    type: "deadline",
    priority: "high",
    icon: AlertTriangle,
    metadata: { relatedEntity: "ФОП Петренко" }
  },
  {
    id: "g3",
    date: daysAgo(0, 10, 0),
    title: "Отримано оплату ФОП Іваненко",
    description: "Надходження 28 000 грн",
    type: "payment",
    priority: "low",
    icon: CreditCard,
    metadata: { amount: 28000, relatedEntity: "ФОП Іваненко" }
  },
  // Yesterday
  {
    id: "g4",
    date: daysAgo(1, 16, 0),
    title: "Сплачено ЄСВ по групі",
    description: "5 платежів ЄСВ",
    type: "payment",
    priority: "high",
    icon: Calculator,
    metadata: { amount: 8800 }
  },
  {
    id: "g5",
    date: daysAgo(1, 11, 0),
    title: "Додано нового ФОП",
    description: "ФОП Сидоренко підключено до групи",
    type: "system",
    priority: "medium",
    icon: Users,
    metadata: { relatedEntity: "ФОП Сидоренко" }
  },
  // 2 days ago
  {
    id: "g6",
    date: daysAgo(2, 14, 0),
    title: "Нагадування: Звіти ЄП",
    description: "До кінця кварталу 15 днів",
    type: "notification",
    priority: "medium",
    icon: Bell
  },
  {
    id: "g7",
    date: daysAgo(2, 10, 0),
    title: "Імпорт виписок групи",
    description: "Оброблено 5 банківських виписок",
    type: "system",
    priority: "low",
    icon: Download
  },
  // Week ago
  {
    id: "g8",
    date: daysAgo(7, 15, 0),
    title: "ФОП Коваленко — подано звіт",
    description: "Квартальна декларація ЄП",
    type: "report",
    priority: "high",
    icon: Send,
    metadata: { relatedEntity: "ФОП Коваленко" }
  },
  {
    id: "g9",
    date: daysAgo(7, 12, 0),
    title: "Порівняльний аналіз",
    description: "Доходи групи за листопад",
    type: "system",
    priority: "low",
    icon: Settings
  },
  // 2 weeks ago
  {
    id: "g10",
    date: daysAgo(14, 11, 0),
    title: "Усі ФОП сплатили ЄП",
    description: "5 з 5 платежів виконано",
    type: "payment",
    priority: "high",
    icon: CheckCircle,
    metadata: { amount: 21250 }
  },
  // Month ago
  {
    id: "g11",
    date: daysAgo(30, 14, 0),
    title: "Створено групу ФОП",
    description: "Початкове налаштування групи",
    type: "system",
    priority: "medium",
    icon: Users
  }
];

// Individual Events
const individualEvents: JournalEvent[] = [
  // Today
  {
    id: "i1",
    date: daysAgo(0, 11, 0),
    title: "Нагадування: Податок на нерухомість",
    description: "Сплата до 15 грудня",
    type: "notification",
    priority: "high",
    icon: Bell,
    metadata: { amount: 2500 }
  },
  // Yesterday
  {
    id: "i2",
    date: daysAgo(1, 14, 0),
    title: "Подано декларацію про доходи",
    description: "Річна декларація за 2024 рік",
    type: "report",
    priority: "high",
    icon: Send
  },
  {
    id: "i3",
    date: daysAgo(1, 10, 0),
    title: "Розраховано податкову знижку",
    description: "Витрати на навчання — 18 000 грн",
    type: "system",
    priority: "medium",
    icon: Calculator,
    metadata: { amount: 18000 }
  },
  // Week ago
  {
    id: "i4",
    date: daysAgo(7, 15, 0),
    title: "Дедлайн декларації",
    description: "Останній день подачі",
    type: "deadline",
    priority: "high",
    icon: Clock
  },
  {
    id: "i5",
    date: daysAgo(7, 12, 0),
    title: "Завантажено довідку про доходи",
    description: "Від роботодавця за 2024 рік",
    type: "document",
    priority: "medium",
    icon: FileText
  },
  // 2 weeks ago
  {
    id: "i6",
    date: daysAgo(14, 10, 0),
    title: "Сплачено податок на землю",
    description: "Щорічний платіж",
    type: "payment",
    priority: "high",
    icon: Calculator,
    metadata: { amount: 1200 }
  },
  // Month ago
  {
    id: "i7",
    date: daysAgo(30, 14, 0),
    title: "Оновлено персональні дані",
    description: "Зміна адреси реєстрації",
    type: "system",
    priority: "low",
    icon: Settings
  },
  {
    id: "i8",
    date: daysAgo(30, 11, 0),
    title: "Отримано відшкодування ПДВ",
    description: "За придбання авто",
    type: "payment",
    priority: "medium",
    icon: Wallet,
    metadata: { amount: 45000 }
  },
  // 2 months ago
  {
    id: "i9",
    date: daysAgo(60, 10, 0),
    title: "Подано квартальний звіт",
    description: "Декларація за Q3 2024",
    type: "report",
    priority: "high",
    icon: Send
  }
];

// Report lifecycle events (AI-generated reports)
const reportLifecycleEvents: JournalEvent[] = [
  {
    id: "rl1",
    date: daysAgo(0, 9, 15),
    title: "AI сформував ЄП Q4 2025",
    description: "Автоматична генерація завершена. Data Quality: 95%",
    type: "report-lifecycle",
    priority: "high",
    icon: Bot,
    metadata: { relatedEntity: "Єдиний податок Q4" }
  },
  {
    id: "rl2",
    date: daysAgo(1, 14, 0),
    title: "Розпочато генерацію ЄСВ",
    description: "AI аналізує дані Книги доходів",
    type: "report-lifecycle",
    priority: "medium",
    icon: Bot
  },
  {
    id: "rl3",
    date: daysAgo(3, 10, 30),
    title: "ЄП Q4 подано до ДПС",
    description: "Звіт успішно відправлено через ЕДО",
    type: "report-lifecycle",
    priority: "high",
    icon: Bot,
    metadata: { relatedEntity: "Єдиний податок Q4" }
  },
  {
    id: "rl4",
    date: daysAgo(5, 8, 0),
    title: "Заплановано генерацію звітів",
    description: "ЄП та ЄСВ за Q4 будуть сформовані 15 січня",
    type: "report-lifecycle",
    priority: "low",
    icon: Bot
  },
  {
    id: "rl5",
    date: daysAgo(7, 11, 45),
    title: "4ДФ за грудень готовий до перевірки",
    description: "Перевірте та підтвердьте звіт перед поданням",
    type: "report-lifecycle",
    priority: "high",
    icon: Bot,
    metadata: { relatedEntity: "4ДФ грудень 2024" }
  },
];

// Passive cabinet events (documents and payments from partner)
const passiveCabinetEvents: JournalEvent[] = [
  // Today
  {
    id: "p1",
    date: daysAgo(0, 14, 30),
    title: "Новий рахунок Р-2025/001 від ФОП Іваненко",
    description: "Рахунок на послуги IT-консалтингу за грудень",
    type: "document",
    priority: "high",
    icon: FileText,
    metadata: { amount: 45000, documentNumber: "Р-2025/001", relatedEntity: "ФОП Іваненко І.І." }
  },
  {
    id: "p2",
    date: daysAgo(0, 10, 15),
    title: "Акт АВР-2024/089 очікує вашого підпису",
    description: "Акт виконаних робіт за листопад",
    type: "document",
    priority: "high",
    icon: ClipboardCheck,
    metadata: { amount: 38000, documentNumber: "АВР-2024/089", relatedEntity: "ФОП Іваненко І.І." }
  },
  // Yesterday
  {
    id: "p3",
    date: daysAgo(1, 16, 0),
    title: "Заплановано надходження ₴45,000",
    description: "Оплата за рахунком Р-2024/088",
    type: "payment",
    priority: "medium",
    icon: CreditCard,
    metadata: { amount: 45000, relatedEntity: "ФОП Іваненко І.І." }
  },
  {
    id: "p4",
    date: daysAgo(1, 11, 30),
    title: "Документ підписано партнером",
    description: "Акт АВР-2024/088 підписано ФОП Іваненко",
    type: "document",
    priority: "low",
    icon: CheckCircle,
    metadata: { documentNumber: "АВР-2024/088", relatedEntity: "ФОП Іваненко І.І." }
  },
  // 3 days ago
  {
    id: "p5",
    date: daysAgo(3, 14, 0),
    title: "Накладна ВН-2024/089 підписана обома сторонами",
    description: "Видаткова накладна на товари",
    type: "document",
    priority: "low",
    icon: CheckCircle,
    metadata: { amount: 28500, documentNumber: "ВН-2024/089", relatedEntity: "ФОП Іваненко І.І." }
  },
  // Week ago
  {
    id: "p6",
    date: daysAgo(7, 10, 0),
    title: "Договір ДП-2024/125 підписано",
    description: "Договір про надання послуг на 2025 рік",
    type: "document",
    priority: "medium",
    icon: ScrollText,
    metadata: { documentNumber: "ДП-2024/125", relatedEntity: "ФОП Іваненко І.І." }
  },
  {
    id: "p7",
    date: daysAgo(7, 9, 30),
    title: "Отримано оплату ₴38,000",
    description: "Надходження за актом АВР-2024/087",
    type: "payment",
    priority: "low",
    icon: CreditCard,
    metadata: { amount: 38000, documentNumber: "АВР-2024/087", relatedEntity: "ФОП Іваненко І.І." }
  },
  // 2 weeks ago
  {
    id: "p8",
    date: daysAgo(14, 15, 0),
    title: "Рахунок Р-2024/088 оплачено",
    description: "Платіж від ФОП Іваненко",
    type: "payment",
    priority: "low",
    icon: CreditCard,
    metadata: { amount: 32000, documentNumber: "Р-2024/088" }
  },
  // Month ago
  {
    id: "p9",
    date: daysAgo(30, 11, 0),
    title: "Запрошення до пасивного кабінету",
    description: "Ви приєднались до кабінету для співпраці з ФОП Іваненко",
    type: "system",
    priority: "medium",
    icon: Users,
    metadata: { relatedEntity: "ФОП Іваненко І.І." }
  },
];

// Get report lifecycle events for cabinet type
const getReportLifecycleEventsForCabinet = (cabinetType: CabinetType): JournalEvent[] => {
  // FOP and TOV get all report lifecycle events
  if (cabinetType === "fop" || cabinetType === "tov" || cabinetType === "fop-group") {
    return reportLifecycleEvents;
  }
  // Individual doesn't have business reports
  return [];
};

// Filter types allowed for passive cabinets
export const PASSIVE_CABINET_EVENT_TYPES: EventType[] = ["document", "payment", "system", "booking"];

export const getEventJournalConfig = (cabinetType: CabinetType, isPassive?: boolean): JournalEvent[] => {
  // Return passive cabinet events for passive mode
  if (isPassive) {
    return passiveCabinetEvents.sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  let baseEvents: JournalEvent[];
  switch (cabinetType) {
    case "fop": baseEvents = fopEvents; break;
    case "tov": baseEvents = tovEvents; break;
    case "fop-group": baseEvents = fopGroupEvents; break;
    case "individual": baseEvents = individualEvents; break;
    default: baseEvents = fopEvents;
  }
  
  const lifecycleEvents = getReportLifecycleEventsForCabinet(cabinetType);
  return [...baseEvents, ...lifecycleEvents].sort((a, b) => b.date.getTime() - a.date.getTime());
};

// Date range presets
export const dateRangePresets = [
  { id: "today", label: "Сьогодні" },
  { id: "week", label: "Тиждень" },
  { id: "month", label: "Місяць" },
  { id: "quarter", label: "Квартал" },
  { id: "year", label: "Рік" },
  { id: "all", label: "Увесь час" },
];

// Priority config
export const priorityConfig = {
  high: { label: "Високий", color: "text-destructive", bgColor: "bg-destructive/10" },
  medium: { label: "Середній", color: "text-warning", bgColor: "bg-warning/10" },
  low: { label: "Низький", color: "text-muted-foreground", bgColor: "bg-muted" }
};
