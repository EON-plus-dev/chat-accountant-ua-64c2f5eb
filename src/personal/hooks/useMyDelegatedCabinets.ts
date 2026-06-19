import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { DelegationContract } from "@/hooks/useDelegationContracts";

export interface DelegatedCabinetRow {
  cabinetId: string;
  contractKind: DelegationContract["contract_kind"];
  validFrom: string;
  validUntil: string | null;
  contractId: string;
}

/**
 * Список чужих кабінетів, у яких поточний користувач є делегатом
 * (через активний delegation_contract).
 */
export function useMyDelegatedCabinets() {
  return useQuery({
    queryKey: ["my-delegated-cabinets"],
    queryFn: async (): Promise<DelegatedCabinetRow[]> => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return [];
      const { data, error } = await supabase
        .from("delegation_contracts")
        .select("id, cabinet_id, contract_kind, valid_from, valid_until, status")
        .eq("delegate_user_id", u.user.id)
        .eq("status", "active")
        .order("valid_from", { ascending: false });
      if (error) throw error;
      return (data ?? []).map((row: any) => ({
        cabinetId: row.cabinet_id,
        contractKind: row.contract_kind,
        validFrom: row.valid_from,
        validUntil: row.valid_until,
        contractId: row.id,
      }));
    },
  });
}

export const CONTRACT_KIND_LABELS: Record<DelegationContract["contract_kind"], string> = {
  services: "Послуги (бухгалтер / консультант)",
  employment: "Трудові відносини",
  partner_outsourcing: "Партнерський аутсорсинг",
};
