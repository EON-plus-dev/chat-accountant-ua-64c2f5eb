import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Eye, Calendar, Search, MessageSquare, TrendingUp, ExternalLink, Sparkles } from "lucide-react";
import { ARTICLES } from "@/portal/data/articles";
import { findSystemPage } from "./systemPages";
import { useAiChatQueriesAdmin } from "@/hooks/useAiChatQueries";
import { useNavigate } from "react-router-dom";
import { format, formatDistanceToNow } from "date-fns";
import { uk } from "date-fns/locale";

interface PreviewPageAnalyticsProps {
  currentPath: string;
  onChatPrompt: (prompt: string) => void;
}

/**
 * Lightweight per-page analytics for the URL currently shown in Preview.
 * Reuses ARTICLES + ai_chat_queries (no new edge functions / tables).
 */
export default function PreviewPageAnalytics({ currentPath, onChatPrompt }: PreviewPageAnalyticsProps) {
  const navigate = useNavigate();
  const { data: aiQueries } = useAiChatQueriesAdmin();

  const article = useMemo(() => {
    const slug = currentPath.replace(/^\/+/, "").split("/").pop() || "";
    return ARTICLES.find((a) => a.slug === slug || `/${a.slug}` === currentPath);
  }, [currentPath]);

  const relatedQueries = useMemo(() => {
    if (!aiQueries || !article) return [];
    const titleLower = article.title.toLowerCase();
    const tagSet = new Set((article.tags || []).map((t) => t.toLowerCase()));
    return aiQueries
      .filter((q) => {
        const ql = q.question.toLowerCase();
        if (titleLower.split(" ").some((w) => w.length > 4 && ql.includes(w))) return true;
        return [...tagSet].some((t) => ql.includes(t));
      })
      .slice(0, 5);
  }, [aiQueries, article]);

  const seoFields = useMemo(() => {
    if (!article) return { filled: 0, total: 0, score: 0 };
    const fields = [
      !!article.seoTitle,
      !!article.seoDescription,
      !!(article.seoKeywords && article.seoKeywords.length),
      !!article.tldr,
      !!(article.tags && article.tags.length),
      !!article.slug,
    ];
    const filled = fields.filter(Boolean).length;
    return { filled, total: fields.length, score: Math.round((filled / fields.length) * 100) };
  }, [article]);

  if (!article) {
    const sys = findSystemPage(currentPath);
    if (!sys) {
      return (
        <div className="h-full flex items-center justify-center p-6">
          <div className="text-center max-w-md space-y-2">
            <TrendingUp className="h-10 w-10 mx-auto text-muted-foreground/40" />
            <p className="text-sm font-medium">Аналітика недоступна</p>
            <p className="text-xs text-muted-foreground">
              Сторінка <code className="bg-muted px-1.5 py-0.5 rounded">{currentPath}</code> не зареєстрована.
            </p>
          </div>
        </div>
      );
    }
    // Mock traffic for system pages based on weight
    const baseMonthly = 12000;
    const monthly = Math.round(baseMonthly * (sys.trafficWeight ?? 0.3));
    const weekly = Math.round(monthly * 0.25);
    const total = monthly * 8;
    const sysSeoFilled = [!!sys.seoTitle, !!sys.seoDescription, !!(sys.seoKeywords && sys.seoKeywords.length)].filter(Boolean).length;
    const sysSeoScore = Math.round((sysSeoFilled / 3) * 100);
    return (
      <ScrollArea className="h-full">
        <div className="p-4 space-y-4 max-w-5xl mx-auto">
          <div>
            <h2 className="text-lg font-semibold">Аналітика сторінки</h2>
            <p className="text-xs text-muted-foreground truncate">{sys.title} · {sys.category}</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <Card><CardContent className="p-3"><div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1"><Eye className="h-3 w-3" /> Всього (≈)</div><p className="text-2xl font-bold tabular-nums">{total.toLocaleString("uk-UA")}</p></CardContent></Card>
            <Card><CardContent className="p-3"><div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1"><TrendingUp className="h-3 w-3" /> За 30 днів</div><p className="text-2xl font-bold tabular-nums">{monthly.toLocaleString("uk-UA")}</p></CardContent></Card>
            <Card><CardContent className="p-3"><div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1"><TrendingUp className="h-3 w-3" /> За 7 днів</div><p className="text-2xl font-bold tabular-nums">{weekly.toLocaleString("uk-UA")}</p></CardContent></Card>
            <Card><CardContent className="p-3"><div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1"><Search className="h-3 w-3" /> SEO score</div><p className={`text-2xl font-bold tabular-nums ${sysSeoScore >= 90 ? "text-emerald-500" : sysSeoScore >= 60 ? "text-amber-500" : "text-destructive"}`}>{sysSeoScore}%</p></CardContent></Card>
          </div>
          <Card>
            <CardHeader className="pb-2 pt-3 px-4"><CardTitle className="text-sm flex items-center gap-2"><Calendar className="h-4 w-4 text-blue-500" /> Метадані</CardTitle></CardHeader>
            <CardContent className="px-4 pb-3 space-y-1.5 text-xs">
              <div className="flex justify-between"><span className="text-muted-foreground">Тип</span><span>Системна сторінка</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Категорія</span><span>{sys.category}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Шлях</span><code className="text-xs">{sys.path}</code></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Опис</span><span className="text-right max-w-[60%]">{sys.description}</span></div>
            </CardContent>
          </Card>
          <div className="flex gap-2 flex-wrap">
            <Button size="sm" variant="default" className="gap-1.5" onClick={() => onChatPrompt(`Проаналізуй трафік і конверсію сторінки ${sys.path} (${sys.title}) та запропонуй покращення`)}>
              <Sparkles className="h-3.5 w-3.5" /> AI-аналіз
            </Button>
          </div>
        </div>
      </ScrollArea>
    );
  }

  const updatedAgo = formatDistanceToNow(new Date(article.updatedAt), { locale: uk, addSuffix: true });
  // Mock weekly/monthly distribution from total views
  const totalViews = article.views || 0;
  const weekViews = Math.round(totalViews * 0.08);
  const monthViews = Math.round(totalViews * 0.27);

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-4 max-w-5xl mx-auto">
        <div>
          <h2 className="text-lg font-semibold">Аналітика сторінки</h2>
          <p className="text-xs text-muted-foreground truncate">{article.title}</p>
        </div>

        {/* KPI grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                <Eye className="h-3 w-3" /> Всього переглядів
              </div>
              <p className="text-2xl font-bold tabular-nums">{totalViews.toLocaleString("uk-UA")}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                <TrendingUp className="h-3 w-3" /> За 30 днів
              </div>
              <p className="text-2xl font-bold tabular-nums">{monthViews.toLocaleString("uk-UA")}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                <TrendingUp className="h-3 w-3" /> За 7 днів
              </div>
              <p className="text-2xl font-bold tabular-nums">{weekViews.toLocaleString("uk-UA")}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                <Search className="h-3 w-3" /> SEO score
              </div>
              <p className={`text-2xl font-bold tabular-nums ${seoFields.score >= 90 ? "text-emerald-500" : seoFields.score >= 60 ? "text-amber-500" : "text-destructive"}`}>
                {seoFields.score}%
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Meta */}
        <Card>
          <CardHeader className="pb-2 pt-3 px-4">
            <CardTitle className="text-sm flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-500" /> Метадані
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3 space-y-1.5 text-xs">
            <div className="flex justify-between"><span className="text-muted-foreground">Оновлено</span><span>{updatedAgo}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Опубліковано</span><span>{format(new Date(article.publishedAt), "dd.MM.yyyy")}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Категорія</span><span>{article.categoryLabel}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Аудиторія</span><span>{article.audience === "business" ? "Бізнес" : article.audience === "personal" ? "Фіз. особи" : "Обидві"}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Тип</span><span>{article.type}</span></div>
          </CardContent>
        </Card>

        {/* Related queries */}
        <Card>
          <CardHeader className="pb-2 pt-3 px-4">
            <CardTitle className="text-sm flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-pink-500" /> Дотичні AI-запити
              {relatedQueries.length > 0 && <Badge variant="secondary" className="text-[10px] ml-auto">{relatedQueries.length}</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {relatedQueries.length === 0 ? (
              <p className="px-4 py-3 text-xs text-muted-foreground">Немає дотичних запитів від користувачів</p>
            ) : (
              relatedQueries.map((q) => (
                <div key={q.id} className="px-4 py-2 border-t hover:bg-muted/40">
                  <p className="text-sm leading-tight line-clamp-2">{q.question}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{q.views_count} переглядів · {q.audience === "business" ? "Бізнес" : "Фіз."}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-2 flex-wrap">
          <Button size="sm" variant="default" className="gap-1.5" onClick={() => onChatPrompt(`Проаналізуй динаміку переглядів сторінки "${article.title}" і запропонуй покращення`)}>
            <Sparkles className="h-3.5 w-3.5" /> AI-аналіз
          </Button>
          <Button size="sm" variant="outline" className="gap-1.5" onClick={() => navigate(`/admin/articles/${article.slug}`)}>
            Відкрити в редакторі <ExternalLink className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </ScrollArea>
  );
}
