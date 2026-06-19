import { useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { REGISTERS, type StateRegister } from "@/portal/data/registers";
import ContentTable from "@/admin/components/ContentTable";
import ContentFilters from "@/admin/components/ContentFilters";
import ContentEditorDrawer from "@/admin/components/ContentEditorDrawer";
import ContentCreatorDialog from "@/admin/components/ContentCreatorDialog";
import { registerSchema } from "@/admin/schemas/contentSchemas";
import { Badge } from "@/components/ui/badge";

const columns: ColumnDef<StateRegister, any>[] = [
  { accessorKey: "shortName", header: "Назва", cell: ({ row }) => <span className="font-medium">{row.original.shortName}</span> },
  { accessorKey: "audience", header: "Аудиторія", cell: ({ row }) => <Badge variant="outline">{row.original.audience === "business" ? "Бізнес" : row.original.audience === "personal" ? "Фізособа" : "Обидва"}</Badge> },
  { accessorKey: "isFree", header: "Доступ", cell: ({ row }) => row.original.isFree ? <Badge variant="secondary">Безкоштовно</Badge> : <Badge>Платний</Badge> },
  { accessorKey: "operator", header: "Оператор" },
];

export default function RegistersAdmin() {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [selectedItem, setSelectedItem] = useState<StateRegister | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const filtered = REGISTERS.filter((r) => {
    if (search && !r.shortName.toLowerCase().includes(search.toLowerCase()) && !r.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (filters.audience && filters.audience !== "all" && r.audience !== filters.audience) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Реєстри та перевірки</h1>
          <p className="text-sm text-muted-foreground">{REGISTERS.length} реєстрів</p>
        </div>
        <ContentCreatorDialog schema={registerSchema} title="Додати реєстр" />
      </div>
      <ContentFilters
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Пошук реєстрів..."
        filters={[
          { key: "audience", label: "Аудиторія", options: [{ value: "business", label: "Бізнес" }, { value: "personal", label: "Фізособа" }, { value: "both", label: "Обидва" }] },
        ]}
        filterValues={filters}
        onFilterChange={(k, v) => setFilters((p) => ({ ...p, [k]: v }))}
        onClearAll={() => { setSearch(""); setFilters({}); }}
      />
      <ContentTable data={filtered} columns={columns} globalFilter={search} onRowClick={(row) => { setSelectedItem(row); setDrawerOpen(true); }} />
      <ContentEditorDrawer open={drawerOpen} onOpenChange={setDrawerOpen} data={selectedItem} schema={registerSchema} title="Реєстр" />
    </div>
  );
}
