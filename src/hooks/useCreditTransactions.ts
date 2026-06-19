import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface CreditTransaction {
  id: string;
  wallet_id: string;
  cabinet_id: string | null;
  acting_user_id: string;
  payer_user_id: string | null;
  delegation_kind: string | null;
  delegation_id: string | null;
  operation_type: string;
  credits_spent: number;
  model_used: string | null;
  tokens_in: number | null;
  tokens_out: number | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface CreditTxnFilters {
  walletId?: string;
  cabinetId?: string;
  operationType?: string;
  payerUserId?: string;
  limit?: number;
}

export function useCreditTransactions(filters: CreditTxnFilters = {}) {
  return useQuery({
    queryKey: ["ai_credit_transactions", filters],
    queryFn: async () => {
      let q = supabase
        .from("ai_credit_transactions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(filters.limit ?? 100);
      if (filters.walletId) q = q.eq("wallet_id", filters.walletId);
      if (filters.cabinetId) q = q.eq("cabinet_id", filters.cabinetId);
      if (filters.operationType) q = q.eq("operation_type", filters.operationType);
      if (filters.payerUserId) q = q.eq("payer_user_id", filters.payerUserId);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as unknown as CreditTransaction[];
    },
  });
}
