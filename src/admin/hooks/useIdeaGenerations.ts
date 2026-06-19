import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { ContentIdea } from "./useContentIdeas";

export interface IdeaGeneration {
  id: string;
  idea_id: string;
  page_path: string;
  version: number;
  status: "success" | "error";
  prompt_topic: string;
  prompt_description: string | null;
  prompt_tags: string[];
  prompt_audience: string | null;
  prompt_content_target: string | null;
  model: string | null;
  system_prompt_version: string | null;
  generated_title: string | null;
  generated_tldr: string | null;
  generated_content: string | null;
  generated_word_count: number | null;
  generated_seo_title: string | null;
  generated_seo_description: string | null;
  error_message: string | null;
  duration_ms: number | null;
  source_ref: string | null;
  created_by: string | null;
  created_at: string;
}

export interface RecordGenerationInput {
  idea: ContentIdea;
  status: "success" | "error";
  prompt: {
    topic: string;
    description: string | null;
    tags: string[];
    audience: string;
    contentTarget: string;
  };
  result?: {
    content: string;
    tldr: string;
    wordCount: number;
    model?: string;
    systemPromptVersion?: string;
    durationMs?: number;
    seoTitle?: string;
    seoDescription?: string;
  };
  errorMessage?: string;
  sourceRef?: string;
}

export function useIdeaGenerations(ideaId?: string) {
  const [generations, setGenerations] = useState<IdeaGeneration[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!ideaId) {
      setGenerations([]);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from("content_idea_generations")
      .select("*")
      .eq("idea_id", ideaId)
      .order("version", { ascending: false });
    if (error) {
      toast.error("Не вдалось завантажити історію: " + error.message);
    } else {
      setGenerations((data ?? []) as IdeaGeneration[]);
    }
    setLoading(false);
  }, [ideaId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const deleteGeneration = useCallback(async (id: string) => {
    const { error } = await supabase.from("content_idea_generations").delete().eq("id", id);
    if (error) {
      toast.error("Помилка видалення: " + error.message);
      return false;
    }
    setGenerations((prev) => prev.filter((g) => g.id !== id));
    return true;
  }, []);

  return { generations, loading, refresh, deleteGeneration };
}

/**
 * Resolve next version number for an idea (max(version)+1).
 */
async function nextVersion(ideaId: string): Promise<number> {
  const { data } = await supabase
    .from("content_idea_generations")
    .select("version")
    .eq("idea_id", ideaId)
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle();
  return ((data?.version as number | undefined) ?? 0) + 1;
}

/**
 * Records a generation attempt (success or error) as a new version.
 * Uses the supabase-auth user as created_by.
 */
export async function recordGeneration(input: RecordGenerationInput): Promise<IdeaGeneration | null> {
  const version = await nextVersion(input.idea.id);
  const { data: userResp } = await supabase.auth.getUser();
  const row = {
    idea_id: input.idea.id,
    page_path: input.idea.page_path,
    version,
    status: input.status,
    prompt_topic: input.prompt.topic,
    prompt_description: input.prompt.description,
    prompt_tags: input.prompt.tags,
    prompt_audience: input.prompt.audience,
    prompt_content_target: input.prompt.contentTarget,
    model: input.result?.model ?? null,
    system_prompt_version: input.result?.systemPromptVersion ?? null,
    generated_title: input.result ? input.idea.title : null,
    generated_tldr: input.result?.tldr ?? null,
    generated_content: input.result?.content ?? null,
    generated_word_count: input.result?.wordCount ?? null,
    generated_seo_title: input.result?.seoTitle ?? null,
    generated_seo_description: input.result?.seoDescription ?? null,
    error_message: input.errorMessage ?? null,
    duration_ms: input.result?.durationMs ?? null,
    source_ref: input.sourceRef ?? null,
    created_by: userResp?.user?.id ?? null,
  };
  const { data, error } = await supabase
    .from("content_idea_generations")
    .insert(row as never)
    .select()
    .single();
  if (error) {
    console.error("recordGeneration error:", error);
    return null;
  }
  return data as IdeaGeneration;
}

/**
 * Lightweight count fetch for sitemap badges.
 * Returns map of idea_id -> count.
 */
export async function fetchGenerationCounts(ideaIds: string[]): Promise<Record<string, number>> {
  if (ideaIds.length === 0) return {};
  const { data, error } = await supabase
    .from("content_idea_generations")
    .select("idea_id")
    .in("idea_id", ideaIds);
  if (error || !data) return {};
  const map: Record<string, number> = {};
  for (const row of data as { idea_id: string }[]) {
    map[row.idea_id] = (map[row.idea_id] ?? 0) + 1;
  }
  return map;
}
