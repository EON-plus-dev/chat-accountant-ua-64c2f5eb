/**
 * useUserEvents - Hook for managing user-created calendar events with reminders
 */
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export type UserEventStatus = "scheduled" | "completed" | "cancelled";
export type UserEventSource = "manual" | "ai";
export type ReminderChannel = "in-app" | "email";

export interface UserEvent {
  id: string;
  user_id: string;
  cabinet_id: string | null;
  title: string;
  description: string | null;
  event_at: string; // ISO
  status: UserEventStatus;
  source: UserEventSource;
  created_at: string;
  updated_at: string;
}

export interface UserReminder {
  id: string;
  event_id: string;
  user_id: string;
  remind_at: string;
  channel: ReminderChannel;
  sent_at: string | null;
}

export interface CreateEventInput {
  title: string;
  description?: string;
  event_at: string;
  cabinet_id?: string | null;
  source?: UserEventSource;
  remind_before_minutes?: number | null;
  /**
   * If true, schedule multiple reminders based on user's `deadline_lead_days`
   * preference (e.g. 14/7/3/1/0 days before). Overrides `remind_before_minutes`.
   */
  is_deadline?: boolean;
}

export const useUserEvents = (cabinetId?: string | null) => {
  const [events, setEvents] = useState<UserEvent[]>([]);
  const [reminders, setReminders] = useState<UserReminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data: userData } = await supabase.auth.getUser();
    const uid = userData.user?.id ?? null;
    setUserId(uid);
    if (!uid) {
      setEvents([]);
      setReminders([]);
      setLoading(false);
      return;
    }

    let q = supabase
      .from("user_events")
      .select("*")
      .order("event_at", { ascending: true });
    if (cabinetId) q = q.eq("cabinet_id", cabinetId);

    const { data: ev, error: evErr } = await q;
    if (evErr) {
      console.error("useUserEvents load events:", evErr);
    }
    setEvents((ev ?? []) as UserEvent[]);

    const { data: rem } = await supabase
      .from("user_reminders")
      .select("*")
      .order("remind_at", { ascending: true });
    setReminders((rem ?? []) as UserReminder[]);

    setLoading(false);
  }, [cabinetId]);

  useEffect(() => {
    load();

    const ch = supabase
      .channel("user-events-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "user_events" },
        () => load()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "user_reminders" },
        () => load()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ch);
    };
  }, [load]);

  const createEvent = useCallback(
    async (input: CreateEventInput) => {
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData.user?.id;
      if (!uid) {
        toast({
          title: "Потрібен вхід",
          description: "Увійдіть, щоб створювати події.",
          variant: "destructive",
        });
        return null;
      }

      const { data: created, error } = await supabase
        .from("user_events")
        .insert({
          user_id: uid,
          cabinet_id: input.cabinet_id ?? cabinetId ?? null,
          title: input.title,
          description: input.description ?? null,
          event_at: input.event_at,
          source: input.source ?? "manual",
        })
        .select()
        .single();

      if (error || !created) {
        console.error(error);
        toast({
          title: "Помилка",
          description: "Не вдалося створити подію.",
          variant: "destructive",
        });
        return null;
      }

      // Schedule reminders
      const eventTime = new Date(input.event_at).getTime();
      const remindersToInsert: Array<{ event_id: string; user_id: string; remind_at: string; channel: "in-app" }> = [];

      if (input.is_deadline) {
        // Read user's deadline_lead_days preference
        const { data: prefRow } = await supabase
          .from("user_notification_preferences")
          .select("deadline_lead_days")
          .eq("user_id", uid)
          .maybeSingle();
        const leadDays: number[] = Array.isArray(prefRow?.deadline_lead_days)
          ? (prefRow!.deadline_lead_days as number[])
          : [7, 3, 1, 0];
        const now = Date.now();
        for (const d of leadDays) {
          const remindAt = new Date(eventTime - d * 86_400_000);
          // Skip past reminders
          if (remindAt.getTime() <= now) continue;
          remindersToInsert.push({
            event_id: created.id,
            user_id: uid,
            remind_at: remindAt.toISOString(),
            channel: "in-app",
          });
        }
      } else if (
        input.remind_before_minutes !== null &&
        input.remind_before_minutes !== undefined
      ) {
        remindersToInsert.push({
          event_id: created.id,
          user_id: uid,
          remind_at: new Date(eventTime - input.remind_before_minutes * 60_000).toISOString(),
          channel: "in-app",
        });
      }

      let scheduledCount = 0;
      if (remindersToInsert.length > 0) {
        const { data: insertedReminders } = await supabase
          .from("user_reminders")
          .insert(remindersToInsert)
          .select();
        scheduledCount = insertedReminders?.length ?? remindersToInsert.length;
      }

      toast({
        title: "Подію створено",
        description:
          scheduledCount > 0
            ? `${input.title} • ${scheduledCount} ${scheduledCount === 1 ? "нагадування заплановано" : "нагадувань заплановано"}`
            : input.title,
      });

      return created as UserEvent;
    },
    [cabinetId]
  );

  const updateStatus = useCallback(
    async (id: string, status: UserEventStatus) => {
      // Optimistic update
      let prev: UserEvent[] = [];
      setEvents((curr) => {
        prev = curr;
        return curr.map((e) => (e.id === id ? { ...e, status } : e));
      });

      const { data, error } = await supabase
        .from("user_events")
        .update({ status })
        .eq("id", id)
        .select();

      if (error) {
        setEvents(prev);
        toast({ title: "Помилка", description: error.message, variant: "destructive" });
        return;
      }
      if (!data || data.length === 0) {
        setEvents(prev);
        toast({
          title: "Не вдалося оновити",
          description: "Подію не знайдено або немає доступу.",
          variant: "destructive",
        });
        return;
      }
      if (status === "completed") {
        toast({ title: "Подію виконано ✓" });
      } else if (status === "cancelled") {
        toast({ title: "Подію скасовано" });
      }
    },
    []
  );

  const deleteEvent = useCallback(async (id: string) => {
    // Optimistic remove
    let prev: UserEvent[] = [];
    setEvents((curr) => {
      prev = curr;
      return curr.filter((e) => e.id !== id);
    });

    const { data, error } = await supabase
      .from("user_events")
      .delete()
      .eq("id", id)
      .select();

    if (error) {
      setEvents(prev);
      toast({ title: "Помилка", description: error.message, variant: "destructive" });
      return;
    }
    if (!data || data.length === 0) {
      setEvents(prev);
      toast({
        title: "Не вдалося видалити",
        description: "Подію не знайдено або немає доступу.",
        variant: "destructive",
      });
      return;
    }
    toast({ title: "Подію видалено" });
  }, []);

  return {
    events,
    reminders,
    loading,
    userId,
    createEvent,
    updateStatus,
    deleteEvent,
    reload: load,
  };
};
