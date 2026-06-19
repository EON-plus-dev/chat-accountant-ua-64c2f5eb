import { useMemo, useState } from "react";
import { Search, Sparkles, CornerDownLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import type { Cabinet } from "@/types/cabinet";
import {
  individualLauncherGroups as GROUPS,
  ALERT_RE,
  type LauncherTile as Tile,
  type LauncherTone as Tone,
} from "@/components/dashboard/individualLauncherNav";

const TONE: Record<Tone, { iconBg: string; iconColor: string }> = {
  violet:  { iconBg: "bg-violet-50 dark:bg-violet-500/10",   iconColor: "text-violet-600 dark:text-violet-300" },
  emerald: { iconBg: "bg-emerald-50 dark:bg-emerald-500/10", iconColor: "text-emerald-600 dark:text-emerald-300" },
  blue:    { iconBg: "bg-blue-50 dark:bg-blue-500/10",       iconColor: "text-blue-600 dark:text-blue-300" },
  rose:    { iconBg: "bg-rose-50 dark:bg-rose-500/10",       iconColor: "text-rose-600 dark:text-rose-300" },
  indigo:  { iconBg: "bg-indigo-50 dark:bg-indigo-500/10",   iconColor: "text-indigo-600 dark:text-indigo-300" },
};


interface LifeLauncherPageProps {
  cabinet: Cabinet;
  onOpenModule: (subtab: string, inner?: string) => void;
}

export function LifeLauncherPage({ cabinet: _cabinet, onOpenModule }: LifeLauncherPageProps) {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const { toast } = useToast();

  const filteredGroups = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return GROUPS;
    return GROUPS
      .map((g) => ({ ...g, tiles: g.tiles.filter((t) => t.label.toLowerCase().includes(q) || g.title.toLowerCase().includes(q) || t.metric.toLowerCase().includes(q)) }))
      .filter((g) => g.tiles.length > 0);
  }, [query]);

  const totals = useMemo(() => {
    const all = GROUPS.flatMap((g) => g.tiles);
    const attention = all.filter((t) => t.sub && ALERT_RE.test(t.sub)).length;
    return { total: all.length, attention };
  }, []);

  const handleTile = (tile: Tile) => {
    if (!tile.target) {
      toast({ title: `${tile.label} — скоро`, description: "Цей модуль зʼявиться найближчим часом." });
      return;
    }
    onOpenModule(tile.target, tile.inner);
  };

  const askAi = () =>
    toast({ title: "AI-асистент", description: "Відкрийте чат-панель і поставте запитання." });

  const hasResults = filteredGroups.length > 0;

  return (
    <div className="container max-w-6xl mx-auto p-4 md:p-6 space-y-6 md:space-y-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end gap-3 md:gap-6">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Мої сфери</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {totals.total} модулів
            {totals.attention > 0 && (
              <>
                {" · "}
                <span className="text-amber-600 dark:text-amber-400 font-medium">
                  {totals.attention} {totals.attention === 1 ? "потребує" : "потребують"} уваги
                </span>
              </>
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
            placeholder="Пошук сфери або модуля"
            className="pl-9 pr-3 h-10 rounded-full bg-card"
            aria-label="Пошук сфери або модуля"
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

      {/* Sections */}
      {hasResults ? (
        <div className="space-y-6 md:space-y-8">
          {filteredGroups.map((g) => (
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
                  <TileButton key={tile.id} tile={tile} tone={g.tone} onClick={() => handleTile(tile)} />
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

interface TileButtonProps {
  tile: Tile;
  tone: Tone;
  onClick: () => void;
}

function TileButton({ tile, tone, onClick }: TileButtonProps) {
  const t = TONE[tone];
  const Icon = tile.icon;
  const showAlert = tile.sub && ALERT_RE.test(tile.sub);

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group relative text-left rounded-xl bg-card p-3 md:p-4",
        "h-[88px] md:h-[104px]",
        "border border-border/60 hover:border-foreground/20",
        "transition-all duration-150 hover:shadow-sm",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
        "flex flex-col justify-between"
      )}
    >
      {showAlert && (
        <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded-full text-[9px] md:text-[10px] font-medium bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300 leading-none">
          {tile.sub}
        </span>
      )}
      <div className="flex items-center gap-2 min-w-0">
        <div className={cn("w-7 h-7 md:w-8 md:h-8 rounded-lg flex items-center justify-center shrink-0", t.iconBg)}>
          <Icon className={cn("w-4 h-4", t.iconColor)} />
        </div>
        <div className="text-sm font-medium truncate">{tile.label}</div>
      </div>
      <div className="text-xs md:text-sm text-muted-foreground truncate tabular-nums">
        {tile.metric}
      </div>
    </button>
  );
}

export default LifeLauncherPage;
