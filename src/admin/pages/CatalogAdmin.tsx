import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { type ColumnDef } from "@tanstack/react-table";
import { CATALOG_CATEGORIES, type CatalogCategory } from "@/portal/data/catalog";
import { INSTITUTION_PROFILES } from "@/portal/data/institutionProfiles";
import ContentTable from "@/admin/components/ContentTable";
import ContentFilters from "@/admin/components/ContentFilters";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Building2, Layers, Star, MapPin } from "lucide-react";

interface CategoryRow {
  id: string;
  emoji: string;
  name: string;
  audience: string;
  typesCount: number;
  profilesCount: number;
  priority: number;
}

const audienceLabels: Record<string, string> = {
  business: "Бізнес",
  personal: "Фізособи",
  both: "Всі",
};

const columns: ColumnDef<CategoryRow, any>[] = [
  {
    accessorKey: "name",
    header: "Категорія",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <span className="text-lg">{row.original.emoji}</span>
        <span className="font-medium text-foreground">{row.original.name}</span>
      </div>
    ),
  },
  {
    accessorKey: "audience",
    header: "Аудиторія",
    cell: ({ getValue }) => <Badge variant="secondary">{audienceLabels[getValue<string>()] ?? getValue<string>()}</Badge>,
  },
  {
    accessorKey: "typesCount",
    header: "Типів послуг",
    cell: ({ getValue }) => <span className="font-mono text-sm">{getValue<number>()}</span>,
  },
  {
    accessorKey: "profilesCount",
    header: "Установ",
    cell: ({ getValue }) => (
      <Badge variant="outline" className="font-mono">{getValue<number>()}</Badge>
    ),
  },
  {
    accessorKey: "priority",
    header: "Пріоритет",
    cell: ({ getValue }) => <span className="text-sm text-muted-foreground">{getValue<number>()}</span>,
  },
];

function countProfilesForCategory(cat: CatalogCategory): number {
  const aliases = cat.profileTypeAliases ?? [];
  const typeSlugs = cat.types.map((t) => t.slug);
  const allSlugs = [...typeSlugs, ...aliases];
  return INSTITUTION_PROFILES.filter((p) =>
    p.types.some((t) => allSlugs.includes(t))
  ).length;
}

export default function CatalogAdmin() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const rows = useMemo<CategoryRow[]>(
    () =>
      CATALOG_CATEGORIES.map((cat) => ({
        id: cat.id,
        emoji: cat.emoji,
        name: cat.name,
        audience: cat.audience,
        typesCount: cat.types.length,
        profilesCount: countProfilesForCategory(cat),
        priority: cat.priority,
      })),
    []
  );

  const totalTypes = rows.reduce((s, r) => s + r.typesCount, 0);
  const totalProfiles = INSTITUTION_PROFILES.length;
  const avgRating = useMemo(() => {
    const withRating = INSTITUTION_PROFILES.filter((p) => p.editorial?.totalScore);
    if (!withRating.length) return "—";
    const avg = withRating.reduce((s, p) => s + (p.editorial?.totalScore ?? 0), 0) / withRating.length;
    return avg.toFixed(1);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Каталог установ</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Зведена інформація по категоріях та профілях установ
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10"><Layers className="h-5 w-5 text-primary" /></div>
            <div>
              <p className="text-2xl font-bold text-foreground">{CATALOG_CATEGORIES.length}</p>
              <p className="text-xs text-muted-foreground">Категорій</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10"><MapPin className="h-5 w-5 text-primary" /></div>
            <div>
              <p className="text-2xl font-bold text-foreground">{totalTypes}</p>
              <p className="text-xs text-muted-foreground">Типів послуг</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10"><Building2 className="h-5 w-5 text-primary" /></div>
            <div>
              <p className="text-2xl font-bold text-foreground">{totalProfiles}</p>
              <p className="text-xs text-muted-foreground">Профілів установ</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10"><Star className="h-5 w-5 text-primary" /></div>
            <div>
              <p className="text-2xl font-bold text-foreground">{avgRating}</p>
              <p className="text-xs text-muted-foreground">Середній рейтинг</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <ContentFilters
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Пошук категорій..."
        filters={[]}
        filterValues={{}}
        onFilterChange={() => {}}
        onClearAll={() => setSearch("")}
      />

      <ContentTable data={rows} columns={columns} globalFilter={search} pageSize={15} onRowClick={(row) => navigate(`/admin/institution-profiles?category=${row.id}`)} />
    </div>
  );
}
