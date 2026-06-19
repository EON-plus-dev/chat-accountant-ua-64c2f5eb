import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export type ChannelKey = "internal" | "email" | "push" | "telegram" | "viber";
export type TypeKey =
  | "system"
  | "deadlines"
  | "events"
  | "ai"
  | "risks"
  | "team"
  | "mentions"
  | "tasks"
  | "integrations";

export type NotificationPreferences = {
  user_id: string;
  quiet_hours_enabled: boolean;
  quiet_hours_start: string; // 'HH:MM' or 'HH:MM:SS'
  quiet_hours_end: string;
  timezone: string;
  channels: Record<ChannelKey, boolean>;
  types: Record<TypeKey, boolean>;
  deadline_lead_days: number[];
  critical_overrides_quiet_hours: boolean;
};

const DEFAULT_CHANNELS: Record<ChannelKey, boolean> = {
  internal: true,
  email: false,
  push: false,
  telegram: false,
  viber: false,
};

const DEFAULT_TYPES: Record<TypeKey, boolean> = {
  system: true,
  deadlines: true,
  events: true,
  ai: true,
  risks: true,
  team: true,
  mentions: true,
  tasks: true,
  integrations: true,
};

const DEFAULTS: Omit<NotificationPreferences, "user_id"> = {
  quiet_hours_enabled: false,
  quiet_hours_start: "22:00",
  quiet_hours_end: "08:00",
  timezone: "Europe/Kyiv",
  channels: DEFAULT_CHANNELS,
  types: DEFAULT_TYPES,
  deadline_lead_days: [7, 3, 1, 0],
  critical_overrides_quiet_hours: true,
};

function normalize(row: any, uid: string): NotificationPreferences {
  return {
    user_id: uid,
    quiet_hours_enabled: !!row?.quiet_hours_enabled,
    quiet_hours_start: row?.quiet_hours_start ?? DEFAULTS.quiet_hours_start,
    quiet_hours_end: row?.quiet_hours_end ?? DEFAULTS.quiet_hours_end,
    timezone: row?.timezone ?? DEFAULTS.timezone,
    channels: { ...DEFAULT_CHANNELS, ...(row?.channels ?? {}) },
    types: { ...DEFAULT_TYPES, ...(row?.types ?? {}) },
    deadline_lead_days: Array.isArray(row?.deadline_lead_days)
      ? row.deadline_lead_days
      : DEFAULTS.deadline_lead_days,
    critical_overrides_quiet_hours:
      row?.critical_overrides_quiet_hours ?? DEFAULTS.critical_overrides_quiet_hours,
  };
}

export function useNotificationPreferences() {
  const [prefs, setPrefs] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data: auth } = await supabase.auth.getUser();
      const uid = auth.user?.id;
      if (!uid) {
        if (mounted) setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from("user_notification_preferences")
        .select("*")
        .eq("user_id", uid)
        .maybeSingle();
      if (!mounted) return;
      if (error) console.error("[notif-prefs] load error", error);
      setPrefs(normalize(data, uid));
      setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const update = useCallback(
    async (patch: Partial<Omit<NotificationPreferences, "user_id">>) => {
      if (!prefs) return { error: new Error("not loaded") };
      const next = { ...prefs, ...patch };
      setPrefs(next); // optimistic
      setSaving(true);
      const { error } = await supabase
        .from("user_notification_preferences")
        .upsert(
          {
            user_id: prefs.user_id,
            quiet_hours_enabled: next.quiet_hours_enabled,
            quiet_hours_start: next.quiet_hours_start,
            quiet_hours_end: next.quiet_hours_end,
            timezone: next.timezone,
            channels: next.channels as any,
            types: next.types as any,
            deadline_lead_days: next.deadline_lead_days as any,
            critical_overrides_quiet_hours: next.critical_overrides_quiet_hours,
          },
          { onConflict: "user_id" }
        );
      setSaving(false);
      if (error) {
        console.error("[notif-prefs] save error", error);
        setPrefs(prefs); // rollback
        return { error };
      }
      return { error: null };
    },
    [prefs]
  );

  return { prefs, loading, saving, update };
}
