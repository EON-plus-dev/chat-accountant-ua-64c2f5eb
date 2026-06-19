import { useParams, useNavigate } from "react-router-dom";
import { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import ContentDetailPage from "@/admin/components/ContentDetailPage";
import { aiConsultationSchema } from "@/admin/schemas/contentSchemas";
import { toast } from "sonner";

interface DbAiQuery {
  id: string;
  question: string;
  ai_answer: string;
  audience: string;
  tags: string[] | null;
  slug: string | null;
  status: string;
  views_count: number;
  created_at: string;
  published_at: string | null;
  user_id: string | null;
}

function mapToSchema(d: DbAiQuery) {
  return {
    id: d.id,
    slug: d.slug ?? d.id,
    question: d.question,
    answer: d.ai_answer,
    audience: d.audience,
    tags: d.tags ?? [],
    date: d.created_at,
    viewCount: d.views_count,
    status: d.status,
    followUpCount: 0,
    source: "ai_chat",
  };
}

export default function AIConsultationDetailRoute() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: rawItems = [], isLoading } = useQuery({
    queryKey: ["ai-chat-queries-admin"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ai_chat_queries")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as DbAiQuery[];
    },
  });

  const allItems = useMemo(() => rawItems.map(mapToSchema), [rawItems]);

  const [currentId, setCurrentId] = useState(id);
  const item = useMemo(
    () => allItems.find((i) => i.slug === currentId) ?? null,
    [allItems, currentId],
  );

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Завантаження…</div>;
  }

  if (!item) {
    return <div className="p-8 text-center text-muted-foreground">Запис не знайдено</div>;
  }

  const portalPath = `/ai-consultations/${item.slug}`;

  return (
    <ContentDetailPage
      data={item}
      schema={aiConsultationSchema}
      title="AI-консультація"
      previewType="ai-consultation"
      portalPath={portalPath}
      allItems={allItems}
      onNavigate={(newItem) => {
        setCurrentId(String(newItem.slug));
        navigate(`/admin/content/ai-consultation/${newItem.slug}`, { replace: true });
      }}
      backPath="/admin/ai-consultations"
      backLabel="AI-консультації"
    />
  );
}
