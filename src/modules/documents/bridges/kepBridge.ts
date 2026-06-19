/**
 * KEP bridge — connects Document Hub to existing `kep-sign` edge function.
 * Currently a thin facade: in demo mode marks document with mock signature.
 * Production: triggers init → callback flow.
 */
import { addSignature } from "../store/useDocumentsStore";
import type { DocumentEntity, DocumentSignature } from "../types";

export async function requestKepSignature(
  cabinetId: string,
  doc: DocumentEntity,
  signerName: string,
): Promise<DocumentSignature> {
  // TODO: Replace with edge call: supabase.functions.invoke("kep-sign", { body: { action: "init", documentId: doc.id } })
  const version = doc.versions[doc.versions.length - 1];
  if (!version) throw new Error("Документ не має версій");

  const sig: DocumentSignature = {
    id: `sig-${Date.now()}`,
    provider: "mock_demo",
    signerName,
    signedAt: new Date().toISOString(),
    isDemo: true,
  };
  addSignature(cabinetId, doc.id, version.id, sig);
  return sig;
}
