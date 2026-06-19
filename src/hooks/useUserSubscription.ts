import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getPlan, PLANS, type PlanId, type BillingPlan } from "@/config/billingModel";

export interface UserSubscription {
  id: string;
  user_id: string;
  plan_id: PlanId;
  period_start: string;
  period_end: string;
  scheduled_plan_id: PlanId | null;
  scheduled_at: string | null;
  source: string;
  status: string;
}

export interface UseUserSubscriptionResult {
  subscription: UserSubscription | null;
  /** Effective plan = scheduled plan if period elapsed, else current plan_id */
  plan: BillingPlan;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

/**
 * Reads the user's tariff subscription. Falls back to "start" if user is not signed in.
 * Effective plan auto-switches to scheduled_plan_id once period_end has passed.
 */
export function useUserSubscription(): UseUserSubscriptionResult {
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) {
        setSubscription(null);
        return;
      }
      const { data, error: err } = await supabase
        .from("user_subscriptions")
        .select(
          "id, user_id, plan_id, period_start, period_end, scheduled_plan_id, scheduled_at, source, status",
        )
        .eq("user_id", auth.user.id)
        .maybeSingle();
      if (err) throw err;
      setSubscription((data as UserSubscription) || null);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const planId: PlanId =
    !subscription
      ? "start"
      : subscription.scheduled_plan_id &&
        new Date(subscription.period_end).getTime() <= Date.now()
        ? subscription.scheduled_plan_id
        : (subscription.plan_id as PlanId);

  return {
    subscription,
    plan: getPlan(planId) || PLANS.start,
    loading,
    error,
    refresh: load,
  };
}
