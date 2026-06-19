import { attachDocument } from "../store/useDocumentsStore";

export function attachDocumentToDeal(
  cabinetId: string,
  documentId: string,
  dealId: string,
  dealLabel?: string,
) {
  attachDocument(cabinetId, documentId, { kind: "deal", entityId: dealId, label: dealLabel });
}

export function attachDocumentToAccount(
  cabinetId: string,
  documentId: string,
  accountId: string,
  accountLabel?: string,
) {
  attachDocument(cabinetId, documentId, { kind: "account", entityId: accountId, label: accountLabel });
}
