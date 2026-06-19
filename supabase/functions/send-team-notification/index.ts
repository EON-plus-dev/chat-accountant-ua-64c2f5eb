// send-team-notification: validates intersection of profile×cabinet preferences
// then inserts in-app notifications. Title/body/priority are rendered by caller.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

type Priority = "normal" | "high" | "urgent";
type Severity = "info" | "warning" | "critical";

const priorityToSeverity = (p: Priority): Severity =>
  p === "urgent" ? "critical" : p === "high" ? "warning" : "info";

function getTimeInTZ(date: Date, tz: string): string {
  try {
    return new Intl.DateTimeFormat("en-GB", {
      timeZone: tz, hour: "2-digit", minute: "2-digit", hour12: false,
    }).format(date);
  } catch { return date.toISOString().slice(11, 16); }
}
const toMin = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
};
const inQuiet = (now: number, s: number, e: number) =>
  s === e ? false : s < e ? now >= s && now < e : now >= s || now < e;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    // ---- Auth: validate JWT via anon key ----
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const anon = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: claims, error: authErr } = await anon.auth.getClaims(
      authHeader.replace("Bearer ", "")
    );
    if (authErr || !claims?.claims?.sub) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ---- Body ----
    const body = await req.json();
    const {
      eventType,
      cabinetId,
      cabinetName,
      recipientUserIds,
      title,
      body: msgBody,
      priority = "normal",
      actionPath = null,
      data = {},
    } = body ?? {};

    if (!eventType || !title || !Array.isArray(recipientUserIds)) {
      return new Response(JSON.stringify({ error: "Invalid payload" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (recipientUserIds.length === 0) {
      return new Response(JSON.stringify({ delivered: 0, skipped: [], failures: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const severity = priorityToSeverity(priority as Priority);
    const notifType = `team_${eventType}`;

    // ---- Service role for DB (bypass RLS) ----
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } }
    );

    // Load preferences in bulk
    const { data: profPrefs } = await admin
      .from("user_notification_preferences")
      .select("user_id, types, channels, quiet_hours_enabled, quiet_hours_start, quiet_hours_end, timezone, critical_overrides_quiet_hours")
      .in("user_id", recipientUserIds);
    const profMap = new Map<string, any>();
    (profPrefs ?? []).forEach((p: any) => profMap.set(p.user_id, p));

    const { data: cabPrefs } = await admin
      .from("cabinet_notification_preferences")
      .select("user_id, settings")
      .eq("cabinet_id", cabinetId)
      .in("user_id", recipientUserIds);
    const cabMap = new Map<string, any>();
    (cabPrefs ?? []).forEach((p: any) => cabMap.set(p.user_id, p));

    const now = new Date();
    const skipped: { user_id: string; reason: string }[] = [];
    const failures: { user_id: string; error: string }[] = [];
    const toInsert: any[] = [];

    for (const uid of recipientUserIds as string[]) {
      const prof = profMap.get(uid);

      // Level 1: profile.types.team — default true if no row
      const teamEnabled = prof?.types?.team !== false;
      if (!teamEnabled) { skipped.push({ user_id: uid, reason: "profile_team_off" }); continue; }

      // Level 2: cabinet.settings[eventType] — default true if no row
      const cab = cabMap.get(uid);
      if (cab && cab.settings?.[eventType] === false) {
        skipped.push({ user_id: uid, reason: "cabinet_event_off" }); continue;
      }

      // Level 3: channels.internal — default true
      const internalOn = prof?.channels?.internal !== false;
      if (!internalOn) { skipped.push({ user_id: uid, reason: "channel_off" }); continue; }

      // Level 4: quiet hours (with critical override)
      if (prof?.quiet_hours_enabled) {
        const override = prof.critical_overrides_quiet_hours !== false;
        const isCritical = severity === "critical";
        if (!(isCritical && override)) {
          const tz = prof.timezone || "Europe/Kyiv";
          const nm = toMin(getTimeInTZ(now, tz));
          const sm = toMin(String(prof.quiet_hours_start).slice(0, 5));
          const em = toMin(String(prof.quiet_hours_end).slice(0, 5));
          if (inQuiet(nm, sm, em)) {
            skipped.push({ user_id: uid, reason: "quiet_hours" }); continue;
          }
        }
      }

      toInsert.push({
        user_id: uid,
        cabinet_id: cabinetId ?? null,
        type: notifType,
        severity,
        title,
        body: msgBody ?? null,
        action_path: actionPath,
      });
    }

    let delivered = 0;
    if (toInsert.length > 0) {
      const { error: insErr, data: ins } = await admin
        .from("user_notifications")
        .insert(toInsert)
        .select("id, user_id");
      if (insErr) {
        toInsert.forEach((r) => failures.push({ user_id: r.user_id, error: insErr.message }));
      } else {
        delivered = ins?.length ?? toInsert.length;
      }
    }

    console.log("[send-team-notification]", {
      eventType, cabinetId, recipients: recipientUserIds.length,
      delivered, skipped: skipped.length, failures: failures.length, data,
    });

    return new Response(
      JSON.stringify({ delivered, skipped, failures }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("send-team-notification error:", e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
