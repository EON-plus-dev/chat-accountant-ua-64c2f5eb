import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Sparkles, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  freeQuotaRemaining,
  FREE_TIER_MONTHLY_CAP,
  type CreditWallet,
} from "@/hooks/useCreditWallet";

interface Props {
  cabinetId: string;
}

interface ResolvedBilling {
  ok: boolean;
  wallet_id: string | null;
  wallet_owner_type: "user" | "cabinet" | "partner_company";
  wallet_owner_id: string;
  balance: number;
  payer_kind: "cabinet_owner" | "delegate";
  payer_user_id: string;
  cabinet_owner_user_id: string;
}

/** Header badge: shows AI-credit balance for the wallet that pays for THIS cabinet. */
export function CreditsBadge({ cabinetId }: Props) {
  const [resolved, setResolved] = useState<ResolvedBilling | null>(null);
  const [wallet, setWallet] = useState<CreditWallet | null>(null);
  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) {
        setLoading(false);
        return;
      }
      setMe(u.user.id);
      const { data: rbRaw } = await supabase.rpc("resolve_billing_wallet", {
        _cabinet_id: cabinetId,
        _acting_user: u.user.id,
      });
      const rb = rbRaw as unknown as ResolvedBilling | null;
      if (cancelled || !rb?.ok) {
        setLoading(false);
        return;
      }
      setResolved(rb);
      const { data: w } = await supabase
        .from("ai_credit_wallets")
        .select("*")
        .eq("owner_type", rb.wallet_owner_type)
        .eq("owner_id", rb.wallet_owner_id)
        .maybeSingle();
      if (!cancelled) {
        setWallet((w ?? null) as unknown as CreditWallet | null);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [cabinetId]);

  if (loading) {
    return (
      <Badge variant="outline" className="gap-1">
        <Loader2 className="h-3 w-3 animate-spin" />
      </Badge>
    );
  }
  if (!resolved) return null;

  const isMePaying =
    resolved.payer_kind === "cabinet_owner"
      ? resolved.cabinet_owner_user_id === me
      : resolved.payer_user_id === me;

  const balance = wallet?.balance_credits ?? 0;
  const freeLeft = freeQuotaRemaining(wallet);
  const showsFree = resolved.wallet_owner_type === "user";

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge
          variant={isMePaying ? "default" : "secondary"}
          className="gap-1 cursor-help"
        >
          <Sparkles className="h-3 w-3" />
          {showsFree && freeLeft > 0 ? (
            <span>
              {freeLeft}/{FREE_TIER_MONTHLY_CAP} free
            </span>
          ) : (
            <span>{balance.toFixed(0)} кр.</span>
          )}
        </Badge>
      </TooltipTrigger>
      <TooltipContent>
        <div className="text-xs space-y-1">
          <div>
            Платник:{" "}
            <strong>
              {isMePaying
                ? "Ви"
                : resolved.payer_kind === "cabinet_owner"
                ? "Власник кабінету"
                : "Партнер"}
            </strong>
          </div>
          <div>Баланс: {balance.toFixed(2)} кр.</div>
          {showsFree && <div>Безкоштовний ліміт: {freeLeft} кр./міс</div>}
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
