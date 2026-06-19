import { Link } from "react-router-dom";
import { Check, X, Info } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { RankingItem } from "@/portal/data/rankings";
import { INSTITUTION_PROFILES } from "@/portal/data/institutionProfiles";

interface Props {
  item: RankingItem;
  categorySlug?: string;
}

const scoreColor = (score: number) => {
  if (score >= 85) return "text-emerald-600 dark:text-emerald-400";
  if (score >= 70) return "text-amber-600 dark:text-amber-400";
  return "text-red-600 dark:text-red-400";
};

export const RankingCard = ({ item, categorySlug }: Props) => {
  const matchedProfile = INSTITUTION_PROFILES.find(p => p.slug === item.slug);
  const weights = item.review?.methodology.weights;

  return (
    <Card className="flex flex-col sm:flex-row gap-4 p-5">
      {/* Rank */}
      <div className="flex sm:flex-col items-center justify-center sm:w-14 shrink-0">
        <span
          className={`font-mono text-2xl font-bold ${
            item.rank === 1 ? "text-primary" : "text-muted-foreground"
          }`}
        >
          #{item.rank}
        </span>
      </div>

      {/* Center */}
      <div className="flex-1 min-w-0 space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
            style={{ backgroundColor: item.initialsColor }}
          >
            {item.initials}
          </div>
          <h3 className="font-semibold text-lg text-foreground">{item.name}</h3>
          {item.rank === 1 && <Badge variant="outline" size="sm">№1 у категорії</Badge>}
          {item.isOurProduct && <Badge variant="info" size="sm">Наш продукт</Badge>}
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>

        <div className="flex flex-wrap gap-1.5">
          {item.tags.map((tag) => (
            <Badge key={tag} variant="secondary" size="sm">
              {tag}
            </Badge>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          {item.metrics.map((m) => (
            <div
              key={m.label}
              className="rounded-lg bg-muted px-3 py-1.5 text-xs"
            >
              <span className="text-muted-foreground">{m.label}: </span>
              <span className="font-medium text-foreground">{m.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right */}
      <div className="flex sm:flex-col items-start sm:items-end gap-3 sm:w-48 shrink-0">
        <div className="text-right">
          <div>
            <span className={`font-mono text-3xl font-bold ${scoreColor(item.score)}`}>
              {item.score}
            </span>
            <span className="text-sm text-muted-foreground">/100</span>
          </div>
          {weights && weights.length > 0 && (
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  aria-label="Розклад балів за критеріями"
                  className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline mt-1 focus:outline-none focus:ring-2 focus:ring-primary/40 rounded"
                >
                  <Info className="w-3 h-3" />
                  Розклад балів
                </button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-72 p-3">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-2">
                  Як склався бал {item.score}/100
                </p>
                <ul className="space-y-1.5">
                  {weights.map((w) => (
                    <li key={w.criterion} className="flex items-baseline justify-between gap-3 text-xs">
                      <span className="text-foreground">
                        {w.criterion}{" "}
                        <span className="text-muted-foreground">({w.weight}%)</span>
                      </span>
                      <span className="font-mono font-semibold text-foreground tabular-nums">
                        {w.score}/{w.maxScore}
                      </span>
                    </li>
                  ))}
                </ul>
              </PopoverContent>
            </Popover>
          )}
        </div>

        <div className="space-y-1 text-sm">
          {item.pros.slice(0, 2).map((p) => (
            <div key={p} className="flex items-start gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
              <span className="text-muted-foreground">{p}</span>
            </div>
          ))}
          {item.cons.slice(0, 1).map((c) => (
            <div key={c} className="flex items-start gap-1.5">
              <X className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
              <span className="text-muted-foreground">{c}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-2 w-full sm:mt-auto">
          {categorySlug ? (
            <Button variant="secondary" size="sm" className="w-full" asChild>
              <Link to={`/publications/ratings/${categorySlug}/${item.slug}`}>Детальніше</Link>
            </Button>
          ) : (
            <Button variant="secondary" size="sm" className="w-full" disabled>
              Детальніше
            </Button>
          )}
          {matchedProfile && (
            <Link
              to={`/dovidnyky/ustanovy/profile/${matchedProfile.slug}`}
              className="text-xs text-primary hover:underline text-center"
            >
              🏛 Профіль установи →
            </Link>
          )}
        </div>
      </div>
    </Card>
  );
};
