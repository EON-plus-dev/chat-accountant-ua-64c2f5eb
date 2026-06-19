/**
 * useUserNotifications — realtime in-app notifications inbox.
 * Subscribes to public.user_notifications and surfaces new ones via toast
 * (urgent override for severity='critical', per «Право на спокій»).
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface UserNotification {
  id: string;
  user_id: string;
  cabinet_id: string | null;
  type: string;
  severity: "critical" | "warning" | "info" | string;
  title: string;
  body: string | null;
  action_path: string | null;
  related_event_id: string | null;
  read_at: string | null;
  created_at: string;
}

export const useUserNotifications = () => {
  const [items, setItems] = useState<UserNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const seenIds = useRef<Set<string>>(new Set());

  const load = useCallback(async () => {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) {
      setItems([]);
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from("user_notifications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);
    const list = (data ?? []) as UserNotification[];
    list.forEach((n) => seenIds.current.add(n.id));
    setItems(list);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    const ch = supabase
      .channel("user-notifications-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "user_notifications" },
        (payload) => {
          const n = payload.new as UserNotification;
          if (seenIds.current.has(n.id)) return;
          seenIds.current.add(n.id);
          setItems((prev) => [n, ...prev]);
          // «Право на спокій»: toast лише для warning/critical
          if (n.severity === "critical" || n.severity === "warning") {
            toast({
              title: n.title,
              description: n.body ?? undefined,
              variant: n.severity === "critical" ? "destructive" : "default",
            });
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "user_notifications" },
        (payload) => {
          const n = payload.new as UserNotification;
          setItems((prev) => prev.map((x) => (x.id === n.id ? n : x)));
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "user_notifications" },
        (payload) => {
          const id = (payload.old as { id: string }).id;
          setItems((prev) => prev.filter((x) => x.id !== id));
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [load]);

  const markRead = useCallback(async (id: string) => {
    await supabase
      .from("user_notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("id", id);
  }, []);

  const markAllRead = useCallback(async () => {
    const unread = items.filter((n) => !n.read_at).map((n) => n.id);
    if (!unread.length) return;
    await supabase
      .from("user_notifications")
      .update({ read_at: new Date().toISOString() })
      .in("id", unread);
  }, [items]);

  const remove = useCallback(async (id: string) => {
    await supabase.from("user_notifications").delete().eq("id", id);
  }, []);

  const unreadCount = items.filter((n) => !n.read_at).length;

  return { items, loading, unreadCount, markRead, markAllRead, remove, reload: load };
};
