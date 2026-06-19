import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Loader2, CheckCircle2, Trash2, Eye, ExternalLink, Pencil, X, Check, History, Maximize2, MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { ContentIdea } from "@/admin/hooks/useContentIdeas";
import { recordGeneration } from "@/admin/hooks/useIdeaGenerations";
import GenerationHistorySheet from "./GenerationHistorySheet";

interface IdeaCardProps {
  idea: ContentIdea;
  pageContext: { title: string; category: string };
  onUpdate: (id: string, patch: Partial<ContentIdea>) => Promise<boolean>;
  onDelete: (id: string) => void;
  onOpenEditor: (idea: ContentIdea) => void;
  onOpenDetail?: (idea: ContentIdea) => void;
  onChatPrompt?: (prompt: string) => void;
}

const SOURCE_LABEL: Record<ContentIdea["source"], string> = {
  ai_chat_query: "Запит чату",
  seo_gap: "SEO-розрив",
  manual: "Вручну",
  ai_suggested: "AI-пропозиція",
};

const STATUS_LABEL: Record<ContentIdea["status"], { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  todo: { label: "Готова до генерації", variant: "outline" },
  generating: { label: "Генерується…", variant: "secondary" },
  generated: { label: "Згенеровано", variant: "default" },
  published: { label: "Опубліковано", variant: "default" },
  dismissed: { label: "Відхилено", variant: "destructive" },
};

const TYPE_BY_PATH = (path: string): string => {
  if (path.includes("dovidnyky") || path.includes("learn")) return "guide";
  if (path === "/" || path.includes("pricing")) return "explainer";
  if (path.includes("analytics")) return "analysis";
  return "guide";
};

export default function IdeaCard({ idea, pageContext, onUpdate, onDelete, onOpenEditor, onOpenDetail, onChatPrompt }: IdeaCardProps) {
  const [generating, setGenerating] = useState(idea.status === "generating");
  const [editing, setEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState(idea.title);
  const [draftDesc, setDraftDesc] = useState(idea.description ?? "");
  const [saving, setSaving] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [versionCount, setVersionCount] = useState<number>(0);

  // Lazy fetch version count for badge (head-count, no payload)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { count } = await supabase
        .from("content_idea_generations")
        .select("id", { count: "exact", head: true })
        .eq("idea_id", idea.id);
      if (!cancelled) setVersionCount(count ?? 0);
    })();
    return () => {
      cancelled = true;
    };
  }, [idea.id, idea.generated_at]);

  const startEdit = () => {
    setDraftTitle(idea.title);
    setDraftDesc(idea.description ?? "");
    setEditing(true);
  };
  const cancelEdit = () => {
    setEditing(false);
    setDraftTitle(idea.title);
    setDraftDesc(idea.description ?? "");
  };
  const saveEdit = async () => {
    const t = draftTitle.trim();
    if (t.length < 5) {
      toast.error("Заголовок має містити щонайменше 5 символів");
      return;
    }
    setSaving(true);
    const ok = await onUpdate(idea.id, {
      title: t,
      description: draftDesc.trim() || null,
    });
    setSaving(false);
    if (ok) {
      setEditing(false);
      toast.success("Збережено");
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    await onUpdate(idea.id, { status: "generating" });
    const promptSnapshot = {
      topic: idea.title,
      description: idea.description,
      tags: idea.tags,
      audience: idea.audience,
      contentTarget: idea.content_target,
    };
    try {
      const { data, error } = await supabase.functions.invoke("generate-article", {
        body: {
          topic: idea.title,
          type: TYPE_BY_PATH(idea.page_path),
          audience: idea.audience === "business" ? "fop" : idea.audience === "individual" ? "personal" : "fop",
          hub: pageContext.category,
          keywords: idea.tags,
          tone: "professional",
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      const wordCount = data?.wordCount ?? 0;
      await onUpdate(idea.id, {
        status: "generated",
        generated_content: data.content,
        generated_tldr: data.tldr,
        generated_word_count: wordCount,
        generated_at: new Date().toISOString(),
      });
      // Record version in history
      await recordGeneration({
        idea,
        status: "success",
        prompt: promptSnapshot,
        result: {
          content: data.content,
          tldr: data.tldr ?? "",
          wordCount,
          model: data.model,
          systemPromptVersion: data.systemPromptVersion,
          durationMs: data.durationMs,
        },
      });
      setVersionCount((c) => c + 1);
      toast.success(`Згенеровано ${wordCount} слів. Відкриваємо редактор…`);
      setTimeout(() => onOpenEditor({ ...idea, status: "generated", generated_content: data.content, generated_tldr: data.tldr, generated_word_count: wordCount, generated_at: new Date().toISOString() }), 300);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Не вдалось згенерувати";
      toast.error(msg);
      await onUpdate(idea.id, { status: "todo" });
      // Record failed attempt
      await recordGeneration({
        idea,
        status: "error",
        prompt: promptSnapshot,
        errorMessage: msg,
      });
      setVersionCount((c) => c + 1);
    } finally {
      setGenerating(false);
    }
  };

  const status = STATUS_LABEL[idea.status];
  const isGenerated = idea.status === "generated" || idea.status === "published";

  const canEdit = idea.status === "todo";

  return (
    <>
    <Card className={cn("p-3 space-y-2", isGenerated && "border-primary/40 bg-primary/[0.03]", editing && "border-primary/60 ring-1 ring-primary/20")}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap mb-1">
            <Badge variant={status.variant} className="text-[10px] h-4 px-1.5">
              {status.label}
            </Badge>
            <Badge variant="outline" className="text-[10px] h-4 px-1.5">
              {SOURCE_LABEL[idea.source]}
            </Badge>
            {idea.priority >= 4 && (
              <Badge variant="destructive" className="text-[10px] h-4 px-1.5">P{idea.priority}</Badge>
            )}
            {versionCount > 0 && (
              <button
                type="button"
                onClick={() => setHistoryOpen(true)}
                className="inline-flex items-center gap-1 text-[10px] h-4 px-1.5 rounded border bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition"
                title="Історія генерацій"
              >
                <History className="h-2.5 w-2.5" /> v{versionCount}
              </button>
            )}
          </div>
          {editing ? (
            <div className="space-y-1.5">
              <Input
                value={draftTitle}
                onChange={(e) => setDraftTitle(e.target.value)}
                placeholder="Заголовок ідеї"
                className="h-7 text-sm font-semibold"
                autoFocus
              />
              <Textarea
                value={draftDesc}
                onChange={(e) => setDraftDesc(e.target.value)}
                placeholder="Короткий опис (контекст для AI)"
                rows={3}
                className="text-xs resize-none"
              />
            </div>
          ) : (
            <>
              <h4
                className={cn("text-sm font-semibold leading-tight line-clamp-2", onOpenDetail && "cursor-pointer hover:text-primary transition")}
                onClick={() => onOpenDetail?.(idea)}
                title={onOpenDetail ? "Відкрити деталі" : undefined}
              >
                {idea.title}
              </h4>
              {idea.description && (
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{idea.description}</p>
              )}
            </>
          )}
        </div>
        {!editing && (
          <div className="flex items-center gap-0.5 shrink-0">
            {onOpenDetail && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-foreground"
                onClick={() => onOpenDetail(idea)}
                aria-label="Деталі"
                title="Розгорнути деталі"
              >
                <Maximize2 className="h-3.5 w-3.5" />
              </Button>
            )}
            {onChatPrompt && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-foreground"
                onClick={() => {
                  const draftBlock = idea.generated_content
                    ? `\nПоточна чернетка:\n\`\`\`md\n${idea.generated_content.slice(0, 4000)}\n\`\`\``
                    : "Чернетки ще немає.";
                  onChatPrompt(
                    `Розглянь ідею для ${idea.page_path}.\nЗаголовок: ${idea.title}\nОпис: ${idea.description ?? "—"}\nТеги: ${idea.tags.join(", ") || "—"}\n${draftBlock}\n\nПрокоментуй і запропонуй покращення.`,
                  );
                  toast.success("Передано в чат");
                }}
                aria-label="Обговорити в чаті"
                title="Обговорити в чаті"
              >
                <MessageCircle className="h-3.5 w-3.5" />
              </Button>
            )}
            {canEdit && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-foreground"
                onClick={startEdit}
                aria-label="Редагувати ідею"
                title="Редагувати"
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-destructive"
              onClick={() => onDelete(idea.id)}
              aria-label="Видалити ідею"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}
      </div>

      {!editing && idea.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {idea.tags.slice(0, 4).map((t) => (
            <span key={t} className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
              #{t}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center gap-1.5 pt-1">
        {editing ? (
          <>
            <Button
              size="sm"
              className="h-7 text-xs gap-1.5 flex-1"
              onClick={saveEdit}
              disabled={saving || draftTitle.trim().length < 5}
            >
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
              Зберегти
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 text-xs gap-1.5"
              onClick={cancelEdit}
              disabled={saving}
            >
              <X className="h-3.5 w-3.5" /> Скасувати
            </Button>
          </>
        ) : (
          <>
            {!isGenerated && (
              <Button
                size="sm"
                className="h-7 text-xs gap-1.5 flex-1"
                onClick={handleGenerate}
                disabled={generating}
              >
                {generating ? (
                  <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Генерація…</>
                ) : (
                  <><Sparkles className="h-3.5 w-3.5" /> Згенерувати</>
                )}
              </Button>
            )}
            {isGenerated && (
              <>
                <Button
                  size="sm"
                  variant="default"
                  className="h-7 text-xs gap-1.5 flex-1"
                  onClick={() => onOpenEditor(idea)}
                >
                  <Eye className="h-3.5 w-3.5" /> Відкрити в редакторі
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 text-xs gap-1.5"
                  onClick={handleGenerate}
                  disabled={generating}
                  title="Перегенерувати"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 text-xs gap-1.5"
                  onClick={() => setHistoryOpen(true)}
                  title="Історія генерацій"
                >
                  <History className="h-3.5 w-3.5" />
                </Button>
              </>
            )}
            {!isGenerated && versionCount > 0 && (
              <Button
                size="sm"
                variant="ghost"
                className="h-7 text-xs gap-1.5"
                onClick={() => setHistoryOpen(true)}
                title="Історія генерацій"
              >
                <History className="h-3.5 w-3.5" />
              </Button>
            )}
            {idea.source === "ai_chat_query" && idea.source_ref && (
              <Button
                size="sm"
                variant="ghost"
                className="h-7 text-xs gap-1 px-2"
                asChild
                title="Оригінальний запит"
              >
                <a href={`/admin/ai-cms?query=${idea.source_ref}`}>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </Button>
            )}
          </>
        )}
      </div>

      {isGenerated && idea.generated_word_count && (
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground pt-1 border-t border-border/40">
          <CheckCircle2 className="h-3 w-3 text-primary" />
          <span>{idea.generated_word_count} слів</span>
          {idea.generated_at && <span>· {new Date(idea.generated_at).toLocaleDateString("uk-UA")}</span>}
        </div>
      )}
    </Card>
    <GenerationHistorySheet
      open={historyOpen}
      onOpenChange={setHistoryOpen}
      idea={idea}
      onUpdate={onUpdate}
      onOpenEditor={onOpenEditor}
    />
    </>
  );
}
