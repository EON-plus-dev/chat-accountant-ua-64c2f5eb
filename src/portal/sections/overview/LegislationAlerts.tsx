import { Link } from "react-router-dom";
import { AlertTriangle, ArrowRight } from "lucide-react";
import { useAudience } from "@/contexts/AudienceContext";
import { getLegislationChanges } from "@/portal/data/dailyDigest";
import { cn } from "@/lib/utils";

export const LegislationAlerts = () => {
  const { audience } = useAudience();
  const changes = getLegislationChanges(audience, 3);

  if (changes.length === 0) return null;

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-destructive" />
          Зміни законодавства
        </h2>
        <Link to="/publications?type=change" className="text-xs text-primary hover:underline flex items-center gap-1">
          Всі зміни <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="space-y-2">
        {changes.map(article => (
          <Link
            key={article.id}
            to={`/articles/${article.slug}`}
            className={cn(
              "block border-l-3 rounded-r-lg px-4 py-3 transition-colors hover:bg-muted/50",
              "border-l-destructive bg-destructive/[0.03]"
            )}
          >
            <p className="text-sm font-medium text-foreground leading-snug">{article.title}</p>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{article.tldr}</p>
            <span className="text-[10px] text-muted-foreground mt-1 inline-block">{article.publishedAt}</span>
          </Link>
        ))}
      </div>
    </section>
  );
};
