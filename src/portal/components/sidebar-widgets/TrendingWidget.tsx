import { Link } from "react-router-dom";
import { TrendingUp } from "lucide-react";
import { ARTICLES } from "@/portal/data/articles";

interface Props {
  category?: string;
  limit?: number;
}

export const TrendingWidget = ({ category, limit = 4 }: Props) => {
  const trending = ARTICLES
    .filter((a) => !category || a.category === category)
    .sort((a, b) => b.views - a.views)
    .slice(0, limit);

  if (trending.length === 0) return null;

  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-3">
      <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
        <TrendingUp className="h-4 w-4 text-muted-foreground" />
        Популярне
      </h4>
      <div className="space-y-2.5">
        {trending.map((a, i) => (
          <Link
            key={a.id}
            to={`/articles/${a.slug}`}
            className="flex items-start gap-2.5 group"
          >
            <span className="text-xs font-mono font-bold text-muted-foreground/50 mt-0.5 w-4 shrink-0 text-right">
              {i + 1}
            </span>
            <div className="min-w-0">
              <p className="text-xs font-medium text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                {a.title}
              </p>
              <p className="text-[10px] text-muted-foreground font-mono mt-0.5">
                {a.views.toLocaleString("uk-UA")} переглядів
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};
