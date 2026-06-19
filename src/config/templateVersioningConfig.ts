/**
 * Template Versioning Configuration
 * 
 * Provides types and demo data for template version history.
 * Aligned with documentVersioningConfig.ts patterns.
 */

import { format } from "date-fns";
import { uk } from "date-fns/locale";

// ============================================
// TYPES
// ============================================

export type TemplateVersionChangeType = 
  | "field-added" 
  | "field-removed" 
  | "field-modified" 
  | "formula-changed" 
  | "layout-changed"
  | "text-updated";

export interface TemplateVersionChange {
  type: TemplateVersionChangeType;
  fieldKey?: string;
  fieldLabel?: string;
  previousValue?: string;
  newValue?: string;
}

export interface TemplateVersion {
  id: string;
  versionNumber: number;
  versionLabel: string;
  createdAt: string;
  createdBy: string;
  createdByRole?: string;
  changeDescription: string;
  source?: "manual" | "auto-save" | "import" | "restore";
  // Template-specific metrics
  fieldsAdded: number;
  fieldsRemoved: number;
  fieldsModified: number;
  editCount?: number;
  // Detailed changes
  changes?: TemplateVersionChange[];
  // Content snapshot for diff view
  contentSnapshot?: string;
}

export interface TemplateAuditEntry {
  id: string;
  templateId: string;
  timestamp: string;
  action: TemplateAuditAction;
  actor: string;
  actorRole?: string;
  details?: string;
  previousValue?: string;
  newValue?: string;
}

export type TemplateAuditAction =
  | "created"
  | "edited"
  | "version-created"
  | "version-restored"
  | "field-added"
  | "field-removed"
  | "field-modified"
  | "formula-changed"
  | "published"
  | "archived"
  | "duplicated"
  | "ai-suggestion-applied"
  | "ai-suggestion-rejected";

// ============================================
// LABELS
// ============================================

export const templateSourceLabels: Record<string, string> = {
  "manual": "Ручна",
  "auto-save": "Авто",
  "import": "Імпорт",
  "restore": "Відновлено"
};

export const templateChangeTypeLabels: Record<TemplateVersionChangeType, string> = {
  "field-added": "Додано поле",
  "field-removed": "Видалено поле",
  "field-modified": "Змінено поле",
  "formula-changed": "Змінено формулу",
  "layout-changed": "Змінено макет",
  "text-updated": "Оновлено текст",
};

export const templateAuditActionLabels: Record<TemplateAuditAction, string> = {
  created: "Створено",
  edited: "Відредаговано",
  "version-created": "Створено версію",
  "version-restored": "Відновлено версію",
  "field-added": "Додано поле",
  "field-removed": "Видалено поле",
  "field-modified": "Змінено поле",
  "formula-changed": "Змінено формулу",
  published: "Опубліковано",
  archived: "Архівовано",
  duplicated: "Дубльовано",
  "ai-suggestion-applied": "AI-пропозицію прийнято",
  "ai-suggestion-rejected": "AI-пропозицію відхилено",
};

// ============================================
// FORMATTERS
// ============================================

export const formatTemplateVersionDate = (timestamp: string): string => {
  return format(new Date(timestamp), "d MMM yyyy, HH:mm", { locale: uk });
};

export const formatTemplateRelativeDate = (timestamp: string): string => {
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

  return format(date, "d MMM yyyy", { locale: uk });
};

// ============================================
// DEMO DATA GENERATOR
// ============================================

export const getVersionsForTemplate = (templateId: string): TemplateVersion[] => {
  const baseDate = new Date();
  
  return [
    {
      id: `tv-${templateId}-3`,
      versionNumber: 3,
      versionLabel: "v1.2",
      createdAt: new Date(baseDate.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      createdBy: "Олена Коваленко",
      createdByRole: "Бухгалтер",
      changeDescription: "Оновлено формулу розрахунку ПДВ",
      source: "manual",
      fieldsAdded: 0,
      fieldsRemoved: 0,
      fieldsModified: 1,
      editCount: 3,
      changes: [
        {
          type: "formula-changed",
          fieldKey: "pdv",
          fieldLabel: "ПДВ",
          previousValue: "{{сума}} * 0.2",
          newValue: "{{сума}} * 0.2 / 1.2"
        }
      ],
      contentSnapshot: `РАХУНОК-ФАКТУРА №{{номер}}
Дата: {{дата}}

ПОСТАЧАЛЬНИК:
{{постачальник.назва}}
ЄДРПОУ: {{постачальник.єдрпоу}}
IBAN: {{постачальник.iban}}

ПОКУПЕЦЬ:
{{покупець.назва}}
ЄДРПОУ: {{покупець.єдрпоу}}

ПОСЛУГИ:
{{#позиції}}
{{номер}}. {{назва}} - {{сума}} ₴
{{/позиції}}

РАЗОМ: {{сума}} ₴
ПДВ: {{пдв}} ₴
ДО СПЛАТИ: {{доСплати}} ₴

Термін оплати: {{термінОплати}}`,
    },
    {
      id: `tv-${templateId}-2`,
      versionNumber: 2,
      versionLabel: "v1.1",
      createdAt: new Date(baseDate.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      createdBy: "Максим Петренко",
      createdByRole: "Менеджер",
      changeDescription: "Додано поле 'Примітки'",
      source: "manual",
      fieldsAdded: 1,
      fieldsRemoved: 0,
      fieldsModified: 0,
      editCount: 1,
      changes: [
        {
          type: "field-added",
          fieldKey: "notes",
          fieldLabel: "Примітки",
          newValue: "Текстове поле"
        }
      ],
      contentSnapshot: `РАХУНОК-ФАКТУРА №{{номер}}
Дата: {{дата}}

ПОСТАЧАЛЬНИК:
{{постачальник.назва}}
ЄДРПОУ: {{постачальник.єдрпоу}}
IBAN: {{постачальник.iban}}

ПОКУПЕЦЬ:
{{покупець.назва}}
ЄДРПОУ: {{покупець.єдрпоу}}

ПОСЛУГИ:
{{#позиції}}
{{номер}}. {{назва}} - {{сума}} ₴
{{/позиції}}

РАЗОМ: {{сума}} ₴
ПДВ: {{сума}} * 0.2 ₴
ДО СПЛАТИ: {{доСплати}} ₴

Термін оплати: {{термінОплати}}`,
    },
    {
      id: `tv-${templateId}-1`,
      versionNumber: 1,
      versionLabel: "v1.0",
      createdAt: new Date(baseDate.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      createdBy: "Система",
      createdByRole: "Система",
      changeDescription: "Початкова версія шаблону",
      source: "manual",
      fieldsAdded: 12,
      fieldsRemoved: 0,
      fieldsModified: 0,
      editCount: 0,
      changes: [],
      contentSnapshot: `РАХУНОК-ФАКТУРА №{{номер}}
Дата: {{дата}}

ПОСТАЧАЛЬНИК:
{{постачальник.назва}}
ЄДРПОУ: {{постачальник.єдрпоу}}
IBAN: {{постачальник.iban}}

ПОКУПЕЦЬ:
{{покупець.назва}}
ЄДРПОУ: {{покупець.єдрпоу}}

ПОСЛУГИ:
{{#позиції}}
{{номер}}. {{назва}} - {{сума}} ₴
{{/позиції}}

РАЗОМ: {{сума}} ₴
ПДВ: {{пдв}} ₴
ДО СПЛАТИ: {{доСплати}} ₴`,
    },
  ];
};

export const getAuditForTemplate = (templateId: string): TemplateAuditEntry[] => {
  const baseDate = new Date();
  
  return [
    {
      id: `ta-${templateId}-5`,
      templateId,
      timestamp: new Date(baseDate.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      action: "version-created",
      actor: "Олена Коваленко",
      actorRole: "Бухгалтер",
      details: "v1.2 — Оновлено формулу ПДВ",
    },
    {
      id: `ta-${templateId}-4`,
      templateId,
      timestamp: new Date(baseDate.getTime() - 2 * 24 * 60 * 60 * 1000 - 30 * 60 * 1000).toISOString(),
      action: "formula-changed",
      actor: "Олена Коваленко",
      actorRole: "Бухгалтер",
      details: "Поле: ПДВ",
      previousValue: "{{сума}} * 0.2",
      newValue: "{{сума}} * 0.2 / 1.2",
    },
    {
      id: `ta-${templateId}-3`,
      templateId,
      timestamp: new Date(baseDate.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      action: "version-created",
      actor: "Максим Петренко",
      actorRole: "Менеджер",
      details: "v1.1 — Додано поле 'Примітки'",
    },
    {
      id: `ta-${templateId}-2`,
      templateId,
      timestamp: new Date(baseDate.getTime() - 7 * 24 * 60 * 60 * 1000 - 15 * 60 * 1000).toISOString(),
      action: "field-added",
      actor: "Максим Петренко",
      actorRole: "Менеджер",
      details: "Поле: Примітки (текстове)",
    },
    {
      id: `ta-${templateId}-1`,
      templateId,
      timestamp: new Date(baseDate.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      action: "created",
      actor: "Система",
      details: "Шаблон створено на основі системного шаблону",
    },
  ];
};

// ============================================
// HELPERS
// ============================================

export const generateVersionDiffSummary = (
  current: TemplateVersion,
  previous?: TemplateVersion
): string => {
  if (!previous) {
    return "Перша версія шаблону";
  }
  
  const parts: string[] = [];
  
  if (current.fieldsAdded > 0) {
    parts.push(`+${current.fieldsAdded} полів`);
  }
  if (current.fieldsRemoved > 0) {
    parts.push(`-${current.fieldsRemoved} полів`);
  }
  if (current.fieldsModified > 0) {
    parts.push(`~${current.fieldsModified} змінено`);
  }
  
  if (parts.length === 0) {
    return "Незначні зміни тексту";
  }
  
  return parts.join(", ");
};
