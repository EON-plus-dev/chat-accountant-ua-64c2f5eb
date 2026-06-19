import { useMemo, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Loader2,
  History as HistoryIcon,
  RotateCcw,
  Eye,
  Trash2,
  ChevronDown,
  AlertCircle,
  CheckCircle2,
  GitCompare,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { ContentIdea } from "@/admin/hooks/useContentIdeas";
import {
  useIdeaGenerations,
  recordGeneration,
  type IdeaGeneration,
} from "@/admin/hooks/useIdeaGenerations";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  idea: ContentIdea | null;
  onUpdate: (id: string, patch: Partial<ContentIdea>) => Promise<boolean>;
  onOpenEditor: (idea: ContentIdea) => void;
}

function fmtDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("uk-UA", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function GenerationHistorySheet({
  open,
  onOpenChange,
  idea,
  onUpdate,
  onOpenEditor,
}: Props) {
  const { generations, loading, refresh, deleteGeneration } = useIdeaGenerations(
    open ? idea?.id : undefined,
  );
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [compareOpen, setCompareOpen] = useState(false);
  const [compareWith, setCompareWith] = useState<IdeaGeneration | null>(null);
  const [reverting, setReverting] = useState<string | null>(null);

  const previewGen = useMemo(
    () => generations.find((g) => g.id === previewId) ?? null,
    [generations, previewId],
  );

  const handleRevert = async (g: IdeaGeneration) => {
    if (!idea) return;
    if (g.status !== "success" || !g.generated_content) {
      toast.error("Можна відкотити лише успішну версію з контентом");
      return;
    }
    setReverting(g.id);
    try {
      const ok = await onUpdate(idea.id, {
        status: "generated",
        generated_content: g.generated_content,
        generated_tldr: g.generated_tldr,
        generated_word_count: g.generated_word_count,
        generated_seo_title: g.generated_seo_title,
        generated_seo_description: g.generated_seo_description,
        generated_at: new Date().toISOString(),
      });
      if (!ok) return;
      // Audit: append a "revert" entry to history
      await recordGeneration({
        idea: { ...idea, title: g.prompt_topic, description: g.prompt_description },
        status: "success",
        prompt: {
          topic: g.prompt_topic,
          description: g.prompt_description,
          tags: g.prompt_tags,
          audience: g.prompt_audience ?? idea.audience,
          contentTarget: g.prompt_content_target ?? idea.content_target,
        },
        result: {
          content: g.generated_content,
          tldr: g.generated_tldr ?? "",
          wordCount: g.generated_word_count ?? 0,
          model: g.model ?? undefined,
          systemPromptVersion: g.system_prompt_version ?? undefined,
          durationMs: 0,
          seoTitle: g.generated_seo_title ?? undefined,
          seoDescription: g.generated_seo_description ?? undefined,
        },
        sourceRef: `revert:v${g.version}`,
      });
      await refresh();
      toast.success(`Версію v${g.version} зроблено поточною`);
      setTimeout(() => {
        onOpenEditor({
          ...idea,
          status: "generated",
          generated_content: g.generated_content,
          generated_tldr: g.generated_tldr,
          generated_word_count: g.generated_word_count,
          generated_at: new Date().toISOString(),
        });
        onOpenChange(false);
      }, 200);
    } finally {
      setReverting(null);
    }
  };

  const successVersions = generations.filter((g) => g.status === "success");

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-full sm:max-w-xl p-0 flex flex-col">
          <SheetHeader className="p-4 border-b">
            <SheetTitle className="flex items-center gap-2 text-base">
              <HistoryIcon className="h-4 w-4 text-primary" />
              Історія генерацій
            </SheetTitle>
            <SheetDescription className="text-xs">
              {idea?.title}
              <span className="block mt-0.5 text-muted-foreground/80">
                {idea?.page_path} · версій: {generations.length}
              </span>
            </SheetDescription>
          </SheetHeader>

          <ScrollArea className="flex-1">
            <div className="p-4 space-y-2">
              {loading && (
                <div className="flex items-center justify-center py-12 text-muted-foreground text-sm">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" /> Завантаження…
                </div>
              )}
              {!loading && generations.length === 0 && (
                <div className="text-center py-12 text-muted-foreground text-sm">
                  Ще немає жодної генерації для цієї ідеї.
                </div>
              )}
              {!loading &&
                generations.map((g) => (
                  <VersionCard
                    key={g.id}
                    gen={g}
                    onPreview={() => setPreviewId(g.id)}
                    onRevert={() => handleRevert(g)}
                    onDelete={async () => {
                      if (await deleteGeneration(g.id)) toast.success("Версію видалено");
                    }}
                    onCompare={() => {
                      setCompareWith(g);
                      setCompareOpen(true);
                    }}
                    canCompare={successVersions.length >= 2 && g.status === "success"}
                    reverting={reverting === g.id}
                  />
                ))}
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>

      {/* Preview dialog */}
      <Dialog open={!!previewId} onOpenChange={(v) => !v && setPreviewId(null)}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-sm">
              v{previewGen?.version} — {previewGen && fmtDate(previewGen.created_at)}
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="flex-1 -mx-6 px-6">
            <pre className="text-xs whitespace-pre-wrap font-mono bg-muted/30 rounded p-3">
              {previewGen?.generated_content ?? previewGen?.error_message ?? "—"}
            </pre>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Compare dialog: latest success vs selected */}
      <Dialog open={compareOpen} onOpenChange={setCompareOpen}>
        <DialogContent className="max-w-5xl max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-sm flex items-center gap-2">
              <GitCompare className="h-4 w-4" /> Порівняння версій
            </DialogTitle>
          </DialogHeader>
          {(() => {
            const latest = successVersions[0];
            const other = compareWith;
            if (!latest || !other) return <p className="text-sm text-muted-foreground">Немає даних</p>;
            const [a, b] = latest.id === other.id
              ? [successVersions[1], latest]
              : [other, latest];
            if (!a || !b) return <p className="text-sm text-muted-foreground">Потрібно мінімум 2 успішні версії</p>;
            return (
              <div className="grid grid-cols-2 gap-4 flex-1 overflow-hidden">
                {[a, b].map((g, idx) => (
                  <div key={g.id} className="flex flex-col overflow-hidden">
                    <div className="text-xs font-semibold mb-2 flex items-center gap-2">
                      <Badge variant={idx === 1 ? "default" : "outline"}>
                        v{g.version} {idx === 1 ? "(новіша)" : ""}
                      </Badge>
                      <span className="text-muted-foreground">
                        {fmtDate(g.created_at)} · {g.generated_word_count ?? 0} слів
                      </span>
                    </div>
                    <ScrollArea className="flex-1 border rounded">
                      <pre className="text-xs whitespace-pre-wrap font-mono p-3">
                        {g.generated_content ?? "—"}
                      </pre>
                    </ScrollArea>
                  </div>
                ))}
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
    </>
  );
}

interface VersionCardProps {
  gen: IdeaGeneration;
  onPreview: () => void;
  onRevert: () => void;
  onDelete: () => void;
  onCompare: () => void;
  canCompare: boolean;
  reverting: boolean;
}

function VersionCard({ gen, onPreview, onRevert, onDelete, onCompare, canCompare, reverting }: VersionCardProps) {
  const [open, setOpen] = useState(false);
  const isError = gen.status === "error";
  return (
    <div
      className={cn(
        "border rounded-md p-3 space-y-2 bg-card",
        isError && "border-destructive/40 bg-destructive/5",
      )}
    >
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant={isError ? "destructive" : "default"} className="text-[10px] h-5 px-1.5">
            {isError ? <AlertCircle className="h-3 w-3 mr-1" /> : <CheckCircle2 className="h-3 w-3 mr-1" />}
            v{gen.version}
          </Badge>
          <span className="text-xs text-muted-foreground">{fmtDate(gen.created_at)}</span>
          {gen.model && (
            <Badge variant="outline" className="text-[10px] h-5 px-1.5">
              {gen.model.split("/").pop()}
            </Badge>
          )}
          {gen.generated_word_count ? (
            <span className="text-[10px] text-muted-foreground">{gen.generated_word_count} слів</span>
          ) : null}
          {gen.duration_ms ? (
            <span className="text-[10px] text-muted-foreground">{(gen.duration_ms / 1000).toFixed(1)}с</span>
          ) : null}
          {gen.source_ref?.startsWith("revert:") && (
            <Badge variant="secondary" className="text-[10px] h-5 px-1.5">
              ↩ {gen.source_ref.replace("revert:", "")}
            </Badge>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-destructive"
          onClick={onDelete}
          title="Видалити версію"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>

      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger asChild>
          <button className="text-[11px] text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
            <ChevronDown className={cn("h-3 w-3 transition-transform", open && "rotate-180")} />
            {open ? "Сховати prompt" : "Показати prompt і preview"}
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-2 pt-2">
          <div className="text-[11px] space-y-1 bg-muted/30 rounded p-2">
            <div><span className="text-muted-foreground">Тема:</span> {gen.prompt_topic}</div>
            {gen.prompt_description && (
              <div><span className="text-muted-foreground">Опис:</span> {gen.prompt_description}</div>
            )}
            {gen.prompt_tags.length > 0 && (
              <div><span className="text-muted-foreground">Теги:</span> {gen.prompt_tags.join(", ")}</div>
            )}
            <div className="flex gap-3 text-muted-foreground">
              {gen.prompt_audience && <span>Аудиторія: {gen.prompt_audience}</span>}
              {gen.system_prompt_version && <span>SP: {gen.system_prompt_version}</span>}
            </div>
          </div>
          {isError ? (
            <div className="text-[11px] text-destructive bg-destructive/10 rounded p-2">
              {gen.error_message ?? "Помилка"}
            </div>
          ) : (
            <p className="text-[11px] text-muted-foreground line-clamp-3">
              {(gen.generated_content ?? "").slice(0, 280)}…
            </p>
          )}
        </CollapsibleContent>
      </Collapsible>

      <Separator />

      <div className="flex items-center gap-1.5 flex-wrap">
        <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={onPreview}>
          <Eye className="h-3.5 w-3.5" /> Переглянути
        </Button>
        {!isError && (
          <Button
            size="sm"
            className="h-7 text-xs gap-1"
            onClick={onRevert}
            disabled={reverting}
          >
            {reverting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RotateCcw className="h-3.5 w-3.5" />}
            Зробити поточною
          </Button>
        )}
        {canCompare && (
          <Button size="sm" variant="ghost" className="h-7 text-xs gap-1" onClick={onCompare}>
            <GitCompare className="h-3.5 w-3.5" /> Порівняти
          </Button>
        )}
      </div>
    </div>
  );
}
