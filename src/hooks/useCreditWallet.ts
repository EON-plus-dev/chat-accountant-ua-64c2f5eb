import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type WalletOwnerType = "user" | "cabinet" | "partner_company";

export interface CreditWallet {
  id: string;
  owner_type: WalletOwnerType;
  owner_id: string;
  balance_credits: number;
  low_balance_threshold: number;
  auto_topup_enabled: boolean;
  free_quota_used_this_month: number;
  free_quota_period_start: string;
}

const FREE_MONTHLY_CAP = 200;

export function useCreditWallet(ownerType: WalletOwnerType, ownerId: string | null) {
  return useQuery({
    enabled: !!ownerId,
    queryKey: ["ai_credit_wallet", ownerType, ownerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ai_credit_wallets")
        .select("*")
        .eq("owner_type", ownerType)
        .eq("owner_id", ownerId!)
        .maybeSingle();
      if (error) throw error;
      return (data ?? null) as unknown as CreditWallet | null;
    },
  });
}

export function freeQuotaRemaining(wallet: CreditWallet | null | undefined): number {
  if (!wallet || wallet.owner_type !== "user") return 0;
  const start = new Date(wallet.free_quota_period_start);
  const now = new Date();
  const sameMonth =
    start.getUTCFullYear() === now.getUTCFullYear() &&
    start.getUTCMonth() === now.getUTCMonth();
  const used = sameMonth ? wallet.free_quota_used_this_month : 0;
  return Math.max(0, FREE_MONTHLY_CAP - used);
}

export const FREE_TIER_MONTHLY_CAP = FREE_MONTHLY_CAP;
