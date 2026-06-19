import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useMergedForumData } from "@/hooks/useAiChatQueries";
import { type AIConsultation } from "@/config/aiConsultationMockData";
import { Clock } from "lucide-react";

const STORAGE_KEY = "recently_viewed_consultations";
const MAX_ITEMS = 3;

export const useRecentlyViewed = (currentSlug?: string) => {
  useEffect(() => {
    if (!currentSlug) return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const slugs: string[] = raw ? JSON.parse(raw) : [];
      const filtered = slugs.filter((s) => s !== currentSlug);
      filtered.unshift(currentSlug);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered.slice(0, MAX_ITEMS + 1)));
    } catch {}
  }, [currentSlug]);
};

export const RecentlyViewedSidebar = ({ excludeSlug }: { excludeSlug?: string }) => {
  const [items, setItems] = useState<AIConsultation[]>([]);
  const { items: allItems } = useMergedForumData();

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const slugs: string[] = raw ? JSON.parse(raw) : [];
      const filtered = slugs.filter((s) => s !== excludeSlug);
      const found = filtered
        .map((slug) => allItems.find((c) => c.slug === slug))
        .filter(Boolean)
        .slice(0, MAX_ITEMS) as AIConsultation[];
      setItems(found);
    } catch {}
  }, [excludeSlug, allItems]);

  if (items.length === 0) return null;

  return (
    <div className="rounded-xl border border-border/60 bg-card p-4 space-y-2">
      <h3 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
        <Clock className="w-3.5 h-3.5 text-muted-foreground" />
        Нещодавно переглянуті
      </h3>
      <div className="space-y-1.5">
        {items.map((c) => (
          <Link
            key={c.id}
            to={`/ai-consultations/${c.slug}`}
            className="block text-xs text-muted-foreground hover:text-primary transition-colors line-clamp-2 leading-snug py-0.5"
          >
            {c.question}
          </Link>
        ))}
      </div>
    </div>
  );
};
