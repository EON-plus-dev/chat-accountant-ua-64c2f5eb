import { useEffect, useMemo, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles, CheckCircle2, AlertTriangle, FileText, Search, Save, X,
  Tag, AlignLeft, Layers, ExternalLink,
} from "lucide-react";
import { ARTICLES, type Article } from "@/portal/data/articles";
import { findSystemPage } from "./systemPages";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { appendHistory, appendPageHistory, diffArticleSnapshots } from "./articleChangeHistory";

interface CmsSeoPanelProps {
  currentPath: string;
  onChatPrompt: (prompt: string) => void;
}

const SITE_ORIGIN = "https://chat-accountant-ua.lovable.app";

/**
 * SEO-кокпіт поточної сторінки прев'ю.
 * Редагує метадані статті (Заголовок, Slug read-only, Excerpt, TLDR, Теги)
 * + SEO (Title, Description, Keywords) + Google preview + аудит у реальному часі.
 * Глобальний SEO-огляд — на вкладці «Огляд».
 */
export default function CmsSeoPanel({ currentPath, onChatPrompt }: CmsSeoPanelProps) {
  const matchedArticle = useMemo<Article | undefined>(() => {
    const slug = currentPath.replace(/^\/+/, "").split("/").pop() || "";
    return ARTICLES.find((a) => a.slug === slug || `/${a.slug}` === currentPath);
  }, [currentPath]);

  const sys = useMemo(() => (matchedArticle ? undefined : findSystemPage(currentPath)), [matchedArticle, currentPath]);

  // ─── Article editing state ─────────────────────────────────────────────
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [tldr, setTldr] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [seoKeywordsInput, setSeoKeywordsInput] = useState("");
  const [dirty, setDirty] = useState(false);
  const [author, setAuthor] = useState("admin");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.email) setAuthor(data.user.email);
    });
  }, []);

  useEffect(() => {
    if (matchedArticle) {
      setTitle(matchedArticle.title ?? "");
      setExcerpt(matchedArticle.excerpt ?? "");
      setTldr(matchedArticle.tldr ?? "");
      setTagsInput((matchedArticle.tags ?? []).join(", "));
      setSeoTitle(matchedArticle.seoTitle ?? "");
      setSeoDescription(matchedArticle.seoDescription ?? "");
      setSeoKeywordsInput((matchedArticle.seoKeywords ?? []).join(", "));
    } else if (sys) {
      setTitle(sys.title);
      setExcerpt(sys.description ?? "");
      setTldr("");
      setTagsInput("");
      setSeoTitle(sys.seoTitle ?? "");
      setSeoDescription(sys.seoDescription ?? "");
      setSeoKeywordsInput((sys.seoKeywords ?? []).join(", "));
    } else {
      setTitle(""); setExcerpt(""); setTldr(""); setTagsInput("");
      setSeoTitle(""); setSeoDescription(""); setSeoKeywordsInput("");
    }
    setDirty(false);
  }, [matchedArticle?.id, sys?.path]);

  const tags = useMemo(() => tagsInput.split(",").map((t) => t.trim()).filter(Boolean), [tagsInput]);
  const seoKeywords = useMemo(() => seoKeywordsInput.split(",").map((t) => t.trim()).filter(Boolean), [seoKeywordsInput]);

  const markDirty = <T,>(setter: (v: T) => void) => (v: T) => { setter(v); setDirty(true); };

  // ─── Audit (live, reflects unsaved edits) ───────────────────────────────
  const audit = useMemo(() => {
    if (matchedArticle) {
      return [
        { label: "SEO Title", ok: !!seoTitle, detail: seoTitle || "Відсутній", hint: "≤60 символів" },
        { label: "SEO Description", ok: !!seoDescription, detail: seoDescription || "Відсутній", hint: "≤160 символів" },
        { label: "SEO Keywords", ok: seoKeywords.length > 0, detail: seoKeywords.join(", ") || "Відсутні", hint: "3–8 ключів" },
        { label: "Slug", ok: !!matchedArticle.slug, detail: matchedArticle.slug, hint: "Незмінний" },
        { label: "TLDR", ok: !!tldr, detail: tldr || "Відсутній", hint: "1–2 речення" },
        { label: "Теги", ok: tags.length > 0, detail: tags.join(", ") || "Відсутні", hint: "Категоризація" },
      ];
    }
    if (sys) {
      return [
        { label: "SEO Title", ok: !!seoTitle, detail: seoTitle || "Відсутній", hint: "≤60 символів" },
        { label: "SEO Description", ok: !!seoDescription, detail: seoDescription || "Відсутній", hint: "≤160 символів" },
        { label: "SEO Keywords", ok: seoKeywords.length > 0, detail: seoKeywords.join(", ") || "Відсутні", hint: "3–8 ключів" },
      ];
    }
    return [];
  }, [matchedArticle, sys, seoTitle, seoDescription, seoKeywords, tldr, tags]);

  const score = audit.length ? Math.round((audit.filter((a) => a.ok).length / audit.length) * 100) : 0;

  // ─── Save ───────────────────────────────────────────────────────────────
  const handleReset = () => {
    if (matchedArticle) {
      setTitle(matchedArticle.title ?? "");
      setExcerpt(matchedArticle.excerpt ?? "");
      setTldr(matchedArticle.tldr ?? "");
      setTagsInput((matchedArticle.tags ?? []).join(", "));
      setSeoTitle(matchedArticle.seoTitle ?? "");
      setSeoDescription(matchedArticle.seoDescription ?? "");
      setSeoKeywordsInput((matchedArticle.seoKeywords ?? []).join(", "));
    } else if (sys) {
      setSeoTitle(sys.seoTitle ?? "");
      setSeoDescription(sys.seoDescription ?? "");
      setSeoKeywordsInput((sys.seoKeywords ?? []).join(", "));
    }
    setDirty(false);
  };

  const handleSave = async () => {
    if (matchedArticle) {
      const prev = {
        title: matchedArticle.title,
        excerpt: matchedArticle.excerpt,
        tldr: matchedArticle.tldr,
        tags: matchedArticle.tags,
        content: matchedArticle.content ?? "",
      };
      const next = { title, excerpt, tldr, tags, content: matchedArticle.content ?? "" };
      const entries = diffArticleSnapshots(matchedArticle.id, prev, next, author);

      const seoChanged =
        seoTitle !== (matchedArticle.seoTitle ?? "") ||
        seoDescription !== (matchedArticle.seoDescription ?? "") ||
        seoKeywordsInput !== (matchedArticle.seoKeywords ?? []).join(", ");

      if (entries.length === 0 && !seoChanged) {
        toast.info("Немає змін для збереження");
        setDirty(false);
        return;
      }

      if (entries.length > 0) {
        appendHistory(matchedArticle.id, entries);
        appendPageHistory(currentPath, entries);
        try {
          await supabase
            .from("consultations")
            .update({ title, excerpt, tldr, tags })
            .eq("id", matchedArticle.id);
        } catch (e) {
          console.warn("[CmsSeoPanel] supabase update failed", e);
        }
      }

      toast.success(`Збережено: ${entries.length} полів${seoChanged ? " + SEO (локально)" : ""}`, {
        description: seoChanged ? "SEO Title/Description/Keywords збережено в локальну історію — застосуйте через AI у код." : undefined,
      });
      setDirty(false);
      return;
    }

    if (sys) {
      // System pages live in code — лише локальний draft + підказка.
      toast.success("SEO-чернетку збережено локально", {
        description: "Системна сторінка — попросіть AI застосувати SEO у код.",
      });
      setDirty(false);
    }
  };

  // ─── Render ─────────────────────────────────────────────────────────────
  if (!matchedArticle && !sys) {
    return (
      <ScrollArea className="h-full">
        <div className="p-4 max-w-3xl mx-auto">
          <Card>
            <CardContent className="px-4 pb-3 pt-3">
              <div className="text-center py-6 space-y-2">
                <p className="text-sm text-muted-foreground">
                  Сторінка <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{currentPath}</code> не зареєстрована ні як стаття, ні як системна.
                </p>
                <p className="text-xs text-muted-foreground">
                  Для глобального аудиту відкрийте вкладку <strong>Огляд</strong> → секція «SEO покриття».
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    );
  }

  const previewUrl = `${SITE_ORIGIN}${currentPath}`;
  const previewTitle = (matchedArticle ? seoTitle || title : seoTitle || title) || "(без заголовка)";
  const previewDesc = (matchedArticle ? seoDescription || excerpt : seoDescription || excerpt) || "(без опису)";
  const scoreColor = score >= 90 ? "text-emerald-500" : score >= 60 ? "text-amber-500" : "text-destructive";
  const scoreBg = score >= 90 ? "bg-emerald-500" : score >= 60 ? "bg-amber-500" : "bg-destructive";

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-4 max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Search className="h-3.5 w-3.5 text-primary" />
              <span>SEO-кокпіт</span>
              {dirty && <Badge variant="secondary" className="text-[10px] h-4">Незбережено</Badge>}
              {matchedArticle ? (
                <Badge variant="outline" className="text-[10px] h-4">Стаття</Badge>
              ) : sys ? (
                <Badge variant="outline" className="text-[10px] h-4">Системна · {sys.category}</Badge>
              ) : null}
            </div>
            <p className="text-xs text-muted-foreground mt-1 truncate">
              <code className="text-[11px] bg-muted px-1.5 py-0.5 rounded">{currentPath}</code>
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            {dirty && (
              <Button size="sm" variant="ghost" onClick={handleReset} className="gap-1.5">
                <X className="h-3.5 w-3.5" /> Скасувати
              </Button>
            )}
            <Button size="sm" variant="default" onClick={handleSave} disabled={!dirty} className="gap-1.5">
              <Save className="h-3.5 w-3.5" /> Зберегти
            </Button>
          </div>
        </div>

        {/* Audit summary */}
        <Card>
          <CardHeader className="pb-2 pt-3 px-4">
            <CardTitle className="text-sm flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-500" /> Аудит сторінки
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                {audit.filter((a) => a.ok).length} / {audit.length} полів заповнено
              </p>
              <p className={`text-2xl font-bold tabular-nums ${scoreColor}`}>{score}%</p>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div className={`h-full ${scoreBg}`} style={{ width: `${score}%` }} />
            </div>
            <div className="space-y-1.5 pt-2 border-t">
              {audit.map((field) => (
                <div key={field.label} className="flex items-start gap-2 py-1">
                  {field.ok ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-medium">{field.label}</p>
                      <span className="text-[10px] text-muted-foreground">{field.hint}</span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">{field.detail}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="pt-2 border-t">
              <Button
                size="sm"
                variant="default"
                className="gap-1.5"
                onClick={() =>
                  onChatPrompt(
                    matchedArticle
                      ? `Згенеруй оптимізовані SEO Title (≤60), Description (≤160) та 5–7 keywords для статті "${matchedArticle.title}" (slug: ${matchedArticle.slug})`
                      : `Запропонуй SEO Title (≤60), Description (≤160) та keywords для сторінки ${currentPath} (${sys?.title})`,
                  )
                }
              >
                <Sparkles className="h-3.5 w-3.5" /> Згенерувати SEO через AI
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Page basics */}
        <Card>
          <CardHeader className="pb-2 pt-3 px-4">
            <CardTitle className="text-sm flex items-center gap-2">
              <Layers className="h-4 w-4 text-primary" /> Сторінка
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3 space-y-4">
            <div className="space-y-1.5">
              <Label className="text-[11px] text-muted-foreground">Заголовок</Label>
              <Input
                value={title}
                onChange={(e) => markDirty(setTitle)(e.target.value)}
                disabled={!matchedArticle}
                className="text-sm font-semibold"
              />
              <p className="text-[11px] text-muted-foreground">
                {title.length} символів{!matchedArticle && " · системна сторінка — заголовок у коді"}
              </p>
            </div>

            {matchedArticle && (
              <div className="space-y-1.5">
                <Label className="text-[11px] text-muted-foreground">Slug</Label>
                <div className="flex items-center gap-2">
                  <code className="text-xs bg-muted px-2 py-1 rounded flex-1 truncate">{matchedArticle.slug}</code>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 gap-1 text-[11px]"
                    onClick={() => window.open(`${SITE_ORIGIN}/${matchedArticle.slug}`, "_blank")}
                  >
                    <ExternalLink className="h-3 w-3" /> Відкрити
                  </Button>
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <Label className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                <AlignLeft className="h-3 w-3" /> Анонс (excerpt)
              </Label>
              <Textarea
                value={excerpt}
                onChange={(e) => markDirty(setExcerpt)(e.target.value)}
                disabled={!matchedArticle}
                rows={3}
              />
              <p className="text-[11px] text-muted-foreground">{excerpt.length} символів · оптимально 120–200</p>
            </div>

            {matchedArticle && (
              <>
                <div className="space-y-1.5">
                  <Label className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                    <Sparkles className="h-3 w-3" /> TLDR
                  </Label>
                  <Textarea
                    value={tldr}
                    onChange={(e) => markDirty(setTldr)(e.target.value)}
                    rows={2}
                    placeholder="1–2 речення з ключовою думкою"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                    <Tag className="h-3 w-3" /> Теги (через кому)
                  </Label>
                  <Input
                    value={tagsInput}
                    onChange={(e) => markDirty(setTagsInput)(e.target.value)}
                    placeholder="фоп, єсв, 2026"
                  />
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {tags.map((t) => (
                        <Badge key={t} variant="secondary" className="text-[10px]">#{t}</Badge>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* SEO metadata */}
        <Card>
          <CardHeader className="pb-2 pt-3 px-4">
            <CardTitle className="text-sm flex items-center gap-2">
              <Search className="h-4 w-4 text-blue-500" /> SEO-метадані
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3 space-y-4">
            <div className="space-y-1.5">
              <Label className="text-[11px] text-muted-foreground">SEO Title</Label>
              <Input
                value={seoTitle}
                onChange={(e) => markDirty(setSeoTitle)(e.target.value)}
                placeholder={matchedArticle ? `${matchedArticle.title} | FINTODO` : "Заголовок для пошуку"}
              />
              <p className={`text-[11px] ${seoTitle.length > 60 ? "text-amber-500" : "text-muted-foreground"}`}>
                {seoTitle.length} / 60 символів
              </p>
            </div>

            <div className="space-y-1.5">
              <Label className="text-[11px] text-muted-foreground">SEO Description</Label>
              <Textarea
                value={seoDescription}
                onChange={(e) => markDirty(setSeoDescription)(e.target.value)}
                rows={3}
                placeholder="Опис для сніпета у пошуку"
              />
              <p className={`text-[11px] ${seoDescription.length > 160 ? "text-amber-500" : "text-muted-foreground"}`}>
                {seoDescription.length} / 160 символів
              </p>
            </div>

            <div className="space-y-1.5">
              <Label className="text-[11px] text-muted-foreground">SEO Keywords (через кому)</Label>
              <Input
                value={seoKeywordsInput}
                onChange={(e) => markDirty(setSeoKeywordsInput)(e.target.value)}
                placeholder="фоп, єсв, 2026, FINTODO"
              />
              {seoKeywords.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {seoKeywords.map((t) => (
                    <Badge key={t} variant="outline" className="text-[10px]">{t}</Badge>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Google preview */}
        <Card>
          <CardHeader className="pb-2 pt-3 px-4">
            <CardTitle className="text-sm flex items-center gap-2">
              <Search className="h-4 w-4 text-emerald-500" /> Google preview
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <div className="rounded-md border bg-background p-3 space-y-1 font-sans">
              <p className="text-[11px] text-emerald-700 dark:text-emerald-400 truncate">{previewUrl}</p>
              <p className="text-base text-blue-700 dark:text-blue-400 leading-snug line-clamp-1">
                {previewTitle}
              </p>
              <p className="text-xs text-muted-foreground leading-snug line-clamp-2">
                {previewDesc}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  );
}
