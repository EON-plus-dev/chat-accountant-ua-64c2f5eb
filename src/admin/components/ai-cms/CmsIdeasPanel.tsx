import { useMemo, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, Plus, Lightbulb } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useContentIdeas, type ContentIdea } from "@/admin/hooks/useContentIdeas";
import { findSystemPage } from "./systemPages";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import IdeaCard from "./IdeaCard";
import IdeaDetailSheet from "./IdeaDetailSheet";
import { appendPageHistory, makeId } from "./articleChangeHistory";

interface CmsIdeasPanelProps {
  currentPath: string;
  onOpenInEditor: (idea: ContentIdea) => void;
  onChatPrompt?: (prompt: string) => void;
}

export default function CmsIdeasPanel({ currentPath, onOpenInEditor, onChatPrompt }: CmsIdeasPanelProps) {
  const sys = findSystemPage(currentPath);
  const [detailIdea, setDetailIdea] = useState<ContentIdea | null>(null);
  const { ideas, loading, refresh, updateIdea: updateIdeaRaw, insertIdea: insertIdeaRaw, deleteIdea: deleteIdeaRaw } = useContentIdeas(currentPath);

  const logIdea = (action: "created" | "accepted" | "dismissed" | "deleted" | "generated", title: string, ideaId?: string) => {
    appendPageHistory(currentPath, [{
      id: makeId(),
      articleId: "",
      at: new Date().toISOString(),
      author: "admin",
      kind: "idea-action",
      ideaAction: action,
      ideaId,
      ideaTitle: title,
      summary: `Ідея «${title.slice(0, 60)}${title.length > 60 ? "…" : ""}» — ${action}`,
    }]);
  };

  const insertIdea: typeof insertIdeaRaw = async (payload) => {
    const created = await insertIdeaRaw(payload);
    if (created) logIdea("created", payload.title, created.id);
    return created;
  };
  const updateIdea: typeof updateIdeaRaw = async (id, patch) => {
    const result = await updateIdeaRaw(id, patch);
    if (patch.status) {
      const title = ideas.find((i) => i.id === id)?.title ?? "Ідея";
      const action = patch.status === "dismissed" ? "dismissed" : patch.status === "generated" || patch.status === "published" ? "accepted" : "created";
      logIdea(action, title, id);
    }
    return result;
  };
  const deleteIdea: typeof deleteIdeaRaw = async (id) => {
    const title = ideas.find((i) => i.id === id)?.title ?? "Ідея";
    await deleteIdeaRaw(id);
    logIdea("deleted", title, id);
  };
  const [suggesting, setSuggesting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newIdea, setNewIdea] = useState({ title: "", description: "" });

  const grouped = useMemo(() => {
    const todo = ideas.filter((i) => i.status === "todo" || i.status === "generating");
    const ready = ideas.filter((i) => i.status === "generated" || i.status === "published");
    const dismissed = ideas.filter((i) => i.status === "dismissed");
    return { todo, ready, dismissed };
  }, [ideas]);

  const handleSuggest = async () => {
    if (!sys) {
      toast.error("Сторінка не зареєстрована в SYSTEM_PAGES");
      return;
    }
    if (sys.contentTarget === "none") {
      toast.error("Для цієї сторінки генерація статей не передбачена (contentTarget = none)");
      return;
    }
    setSuggesting(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-content-ideas", {
        body: {
          pagePath: currentPath,
          pageContext: {
            title: sys.title,
            description: sys.description,
            category: sys.category,
            contentTarget: sys.contentTarget,
          },
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      const createdCount = data?.created ?? 0;
      toast.success(`Додано ${createdCount} ідей`);
      if (createdCount > 0) {
        appendPageHistory(currentPath, [{
          id: makeId(),
          articleId: "",
          at: new Date().toISOString(),
          author: "AI",
          kind: "idea-action",
          ideaAction: "generated",
          summary: `AI запропонував ${createdCount} нових ідей`,
        }]);
      }
      await refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Не вдалось отримати ідеї");
    } finally {
      setSuggesting(false);
    }
  };

  const handleAddManual = async () => {
    if (!newIdea.title.trim()) return;
    const created = await insertIdea({
      page_path: currentPath,
      title: newIdea.title.trim(),
      description: newIdea.description.trim() || null,
      content_target: sys?.contentTarget ?? "article",
      audience: "business",
      tags: [],
      priority: 3,
      status: "todo",
      source: "manual",
    });
    if (created) {
      setNewIdea({ title: "", description: "" });
      setDialogOpen(false);
      toast.success("Ідею додано");
    }
  };

  const ctx = { title: sys?.title ?? currentPath, category: sys?.category ?? "" };

  return (
    <div className="h-full flex flex-col bg-background border-l border-border/60">
      <div className="shrink-0 px-3 py-2 border-b border-border/60 bg-muted/30">
        <div className="flex items-center justify-between gap-2 mb-1">
          <div className="flex items-center gap-1.5 min-w-0">
            <Lightbulb className="h-3.5 w-3.5 text-primary shrink-0" />
            <h3 className="text-sm font-semibold truncate">Ідеї контенту</h3>
            <Badge variant="secondary" className="text-[10px] h-4 shrink-0">{ideas.length}</Badge>
          </div>
          <Button size="sm" variant="ghost" className="h-6 text-xs px-1.5 gap-1" onClick={() => setDialogOpen(true)}>
            <Plus className="h-3 w-3" />
          </Button>
        </div>
        <Button
          size="sm"
          variant="outline"
          className="h-7 text-xs w-full gap-1.5"
          onClick={handleSuggest}
          disabled={suggesting}
        >
          {suggesting ? (
            <><Loader2 className="h-3.5 w-3.5 animate-spin" /> AI генерує ідеї…</>
          ) : (
            <><Sparkles className="h-3.5 w-3.5" /> Запропонувати ідеї від AI</>
          )}
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-3 space-y-4">
          {loading && (
            <div className="flex items-center justify-center py-8 text-xs text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin mr-2" /> Завантаження…
            </div>
          )}
          {!loading && ideas.length === 0 && (
            <div className="text-center py-8 px-2 space-y-2">
              <Lightbulb className="h-8 w-8 text-muted-foreground/40 mx-auto" />
              <p className="text-xs text-muted-foreground">
                Ще немає ідей для цієї сторінки. Натисніть «Запропонувати ідеї від AI» вгорі.
              </p>
            </div>
          )}

          {grouped.todo.length > 0 && (
            <Section title="До генерації" count={grouped.todo.length}>
              {grouped.todo.map((i) => (
                <IdeaCard key={i.id} idea={i} pageContext={ctx} onUpdate={updateIdea} onDelete={deleteIdea} onOpenEditor={onOpenInEditor} onOpenDetail={setDetailIdea} onChatPrompt={onChatPrompt} />
              ))}
            </Section>
          )}
          {grouped.ready.length > 0 && (
            <Section title="Готові статті" count={grouped.ready.length}>
              {grouped.ready.map((i) => (
                <IdeaCard key={i.id} idea={i} pageContext={ctx} onUpdate={updateIdea} onDelete={deleteIdea} onOpenEditor={onOpenInEditor} onOpenDetail={setDetailIdea} onChatPrompt={onChatPrompt} />
              ))}
            </Section>
          )}
          {grouped.dismissed.length > 0 && (
            <Section title="Відхилено" count={grouped.dismissed.length}>
              {grouped.dismissed.map((i) => (
                <IdeaCard key={i.id} idea={i} pageContext={ctx} onUpdate={updateIdea} onDelete={deleteIdea} onOpenEditor={onOpenInEditor} onOpenDetail={setDetailIdea} onChatPrompt={onChatPrompt} />
              ))}
            </Section>
          )}
        </div>
      </ScrollArea>

      <IdeaDetailSheet
        idea={detailIdea}
        open={!!detailIdea}
        onOpenChange={(v) => !v && setDetailIdea(null)}
        pageContext={ctx}
        onUpdate={updateIdea}
        onDelete={deleteIdea}
        onChatPrompt={onChatPrompt}
        onOpenEditor={onOpenInEditor}
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Нова ідея контенту</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              placeholder="Заголовок (наприклад: «Як ФОП 3 групи перейти на 2 у 2026»)"
              value={newIdea.title}
              onChange={(e) => setNewIdea((p) => ({ ...p, title: e.target.value }))}
            />
            <Textarea
              placeholder="Короткий опис ідеї (опційно)"
              value={newIdea.description}
              onChange={(e) => setNewIdea((p) => ({ ...p, description: e.target.value }))}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialogOpen(false)}>Скасувати</Button>
            <Button onClick={handleAddManual} disabled={!newIdea.title.trim()}>Додати</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Section({ title, count, children }: { title: string; count: number; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground uppercase tracking-wide px-1">
        <span>{title}</span>
        <Badge variant="outline" className="text-[10px] h-4 px-1.5">{count}</Badge>
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}
