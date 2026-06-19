import { useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { SALARY_BENCHMARKS, LABOR_REGIONS, SalaryBenchmark } from "@/portal/data/laborMarket";
import ContentTable from "@/admin/components/ContentTable";
import ContentFilters from "@/admin/components/ContentFilters";
import ContentEditorDrawer from "@/admin/components/ContentEditorDrawer";
import ContentCreatorDialog from "@/admin/components/ContentCreatorDialog";
import { salarySchema } from "@/admin/schemas/contentSchemas";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

const trendIcon = (t: string) => t === "up" ? <TrendingUp className="h-3.5 w-3.5 text-green-600" /> : t === "down" ? <TrendingDown className="h-3.5 w-3.5 text-destructive" /> : <Minus className="h-3.5 w-3.5 text-muted-foreground" />;
const levelLabel: Record<string, string> = { junior: "Junior", middle: "Middle", senior: "Senior" };

const columns: ColumnDef<SalaryBenchmark, any>[] = [
  { accessorKey: "position", header: "Посада" },
  { accessorKey: "region", header: "Регіон" },
  {
    accessorKey: "experienceLevel",
    header: "Рівень",
    cell: ({ row }) => <Badge variant="outline" className="text-[10px]">{levelLabel[row.original.experienceLevel]}</Badge>,
  },
  {
    accessorKey: "salaryMedian",
    header: "Медіана",
    cell: ({ row }) => <span className="font-medium">{row.original.salaryMedian.toLocaleString()} {row.original.currency}</span>,
  },
  {
    id: "trend",
    header: "Тренд",
    cell: ({ row }) => <div className="flex items-center gap-1">{trendIcon(row.original.trend)}<span className="text-xs">{row.original.trendPercent}%</span></div>,
  },
  {
    accessorKey: "demandLevel",
    header: "Попит",
    cell: ({ row }) => {
      const labels: Record<string, string> = { high: "Високий", medium: "Середній", low: "Низький" };
      return <Badge variant={row.original.demandLevel === "high" ? "default" : "secondary"} className="text-[10px]">{labels[row.original.demandLevel] || row.original.demandLevel}</Badge>;
    },
  },
];

export default function LaborMarketAdmin() {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [selectedItem, setSelectedItem] = useState<SalaryBenchmark | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const filtered = SALARY_BENCHMARKS.filter((s) => {
    if (search && !s.position.toLowerCase().includes(search.toLowerCase())) return false;
    if (filters.region && filters.region !== "all" && s.region !== filters.region) return false;
    if (filters.level && filters.level !== "all" && s.experienceLevel !== filters.level) return false;
    if (filters.demand && filters.demand !== "all" && s.demandLevel !== filters.demand) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Ринок праці</h1>
          <p className="text-muted-foreground">{SALARY_BENCHMARKS.length} benchmarks</p>
        </div>
        <ContentCreatorDialog schema={salarySchema} title="Новий benchmark" />
      </div>
      <ContentFilters
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Пошук за посадою..."
        filters={[
          { key: "region", label: "Регіон", options: LABOR_REGIONS.map((r) => ({ value: r, label: r })) },
          { key: "level", label: "Рівень", options: [{ value: "junior", label: "Junior" }, { value: "middle", label: "Middle" }, { value: "senior", label: "Senior" }] },
          { key: "demand", label: "Попит", options: [{ value: "high", label: "Високий" }, { value: "medium", label: "Середній" }, { value: "low", label: "Низький" }] },
        ]}
        filterValues={filters}
        onFilterChange={(k, v) => setFilters((p) => ({ ...p, [k]: v }))}
        onClearAll={() => { setSearch(""); setFilters({}); }}
      />
      <ContentTable columns={columns} data={filtered} onRowClick={(row) => { setSelectedItem(row); setDrawerOpen(true); }} />
      <ContentEditorDrawer open={drawerOpen} onOpenChange={setDrawerOpen} data={selectedItem} schema={salarySchema} title="Зарплата" />
    </div>
  );
}
