// Frontend wrapper for the `kep-sign` edge function.
import { supabase } from "@/integrations/supabase/client";

export type SignatureStatus =
  | "pending" | "sent" | "signed" | "failed" | "expired" | "cancelled";

export interface InitSignArgs {
  cabinetId?: string;
  documentKind: string;
  documentId: string;
  documentHash: string;
  signerUserId: string;
  signerRole: "cabinet_owner" | "delegate" | "employee";
}

export async function initKepSign(args: InitSignArgs) {
  const { data, error } = await supabase.functions.invoke("kep-sign", {
    body: { action: "init", cabinet_id: args.cabinetId, document_kind: args.documentKind,
      document_id: args.documentId, document_hash: args.documentHash,
      signer_user_id: args.signerUserId, signer_role: args.signerRole },
  });
  if (error) throw error;
  return data;
}

export async function autoKepSign(args: {
  contractId: string; cabinetId: string;
  documentKind: string; documentId: string; documentHash: string;
  amountUah?: number; trustedReviewerUserId: string;
}) {
  const { data, error } = await supabase.functions.invoke("kep-sign", {
    body: { action: "auto", contract_id: args.contractId, cabinet_id: args.cabinetId,
      document_kind: args.documentKind, document_id: args.documentId,
      document_hash: args.documentHash, amount_uah: args.amountUah,
      trusted_reviewer_user_id: args.trustedReviewerUserId },
  });
  if (error) throw error;
  return data;
}

export async function cancelKepSign(requestId: string) {
  const { data, error } = await supabase.functions.invoke("kep-sign", {
    body: { action: "cancel", request_id: requestId },
  });
  if (error) throw error;
  return data;
}

/** Compute sha-256 hex of a string (canonical document representation). */
export async function sha256Hex(input: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0")).join("");
}
