import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import type { RankingItem } from "@/portal/data/rankings";

interface Props {
  items: RankingItem[];
  categorySlug: string;
}

const scoreColor = (score: number) => {
  if (score >= 85) return "text-emerald-600 dark:text-emerald-400";
  if (score >= 70) return "text-amber-600 dark:text-amber-400";
  return "text-red-600 dark:text-red-400";
};

export const TopThreePreview = ({ items, categorySlug }: Props) => {
  return (
    <div className="divide-y divide-border rounded-lg border border-border overflow-hidden">
      {items.map((item) => (
        <Link
          key={item.id}
          to={`/publications/ratings/${categorySlug}/${item.slug}`}
          className="flex items-center gap-3 px-4 py-3.5 hover:bg-muted/50 transition-colors"
        >
          <span className="font-mono text-sm font-bold text-muted-foreground w-6 shrink-0">
            #{item.rank}
          </span>
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0"
            style={{ backgroundColor: item.initialsColor }}
          >
            {item.initials}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold text-foreground">{item.name}</span>
              {item.isOurProduct && (
                <Badge variant="info" size="sm">Наш продукт</Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground truncate">{item.pros[0]}</p>
          </div>
          <div className="shrink-0 text-right">
            <span className={`font-mono text-base font-bold ${scoreColor(item.score)}`}>
              {item.score}
            </span>
            <span className="text-xs text-muted-foreground">/100</span>
          </div>
          <span className="hidden sm:inline text-xs text-primary font-medium shrink-0">
            Детальніше →
          </span>
        </Link>
      ))}
    </div>
  );
};
