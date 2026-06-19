import { useEffect, useMemo, useRef, useState } from "react";
import { ExternalLink, Sparkles, Save, Undo2, Layers, FileText, Eye, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { renderMarkdown } from "@/lib/markdownRenderer";
import type { Article } from "@/portal/data/articles";
import CmsSelectionPopover from "./CmsSelectionPopover";
import SystemPageLiveEditor from "./SystemPageLiveEditor";
import { findSystemPage } from "./systemPages";
import MarkdownToolbar from "@/admin/components/MarkdownToolbar";
import {
  appendHistory,
  appendPageHistory,
  diffArticleSnapshots,
} from "./articleChangeHistory";
import { supabase } from "@/integrations/supabase/client";

const SITE_ORIGIN = "https://chat-accountant-ua.lovable.app";

interface Screenshot {
  dataUrl: string;
  rect: { x: number; y: number; w: number; h: number };
  path: string;
}

interface CmsEditPreviewPaneProps {
  article: Article | undefined;
  currentPath: string;
  onChatPrompt: (prompt: string) => void;
  onCreateIdeaFromSelection?: (text: string) => void;
  onAttachScreenshot?: (shot: Screenshot) => void;
}

export default function CmsEditPreviewPane({
  article,
  currentPath,
  onChatPrompt,
  onCreateIdeaFromSelection,
  onAttachScreenshot,
}: CmsEditPreviewPaneProps) {
  const sys = useMemo(() => findSystemPage(currentPath), [currentPath]);
  const [content, setContent] = useState(article?.content ?? "");
  const [dirty, setDirty] = useState(false);
  const [subMode, setSubMode] = useState<"edit" | "preview">("edit");
  const [selection, setSelection] = useState<{ text: string; rect: DOMRect } | null>(null);
  const [author, setAuthor] = useState<string>("admin");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setContent(article?.content ?? "");
    setDirty(false);
    setSubMode("edit");
    setSelection(null);
  }, [article?.id, currentPath]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.email) setAuthor(data.user.email);
    });
  }, []);

  const previewHtml = useMemo(() => renderMarkdown(content || ""), [content]);

  // Selection → AI popover. Works for both textarea (edit) and rendered preview.
  useEffect(() => {
    if (!article) return;
    const handler = () => {
      const ta = textareaRef.current;
      if (subMode === "edit" && ta && document.activeElement === ta) {
        const start = ta.selectionStart ?? 0;
        const end = ta.selectionEnd ?? 0;
        if (end - start < 2) {
          setSelection(null);
          return;
        }
        const text = ta.value.slice(start, end).trim();
        if (!text) {
          setSelection(null);
          return;
        }
        const rect = ta.getBoundingClientRect();
        const fakeRect = new DOMRect(
          rect.left + rect.width / 2 - 1,
          rect.top + 16,
          2,
          2,
        );
        setSelection({ text, rect: fakeRect });
        return;
      }
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed) {
        setSelection(null);
        return;
      }
      const text = sel.toString().trim();
      if (!text || text.length < 2) {
        setSelection(null);
        return;
      }
      const anchor = sel.anchorNode;
      if (!anchor || !previewRef.current?.contains(anchor as Node)) {
        setSelection(null);
        return;
      }
      const range = sel.getRangeAt(0);
      setSelection({ text, rect: range.getBoundingClientRect() });
    };
    document.addEventListener("mouseup", handler);
    document.addEventListener("keyup", handler);
    return () => {
      document.removeEventListener("mouseup", handler);
      document.removeEventListener("keyup", handler);
    };
  }, [article, subMode]);

  const handleSave = () => {
    if (!article) return;
    const prev = {
      title: article.title,
      excerpt: article.excerpt,
      tldr: article.tldr,
      tags: article.tags,
      content: article.content ?? "",
    };
    const next = { ...prev, content };
    const entries = diffArticleSnapshots(article.id, prev, next, author);
    if (entries.length === 0) {
      toast.info("Немає змін для збереження");
      setDirty(false);
      return;
    }
    appendHistory(article.id, entries);
    appendPageHistory(currentPath, entries);
    toast.success("Збережено у локальну історію", {
      description: "Перейдіть у вкладку «Перегляд», щоб побачити результат на сайті.",
    });
    setDirty(false);
  };

  const handleRevert = () => {
    setContent(article?.content ?? "");
    setDirty(false);
  };

  const openOnSite = () => window.open(`${SITE_ORIGIN}${currentPath}`, "_blank", "noopener");

  // ───────── System page (no article) — live iframe + cross-origin selection bridge ─────────
  if (!article) {
    return (
      <SystemPageLiveEditor
        currentPath={currentPath}
        sysTitle={sys?.title}
        sysCategory={sys?.category}
        onChatPrompt={onChatPrompt}
        onCreateIdeaFromSelection={onCreateIdeaFromSelection}
        onAttachScreenshot={onAttachScreenshot}
      />
    );
  }

  // ───────── Article — single editable surface ─────────
  return (
    <div className="h-full flex flex-col bg-background">
      {/* Toolbar */}
      <div className="shrink-0 px-2 py-1.5 border-b border-border/60 bg-muted/30 flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1 rounded-md border bg-background/80 p-0.5">
          <Button
            size="sm"
            variant={subMode === "edit" ? "default" : "ghost"}
            className="h-6 px-2 text-[11px] gap-1"
            onClick={() => setSubMode("edit")}
          >
            <Pencil className="h-3 w-3" /> Редагувати
          </Button>
          <Button
            size="sm"
            variant={subMode === "preview" ? "default" : "ghost"}
            className="h-6 px-2 text-[11px] gap-1"
            onClick={() => setSubMode("preview")}
          >
            <Eye className="h-3 w-3" /> Перегляд
          </Button>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground min-w-0">
          {dirty ? (
            <Badge variant="secondary" className="h-4 text-[10px]">● Незбережено</Badge>
          ) : (
            <span className="text-muted-foreground/70">Збережено</span>
          )}
          <span className="text-muted-foreground/50">·</span>
          <span className="truncate max-w-[240px]">{article.title}</span>
        </div>

        <div className="ml-auto flex items-center gap-1">
          {dirty && (
            <Button size="sm" variant="ghost" className="h-6 px-2 text-[11px] gap-1" onClick={handleRevert}>
              <Undo2 className="h-3 w-3" /> Скасувати
            </Button>
          )}
          <Button
            size="sm"
            variant="default"
            disabled={!dirty}
            className="h-6 px-2 text-[11px] gap-1"
            onClick={handleSave}
          >
            <Save className="h-3 w-3" /> Зберегти
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-6 px-2 text-[11px] gap-1"
            onClick={() =>
              onChatPrompt(`Запитання про сторінку ${currentPath} (стаття "${article.title}"): `)
            }
          >
            <Sparkles className="h-3 w-3 text-primary" /> Запитати AI
          </Button>
          <Button size="sm" variant="ghost" className="h-6 px-2 text-[11px] gap-1" onClick={openOnSite}>
            <ExternalLink className="h-3 w-3" /> На сайті
          </Button>
        </div>
      </div>

      {subMode === "edit" && (
        <div className="shrink-0 border-b border-border/60 bg-background">
          <MarkdownToolbar
            textareaRef={textareaRef}
            onUpdate={(v) => {
              setContent(v);
              setDirty(v !== (article.content ?? ""));
            }}
            isPreview={false}
            onTogglePreview={() => setSubMode("preview")}
          />
        </div>
      )}

      <div className="flex-1 min-h-0 relative overflow-hidden">
        {subMode === "edit" ? (
          <div className="h-full overflow-auto">
            <div className="max-w-3xl mx-auto p-4 space-y-3">
              <h1 className="text-2xl font-semibold">{article.title}</h1>
              {article.excerpt && (
                <p className="text-sm text-muted-foreground italic">{article.excerpt}</p>
              )}
              <Textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => {
                  setContent(e.target.value);
                  setDirty(e.target.value !== (article.content ?? ""));
                }}
                placeholder="Markdown-контент статті…"
                className={cn(
                  "min-h-[60vh] font-mono text-[13px] leading-relaxed",
                  "selection:bg-primary/25 selection:text-foreground",
                )}
              />
              <p className="text-[11px] text-muted-foreground">
                Виділіть фрагмент → відкриється меню AI-дій. Або задайте свій запит через «Запитати AI».
              </p>
            </div>
          </div>
        ) : (
          <div className="h-full overflow-auto">
            <div
              ref={previewRef}
              className={cn(
                "prose prose-sm dark:prose-invert max-w-3xl mx-auto p-6",
                "selection:bg-primary/25 selection:text-foreground",
              )}
            >
              <h1>{article.title}</h1>
              {article.excerpt && <p className="lead text-muted-foreground">{article.excerpt}</p>}
              <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
            </div>
          </div>
        )}

        {selection && (
          <CmsSelectionPopover
            selectionText={selection.text}
            rect={selection.rect}
            pagePath={currentPath}
            articleTitle={article.title}
            onPrompt={onChatPrompt}
            onCreateIdea={onCreateIdeaFromSelection}
            onClose={() => setSelection(null)}
          />
        )}
      </div>
    </div>
  );
}
