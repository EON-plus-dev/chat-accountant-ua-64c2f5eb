import type { LucideIcon } from "lucide-react";
import {
  FileText,
  FileSearch,
  AlertCircle,
  HelpCircle,
  ClipboardCheck,
  Bell,
  FileWarning,
  Scale,
  Mail,
  Inbox,
} from "lucide-react";

// Канал отримання документа від ДПС
// dps-cabinet — Електронний кабінет платника податків
// dps-api — пряма інтеграція з API ДПС
export type DpsChannel = "dps-cabinet" | "dps-api";

// Типи вхідних документів від ДПС
export type EdoDocumentType = 
  | "audit-order"           // Наказ про перевірку
  | "audit-notification"    // Повідомлення про перевірку
  | "audit-request"         // Запит від інспектора
  | "audit-act"             // Акт перевірки
  | "audit-decision"        // Рішення за результатами
  | "tax-notice"            // Податкове повідомлення-рішення
  | "info-letter"           // Інформаційний лист
  | "other";

// Статуси обробки вхідних документів
export type EdoDocumentStatus = "new" | "processing" | "processed" | "rejected" | "archived";

// Вкладення до документа
export interface EdoAttachment {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  signedBy?: string;
  signedAt?: string;
  downloadUrl?: string;
}

// Вхідний документ від ДПС (надходить напряму з Електронного кабінету ДПС
// або через API ДПС — без сторонніх ЕДО-посередників)
export interface EdoIncomingDocument {
  id: string;
  channel?: DpsChannel;
  documentType: EdoDocumentType;
  receivedAt: string;
  registrationNumber: string;
  senderName: string;           // Назва відправника (ДПІ)
  senderCode: string;           // ЄДРПОУ відправника
  subject: string;
  content?: string;             // Текст документа
  attachments: EdoAttachment[];
  relatedAuditId?: string;      // Зв'язок з існуючою перевіркою
  status: EdoDocumentStatus;
  processedAt?: string;
  processedBy?: string;
  processedAction?: "created-audit" | "added-request" | "info-only" | "rejected";
  createdAuditId?: string;
  deadlineDate?: string;        // Дедлайн відповіді (якщо є)
}

// Конфігурація типів документів ЕДО
export const edoDocumentTypeConfig: Record<EdoDocumentType, { 
  label: string; 
  description: string; 
  icon: LucideIcon;
  color: string;
  priority: "high" | "medium" | "low";
}> = {
  "audit-order": {
    label: "Наказ про перевірку",
    description: "Наказ ДПС про призначення податкової перевірки",
    icon: FileText,
    color: "text-red-600 bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-800",
    priority: "high",
  },
  "audit-notification": {
    label: "Повідомлення про перевірку",
    description: "Попереднє повідомлення про проведення перевірки",
    icon: Bell,
    color: "text-orange-600 bg-orange-50 dark:bg-orange-950/50 border-orange-200 dark:border-orange-800",
    priority: "high",
  },
  "audit-request": {
    label: "Запит від інспектора",
    description: "Запит про надання документів або пояснень",
    icon: HelpCircle,
    color: "text-amber-600 bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800",
    priority: "high",
  },
  "audit-act": {
    label: "Акт перевірки",
    description: "Акт з результатами проведеної перевірки",
    icon: ClipboardCheck,
    color: "text-purple-600 bg-purple-50 dark:bg-purple-950/50 border-purple-200 dark:border-purple-800",
    priority: "high",
  },
  "audit-decision": {
    label: "Рішення за результатами",
    description: "Рішення ДПС за результатами перевірки",
    icon: Scale,
    color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-950/50 border-indigo-200 dark:border-indigo-800",
    priority: "high",
  },
  "tax-notice": {
    label: "Податкове повідомлення-рішення",
    description: "ППР з донарахуваннями або штрафами",
    icon: FileWarning,
    color: "text-red-600 bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-800",
    priority: "high",
  },
  "info-letter": {
    label: "Інформаційний лист",
    description: "Інформаційне повідомлення від ДПС",
    icon: Mail,
    color: "text-blue-600 bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800",
    priority: "low",
  },
  "other": {
    label: "Інший документ",
    description: "Документ іншого типу",
    icon: FileSearch,
    color: "text-slate-600 bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800",
    priority: "medium",
  },
};

// Конфігурація статусів ЕДО документів
export const edoStatusConfig: Record<EdoDocumentStatus, { 
  label: string; 
  color: string;
  icon: LucideIcon;
}> = {
  "new": {
    label: "Новий",
    color: "text-blue-600 bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800",
    icon: Inbox,
  },
  "processing": {
    label: "Обробляється",
    color: "text-amber-600 bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800",
    icon: FileSearch,
  },
  "processed": {
    label: "Оброблено",
    color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800",
    icon: ClipboardCheck,
  },
  "rejected": {
    label: "Відхилено",
    color: "text-red-600 bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-800",
    icon: AlertCircle,
  },
  "archived": {
    label: "Архів",
    color: "text-slate-600 bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800",
    icon: FileText,
  },
};

// Канал отримання — для службових цілей (звідки прийшов документ).
// На UI відображається єдиним нейтральним бейджем «ДПС».
export const dpsChannelConfig: Record<DpsChannel, { label: string; description: string }> = {
  "dps-cabinet": {
    label: "Електронний кабінет ДПС",
    description: "Документ надійшов в Електронний кабінет платника податків",
  },
  "dps-api": {
    label: "API ДПС",
    description: "Документ отримано через пряму інтеграцію з API ДПС",
  },
};

// ========== ДЕМО-ДАНІ ==========

export const demoEdoIncomingDocuments: EdoIncomingDocument[] = [
  // 1. Повідомлення про нову перевірку
  {
    id: "edo-001",
    documentType: "audit-notification",
    receivedAt: "2024-12-18T10:30:00",
    registrationNumber: "ПВ-2024-12345",
    senderName: "ДПІ у Шевченківському районі м. Києва",
    senderCode: "43141267",
    subject: "Повідомлення про проведення документальної планової перевірки",
    content: `Шановний платнику податків!

Повідомляємо, що відповідно до п. 77.4 ст. 77 Податкового кодексу України, наказом ГУ ДПС у м. Києві №ДП-2024-0200 від 15.12.2024 призначено документальну планову виїзну перевірку.

Період перевірки: 01.01.2024 - 30.09.2024
Орієнтовна дата початку: 10.01.2025
Тривалість: до 10 робочих днів

Перевірка буде проведена за адресою: м. Київ, вул. Хрещатик, 1

Інспектор: Петренко Олена Василівна
Контактний телефон: +380 44 123 45 67`,
    attachments: [
      { 
        id: "att-1", 
        fileName: "Наказ_ДП-2024-0200.pdf", 
        fileType: "application/pdf", 
        fileSize: 125000,
        signedBy: "Коваленко І.М., начальник ДПІ",
        signedAt: "2024-12-15T14:30:00",
      },
      { 
        id: "att-2", 
        fileName: "Повідомлення_ПВ-2024-12345.pdf", 
        fileType: "application/pdf", 
        fileSize: 89000,
        signedBy: "Коваленко І.М., начальник ДПІ",
        signedAt: "2024-12-15T14:35:00",
      },
    ],
    status: "new",
    deadlineDate: "2025-01-10",
  },

  // 2. Запит від інспектора (прив'язаний до audit-2)
  {
    id: "edo-002",
    documentType: "audit-request",
    receivedAt: "2024-12-17T14:15:00",
    registrationNumber: "ЗАП-2024-789",
    senderName: "ДПІ у Шевченківському районі м. Києва",
    senderCode: "43141267",
    subject: "Запит про надання документів до перевірки №ДП-2024-0156",
    content: `В рамках проведення документальної планової виїзної перевірки (наказ №ДП-2024-0156 від 15.11.2024) просимо надати наступні документи:

1. Книгу обліку доходів за жовтень-листопад 2024 року
2. Банківські виписки по всіх рахунках за жовтень-листопад 2024 року
3. Договори з контрагентами, за якими здійснювались операції у звітному періоді
4. Акти виконаних робіт / надання послуг за жовтень-листопад 2024 року
5. Первинні документи, що підтверджують витрати

Термін надання: до 15.01.2025

У разі ненадання документів будуть застосовані положення п. 121.1 ст. 121 ПКУ.

Інспектор: Петренко О.В.`,
    attachments: [
      { 
        id: "att-3", 
        fileName: "Запит_ЗАП-2024-789.pdf", 
        fileType: "application/pdf", 
        fileSize: 67000,
        signedBy: "Петренко О.В., головний державний ревізор-інспектор",
        signedAt: "2024-12-17T14:00:00",
      },
    ],
    relatedAuditId: "audit-2",
    status: "processed",
    processedAt: "2024-12-17T15:00:00",
    processedBy: "Іванов П.С.",
    processedAction: "added-request",
    deadlineDate: "2025-01-15",
  },

  // 3. Інформаційний лист
  {
    id: "edo-003",
    documentType: "info-letter",
    receivedAt: "2024-12-16T09:45:00",
    registrationNumber: "ІЛ-2024-4521",
    senderName: "ГУ ДПС у м. Києві",
    senderCode: "43141231",
    subject: "Про зміни в оподаткуванні ФОП у 2025 році",
    content: `Шановний платнику!

Інформуємо про основні зміни в оподаткуванні фізичних осіб-підприємців, що набувають чинності з 01.01.2025:

1. Підвищення мінімальної заробітної плати до 8000 грн
2. Новий розмір єдиного внеску
3. Зміни в термінах подання звітності

Детальна інформація на сайті: tax.gov.ua`,
    attachments: [
      { 
        id: "att-4", 
        fileName: "Інформаційний_лист.pdf", 
        fileType: "application/pdf", 
        fileSize: 234000,
      },
    ],
    status: "processed",
    processedAt: "2024-12-16T10:30:00",
    processedAction: "info-only",
  },

  // 4. Акт перевірки (прив'язаний до audit-3)
  {
    id: "edo-004",
    documentType: "audit-act",
    receivedAt: "2024-12-15T16:20:00",
    registrationNumber: "АКТ-2024-0089",
    senderName: "ДПІ у Шевченківському районі м. Києва",
    senderCode: "43141267",
    subject: "Акт перевірки №АКТ-ДПП-2024-0089",
    content: `Акт документальної позапланової виїзної перевірки
ФОП Коваленко Олексій Петрович
РНОКПП: 1234567890

За результатами перевірки встановлено порушення:
- Заниження доходу на суму 42 500 грн
- Донараховано податок: 8 500 грн
- Штрафні санкції: 4 000 грн

Загальна сума до сплати: 12 500 грн

Термін оскарження: до 30.10.2024`,
    attachments: [
      { 
        id: "att-5", 
        fileName: "Акт_АКТ-2024-0089.pdf", 
        fileType: "application/pdf", 
        fileSize: 456000,
        signedBy: "Ковальчук М.І., головний державний ревізор-інспектор",
        signedAt: "2024-09-30T16:00:00",
      },
    ],
    relatedAuditId: "audit-3",
    status: "processed",
    processedAt: "2024-12-15T17:00:00",
    processedAction: "added-request",
    deadlineDate: "2024-10-30",
  },

  // 5. Наказ про фактичну перевірку (НОВИЙ - терміновий!)
  {
    id: "edo-005",
    documentType: "audit-order",
    receivedAt: "2024-12-22T11:00:00",
    registrationNumber: "НК-2024-9876",
    senderName: "ГУ ДПС у м. Києві",
    senderCode: "43141231",
    subject: "Наказ про проведення фактичної перевірки застосування РРО",
    content: `НАКАЗ

Про проведення фактичної перевірки

Відповідно до підпункту 80.2.2 пункту 80.2 статті 80 Податкового кодексу України НАКАЗУЮ:

1. Провести фактичну перевірку ФОП Коваленко О.П. з метою контролю за дотриманням законодавства про застосування реєстраторів розрахункових операцій.

2. Перевірку здійснити за адресою провадження діяльності: м. Київ, вул. Велика Васильківська, 45

Термін перевірки: 1 робочий день`,
    attachments: [
      { 
        id: "att-6", 
        fileName: "Наказ_НК-2024-9876.pdf", 
        fileType: "application/pdf", 
        fileSize: 98000,
        signedBy: "Мельник В.А., заступник начальника ГУ ДПС",
        signedAt: "2024-12-22T10:30:00",
      },
    ],
    relatedAuditId: "audit-5",
    status: "new",
    deadlineDate: "2024-12-23",
  },

  // 6. НОВИЙ: Терміновий запит для audit-7 (прострочений!)
  {
    id: "edo-006",
    documentType: "audit-request",
    receivedAt: "2024-12-21T09:00:00",
    registrationNumber: "ЗАП-2024-999",
    senderName: "ДПІ у Печерському районі м. Києва",
    senderCode: "43141268",
    subject: "ТЕРМІНОВО: Додаткові документи до перевірки №ДПП-2024-0234",
    content: `ТЕРМІНОВИЙ ЗАПИТ

В рамках проведення документальної позапланової перевірки (наказ №ДПП-2024-0234) просимо ТЕРМІНОВО надати:

1. Пояснення щодо операції з ТОВ «Дельта» на суму 45 000 грн
2. Копії платіжних доручень
3. Акти звірки взаєморозрахунків

УВАГА: Термін надання документів ПРОСТРОЧЕНО!
Початковий дедлайн: 10.12.2024

У разі ненадання документів протягом 3 робочих днів будуть застосовані штрафні санкції.

Інспектор: Бондаренко Н.О.
Тел.: +380 44 456 78 90`,
    attachments: [
      { 
        id: "att-7", 
        fileName: "Терміновий_запит_ЗАП-2024-999.pdf", 
        fileType: "application/pdf", 
        fileSize: 54000,
        signedBy: "Бондаренко Н.О., головний державний ревізор-інспектор",
        signedAt: "2024-12-21T08:45:00",
      },
    ],
    relatedAuditId: "audit-7",
    status: "new",
    deadlineDate: "2024-12-24",
  },

  // 7. НОВИЙ: Повідомлення про камеральну перевірку
  {
    id: "edo-007",
    documentType: "audit-notification",
    receivedAt: "2024-12-20T14:30:00",
    registrationNumber: "КАМ-ПВ-2024-456",
    senderName: "ДПІ у Подільському районі м. Києва",
    senderCode: "43141269",
    subject: "Повідомлення про камеральну перевірку декларації ЄП",
    content: `Шановний платнику!

Повідомляємо, що відповідно до ст. 76 Податкового кодексу України розпочато камеральну перевірку вашої податкової декларації платника єдиного податку за IV квартал 2024 року.

Виявлено розбіжність:
- Сума в декларації: 125 000 грн
- Сума за даними банку: 132 500 грн
- Різниця: 7 500 грн

Прошу надати пояснення щодо виявленої розбіжності протягом 5 робочих днів.

Автоматична система контролю ДПС`,
    attachments: [
      { 
        id: "att-8", 
        fileName: "Повідомлення_КАМ-ПВ-2024-456.pdf", 
        fileType: "application/pdf", 
        fileSize: 78000,
      },
    ],
    relatedAuditId: "audit-4",
    status: "new",
    deadlineDate: "2024-12-27",
  },

  // 8. НОВИЙ: ППР (Податкове повідомлення-рішення) для audit-8
  {
    id: "edo-008",
    documentType: "tax-notice",
    receivedAt: "2024-12-19T10:00:00",
    registrationNumber: "ППР-2024-0654",
    senderName: "ДПІ у Подільському районі м. Києва",
    senderCode: "43141269",
    subject: "Податкове повідомлення-рішення №ППР-2024-0654",
    content: `ПОДАТКОВЕ ПОВІДОМЛЕННЯ-РІШЕННЯ

Відповідно до результатів камеральної перевірки декларації платника єдиного податку за II квартал 2024 року (акт №АКТ-КАМ-2024-0654 від 10.08.2024) ПОВІДОМЛЯЄМО:

1. Встановлено заниження податкового зобов'язання на суму 4 000 грн
2. Нараховано штрафні санкції у розмірі 1 000 грн
3. Загальна сума до сплати: 5 000 грн

Термін сплати: 30 днів з дати отримання даного повідомлення-рішення.

У разі незгоди з даним рішенням, Ви маєте право оскаржити його в адміністративному або судовому порядку.`,
    attachments: [
      { 
        id: "att-9", 
        fileName: "ППР_2024-0654.pdf", 
        fileType: "application/pdf", 
        fileSize: 156000,
        signedBy: "Савченко П.І., начальник відділу",
        signedAt: "2024-08-15T15:00:00",
      },
      { 
        id: "att-10", 
        fileName: "Розрахунок_штрафних_санкцій.xlsx", 
        fileType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", 
        fileSize: 24000,
      },
    ],
    relatedAuditId: "audit-8",
    status: "processed",
    processedAt: "2024-12-19T11:30:00",
    processedAction: "info-only",
  },
];

// Утиліти
export const getNewEdoDocumentsCount = (documents: EdoIncomingDocument[]): number =>
  documents.filter(d => d.status === "new").length;

export const getHighPriorityEdoDocuments = (documents: EdoIncomingDocument[]): EdoIncomingDocument[] =>
  documents.filter(d => {
    const typeConfig = edoDocumentTypeConfig[d.documentType];
    return d.status === "new" && typeConfig.priority === "high";
  });

export const getEdoDocumentsByStatus = (
  documents: EdoIncomingDocument[], 
  status: EdoDocumentStatus
): EdoIncomingDocument[] => documents.filter(d => d.status === status);

export const getEdoDocumentTypeLabel = (type: EdoDocumentType): string => 
  edoDocumentTypeConfig[type].label;

export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const getUrgentEdoDocumentsCount = (documents: EdoIncomingDocument[]): number => {
  const now = new Date();
  return documents.filter(d => {
    if (d.status !== "new" || !d.deadlineDate) return false;
    const deadline = new Date(d.deadlineDate);
    const daysUntil = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntil <= 3;
  }).length;
};
