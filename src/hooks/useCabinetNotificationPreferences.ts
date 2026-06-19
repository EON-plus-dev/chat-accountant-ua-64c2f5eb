import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  defaultTeamNotificationSettings,
  type TeamEventType,
} from "@/config/teamNotificationsConfig";

export type CabinetNotificationSettings = Record<TeamEventType, boolean>;

const buildDefaults = (): CabinetNotificationSettings => {
  return defaultTeamNotificationSettings.reduce((acc, s) => {
    acc[s.id] = s.enabled;
    return acc;
  }, {} as CabinetNotificationSettings);
};

export function useCabinetNotificationPreferences(cabinetId: string | undefined) {
  const [settings, setSettings] = useState<CabinetNotificationSettings>(buildDefaults());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!cabinetId) {
        if (mounted) setLoading(false);
        return;
      }
      const { data: auth } = await supabase.auth.getUser();
      const uid = auth.user?.id;
      if (!uid) {
        if (mounted) setLoading(false);
        return;
      }
      setUserId(uid);

      const { data, error } = await supabase
        .from("cabinet_notification_preferences")
        .select("settings")
        .eq("user_id", uid)
        .eq("cabinet_id", cabinetId)
        .maybeSingle();

      if (!mounted) return;
      if (error) console.error("[cabinet-notif-prefs] load error", error);

      const defaults = buildDefaults();
      const stored = (data?.settings ?? {}) as Partial<CabinetNotificationSettings>;
      setSettings({ ...defaults, ...stored });
      setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, [cabinetId]);

  const toggle = useCallback(
    async (eventType: TeamEventType) => {
      if (!cabinetId || !userId) return { error: new Error("not ready") };
      const next = { ...settings, [eventType]: !settings[eventType] };
      setSettings(next); // optimistic
      setSaving(true);
      const { error } = await supabase
        .from("cabinet_notification_preferences")
        .upsert(
          {
            user_id: userId,
            cabinet_id: cabinetId,
            settings: next as any,
          },
          { onConflict: "user_id,cabinet_id" }
        );
      setSaving(false);
      if (error) {
        console.error("[cabinet-notif-prefs] save error", error);
        setSettings(settings); // rollback
        return { error };
      }
      return { error: null };
    },
    [cabinetId, userId, settings]
  );

  return { settings, loading, saving, toggle };
}
