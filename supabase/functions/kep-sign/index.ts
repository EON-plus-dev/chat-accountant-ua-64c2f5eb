// kep-sign — wrapper for cloud KEP / Дія.Підпис signing flow.
// MOCK provider in this phase. Real КНЕДП integration is wired in once
// the user adds the provider secret. Interface mirrors Дія DEPS.
//
// Endpoints:
//   POST { action: "init",      ... }  → create signature_request, return deeplink + qr
//   POST { action: "callback",  ... }  → provider posts back signed blob
//   POST { action: "auto",      ... }  → trigger auto-sign if rules permit
//   POST { action: "cancel",    ... }  → cancel a pending request

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const KEP_PROVIDER = Deno.env.get("KEP_PROVIDER") ?? "mock"; // 'diia' | 'kned_<n>' | 'mock'

interface InitBody {
  action: "init";
  cabinet_id?: string;
  document_kind: string;       // 'delegation_contract' | 'tax_declaration' | ...
  document_id: string;
  document_hash: string;       // sha-256 hex of document bytes
  signer_user_id: string;
  signer_role: "cabinet_owner" | "delegate" | "employee";
}
interface CallbackBody {
  action: "callback";
  request_id: string;
  signed_blob_url: string;
  cert_subject?: string;
  failure_reason?: string;
}
interface AutoBody {
  action: "auto";
  contract_id: string;
  cabinet_id: string;
  document_kind: string;
  document_id: string;
  document_hash: string;
  amount_uah?: number;
  trusted_reviewer_user_id: string;
}
interface CancelBody { action: "cancel"; request_id: string; }
type Body = InitBody | CallbackBody | AutoBody | CancelBody;

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
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);
    const ip = req.headers.get("x-forwarded-for") ?? null;
    const ua = req.headers.get("user-agent") ?? null;

    switch (body.action) {
      case "init": return await handleInit(admin, user.id, body, ip, ua);
      case "callback": return await handleCallback(admin, body, ip, ua);
      case "auto": return await handleAuto(admin, user.id, body, ip, ua);
      case "cancel": return await handleCancel(admin, user.id, body, ip, ua);
      default: return json({ error: "invalid_action" }, 400);
    }
  } catch (e) {
    return json({ error: "server_error", detail: String(e) }, 500);
  }
});

async function handleInit(
  admin: ReturnType<typeof createClient>,
  actor: string,
  b: InitBody,
  ip: string | null,
  ua: string | null
) {
  const { data: req, error } = await admin
    .from("signature_requests")
    .insert({
      cabinet_id: b.cabinet_id ?? null,
      document_kind: b.document_kind,
      document_id: b.document_id,
      document_hash: b.document_hash,
      signer_user_id: b.signer_user_id,
      signer_role: b.signer_role,
      provider: KEP_PROVIDER,
      provider_request_id: `mock-${crypto.randomUUID()}`,
      deeplink: `https://diia.app/sign/${crypto.randomUUID()}`,
      qr_payload: `diia://sign?token=${crypto.randomUUID()}`,
      status: "sent",
      initiated_by: actor,
    })
    .select("*")
    .single();
  if (error) return json({ error: "init_failed", detail: error.message }, 500);

  await admin.from("signature_audit_log").insert({
    signature_request_id: req.id,
    cabinet_id: b.cabinet_id ?? null,
    actor_user_id: actor,
    action: "init",
    details: { provider: KEP_PROVIDER, document_kind: b.document_kind, document_id: b.document_id },
    ip_address: ip,
    user_agent: ua,
  });

  return json({ ok: true, request: req });
}

async function handleCallback(
  admin: ReturnType<typeof createClient>,
  b: CallbackBody,
  ip: string | null,
  ua: string | null
) {
  const { data: reqRow, error: getErr } = await admin
    .from("signature_requests")
    .select("*")
    .eq("id", b.request_id)
    .single();
  if (getErr || !reqRow) return json({ error: "not_found" }, 404);

  if (b.failure_reason) {
    await admin.from("signature_requests")
      .update({ status: "failed", failure_reason: b.failure_reason })
      .eq("id", reqRow.id);
    await admin.from("signature_audit_log").insert({
      signature_request_id: reqRow.id, cabinet_id: reqRow.cabinet_id,
      actor_user_id: reqRow.signer_user_id, action: "fail",
      details: { reason: b.failure_reason }, ip_address: ip, user_agent: ua,
    });
    return json({ ok: true, status: "failed" });
  }

  const signedAt = new Date().toISOString();
  await admin.from("signature_requests")
    .update({ status: "signed", signed_at: signedAt })
    .eq("id", reqRow.id);

  // Append signer to signed_documents (create if missing)
  const { data: existing } = await admin
    .from("signed_documents")
    .select("*")
    .eq("document_kind", reqRow.document_kind)
    .eq("document_id", reqRow.document_id)
    .maybeSingle();

  const newSigner = {
    user_id: reqRow.signer_user_id,
    signed_at: signedAt,
    provider: reqRow.provider,
    cert_subject: b.cert_subject ?? null,
  };

  if (existing) {
    const signers = [...(existing.signers as any[]), newSigner];
    await admin.from("signed_documents")
      .update({ signers, signed_blob_url: b.signed_blob_url })
      .eq("id", existing.id);
  } else {
    await admin.from("signed_documents").insert({
      cabinet_id: reqRow.cabinet_id,
      document_kind: reqRow.document_kind,
      document_id: reqRow.document_id,
      document_hash: reqRow.document_hash,
      signers: [newSigner],
      signed_blob_url: b.signed_blob_url,
    });
  }

  await admin.from("signature_audit_log").insert({
    signature_request_id: reqRow.id, cabinet_id: reqRow.cabinet_id,
    actor_user_id: reqRow.signer_user_id, action: "sign",
    details: { provider: reqRow.provider, cert: b.cert_subject ?? null },
    ip_address: ip, user_agent: ua,
  });

  // If this is a delegation_contract and both parties signed → mark contract active
  if (reqRow.document_kind === "delegation_contract") {
    const { data: doc } = await admin
      .from("signed_documents").select("signers")
      .eq("document_kind", "delegation_contract")
      .eq("document_id", reqRow.document_id).single();
    if (doc && (doc.signers as any[]).length >= 2) {
      await admin.from("delegation_contracts")
        .update({ status: "active", signed_at: signedAt })
        .eq("id", reqRow.document_id);
    }
  }

  return json({ ok: true, status: "signed" });
}

async function handleAuto(
  admin: ReturnType<typeof createClient>,
  actor: string,
  b: AutoBody,
  ip: string | null,
  ua: string | null
) {
  const { data: rule } = await admin.from("auto_sign_rules")
    .select("*").eq("contract_id", b.contract_id).maybeSingle();
  if (!rule || !rule.enabled) return json({ error: "auto_sign_disabled" }, 403);
  if (!(rule.document_kinds as string[]).includes(b.document_kind))
    return json({ error: "kind_not_allowed" }, 403);
  if (rule.max_amount_uah != null && b.amount_uah != null && b.amount_uah > Number(rule.max_amount_uah))
    return json({ error: "amount_exceeds_cap" }, 403);
  if (rule.requires_trusted_review) {
    const reviewers = (rule.trusted_reviewer_user_ids as string[]) ?? [];
    if (!reviewers.includes(b.trusted_reviewer_user_id))
      return json({ error: "reviewer_not_trusted" }, 403);
  }

  // Resolve cabinet owner as signer
  const { data: ctr } = await admin
    .from("delegation_contracts").select("cabinet_owner_user_id")
    .eq("id", b.contract_id).single();
  if (!ctr) return json({ error: "contract_missing" }, 404);

  const { data: req } = await admin
    .from("signature_requests").insert({
      cabinet_id: b.cabinet_id,
      document_kind: b.document_kind,
      document_id: b.document_id,
      document_hash: b.document_hash,
      signer_user_id: ctr.cabinet_owner_user_id,
      signer_role: "cabinet_owner",
      provider: KEP_PROVIDER,
      status: "signed",
      signed_at: new Date().toISOString(),
      is_auto_sign: true,
      initiated_by: actor,
    }).select("*").single();

  await admin.from("signature_audit_log").insert({
    signature_request_id: req?.id ?? null, cabinet_id: b.cabinet_id,
    actor_user_id: actor, action: "auto_sign_triggered",
    details: { reviewer: b.trusted_reviewer_user_id, amount: b.amount_uah ?? null },
    ip_address: ip, user_agent: ua,
  });

  return json({ ok: true, request: req });
}

async function handleCancel(
  admin: ReturnType<typeof createClient>,
  actor: string,
  b: CancelBody,
  ip: string | null,
  ua: string | null
) {
  const { data: reqRow } = await admin.from("signature_requests")
    .select("*").eq("id", b.request_id).single();
  if (!reqRow) return json({ error: "not_found" }, 404);
  if (reqRow.signer_user_id !== actor && reqRow.initiated_by !== actor)
    return json({ error: "forbidden" }, 403);
  await admin.from("signature_requests")
    .update({ status: "cancelled" }).eq("id", reqRow.id);
  await admin.from("signature_audit_log").insert({
    signature_request_id: reqRow.id, cabinet_id: reqRow.cabinet_id,
    actor_user_id: actor, action: "cancel", details: {},
    ip_address: ip, user_agent: ua,
  });
  return json({ ok: true });
}

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status, headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
