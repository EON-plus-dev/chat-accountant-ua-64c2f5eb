import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ContentIdea {
  id: string;
  page_path: string;
  title: string;
  description: string | null;
  content_target: "article" | "page-section" | "none";
  audience: "business" | "individual" | "fop";
  tags: string[];
  priority: number;
  status: "todo" | "generating" | "generated" | "published" | "dismissed";
  source: "ai_chat_query" | "seo_gap" | "manual" | "ai_suggested";
  source_ref: string | null;
  generated_article_id: string | null;
  generated_content: string | null;
  generated_tldr: string | null;
  generated_seo_title: string | null;
  generated_seo_description: string | null;
  generated_word_count: number | null;
  generated_at: string | null;
  created_at: string;
  updated_at: string;
}

export function useContentIdeas(pagePath?: string) {
  const [ideas, setIdeas] = useState<ContentIdea[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    let q = supabase.from("content_ideas").select("*").order("priority", { ascending: false }).order("created_at", { ascending: false });
    if (pagePath) q = q.eq("page_path", pagePath);
    const { data, error } = await q;
    if (error) {
      toast.error("Не вдалось завантажити ідеї: " + error.message);
    } else {
      setIdeas((data ?? []) as ContentIdea[]);
    }
    setLoading(false);
  }, [pagePath]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const updateIdea = useCallback(async (id: string, patch: Partial<ContentIdea>) => {
    const { error } = await supabase.from("content_ideas").update(patch).eq("id", id);
    if (error) {
      toast.error("Помилка оновлення: " + error.message);
      return false;
    }
    setIdeas((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } as ContentIdea : i)));
    return true;
  }, []);

  const insertIdea = useCallback(async (idea: Partial<ContentIdea> & { page_path: string; title: string }) => {
    const { data, error } = await supabase.from("content_ideas").insert(idea as never).select().single();
    if (error) {
      toast.error("Помилка створення: " + error.message);
      return null;
    }
    setIdeas((prev) => [data as ContentIdea, ...prev]);
    return data as ContentIdea;
  }, []);

  const deleteIdea = useCallback(async (id: string) => {
    const { error } = await supabase.from("content_ideas").delete().eq("id", id);
    if (error) {
      toast.error("Помилка видалення: " + error.message);
      return;
    }
    setIdeas((prev) => prev.filter((i) => i.id !== id));
  }, []);

  return { ideas, loading, refresh, updateIdea, insertIdea, deleteIdea };
}
