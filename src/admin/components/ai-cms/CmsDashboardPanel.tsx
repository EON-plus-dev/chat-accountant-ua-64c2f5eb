import { useMemo, useState } from "react";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  FileText,
  Lightbulb,
  AlertTriangle,
  Sparkles,
  TrendingUp,
  Search,
  ArrowRight,
  MessageSquare,
  Bot,
  Eye,
  Wand2,
} from "lucide-react";
import { ARTICLES } from "@/portal/data/articles";
import { useContentIdeas } from "@/admin/hooks/useContentIdeas";
import BulkSeoGenerator from "@/admin/components/BulkSeoGenerator";
import SeoQualityMonitor from "@/admin/components/SeoQualityMonitor";

import type { CmsWorkspaceTab } from "./CmsWorkspaceTabs";

interface CmsDashboardPanelProps {
  onSwitchTab: (tab: CmsWorkspaceTab) => void;
  onNavigatePreview: (path: string) => void;
  onChatPrompt: (prompt: string) => void;
}

/**
 * Pipeline KPIs from public.content_ideas + SEO/stale/top from static ARTICLES.
 */
export default function CmsDashboardPanel({
  onSwitchTab,
  onNavigatePreview,
  onChatPrompt,
}: CmsDashboardPanelProps) {
  
  const { ideas } = useContentIdeas();
  const [seoDialogOpen, setSeoDialogOpen] = useState(false);

  const stats = useMemo(() => {
    const now = new Date();
    const totalArticles = ARTICLES.length;
    const stale = ARTICLES.filter((a) => {
      const diff = (now.getTime() - new Date(a.updatedAt).getTime()) / (1000 * 60 * 60 * 24);
      return diff > 90;
    });
    const withSeo = ARTICLES.filter((a) => a.seoTitle && a.seoDescription).length;
    const seoCoverage = totalArticles > 0 ? Math.round((withSeo / totalArticles) * 100) : 0;
    const topByViews = [...ARTICLES].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5);
    return { totalArticles, stale, seoCoverage, withSeo, topByViews };
  }, []);

  // Real pipeline KPI from content_ideas — клік веде на Карту/Календар у тому ж робочому просторі
  const pipeline = useMemo(() => {
    const by: Record<string, number> = {};
    ideas.forEach((i) => { by[i.status] = (by[i.status] ?? 0) + 1; });
    return [
      { label: "Ідеї в плані", value: by.todo ?? 0, color: "text-blue-600 dark:text-blue-400", action: () => onSwitchTab("sitemap") },
      { label: "Генеруються", value: by.generating ?? 0, color: "text-amber-600 dark:text-amber-400", action: () => onSwitchTab("calendar") },
      { label: "Згенеровані", value: by.generated ?? 0, color: "text-purple-600 dark:text-purple-400", action: () => onSwitchTab("calendar") },
      { label: "Опубліковані", value: by.published ?? 0, color: "text-emerald-600 dark:text-emerald-400", action: () => onSwitchTab("analytics") },
    ];
  }, [ideas, onSwitchTab]);

  // Real AI ideas — top 3 ai_suggested/seo_gap todo
  const aiIdeas = useMemo(
    () =>
      ideas
        .filter((i) => (i.source === "ai_suggested" || i.source === "seo_gap") && i.status === "todo")
        .slice(0, 3)
        .map((i) => ({
          topic: i.title,
          confidence: 70 + i.priority * 5,
          gap: i.description ?? `Сторінка: ${i.page_path}`,
        })),
    [ideas],
  );

  // Content gaps from ai_chat_query ideas without generated article
  const contentGaps = useMemo(
    () =>
      ideas
        .filter((i) => i.source === "ai_chat_query" && !i.generated_article_id && i.status !== "dismissed")
        .slice(0, 5)
        .map((i) => ({ question: i.title, audience: i.audience, path: i.page_path })),
    [ideas],
  );

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-4 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Огляд CMS</h2>
            <p className="text-xs text-muted-foreground">Стан контенту та оперативна черга</p>
          </div>
          <Button size="sm" variant="outline" className="gap-1.5" onClick={() => onChatPrompt("Створи нову статтю")}>
            <Sparkles className="h-3.5 w-3.5" />
            Нова стаття (AI)
          </Button>
        </div>

        {/* Pipeline KPI */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {pipeline.map((kpi) => (
            <Card key={kpi.label} className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={kpi.action}>
              <CardContent className="p-3">
                <p className="text-xs text-muted-foreground">{kpi.label}</p>
                <p className={`text-2xl font-bold tabular-nums ${kpi.color}`}>{kpi.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* AI ideas + Content gaps */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {/* AI-monitoring ideas */}
          <Card>
            <CardHeader className="pb-2 pt-3 px-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-amber-500" />
                AI-моніторинг: нові ідеї
                <Badge variant="secondary" className="text-[10px] ml-auto">{aiIdeas.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {aiIdeas.map((idea, i) => (
                <div key={i} className="px-3 py-2 border-t hover:bg-muted/40 group cursor-pointer" onClick={() => onChatPrompt(`Створи статтю на тему: ${idea.topic}`)}>
                  <div className="flex items-start justify-between gap-2 mb-0.5">
                    <p className="text-sm font-medium leading-tight">{idea.topic}</p>
                    <Badge variant="outline" className="text-[10px] shrink-0">{idea.confidence}%</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{idea.gap}</p>
                </div>
              ))}
              <div className="px-3 py-2 border-t">
                <Button variant="ghost" size="sm" className="w-full text-xs" onClick={() => onSwitchTab("sitemap")}>
                  Усі ідеї <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Content gaps from AI queries */}
          <Card>
            <CardHeader className="pb-2 pt-3 px-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-pink-500" />
                Запити без контенту
                {contentGaps.length > 0 && <Badge variant="secondary" className="text-[10px] ml-auto">{contentGaps.length}</Badge>}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {contentGaps.length === 0 ? (
                <p className="px-3 py-4 text-xs text-muted-foreground">Немає нових запитів</p>
              ) : (
                contentGaps.map((gap, i) => (
                  <div key={i} className="px-3 py-2 border-t hover:bg-muted/40 group cursor-pointer" onClick={() => onChatPrompt(`Створи статтю-відповідь на: ${gap.question}`)}>
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm leading-tight line-clamp-2">{gap.question}</p>
                      <Badge variant="outline" className="text-[10px] shrink-0">{gap.audience === "business" ? "Бізнес" : "Фіз."}</Badge>
                    </div>
                  </div>
                ))
              )}
              <div className="px-3 py-2 border-t">
                <Button variant="ghost" size="sm" className="w-full text-xs" onClick={() => onSwitchTab("analytics")}>
                  Аналітика консультацій <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Health row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {/* SEO coverage — opens global Bulk SEO dialog */}
          <Card className="cursor-pointer hover:bg-muted/50" onClick={() => setSeoDialogOpen(true)}>
            <CardContent className="p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium">SEO покриття статей</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold tabular-nums">{stats.seoCoverage}%</span>
                  <Wand2 className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${stats.seoCoverage >= 90 ? "bg-emerald-500" : stats.seoCoverage >= 60 ? "bg-amber-500" : "bg-destructive"}`}
                  style={{ width: `${stats.seoCoverage}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1.5">{stats.withSeo} / {stats.totalArticles} статей мають SEO · клікніть для bulk-генерації</p>
            </CardContent>
          </Card>

          {/* Stale */}
          <Card className="cursor-pointer hover:bg-muted/50" onClick={() => onSwitchTab("analytics")}>
            <CardContent className="p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                  <span className="text-sm font-medium">Застарілий контент</span>
                </div>
                <span className="text-lg font-bold tabular-nums">{stats.stale.length}</span>
              </div>
              <p className="text-xs text-muted-foreground">Статей старіших за 90 днів — потребують оновлення</p>
            </CardContent>
          </Card>
        </div>

        {/* Top viewed */}
        <Card>
          <CardHeader className="pb-2 pt-3 px-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
              Топ за переглядами
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {stats.topByViews.map((a, i) => (
              <div
                key={a.id}
                className="px-3 py-2 border-t hover:bg-muted/40 group cursor-pointer flex items-center gap-3"
                onClick={() => onNavigatePreview(`/${a.slug}`)}
              >
                <span className="text-xs text-muted-foreground tabular-nums w-4">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{a.title}</p>
                  <p className="text-xs text-muted-foreground">{a.categoryLabel}</p>
                </div>
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground tabular-nums shrink-0">
                  <Eye className="h-3 w-3" />
                  {(a.views || 0).toLocaleString("uk-UA")}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Dialog open={seoDialogOpen} onOpenChange={setSeoDialogOpen}>
        <DialogContent className="w-[calc(100vw-1rem)] max-w-[calc(100vw-1rem)] sm:max-w-4xl max-h-[90vh] overflow-y-auto p-3 sm:p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wand2 className="h-4 w-4 text-primary" />
              Глобальний SEO-аудит та bulk-генерація
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <SeoQualityMonitor />
            <BulkSeoGenerator />
          </div>
        </DialogContent>
      </Dialog>
    </ScrollArea>
  );
}
