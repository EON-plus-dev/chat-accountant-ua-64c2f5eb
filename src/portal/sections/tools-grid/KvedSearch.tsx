import { useState, useMemo } from "react";
import { Search, ChevronDown, ChevronUp, AlertTriangle, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { KVED_ENTRIES, type KvedEntry } from "@/portal/data/kved";
import { useDebouncedValue } from "@/hooks/use-debounce";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

export const KvedSearch = () => {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, 200);
  const [expandedCode, setExpandedCode] = useState<string | null>(null);

  const popularEntries = useMemo(() => KVED_ENTRIES.filter(k => k.isPopular), []);

  const results = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    if (q.length < 2) return null;
    return KVED_ENTRIES.filter(k =>
      k.code.includes(q) ||
      k.name.toLowerCase().includes(q) ||
      k.description.toLowerCase().includes(q) ||
      k.examples.some(e => e.toLowerCase().includes(q))
    );
  }, [debouncedQuery]);

  const toggleExpand = (code: string) => {
    setExpandedCode(prev => prev === code ? null : code);
  };

  const renderCard = (entry: KvedEntry) => {
    const isExpanded = expandedCode === entry.code;
    return (
      <Card key={entry.code} className="cursor-pointer" onClick={() => toggleExpand(entry.code)}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="default" className="font-mono">{entry.code}</Badge>
                <span className="font-semibold text-foreground text-sm">{entry.name}</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{entry.section}</p>

              <div className="mt-2 flex items-center gap-2 flex-wrap">
                <span className="text-xs text-muted-foreground">ФОП групи:</span>
                {entry.fopGroups.map(g => (
                  <Badge key={g} variant="secondary" size="sm">{g}</Badge>
                ))}
                <span className={cn("text-xs", entry.requiresLicense ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400")}>
                  {entry.requiresLicense ? "⚠ Потрібна ліцензія" : "✓ Ліцензія не потрібна"}
                </span>
              </div>
            </div>
            {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0 mt-1" /> : <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />}
          </div>

          {isExpanded && (
            <div className="mt-4 space-y-3 border-t border-border pt-4 text-sm">
              <div>
                <p className="font-medium text-foreground">Опис</p>
                <p className="text-muted-foreground">{entry.description}</p>
              </div>
              <div>
                <p className="font-medium text-foreground">Податкові особливості</p>
                <p className="text-muted-foreground">{entry.taxNotes}</p>
              </div>
              <div>
                <p className="font-medium text-foreground">Приклади</p>
                <p className="text-muted-foreground">{entry.examples.join(" · ")}</p>
              </div>
              {entry.requiresLicense && entry.licenseInfo && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Ліцензування</AlertTitle>
                  <AlertDescription>{entry.licenseInfo}</AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Назва діяльності або код КВЕД..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Popular chips when no search */}
      {results === null && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground">Популярні КВЕДи</p>
          <div className="flex flex-wrap gap-2">
            {popularEntries.map(k => (
              <button
                key={k.code}
                onClick={() => setQuery(k.name)}
                className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted"
              >
                {k.code} — {k.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {results !== null && (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            {results.length > 0 ? `Знайдено: ${results.length}` : "Нічого не знайдено"}
          </p>
          {results.length === 0 ? (
            <div className="rounded-2xl border border-border bg-muted/30 p-12 text-center">
              <p className="text-lg font-semibold text-foreground">Нічого не знайдено</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Спробуйте інший запит або перевірте правильність коду КВЕД
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {results.map(renderCard)}
            </div>
          )}
        </div>
      )}

      {/* Compatibility hint */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Яка група ФОП підходить для вашого виду діяльності?</AlertTitle>
        <AlertDescription>
          Порівняйте ставки та ліміти для різних груп.{" "}
          <Link to="/tools/tax-calc" className="text-primary hover:underline font-medium">
            Калькулятор єдиного податку →
          </Link>
        </AlertDescription>
      </Alert>
    </div>
  );
};
