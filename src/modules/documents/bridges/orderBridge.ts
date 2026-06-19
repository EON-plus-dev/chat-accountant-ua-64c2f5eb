/**
 * Order bridge — exposes attachDocumentToOrder() helper for Orders module.
 * Thin wrapper around attachDocument() with normalized link payload.
 */
import { attachDocument } from "../store/useDocumentsStore";

export function attachDocumentToOrder(
  cabinetId: string,
  documentId: string,
  orderId: string,
  orderLabel?: string,
) {
  attachDocument(cabinetId, documentId, {
    kind: "order",
    entityId: orderId,
    label: orderLabel,
  });
}

export function attachDocumentToFulfillment(
  cabinetId: string,
  documentId: string,
  fulfillmentId: string,
) {
  attachDocument(cabinetId, documentId, {
    kind: "fulfillment",
    entityId: fulfillmentId,
  });
}
