import { Link } from "react-router-dom";
import { ARTICLES } from "@/portal/data/articles";
import { BadgeCategory } from "./BadgeCategory";
import { Flame, TrendingUp } from "lucide-react";

const trending = [...ARTICLES]
  .sort((a, b) => b.views - a.views)
  .slice(0, 8);

const TYPE_GRADIENT: Record<string, string> = {
  guide: "from-info/10 to-info/5",
  change: "from-warning/10 to-warning/5",
  analysis: "from-secondary to-secondary/50",
  dps: "from-destructive/10 to-destructive/5",
  news: "from-primary/10 to-primary/5",
};

export const TrendingStrip = () => (
  <section className="py-6">
    <div className="max-w-7xl mx-auto px-4">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="h-4 w-4 text-primary" />
        <h2 className="text-sm font-semibold text-foreground">Зараз читають</h2>
      </div>
      <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4 snap-x snap-mandatory">
        {trending.map((article) => (
          <Link
            key={article.id}
            to={`/articles/${article.slug}`}
            className="snap-start shrink-0 w-56 group"
          >
            <div className={`rounded-lg bg-gradient-to-br ${TYPE_GRADIENT[article.type] || TYPE_GRADIENT.news} p-4 h-full space-y-2 border border-border/30 hover:border-primary/30 transition-colors`}>
              <div className="flex items-center justify-between">
                <BadgeCategory type={article.type} />
                {article.views > 5000 && (
                  <Flame className="h-3.5 w-3.5 text-destructive/70" />
                )}
              </div>
              <p className="text-sm font-medium text-foreground leading-snug line-clamp-3 group-hover:text-primary transition-colors">
                {article.title}
              </p>
              <p className="text-xs text-muted-foreground">
                {article.readingMinutes} хв · {article.views.toLocaleString("uk-UA")} 👁
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  </section>
);
