import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ARTICLES } from "@/portal/data/articles";
import { Flame } from "lucide-react";

const topArticles = [...ARTICLES].sort((a, b) => b.views - a.views).slice(0, 5);

export const MostReadWidget = () => (
  <Card>
    <CardHeader className="pb-2">
      <CardTitle className="text-sm flex items-center gap-1.5">
        <Flame className="h-4 w-4 text-destructive" />
        Популярне
      </CardTitle>
    </CardHeader>
    <CardContent className="p-4 pt-0 space-y-0">
      {topArticles.map((article, i) => (
        <Link
          key={article.id}
          to={`/articles/${article.slug}`}
          className="flex items-start gap-3 py-2.5 group border-b border-border/30 last:border-0"
        >
          <span className="text-lg font-bold text-muted-foreground/40 tabular-nums leading-none pt-0.5">
            {i + 1}
          </span>
          <div className="space-y-0.5 min-w-0">
            <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors leading-snug line-clamp-2">
              {article.title}
            </p>
            <p className="text-xs text-muted-foreground">
              {article.views.toLocaleString("uk-UA")} переглядів
            </p>
          </div>
        </Link>
      ))}
    </CardContent>
  </Card>
);
