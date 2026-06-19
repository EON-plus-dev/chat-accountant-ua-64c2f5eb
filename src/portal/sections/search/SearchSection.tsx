import { useRef, useEffect, useState, useMemo, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { BadgeCategory } from "@/portal/components/BadgeCategory";
import { Search } from "lucide-react";
import { usePortalSearch } from "@/portal/hooks/usePortalSearch";

const PILLS = ["ЄСВ 2025", "ФОП 3 група", "ПДВ", "Звітність"];

interface FlatItem {
  href: string;
  group: string;
}

export const SearchSection = () => {
  const { query, setQuery, results, hasResults, totalCount, isOpen, setIsOpen } = usePortalSearch();
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(-1);

  // Build flat items list for keyboard navigation
  const flatItems = useMemo(() => {
    const items: FlatItem[] = [];
    results.articles.forEach((a) => items.push({ href: `/articles/${a.slug}`, group: "articles" }));
    results.tools.forEach((t) => items.push({ href: `/tools/${t.slug}`, group: "tools" }));
    results.knowledge.forEach((k) => items.push({ href: `/dovidnyky/slovnyk/${k.slug}`, group: "knowledge" }));
    return items;
  }, [results]);

  // Reset active index when results change
  useEffect(() => {
    setActiveIndex(-1);
  }, [flatItems]);

  // Close on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [setIsOpen]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [setIsOpen]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isOpen || flatItems.length === 0) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setActiveIndex((prev) => (prev < flatItems.length - 1 ? prev + 1 : 0));
          break;
        case "ArrowUp":
          e.preventDefault();
          setActiveIndex((prev) => (prev > 0 ? prev - 1 : flatItems.length - 1));
          break;
        case "Enter":
          e.preventDefault();
          if (activeIndex >= 0 && flatItems[activeIndex]) {
            setIsOpen(false);
            navigate(flatItems[activeIndex].href);
          }
          break;
      }
    },
    [isOpen, flatItems, activeIndex, navigate, setIsOpen]
  );

  const showDropdown = isOpen && query.length >= 2;

  // Track flat index for rendering
  let flatIdx = -1;

  return (
    <section className="py-10 sm:py-16 bg-muted/30">
      <div className="max-w-2xl mx-auto px-4 space-y-6 text-center">
        <p className="text-sm font-medium text-muted-foreground">
          Запитайте будь-що про податки та бухоблік
        </p>

        <div ref={containerRef} className="relative" role="combobox" aria-expanded={showDropdown} aria-haspopup="listbox">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setIsOpen(true);
                }}
                onFocus={() => setIsOpen(true)}
                onKeyDown={handleKeyDown}
                placeholder="Наприклад: ЄСВ, ФОП, ПДВ..."
                className="pl-9"
                role="searchbox"
                aria-autocomplete="list"
                aria-controls="portal-search-listbox"
              />
            </div>
          </div>

          {/* Dropdown */}
          {showDropdown && (
            <div
              id="portal-search-listbox"
              role="listbox"
              className="absolute left-0 right-0 top-full mt-2 z-50 rounded-lg border border-border bg-card shadow-lg overflow-hidden text-left"
            >
              {hasResults ? (
                <div className="max-h-80 overflow-y-auto divide-y divide-border">
                  {results.articles.length > 0 && (
                    <div className="p-3 space-y-2">
                      <p className="text-xs font-semibold text-muted-foreground uppercase">Статті</p>
                      {results.articles.map((a) => {
                        flatIdx++;
                        const isActive = flatIdx === activeIndex;
                        return (
                          <Link
                            key={a.id}
                            to={`/articles/${a.slug}`}
                            onClick={() => setIsOpen(false)}
                            role="option"
                            aria-selected={isActive}
                            className={`flex items-start gap-2 py-1 px-1 rounded group transition-colors ${isActive ? "bg-accent" : ""}`}
                          >
                            <BadgeCategory type={a.type} />
                            <span className="text-sm text-foreground group-hover:text-primary transition-colors line-clamp-1">
                              {a.title}
                            </span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                  {results.tools.length > 0 && (
                    <div className="p-3 space-y-2">
                      <p className="text-xs font-semibold text-muted-foreground uppercase">Інструменти</p>
                      {results.tools.map((t) => {
                        flatIdx++;
                        const isActive = flatIdx === activeIndex;
                        return (
                          <Link
                            key={t.id}
                            to={`/tools/${t.slug}`}
                            onClick={() => setIsOpen(false)}
                            role="option"
                            aria-selected={isActive}
                            className={`flex items-center gap-2 py-1 px-1 rounded group transition-colors ${isActive ? "bg-accent" : ""}`}
                          >
                            <span>{t.emoji}</span>
                            <span className="text-sm text-foreground group-hover:text-primary transition-colors">
                              {t.name}
                            </span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                  {results.knowledge.length > 0 && (
                    <div className="p-3 space-y-2">
                      <p className="text-xs font-semibold text-muted-foreground uppercase">Словник</p>
                      {results.knowledge.map((k) => {
                        flatIdx++;
                        const isActive = flatIdx === activeIndex;
                        return (
                          <Link
                            key={k.id}
                            to={`/dovidnyky/slovnyk/${k.slug}`}
                            onClick={() => setIsOpen(false)}
                            role="option"
                            aria-selected={isActive}
                            className={`flex items-start gap-2 py-1 px-1 rounded group transition-colors ${isActive ? "bg-accent" : ""}`}
                          >
                            <span className="text-sm font-semibold text-foreground">{k.term}</span>
                            <span className="text-xs text-muted-foreground line-clamp-1">
                              {k.shortDefinition}
                            </span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                  <div className="p-2 text-center">
                    <span className="text-xs text-muted-foreground">
                      Знайдено {totalCount} результатів для «{query}»
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Нічого не знайдено за запитом «{query}»
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Спробуйте: ЄСВ, ФОП, ПДВ, Звітність
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {!showDropdown && (
          <div className="flex flex-wrap justify-center gap-2">
            {PILLS.map((pill) => (
              <Badge
                key={pill}
                variant="outline"
                className="cursor-pointer hover:bg-accent transition-colors"
                onClick={() => {
                  setQuery(pill);
                  setIsOpen(true);
                }}
              >
                {pill}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
