import { X } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CourseAudience } from "@/portal/data/learn";
import { LEARN_CATEGORIES } from "@/portal/data/learn";
import {
  DEFAULT_FILTERS,
  type LearnFilters,
  type LevelFilter,
  type FormatFilter,
  type PriceFilter,
  type DurationFilter,
  type SortKey,
} from "./LearnToolbar";

const AUDIENCE_ORDER: CourseAudience[] = ["fop", "business", "personal", "it", "accountants"];

const SHORT_AUDIENCE_LABEL: Record<CourseAudience, string> = {
  fop: "ФОП",
  business: "Бізнесу",
  personal: "Фізособам",
  it: "IT-фріланс",
  accountants: "Бухгалтерам",
};

const LEVELS: { v: LevelFilter; l: string }[] = [
  { v: "all", l: "Будь-який" },
  { v: "beginner", l: "Початківець" },
  { v: "intermediate", l: "Середній" },
  { v: "advanced", l: "Просунутий" },
];
const FORMATS: { v: FormatFilter; l: string }[] = [
  { v: "all", l: "Усі" },
  { v: "interactive", l: "Інтерактив" },
  { v: "video", l: "Відео" },
  { v: "text", l: "Текст" },
  { v: "webinar", l: "Вебінар" },
];
const PRICES: { v: PriceFilter; l: string }[] = [
  { v: "all", l: "Усі" },
  { v: "free", l: "Безкоштовно" },
  { v: "paid", l: "Платні" },
];
const DURATIONS: { v: DurationFilter; l: string }[] = [
  { v: "all", l: "Будь-яка" },
  { v: "short", l: "До 1 год" },
  { v: "medium", l: "1–3 год" },
  { v: "long", l: "3+ год" },
];

const SORTS: { v: SortKey; l: string }[] = [
  { v: "relevance", l: "Релевантні" },
  { v: "popular", l: "Найпопулярніші" },
  { v: "new", l: "Новинки" },
  { v: "shortest", l: "Найкоротші" },
  { v: "price-asc", l: "Спершу безкоштовні" },
];

export const QUICK_PICKS: { label: string; patch: Partial<LearnFilters> }[] = [
  { label: "🆓 Безкоштовні", patch: { price: "free" } },
  { label: "🎓 З сертифікатом", patch: { certificateOnly: true } },
  { label: "⏱ До 1 години", patch: { duration: "short" } },
  { label: "🆕 Новинки", patch: { newOnly: true } },
  { label: "🟢 Для початківців", patch: { level: "beginner" } },
  { label: "📊 Для бухгалтерів", patch: { audiences: ["accountants"] } },
  { label: "👤 Для фізосіб", patch: { audiences: ["personal"] } },
  { label: "🏪 Для ФОП", patch: { audiences: ["fop"] } },
];

interface Props {
  filters: LearnFilters;
  onChange: (next: LearnFilters) => void;
  resultsCount: number;
  audienceCounts: Record<CourseAudience, number>;
  /** Show sort selector inside panel (mobile sheet). Desktop hides it (sort lives in toolbar). */
  showSort?: boolean;
}

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
    {children}
  </h3>
);

const RowButton = ({
  active,
  onClick,
  children,
  count,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  count?: number;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs transition-colors text-left ${
      active
        ? "bg-primary/10 text-primary font-medium"
        : "text-foreground hover:bg-muted"
    }`}
  >
    <span className="truncate">{children}</span>
    {count !== undefined && (
      <span
        className={`font-mono text-[10px] shrink-0 ml-2 ${
          active ? "text-primary/70" : "text-muted-foreground"
        }`}
      >
        {count}
      </span>
    )}
  </button>
);

export const LearnFilterPanel = ({
  filters,
  onChange,
  resultsCount,
  audienceCounts,
  showSort = false,
}: Props) => {
  const set = <K extends keyof LearnFilters>(k: K, v: LearnFilters[K]) =>
    onChange({ ...filters, [k]: v });

  const toggleAudience = (a: CourseAudience) => {
    const has = filters.audiences.includes(a);
    onChange({
      ...filters,
      audiences: has ? filters.audiences.filter((x) => x !== a) : [...filters.audiences, a],
    });
  };

  const advancedCount =
    (filters.level !== "all" ? 1 : 0) +
    (filters.format !== "all" ? 1 : 0) +
    (filters.price !== "all" ? 1 : 0) +
    (filters.duration !== "all" ? 1 : 0) +
    (filters.certificateOnly ? 1 : 0) +
    (filters.newOnly ? 1 : 0);

  const isDirty =
    advancedCount > 0 ||
    filters.audiences.length > 0 ||
    filters.query !== "" ||
    filters.sort !== "relevance";

  return (
    <div className="space-y-5">
      {isDirty && (
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-full justify-start px-2 text-xs text-muted-foreground hover:text-foreground gap-1.5"
          onClick={() => onChange(DEFAULT_FILTERS)}
        >
          <X className="h-3 w-3" />
          Скинути фільтри
        </Button>
      )}

      {showSort && (
        <div>
          <SectionTitle>Сортування</SectionTitle>
          <Select value={filters.sort} onValueChange={(v) => set("sort", v as SortKey)}>
            <SelectTrigger className="h-9 text-xs">
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
        </div>
      )}

      <div>
        <SectionTitle>Аудиторія</SectionTitle>
        <div className="space-y-0.5">
          <RowButton
            active={filters.audiences.length === 0}
            onClick={() => set("audiences", [])}
          >
            Усі аудиторії
          </RowButton>
          {AUDIENCE_ORDER.map((a) => (
            <RowButton
              key={a}
              active={filters.audiences.includes(a)}
              onClick={() => toggleAudience(a)}
              count={audienceCounts[a]}
            >
              <span className="mr-1">{LEARN_CATEGORIES[a].emoji}</span>
              {SHORT_AUDIENCE_LABEL[a]}
            </RowButton>
          ))}
        </div>
      </div>

      <div>
        <SectionTitle>Швидкий вибір</SectionTitle>
        <div className="flex flex-wrap gap-1.5">
          {QUICK_PICKS.map((qp) => (
            <button
              key={qp.label}
              type="button"
              onClick={() => onChange({ ...filters, ...qp.patch })}
              className="px-2.5 py-1 text-[11px] rounded-full border border-dashed border-border text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
            >
              {qp.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <SectionTitle>Рівень</SectionTitle>
        <div className="space-y-0.5">
          {LEVELS.map((o) => (
            <RowButton
              key={o.v}
              active={filters.level === o.v}
              onClick={() => set("level", o.v)}
            >
              {o.l}
            </RowButton>
          ))}
        </div>
      </div>

      <div>
        <SectionTitle>Формат</SectionTitle>
        <div className="space-y-0.5">
          {FORMATS.map((o) => (
            <RowButton
              key={o.v}
              active={filters.format === o.v}
              onClick={() => set("format", o.v)}
            >
              {o.l}
            </RowButton>
          ))}
        </div>
      </div>

      <div>
        <SectionTitle>Ціна</SectionTitle>
        <div className="space-y-0.5">
          {PRICES.map((o) => (
            <RowButton
              key={o.v}
              active={filters.price === o.v}
              onClick={() => set("price", o.v)}
            >
              {o.l}
            </RowButton>
          ))}
        </div>
      </div>

      <div>
        <SectionTitle>Тривалість</SectionTitle>
        <div className="space-y-0.5">
          {DURATIONS.map((o) => (
            <RowButton
              key={o.v}
              active={filters.duration === o.v}
              onClick={() => set("duration", o.v)}
            >
              {o.l}
            </RowButton>
          ))}
        </div>
      </div>

      <div className="pt-3 border-t border-border/60 space-y-2.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="cert-only" className="text-xs cursor-pointer">
            🎓 Тільки з сертифікатом
          </Label>
          <Switch
            id="cert-only"
            checked={filters.certificateOnly}
            onCheckedChange={(v) => set("certificateOnly", v)}
          />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="new-only" className="text-xs cursor-pointer">
            🆕 Тільки новинки
          </Label>
          <Switch
            id="new-only"
            checked={filters.newOnly}
            onCheckedChange={(v) => set("newOnly", v)}
          />
        </div>
      </div>

      <div className="pt-3 border-t border-border/60 text-xs text-muted-foreground">
        Знайдено:{" "}
        <span className="font-semibold text-foreground">{resultsCount}</span>
      </div>
    </div>
  );
};
