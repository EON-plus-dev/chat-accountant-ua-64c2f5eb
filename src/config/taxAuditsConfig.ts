import type { LucideIcon } from "lucide-react";
import {
  FileText,
  FileSearch,
  Calculator,
  ClipboardCheck,
  AlertCircle,
  CheckCircle2,
  Clock,
  MessageSquare,
  Scale,
} from "lucide-react";

// Типи перевірок згідно ПКУ
export type AuditType = 
  | "documentary-scheduled"    // Документальна планова
  | "documentary-unscheduled"  // Документальна позапланова
  | "cameral"                  // Камеральна
  | "factual";                 // Фактична

// Статуси перевірок
export type AuditStatus = 
  | "announced"          // Оголошено
  | "preparation"        // Підготовка
  | "in-progress"        // Триває
  | "response-required"  // Очікує відповіді
  | "completed"          // Завершено
  | "appealed";          // Оскаржено

// Типи подій в timeline
export type AuditEventType = 
  | "notification"    // Повідомлення про перевірку
  | "documents"       // Надано документи
  | "request"         // Запит від інспектора
  | "response"        // Відповідь на запит
  | "act"             // Акт перевірки
  | "appeal"          // Оскарження
  | "decision";       // Рішення

export interface AuditEvent {
  id: string;
  type: AuditEventType;
  date: string;
  title: string;
  description?: string;
  documentCount?: number;
  requestId?: string;
}

export interface AuditRequest {
  id: string;
  number: string;
  date: string;
  deadline: string;
  /**
   * Тип розрахунку дедлайну. За замовчуванням ПКУ оперує робочими днями
   * (15 р.д. — відповідь на запит згідно п. 73.3 ПКУ).
   */
  deadlineType?: "business" | "calendar";
  subject: string;
  description: string;
  status: "pending" | "answered" | "overdue";
  documentsRequested?: string[];
  responseDate?: string;
  responseText?: string;
  /** ПІБ особи, яка підписала і відправила відповідь */
  respondedBy?: string;
  /** ID документів з документообігу, прикріплених до відповіді */
  responseDocumentIds?: string[];
  /**
   * KWoD-крос: контрагент, фігурує у запиті ДПС.
   * Дозволяє швидко оцінити репутацію та відкрити картку.
   */
  relatedCounterparty?: {
    name: string;
    /** EDRPOU/ІПН для дип-лінку. */
    code?: string;
    /** Оцінка надійності 0–100 (calculateReliability). */
    reliabilityScore?: number;
    /** Прапорець «у списку ризикових» (KWoD-критерій). */
    isRisky?: boolean;
    /** Кількість співпрацівних операцій за останні 12 міс. */
    operationsLast12m?: number;
  };
}

export interface AuditDocument {
  id: string;
  name: string;
  type: string;
  date: string;
  fromDocumentFlow?: boolean;
  documentFlowId?: string;
}

export interface AuditResult {
  hasViolations: boolean;
  additionalTax?: number;
  penalties?: number;
  totalAmount?: number;
  actNumber?: string;
  actDate?: string;
  appealDeadline?: string;
  decisionNumber?: string;
  decisionDate?: string;
}

export interface TaxAudit {
  id: string;
  type: AuditType;
  status: AuditStatus;
  period: string;
  startDate: string;
  endDate?: string;
  inspectorName?: string;
  inspectorPhone?: string;
  taxOffice: string;
  orderNumber: string;
  orderDate: string;
  responseDeadline?: string;
  /**
   * Дата і час фактичного прибуття інспектора (для фактичних перевірок,
   * які за п. 80.2 ПКУ проводяться без попереднього повідомлення).
   */
  arrivalDateTime?: string;
  events: AuditEvent[];
  requests: AuditRequest[];
  documents: AuditDocument[];
  result?: AuditResult;
  /**
   * Зв'язки з окремими сутностями фази оскарження (B1/B4 плану).
   * Акт перевірки і ППР — окремі юридичні документи з власними
   * дедлайнами (10 р.д. на заперечення до акта, 30 к.д. на скаргу/позов на ППР).
   */
  actId?: string;
  pprId?: string;
  /** Один аудит → послідовність скарг (адмін → суд 1 → апеляція → касація). */
  appealIds?: string[];
}

// ========== Окремі сутності фази оскарження (Eтап 2 / B1 / B4) ==========

/** Статус акта перевірки (ст. 86 ПКУ). */
export type ActStatus =
  | "issued"           // Складено та вручено платнику
  | "objection-filed"  // Подано заперечення (10 р.д. за п. 86.7 ПКУ)
  | "reviewed"         // Розглянуто заперечення → остаточне рішення
  | "ppr-issued";      // На основі акта прийнято ППР

export interface TaxAct {
  id: string;
  parentAuditId: string;
  number: string;
  /** Дата складання акта. */
  issuedDate: string;
  /** Дата вручення платнику (з неї відлік 10 р.д. на заперечення). */
  servedDate: string;
  /**
   * Дедлайн подання заперечень — 10 робочих днів з дня вручення (п. 86.7 ПКУ).
   * Розраховується через `addBusinessDaysUA(servedDate, 10)`.
   */
  objectionDeadline: string;
  status: ActStatus;
  /** Сума донарахувань, зафіксованих у акті (₴). */
  additionalTax?: number;
  /** Текст заперечень (якщо подавалися). */
  objectionText?: string;
  objectionDate?: string;
  /** ID документа із документообігу (PDF акта). */
  documentFlowId?: string;
}

/** Статус податкового повідомлення-рішення (ППР, ст. 56–58 ПКУ). */
export type PPRStatus =
  | "issued"             // Прийнято і вручено
  | "appeal-admin"       // Адмінскарга подана (10 р.д. за п. 56.3 ПКУ)
  | "appeal-court"       // Подано позов до окружного адмінсуду (1095 днів за ст. 102)
  | "paid"               // Сплачено в добровільному порядку (10 р.д. на узгодження)
  | "enforced";          // Передано до примусового стягнення

/** Форма ППР за наказом Мінфіну №1204. */
export type PPRForm = "Р" | "Ш" | "В" | "Д" | "ПС";

export interface TaxPPR {
  id: string;
  parentAuditId: string;
  parentActId?: string;
  number: string;
  /** Форма ППР: Р — основна, Ш — штраф, В — ПДВ, Д — донарахування, ПС — пеня. */
  form: PPRForm;
  /** Дата прийняття ППР. */
  issuedDate: string;
  /** Дата вручення платнику. */
  servedDate: string;
  /**
   * Дедлайн узгодження = вручення + 10 робочих днів (п. 57.3 ПКУ).
   * Або платник сплачує, або подає скаргу/позов — інакше борг стає узгодженим.
   */
  agreementDeadline: string;
  /**
   * Дедлайн адмінскарги = вручення + 10 робочих днів (п. 56.3 ПКУ).
   * Збігається з agreementDeadline, але юридично — окрема дія.
   */
  appealAdminDeadline: string;
  status: PPRStatus;
  /** Основна сума зобов'язання (₴). */
  principalAmount: number;
  /** Штрафні санкції (₴). */
  fineAmount?: number;
  /** Пеня станом на дату ППР (₴). */
  penaltyAmount?: number;
  /** Загальна сума до сплати = principal + fine + penalty. */
  totalAmount: number;
  documentFlowId?: string;
}

/** Інстанція оскарження (D6 — 6-крокове адмін./судове оскарження). */
export type AppealInstance =
  | "admin-regional"     // 1. Адмінскарга в обласне ГУ ДПС
  | "admin-central"      // 2. Повторна адмінскарга в ДПС України (Центральний апарат)
  | "court-first"        // 3. Окружний адмінсуд (перша інстанція)
  | "court-appeal"       // 4. Апеляційний адмінсуд
  | "court-cassation"    // 5. Касаційний адмінсуд (Верховний Суд)
  | "constitutional";    // 6. Конституційне подання (рідко)

export type AppealStatus =
  | "draft"
  | "filed"
  | "in-review"
  | "satisfied"      // Скарга задоволена повністю
  | "partial"        // Задоволена частково
  | "rejected";      // Відмовлено

export interface TaxAppeal {
  id: string;
  parentAuditId: string;
  parentPprId: string;
  /** Інстанція, до якої подано. */
  instance: AppealInstance;
  /** Порядковий номер у ланцюжку оскаржень (0-5 для D6). */
  step: number;
  number?: string;
  filedDate?: string;
  /**
   * Дедлайн подання — залежить від інстанції:
   *  • admin-regional/central: 10 р.д. з вручення ППР (п. 56.3)
   *  • court-first: 1095 днів з вручення ППР (ст. 102 ПКУ)
   *  • court-appeal: 30 к.д. з рішення першої інстанції (КАСУ)
   *  • court-cassation: 30 к.д. з постанови апеляції
   */
  filingDeadline: string;
  /**
   * Дедлайн розгляду органом — 20 к.д. для адмінскарги (п. 56.8 ПКУ),
   * може бути продовжено до 60 к.д.
   */
  reviewDeadline?: string;
  status: AppealStatus;
  /** Сума оскарження (₴). */
  disputedAmount: number;
  /** Сума, від якої звільнено за результатом (₴). */
  reliefAmount?: number;
  decision?: string;
  decisionDate?: string;
}

// Конфігурація типів перевірок
export const auditTypeConfig: Record<AuditType, { label: string; description: string; icon: LucideIcon }> = {
  "documentary-scheduled": {
    label: "Документальна планова",
    description: "Планова перевірка за затвердженим графіком ДПС",
    icon: FileText,
  },
  "documentary-unscheduled": {
    label: "Документальна позапланова",
    description: "Позапланова перевірка за рішенням керівника ДПС",
    icon: FileSearch,
  },
  "cameral": {
    label: "Камеральна",
    description: "Автоматична перевірка поданої звітності",
    icon: Calculator,
  },
  "factual": {
    label: "Фактична",
    description: "Перевірка дотримання законодавства на місці",
    icon: ClipboardCheck,
  },
};

// Конфігурація статусів
export const auditStatusConfig: Record<AuditStatus, { label: string; color: string; icon: LucideIcon }> = {
  "announced": {
    label: "Оголошено",
    color: "text-blue-600 bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800",
    icon: AlertCircle,
  },
  "preparation": {
    label: "Підготовка",
    color: "text-amber-600 bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800",
    icon: Clock,
  },
  "in-progress": {
    label: "Триває",
    color: "text-orange-600 bg-orange-50 dark:bg-orange-950/50 border-orange-200 dark:border-orange-800",
    icon: FileSearch,
  },
  "response-required": {
    label: "Очікує відповіді",
    color: "text-red-600 bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-800",
    icon: MessageSquare,
  },
  "completed": {
    label: "Завершено",
    color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800",
    icon: CheckCircle2,
  },
  "appealed": {
    label: "Оскаржено",
    color: "text-purple-600 bg-purple-50 dark:bg-purple-950/50 border-purple-200 dark:border-purple-800",
    icon: Scale,
  },
};

// Конфігурація типів подій
export const auditEventTypeConfig: Record<AuditEventType, { label: string; icon: string }> = {
  "notification": { label: "Повідомлення", icon: "📨" },
  "documents": { label: "Документи", icon: "📁" },
  "request": { label: "Запит", icon: "❓" },
  "response": { label: "Відповідь", icon: "💬" },
  "act": { label: "Акт перевірки", icon: "📋" },
  "appeal": { label: "Оскарження", icon: "⚖️" },
  "decision": { label: "Рішення", icon: "✅" },
};

// Демо-дані для перевірок
export const demoAudits: TaxAudit[] = [
  // 1. Камеральна — завершено без порушень
  // ВАЖЛИВО: за п. 86.2 ПКУ при камеральній БЕЗ порушень акт НЕ складається,
  // оформлюється лише довідка. Тому actNumber/actDate тут відсутні.
  {
    id: "audit-1",
    type: "cameral",
    status: "completed",
    period: "III кв. 2024",
    startDate: "2024-10-15",
    endDate: "2024-10-18",
    taxOffice: "ДПІ у Шевченківському районі м. Києва",
    orderNumber: "КАМ-2024-0892",
    orderDate: "2024-10-15",
    events: [
      { id: "e1", type: "notification", date: "2024-10-15", title: "Розпочато камеральну перевірку декларації ЄП за III кв. 2024" },
      { id: "e2", type: "act", date: "2024-10-18", title: "Довідка перевірки: порушень не виявлено" },
    ],
    requests: [],
    documents: [],
    result: {
      hasViolations: false,
    },
  },

  // 2. Документальна планова — очікує відповіді
  {
    id: "audit-2",
    type: "documentary-scheduled",
    status: "response-required",
    period: "2024",
    startDate: "2024-12-02",
    inspectorName: "Петренко О.В.",
    inspectorPhone: "+380 44 123 45 67",
    taxOffice: "ДПІ у Шевченківському районі м. Києва",
    orderNumber: "ДП-2024-0156",
    orderDate: "2024-11-15",
    responseDeadline: "2025-01-15",
    events: [
      { id: "e1", type: "notification", date: "2024-11-15", title: "Отримано наказ про проведення планової перевірки" },
      { id: "e2", type: "documents", date: "2024-12-02", title: "Надано первинні документи", documentCount: 12 },
      { id: "e3", type: "request", date: "2024-12-10", title: "Запит №1: Пояснення щодо договору з ТОВ «Діджитал»", requestId: "req-1" },
      { id: "e4", type: "request", date: "2024-12-15", title: "Запит №2: Документи про реалізацію послуг", requestId: "req-2" },
    ],
    requests: [
      {
        id: "req-1",
        number: "ЗАП-2024-001",
        date: "2024-12-10",
        deadline: "2024-12-25",
        subject: "Пояснення щодо договору з ТОВ «Діджитал Солюшнс»",
        description: "Прошу надати пояснення щодо характеру виконаних робіт за договором №15 від 01.03.2024",
        status: "answered",
        documentsRequested: ["Договір №15", "Акти виконаних робіт", "Рахунки-фактури"],
        responseDate: "2024-12-20",
        responseText: "Надано пояснення щодо характеру виконаних робіт за договором №15 від 01.03.2024 з ТОВ «Діджитал Солюшнс».\n\nДодаються копії:\n• договору з усіма додатковими угодами;\n• актів виконаних робіт за період березень-листопад 2024;\n• рахунків-фактур, виставлених за надані послуги.\n\nПідтверджуємо реальність господарських операцій та готові надати додаткові пояснення на вимогу.",
        respondedBy: "Іваненко О. П.",
        responseDocumentIds: ["doc-fop-001", "doc-fop-002", "doc-fop-005"],
        relatedCounterparty: {
          name: "ТОВ «Діджитал Солюшнс»",
          code: "41234567",
          reliabilityScore: 78,
          isRisky: false,
          operationsLast12m: 12,
        },
      },
      {
        id: "req-2",
        number: "ЗАП-2024-002",
        date: "2024-12-15",
        deadline: "2025-01-15",
        subject: "Документи про реалізацію послуг за IV квартал",
        description: "Прошу надати документи, що підтверджують реалізацію послуг за жовтень-листопад 2024",
        status: "pending",
        documentsRequested: ["Книга обліку доходів", "Банківські виписки", "Акти з контрагентами"],
        relatedCounterparty: {
          name: "ТОВ «Альфа-Трейд»",
          code: "39876543",
          reliabilityScore: 42,
          isRisky: true,
          operationsLast12m: 3,
        },
      },
    ],
    documents: [
      { id: "d1", name: "Акт АКТ-2024-043 — прийом обладнання", type: "Акт", date: "2024-12-11", fromDocumentFlow: true, documentFlowId: "doc-fop-012" },
      { id: "d2", name: "Акт АКТ-2024-041 — консультаційні послуги", type: "Акт", date: "2024-12-09", fromDocumentFlow: true, documentFlowId: "doc-fop-002" },
      { id: "d3", name: "Рахунок РАХ-2024-044 — консультаційні послуги", type: "Рахунок", date: "2024-12-09", fromDocumentFlow: true, documentFlowId: "doc-fop-001" },
      { id: "d4", name: "Банківська виписка за III кв.", type: "Виписка", date: "2024-10-05" },
      { id: "d5", name: "Книга обліку доходів 2024", type: "Книга доходів", date: "2024-12-01" },
      { id: "d6", name: "Декларація ЄП за III кв. 2024", type: "Звіт", date: "2024-10-15" },
      { id: "d7", name: "Акт АКТ-2024-042 — маркетингові послуги", type: "Акт", date: "2024-12-09", fromDocumentFlow: true, documentFlowId: "doc-fop-005" },
      { id: "d8", name: "Рахунок РАХ-2024-048 — оренда офісу", type: "Рахунок", date: "2024-12-11", fromDocumentFlow: true, documentFlowId: "doc-fop-013" },
    ],
  },

  // 3. Документальна позапланова — оскаржено
  {
    id: "audit-3",
    type: "documentary-unscheduled",
    status: "appealed",
    period: "I-II кв. 2024",
    startDate: "2024-08-15",
    endDate: "2024-09-30",
    inspectorName: "Ковальчук М.І.",
    taxOffice: "ДПІ у Шевченківському районі м. Києва",
    orderNumber: "ДПП-2024-0089",
    orderDate: "2024-08-10",
    events: [
      { id: "e1", type: "notification", date: "2024-08-10", title: "Отримано наказ про позапланову перевірку" },
      { id: "e2", type: "documents", date: "2024-08-15", title: "Надано документи", documentCount: 24 },
      { id: "e3", type: "request", date: "2024-08-20", title: "Запит: Пояснення по розбіжностях" },
      { id: "e4", type: "response", date: "2024-08-25", title: "Надано відповідь на запит" },
      { id: "e5", type: "act", date: "2024-09-30", title: "Складено акт: донарахування 12 500 ₴" },
      { id: "e6", type: "appeal", date: "2024-10-15", title: "Подано скаргу до ДПС" },
    ],
    requests: [
      {
        id: "req-3",
        number: "ЗАП-2024-003",
        date: "2024-08-20",
        deadline: "2024-09-05",
        subject: "Пояснення по розбіжностях в доходах",
        description: "Виявлено розбіжність між сумою в декларації та банківськими надходженнями",
        status: "answered",
        responseDate: "2024-08-25",
        responseText: "Надано пояснення: різниця через повернення коштів",
      },
    ],
    documents: [],
    result: {
      hasViolations: true,
      additionalTax: 8500,
      penalties: 4000,
      totalAmount: 12500,
      actNumber: "АКТ-ДПП-2024-0089",
      actDate: "2024-09-30",
      appealDeadline: "2024-10-30",
    },
  },

  // 4. Камеральна — в процесі (автоперевірка декларації)
  {
    id: "audit-4",
    type: "cameral",
    status: "in-progress",
    period: "IV кв. 2024",
    startDate: "2024-12-18",
    taxOffice: "ДПІ у Подільському районі м. Києва",
    orderNumber: "КАМ-2024-1245",
    orderDate: "2024-12-18",
    events: [
      { id: "e1", type: "notification", date: "2024-12-18", title: "Розпочато камеральну перевірку декларації ЄП за IV кв. 2024" },
      { id: "e2", type: "request", date: "2024-12-20", title: "Автоматичний запит: уточнення реквізитів платежу", requestId: "req-4" },
    ],
    requests: [
      {
        id: "req-4",
        number: "КАМ-ЗАП-2024-001",
        date: "2024-12-20",
        deadline: "2024-12-27",
        subject: "Уточнення реквізитів платежу ЄВ",
        description: "Система виявила розбіжність між сумою сплаченого ЄВ та розрахунковою сумою",
        status: "pending",
        documentsRequested: ["Платіжне доручення", "Квитанція про сплату ЄВ"],
      },
    ],
    documents: [
      { id: "d9", name: "Декларація ЄП за IV кв. 2024", type: "Звіт", date: "2024-12-15" },
    ],
  },

  // 5. Фактична — триває (перевірка РРО на місці)
  // ВАЖЛИВО: за п. 80.2 ПКУ фактична перевірка проводиться БЕЗ попереднього
  // повідомлення. Наказ і службові посвідчення пред'являються на місці прибуття.
  // Тому статус "announced" і responseDeadline тут заборонені.
  {
    id: "audit-5",
    type: "factual",
    status: "in-progress",
    period: "2024",
    startDate: "2024-12-23",
    arrivalDateTime: "2024-12-23T10:30:00",
    inspectorName: "Сидоренко А.М.",
    inspectorPhone: "+380 44 234 56 78",
    taxOffice: "ГУ ДПС у м. Києві",
    orderNumber: "ФП-2024-0567",
    orderDate: "2024-12-23",
    events: [
      { id: "e1", type: "notification", date: "2024-12-23", title: "Прибуття інспектора. Пред'явлено наказ про фактичну перевірку РРО (10:30)" },
    ],
    requests: [],
    documents: [],
  },

  // 6. Документальна планова — підготовка (великий обсяг)
  {
    id: "audit-6",
    type: "documentary-scheduled",
    status: "preparation",
    period: "2023-2024",
    startDate: "2025-01-15",
    inspectorName: "Мельник В.В.",
    inspectorPhone: "+380 44 345 67 89",
    taxOffice: "ДПІ у Голосіївському районі м. Києва",
    orderNumber: "ДП-2024-0298",
    orderDate: "2024-12-15",
    responseDeadline: "2025-01-10",
    events: [
      { id: "e1", type: "notification", date: "2024-12-15", title: "Отримано наказ про планову перевірку за 2 роки" },
      { id: "e2", type: "documents", date: "2024-12-18", title: "Розпочато підготовку документів", documentCount: 0 },
    ],
    requests: [],
    documents: [
      { id: "d10", name: "Книга обліку доходів 2023", type: "Книга доходів", date: "2024-01-05" },
      { id: "d11", name: "Книга обліку доходів 2024", type: "Книга доходів", date: "2024-12-01" },
      { id: "d12", name: "Декларація ЄП за I кв. 2023", type: "Звіт", date: "2023-04-15" },
      { id: "d13", name: "Декларація ЄП за II кв. 2023", type: "Звіт", date: "2023-07-15" },
      { id: "d14", name: "Декларація ЄП за III кв. 2023", type: "Звіт", date: "2023-10-15" },
      { id: "d15", name: "Декларація ЄП за IV кв. 2023", type: "Звіт", date: "2024-01-15" },
      { id: "d16", name: "Декларація ЄП за I кв. 2024", type: "Звіт", date: "2024-04-15" },
      { id: "d17", name: "Декларація ЄП за II кв. 2024", type: "Звіт", date: "2024-07-15" },
      { id: "d18", name: "Декларація ЄП за III кв. 2024", type: "Звіт", date: "2024-10-15" },
      { id: "d19", name: "Банківські виписки 2023", type: "Виписка", date: "2024-01-10" },
      { id: "d20", name: "Банківські виписки 2024", type: "Виписка", date: "2024-12-10" },
      { id: "d21", name: "Договір №5 з ТОВ «Альфа»", type: "Договір", date: "2023-02-01", fromDocumentFlow: true },
      { id: "d22", name: "Договір №8 з ФОП Іваненко", type: "Договір", date: "2023-05-15", fromDocumentFlow: true },
      { id: "d23", name: "Договір №12 з ТОВ «Бета»", type: "Договір", date: "2023-09-01", fromDocumentFlow: true },
      { id: "d24", name: "Договір №15 з ТОВ «Діджитал»", type: "Договір", date: "2024-03-01", fromDocumentFlow: true },
      { id: "d25", name: "Договір №18 з ПП «Гамма»", type: "Договір", date: "2024-06-01", fromDocumentFlow: true },
      { id: "d26", name: "Акти виконаних робіт 2023 (12 шт.)", type: "Акт", date: "2023-12-31", fromDocumentFlow: true },
      { id: "d27", name: "Акти виконаних робіт 2024 (15 шт.)", type: "Акт", date: "2024-12-15", fromDocumentFlow: true },
      { id: "d28", name: "Реєстр платіжних доручень 2023", type: "Реєстр", date: "2024-01-10" },
      { id: "d29", name: "Реєстр платіжних доручень 2024", type: "Реєстр", date: "2024-12-15" },
    ],
  },

  // 7. Документальна позапланова — очікує відповіді (з простроченим запитом)
  {
    id: "audit-7",
    type: "documentary-unscheduled",
    status: "response-required",
    period: "II кв. 2024",
    startDate: "2024-11-20",
    inspectorName: "Бондаренко Н.О.",
    inspectorPhone: "+380 44 456 78 90",
    taxOffice: "ДПІ у Печерському районі м. Києва",
    orderNumber: "ДПП-2024-0234",
    orderDate: "2024-11-15",
    responseDeadline: "2024-12-20",
    events: [
      { id: "e1", type: "notification", date: "2024-11-15", title: "Отримано наказ про позапланову перевірку" },
      { id: "e2", type: "documents", date: "2024-11-20", title: "Надано первинні документи", documentCount: 8 },
      { id: "e3", type: "request", date: "2024-11-25", title: "Запит №1: Пояснення по операції з ТОВ «Дельта»", requestId: "req-5" },
      { id: "e4", type: "request", date: "2024-12-01", title: "Запит №2: Документи по орендній платі", requestId: "req-6" },
      { id: "e5", type: "request", date: "2024-12-10", title: "Запит №3: Додаткові пояснення", requestId: "req-7" },
    ],
    requests: [
      {
        id: "req-5",
        number: "ЗАП-2024-011",
        date: "2024-11-25",
        deadline: "2024-12-10",
        subject: "Пояснення по операції з ТОВ «Дельта»",
        description: "Прошу надати пояснення щодо господарської операції на суму 45 000 грн",
        status: "overdue",
        documentsRequested: ["Договір", "Акт", "Платіжне доручення"],
      },
      {
        id: "req-6",
        number: "ЗАП-2024-012",
        date: "2024-12-01",
        deadline: "2024-12-16",
        subject: "Документи по орендній платі",
        description: "Прошу надати документи, що підтверджують витрати на оренду приміщення",
        status: "answered",
        documentsRequested: ["Договір оренди", "Акти", "Платіжки"],
        responseDate: "2024-12-14",
        responseText: "У відповідь на запит надаємо документи, що підтверджують витрати на оренду офісного приміщення:\n\n• договір оренди №ОР-2024-01 від 01.01.2024;\n• щомісячні акти приймання-передачі за період січень-листопад 2024;\n• платіжні доручення про сплату орендної плати.\n\nВсі господарські операції відображені у Книзі обліку доходів. Готові надати додаткові пояснення на запит.",
        respondedBy: "Іваненко О. П.",
        responseDocumentIds: ["doc-fop-013"],
      },
      {
        id: "req-7",
        number: "ЗАП-2024-013",
        date: "2024-12-10",
        deadline: "2024-12-25",
        subject: "Додаткові пояснення по розрахунках",
        description: "Прошу надати додаткові пояснення щодо розрахунків з контрагентами",
        status: "pending",
        documentsRequested: ["Акти звірки", "Переписка"],
      },
    ],
    documents: [
      { id: "d30", name: "Договір з ТОВ «Дельта»", type: "Договір", date: "2024-04-01", fromDocumentFlow: true },
      { id: "d31", name: "Акт виконаних робіт", type: "Акт", date: "2024-05-15", fromDocumentFlow: true },
      { id: "d32", name: "Договір оренди", type: "Договір", date: "2024-01-01", fromDocumentFlow: true },
      { id: "d33", name: "Банківські виписки II кв.", type: "Виписка", date: "2024-07-05" },
    ],
  },

  // 8. Камеральна — завершено з порушенням
  {
    id: "audit-8",
    type: "cameral",
    status: "completed",
    period: "II кв. 2024",
    startDate: "2024-08-01",
    endDate: "2024-08-10",
    taxOffice: "ДПІ у Подільському районі м. Києва",
    orderNumber: "КАМ-2024-0654",
    orderDate: "2024-08-01",
    events: [
      { id: "e1", type: "notification", date: "2024-08-01", title: "Розпочато камеральну перевірку декларації ЄП за II кв. 2024" },
      { id: "e2", type: "request", date: "2024-08-03", title: "Запит: уточнення суми доходу", requestId: "req-8" },
      { id: "e3", type: "response", date: "2024-08-05", title: "Надано уточнення" },
      { id: "e4", type: "act", date: "2024-08-10", title: "Акт перевірки: виявлено заниження доходу" },
      { id: "e5", type: "decision", date: "2024-08-15", title: "ППР на суму 5 000 грн" },
    ],
    requests: [
      {
        id: "req-8",
        number: "КАМ-ЗАП-2024-002",
        date: "2024-08-03",
        deadline: "2024-08-08",
        subject: "Уточнення суми доходу за II квартал",
        description: "Виявлено розбіжність між сумою в декларації та даними банку",
        status: "answered",
        responseDate: "2024-08-05",
        responseText: "Надано уточнюючу декларацію",
      },
    ],
    documents: [],
    result: {
      hasViolations: true,
      additionalTax: 4000,
      penalties: 1000,
      totalAmount: 5000,
      actNumber: "АКТ-КАМ-2024-0654",
      actDate: "2024-08-10",
      decisionNumber: "ППР-2024-0654",
      decisionDate: "2024-08-15",
    },
  },

  // 9. Документальна планова — завершено без порушень
  {
    id: "audit-9",
    type: "documentary-scheduled",
    status: "completed",
    period: "2023",
    startDate: "2024-03-15",
    endDate: "2024-04-15",
    inspectorName: "Кравченко Т.В.",
    taxOffice: "ДПІ у Голосіївському районі м. Києва",
    orderNumber: "ДП-2024-0045",
    orderDate: "2024-02-28",
    events: [
      { id: "e1", type: "notification", date: "2024-02-28", title: "Отримано наказ про планову перевірку за 2023 рік" },
      { id: "e2", type: "documents", date: "2024-03-15", title: "Надано документи за 2023 рік", documentCount: 35 },
      { id: "e3", type: "request", date: "2024-03-25", title: "Запит: пояснення по витратах", requestId: "req-9" },
      { id: "e4", type: "response", date: "2024-03-28", title: "Надано пояснення" },
      { id: "e5", type: "act", date: "2024-04-15", title: "Акт перевірки: порушень не виявлено" },
    ],
    requests: [
      {
        id: "req-9",
        number: "ЗАП-2024-004",
        date: "2024-03-25",
        deadline: "2024-04-01",
        subject: "Пояснення по витратах на транспорт",
        description: "Прошу надати пояснення щодо витрат на паливо",
        status: "answered",
        responseDate: "2024-03-28",
        responseText: "Витрати на паливо здійснювалися виключно у межах господарської діяльності — для службових поїздок до клієнтів. Додаються:\n\n• подорожні листи за період січень-грудень 2023;\n• чеки АЗС;\n• наказ про використання особистого автомобіля у господарській діяльності.\n\nУсі витрати правомірно віднесено до складу витрат періоду.",
        respondedBy: "Іваненко О. П.",
        responseDocumentIds: ["doc-fop-002"],
      },
    ],
    documents: [],
    result: {
      hasViolations: false,
      // За п. 86.2 ПКУ: при перевірці без порушень акт не складається
      // (оформлюється довідка). Тому actNumber/actDate тут відсутні.
    },
  },

  // 10. Документальна позапланова — оскаржено (в адмінсуді)
  {
    id: "audit-10",
    type: "documentary-unscheduled",
    status: "appealed",
    period: "I кв. 2024",
    startDate: "2024-05-10",
    endDate: "2024-06-15",
    inspectorName: "Литвиненко Р.С.",
    taxOffice: "ДПІ у Печерському районі м. Києва",
    orderNumber: "ДПП-2024-0112",
    orderDate: "2024-05-05",
    actId: "act-10",
    pprId: "ppr-10",
    appealIds: ["appeal-10-1", "appeal-10-2"],
    events: [
      { id: "e1", type: "notification", date: "2024-05-05", title: "Отримано наказ про позапланову перевірку" },
      { id: "e2", type: "documents", date: "2024-05-10", title: "Надано документи", documentCount: 18 },
      { id: "e3", type: "request", date: "2024-05-20", title: "Запит: пояснення по контрагенту", requestId: "req-10" },
      { id: "e4", type: "response", date: "2024-05-25", title: "Надано відповідь" },
      { id: "e5", type: "act", date: "2024-06-15", title: "Акт перевірки: донарахування 28 000 грн" },
      { id: "e6", type: "appeal", date: "2024-07-01", title: "Подано скаргу до ДПС (відхилено)" },
      { id: "e7", type: "appeal", date: "2024-07-20", title: "Подано позов до Окружного адмінсуду" },
    ],
    requests: [
      {
        id: "req-10",
        number: "ЗАП-2024-008",
        date: "2024-05-20",
        deadline: "2024-06-01",
        subject: "Пояснення по операціях з ТОВ «Омега»",
        description: "Контрагент має ознаки ризиковості. Прошу надати пояснення.",
        status: "answered",
        responseDate: "2024-05-25",
        responseText: "Надано документи та пояснення щодо реальності операцій",
      },
    ],
    documents: [],
    result: {
      hasViolations: true,
      additionalTax: 20000,
      penalties: 8000,
      totalAmount: 28000,
      actNumber: "АКТ-ДПП-2024-0112",
      actDate: "2024-06-15",
      appealDeadline: "2024-07-15",
    },
  },
];

// Dev-валідатор: перевіряє методологічну коректність демо-даних під ПКУ.
// Викликається один раз при імпорті модуля у режимі розробки.
if (import.meta.env?.DEV) {
  for (const a of demoAudits) {
    if (a.type === "factual" && a.status === "announced") {
      // п. 80.2 ПКУ: фактична — без попереднього повідомлення
      console.warn(
        `[taxAuditsConfig] Перевірка ${a.id}: фактична перевірка не може мати статус "announced" (п. 80.2 ПКУ).`,
      );
    }
    if (a.type === "factual" && a.responseDeadline) {
      console.warn(
        `[taxAuditsConfig] Перевірка ${a.id}: для фактичної перевірки responseDeadline не передбачено ПКУ.`,
      );
    }
    if (a.type === "cameral" && a.result && !a.result.hasViolations && a.result.actNumber) {
      // п. 86.2 ПКУ: при камеральній без порушень акт не складається
      console.warn(
        `[taxAuditsConfig] Перевірка ${a.id}: камеральна без порушень не повинна мати actNumber (п. 86.2 ПКУ).`,
      );
    }
  }
}

// Утиліти
export const getAuditTypeLabel = (type: AuditType): string => auditTypeConfig[type].label;
export const getAuditStatusLabel = (status: AuditStatus): string => auditStatusConfig[status].label;
export const getAuditStatusColor = (status: AuditStatus): string => auditStatusConfig[status].color;

export const getActiveAuditsCount = (audits: TaxAudit[]): number => 
  audits.filter(a => !["completed", "appealed"].includes(a.status)).length;

export const getResponseRequiredCount = (audits: TaxAudit[]): number => 
  audits.filter(a => a.status === "response-required").length;

export const getCompletedAuditsCount = (audits: TaxAudit[], year: number): number => 
  audits.filter(a => a.status === "completed" && new Date(a.endDate || a.startDate).getFullYear() === year).length;

export const getPendingRequestsCount = (audits: TaxAudit[]): number => 
  audits.reduce((acc, audit) => acc + audit.requests.filter(r => r.status === "pending").length, 0);

export const getOverdueRequestsCount = (audits: TaxAudit[]): number => 
  audits.reduce((acc, audit) => acc + audit.requests.filter(r => r.status === "overdue").length, 0);

export const getNearestDeadline = (audits: TaxAudit[]): { deadline: string; auditId: string } | null => {
  const activeAudits = audits.filter(a => a.responseDeadline && a.status === "response-required");
  if (activeAudits.length === 0) return null;
  
  const sorted = activeAudits.sort((a, b) => 
    new Date(a.responseDeadline!).getTime() - new Date(b.responseDeadline!).getTime()
  );
  
  return { deadline: sorted[0].responseDeadline!, auditId: sorted[0].id };
};

// Mapping статусу до кроку універсального stepper (legacy — використовується там,
// де немає контексту типу перевірки). Для нових місць — getStepsForAuditType().
export const getAuditStepFromStatus = (status: AuditStatus): number => {
  const stepMap: Record<AuditStatus, number> = {
    "announced": 0,
    "preparation": 1,
    "in-progress": 2,
    "response-required": 3,
    "completed": 4,
    "appealed": 4,
  };
  return stepMap[status];
};

// ========== Stepper-конфіги per audit type (Eтап 2 / D6) ==========

export interface AuditStepConfig {
  id: string;
  label: string;
  /** Який AuditStatus відповідає цьому кроку (для розрахунку currentStep). */
  matchStatuses: AuditStatus[];
}

/**
 * Кроки для кожного типу перевірки відрізняються:
 *  • cameral — без оголошення (автоматична), без виїзду
 *  • factual — без оголошення, починається з прибуття інспектора
 *  • documentary-* — повний цикл з оголошенням і відповіддю
 */
export const AUDIT_STEPS_BY_TYPE: Record<AuditType, AuditStepConfig[]> = {
  "documentary-scheduled": [
    { id: "announced", label: "Наказ", matchStatuses: ["announced"] },
    { id: "preparation", label: "Підготовка", matchStatuses: ["preparation"] },
    { id: "in-progress", label: "Перевірка", matchStatuses: ["in-progress"] },
    { id: "response", label: "Запити/відповіді", matchStatuses: ["response-required"] },
    { id: "act", label: "Акт", matchStatuses: [] },
    { id: "completed", label: "Завершено", matchStatuses: ["completed", "appealed"] },
  ],
  "documentary-unscheduled": [
    { id: "announced", label: "Наказ", matchStatuses: ["announced"] },
    { id: "preparation", label: "Підготовка", matchStatuses: ["preparation"] },
    { id: "in-progress", label: "Перевірка", matchStatuses: ["in-progress"] },
    { id: "response", label: "Запити/відповіді", matchStatuses: ["response-required"] },
    { id: "act", label: "Акт", matchStatuses: [] },
    { id: "completed", label: "Завершено", matchStatuses: ["completed", "appealed"] },
  ],
  "cameral": [
    // п. 76 ПКУ: камеральна — автоматична, без оголошення
    { id: "in-progress", label: "Перевірка", matchStatuses: ["in-progress", "preparation", "announced"] },
    { id: "response", label: "Запити (опційно)", matchStatuses: ["response-required"] },
    { id: "completed", label: "Довідка/акт", matchStatuses: ["completed", "appealed"] },
  ],
  "factual": [
    // п. 80.2 ПКУ: фактична — без попереднього повідомлення, починається з прибуття
    { id: "arrival", label: "Прибуття", matchStatuses: ["announced", "preparation"] },
    { id: "in-progress", label: "Перевірка", matchStatuses: ["in-progress"] },
    { id: "response", label: "Пояснення", matchStatuses: ["response-required"] },
    { id: "act", label: "Акт", matchStatuses: [] },
    { id: "completed", label: "Завершено", matchStatuses: ["completed", "appealed"] },
  ],
};

export function getStepsForAuditType(type: AuditType): AuditStepConfig[] {
  return AUDIT_STEPS_BY_TYPE[type];
}

/**
 * Поточний крок stepper для конкретної перевірки.
 * Ураховує наявність акта/ППР, не тільки status.
 */
export function getCurrentStepIndex(audit: TaxAudit): number {
  const steps = getStepsForAuditType(audit.type);
  // Якщо є завершення — повертаємо останній крок
  if (audit.status === "completed" || audit.status === "appealed") {
    return steps.length - 1;
  }
  // Якщо є акт, але ще не completed — крок "act"
  if (audit.actId || audit.result?.actNumber) {
    const actIdx = steps.findIndex((s) => s.id === "act");
    if (actIdx >= 0) return actIdx;
  }
  // Інакше — за статусом
  const idx = steps.findIndex((s) => s.matchStatuses.includes(audit.status));
  return idx >= 0 ? idx : 0;
}

// ========== B6/B7/B8: строки давності, зберігання, ставки ==========

/**
 * B6 — Строк давності податкових перевірок: 1095 днів (≈3 роки) з дати
 * подання декларації, ст. 102.1 ПКУ. Для прихованих доходів — 2555 днів.
 */
export const TAX_LIMITATION_DAYS = 1095;
export const TAX_LIMITATION_HIDDEN_DAYS = 2555;

export function isWithinLimitationPeriod(reportingDate: string, today: Date = new Date()): boolean {
  const reported = new Date(reportingDate);
  const diffDays = Math.floor((today.getTime() - reported.getTime()) / (1000 * 60 * 60 * 24));
  return diffDays <= TAX_LIMITATION_DAYS;
}

/**
 * B7 — Зберігання первинних документів: не менше 3 років (1095 днів)
 * з дати подання звіту (ст. 44.3 ПКУ). Електронні — на тих самих умовах.
 */
export const DOC_STORAGE_DAYS = 1095;

export function getDocumentStorageDeadline(reportingDate: string): string {
  const date = new Date(reportingDate);
  date.setDate(date.getDate() + DOC_STORAGE_DAYS);
  return date.toISOString().split("T")[0];
}

/**
 * B8 — Базова ставка пені: 120% облікової ставки НБУ (п. 129.4 ПКУ).
 * Станом на 04.2026 ОС НБУ = 13.5%, тому ставка пені ≈ 16.2%/рік.
 * Узгоджено з src/lib/taxPenaltyCalculator.ts.
 */
export const NBU_KEY_RATE = 0.135;
export const PPR_PENALTY_RATE_ANNUAL = NBU_KEY_RATE * 1.2;

// ========== Helpers для нових сутностей Act/PPR/Appeal ==========

export const APPEAL_INSTANCE_LABEL: Record<AppealInstance, string> = {
  "admin-regional": "Адмінскарга в обласне ГУ ДПС",
  "admin-central": "Адмінскарга в ДПС України",
  "court-first": "Окружний адмінсуд",
  "court-appeal": "Апеляційний адмінсуд",
  "court-cassation": "Касаційний адмінсуд (ВС)",
  "constitutional": "Конституційне подання",
};

export const APPEAL_STATUS_LABEL: Record<AppealStatus, string> = {
  "draft": "Чернетка",
  "filed": "Подано",
  "in-review": "На розгляді",
  "satisfied": "Задоволено",
  "partial": "Задоволено частково",
  "rejected": "Відмовлено",
};

// Демо-сутності для нової моделі (мінімум, щоб UI Eтапу 2 мав з чим працювати).
// Прив'язані до audit-10 (документальна позапланова, оскаржена).
export const demoActs: TaxAct[] = [
  {
    id: "act-10",
    parentAuditId: "audit-10",
    number: "АКТ-ДПП-2024-0112",
    issuedDate: "2024-06-15",
    servedDate: "2024-06-17",
    objectionDeadline: "2024-07-01", // 10 р.д. з 17.06
    status: "ppr-issued",
    additionalTax: 28000,
    documentFlowId: "doc-fop-act-10",
  },
];

export const demoPPRs: TaxPPR[] = [
  {
    id: "ppr-10",
    parentAuditId: "audit-10",
    parentActId: "act-10",
    number: "ППР-2024-0089",
    form: "Р",
    issuedDate: "2024-06-25",
    servedDate: "2024-06-27",
    agreementDeadline: "2024-07-11", // 10 р.д. з 27.06
    appealAdminDeadline: "2024-07-11",
    status: "appeal-court",
    principalAmount: 20000,
    fineAmount: 5000,
    penaltyAmount: 3000,
    totalAmount: 28000,
    documentFlowId: "doc-fop-ppr-10",
  },
];

export const demoAppeals: TaxAppeal[] = [
  {
    id: "appeal-10-1",
    parentAuditId: "audit-10",
    parentPprId: "ppr-10",
    instance: "admin-regional",
    step: 0,
    number: "СКР-2024-0042",
    filedDate: "2024-07-01",
    filingDeadline: "2024-07-11",
    reviewDeadline: "2024-07-31",
    status: "rejected",
    disputedAmount: 28000,
    decision: "Скаргу залишено без задоволення",
    decisionDate: "2024-07-18",
  },
  {
    id: "appeal-10-2",
    parentAuditId: "audit-10",
    parentPprId: "ppr-10",
    instance: "court-first",
    step: 2,
    number: "СПР-2024-0017",
    filedDate: "2024-07-20",
    filingDeadline: "2027-06-27", // 1095 днів з вручення ППР
    status: "in-review",
    disputedAmount: 28000,
  },
];

export const getActById = (id: string): TaxAct | undefined =>
  demoActs.find((a) => a.id === id);

export const getPPRById = (id: string): TaxPPR | undefined =>
  demoPPRs.find((p) => p.id === id);

export const getAppealById = (id: string): TaxAppeal | undefined =>
  demoAppeals.find((a) => a.id === id);

export const getAppealsForAudit = (auditId: string): TaxAppeal[] =>
  demoAppeals
    .filter((a) => a.parentAuditId === auditId)
    .sort((a, b) => a.step - b.step);

export const getActForAudit = (auditId: string): TaxAct | undefined =>
  demoActs.find((a) => a.parentAuditId === auditId);

export const getPPRForAudit = (auditId: string): TaxPPR | undefined =>
  demoPPRs.find((p) => p.parentAuditId === auditId);



// Отримати перевірки в які включено документ
export const getAuditsForDocument = (documentId: string): TaxAudit[] => {
  return demoAudits.filter(audit => 
    audit.documents?.some(doc => doc.documentFlowId === documentId)
  );
};

// Отримати активні перевірки (для вибору в AddToAuditPackageSheet)
export const getActiveAudits = (): TaxAudit[] => {
  return demoAudits.filter(a => !["completed", "appealed"].includes(a.status));
};
