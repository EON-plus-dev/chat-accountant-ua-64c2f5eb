// Universal wrapper for AI calls.
// - Resolves billing wallet via DB (`resolve_billing_wallet`).
// - Determines payer's plan via `get_effective_plan`.
// - Cost: fixed from OPERATION_COSTS catalog, fallback = token estimate × 1.20 margin.
// - Starter plan (`start`): debits user's monthly 300-credit quota (no carry-over).
// - Other plans: debits wallet balance (which receives the included monthly credits at subscription start).
// - Records gross_credits_uah for partner commission accrual.
// Authenticated only.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { OPERATION_COSTS, estimateCreditsFromTokens } from "../_shared/operationCosts.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;

// Plan rates (must mirror src/config/billingModel.ts)
const PLAN_TOPUP_RATE: Record<string, number> = {
  start: 100,
  smart: 125,
  premium: 213,
};
const STARTER_MONTHLY_FREE_CREDITS = 300;

interface Body {
  cabinet_id: string;
  operation_type: string;
  model?: string;
  messages: Array<{ role: string; content: string }>;
  max_tokens?: number;
}

function monthStartIso(): string {
  const d = new Date();
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1))
    .toISOString()
    .slice(0, 10);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "unauthorized" }, 401);

    const sb = createClient(SUPABASE_URL, SERVICE_ROLE, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData } = await sb.auth.getUser();
    const user = userData?.user;
    if (!user) return json({ error: "unauthorized" }, 401);

    const body = (await req.json()) as Body;
    if (!body?.cabinet_id || !body?.operation_type || !Array.isArray(body.messages)) {
      return json({ error: "invalid_body" }, 400);
    }

    const adminSb = createClient(SUPABASE_URL, SERVICE_ROLE);

    // Resolve billing wallet (handles delegation chain)
    const { data: resolved, error: resolveErr } = await adminSb.rpc(
      "resolve_billing_wallet",
      {
        _cabinet_id: body.cabinet_id,
        _acting_user: user.id,
        _operation_type: body.operation_type,
      },
    );
    if (resolveErr) return json({ error: "resolve_failed", detail: resolveErr.message }, 500);
    if (!resolved?.ok) return json({ error: "no_access" }, 403);

    let walletId = resolved.wallet_id as string | null;
    let balance = Number(resolved.balance ?? 0);
    const walletOwnerType = resolved.wallet_owner_type as string;
    const walletOwnerId = resolved.wallet_owner_id as string;

    // Auto-create wallet if missing
    if (!walletId) {
      const { data: created, error: createErr } = await adminSb
        .from("ai_credit_wallets")
        .insert({
          owner_type: walletOwnerType,
          owner_id: walletOwnerId,
          balance_credits: 0,
        })
        .select("id, balance_credits")
        .single();
      if (createErr) return json({ error: "wallet_create_failed", detail: createErr.message }, 500);
      walletId = created.id;
      balance = Number(created.balance_credits);
    }

    // Resolve payer's plan (drives top-up rate + Starter daily quota)
    const payerUserId = resolved.payer_user_id as string;
    let payerPlan = "smart";
    if (payerUserId) {
      const { data: planResp } = await adminSb.rpc("get_effective_plan", {
        _user_id: payerUserId,
      });
      if (typeof planResp === "string" && PLAN_TOPUP_RATE[planResp]) {
        payerPlan = planResp;
      }
    }
    const topUpRate = PLAN_TOPUP_RATE[payerPlan] ?? 125;

    // Determine cost: fixed from catalog OR token-based fallback
    const fixed = OPERATION_COSTS[body.operation_type];
    const model = body.model || fixed?.defaultModel || "google/gemini-2.5-flash";

    // Forward to Lovable AI Gateway
    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: body.messages,
        max_tokens: body.max_tokens ?? 1024,
      }),
    });

    if (!aiResp.ok) {
      const txt = await aiResp.text();
      if (aiResp.status === 429) return json({ error: "rate_limit" }, 429);
      if (aiResp.status === 402) return json({ error: "ai_credits_exhausted" }, 402);
      return json({ error: "ai_error", detail: txt }, 500);
    }
    const aiData = await aiResp.json();
    const usage = aiData.usage ?? {};
    const inTok = Number(usage.prompt_tokens ?? 0);
    const outTok = Number(usage.completion_tokens ?? 0);

    const credits = fixed
      ? Math.round(fixed.cost * 100) / 100
      : estimateCreditsFromTokens(model, inTok, outTok);

    // Equivalent ₴ value of the spend (used for partner commission accrual)
    const grossCreditsUah = Math.round((credits / topUpRate) * 100) / 100;

    let usedDailyQuota = false;
    let usedFreeMonthlyQuota = false;

    // ── Starter monthly quota path (only for user-owned wallets on Start plan)
    if (walletOwnerType === "user" && payerPlan === "start") {
      const { data: w } = await adminSb
        .from("ai_credit_wallets")
        .select("free_quota_used_this_month, free_quota_period_start")
        .eq("id", walletId)
        .single();
      const periodStart = monthStartIso();
      const sameMonth = w?.free_quota_period_start === periodStart;
      const usedThisMonth = sameMonth ? Number(w?.free_quota_used_this_month ?? 0) : 0;

      if (usedThisMonth + credits <= STARTER_MONTHLY_FREE_CREDITS) {
        usedFreeMonthlyQuota = true;
        await adminSb
          .from("ai_credit_wallets")
          .update({
            free_quota_used_this_month: usedThisMonth + credits,
            free_quota_period_start: periodStart,
          })
          .eq("id", walletId);
      }
    }

    // ── Debit balance if neither daily nor free-monthly applies
    if (!usedDailyQuota && !usedFreeMonthlyQuota) {
      if (balance < credits) {
        return json(
          {
            error: "insufficient_balance",
            payer_kind: resolved.payer_kind,
            payer_user_id: resolved.payer_user_id,
            deficit: Math.round((credits - balance) * 100) / 100,
            payer_plan: payerPlan,
          },
          402,
        );
      }
      await adminSb
        .from("ai_credit_wallets")
        .update({ balance_credits: balance - credits })
        .eq("id", walletId);
    }

    // Record transaction (+ gross_credits_uah for partner commission)
    await adminSb.from("ai_credit_transactions").insert({
      wallet_id: walletId,
      cabinet_id: body.cabinet_id,
      acting_user_id: user.id,
      payer_user_id: payerUserId,
      delegation_kind: resolved.delegation_kind,
      delegation_id: resolved.delegation_id,
      operation_type: body.operation_type,
      credits_spent: usedDailyQuota || usedFreeMonthlyQuota ? 0 : credits,
      model_used: model,
      tokens_in: inTok,
      tokens_out: outTok,
      metadata: {
        free_quota: usedDailyQuota || usedFreeMonthlyQuota,
        quota_kind: usedFreeMonthlyQuota ? "starter_monthly" : null,
        gross_credits: credits,
        gross_credits_uah: grossCreditsUah,
        payer_plan: payerPlan,
        cost_source: fixed ? "catalog" : "tokens",
      },
    });

    return json({
      ok: true,
      result: aiData,
      billing: {
        credits_spent: usedDailyQuota || usedFreeMonthlyQuota ? 0 : credits,
        gross_credits: credits,
        gross_credits_uah: grossCreditsUah,
        free_quota_applied: usedDailyQuota || usedFreeMonthlyQuota,
        quota_kind: usedFreeMonthlyQuota ? "starter_monthly" : null,
        payer_kind: resolved.payer_kind,
        payer_plan: payerPlan,
        cost_source: fixed ? "catalog" : "tokens",
      },
    });
  } catch (e) {
    return json({ error: "server_error", detail: String(e) }, 500);
  }
});

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
