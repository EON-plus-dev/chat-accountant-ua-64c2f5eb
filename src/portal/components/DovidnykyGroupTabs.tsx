import { useEffect, useState, useCallback } from "react";

export interface GroupTabItem {
  id: string;
  emoji: string;
  label: string;
  count: number;
}

interface DovidnykyGroupTabsProps {
  groups: GroupTabItem[];
  pinnedCount: number;
}

/**
 * Sticky-стрічка з компактними чипами тематичних груп довідників.
 * - Лічильник у окремому badge, не зливається з назвою.
 * - Mobile: emoji + лічильник, повна назва лише для активного чипа.
 * - Desktop: emoji + назва + лічильник; flex-wrap, якщо вміщається.
 * - IntersectionObserver підсвічує активну секцію під час скролу.
 */
export const DovidnykyGroupTabs = ({ groups, pinnedCount }: DovidnykyGroupTabsProps) => {
  const ids = [
    ...(pinnedCount > 0 ? ["pinned"] : []),
    ...groups.map((g) => `g-${g.id}`),
  ];
  const [active, setActive] = useState<string>(ids[0] ?? "");

  useEffect(() => {
    if (typeof window === "undefined" || ids.length === 0) return;
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
          setActive(top);
        }
      },
      { rootMargin: "-25% 0px -65% 0px", threshold: [0, 0.1, 0.25, 0.5] }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [ids.join("|")]);

  const handleClick = useCallback((e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 110;
    window.scrollTo({ top, behavior: "smooth" });
    setActive(id);
  }, []);

  const chipBase =
    "group/chip inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[12px] transition-colors snap-start shrink-0";
  const chipIdle =
    "bg-muted/40 border-border text-foreground hover:bg-muted hover:border-primary/30";
  const chipActive =
    "bg-primary text-primary-foreground border-primary shadow-sm";
  const countBase =
    "ml-0.5 inline-flex items-center justify-center min-w-[18px] h-[16px] px-1 rounded-full text-[10px] font-mono leading-none";

  return (
    <nav
      className="sticky top-[56px] z-30 -mx-4 sm:mx-0 mb-6 bg-background/85 backdrop-blur border-b border-border/50"
      aria-label="Тематичні групи довідників"
    >
      <div className="px-4 sm:px-0 py-2 overflow-x-auto snap-x scrollbar-none [mask-image:linear-gradient(to_right,transparent,black_16px,black_calc(100%-16px),transparent)]">
        <div className="flex flex-nowrap sm:flex-wrap gap-1.5">
          {pinnedCount > 0 && (() => {
            const isActive = active === "pinned";
            return (
              <a
                href="#pinned"
                onClick={(e) => handleClick(e, "pinned")}
                aria-current={isActive ? "true" : undefined}
                className={`${chipBase} ${isActive ? chipActive : "bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-400 hover:bg-amber-500/15"}`}
              >
                <span aria-hidden>⭐</span>
                <span className={`${isActive ? "inline" : "hidden sm:inline"}`}>Найзатребуваніше</span>
                <span className={`${countBase} ${isActive ? "bg-primary-foreground/15 text-primary-foreground" : "bg-amber-500/15 text-amber-700 dark:text-amber-300"}`}>
                  {pinnedCount}
                </span>
              </a>
            );
          })()}

          {groups.map((g) => {
            const id = `g-${g.id}`;
            const isActive = active === id;
            return (
              <a
                key={g.id}
                href={`#${id}`}
                onClick={(e) => handleClick(e, id)}
                aria-current={isActive ? "true" : undefined}
                className={`${chipBase} ${isActive ? chipActive : chipIdle}`}
              >
                <span aria-hidden>{g.emoji}</span>
                <span className={`${isActive ? "inline" : "hidden sm:inline"}`}>{g.label}</span>
                <span
                  className={`${countBase} ${isActive ? "bg-primary-foreground/20 text-primary-foreground" : "bg-background/60 text-muted-foreground"}`}
                >
                  {g.count}
                </span>
              </a>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
