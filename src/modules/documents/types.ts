/**
 * Document Hub — universal types for centralized document registry.
 *
 * Horizontal layer: serves Business (Orders/CRM/Audits/Payments) AND Personal
 * (contracts/warranties/receipts). Replaces scattered per-domain attachments.
 *
 * Lifecycle: draft → review → signed → archived. Versions are immutable;
 * each upload creates a new DocumentVersion. Signatures live on the version,
 * not the entity (so re-signing a corrected v2 doesn't invalidate v1 history).
 */

export type DocumentKind =
  | "contract"
  | "act"
  | "invoice"
  | "quote"
  | "declaration"
  | "report"
  | "kep_signed"
  | "passport_scan"
  | "warranty"
  | "receipt"
  | "other";

export type DocumentStatus =
  | "draft"
  | "review"
  | "signed"
  | "archived"
  | "rejected";

export type DocumentLinkKind =
  | "deal"
  | "account"
  | "order"
  | "fulfillment"
  | "payment"
  | "audit"
  | "declaration"
  | "task"
  | "contractor"
  | "booking"
  | "personal_property"
  | "income_record";

export interface DocumentLink {
  kind: DocumentLinkKind;
  entityId: string;
  /** Display label for breadcrumb / drill ("Замовлення №12") */
  label?: string;
}

export type SignatureProvider =
  | "kep"
  | "dia"
  | "mock_demo"
  | "external";

export interface DocumentSignature {
  id: string;
  provider: SignatureProvider;
  signerName: string;
  signerEdrpouOrIpn?: string;
  signedAt: string;
  /** Reference to signed_documents row when persisted via kep-sign edge */
  signedDocumentId?: string;
  isDemo?: boolean;
}

export interface DocumentVersion {
  id: string;
  versionNumber: number;
  uploadedAt: string;
  uploadedBy: string;
  fileName: string;
  fileSizeBytes: number;
  mimeType: string;
  /** URL or storage key (demo: data URL / blob ref) */
  storageRef?: string;
  /** AI-derived summary (optional) */
  aiSummary?: string;
  signatures: DocumentSignature[];
  changeNote?: string;
}

export interface DocumentEntity {
  id: string;
  cabinetId: string;
  kind: DocumentKind;
  title: string;
  status: DocumentStatus;
  createdAt: string;
  updatedAt: string;
  ownerId: string;
  /** Latest version is versions[versions.length-1] */
  versions: DocumentVersion[];
  links: DocumentLink[];
  tags?: string[];
  /** Optional pointer to active approval request */
  approvalRequestId?: string;
  /** When approved/signed: which version is canonical */
  canonicalVersionId?: string;
}

/**
 * ApprovalRequest — lives logically in Workflow module (Epic 3), but
 * declared here so Document Hub can reference it without circular dep.
 * Workflow engine re-exports the canonical type.
 */
export type ApprovalStatus =
  | "pending"
  | "in_review"
  | "approved"
  | "rejected"
  | "cancelled";

export interface ApprovalStep {
  id: string;
  order: number;
  approverUserId: string;
  approverName: string;
  status: "pending" | "approved" | "rejected" | "skipped";
  decidedAt?: string;
  comment?: string;
}

export interface ApprovalRequest {
  id: string;
  cabinetId: string;
  documentId: string;
  documentVersionId: string;
  status: ApprovalStatus;
  createdAt: string;
  createdBy: string;
  steps: ApprovalStep[];
  /** "all_sequential" requires every step in order; "any_parallel" — any one approves */
  routeKind: "all_sequential" | "any_parallel";
  note?: string;
}

export interface DocumentFilter {
  kind?: DocumentKind | "all";
  status?: DocumentStatus | "all";
  linkedEntityKind?: DocumentLinkKind;
  linkedEntityId?: string;
  ownerId?: string;
  search?: string;
}

export function latestVersion(doc: DocumentEntity): DocumentVersion | null {
  return doc.versions.length ? doc.versions[doc.versions.length - 1] : null;
}

export function isSigned(doc: DocumentEntity): boolean {
  const v = latestVersion(doc);
  return !!v && v.signatures.length > 0;
}
