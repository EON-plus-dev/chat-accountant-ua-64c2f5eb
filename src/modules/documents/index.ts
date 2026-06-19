export * from "./types";
export { DOCUMENT_KINDS, getDocumentKindMeta, listKindsForAudience } from "./registry/documentKinds";
export { resolveLinkDrillKind, describeLink } from "./registry/linkResolvers";
export {
  useDocuments,
  useDocumentById,
  createDocument,
  patchDocument,
  addVersion,
  addSignature,
  attachDocument,
} from "./store/useDocumentsStore";
export {
  useApprovals,
  createApprovalRequest,
  decideApprovalStep,
} from "./store/useApprovalsStore";
export { requestKepSignature } from "./bridges/kepBridge";
export { attachDocumentToOrder, attachDocumentToFulfillment } from "./bridges/orderBridge";
export { attachDocumentToDeal, attachDocumentToAccount } from "./bridges/crmBridge";
export { DocumentHubPage } from "./components/DocumentHubPage";
export { DocumentDetailSheet } from "./components/DocumentDetailSheet";
