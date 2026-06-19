import { useEffect, useState, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, Star, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export interface RailSection {
  id: string;
  name: string;
  emoji: string;
  href: string;
}

export interface RailGroup {
  id: string;
  emoji: string;
  label: string;
  sections: RailSection[];
}

interface Props {
  groups: RailGroup[];
  pinned: RailSection[];
  recent: RailSection[];
  totalCount: number;
  onNavigate?: (id: string) => void;
}

const SCROLL_OFFSET = 110;

/**
 * Desktop-only sticky left rail (Stripe/Linear-style) with collapsible groups
 * and scroll-spy highlighting of the active section group.
 */
export const DovidnykyDeskRail = ({ groups, pinned, recent, totalCount, onNavigate }: Props) => {
  const sectionIds = useMemo(
    () => [
      ...(pinned.length ? ["pinned"] : []),
      ...(recent.length ? ["recent"] : []),
      ...groups.map((g) => `g-${g.id}`),
    ],
    [groups, pinned.length, recent.length],
  );

  const [activeId, setActiveId] = useState<string>(sectionIds[0] ?? "");
  const [openGroupId, setOpenGroupId] = useState<string | null>(null);

  // Scroll-spy via IntersectionObserver on the actual DOM sections.
  useEffect(() => {
    if (typeof window === "undefined" || sectionIds.length === 0) return;
    const els = sectionIds
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
          setActiveId(top);
        }
      },
      { rootMargin: "-20% 0px -65% 0px", threshold: [0, 0.1, 0.25, 0.5] },
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [sectionIds.join("|")]);

  // Auto-expand active group
  useEffect(() => {
    if (activeId.startsWith("g-")) {
      setOpenGroupId(activeId.slice(2));
    }
  }, [activeId]);

  const handleAnchor = useCallback((e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - SCROLL_OFFSET;
    window.scrollTo({ top, behavior: "smooth" });
    setActiveId(id);
  }, []);

  return (
    <aside
      className="hidden lg:block w-[220px] shrink-0"
      aria-label="Тематичні групи довідників"
    >
      <nav className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto pr-2 -mr-2 scrollbar-none">
        <p className="px-2 pb-2 text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
          Розділи · {totalCount}
        </p>

        {/* Pinned */}
        {pinned.length > 0 && (
          <a
            href="#pinned"
            onClick={(e) => handleAnchor(e, "pinned")}
            aria-current={activeId === "pinned" ? "true" : undefined}
            className={cn(
              "flex items-center gap-2 px-2 h-8 rounded-md text-sm font-medium transition-colors",
              activeId === "pinned"
                ? "bg-primary/10 text-primary"
                : "text-foreground hover:bg-muted",
            )}
          >
            <Star className="h-3.5 w-3.5 text-amber-500" />
            <span className="flex-1 truncate">Найзатребуваніше</span>
            <span className="text-[10px] font-mono text-muted-foreground">{pinned.length}</span>
          </a>
        )}

        {/* Recent */}
        {recent.length > 0 && (
          <a
            href="#recent"
            onClick={(e) => handleAnchor(e, "recent")}
            aria-current={activeId === "recent" ? "true" : undefined}
            className={cn(
              "flex items-center gap-2 px-2 h-8 rounded-md text-sm font-medium transition-colors",
              activeId === "recent"
                ? "bg-primary/10 text-primary"
                : "text-foreground hover:bg-muted",
            )}
          >
            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="flex-1 truncate">Нещодавні</span>
            <span className="text-[10px] font-mono text-muted-foreground">{recent.length}</span>
          </a>
        )}

        {(pinned.length > 0 || recent.length > 0) && (
          <div className="my-2 border-t border-border/60" />
        )}

        {/* Groups */}
        <ul className="space-y-0.5">
          {groups.map((g) => {
            const gid = `g-${g.id}`;
            const isActive = activeId === gid;
            const isOpen = openGroupId === g.id;
            return (
              <li key={g.id}>
                <div className="flex items-stretch">
                  <a
                    href={`#${gid}`}
                    onClick={(e) => handleAnchor(e, gid)}
                    aria-current={isActive ? "true" : undefined}
                    className={cn(
                      "flex items-center gap-2 px-2 h-8 rounded-md flex-1 min-w-0 text-sm transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-foreground hover:bg-muted",
                    )}
                  >
                    <span className="text-base leading-none" aria-hidden>{g.emoji}</span>
                    <span className="flex-1 truncate">{g.label}</span>
                    <span className="text-[10px] font-mono text-muted-foreground">{g.sections.length}</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => setOpenGroupId(isOpen ? null : g.id)}
                    aria-label={isOpen ? "Згорнути" : "Розгорнути"}
                    aria-expanded={isOpen}
                    className="ml-0.5 w-6 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors flex items-center justify-center"
                  >
                    <ChevronDown
                      className={cn("h-3.5 w-3.5 transition-transform", isOpen && "rotate-180")}
                    />
                  </button>
                </div>
                {isOpen && (
                  <ul className="mt-0.5 ml-3 pl-2 border-l border-border/60 space-y-0.5">
                    {g.sections.map((s) => (
                      <li key={s.id}>
                        <Link
                          to={s.href}
                          onClick={() => onNavigate?.(s.id)}
                          className="block px-2 h-7 leading-7 rounded-md text-xs text-muted-foreground hover:bg-muted hover:text-foreground truncate"
                          title={s.name}
                        >
                          {s.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};
