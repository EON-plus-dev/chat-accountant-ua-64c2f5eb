import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type DelegationContractKind = "services" | "employment" | "partner_outsourcing";
export type DelegationContractStatus = "draft" | "pending_sign" | "active" | "terminated";

export interface DelegationContract {
  id: string;
  cabinet_id: string;
  cabinet_owner_user_id: string;
  delegate_kind: "partner_company" | "individual";
  delegate_user_id: string;
  contract_kind: DelegationContractKind;
  contract_number: string | null;
  signed_at: string | null;
  valid_from: string;
  valid_until: string | null;
  file_url: string | null;
  service_fee_terms: string | null;
  terms: { allow_payer_override?: boolean } & Record<string, unknown>;
  status: DelegationContractStatus;
  created_at: string;
  updated_at: string;
}

export function useCabinetDelegationContracts(cabinetId: string | null) {
  return useQuery({
    enabled: !!cabinetId,
    queryKey: ["delegation_contracts", cabinetId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("delegation_contracts")
        .select("*")
        .eq("cabinet_id", cabinetId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as DelegationContract[];
    },
  });
}
