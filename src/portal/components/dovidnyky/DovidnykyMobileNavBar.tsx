import { useEffect, useMemo, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { LayoutGrid, Search as SearchIcon, ChevronDown, Star, Clock } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import type { RailGroup, RailSection } from "./DovidnykyDeskRail";

interface Props {
  groups: RailGroup[];
  pinned: RailSection[];
  recent: RailSection[];
  totalCount: number;
  onOpenSearch?: () => void;
  onNavigate?: (id: string) => void;
}

const SCROLL_OFFSET = 110;
type ViewMode = "topics" | "alpha" | "recent";

/**
 * Mobile-only sticky toolbar + bottom-sheet navigation for ~80 directory entries.
 * Replaces the cramped horizontal chip strip with a NN/g-recommended
 * category-landing pattern: tappable "Усі розділи" → sheet with 3 view modes.
 */
export const DovidnykyMobileNavBar = ({
  groups,
  pinned,
  recent,
  totalCount,
  onOpenSearch,
  onNavigate,
}: Props) => {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<ViewMode>("topics");
  const [activeGroupId, setActiveGroupId] = useState<string>(groups[0]?.id ?? "");

  // Scroll-spy: track which group is currently visible to show context label
  useEffect(() => {
    if (typeof window === "undefined") return;
    const ids = [
      ...(pinned.length ? ["pinned"] : []),
      ...groups.map((g) => `g-${g.id}`),
    ];
    const els = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => !!el);
    if (els.length === 0) return;

    const visible = new Map<string, number>();
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) visible.set(e.target.id, e.intersectionRatio);
          else visible.delete(e.target.id);
        });
        if (visible.size > 0) {
          const top = [...visible.entries()].sort((a, b) => b[1] - a[1])[0][0];
          if (top.startsWith("g-")) setActiveGroupId(top.slice(2));
          else if (top === "pinned") setActiveGroupId("pinned");
        }
      },
      { rootMargin: "-20% 0px -65% 0px", threshold: [0, 0.1, 0.25, 0.5] },
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [groups, pinned.length]);

  const handleJump = useCallback((domId: string) => {
    setOpen(false);
    // Wait for sheet to close before scrolling
    requestAnimationFrame(() => {
      const el = document.getElementById(domId);
      if (!el) return;
      const top = el.getBoundingClientRect().top + window.scrollY - SCROLL_OFFSET;
      window.scrollTo({ top, behavior: "smooth" });
    });
  }, []);

  // A-Я: flatten all sections, sort by name, group by first letter
  const alphaGroups = useMemo(() => {
    const all = groups.flatMap((g) => g.sections);
    const sorted = [...all].sort((a, b) => a.name.localeCompare(b.name, "uk"));
    const map = new Map<string, RailSection[]>();
    sorted.forEach((s) => {
      const letter = s.name.charAt(0).toUpperCase();
      if (!map.has(letter)) map.set(letter, []);
      map.get(letter)!.push(s);
    });
    return [...map.entries()];
  }, [groups]);

  const activeGroup =
    activeGroupId === "pinned"
      ? { emoji: "⭐", label: "Найзатребуваніше" }
      : groups.find((g) => g.id === activeGroupId);

  return (
    <div className="lg:hidden sticky top-[56px] z-30 -mx-4 mb-4 bg-background/90 backdrop-blur border-b border-border/60">
      <div className="px-4 py-2 flex items-center gap-2">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <button
              type="button"
              className="flex-1 inline-flex items-center gap-2 h-10 px-3 rounded-lg border border-border bg-card text-sm font-medium text-left hover:bg-muted transition-colors min-w-0"
            >
              <LayoutGrid className="h-4 w-4 shrink-0 text-primary" />
              <span className="truncate flex-1 min-w-0">
                {activeGroup ? (
                  <>
                    <span className="text-muted-foreground text-xs">Ви тут: </span>
                    <span aria-hidden className="mr-1">{activeGroup.emoji}</span>
                    {activeGroup.label}
                  </>
                ) : (
                  <>Усі розділи ({totalCount})</>
                )}
              </span>
              <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
            </button>
          </SheetTrigger>

          <SheetContent side="bottom" className="h-[85vh] p-0 flex flex-col">
            <SheetHeader className="px-4 pt-4 pb-2 shrink-0">
              <SheetTitle className="text-base">Усі розділи довідників</SheetTitle>
            </SheetHeader>

            {/* Mode switcher */}
            <div className="px-4 pb-3 shrink-0">
              <div className="inline-flex w-full rounded-lg border border-border bg-muted/40 p-0.5 text-xs">
                {([
                  { id: "topics", label: "За темами" },
                  { id: "alpha", label: "А–Я" },
                  { id: "recent", label: `Нещодавні${recent.length ? ` · ${recent.length}` : ""}` },
                ] as { id: ViewMode; label: string }[]).map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setMode(t.id)}
                    className={cn(
                      "flex-1 px-2 py-1.5 rounded-md transition-colors",
                      mode === t.id
                        ? "bg-background text-foreground font-medium shadow-sm"
                        : "text-muted-foreground",
                    )}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-2 pb-4">
              {mode === "topics" && (
                <div className="space-y-1">
                  {pinned.length > 0 && (
                    <button
                      onClick={() => handleJump("pinned")}
                      className="w-full flex items-center gap-2 px-3 h-11 rounded-lg hover:bg-muted text-left"
                    >
                      <Star className="h-4 w-4 text-amber-500" />
                      <span className="flex-1 text-sm font-medium">Найзатребуваніше</span>
                      <span className="text-xs text-muted-foreground">{pinned.length}</span>
                    </button>
                  )}
                  {groups.map((g) => (
                    <details key={g.id} open={activeGroupId === g.id} className="group">
                      <summary className="list-none flex items-center gap-2 px-3 h-11 rounded-lg hover:bg-muted cursor-pointer">
                        <span className="text-base" aria-hidden>{g.emoji}</span>
                        <span className="flex-1 text-sm font-medium truncate">{g.label}</span>
                        <span className="text-xs font-mono text-muted-foreground">{g.sections.length}</span>
                        <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-180" />
                      </summary>
                      <div className="ml-3 pl-3 border-l border-border/60 mt-1 mb-2 space-y-0.5">
                        <button
                          onClick={() => handleJump(`g-${g.id}`)}
                          className="block w-full text-left px-2 py-1.5 rounded-md text-xs text-primary hover:bg-muted"
                        >
                          ↳ Перейти до групи на сторінці
                        </button>
                        {g.sections.map((s) => (
                          <Link
                            key={s.id}
                            to={s.href}
                            onClick={() => {
                              onNavigate?.(s.id);
                              setOpen(false);
                            }}
                            className="block px-2 py-1.5 rounded-md text-sm text-foreground hover:bg-muted truncate"
                          >
                            {s.name}
                          </Link>
                        ))}
                      </div>
                    </details>
                  ))}
                </div>
              )}

              {mode === "alpha" && (
                <div className="space-y-3 px-1">
                  {alphaGroups.map(([letter, items]) => (
                    <div key={letter}>
                      <p className="px-2 py-1 text-xs font-bold text-muted-foreground sticky top-0 bg-background">
                        {letter}
                      </p>
                      <ul>
                        {items.map((s) => (
                          <li key={s.id}>
                            <Link
                              to={s.href}
                              onClick={() => {
                                onNavigate?.(s.id);
                                setOpen(false);
                              }}
                              className="block px-3 py-2 rounded-md text-sm text-foreground hover:bg-muted truncate"
                            >
                              {s.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}

              {mode === "recent" && (
                <div className="space-y-0.5 px-1">
                  {recent.length === 0 ? (
                    <p className="text-sm text-muted-foreground px-3 py-6 text-center">
                      Ще немає історії. Відкривайте розділи — вони з'являться тут.
                    </p>
                  ) : (
                    recent.map((s) => (
                      <Link
                        key={s.id}
                        to={s.href}
                        onClick={() => {
                          onNavigate?.(s.id);
                          setOpen(false);
                        }}
                        className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-foreground hover:bg-muted"
                      >
                        <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span className="truncate">{s.name}</span>
                      </Link>
                    ))
                  )}
                </div>
              )}
            </div>
          </SheetContent>
        </Sheet>

        {onOpenSearch && (
          <button
            type="button"
            onClick={onOpenSearch}
            aria-label="Пошук по довідниках"
            className="h-10 w-10 shrink-0 inline-flex items-center justify-center rounded-lg border border-border bg-card hover:bg-muted transition-colors"
          >
            <SearchIcon className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
};
