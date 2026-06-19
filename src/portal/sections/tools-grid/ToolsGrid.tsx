import { useState, useMemo } from "react";
import { Search, ArrowUpDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToolCard } from "@/portal/components/ToolCard";
import { TOOLS } from "@/portal/data/tools";

const SORT_OPTIONS = [
  { value: "popular", label: "За популярністю" },
  { value: "new", label: "Нові" },
  { value: "name", label: "За назвою" },
] as const;

const CATEGORIES = [
  { value: "all", label: "Всі" },
  { value: "planning", label: "Особисті фінанси" },
  { value: "finance", label: "Бізнес-планування" },
  { value: "calculator", label: "Калькулятори" },
  { value: "management", label: "Управління" },
  { value: "hr", label: "HR" },
  { value: "documents", label: "Документи" },
  { value: "calendar", label: "Календар" },
  { value: "constructor", label: "Конструктори" },
  { value: "reference", label: "Довідники" },
] as const;

export const ToolsGrid = () => {
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"popular" | "new" | "name">("popular");

  const counts = useMemo(() => {
    const map: Record<string, number> = {};
    TOOLS.forEach((t) => {
      map[t.category] = (map[t.category] || 0) + 1;
    });
    return map;
  }, []);

  const visibleCategories = useMemo(
    () => CATEGORIES.filter((c) => c.value === "all" || (counts[c.value] ?? 0) > 0),
    [counts],
  );

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    const items = TOOLS.filter((t) => {
      const matchCat = category === "all" || t.category === category;
      const matchSearch =
        !q || t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
    return [...items].sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name, "uk");
      if (sortBy === "new") return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
      return b.usageCount - a.usageCount;
    });
  }, [category, search, sortBy]);

  const showCounter = search.trim() !== "" || category !== "all";

  const showPopularHint = sortBy === "popular" && category === "all" && search.trim() === "";

  return (
    <section className="mb-10">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-foreground">Всі інструменти</h2>
        {showPopularHint && (
          <p className="text-xs text-muted-foreground mt-1">
            Відсортовано за популярністю — найбільш використовувані вгорі
          </p>
        )}
      </div>

      {/* Search + Pills */}
      <div className="flex flex-col gap-3 mb-4">
        <div className="flex gap-2 items-center">
          <div className="relative flex-1 sm:flex-none sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Пошук інструментів..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
            <SelectTrigger className="w-auto h-9 gap-1.5 text-xs shrink-0">
              <ArrowUpDown className="h-3.5 w-3.5" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value} className="text-xs">
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide snap-x pb-1">
          {visibleCategories.map((c) => {
            const isActive = category === c.value;
            return (
              <button
                key={c.value}
                onClick={() => setCategory(c.value)}
                className={`shrink-0 snap-start rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {c.label}
                {c.value !== "all" && counts[c.value] ? (
                  <span className="ml-1 opacity-70">{counts[c.value]}</span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      {/* Counter */}
      {showCounter && (
        <p className="text-xs text-muted-foreground mb-3">
          Знайдено {filtered.length} з {TOOLS.length} інструментів
        </p>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {filtered.map((tool) => (
          <ToolCard key={tool.id} tool={tool} />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-muted-foreground py-12">Нічого не знайдено</p>
      )}
    </section>
  );
};
