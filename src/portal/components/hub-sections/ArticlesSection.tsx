import { useState, useMemo } from "react";
import { ARTICLES } from "@/portal/data/articles";
import { ArticleRow } from "@/portal/components/ArticleRow";
import { StickyFilterBar } from "@/portal/components/StickyFilterBar";
import type { FilterPill } from "@/portal/types/hub";

interface Props {
  pills: FilterPill[];
  category?: string;
  audience?: string;
  tag?: string;
  searchEnabled?: boolean;
}

export const ArticlesSection = ({ pills, category, audience, tag, searchEnabled = true }: Props) => {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const baseArticles = useMemo(() => {
    let result = [...ARTICLES];
    if (category) result = result.filter((a) => a.category === category);
    if (audience) result = result.filter((a) => a.audience === audience || a.audience === "both");
    if (tag) result = result.filter((a) => a.tags.includes(tag));
    return result;
  }, [category, audience, tag]);

  const filtered = useMemo(() => {
    let result = filter === "all" ? baseArticles : baseArticles.filter((a) => a.type === filter);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (a) => a.title.toLowerCase().includes(q) || a.excerpt.toLowerCase().includes(q)
      );
    }
    return result;
  }, [filter, search, baseArticles]);

  return (
    <section className="pb-8 space-y-4">
      <h2 className="text-xl font-bold text-foreground">Матеріали</h2>
      <StickyFilterBar
        pills={pills}
        activeValue={filter}
        onPillChange={setFilter}
        search={searchEnabled ? search : undefined}
        onSearchChange={searchEnabled ? setSearch : undefined}
        searchPlaceholder="Пошук статей..."
        resultCount={filtered.length}
      />
      <div className="mt-4 divide-y divide-border/30">
        {filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">
            Немає статей у цій категорії
          </p>
        ) : (
          filtered.map((article) => (
            <ArticleRow key={article.id} article={article} />
          ))
        )}
      </div>
    </section>
  );
};
