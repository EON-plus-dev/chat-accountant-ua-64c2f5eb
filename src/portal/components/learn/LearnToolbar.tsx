import { Search, X, SlidersHorizontal, ArrowUpDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import type { CourseAudience } from "@/portal/data/learn";

export type LevelFilter = "all" | "beginner" | "intermediate" | "advanced";
export type FormatFilter = "all" | "video" | "text" | "interactive" | "webinar";
export type PriceFilter = "all" | "free" | "paid";
export type DurationFilter = "all" | "short" | "medium" | "long";
export type SortKey = "relevance" | "popular" | "new" | "shortest" | "price-asc";

export interface LearnFilters {
  query: string;
  audiences: CourseAudience[];
  level: LevelFilter;
  format: FormatFilter;
  price: PriceFilter;
  duration: DurationFilter;
  certificateOnly: boolean;
  newOnly: boolean;
  sort: SortKey;
}

export const DEFAULT_FILTERS: LearnFilters = {
  query: "",
  audiences: [],
  level: "all",
  format: "all",
  price: "all",
  duration: "all",
  certificateOnly: false,
  newOnly: false,
  sort: "relevance",
};

const SORTS: { v: SortKey; l: string }[] = [
  { v: "relevance", l: "Релевантні" },
  { v: "popular", l: "Найпопулярніші" },
  { v: "new", l: "Новинки" },
  { v: "shortest", l: "Найкоротші" },
  { v: "price-asc", l: "Спершу безкоштовні" },
];

interface Props {
  filters: LearnFilters;
  onChange: (next: LearnFilters) => void;
  /** Mobile only: відкрити Sheet з фільтрами */
  onOpenFilters?: () => void;
  /** Загальний лічильник для бейджа на кнопці «Фільтри» */
  activeFilterCount?: number;
}

export const LearnToolbar = ({
  filters,
  onChange,
  onOpenFilters,
  activeFilterCount = 0,
}: Props) => {
  const set = <K extends keyof LearnFilters>(k: K, v: LearnFilters[K]) =>
    onChange({ ...filters, [k]: v });

  const isDirty =
    activeFilterCount > 0 || filters.query !== "" || filters.sort !== "relevance";

  return (
    <div className="sticky top-14 z-20 -mx-4 sm:mx-0 px-4 sm:px-0 py-2.5 bg-background/85 backdrop-blur border-b border-border/60">
      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={filters.query}
            onChange={(e) => set("query", e.target.value)}
            placeholder="Пошук курсів і вебінарів…"
            className="pl-9 h-9"
            aria-label="Пошук курсів і вебінарів"
          />
          {filters.query && (
            <button
              type="button"
              onClick={() => set("query", "")}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
              aria-label="Очистити пошук"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Sort — desktop only, mobile перенесено у Sheet */}
        <Select value={filters.sort} onValueChange={(v) => set("sort", v as SortKey)}>
          <SelectTrigger className="hidden lg:inline-flex h-9 w-[170px] text-xs shrink-0">
            <ArrowUpDown className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORTS.map((s) => (
              <SelectItem key={s.v} value={s.v} className="text-xs">
                {s.l}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Mobile: відкрити Sheet з фільтрами */}
        {onOpenFilters && (
          <Button
            variant="outline"
            size="sm"
            className="lg:hidden h-9 text-xs gap-1.5 shrink-0"
            onClick={onOpenFilters}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Фільтри
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-0.5 h-5 px-1.5 text-[10px]">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        )}

        {/* Desktop: швидке скидання */}
        {isDirty && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onChange(DEFAULT_FILTERS)}
            className="hidden lg:inline-flex text-xs shrink-0"
          >
            Скинути
          </Button>
        )}
      </div>
    </div>
  );
};

/** Парсимо тривалість виду "3 години", "45 хв", "1.5 години" → хвилини. */
export function parseDurationMinutes(input: string): number {
  const s = input.toLowerCase().replace(",", ".");
  const num = parseFloat(s);
  if (Number.isNaN(num)) return 0;
  if (s.includes("хв")) return Math.round(num);
  return Math.round(num * 60);
}

export function matchDuration(course: { duration: string }, f: DurationFilter): boolean {
  if (f === "all") return true;
  const m = parseDurationMinutes(course.duration);
  if (f === "short") return m > 0 && m < 60;
  if (f === "medium") return m >= 60 && m <= 180;
  return m > 180;
}
