import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { aiConsultations, type AIConsultation } from "@/config/aiConsultationMockData";

export interface AiChatQuery {
  id: string;
  user_id: string | null;
  question: string;
  ai_answer: string;
  audience: string;
  tags: string[] | null;
  slug: string | null;
  status: string;
  views_count: number;
  created_at: string;
  moderated_at: string | null;
  published_at: string | null;
}

/** Fetch all AI queries for admin moderation (requires admin role) */
export function useAiChatQueriesAdmin() {
  return useQuery({
    queryKey: ["ai-chat-queries-admin"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ai_chat_queries")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as AiChatQuery[];
    },
  });
}

/** Fetch published AI queries for the forum, with mock fallback */
export function usePublishedAiQueries() {
  return useQuery({
    queryKey: ["ai-chat-queries-published"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ai_chat_queries")
        .select("*")
        .eq("status", "published")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as AiChatQuery[];
    },
  });
}

/** Convert DB record to AIConsultation shape for ForumThreadCard compatibility */
export function toForumItem(q: AiChatQuery): AIConsultation {
  return {
    id: q.id,
    question: q.question,
    answer: q.ai_answer,
    audience: (q.audience === "individual" ? "individual" : "business") as "business" | "individual",
    tags: q.tags ?? [],
    date: q.created_at,
    slug: q.slug ?? q.id,
    updatedDate: q.published_at ?? undefined,
    viewCount: q.views_count,
    source: "ai_chat",
    followUpCount: 0,
  };
}

/** Merge DB published queries with mock data as fallback */
export function useMergedForumData() {
  const { data: dbQueries, isLoading } = usePublishedAiQueries();
  
  // If we have DB data, use it; otherwise fall back to mock
  const items: AIConsultation[] = (dbQueries && dbQueries.length > 0)
    ? dbQueries.map(toForumItem)
    : aiConsultations;

  return { items, isLoading };
}

/** Fetch a single published AI query by slug, with mock fallback */
export function useAiQueryBySlug(slug: string | undefined) {
  return useQuery({
    queryKey: ["ai-chat-query-by-slug", slug],
    queryFn: async (): Promise<AIConsultation | null> => {
      if (!slug) return null;

      // Try DB first
      const { data, error } = await supabase
        .from("ai_chat_queries")
        .select("*")
        .eq("slug", slug)
        .eq("status", "published")
        .maybeSingle();

      if (!error && data) {
        return toForumItem(data as AiChatQuery);
      }

      // Fallback to mock
      const mock = aiConsultations.find((c) => c.slug === slug);
      return mock ?? null;
    },
    enabled: !!slug,
  });
}
