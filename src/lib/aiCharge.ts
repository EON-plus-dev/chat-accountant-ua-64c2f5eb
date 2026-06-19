// Frontend wrapper for the `ai-charge` edge function.
// Use this for ALL AI calls in cabinet contexts so credits are billed correctly.

import { supabase } from "@/integrations/supabase/client";
import { getOperation, isAiOperation } from "@/config/operationCatalog";

export interface AiChargeRequest {
  cabinetId: string;
  /** Must be a key from OPERATION_CATALOG */
  operationType: string;
  model?: string;
  messages: Array<{ role: "system" | "user" | "assistant"; content: string }>;
  maxTokens?: number;
}

export interface AiChargeBilling {
  credits_spent: number;
  free_quota_applied: boolean;
  payer_kind: "cabinet_owner" | "delegate";
}

export interface AiChargeResult {
  ok: true;
  result: any; // OpenAI-compatible response from Lovable AI Gateway
  billing: AiChargeBilling;
}

export interface AiChargeError {
  ok: false;
  error:
    | "unauthorized"
    | "no_access"
    | "insufficient_balance"
    | "rate_limit"
    | "ai_credits_exhausted"
    | "invalid_body"
    | "not_an_ai_operation"
    | "server_error"
    | string;
  payer_kind?: "cabinet_owner" | "delegate";
  payer_user_id?: string;
  deficit?: number;
  detail?: string;
}

export async function aiCharge(
  req: AiChargeRequest
): Promise<AiChargeResult | AiChargeError> {
  // Client-side guard: refuse to bill if op is not AI in catalog.
  if (!isAiOperation(req.operationType)) {
    return {
      ok: false,
      error: "not_an_ai_operation",
      detail: `operation_type='${req.operationType}' is not registered as AI in OPERATION_CATALOG`,
    };
  }
  const op = getOperation(req.operationType);
  const model = req.model ?? op?.defaultModel;

  const { data, error } = await supabase.functions.invoke("ai-charge", {
    body: {
      cabinet_id: req.cabinetId,
      operation_type: req.operationType,
      model,
      messages: req.messages,
      max_tokens: req.maxTokens,
    },
  });
  if (error) {
    return { ok: false, error: "server_error", detail: error.message };
  }
  return data as AiChargeResult | AiChargeError;
}
