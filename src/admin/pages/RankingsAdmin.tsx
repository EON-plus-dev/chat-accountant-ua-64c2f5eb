import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { type ColumnDef } from "@tanstack/react-table";
import { RANKINGS, RANKING_CATEGORIES, RankingItem } from "@/portal/data/rankings";
import { checkboxReview, vchasnoReview, medokTaxReview, monobankBizReview, privatBizReview, pumbBizReview, basReview, fintodoAccountingReview, excelReview, medokReportReview, vchasnoReportReview, sotaReview } from "@/portal/data/ranking-reviews";
import ContentTable from "@/admin/components/ContentTable";
import ContentFilters from "@/admin/components/ContentFilters";
import ContentEditorDrawer from "@/admin/components/ContentEditorDrawer";
import ContentCreatorDialog from "@/admin/components/ContentCreatorDialog";
import { rankingSchema } from "@/admin/schemas/contentSchemas";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star } from "lucide-react";

const categoryName = (catId: string) => RANKING_CATEGORIES.find((c) => c.slug === catId)?.name ?? catId;

const columns: ColumnDef<RankingItem, any>[] = [
  {
    accessorKey: "name",
    header: "Продукт",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded flex items-center justify-center text-[10px] font-bold text-primary-foreground" style={{ backgroundColor: row.original.initialsColor }}>
          {row.original.initials}
        </div>
        <div>
          <span className="font-medium">{row.original.name}</span>
          {row.original.badge && <Badge variant="outline" className="ml-2 text-[9px]">{row.original.badge}</Badge>}
        </div>
      </div>
    ),
  },
  { accessorKey: "category", header: "Категорія", cell: ({ row }) => categoryName(row.original.category) },
  {
    accessorKey: "score",
    header: "Оцінка",
    cell: ({ row }) => (
      <div className="flex items-center gap-1">
        <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
        <span className="font-medium">{row.original.score}/100</span>
      </div>
    ),
  },
  { accessorKey: "rank", header: "#" },
  {
    id: "fullReview",
    header: "Verdict",
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground line-clamp-1 max-w-[200px]">{row.original.fullReview?.verdict?.slice(0, 60)}...</span>
    ),
  },
];

const allReviews = [
  { name: "Checkbox", review: checkboxReview },
  { name: "Вчасно", review: vchasnoReview },
  { name: "M.E.Doc Податки", review: medokTaxReview },
  { name: "Monobank Бізнес", review: monobankBizReview },
  { name: "Приватбанк Бізнес", review: privatBizReview },
  { name: "ПУМБ Бізнес", review: pumbBizReview },
  { name: "BAS", review: basReview },
  { name: "FINTODO Бухгалтерія", review: fintodoAccountingReview },
  { name: "Excel", review: excelReview },
  { name: "M.E.Doc Звітність", review: medokReportReview },
  { name: "Вчасно Звітність", review: vchasnoReportReview },
  { name: "Sota", review: sotaReview },
];

type ReviewRow = typeof allReviews[0];

const reviewColumns: ColumnDef<ReviewRow, any>[] = [
  { accessorKey: "name", header: "Сервіс", cell: ({ row }) => <span className="font-medium text-foreground">{row.original.name}</span> },
  { id: "testedDate", header: "Тестовано", cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.original.review.testedDate}</span> },
  { id: "testedHours", header: "Годин", cell: ({ row }) => <span className="font-mono text-sm">{row.original.review.testedHours}г</span> },
  { id: "oneLiner", header: "Одним рядком", cell: ({ row }) => <span className="text-xs text-muted-foreground line-clamp-1 max-w-[300px]">{row.original.review.oneLiner}</span> },
];

export default function RankingsAdmin() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [selectedItem, setSelectedItem] = useState<RankingItem | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [tab, setTab] = useState("rankings");

  const filtered = RANKINGS.filter((r) => {
    if (search && !r.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (filters.category && filters.category !== "all" && r.category !== filters.category) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Рейтинги та огляди</h1>
          <p className="text-muted-foreground">{RANKINGS.length} продуктів · {allReviews.length} оглядів</p>
        </div>
        <ContentCreatorDialog schema={rankingSchema} title="Новий продукт" />
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="rankings">Рейтинги ({RANKINGS.length})</TabsTrigger>
          <TabsTrigger value="reviews">Огляди сервісів ({allReviews.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="rankings">
          <ContentFilters
            searchValue={search}
            onSearchChange={setSearch}
            searchPlaceholder="Пошук за назвою..."
            filters={[
              { key: "category", label: "Категорія", options: RANKING_CATEGORIES.map((c) => ({ value: c.slug, label: c.name })) },
            ]}
            filterValues={filters}
            onFilterChange={(k, v) => setFilters((p) => ({ ...p, [k]: v }))}
            onClearAll={() => { setSearch(""); setFilters({}); }}
          />
          <ContentTable columns={columns} data={filtered} onRowClick={(row) => navigate(`/admin/content/ranking/${row.slug}`)} />
        </TabsContent>
        <TabsContent value="reviews">
          <ContentTable columns={reviewColumns} data={allReviews} />
        </TabsContent>
      </Tabs>

      <ContentEditorDrawer open={drawerOpen} onOpenChange={setDrawerOpen} data={selectedItem} schema={rankingSchema} title="Рейтинг" />
    </div>
  );
}
