import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { UIMessage } from "ai";

export interface CmsThread {
  id: string;
  title: string | null;
  created_at: string;
  updated_at: string;
}

export interface CmsThreadPreview {
  text: string;
  path: string | null;
}

function extractText(parts: unknown): string {
  if (!Array.isArray(parts)) return "";
  for (const p of parts) {
    if (p && typeof p === "object" && (p as any).type === "text" && typeof (p as any).text === "string") {
      return (p as any).text as string;
    }
  }
  return "";
}

function extractPath(text: string): string | null {
  const m = text.match(/\/[a-zA-Z0-9\-_/]+/);
  return m ? m[0] : null;
}

export function useCmsThreads() {
  const [threads, setThreads] = useState<CmsThread[]>([]);
  const [previews, setPreviews] = useState<Record<string, CmsThreadPreview>>({});
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("cms_chat_threads")
      .select("id, title, created_at, updated_at")
      .order("updated_at", { ascending: false })
      .limit(100);
    if (error) {
      toast.error("Не вдалось завантажити чати: " + error.message);
      setLoading(false);
      return;
    }
    const list = (data ?? []) as CmsThread[];
    setThreads(list);

    const ids = list.map((t) => t.id);
    if (ids.length > 0) {
      const { data: msgs } = await supabase
        .from("cms_chat_messages")
        .select("thread_id, role, parts, created_at")
        .in("thread_id", ids)
        .eq("role", "user")
        .order("created_at", { ascending: true });
      const map: Record<string, CmsThreadPreview> = {};
      for (const row of msgs ?? []) {
        const tid = (row as any).thread_id as string;
        if (map[tid]) continue;
        const text = extractText((row as any).parts);
        map[tid] = { text, path: extractPath(text) };
      }
      setPreviews(map);
    } else {
      setPreviews({});
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const createThread = useCallback(async (): Promise<string | null> => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) {
      toast.error("Потрібна авторизація");
      return null;
    }
    const { data, error } = await supabase
      .from("cms_chat_threads")
      .insert({ user_id: userData.user.id, title: null })
      .select("id")
      .single();
    if (error || !data) {
      toast.error("Не вдалось створити чат: " + (error?.message ?? "unknown"));
      return null;
    }
    await refresh();
    return data.id;
  }, [refresh]);

  const deleteThread = useCallback(async (id: string) => {
    const { error } = await supabase.from("cms_chat_threads").delete().eq("id", id);
    if (error) {
      toast.error("Не вдалось видалити: " + error.message);
      return false;
    }
    setThreads((prev) => prev.filter((t) => t.id !== id));
    return true;
  }, []);

  return { threads, previews, loading, refresh, createThread, deleteThread };
}

export async function loadThreadMessages(threadId: string): Promise<UIMessage[]> {
  const { data, error } = await supabase
    .from("cms_chat_messages")
    .select("id, role, parts, created_at")
    .eq("thread_id", threadId)
    .order("created_at", { ascending: true });
  if (error) {
    console.error("[loadThreadMessages]", error);
    return [];
  }
  return (data ?? []).map((row) => ({
    id: row.id,
    role: row.role as UIMessage["role"],
    parts: (row.parts as UIMessage["parts"]) ?? [],
  }));
}
