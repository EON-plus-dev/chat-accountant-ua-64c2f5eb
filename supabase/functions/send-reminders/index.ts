// send-reminders: cron edge function (every minute)
// Reads pending reminders, creates in-app notifications, marks reminders as sent.
// Respects per-user quiet hours, channels, types, and critical-override from user_notification_preferences.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function getTimeInTZ(date: Date, tz: string): string {
  try {
    const fmt = new Intl.DateTimeFormat("en-GB", {
      timeZone: tz,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    return fmt.format(date);
  } catch {
    return date.toISOString().slice(11, 16);
  }
}

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

function isInQuietWindow(nowMin: number, startMin: number, endMin: number): boolean {
  if (startMin === endMin) return false;
  if (startMin < endMin) return nowMin >= startMin && nowMin < endMin;
  return nowMin >= startMin || nowMin < endMin;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } }
  );

  try {
    const { data: due, error: dueErr } = await supabase
      .from("user_reminders")
      .select(
        "id, user_id, event_id, remind_at, user_events!inner(id, title, description, event_at, cabinet_id, status)"
      )
      .is("sent_at", null)
      .lte("remind_at", new Date().toISOString())
      .limit(200);

    if (dueErr) throw dueErr;
    if (!due || due.length === 0) {
      return new Response(
        JSON.stringify({ ok: true, processed: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userIds = Array.from(new Set(due.map((r: any) => r.user_id)));
    const { data: prefsRows } = await supabase
      .from("user_notification_preferences")
      .select(
        "user_id, quiet_hours_enabled, quiet_hours_start, quiet_hours_end, timezone, channels, types, critical_overrides_quiet_hours"
      )
      .in("user_id", userIds);
    const prefsMap = new Map<string, any>();
    (prefsRows ?? []).forEach((p: any) => prefsMap.set(p.user_id, p));

    let processed = 0;
    let skippedQuiet = 0;
    let skippedType = 0;
    let skippedChannel = 0;
    const failures: string[] = [];
    const now = new Date();

    for (const r of due) {
      const ev: any = r.user_events;
      if (!ev || ev.status !== "scheduled") {
        await supabase
          .from("user_reminders")
          .update({ sent_at: new Date().toISOString() })
          .eq("id", r.id);
        continue;
      }

      const prefs = prefsMap.get(r.user_id);
      const types = prefs?.types ?? {};
      const channels = prefs?.channels ?? {};

      // Type filter: events disabled => skip and mark sent (don't keep firing)
      if (types.events === false) {
        skippedType++;
        await supabase
          .from("user_reminders")
          .update({ sent_at: new Date().toISOString() })
          .eq("id", r.id);
        continue;
      }

      // Channel filter: internal disabled => skip in-app insert (currently only in-app supported)
      if (channels.internal === false) {
        skippedChannel++;
        await supabase
          .from("user_reminders")
          .update({ sent_at: new Date().toISOString() })
          .eq("id", r.id);
        continue;
      }

      const eventTime = new Date(ev.event_at);
      const minutesUntil = Math.round(
        (eventTime.getTime() - Date.now()) / 60000
      );
      const severity = minutesUntil <= 15 ? "critical" : "warning";

      // Quiet-hours check (with critical override)
      if (prefs?.quiet_hours_enabled) {
        const overrideCritical = prefs.critical_overrides_quiet_hours !== false;
        const isCritical = severity === "critical";
        if (!(isCritical && overrideCritical)) {
          const tz = prefs.timezone || "Europe/Kyiv";
          const nowHHMM = getTimeInTZ(now, tz);
          const nowMin = toMinutes(nowHHMM);
          const startMin = toMinutes(String(prefs.quiet_hours_start).slice(0, 5));
          const endMin = toMinutes(String(prefs.quiet_hours_end).slice(0, 5));
          if (isInQuietWindow(nowMin, startMin, endMin)) {
            skippedQuiet++;
            continue; // defer
          }
        }
      }

      const whenLabel =
        minutesUntil <= 0
          ? "зараз"
          : minutesUntil < 60
          ? `через ${minutesUntil} хв`
          : `о ${eventTime.toLocaleTimeString("uk-UA", {
              hour: "2-digit",
              minute: "2-digit",
            })}`;

      const cabinetParam = ev.cabinet_id
        ? `&cabinet=${encodeURIComponent(ev.cabinet_id)}`
        : "";
      const actionPath = `/dashboard?tab=event-journal${cabinetParam}&eventId=${ev.id}`;

      const { error: insErr } = await supabase
        .from("user_notifications")
        .insert({
          user_id: r.user_id,
          cabinet_id: ev.cabinet_id ?? null,
          type: "event_reminder",
          severity,
          title: ev.title,
          body: ev.description
            ? `${whenLabel} — ${ev.description}`
            : `Подія ${whenLabel}`,
          action_path: actionPath,
          related_event_id: ev.id,
        });

      if (insErr) {
        failures.push(`${r.id}: ${insErr.message}`);
        continue;
      }

      const { error: updErr } = await supabase
        .from("user_reminders")
        .update({ sent_at: new Date().toISOString() })
        .eq("id", r.id);

      if (updErr) {
        failures.push(`${r.id}-mark: ${updErr.message}`);
        continue;
      }

      processed++;
    }

    return new Response(
      JSON.stringify({ ok: true, processed, skippedQuiet, skippedType, skippedChannel, failures }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("send-reminders error:", e);
    return new Response(
      JSON.stringify({ ok: false, error: String(e) }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
