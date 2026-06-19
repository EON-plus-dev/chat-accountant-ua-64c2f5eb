import { useState, useMemo, useEffect, useRef } from "react";
import { ARTICLES, type Article } from "@/portal/data/articles";
import { TOOLS, type Tool } from "@/portal/data/tools";
import { KNOWLEDGE, type KnowledgeEntry } from "@/portal/data/knowledge";
import { analytics } from "@/portal/services/analytics";

export interface SectionItem {
  label: string;
  href: string;
}

const SECTIONS: SectionItem[] = [
  // Публікації
  { label: "Публікації — всі матеріали", href: "/publications" },
  { label: "Новини про оподаткування", href: "/publications/news" },
  { label: "Гайди для підприємців", href: "/publications/guides" },
  { label: "Консультації та роз'яснення", href: "/publications/consultations" },
  { label: "Рейтинги 2025", href: "/publications/ratings" },
  // Аналітика
  { label: "Ринок праці — зарплатні бенчмарки", href: "/analytics/labor" },
  { label: "Іпотека 2025 — єОселя і банки", href: "/analytics/mortgage" },
  // Довідники
  { label: "Штрафи і санкції", href: "/dovidnyky/penalties" },
  { label: "Каталог бухгалтерів", href: "/dovidnyky/accountants" },
  // Навчання
  { label: "Навчальний центр FINTODO", href: "/learn" },
  { label: "Курси для ФОП", href: "/learn/fop" },
  { label: "Курси для бухгалтерів", href: "/learn/accountants" },
  { label: "IT-фрілансери — навчання", href: "/learn/it" },
];

export interface SearchResults {
  articles: Article[];
  tools: Tool[];
  knowledge: KnowledgeEntry[];
  sections: SectionItem[];
}

export function usePortalSearch() {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const results: SearchResults = useMemo(() => {
    if (!query.trim() || query.length < 2) {
      return { articles: [], tools: [], knowledge: [], sections: [] };
    }
    const q = query.toLowerCase();
    return {
      articles: ARTICLES.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.excerpt.toLowerCase().includes(q) ||
          a.tags.some((t) => t.toLowerCase().includes(q)) ||
          a.categoryLabel.toLowerCase().includes(q)
      ).slice(0, 5),
      tools: TOOLS.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q)
      ).slice(0, 3),
      knowledge: KNOWLEDGE.filter(
        (k) =>
          k.term.toLowerCase().includes(q) ||
          k.shortDefinition.toLowerCase().includes(q)
      ).slice(0, 3),
      sections: SECTIONS.filter(
        (s) => s.label.toLowerCase().includes(q)
      ).slice(0, 5),
    };
  }, [query]);

  const hasResults = results.articles.length > 0 || results.tools.length > 0 || results.knowledge.length > 0 || results.sections.length > 0;
  const totalCount = results.articles.length + results.tools.length + results.knowledge.length + results.sections.length;

  const lastTrackedQuery = useRef("");
  useEffect(() => {
    if (query.length >= 2 && hasResults && query !== lastTrackedQuery.current) {
      lastTrackedQuery.current = query;
      analytics.searchUsed(query, totalCount);
    }
  }, [query, hasResults, totalCount]);

  return { query, setQuery, results, hasResults, totalCount, isOpen, setIsOpen };
}
