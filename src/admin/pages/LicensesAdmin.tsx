import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { LICENSES, LICENSE_CATEGORIES } from "@/portal/data/licenses";
import ContentTable from "@/admin/components/ContentTable";
import ContentFilters from "@/admin/components/ContentFilters";
import { Badge } from "@/components/ui/badge";
import { type ColumnDef } from "@tanstack/react-table";
import type { LicenseEntry } from "@/portal/data/licenses";
import ContentCreatorDialog from "@/admin/components/ContentCreatorDialog";
import { licenseSchema } from "@/admin/schemas/contentSchemas";

const columns: ColumnDef<LicenseEntry, any>[] = [
  { accessorKey: "name", header: "Назва", cell: ({ row }) => <span className="font-medium max-w-[300px] truncate block">{row.original.name}</span> },
  { accessorKey: "category", header: "Категорія", cell: ({ row }) => <Badge variant="outline">{row.original.category}</Badge> },
  { accessorKey: "issuingAuthority", header: "Орган видачі", cell: ({ row }) => <span className="text-sm max-w-[200px] truncate block">{row.original.issuingAuthority}</span> },
  { accessorKey: "cost", header: "Вартість", cell: ({ row }) => <span className="text-sm">{row.original.cost}</span> },
  { accessorKey: "validity", header: "Термін дії" },
];

export default function LicensesAdmin() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({ category: "all", audience: "all" });

  const filtered = useMemo(() => {
    let items = [...LICENSES];
    if (filters.category !== "all") items = items.filter((l) => l.category === filters.category);
    if (filters.audience !== "all") items = items.filter((l) => l.audience === filters.audience);
    return items;
  }, [filters]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Ліцензії</h1>
          <p className="text-sm text-muted-foreground">{LICENSES.length} записів</p>
        </div>
        <ContentCreatorDialog schema={licenseSchema} title="Додати ліцензію" />
      </div>

      <ContentFilters
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Пошук ліцензій..."
        filters={[
          { key: "category", label: "Категорія", options: LICENSE_CATEGORIES.map((c) => ({ value: c, label: c })) },
          { key: "audience", label: "Аудиторія", options: [
            { value: "business", label: "Бізнес" },
            { value: "personal", label: "Фізособа" },
            { value: "both", label: "Обидва" },
          ]},
        ]}
        filterValues={filters}
        onFilterChange={(k, v) => setFilters((p) => ({ ...p, [k]: v }))}
        onClearAll={() => { setSearch(""); setFilters({ category: "all", audience: "all" }); }}
      />

      <ContentTable data={filtered} columns={columns} globalFilter={search} onRowClick={(row) => navigate(`/admin/content/license/${row.slug}`)} />
    </div>
  );
}
