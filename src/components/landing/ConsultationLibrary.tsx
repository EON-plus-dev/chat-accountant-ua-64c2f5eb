import { useState, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useDebouncedValue } from "@/hooks/use-debounce";
import { mockConsultations } from "@/config/consultationMockData";
import { ConsultationCard } from "./ConsultationCard";
import { useAudience } from "@/contexts/AudienceContext";
import { JsonLd } from "@/components/seo/JsonLd";
import { stripMarkdown } from "@/lib/markdownRenderer";

const PAGE_SIZE = 6;

export const ConsultationLibrary = () => {
  const { audience } = useAudience();
  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [showCount, setShowCount] = useState(PAGE_SIZE);
  const debouncedQuery = useDebouncedValue(query, 300);

  // Collect popular tags for current audience
  const popularTags = useMemo(() => {
    const tagCount: Record<string, number> = {};
    mockConsultations
      .filter((c) => c.audience === audience)
      .forEach((c) => c.tags.forEach((t) => { tagCount[t] = (tagCount[t] || 0) + 1; }));
    return Object.entries(tagCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([tag]) => tag);
  }, [audience]);

  const filtered = useMemo(() => {
    const lower = debouncedQuery.toLowerCase();
    return mockConsultations
      .filter((c) => c.audience === audience)
      .filter((c) => !activeTag || c.tags.includes(activeTag))
      .filter(
        (c) =>
          !lower ||
          c.question.toLowerCase().includes(lower) ||
          c.answer.toLowerCase().includes(lower) ||
          c.tags.some((t) => t.toLowerCase().includes(lower))
      )
      .sort((a, b) => {
        const dateA = a.updatedDate || a.date;
        const dateB = b.updatedDate || b.date;
        return dateB.localeCompare(dateA);
      });
  }, [audience, debouncedQuery, activeTag]);

  const visible = filtered.slice(0, showCount);
  const hasMore = showCount < filtered.length;

  const handleTagClick = useCallback((tag: string) => {
    setActiveTag((prev) => (prev === tag ? null : tag));
    setShowCount(PAGE_SIZE);
  }, []);

  // FAQPage JSON-LD for top 10 visible Q&As
  const faqSchema = useMemo(() => {
    const top10 = filtered.slice(0, 10);
    if (top10.length === 0) return null;
    return {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: top10.map((c) => ({
        "@type": "Question",
        name: c.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: stripMarkdown(c.answer.split("\n\n")[0]),
        },
      })),
    };
  }, [filtered]);

  return (
    <section id="consultation-library" aria-labelledby="library-heading" className="mt-20">
      {faqSchema && <JsonLd data={faqSchema} />}
      <h2 id="library-heading" className="text-xl font-bold text-foreground mb-4">
        Бібліотека
      </h2>

      {/* Tag chips */}
      <div className="flex flex-wrap gap-2 mb-4">
        {popularTags.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => handleTagClick(tag)}
            className={`text-xs px-3 py-1 rounded-full border transition-colors ${
              activeTag === tag
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-muted text-muted-foreground border-transparent hover:bg-accent hover:text-accent-foreground"
            }`}
          >
            {tag}
          </button>
        ))}
        {activeTag && (
          <button
            type="button"
            onClick={() => { setActiveTag(null); setShowCount(PAGE_SIZE); }}
            className="text-xs px-3 py-1 rounded-full text-muted-foreground hover:text-foreground transition-colors"
          >
            ✕ Скинути
          </button>
        )}
      </div>

      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => { setQuery(e.target.value); setShowCount(PAGE_SIZE); }}
          placeholder="Пошук серед консультацій..."
          className="pl-9"
          aria-label="Пошук серед консультацій"
        />
      </div>

      <p className="text-sm text-muted-foreground mb-4">
        Знайдено {filtered.length} консультаці{filtered.length === 1 ? "ю" : filtered.length >= 2 && filtered.length <= 4 ? "ї" : "й"}
      </p>

      {visible.length === 0 ? (
        <p className="text-sm text-muted-foreground">Нічого не знайдено. Спробуйте інший запит.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {visible.map((item) => (
            <ConsultationCard key={item.id} item={item} onTagClick={handleTagClick} />
          ))}
        </div>
      )}

      {hasMore && (
        <div className="flex justify-center mt-6">
          <Button variant="outline" onClick={() => setShowCount((c) => c + PAGE_SIZE)}>
            Показати більше
          </Button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
        <Link
          to="/consultations"
          className="text-sm text-primary hover:underline transition-colors"
        >
          Переглянути всі {mockConsultations.filter((c) => c.audience === audience).length} консультацій →
        </Link>
        <button
          type="button"
          onClick={() => window.dispatchEvent(new CustomEvent("open-floating-chat"))}
          className="text-sm text-primary hover:underline transition-colors flex items-center gap-1"
        >
          💬 Запитайте в AI-консультанта
        </button>
      </div>
    </section>
  );
};
