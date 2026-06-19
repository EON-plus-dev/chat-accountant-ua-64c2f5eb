import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Clock, Eye } from "lucide-react";
import { useAudience } from "@/contexts/AudienceContext";
import { getTodayArticles } from "@/portal/data/dailyDigest";
import type { Article } from "@/portal/data/articles";

const CONTENT_TYPE_COLORS: Record<string, string> = {
  news: "bg-info/10 text-info border-info/20",
  guide: "bg-primary/10 text-primary border-primary/20",
  change: "bg-destructive/10 text-destructive border-destructive/20",
  analysis: "bg-chart-2/10 text-chart-2 border-chart-2/20",
  comparison: "bg-accent-foreground/10 text-accent-foreground border-accent-foreground/20",
  explainer: "bg-warning/10 text-warning border-warning/20",
};

const CONTENT_TYPE_LABELS: Record<string, string> = {
  news: "Новина",
  guide: "Гайд",
  change: "Зміни",
  analysis: "Аналіз",
  comparison: "Порівняння",
  explainer: "Роз'яснення",
};

function CompactRow({ article }: { article: Article }) {
  return (
    <Link to={`/articles/${article.slug}`} className="flex items-start gap-3 py-3 border-b border-border/40 last:border-0 group hover:bg-muted/30 -mx-2 px-2 rounded-md transition-colors">
      <Badge variant="outline" className={`shrink-0 text-[10px] mt-0.5 ${CONTENT_TYPE_COLORS[article.contentType] || ""}`}>
        {CONTENT_TYPE_LABELS[article.contentType] || article.contentType}
      </Badge>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground leading-snug group-hover:text-primary transition-colors line-clamp-2">
          {article.title}
        </p>
        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{article.readingMinutes} хв</span>
          <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{article.views.toLocaleString("uk-UA")}</span>
        </div>
      </div>
    </Link>
  );
}

export const TopStories = () => {
  const { audience } = useAudience();
  const articles = useMemo(() => getTodayArticles(audience, 5), [audience]);

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold text-foreground">Головне сьогодні</h2>
        <Link to="/publications" className="text-xs text-primary hover:underline flex items-center gap-1">
          Всі публікації <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {articles.length === 0 ? (
        <p className="text-sm text-muted-foreground py-6 text-center">Немає матеріалів</p>
      ) : (
        <div>
          {articles.map(a => <CompactRow key={a.id} article={a} />)}
        </div>
      )}
    </section>
  );
};
