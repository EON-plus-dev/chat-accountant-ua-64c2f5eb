import { DocumentType } from "./documentFlowConfig";

// ============================================
// AUDIT ACTIONS
// ============================================

export type AuditAction =
  | "created"
  | "edited"
  | "status-changed"
  | "signed"
  | "sent"
  | "received"
  | "paid"
  | "archived"
  | "cancelled"
  | "viewed"
  | "downloaded"
  | "printed"
  | "shared"
  | "version-created"
  | "version-restored"
  | "field-changed"
  | "permission-changed"
  | "kep-verified"
  | "hash-chain-verified"
  | "retention-warning"
  | "gdpr-export"
  | "assigned"
  | "tags-changed"
  | "note-added";

// ============================================
// INTERFACES
// ============================================

// Field change detail for version history
export interface FieldChangeDetail {
  fieldName: string;
  fieldLabel: string;
  previousValue: string;
  newValue: string;
}

export interface DocumentVersion {
  id: string;
  versionNumber: number;
  versionLabel: string;
  createdAt: string;
  createdBy: string;
  createdByRole?: string;
  changeDescription: string;
  fieldsChanged: string[];
  // Content snapshot for diff-view
  contentSnapshot?: string;
  // Extended metadata for detailed view
  changeDetails?: FieldChangeDetail[];
  editCount?: number;
  linesAdded?: number;
  linesRemoved?: number;
  source?: "manual" | "auto-save" | "import" | "restore";
}

// Labels for version source
export const versionSourceLabels: Record<string, string> = {
  "manual": "Вручну",
  "auto-save": "Авто",
  "import": "Імпорт",
  "restore": "Відновлено"
};

export interface AuditEntry {
  id: string;
  documentId: string;
  timestamp: string;
  action: AuditAction;
  actor: string;
  actorRole?: string;
  fieldName?: string;
  previousValue?: string;
  newValue?: string;
  ipAddress?: string;
  ipMasked?: string;
  comment?: string;
  // Compliance fields
  hashPrevious?: string;
  hashCurrent?: string;
  timestampTSA?: string;
  tsaProvider?: string;
  certificateSerial?: string;
  certificateIssuer?: string;
}

// ============================================
// LABELS
// ============================================

export const auditActionLabels: Record<AuditAction, string> = {
  created: "Створено",
  edited: "Відредаговано",
  "status-changed": "Змінено статус",
  signed: "Підписано КЕП",
  sent: "Відправлено",
  received: "Отримано",
  paid: "Оплачено",
  archived: "Архівовано",
  cancelled: "Скасовано",
  viewed: "Переглянуто",
  downloaded: "Завантажено",
  printed: "Надруковано",
  shared: "Поділено доступ",
  "version-created": "Створено версію",
  "version-restored": "Відновлено версію",
  "field-changed": "Змінено поле",
  "permission-changed": "Змінено права",
  "kep-verified": "Верифіковано КЕП",
  "hash-chain-verified": "Перевірено ланцюжок",
  "retention-warning": "Попередження зберігання",
  "gdpr-export": "GDPR експорт",
  assigned: "Призначено відповідального",
  "tags-changed": "Змінено теги",
  "note-added": "Додано примітку",
};

export const fieldLabels: Record<string, string> = {
  amount: "Сума",
  dueDate: "Термін оплати",
  title: "Назва",
  contractor: "Контрагент",
  status: "Статус",
  number: "Номер",
  description: "Опис",
};

// ============================================
// VERSION DIFF SUMMARY (AI-like summary)
// ============================================

export const generateVersionDiffSummary = (
  currentVersion: DocumentVersion,
  previousVersion?: DocumentVersion
): string => {
  if (!previousVersion) {
    return "Перша версія документа";
  }
  
  const changes: string[] = [];
  
  currentVersion.fieldsChanged.forEach(field => {
    const label = fieldLabels[field] || field;
    changes.push(label);
  });
  
  if (changes.length === 0) {
    return "Незначні зміни форматування";
  }
  
  return `Змінено: ${changes.join(", ")}`;
};

// ============================================
// DEMO DATA - VERSIONS
// ============================================

const generateDemoVersions = (documentId: string): DocumentVersion[] => {
  const baseDate = new Date();
  
  return [
    {
      id: `v-${documentId}-3`,
      versionNumber: 3,
      versionLabel: "v1.2",
      createdAt: baseDate.toISOString(),
      createdBy: "Олена Шевченко",
      createdByRole: "Бухгалтер",
      changeDescription: "Оновлено суму та термін оплати",
      fieldsChanged: ["amount", "dueDate"],
      source: "manual",
      editCount: 3,
      linesAdded: 2,
      linesRemoved: 1,
      changeDetails: [
        {
          fieldName: "amount",
          fieldLabel: "Сума",
          previousValue: "5 000,00 ₴",
          newValue: "6 500,00 ₴"
        },
        {
          fieldName: "dueDate",
          fieldLabel: "Термін оплати",
          previousValue: "15.01.2025",
          newValue: "20.01.2025"
        }
      ],
      contentSnapshot: `РАХУНОК-ФАКТУРА №INV-2025-042
Дата: 15.01.2025

ПОСТАЧАЛЬНИК:
ФОП Іванов Іван Іванович
ЄДРПОУ: 1234567890
IBAN: UA213223130000026007233566001

ПОКУПЕЦЬ:
ТОВ «Гамма»
ЄДРПОУ: 9876543210

ПОСЛУГИ:
1. Консультаційні послуги - 6 500,00 ₴

РАЗОМ: 6 500,00 ₴
ПДВ: 1 083,33 ₴
ДО СПЛАТИ: 7 800,00 ₴

Термін оплати: 20.01.2025`,
    },
    {
      id: `v-${documentId}-2`,
      versionNumber: 2,
      versionLabel: "v1.1",
      createdAt: new Date(baseDate.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      createdBy: "Іван Петренко",
      createdByRole: "Менеджер",
      changeDescription: "Змінено контрагента",
      fieldsChanged: ["contractor"],
      source: "manual",
      editCount: 1,
      linesAdded: 1,
      linesRemoved: 1,
      changeDetails: [
        {
          fieldName: "contractor",
          fieldLabel: "Контрагент",
          previousValue: "ТОВ «Бета»",
          newValue: "ТОВ «Гамма»"
        }
      ],
      contentSnapshot: `РАХУНОК-ФАКТУРА №INV-2025-042
Дата: 10.01.2025

ПОСТАЧАЛЬНИК:
ФОП Іванов Іван Іванович
ЄДРПОУ: 1234567890
IBAN: UA213223130000026007233566001

ПОКУПЕЦЬ:
ТОВ «Гамма»
ЄДРПОУ: 9876543210

ПОСЛУГИ:
1. Консультаційні послуги - 5 000,00 ₴

РАЗОМ: 5 000,00 ₴
ПДВ: 833,33 ₴
ДО СПЛАТИ: 6 000,00 ₴

Термін оплати: 15.01.2025`,
    },
    {
      id: `v-${documentId}-1`,
      versionNumber: 1,
      versionLabel: "v1.0",
      createdAt: new Date(baseDate.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      createdBy: "Іван Петренко",
      createdByRole: "Менеджер",
      changeDescription: "Документ створено",
      fieldsChanged: [],
      source: "manual",
      editCount: 0,
      linesAdded: 24,
      linesRemoved: 0,
      contentSnapshot: `РАХУНОК-ФАКТУРА №INV-2025-042
Дата: 08.01.2025

ПОСТАЧАЛЬНИК:
ФОП Іванов Іван Іванович
ЄДРПОУ: 1234567890
IBAN: UA213223130000026007233566001

ПОКУПЕЦЬ:
ТОВ «Бета»
ЄДРПОУ: 1111111111

ПОСЛУГИ:
1. Консультаційні послуги - 5 000,00 ₴

РАЗОМ: 5 000,00 ₴
ПДВ: 833,33 ₴
ДО СПЛАТИ: 6 000,00 ₴

Термін оплати: 15.01.2025`,
    },
  ];
};

// ============================================
// DEMO DATA - AUDIT ENTRIES
// ============================================

const generateDemoAuditEntries = (documentId: string): AuditEntry[] => {
  const baseDate = new Date();
  
  return [
    {
      id: `a-${documentId}-10`,
      documentId,
      timestamp: baseDate.toISOString(),
      action: "viewed",
      actor: "Марія Коваленко",
      actorRole: "Аудитор",
      ipAddress: "192.168.1.105",
    },
    {
      id: `a-${documentId}-9`,
      documentId,
      timestamp: new Date(baseDate.getTime() - 30 * 60 * 1000).toISOString(),
      action: "downloaded",
      actor: "Олена Шевченко",
      actorRole: "Бухгалтер",
      ipAddress: "192.168.1.42",
    },
    {
      id: `a-${documentId}-8`,
      documentId,
      timestamp: new Date(baseDate.getTime() - 2 * 60 * 60 * 1000).toISOString(),
      action: "field-changed",
      actor: "Олена Шевченко",
      actorRole: "Бухгалтер",
      fieldName: "amount",
      previousValue: "5 000 ₴",
      newValue: "6 500 ₴",
      ipAddress: "192.168.1.42",
    },
    {
      id: `a-${documentId}-7`,
      documentId,
      timestamp: new Date(baseDate.getTime() - 2.5 * 60 * 60 * 1000).toISOString(),
      action: "field-changed",
      actor: "Олена Шевченко",
      actorRole: "Бухгалтер",
      fieldName: "dueDate",
      previousValue: "15.01.2025",
      newValue: "20.01.2025",
      ipAddress: "192.168.1.42",
    },
    {
      id: `a-${documentId}-6`,
      documentId,
      timestamp: new Date(baseDate.getTime() - 3 * 60 * 60 * 1000).toISOString(),
      action: "version-created",
      actor: "Олена Шевченко",
      actorRole: "Бухгалтер",
      comment: "v1.2 - Оновлено суму",
      ipAddress: "192.168.1.42",
    },
    {
      id: `a-${documentId}-5`,
      documentId,
      timestamp: new Date(baseDate.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      action: "signed",
      actor: "Петро Мельник",
      actorRole: "Директор",
      comment: "КЕП: ТОВ «Альфа»",
      ipAddress: "192.168.1.10",
    },
    {
      id: `a-${documentId}-4`,
      documentId,
      timestamp: new Date(baseDate.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      action: "status-changed",
      actor: "Іван Петренко",
      actorRole: "Менеджер",
      fieldName: "status",
      previousValue: "Чернетка",
      newValue: "На підпис",
      ipAddress: "192.168.1.25",
    },
    {
      id: `a-${documentId}-3`,
      documentId,
      timestamp: new Date(baseDate.getTime() - 2 * 24 * 60 * 60 * 1000 - 30 * 60 * 1000).toISOString(),
      action: "field-changed",
      actor: "Іван Петренко",
      actorRole: "Менеджер",
      fieldName: "contractor",
      previousValue: "ТОВ «Бета»",
      newValue: "ТОВ «Гамма»",
      ipAddress: "192.168.1.25",
    },
    {
      id: `a-${documentId}-2`,
      documentId,
      timestamp: new Date(baseDate.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      action: "printed",
      actor: "Іван Петренко",
      actorRole: "Менеджер",
      ipAddress: "192.168.1.25",
    },
    {
      id: `a-${documentId}-1`,
      documentId,
      timestamp: new Date(baseDate.getTime() - 7 * 24 * 60 * 60 * 1000 - 10 * 60 * 1000).toISOString(),
      action: "created",
      actor: "Іван Петренко",
      actorRole: "Менеджер",
      comment: "Створено на основі шаблону",
      ipAddress: "192.168.1.25",
    },
  ];
};

// ============================================
// GETTERS
// ============================================

export const getVersionsForDocument = (documentId: string): DocumentVersion[] => {
  return generateDemoVersions(documentId);
};

export const getAuditForDocument = (documentId: string): AuditEntry[] => {
  return generateDemoAuditEntries(documentId);
};

// ============================================
// HELPERS
// ============================================

export const formatAuditTimestamp = (timestamp: string): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return "Щойно";
  if (diffMins < 60) return `${diffMins} хв тому`;
  if (diffHours < 24) return `${diffHours} год тому`;
  if (diffDays < 7) return `${diffDays} дн тому`;

  return date.toLocaleDateString("uk-UA", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const formatVersionDate = (timestamp: string): string => {
  const date = new Date(timestamp);
  return date.toLocaleDateString("uk-UA", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// ============================================
// VERSION MANAGEMENT (DEMO)
// ============================================

export interface ChangedFieldInfo {
  fieldName: string;
  fieldLabel: string;
  previousValue: string;
  newValue: string;
}

export const addVersionToDocument = (
  documentId: string,
  changeDescription: string,
  changedFields: ChangedFieldInfo[],
  currentVersion: number = 1
): DocumentVersion => {
  const newVersion: DocumentVersion = {
    id: `v-${documentId}-${currentVersion + 1}`,
    versionNumber: currentVersion + 1,
    versionLabel: `v${Math.floor((currentVersion + 1) / 10) || 1}.${(currentVersion + 1) % 10}`,
    createdAt: new Date().toISOString(),
    createdBy: "Поточний користувач",
    createdByRole: "Менеджер",
    changeDescription,
    fieldsChanged: changedFields.map(f => f.fieldName),
  };

  // In production, this would save to database
  if (import.meta.env.DEV) console.log("[Demo] Created new version:", newVersion);
  
  return newVersion;
};

export const addAuditEntry = (
  documentId: string,
  action: AuditAction,
  details?: {
    fieldName?: string;
    previousValue?: string;
    newValue?: string;
    comment?: string;
  }
): AuditEntry => {
  const entry: AuditEntry = {
    id: `a-${documentId}-${Date.now()}`,
    documentId,
    timestamp: new Date().toISOString(),
    action,
    actor: "Поточний користувач",
    actorRole: "Менеджер",
    ipAddress: "192.168.1.1",
    ...details,
  };

  // In production, this would save to database
  if (import.meta.env.DEV) console.log("[Demo] Created audit entry:", entry);
  
  return entry;
};
