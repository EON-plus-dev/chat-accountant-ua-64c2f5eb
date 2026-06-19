import type { DocumentKind } from "../types";
import {
  FileText,
  FileSignature,
  Receipt,
  FileCheck2,
  ScrollText,
  ShieldCheck,
  IdCard,
  Wrench,
  FileBadge,
  FileQuestion,
  File,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface DocumentKindMeta {
  id: DocumentKind;
  label: string;
  shortLabel: string;
  icon: LucideIcon;
  /** Whether this kind typically requires KEP signature */
  requiresSignature: boolean;
  /** Audience: business-only, personal-only, both */
  audience: "business" | "personal" | "both";
}

export const DOCUMENT_KINDS: Record<DocumentKind, DocumentKindMeta> = {
  contract: { id: "contract", label: "Договір", shortLabel: "Договір", icon: FileSignature, requiresSignature: true, audience: "both" },
  act: { id: "act", label: "Акт виконаних робіт", shortLabel: "Акт", icon: FileCheck2, requiresSignature: true, audience: "business" },
  invoice: { id: "invoice", label: "Рахунок-фактура", shortLabel: "Рахунок", icon: Receipt, requiresSignature: false, audience: "business" },
  quote: { id: "quote", label: "Комерційна пропозиція", shortLabel: "КП", icon: ScrollText, requiresSignature: false, audience: "business" },
  declaration: { id: "declaration", label: "Декларація", shortLabel: "Декл.", icon: FileBadge, requiresSignature: true, audience: "both" },
  report: { id: "report", label: "Звіт", shortLabel: "Звіт", icon: FileText, requiresSignature: true, audience: "business" },
  kep_signed: { id: "kep_signed", label: "Підписаний КЕП", shortLabel: "КЕП", icon: ShieldCheck, requiresSignature: false, audience: "both" },
  passport_scan: { id: "passport_scan", label: "Скан паспорта/ID", shortLabel: "ID", icon: IdCard, requiresSignature: false, audience: "personal" },
  warranty: { id: "warranty", label: "Гарантійний талон", shortLabel: "Гарантія", icon: Wrench, requiresSignature: false, audience: "personal" },
  receipt: { id: "receipt", label: "Чек / квитанція", shortLabel: "Чек", icon: Receipt, requiresSignature: false, audience: "personal" },
  other: { id: "other", label: "Інше", shortLabel: "Інше", icon: FileQuestion, requiresSignature: false, audience: "both" },
};

export function getDocumentKindMeta(kind: DocumentKind): DocumentKindMeta {
  return DOCUMENT_KINDS[kind] ?? { id: "other", label: "Інше", shortLabel: "Інше", icon: File, requiresSignature: false, audience: "both" };
}

export function listKindsForAudience(audience: "business" | "personal"): DocumentKindMeta[] {
  return Object.values(DOCUMENT_KINDS).filter(
    (m) => m.audience === audience || m.audience === "both",
  );
}
