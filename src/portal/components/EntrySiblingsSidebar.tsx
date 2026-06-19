import { useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import { ChevronLeft, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export interface SiblingItem {
  slug: string;
  label: string;
  group?: string;
  meta?: string;
}

interface Props {
  items: SiblingItem[];
  currentSlug: string;
  basePath: string;
  title: string;
  backHref: string;
  backLabel?: string;
  searchThreshold?: number;
  searchPlaceholder?: string;
}

export const EntrySiblingsSidebar = ({
  items,
  currentSlug,
  basePath,
  title,
  backHref,
  backLabel = "До списку",
  searchThreshold = 25,
  searchPlaceholder = "Пошук...",
}: Props) => {
  const [query, setQuery] = useState("");
  const showSearch = items.length > searchThreshold;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (i) =>
        i.label.toLowerCase().includes(q) ||
        (i.meta?.toLowerCase().includes(q) ?? false) ||
        i.slug.toLowerCase().includes(q),
    );
  }, [items, query]);

  const groups = useMemo(() => {
    const map = new Map<string, SiblingItem[]>();
    for (const item of filtered) {
      const key = item.group ?? "";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(item);
    }
    return Array.from(map.entries());
  }, [filtered]);

  return (
    <aside className="hidden lg:block w-60 shrink-0">
      <div className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto pr-1 space-y-3">
        <NavLink
          to={backHref}
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="h-3 w-3" />
          {backLabel}
        </NavLink>

        <div>
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {title}
          </h3>
        </div>

        {showSearch && (
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={searchPlaceholder}
              className="pl-8 h-8 text-xs"
            />
          </div>
        )}

        <nav className="space-y-3">
          {groups.map(([group, groupItems]) => (
            <div key={group || "_"} className="space-y-0.5">
              {group && (
                <div className="px-2.5 pb-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  {group}
                </div>
              )}
              {groupItems.map((item) => {
                const active = item.slug === currentSlug;
                return (
                  <NavLink
                    key={item.slug}
                    to={`${basePath}/${item.slug}`}
                    className={`block w-full text-left px-2.5 py-1.5 rounded-md text-xs transition-colors ${
                      active
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-foreground hover:bg-muted"
                    }`}
                  >
                    <div className="truncate">{item.label}</div>
                    {item.meta && (
                      <div
                        className={`text-[10px] truncate ${
                          active ? "text-primary/70" : "text-muted-foreground"
                        }`}
                      >
                        {item.meta}
                      </div>
                    )}
                  </NavLink>
                );
              })}
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="text-xs text-muted-foreground px-2.5 py-2">
              Нічого не знайдено
            </div>
          )}
        </nav>
      </div>
    </aside>
  );
};
