import { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { type ColumnDef } from "@tanstack/react-table";
import { useAiChatQueriesAdmin, type AiChatQuery } from "@/hooks/useAiChatQueries";
import { aiConsultations } from "@/config/aiConsultationMockData";
import { supabase } from "@/integrations/supabase/client";
import ContentTable from "@/admin/components/ContentTable";
import ContentFilters from "@/admin/components/ContentFilters";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Bot, Eye, Clock, CheckCircle, XCircle, Send, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { generateSeoFields } from "@/admin/utils/generateSeo";
import { useQueryClient } from "@tanstack/react-query";
import { Checkbox } from "@/components/ui/checkbox";

const STATUS_MAP: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending: { label: "На модерації", variant: "secondary" },
  approved: { label: "Схвалено", variant: "outline" },
  published: { label: "Опубліковано", variant: "default" },
  rejected: { label: "Відхилено", variant: "destructive" },
};

export default function AIConsultationsAdmin() {
  const navigate = useNavigate();
  const { data: queries = [], isLoading } = useAiChatQueriesAdmin();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const seeded = useRef(false);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (isLoading || queries.length > 0 || seeded.current) return;
    seeded.current = true;
    const mapped = aiConsultations.map((c) => ({
      question: c.question,
      ai_answer: c.answer,
      audience: c.audience,
      tags: c.tags,
      slug: c.slug,
      status: "published" as const,
      views_count: c.viewCount,
      created_at: new Date(c.date).toISOString(),
      published_at: new Date(c.date).toISOString(),
    }));
    supabase.from("ai_chat_queries").insert(mapped).then(({ error }) => {
      if (!error) {
        queryClient.invalidateQueries({ queryKey: ["ai-chat-queries-admin"] });
        queryClient.invalidateQueries({ queryKey: ["ai-chat-queries-published"] });
      }
    });
  }, [isLoading, queries.length, queryClient]);

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((q) => q.id)));
    }
  };

  const bulkAction = async (status: string) => {
    if (selected.size === 0) return;
    setActionLoading(true);
    try {
      if (status === "published") {
        const ids = Array.from(selected);
        toast({ title: `Генеруємо SEO для ${ids.length} запитів…` });
        await Promise.all(ids.map(async (id) => {
          const query = queries.find((q) => q.id === id);
          if (!query) return;
          const seo = await generateSeoFields({ title: query.question, content: query.ai_answer, audience: query.audience });
          await supabase.from("ai_chat_queries").update({
            status: "published",
            moderated_at: new Date().toISOString(),
            published_at: new Date().toISOString(),
            seo_title: seo.seoTitle,
            seo_description: seo.seoDescription,
            slug: seo.slug,
          }).eq("id", id);
        }));
      } else {
        const updates: Record<string, any> = { status, moderated_at: new Date().toISOString() };
        const { error } = await supabase.from("ai_chat_queries").update(updates).in("id", Array.from(selected));
        if (error) throw error;
      }
      toast({ title: `${selected.size} запитів → ${STATUS_MAP[status]?.label ?? status}` });
      setSelected(new Set());
      queryClient.invalidateQueries({ queryKey: ["ai-chat-queries-admin"] });
    } catch (e: any) {
      toast({ title: "Помилка", description: e.message, variant: "destructive" });
    } finally {
      setActionLoading(false);
    }
  };

  const singleAction = async (id: string, status: string) => {
    const updates: Record<string, any> = { status, moderated_at: new Date().toISOString() };

    if (status === "published") {
      updates.published_at = new Date().toISOString();
      const query = queries.find((q) => q.id === id);
      if (query) {
        toast({ title: "Генеруємо SEO…" });
        const seo = await generateSeoFields({ title: query.question, content: query.ai_answer, audience: query.audience });
        updates.seo_title = seo.seoTitle;
        updates.seo_description = seo.seoDescription;
        updates.slug = seo.slug;
      }
    }

    const { error } = await supabase
      .from("ai_chat_queries")
      .update(updates)
      .eq("id", id);

    if (error) {
      toast({ title: "Помилка", description: error.message, variant: "destructive" });
    } else {
      toast({ title: `Статус → ${STATUS_MAP[status]?.label ?? status}` });
      queryClient.invalidateQueries({ queryKey: ["ai-chat-queries-admin"] });
    }
  };

  const columns: ColumnDef<AiChatQuery, any>[] = [
    {
      id: "select",
      header: () => (
        <Checkbox
          checked={selected.size > 0 && selected.size === filtered.length}
          onCheckedChange={toggleAll}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={selected.has(row.original.id)}
          onCheckedChange={() => toggleSelect(row.original.id)}
          onClick={(e) => e.stopPropagation()}
        />
      ),
      size: 40,
    },
    {
      accessorKey: "question",
      header: "Питання",
      cell: ({ row }) => (
        <span className="font-medium text-foreground line-clamp-2 max-w-[300px]">
          {row.original.question}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Статус",
      cell: ({ row }) => {
        const s = STATUS_MAP[row.original.status] ?? { label: row.original.status, variant: "outline" as const };
        return <Badge variant={s.variant}>{s.label}</Badge>;
      },
    },
    {
      accessorKey: "audience",
      header: "Аудиторія",
      cell: ({ row }) => (
        <Badge variant={row.original.audience === "business" ? "default" : "secondary"}>
          {row.original.audience === "business" ? "Бізнес" : "Фізособа"}
        </Badge>
      ),
    },
    {
      id: "tags",
      header: "Теги",
      cell: ({ row }) => {
        const tags = row.original.tags ?? [];
        return (
          <div className="flex gap-1 flex-wrap max-w-[200px]">
            {tags.slice(0, 3).map((t) => (
              <Badge key={t} variant="outline" className="text-[10px]">{t}</Badge>
            ))}
            {tags.length > 3 && <span className="text-[10px] text-muted-foreground">+{tags.length - 3}</span>}
          </div>
        );
      },
    },
    {
      accessorKey: "views_count",
      header: "Перегляди",
      sortDescFirst: true,
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground flex items-center gap-1">
          <Eye className="h-3 w-3" /> {row.original.views_count}
        </span>
      ),
    },
    {
      id: "comments",
      header: "Коментарі",
      cell: () => (
        <span className="text-xs text-muted-foreground">—</span>
      ),
    },
    {
      accessorKey: "created_at",
      header: "Дата",
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">
          {new Date(row.original.created_at).toLocaleDateString("uk-UA")}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Дії",
      cell: ({ row }) => {
        const q = row.original;
        return (
          <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
            {q.status !== "published" && (
              <Button size="sm" variant="ghost" className="h-7 px-2 text-xs gap-1" onClick={() => singleAction(q.id, "published")}>
                <Send className="h-3 w-3" /> Опублікувати
              </Button>
            )}
            {q.status === "pending" && (
              <Button size="sm" variant="ghost" className="h-7 px-2 text-xs gap-1 text-destructive" onClick={() => singleAction(q.id, "rejected")}>
                <XCircle className="h-3 w-3" /> Відхилити
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  const filtered = useMemo(() => {
    let result = [...queries];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((c) =>
        c.question.toLowerCase().includes(q) ||
        (c.tags ?? []).some((t) => t.toLowerCase().includes(q))
      );
    }
    if (filters.audience && filters.audience !== "all") result = result.filter((c) => c.audience === filters.audience);
    if (filters.status && filters.status !== "all") result = result.filter((c) => c.status === filters.status);
    return result;
  }, [search, filters, queries]);

  const pendingCount = queries.filter((q) => q.status === "pending").length;
  const publishedCount = queries.filter((q) => q.status === "published").length;
  const totalViews = queries.reduce((s, q) => s + q.views_count, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">АІ-форум — Модерація</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {queries.length} запитів від AI-консультанта
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10"><Bot className="h-5 w-5 text-primary" /></div>
            <div><p className="text-2xl font-bold text-foreground">{queries.length}</p><p className="text-xs text-muted-foreground">Всього</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-destructive/10"><Clock className="h-5 w-5 text-destructive" /></div>
            <div><p className="text-2xl font-bold text-foreground">{pendingCount}</p><p className="text-xs text-muted-foreground">На модерації</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10"><CheckCircle className="h-5 w-5 text-primary" /></div>
            <div><p className="text-2xl font-bold text-foreground">{publishedCount}</p><p className="text-xs text-muted-foreground">Опубліковано</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10"><Eye className="h-5 w-5 text-primary" /></div>
            <div><p className="text-2xl font-bold text-foreground">{totalViews.toLocaleString("uk-UA")}</p><p className="text-xs text-muted-foreground">Переглядів</p></div>
          </CardContent>
        </Card>
      </div>

      {selected.size > 0 && (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border/60">
          <span className="text-sm font-medium text-foreground">Обрано: {selected.size}</span>
          <Button size="sm" variant="default" className="gap-1" disabled={actionLoading} onClick={() => bulkAction("published")}>
            {actionLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
            Опублікувати
          </Button>
          <Button size="sm" variant="outline" className="gap-1" disabled={actionLoading} onClick={() => bulkAction("approved")}>
            <CheckCircle className="h-3 w-3" /> Схвалити
          </Button>
          <Button size="sm" variant="destructive" className="gap-1" disabled={actionLoading} onClick={() => bulkAction("rejected")}>
            <XCircle className="h-3 w-3" /> Відхилити
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setSelected(new Set())}>Скасувати</Button>
        </div>
      )}

      <ContentFilters
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Пошук AI-запитів..."
        filters={[
          { key: "status", label: "Статус", options: [
            { value: "pending", label: "На модерації" },
            { value: "approved", label: "Схвалено" },
            { value: "published", label: "Опубліковано" },
            { value: "rejected", label: "Відхилено" },
          ]},
          { key: "audience", label: "Аудиторія", options: [
            { value: "business", label: "Бізнес" },
            { value: "individual", label: "Фізособа" },
          ]},
        ]}
        filterValues={filters}
        onFilterChange={(k, v) => setFilters((p) => ({ ...p, [k]: v }))}
        onClearAll={() => { setSearch(""); setFilters({}); }}
      />

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <ContentTable columns={columns} data={filtered} onRowClick={(row) => navigate(`/admin/content/ai-consultation/${row.slug ?? row.id}`)} />
      )}
    </div>
  );
}
