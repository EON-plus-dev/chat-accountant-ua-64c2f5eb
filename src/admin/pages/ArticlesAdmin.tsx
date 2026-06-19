import { useState, useMemo, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { type ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ARTICLES, type Article } from "@/portal/data/articles";
import { AUTHORS } from "@/portal/data/authors";
import ContentTable from "@/admin/components/ContentTable";
import ContentFilters, { type FilterConfig } from "@/admin/components/ContentFilters";
import { Eye, Star, Crown, Sparkles } from "lucide-react";

const TYPE_LABELS: Record<string, string> = {
  news: "Новина", guide: "Гайд", analysis: "Аналітика", dps: "ДПС",
  change: "Зміна", podcast: "Подкаст", video: "Відео", review: "Огляд",
};
const TYPE_PAGE_TITLES: Record<string, string> = {
  news: "📰 Новини", guide: "📚 Гайди", podcast: "🎙 Подкасти", video: "📹 Відео",
  review: "📋 Огляди", analysis: "🔬 Аналітика", dps: "ДПС", change: "Зміни",
};
const AUDIENCE_LABELS: Record<string, string> = { business: "Бізнес", personal: "Особисті", both: "Всі" };
const TYPE_COLORS: Record<string, string> = {
  guide: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  news: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
  analysis: "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300",
  change: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  dps: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
  podcast: "bg-pink-100 text-pink-800 dark:bg-pink-900/40 dark:text-pink-300",
  video: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300",
  review: "bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300",
};

const titleColumn: ColumnDef<Article, any> = {
  accessorKey: "title", header: "Назва",
  cell: ({ row }) => (
    <div className="max-w-[320px]">
      <div className="flex items-center gap-1.5">
        {row.original.isFeatured && <Star className="h-3.5 w-3.5 text-amber-500 shrink-0" />}
        {row.original.isPremium && <Crown className="h-3.5 w-3.5 text-primary shrink-0" />}
        <span className="font-medium text-foreground truncate">{row.original.title}</span>
      </div>
      <p className="text-xs text-muted-foreground truncate mt-0.5">{row.original.slug}</p>
    </div>
  ),
};

const baseColumns: ColumnDef<Article, any>[] = [
  { accessorKey: "type", header: "Тип", cell: ({ getValue }) => <Badge variant="secondary" className={`text-[11px] ${TYPE_COLORS[getValue() as string] || ""}`}>{TYPE_LABELS[getValue() as string] || getValue()}</Badge>, filterFn: "equals" },
  { accessorKey: "audience", header: "Аудиторія", cell: ({ getValue }) => <span className="text-sm">{AUDIENCE_LABELS[getValue() as string] || getValue()}</span>, filterFn: "equals" },
  { accessorKey: "authorId", header: "Автор", cell: ({ getValue }) => { const a = AUTHORS.find(a => a.id === getValue()); return <span className="text-sm">{a?.name ?? getValue()}</span>; }},
  { accessorKey: "categoryLabel", header: "Категорія" },
  { accessorKey: "views", header: "Перегляди", cell: ({ getValue }) => <span className="inline-flex items-center gap-1 text-sm tabular-nums"><Eye className="h-3.5 w-3.5 text-muted-foreground" />{(getValue() as number).toLocaleString("uk-UA")}</span> },
];

const readingCol: ColumnDef<Article, any> = { accessorKey: "readingMinutes", header: "Хв", cell: ({ getValue }) => <span className="text-sm tabular-nums">{getValue()} хв</span> };
const durationCol: ColumnDef<Article, any> = { accessorKey: "mediaDuration", header: "Тривалість", cell: ({ getValue }) => <span className="text-sm tabular-nums">{getValue() || "—"}</span> };
const episodeCol: ColumnDef<Article, any> = { accessorKey: "episodeNumber", header: "Епізод", cell: ({ getValue }) => <span className="text-sm font-mono">{getValue() ? `#${getValue()}` : "—"}</span> };
const dateCol: ColumnDef<Article, any> = { accessorKey: "publishedAt", header: "Дата", cell: ({ getValue }) => <span className="text-sm tabular-nums text-muted-foreground">{getValue()}</span> };

function getColumns(typeFromUrl: string | null): ColumnDef<Article, any>[] {
  if (typeFromUrl === "podcast") return [titleColumn, ...baseColumns, episodeCol, durationCol, dateCol];
  if (typeFromUrl === "video") return [titleColumn, ...baseColumns, durationCol, dateCol];
  return [titleColumn, ...baseColumns, readingCol, dateCol];
}

const categoryOptions = Array.from(new Set(ARTICLES.map(a => a.categoryLabel).filter(Boolean))).sort().map(c => ({ value: c, label: c }));

const filters: FilterConfig[] = [
  { key: "type", label: "Тип", options: Object.entries(TYPE_LABELS).map(([value, label]) => ({ value, label })) },
  { key: "audience", label: "Аудиторія", options: Object.entries(AUDIENCE_LABELS).map(([value, label]) => ({ value, label })) },
  { key: "categoryLabel", label: "Категорія", options: categoryOptions },
  { key: "isFeatured", label: "Featured", options: [{ value: "yes", label: "Так" }, { value: "no", label: "Ні" }] },
  { key: "isPremium", label: "Premium", options: [{ value: "yes", label: "Так" }, { value: "no", label: "Ні" }] },
];

function matchesSearch(a: Article, query: string): boolean {
  if (!query) return true;
  const q = query.toLowerCase();
  const fields = [
    a.title, a.slug, a.excerpt, a.categoryLabel, a.tldr,
    ...(a.tags || []),
    ...((a as any).guests || []),
    (a as any).content,
  ];
  return fields.some(f => f && String(f).toLowerCase().includes(q));
}

export default function ArticlesAdmin() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const typeFromUrl = searchParams.get("type");
  const [search, setSearch] = useState("");
  const [filterValues, setFilterValues] = useState<Record<string, string>>(() =>
    typeFromUrl ? { type: typeFromUrl } : {}
  );

  useEffect(() => {
    if (typeFromUrl) {
      setFilterValues(prev => ({ ...prev, type: typeFromUrl }));
    } else {
      setFilterValues(prev => { const { type, ...rest } = prev; return rest; });
    }
  }, [typeFromUrl]);

  const filteredData = useMemo(() => {
    return ARTICLES.filter((a) => {
      if (filterValues.type && filterValues.type !== "all" && a.type !== filterValues.type) return false;
      if (filterValues.audience && filterValues.audience !== "all" && a.audience !== filterValues.audience) return false;
      if (filterValues.categoryLabel && filterValues.categoryLabel !== "all" && a.categoryLabel !== filterValues.categoryLabel) return false;
      if (filterValues.isFeatured && filterValues.isFeatured !== "all") {
        const want = filterValues.isFeatured === "yes";
        if (!!a.isFeatured !== want) return false;
      }
      if (filterValues.isPremium && filterValues.isPremium !== "all") {
        const want = filterValues.isPremium === "yes";
        if (!!a.isPremium !== want) return false;
      }
      if (!matchesSearch(a, search)) return false;
      return true;
    });
  }, [filterValues, search]);

  const pageTitle = typeFromUrl ? (TYPE_PAGE_TITLES[typeFromUrl] || "Всі публікації") : "Всі публікації";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{pageTitle}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {filteredData.length} записів{!typeFromUrl && <> · {ARTICLES.filter(a => a.isFeatured).length} featured · {ARTICLES.filter(a => a.isPremium).length} premium</>}
          </p>
        </div>
        <Button size="sm" className="gap-1.5" asChild>
          <Link to="/admin/autocontent?tab=plan&new=1">
            <Sparkles className="h-4 w-4" />
            Додати публікацію (AI)
          </Link>
        </Button>
      </div>

      <ContentFilters
        searchValue={search} onSearchChange={setSearch} searchPlaceholder="Шукати за назвою, змістом, тегами..."
        filters={filters} filterValues={filterValues}
        onFilterChange={(key, value) => setFilterValues(prev => ({ ...prev, [key]: value }))}
        onClearAll={() => { setSearch(""); setFilterValues({}); }}
      />

      <ContentTable data={filteredData} columns={getColumns(typeFromUrl)} pageSize={15}
        onRowClick={(row) => navigate(`/admin/content/article/${row.slug}`)}
      />
    </div>
  );
}
