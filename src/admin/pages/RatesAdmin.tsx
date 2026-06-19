import { useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { RATE_TABLES, RATE_CATEGORIES, type RateTable } from "@/portal/data/rates";
import ContentTable from "@/admin/components/ContentTable";
import ContentFilters from "@/admin/components/ContentFilters";
import ContentEditorDrawer from "@/admin/components/ContentEditorDrawer";
import ContentCreatorDialog from "@/admin/components/ContentCreatorDialog";
import { rateTableSchema } from "@/admin/schemas/contentSchemas";
import { Badge } from "@/components/ui/badge";

const catLabel = Object.fromEntries(RATE_CATEGORIES.map((c) => [c.id, c.label]));

const columns: ColumnDef<RateTable, any>[] = [
  { accessorKey: "name", header: "Назва", cell: ({ row }) => <span className="font-medium max-w-[300px] truncate block">{row.original.name}</span> },
  { accessorKey: "category", header: "Категорія", cell: ({ row }) => <Badge variant="outline">{catLabel[row.original.category] || row.original.category}</Badge> },
  { accessorKey: "rows", header: "Записів", cell: ({ row }) => <span>{row.original.rows.length}</span> },
];

export default function RatesAdmin() {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [selectedItem, setSelectedItem] = useState<RateTable | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const filtered = RATE_TABLES.filter((r) => {
    if (search && !r.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (filters.category && filters.category !== "all" && r.category !== filters.category) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Ставки та показники</h1>
          <p className="text-sm text-muted-foreground">{RATE_TABLES.length} таблиць</p>
        </div>
        <ContentCreatorDialog schema={rateTableSchema} title="Додати таблицю" />
      </div>
      <ContentFilters
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Пошук ставок..."
        filters={[
          { key: "category", label: "Категорія", options: RATE_CATEGORIES.map((c) => ({ value: c.id, label: c.label })) },
        ]}
        filterValues={filters}
        onFilterChange={(k, v) => setFilters((p) => ({ ...p, [k]: v }))}
        onClearAll={() => { setSearch(""); setFilters({}); }}
      />
      <ContentTable data={filtered} columns={columns} globalFilter={search} onRowClick={(row) => { setSelectedItem(row); setDrawerOpen(true); }} />
      <ContentEditorDrawer open={drawerOpen} onOpenChange={setDrawerOpen} data={selectedItem} schema={rateTableSchema} title="Таблиця ставок" />
    </div>
  );
}
