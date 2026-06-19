import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { PENALTIES, PENALTY_CATEGORIES } from "@/portal/data/penalties";
import ContentTable from "@/admin/components/ContentTable";
import ContentFilters from "@/admin/components/ContentFilters";
import { Badge } from "@/components/ui/badge";
import { type ColumnDef } from "@tanstack/react-table";
import type { PenaltyEntry } from "@/portal/data/penalties";
import ContentCreatorDialog from "@/admin/components/ContentCreatorDialog";
import { penaltySchema } from "@/admin/schemas/contentSchemas";

const sevColor: Record<string, string> = {
  critical: "bg-red-100 text-red-800",
  high: "bg-orange-100 text-orange-800",
  medium: "bg-amber-100 text-amber-800",
  low: "bg-muted text-muted-foreground",
};

const columns: ColumnDef<PenaltyEntry, any>[] = [
  { accessorKey: "title", header: "Назва", cell: ({ row }) => <span className="font-medium max-w-[300px] truncate block">{row.original.title}</span> },
  { accessorKey: "category", header: "Категорія", cell: ({ row }) => <Badge variant="outline">{row.original.category}</Badge> },
  { accessorKey: "severity", header: "Критичність", cell: ({ row }) => {
    const labels: Record<string, string> = { critical: "Критичний", high: "Високий", medium: "Середній", low: "Низький" };
    return <Badge className={sevColor[row.original.severity]}>{labels[row.original.severity] || row.original.severity}</Badge>;
  }},
  { accessorKey: "penaltyAmount", header: "Штраф", cell: ({ row }) => <span className="text-sm">{row.original.penaltyAmount}</span> },
  { accessorKey: "legalBasis", header: "Підстава" },
];

export default function PenaltiesAdmin() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({ category: "all", severity: "all" });

  const filtered = useMemo(() => {
    let items = [...PENALTIES];
    if (filters.category !== "all") items = items.filter((p) => p.category === filters.category);
    if (filters.severity !== "all") items = items.filter((p) => p.severity === filters.severity);
    return items;
  }, [filters]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Штрафи та санкції</h1>
          <p className="text-sm text-muted-foreground">{PENALTIES.length} записів</p>
        </div>
        <ContentCreatorDialog schema={penaltySchema} title="Додати штраф" />
      </div>

      <ContentFilters
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Пошук штрафів..."
        filters={[
          { key: "category", label: "Категорія", options: PENALTY_CATEGORIES.map((c) => ({ value: c, label: c })) },
          { key: "severity", label: "Критичність", options: [
            { value: "critical", label: "Критичний" },
            { value: "high", label: "Високий" },
            { value: "medium", label: "Середній" },
            { value: "low", label: "Низький" },
          ]},
        ]}
        filterValues={filters}
        onFilterChange={(k, v) => setFilters((p) => ({ ...p, [k]: v }))}
        onClearAll={() => { setSearch(""); setFilters({ category: "all", severity: "all" }); }}
      />

      <ContentTable data={filtered} columns={columns} globalFilter={search} onRowClick={(row) => navigate(`/admin/content/penalty/${row.id}`)} />
    </div>
  );
}
