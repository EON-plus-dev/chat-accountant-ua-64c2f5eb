import { useEffect, useState } from "react";

export interface TOCItem {
  id: string;
  label: string;
}

interface Props {
  items: TOCItem[];
  /** Top offset (in px) under which a section is considered active when scrolling. */
  topOffset?: number;
}

/**
 * Sticky scroll-spy TOC: horizontal pill bar that highlights the section
 * currently in view. Sticks under the portal header on desktop; scrolls
 * horizontally on mobile.
 */
export function StickyTOC({ items, topOffset = 96 }: Props) {
  const [activeId, setActiveId] = useState<string>(items[0]?.id ?? "");

  useEffect(() => {
    const onScroll = () => {
      let current = items[0]?.id ?? "";
      for (const it of items) {
        const el = document.getElementById(it.id);
        if (!el) continue;
        const top = el.getBoundingClientRect().top;
        if (top - topOffset <= 0) current = it.id;
      }
      setActiveId(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [items, topOffset]);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    e.preventDefault();
    const y = el.getBoundingClientRect().top + window.scrollY - (topOffset - 16);
    window.scrollTo({ top: y, behavior: "smooth" });
    history.replaceState(null, "", `#${id}`);
  };

  return (
    <nav
      aria-label="Зміст сторінки"
      className="sticky top-14 z-30 -mx-1 px-1 py-2 bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70 border-b border-border/60"
    >
      <div className="flex flex-nowrap gap-1.5 overflow-x-auto scrollbar-hide">
        {items.map((it) => {
          const active = activeId === it.id;
          return (
            <a
              key={it.id}
              href={`#${it.id}`}
              onClick={(e) => handleClick(e, it.id)}
              className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                active
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
              }`}
            >
              {it.label}
            </a>
          );
        })}
      </div>
    </nav>
  );
}
