import { useEffect, useRef, useState, useCallback } from "react";
import type { AccountantProfile } from "@/portal/data/accountants";

export interface SectionNavItem {
  id: string;
  label: string;
}

interface Props {
  items: SectionNavItem[];
  acc: AccountantProfile;
  /** Top offset (px) under which a section is considered active. */
  topOffset?: number;
}

/**
 * Non-sticky section navigation for accountant profile pages.
 * Renders a horizontal pill bar that scrolls together with the page content.
 */
export function AccountantSectionNav({ items, acc: _acc, topOffset = 96 }: Props) {
  const [activeId, setActiveId] = useState<string>(items[0]?.id ?? "");
  const listRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const container = listRef.current;
    if (!container) return;
    const target = container.querySelector<HTMLElement>(`[data-section-id="${activeId}"]`);
    if (!target) return;
    const offset = target.offsetLeft - container.clientWidth / 2 + target.clientWidth / 2;
    container.scrollTo({ left: Math.max(0, offset), behavior: "smooth" });
  }, [activeId]);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
      const el = document.getElementById(id);
      if (!el) return;
      e.preventDefault();
      const y = el.getBoundingClientRect().top + window.scrollY - (topOffset - 16);
      window.scrollTo({ top: y, behavior: "smooth" });
      history.replaceState(null, "", `#${id}`);
    },
    [topOffset],
  );

  return (
    <nav aria-label="Зміст сторінки" className="-mx-1 px-1 py-2">
      <div ref={listRef} className="flex flex-nowrap gap-1.5 overflow-x-auto scrollbar-hide">
        {items.map((it) => {
          const active = activeId === it.id;
          return (
            <a
              key={it.id}
              href={`#${it.id}`}
              data-section-id={it.id}
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
