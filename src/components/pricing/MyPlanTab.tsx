import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SubscriptionStatusCard } from "./SubscriptionStatusCard";
import { FinancialHistoryCard } from "./FinancialHistoryCard";
import { useCreditForecast } from "@/hooks/useCreditForecast";
import {
  demoUserSubscription,
  demoBillingHistory,
  demoCreditUsageHistory,
  type CreditUsageEntry,
  type CreditUsageCategory,
} from "@/config/pricingData";
import { supabase } from "@/integrations/supabase/client";
import { useCreditTransactions, type CreditTransaction } from "@/hooks/useCreditTransactions";
import { useCreditWallet } from "@/hooks/useCreditWallet";
import { OPERATION_CATALOG } from "@/config/operationCatalog";
import { BudgetConstructor } from "@/components/billing/BudgetConstructor";

interface MyPlanTabProps {
  onSwitchToPlans?: () => void;
}

// ── Map ai_credit_transactions → CreditUsageEntry ────────────────────
function operationCategory(opType: string): CreditUsageCategory {
  const op = OPERATION_CATALOG[opType];
  if (!op) return "other";
  if (op.id.includes("recognize") || op.id.includes("document")) return "document";
  if (op.id.includes("report") || op.id.includes("analytics")) return "report";
  if (op.id.includes("sign")) return "signature";
  if (op.id.includes("chat") || op.id.includes("advice") || op.id.includes("ai"))
    return "ai_session";
  return "other";
}

function txnToEntry(t: CreditTransaction): CreditUsageEntry {
  const op = OPERATION_CATALOG[t.operation_type];
  return {
    id: t.id,
    date: t.created_at,
    category: operationCategory(t.operation_type),
    description: op?.label ?? t.operation_type,
    amount: -Math.abs(t.credits_spent),
    cabinetId: t.cabinet_id ?? undefined,
  };
}

export const MyPlanTab = ({ onSwitchToPlans }: MyPlanTabProps) => {
  const navigate = useNavigate();
  const [subscription, setSubscription] = useState(demoUserSubscription);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
  }, []);

  const { data: wallet } = useCreditWallet("user", userId);
  const { data: txns } = useCreditTransactions(
    wallet ? { walletId: wallet.id, limit: 200 } : {},
  );

  const realEntries = useMemo<CreditUsageEntry[]>(
    () => (txns && txns.length > 0 ? txns.map(txnToEntry) : []),
    [txns],
  );
  const usageEntries =
    realEntries.length > 0 ? realEntries : demoCreditUsageHistory;

  const forecast = useCreditForecast(subscription, usageEntries);

  const handleChangePlan = () => {
    if (onSwitchToPlans) onSwitchToPlans();
    else navigate("/change-plan");
  };
  const handleTopUp = () => navigate("/top-up");
  const handleToggleAutoRenew = (enabled: boolean) =>
    setSubscription((p) => ({ ...p, autoRenew: enabled }));
  const handleCancelSubscription = () =>
    setSubscription((p) => ({ ...p, status: "cancelled" as const, autoRenew: false }));
  const handleReactivate = () =>
    setSubscription((p) => ({ ...p, status: "active" as const, autoRenew: true }));

  const billingItems = demoBillingHistory.map((item) => ({
    ...item,
    plan: item.plan ?? undefined,
  }));

  return (
    <div className="space-y-6">
      <SubscriptionStatusCard
        subscription={subscription}
        onChangePlan={handleChangePlan}
        onTopUp={handleTopUp}
        onToggleAutoRenew={handleToggleAutoRenew}
        onCancelSubscription={handleCancelSubscription}
        onReactivate={handleReactivate}
      />

      <BudgetConstructor currentPlanId={subscription.planId} />

      <FinancialHistoryCard
        billingItems={billingItems}
        creditUsageEntries={usageEntries}
      />
    </div>
  );
};
