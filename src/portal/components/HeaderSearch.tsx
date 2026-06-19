import { useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, X, FileText, Wrench, BookOpen, LayoutGrid } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { usePortalSearch } from "@/portal/hooks/usePortalSearch";
import { BadgeCategory } from "@/portal/components/BadgeCategory";

interface HeaderSearchProps {
  open: boolean;
  onClose: () => void;
}

export const HeaderSearch = ({ open, onClose }: HeaderSearchProps) => {
  const { query, setQuery, results, hasResults, totalCount } = usePortalSearch();
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    } else {
      setQuery("");
    }
  }, [open, setQuery]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
          className="overflow-hidden border-b border-border/50 bg-muted/30"
        >
          <div className="max-w-7xl mx-auto flex items-center gap-2 h-11 px-4 sm:px-6 lg:px-8 relative">
            <Search className="w-4 h-4 text-muted-foreground shrink-0" />
            <input
              ref={searchInputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Пошук: статті, калькулятори, словник..."
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/70"
            />
            <kbd className="hidden sm:inline-flex text-[10px] text-muted-foreground border border-border rounded px-1.5 py-0.5">
              ESC
            </kbd>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          {query.length >= 2 && (
            <div className="border-t border-border/30 bg-background">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 max-h-80 overflow-y-auto">
                {!hasResults ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Нічого не знайдено за «{query}»
                  </p>
                ) : (
                  <div className="space-y-4">
                    {results.articles.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Статті</p>
                        {results.articles.map((a) => (
                          <Link
                            key={a.id}
                            to={`/articles/${a.slug}`}
                            onClick={onClose}
                            className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-muted transition-colors"
                          >
                            <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                            <span className="flex-1 text-sm truncate">{a.title}</span>
                            <BadgeCategory type={a.type} />
                          </Link>
                        ))}
                      </div>
                    )}

                    {results.tools.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Інструменти</p>
                        {results.tools.map((t) => (
                          <Link
                            key={t.id}
                            to={`/tools/${t.slug}`}
                            onClick={onClose}
                            className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-muted transition-colors"
                          >
                            <Wrench className="w-4 h-4 text-muted-foreground shrink-0" />
                            <span>{t.emoji}</span>
                            <span className="text-sm truncate">{t.name}</span>
                          </Link>
                        ))}
                      </div>
                    )}

                    {results.knowledge.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Словник</p>
                        {results.knowledge.map((k) => (
                          <Link
                            key={k.id}
                            to={`/dovidnyky/slovnyk/${k.slug}`}
                            onClick={onClose}
                            className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-muted transition-colors"
                          >
                            <BookOpen className="w-4 h-4 text-muted-foreground shrink-0" />
                            <span className="text-sm font-medium">{k.term}</span>
                            <span className="text-xs text-muted-foreground truncate">{k.shortDefinition}</span>
                          </Link>
                        ))}
                      </div>
                    )}

                    {results.sections.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Розділи</p>
                        {results.sections.map((s) => (
                          <Link
                            key={s.href}
                            to={s.href}
                            onClick={onClose}
                            className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-muted transition-colors"
                          >
                            <LayoutGrid className="w-4 h-4 text-muted-foreground shrink-0" />
                            <span className="text-sm truncate">{s.label}</span>
                          </Link>
                        ))}
                      </div>
                    )}

                    <p className="text-xs text-muted-foreground text-center pt-1">
                      Знайдено {totalCount} результатів
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {query.length < 2 && query.length > 0 && (
            <div className="border-t border-border/30 bg-background">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                <p className="text-sm text-muted-foreground text-center">
                  Введіть мінімум 2 символи для пошуку
                </p>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
