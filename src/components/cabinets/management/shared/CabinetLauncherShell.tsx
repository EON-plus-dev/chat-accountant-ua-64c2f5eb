import { useMemo, useState } from "react";
import { Search, Sparkles, CornerDownLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { TileButton, ALERT_RE, type LauncherTileItem, type TileTone } from "./TileButton";

export interface LauncherShellGroup {
  id: string;
  title: string;
  tone: TileTone;
  tiles: LauncherTileItem[];
}

interface Props {
  title: string;
  subtitleFallback?: string;
  groups: LauncherShellGroup[];
  onOpenModule: (tileId: string) => void;
}

export function CabinetLauncherShell({ title, subtitleFallback, groups, onOpenModule }: Props) {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const { toast } = useToast();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return groups;
    return groups
      .map((g) => ({
        ...g,
        tiles: g.tiles.filter(
          (t) =>
            t.label.toLowerCase().includes(q) ||
            g.title.toLowerCase().includes(q) ||
            t.metric.toLowerCase().includes(q),
        ),
      }))
      .filter((g) => g.tiles.length > 0);
  }, [query, groups]);

  const totals = useMemo(() => {
    const all = groups.flatMap((g) => g.tiles);
    const attention = all.filter((t) => t.sub && ALERT_RE.test(t.sub)).length;
    return { total: all.length, attention };
  }, [groups]);

  const askAi = () =>
    toast({ title: "AI-асистент", description: "Відкрийте чат-панель і поставте запитання." });

  const hasResults = filtered.length > 0;

  return (
    <div className="container max-w-6xl mx-auto p-4 md:p-6 space-y-6 md:space-y-8">
      <header className="flex flex-col md:flex-row md:items-end gap-3 md:gap-6">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">{title}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {totals.total > 0 ? (
              <>
                {totals.total} модулів
                {totals.attention > 0 && (
                  <>
                    {" · "}
                    <span className="text-amber-600 dark:text-amber-400 font-medium">
                      {totals.attention} {totals.attention === 1 ? "потребує" : "потребують"} уваги
                    </span>
                  </>
                )}
              </>
            ) : (
              subtitleFallback
            )}
          </p>
        </div>
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setTimeout(() => setFocused(false), 150)}
            placeholder="Пошук розділу"
            className="pl-9 pr-3 h-10 rounded-full bg-card"
            aria-label="Пошук розділу"
          />
          {focused && !query && (
            <div className="absolute left-0 right-0 top-full mt-1 px-3 text-[11px] text-muted-foreground flex items-center justify-end gap-1.5">
              <span>Не знайшли?</span>
              <button
                type="button"
                onMouseDown={(e) => { e.preventDefault(); askAi(); }}
                className="inline-flex items-center gap-1 text-foreground hover:text-primary font-medium"
              >
                <Sparkles className="w-3 h-3" />
                Запитати AI
                <CornerDownLeft className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </header>

      {hasResults ? (
        <div className="space-y-6 md:space-y-8">
          {filtered.map((g) => (
            <section key={g.id}>
              <div className="flex items-center gap-3 mb-3">
                <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground shrink-0">
                  {g.title}
                </h2>
                <div className="h-px bg-border/60 flex-1" />
                <span className="text-[11px] text-muted-foreground/70 tabular-nums">{g.tiles.length}</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {g.tiles.map((tile) => (
                  <TileButton
                    key={tile.id}
                    tile={tile}
                    tone={g.tone}
                    onClick={() => onOpenModule(tile.id)}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border border-dashed border-border/60 rounded-xl">
          <p className="text-sm text-muted-foreground mb-3">Нічого не знайдено для «{query}»</p>
          <Button variant="outline" size="sm" className="rounded-full gap-2" onClick={askAi}>
            <Sparkles className="w-4 h-4" />
            Запитати AI
          </Button>
        </div>
      )}
    </div>
  );
}
