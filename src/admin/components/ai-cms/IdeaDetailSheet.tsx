import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sparkles, Loader2, Check, X, MessageCircle, History, CheckCircle2,
  Trash2, Eye, RefreshCw, Send,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { renderMarkdown } from "@/lib/markdownRenderer";
import { recordGeneration } from "@/admin/hooks/useIdeaGenerations";
import type { ContentIdea } from "@/admin/hooks/useContentIdeas";
import GenerationHistorySheet from "./GenerationHistorySheet";

interface Props {
  idea: ContentIdea | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  pageContext: { title: string; category: string };
  onUpdate: (id: string, patch: Partial<ContentIdea>) => Promise<boolean>;
  onDelete: (id: string) => void;
  onChatPrompt?: (prompt: string) => void;
  onOpenEditor?: (idea: ContentIdea) => void;
}

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

export default function IdeaDetailSheet({
  idea, open, onOpenChange, pageContext, onUpdate, onDelete, onChatPrompt, onOpenEditor,
}: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [content, setContent] = useState("");
  const [tldr, setTldr] = useState("");
  const [contentPreview, setContentPreview] = useState(false);
  const [briefDirty, setBriefDirty] = useState(false);
  const [draftDirty, setDraftDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  useEffect(() => {
    if (!idea) return;
    setTitle(idea.title);
    setDescription(idea.description ?? "");
    setTags(idea.tags.join(", "));
    setContent(idea.generated_content ?? "");
    setTldr(idea.generated_tldr ?? "");
    setBriefDirty(false);
    setDraftDirty(false);
    setContentPreview(false);
  }, [idea?.id]);

  if (!idea) return null;
  const status = STATUS_LABEL[idea.status];
  const isGenerated = idea.status === "generated" || idea.status === "published";

  const saveBrief = async () => {
    const t = title.trim();
    if (t.length < 5) { toast.error("Заголовок ≥ 5 символів"); return; }
    setSaving(true);
    const ok = await onUpdate(idea.id, {
      title: t,
      description: description.trim() || null,
      tags: tags.split(",").map((s) => s.trim()).filter(Boolean),
    });
    setSaving(false);
    if (ok) { setBriefDirty(false); toast.success("Бриф збережено"); }
  };

  const saveDraft = async () => {
    setSaving(true);
    const ok = await onUpdate(idea.id, {
      generated_content: content,
      generated_tldr: tldr || null,
      generated_word_count: content.trim().split(/\s+/).filter(Boolean).length,
    });
    setSaving(false);
    if (ok) { setDraftDirty(false); toast.success("Чернетку збережено"); }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    await onUpdate(idea.id, { status: "generating" });
    const promptSnapshot = {
      topic: idea.title, description: idea.description, tags: idea.tags,
      audience: idea.audience, contentTarget: idea.content_target,
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
      await recordGeneration({
        idea, status: "success", prompt: promptSnapshot,
        result: { content: data.content, tldr: data.tldr ?? "", wordCount, model: data.model, systemPromptVersion: data.systemPromptVersion, durationMs: data.durationMs },
      });
      setContent(data.content);
      setTldr(data.tldr ?? "");
      setDraftDirty(false);
      toast.success(`Згенеровано ${wordCount} слів`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Не вдалось згенерувати";
      toast.error(msg);
      await onUpdate(idea.id, { status: "todo" });
      await recordGeneration({ idea, status: "error", prompt: promptSnapshot, errorMessage: msg });
    } finally {
      setGenerating(false);
    }
  };

  const discussInChat = () => {
    if (!onChatPrompt) return;
    const draftBlock = idea.generated_content
      ? `\nПоточна чернетка (${idea.generated_word_count ?? "?"} слів):\n\`\`\`md\n${idea.generated_content.slice(0, 4000)}\n\`\`\``
      : "Чернетки ще немає.";
    const prompt =
      `Розглянь ідею контенту для сторінки ${idea.page_path} (${pageContext.category}).\n\n` +
      `Заголовок: ${idea.title}\n` +
      `Опис: ${idea.description ?? "—"}\n` +
      `Аудиторія: ${idea.audience}\n` +
      `Теги: ${idea.tags.join(", ") || "—"}\n` +
      `Пріоритет: P${idea.priority}\n` +
      draftBlock +
      `\n\nЩо зробити: прокоментуй ідею, запропонуй покращення структури/тону/прикладів і вкажи, що потрібно для готовності до публікації. Якщо чернетки немає — запропонуй outline.`;
    onChatPrompt(prompt);
    onOpenChange(false);
    toast.success("Передано в чат");
  };

  const publish = async () => {
    const ok = await onUpdate(idea.id, { status: "published" });
    if (ok) toast.success("Опубліковано");
  };
  const dismiss = async () => {
    const ok = await onUpdate(idea.id, { status: "dismissed" });
    if (ok) { toast.success("Відхилено"); onOpenChange(false); }
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-full sm:max-w-2xl p-0 flex flex-col">
          <SheetHeader className="px-5 py-3 border-b shrink-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant={status.variant} className="text-[10px] h-5">{status.label}</Badge>
              <Badge variant="outline" className="text-[10px] h-5">P{idea.priority}</Badge>
              <Badge variant="outline" className="text-[10px] h-5">{idea.audience}</Badge>
              <code className="text-[10px] text-muted-foreground">{idea.page_path}</code>
            </div>
            <SheetTitle className="text-base mt-1">Деталі ідеї</SheetTitle>
            <SheetDescription className="text-xs">
              Редагуйте бриф, переглядайте та правте чернетку, або обговоріть з AI у чаті.
            </SheetDescription>
          </SheetHeader>

          <ScrollArea className="flex-1">
            <div className="px-5 py-4 space-y-5">
              <section className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold uppercase text-muted-foreground tracking-wide">Бриф</h4>
                  {briefDirty && (
                    <div className="flex items-center gap-1">
                      <Button size="sm" variant="ghost" className="h-6 text-xs gap-1" onClick={() => {
                        setTitle(idea.title); setDescription(idea.description ?? ""); setTags(idea.tags.join(", ")); setBriefDirty(false);
                      }}>
                        <X className="h-3 w-3" /> Скасувати
                      </Button>
                      <Button size="sm" className="h-6 text-xs gap-1" onClick={saveBrief} disabled={saving}>
                        {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />} Зберегти
                      </Button>
                    </div>
                  )}
                </div>
                <Input
                  value={title}
                  onChange={(e) => { setTitle(e.target.value); setBriefDirty(true); }}
                  placeholder="Заголовок"
                  className="text-sm font-semibold"
                />
                <Textarea
                  value={description}
                  onChange={(e) => { setDescription(e.target.value); setBriefDirty(true); }}
                  placeholder="Короткий опис / контекст для AI"
                  rows={3}
                  className="text-xs resize-none"
                />
                <Input
                  value={tags}
                  onChange={(e) => { setTags(e.target.value); setBriefDirty(true); }}
                  placeholder="теги через кому"
                  className="text-xs"
                />
              </section>

              <Separator />

              <section className="space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h4 className="text-xs font-semibold uppercase text-muted-foreground tracking-wide">
                    Чернетка {idea.generated_word_count ? `· ${idea.generated_word_count} слів` : ""}
                  </h4>
                  <div className="flex items-center gap-1">
                    {isGenerated && (
                      <Button size="sm" variant="ghost" className="h-6 text-xs gap-1" onClick={() => setContentPreview((v) => !v)}>
                        <Eye className="h-3 w-3" /> {contentPreview ? "Markdown" : "Прев'ю"}
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" className="h-6 text-xs gap-1" onClick={() => setHistoryOpen(true)}>
                      <History className="h-3 w-3" /> Історія
                    </Button>
                  </div>
                </div>

                {!isGenerated && !generating && (
                  <div className="rounded border border-dashed border-border/60 p-4 text-center text-xs text-muted-foreground">
                    Чернетки ще немає. Натисніть «Згенерувати», щоб AI створив повний текст за брифом.
                  </div>
                )}

                {generating && (
                  <div className="rounded border p-4 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" /> AI генерує статтю…
                  </div>
                )}

                {(isGenerated || content) && !generating && (
                  <>
                    {contentPreview ? (
                      <div
                        className="prose prose-sm dark:prose-invert max-w-none border rounded p-3 bg-muted/20 max-h-[40vh] overflow-auto"
                        dangerouslySetInnerHTML={{ __html: renderMarkdown(content || "") }}
                      />
                    ) : (
                      <Textarea
                        value={content}
                        onChange={(e) => { setContent(e.target.value); setDraftDirty(true); }}
                        className="min-h-[260px] font-mono text-[12px] leading-relaxed"
                        placeholder="Markdown-контент…"
                      />
                    )}
                    <Textarea
                      value={tldr}
                      onChange={(e) => { setTldr(e.target.value); setDraftDirty(true); }}
                      placeholder="TL;DR — 1-2 речення підсумку"
                      rows={2}
                      className="text-xs resize-none"
                    />
                    {draftDirty && (
                      <div className="flex justify-end">
                        <Button size="sm" className="h-7 text-xs gap-1" onClick={saveDraft} disabled={saving}>
                          {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />} Зберегти чернетку
                        </Button>
                      </div>
                    )}
                  </>
                )}

                {idea.generated_at && (
                  <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3 text-primary" />
                    Оновлено {new Date(idea.generated_at).toLocaleString("uk-UA")}
                  </p>
                )}
              </section>
            </div>
          </ScrollArea>

          <div className="border-t bg-muted/30 p-3 flex flex-wrap items-center gap-2 shrink-0">
            {!isGenerated ? (
              <Button size="sm" className="h-8 text-xs gap-1.5" onClick={handleGenerate} disabled={generating}>
                {generating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                Згенерувати
              </Button>
            ) : (
              <>
                <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5" onClick={handleGenerate} disabled={generating}>
                  {generating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                  Перегенерувати
                </Button>
                {idea.status !== "published" && (
                  <Button size="sm" className="h-8 text-xs gap-1.5" onClick={publish}>
                    <Send className="h-3.5 w-3.5" /> Опублікувати
                  </Button>
                )}
                {onOpenEditor && (
                  <Button size="sm" variant="ghost" className="h-8 text-xs gap-1.5" onClick={() => { onOpenEditor(idea); onOpenChange(false); }}>
                    <Eye className="h-3.5 w-3.5" /> Відкрити в редакторі
                  </Button>
                )}
              </>
            )}
            {onChatPrompt && (
              <Button size="sm" variant="ghost" className="h-8 text-xs gap-1.5" onClick={discussInChat}>
                <MessageCircle className="h-3.5 w-3.5" /> Обговорити в чаті
              </Button>
            )}
            <div className="ml-auto flex items-center gap-1">
              {idea.status !== "dismissed" && (
                <Button size="sm" variant="ghost" className="h-8 text-xs text-muted-foreground hover:text-destructive gap-1.5" onClick={dismiss}>
                  <X className="h-3.5 w-3.5" /> Відхилити
                </Button>
              )}
              <Button size="sm" variant="ghost" className="h-8 text-xs text-muted-foreground hover:text-destructive gap-1.5" onClick={() => { onDelete(idea.id); onOpenChange(false); }}>
                <Trash2 className="h-3.5 w-3.5" /> Видалити
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <GenerationHistorySheet
        open={historyOpen}
        onOpenChange={setHistoryOpen}
        idea={idea}
        onUpdate={onUpdate}
        onOpenEditor={onOpenEditor ?? (() => {})}
      />
    </>
  );
}
