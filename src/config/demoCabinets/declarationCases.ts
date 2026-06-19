// Demo entity: "Declaration Case" — root entity for individual cabinet (frontend-only, no DB).
// Implements §1.1 reporting_year, §2.3 case statuses, §16 amendments, §5 profile_tags.

export type DeclarationCaseStatus =
  | "draft"
  | "in_review"
  | "reviewed"
  | "pending_user_input"
  | "ready_to_confirm"
  | "confirmed"
  | "submitted"
  | "accepted";

export type FilingStatus =
  | "mandatory"
  | "voluntary"
  | "mandatory_with_addons"
  | "blocked";

export type ResidencyStatus = "resident" | "non_resident" | "pending_review";

export type ProfileTag =
  | "has_foreign_income"
  | "has_kik"
  | "is_investor"
  | "claims_tax_credit"
  | "sold_property"
  | "has_residency_concerns"
  | "received_inheritance";

export interface CaseTrustee {
  id: string;
  email: string;
  name?: string;
  status: "pending" | "active" | "revoked";
  canView: boolean;
  canEdit: boolean;
  canSign: false; // §2: trustee never signs
  invitedAt: string;
  acceptedAt?: string;
}

export interface CaseAuditEntry {
  id: string;
  actorRole: "owner" | "trustee" | "tax_consultant" | "system";
  actorName: string;
  eventType:
    | "field_changed"
    | "document_uploaded"
    | "status_changed"
    | "review_requested"
    | "review_completed"
    | "signed"
    | "submitted"
    | "trustee_invited"
    | "comment";
  fieldPath?: string;
  oldValue?: string;
  newValue?: string;
  reason?: string;
  ip?: string;
  createdAt: string;
}

export interface DeclarationCase {
  id: string;
  cabinetId: string;
  title: string;
  reportingYear: number;
  amendmentOf: string | null;
  amendmentNumber?: number;
  status: DeclarationCaseStatus;
  rulesVersion: string;
  filingStatus: FilingStatus;
  profileTags: ProfileTag[];
  residencyStatus: ResidencyStatus;
  daysAbroad?: number;
  // Progress for UI
  progressPercent: number;
  // Snapshot summary for cards
  totalIncome?: number;
  totalTax?: number;
  totalRefund?: number;
  // Signing
  signedAt?: string;
  signerIp?: string;
  dataHash?: string;
  // Submission
  submittedAt?: string;
  acceptedAt?: string;
  rejectionReason?: string;
  // Review
  consultantName?: string;
  reviewRequestedAt?: string;
  reviewSlaDueAt?: string;
  reviewCompletedAt?: string;
  reviewPriority?: "low" | "normal" | "high" | "critical";
  reviewReason?: string;
  // Collaboration
  trustees: CaseTrustee[];
  auditLog: CaseAuditEntry[];
  createdAt: string;
  updatedAt: string;
}

const nowIso = (offsetDays = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString();
};

export const STATUS_LABELS: Record<DeclarationCaseStatus, string> = {
  draft: "Чернетка",
  in_review: "На перевірці консультанта",
  reviewed: "Перевірено",
  pending_user_input: "Очікує уточнень",
  ready_to_confirm: "Готова до підпису",
  confirmed: "Підписана",
  submitted: "Подана до ДПС",
  accepted: "Прийнято ДПС",
};

export const STATUS_TONE: Record<DeclarationCaseStatus, "neutral" | "warning" | "info" | "success" | "primary"> = {
  draft: "neutral",
  in_review: "info",
  reviewed: "info",
  pending_user_input: "warning",
  ready_to_confirm: "primary",
  confirmed: "primary",
  submitted: "success",
  accepted: "success",
};

export const FILING_STATUS_LABELS: Record<FilingStatus, string> = {
  mandatory: "Обов'язкова",
  voluntary: "Добровільна",
  mandatory_with_addons: "Обов'язкова + додатки",
  blocked: "Заблоковано",
};

export const RESIDENCY_LABELS: Record<ResidencyStatus, string> = {
  resident: "Резидент України",
  non_resident: "Нерезидент",
  pending_review: "Потребує перевірки",
};

export const PROFILE_TAG_LABELS: Record<ProfileTag, string> = {
  has_foreign_income: "Іноземні доходи",
  has_kik: "Контрольовані компанії (КІК)",
  is_investor: "Інвестиційний дохід",
  claims_tax_credit: "Податкова знижка",
  sold_property: "Продаж майна",
  has_residency_concerns: "Питання резидентства",
  received_inheritance: "Спадщина / подарунки",
};

const RULES_VERSION_BY_YEAR: Record<number, string> = {
  2023: "rules-2023-v1.2",
  2024: "rules-2024-v2.0",
  2025: "rules-2025-v1.0",
  2026: "rules-2026-draft",
};

export const rulesVersionForYear = (year: number) =>
  RULES_VERSION_BY_YEAR[year] ?? `rules-${year}-v1.0`;

// Phase 7 audit: тільки роки, що мають сенс у демо.
// 2024 — submitted (історія), 2025 — поточний звітний рік (auto-draft).
// 2023 (accepted) існує як manual case, тому теж покажеться через demoDeclarationCases.
// 2026 не показуємо — звітність за 2026 ще не настала, нема сенсу створювати порожню чернетку.
export const REPORTING_YEARS = [2025, 2024];

// ─── Demo cases ──────────────────────────────────────────────────────────────

export const demoDeclarationCases: DeclarationCase[] = [
  {
    id: "case-2023-submitted",
    cabinetId: "demo-individual-declarant",
    title: "Декларація про майновий стан і доходи",
    reportingYear: 2023,
    amendmentOf: null,
    status: "accepted",
    rulesVersion: rulesVersionForYear(2023),
    filingStatus: "mandatory",
    profileTags: ["is_investor", "claims_tax_credit"],
    residencyStatus: "resident",
    progressPercent: 100,
    totalIncome: 845_000,
    totalTax: 152_100,
    totalRefund: 11_880,
    signedAt: "2024-04-22T09:14:00.000Z",
    signerIp: "demo-127.0.0.1",
    dataHash: "demo-sha256-a3f2e1c8...",
    submittedAt: "2024-04-22T09:18:00.000Z",
    acceptedAt: "2024-04-25T11:32:00.000Z",
    trustees: [],
    auditLog: [
      { id: "a1", actorRole: "owner", actorName: "Власник", eventType: "signed", createdAt: "2024-04-22T09:14:00.000Z", ip: "demo-127.0.0.1" },
      { id: "a2", actorRole: "system", actorName: "Система", eventType: "submitted", createdAt: "2024-04-22T09:18:00.000Z" },
      { id: "a3", actorRole: "system", actorName: "ДПС", eventType: "status_changed", oldValue: "submitted", newValue: "accepted", createdAt: "2024-04-25T11:32:00.000Z" },
    ],
    createdAt: "2024-03-10T08:00:00.000Z",
    updatedAt: "2024-04-25T11:32:00.000Z",
  },
  {
    id: "case-2024-submitted",
    cabinetId: "demo-individual-declarant",
    title: "Декларація про майновий стан і доходи",
    reportingYear: 2024,
    amendmentOf: null,
    status: "submitted",
    rulesVersion: rulesVersionForYear(2024),
    filingStatus: "mandatory_with_addons",
    profileTags: ["is_investor", "has_foreign_income", "claims_tax_credit", "sold_property"],
    residencyStatus: "resident",
    progressPercent: 100,
    totalIncome: 1_472_280,
    totalTax: 264_658,
    totalRefund: 12_600,
    signedAt: "2025-04-18T14:22:00.000Z",
    signerIp: "demo-127.0.0.1",
    dataHash: "demo-sha256-b9c4d2f1...",
    submittedAt: "2025-04-18T14:30:00.000Z",
    trustees: [
      {
        id: "tr-1",
        email: "accountant@example.com",
        name: "Олена Бухгалтер",
        status: "active",
        canView: true,
        canEdit: true,
        canSign: false,
        invitedAt: "2025-03-02T10:00:00.000Z",
        acceptedAt: "2025-03-02T15:24:00.000Z",
      },
    ],
    auditLog: [
      { id: "b1", actorRole: "trustee", actorName: "Олена Бухгалтер", eventType: "document_uploaded", fieldPath: "documents/ibkr-statement-2024.pdf", createdAt: "2025-03-15T11:00:00.000Z" },
      { id: "b2", actorRole: "owner", actorName: "Власник", eventType: "signed", createdAt: "2025-04-18T14:22:00.000Z", ip: "demo-127.0.0.1" },
      { id: "b3", actorRole: "system", actorName: "Система", eventType: "submitted", createdAt: "2025-04-18T14:30:00.000Z" },
    ],
    createdAt: "2025-02-12T09:00:00.000Z",
    updatedAt: "2025-04-18T14:30:00.000Z",
  },
  // ⚠ Кейси 2025/2026 не зашиваємо у демо-дані вручну.
  // Вони генеруються автоматично через ensureDraftDeclarationForYear()
  // на основі реальних даних модулів кабінету (Книга доходів, Фін.моніторинг,
  // Інвестиції, КІК). Це і є архітектурний принцип системи: декларація — похідна
  // функція від transactional state, а не результат заповнення анкети.
];

export const getDeclarationCaseById = (id: string) =>
  demoDeclarationCases.find((c) => c.id === id);

export const getDeclarationCasesForCabinet = (cabinetId: string) =>
  demoDeclarationCases.filter((c) => c.cabinetId === cabinetId);

export const getOriginalCase = (caseItem: DeclarationCase) =>
  caseItem.amendmentOf ? getDeclarationCaseById(caseItem.amendmentOf) : null;
