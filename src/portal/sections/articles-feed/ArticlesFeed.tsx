import { useState, useEffect } from "react";
import { ARTICLES } from "@/portal/data/articles";
import { AUTHORS } from "@/portal/data/authors";
import { ArticleCard } from "@/portal/components/ArticleCard";
import { useAudience } from "@/contexts/AudienceContext";
import type { AudienceFilter } from "@/portal/components/AudienceToggle";

const getAuthor = (id: string) => AUTHORS.find((a) => a.id === id);

const MEDIA_PILLS = [
  { value: "all", label: "Всі" },
  { value: "text", label: "📝 Текст" },
  { value: "video", label: "📹 Відео" },
  { value: "podcast", label: "🎙 Аудіо" },
] as const;

type MediaFilter = "all" | "text" | "video" | "podcast";

interface Props {
  audienceFilter?: AudienceFilter;
}

export const ArticlesFeed = ({ audienceFilter: propFilter }: Props) => {
  const { audience } = useAudience();
  const mappedGlobal: AudienceFilter = audience === "individual" ? "personal" : "business";
  const audienceFilter: AudienceFilter = propFilter ?? mappedGlobal;
  const [mediaFilter, setMediaFilter] = useState<MediaFilter>("all");

  const byAudience = audienceFilter === 'all'
    ? ARTICLES
    : ARTICLES.filter((a) => a.audience === audienceFilter || a.audience === 'both');

  const filtered = mediaFilter === 'all'
    ? byAudience
    : byAudience.filter((a) => (a.mediaType ?? 'text') === mediaFilter);

  const featured = filtered.find((a) => a.isFeatured);
  const rest = filtered.filter((a) => !a.isFeatured).slice(0, 6);

  return (
    <div className="space-y-6">
      <div className="flex gap-1.5 mb-4">
        {MEDIA_PILLS.map((pill) => (
          <button
            key={pill.value}
            onClick={() => setMediaFilter(pill.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
              mediaFilter === pill.value
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
            }`}
          >
            {pill.label}
          </button>
        ))}
      </div>
      {filtered.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground text-sm">
          Оберіть "Для бізнесу" для матеріалів з оподаткування ФОП та ТОВ
        </div>
      ) : (
        <>
          {featured && (
            <ArticleCard article={featured} author={getAuthor(featured.authorId)} size="featured" />
          )}
          <div className="space-y-0">
            {rest.map((article) => (
              <ArticleCard key={article.id} article={article} size="list" />
            ))}
          </div>
        </>
      )}
    </div>
  );
};
