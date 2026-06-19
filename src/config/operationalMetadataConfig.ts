/**
 * Configuration for Operational Metadata - editable management/classification fields
 * These are NOT derived from document content, but assigned by users for workflow management
 * 
 * KEY FEATURES:
 * - Automatic assignment on document creation (getAutoAssignedOperationalData)
 * - Manual editing capability for adjustments
 * - Full display of all fields with placeholders for empty values
 */

import { type DocumentType, type DocumentFlowStatus, type Document } from "./documentFlowConfig";
import { differenceInDays, getQuarter } from "date-fns";

// NOTE: processingStatus was removed - document workflow status is managed automatically
// via DocumentFlowStatus, not through manual operational metadata

// Tag presets with categories (priority tags are mutually exclusive)
export interface TagPreset {
  value: string;
  label: string;
  color: string;
  category: "priority" | "category" | "general";
  priorityLevel?: number; // Lower = more urgent (1 = highest)
}

export const tagPresets: TagPreset[] = [
  // Priority tags (mutually exclusive)
  { value: "urgent", label: "Терміново", color: "bg-destructive/15 text-destructive border-destructive/30", category: "priority", priorityLevel: 1 },
  { value: "high-priority", label: "Високий пріоритет", color: "bg-warning/15 text-warning border-warning/30", category: "priority", priorityLevel: 2 },
  { value: "normal-priority", label: "Звичайний", color: "bg-muted text-muted-foreground border-border", category: "priority", priorityLevel: 3 },
  // Category tags
  { value: "q1-2025", label: "Q1 2025", color: "bg-primary/15 text-primary border-primary/30", category: "category" },
  { value: "q2-2025", label: "Q2 2025", color: "bg-primary/15 text-primary border-primary/30", category: "category" },
  { value: "audit-2024", label: "Аудит 2024", color: "bg-violet-500/15 text-violet-600 border-violet-500/30", category: "category" },
  { value: "tax-reporting", label: "Податкова звітність", color: "bg-violet-500/15 text-violet-600 border-violet-500/30", category: "category" },
  // General tags
  { value: "important", label: "Важливо", color: "bg-amber-500/15 text-amber-600 border-amber-500/30", category: "general" },
  { value: "recurring", label: "Регулярний", color: "bg-blue-500/15 text-blue-600 border-blue-500/30", category: "general" },
  { value: "first-deal", label: "Перша угода", color: "bg-success/15 text-success border-success/30", category: "general" },
  { value: "needs-review", label: "Потребує перегляду", color: "bg-orange-500/15 text-orange-600 border-orange-500/30", category: "general" },
  { value: "archived", label: "Архівний", color: "bg-muted text-muted-foreground border-border", category: "general" },
];

// Get tags by category
export const getTagsByCategory = (category: TagPreset["category"]) => 
  tagPresets.filter(t => t.category === category);

// Demo users for "responsible" field
export const responsibleUsers = [
  { id: "user-1", name: "Іваненко О.В.", role: "Бухгалтер", avatar: "" },
  { id: "user-2", name: "Петренко І.С.", role: "Юрист", avatar: "" },
  { id: "user-3", name: "Мельник А.А.", role: "Менеджер", avatar: "" },
  { id: "user-4", name: "Коваленко М.Д.", role: "Директор", avatar: "" },
] as const;

// Contract-specific prolongation types
export const prolongationTypes = [
  { value: "auto", label: "Автоматична" },
  { value: "manual", label: "За заявою" },
  { value: "none", label: "Без пролонгації" },
] as const;

// Invoice-specific accounting accounts
export const accountingAccounts = [
  { value: "361", label: "361 - Розрахунки з покупцями" },
  { value: "631", label: "631 - Розрахунки з постачальниками" },
  { value: "377", label: "377 - Розрахунки з іншими дебіторами" },
  { value: "685", label: "685 - Розрахунки з іншими кредиторами" },
] as const;

// Tax document ERPR status
export const erprStatusOptions = [
  { value: "not-sent", label: "Не надіслано" },
  { value: "pending", label: "Очікує реєстрації" },
  { value: "registered", label: "Зареєстровано" },
  { value: "rejected", label: "Відхилено" },
] as const;

// Type-specific field definitions
export interface OperationalField {
  id: string;
  label: string;
  type: "select" | "multiselect" | "date" | "text" | "user" | "textarea";
  options?: readonly { value: string; label: string; color?: string }[];
  placeholder?: string;
  applicableTo: DocumentType[] | "all";
  editableInStatuses: DocumentFlowStatus[];
  required?: boolean;
}

// System-wide fields (apply to all document types)
// OPTIMIZED: Removed priority (merged into tags), project (use category tags), and processingStatus (automated)
export const systemWideFields: OperationalField[] = [
  {
    id: "responsible",
    label: "Відповідальний",
    type: "user",
    applicableTo: "all",
    editableInStatuses: ["draft", "pending-sign", "signed", "sent", "confirmed", "registered"],
    placeholder: "Оберіть відповідального",
  },
  {
    id: "tags",
    label: "Теги",
    type: "multiselect",
    options: tagPresets,
    applicableTo: "all",
    editableInStatuses: ["draft", "pending-sign", "signed", "sent", "confirmed", "registered", "archived"],
  },
  {
    id: "internalNote",
    label: "Внутрішня примітка",
    type: "textarea",
    applicableTo: "all",
    editableInStatuses: ["draft", "pending-sign", "signed", "sent", "confirmed", "registered", "archived"],
    placeholder: "Додайте примітку для внутрішнього використання...",
  },
];

// Type-specific fields
// NOTE: prolongationType and reminderDate removed from operational data
// - prolongationType: extracted from document text OR uses cabinet policy (see settingsConfig.ts)
// - reminderDate: automatically calculated from contract end date + policy notice period
export const typeSpecificFields: OperationalField[] = [
  // Invoice-specific
  {
    id: "accountingAccount",
    label: "Рахунок обліку",
    type: "select",
    options: accountingAccounts,
    applicableTo: ["invoice"],
    editableInStatuses: ["draft", "pending-sign", "signed", "sent", "confirmed", "registered"],
  },
  {
    id: "paymentPurpose",
    label: "Призначення платежу",
    type: "text",
    applicableTo: ["invoice"],
    editableInStatuses: ["draft", "pending-sign"],
    placeholder: "Текст призначення платежу",
  },
  // Tax document-specific
  {
    id: "erprStatus",
    label: "Статус ЄРПН",
    type: "select",
    options: erprStatusOptions,
    applicableTo: ["tax-invoice"],
    editableInStatuses: ["signed", "sent", "confirmed", "registered"],
  },
  // HR document-specific
  {
    id: "linkedEmployee",
    label: "Працівник",
    type: "user",
    applicableTo: ["employment-order", "dismissal-order", "vacation-order"],
    editableInStatuses: ["draft"],
    placeholder: "Оберіть працівника",
  },
];

// Get all operational fields for a document type
export const getOperationalFieldsForType = (
  documentType: DocumentType, 
  currentStatus: DocumentFlowStatus
): OperationalField[] => {
  const allFields = [...systemWideFields, ...typeSpecificFields];
  
  return allFields.filter(field => {
    // Check if field applies to this document type
    const appliesToType = field.applicableTo === "all" || field.applicableTo.includes(documentType);
    if (!appliesToType) return false;
    
    // Field is always shown, but editability is determined separately
    return true;
  });
};

// Check if a field is editable for given status
export const isFieldEditable = (field: OperationalField, status: DocumentFlowStatus): boolean => {
  return field.editableInStatuses.includes(status);
};

// Operational data state type
// OPTIMIZED: Removed priority, project, processingStatus (all managed automatically or via tags)
// NOTE: prolongationType and reminderDate removed - managed via cabinet policy + AI extraction
export interface OperationalData {
  responsible?: string;
  tags?: string[];
  internalNote?: string;
  // Type-specific fields (NOT contract prolongation - that's in extracted data + policy)
  accountingAccount?: string;
  paymentPurpose?: string;
  erprStatus?: string;
  linkedEmployee?: string;
}

// Demo operational data for documents
// NOTE: prolongationType and reminderDate removed - managed via policy + extraction
export const demoOperationalData: Record<string, OperationalData> = {
  "doc-contract-1": {
    responsible: "user-1",
    tags: ["high-priority", "first-deal", "q1-2025"],
    internalNote: "Важливий клієнт, потребує особливої уваги",
  },
  "doc-invoice-1": {
    responsible: "user-2",
    tags: ["normal-priority", "recurring", "q1-2025"],
    accountingAccount: "361",
  },
  "doc-act-1": {
    responsible: "user-1",
    tags: [],
  },
};

// Get operational data for a document
export const getOperationalData = (documentId: string): OperationalData => {
  return demoOperationalData[documentId] || {
    tags: [],
  };
};

// ============================================
// AUTOMATIC ASSIGNMENT OF OPERATIONAL DATA
// ============================================

/**
 * Automatically assigns operational data for a new document.
 * Called when a document is loaded and has no existing operational data.
 */
export const getAutoAssignedOperationalData = (
  documentType: DocumentType,
  currentUserId: string = "user-1", // default demo user
  documentData?: {
    amount?: number;
    dueDate?: string;
    contractor?: string;
  }
): OperationalData => {
  const tags: string[] = [];
  
  // Auto-tag by amount (significant amount gets high priority)
  if (documentData?.amount && documentData.amount > 100000) {
    tags.push("high-priority");
  } else {
    tags.push("normal-priority");
  }
  
  // Auto-tag by due date (urgent if within 3 days)
  if (documentData?.dueDate) {
    const daysUntil = differenceInDays(new Date(documentData.dueDate), new Date());
    if (daysUntil >= 0 && daysUntil <= 3) {
      // Replace priority with urgent
      const idx = tags.indexOf("normal-priority");
      if (idx !== -1) tags.splice(idx, 1);
      const highIdx = tags.indexOf("high-priority");
      if (highIdx !== -1) tags.splice(highIdx, 1);
      tags.push("urgent");
    }
  }
  
  // Auto-tag by current quarter
  const quarter = getQuarter(new Date());
  const year = new Date().getFullYear();
  tags.push(`q${quarter}-${year}`);
  
  // Build operational data
  // NOTE: prolongationType removed - uses cabinet policy instead (see settingsConfig.ts)
  const opData: OperationalData = {
    responsible: currentUserId, // Assign to current user by default
    tags,
    internalNote: undefined,
  };
  
  // Type-specific defaults (NOT prolongation - that's handled via policy)
  // Only set accountingAccount for invoices (acts don't manage payment terms)
  if (documentType === "invoice") {
    opData.accountingAccount = "361"; // Default accounting account
  }
  
  return opData;
};

/**
 * Merge auto-assigned data with existing data (existing takes precedence)
 */
export const mergeWithAutoAssigned = (
  existing: OperationalData | undefined,
  documentType: DocumentType,
  documentData?: { amount?: number; dueDate?: string; contractor?: string }
): OperationalData => {
  const auto = getAutoAssignedOperationalData(documentType, "user-1", documentData);
  
  // If no existing data, use auto
  if (!existing || Object.keys(existing).length === 0) {
    return auto;
  }
  
  // Merge: existing takes precedence, but fill in missing fields
  // NOTE: prolongationType and reminderDate removed - use cabinet policy
  return {
    responsible: existing.responsible ?? auto.responsible,
    tags: existing.tags && existing.tags.length > 0 ? existing.tags : auto.tags,
    internalNote: existing.internalNote,
    accountingAccount: existing.accountingAccount ?? auto.accountingAccount,
    paymentPurpose: existing.paymentPurpose,
    erprStatus: existing.erprStatus,
    linkedEmployee: existing.linkedEmployee,
  };
};

// ============================================
// FIELD DISPLAY HELPERS
// ============================================

// Placeholders for empty field values
// NOTE: prolongationType and reminderDate removed - managed via policy
export const fieldPlaceholders: Record<string, string> = {
  responsible: "Не призначено",
  tags: "Без тегів",
  internalNote: "Без примітки",
  accountingAccount: "Не вибрано",
  paymentPurpose: "Не вказано",
  erprStatus: "Не вказано",
  linkedEmployee: "Не вибрано",
};

// Get placeholder for a field
export const getFieldPlaceholder = (fieldId: string): string => {
  return fieldPlaceholders[fieldId] || "—";
};

// Helper: Get priority tag from tags array
export const getPriorityFromTags = (tags: string[] = []): TagPreset | null => {
  const priorityTags = getTagsByCategory("priority");
  const found = tags.find(t => priorityTags.some(pt => pt.value === t));
  return found ? priorityTags.find(pt => pt.value === found) || null : null;
};

// Helper: Get category tags from tags array
export const getCategoryTagsFromTags = (tags: string[] = []): TagPreset[] => {
  const categoryTags = getTagsByCategory("category");
  return tags
    .filter(t => categoryTags.some(ct => ct.value === t))
    .map(t => categoryTags.find(ct => ct.value === t)!)
    .filter(Boolean);
};

// Helper: Get general tags from tags array
export const getGeneralTagsFromTags = (tags: string[] = []): TagPreset[] => {
  const generalTags = getTagsByCategory("general");
  return tags
    .filter(t => generalTags.some(gt => gt.value === t))
    .map(t => generalTags.find(gt => gt.value === t)!)
    .filter(Boolean);
};
