import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getSignatureAuditLogForCabinet, type DemoSignatureAuditEntry } from "@/config/demoSignatureAuditLog";

export interface SignatureAuditEntry {
  id: string;
  cabinet_id: string | null;
  signature_request_id: string | null;
  actor_user_id: string;
  action: string;
  details: Record<string, unknown>;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export interface UseSignatureAuditLogResult {
  data: (SignatureAuditEntry | DemoSignatureAuditEntry)[];
  isLoading: boolean;
  isDemo: boolean;
}

export function useSignatureAuditLog(cabinetId: string | null, limit = 100): UseSignatureAuditLogResult {
  const query = useQuery({
    enabled: !!cabinetId,
    queryKey: ["signature_audit_log", cabinetId, limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("signature_audit_log")
        .select("*")
        .eq("cabinet_id", cabinetId!)
        .order("created_at", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return (data ?? []) as unknown as SignatureAuditEntry[];
    },
  });

  const realData = query.data ?? [];
  const isDemo = !query.isLoading && realData.length === 0 && !!cabinetId;
  const data = isDemo ? getSignatureAuditLogForCabinet(cabinetId!) : realData;

  return {
    data,
    isLoading: query.isLoading,
    isDemo,
  };
}
