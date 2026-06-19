import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { KVED_ENTRIES } from "@/portal/data/kved";
import ContentTable from "@/admin/components/ContentTable";
import ContentFilters from "@/admin/components/ContentFilters";
import { Badge } from "@/components/ui/badge";
import { type ColumnDef } from "@tanstack/react-table";
import type { KvedEntry } from "@/portal/data/kved";
import ContentCreatorDialog from "@/admin/components/ContentCreatorDialog";
import { kvedSchema } from "@/admin/schemas/contentSchemas";

const columns: ColumnDef<KvedEntry, any>[] = [
  { accessorKey: "code", header: "Код", cell: ({ row }) => <span className="font-mono font-medium">{row.original.code}</span> },
  { accessorKey: "name", header: "Назва" },
  { accessorKey: "section", header: "Секція", cell: ({ row }) => <span className="text-sm text-muted-foreground truncate max-w-[150px] block">{row.original.section}</span> },
  { accessorKey: "fopGroups", header: "Групи ФОП", cell: ({ row }) => row.original.fopGroups.map((g) => <Badge key={g} variant="outline" className="mr-1">{g}</Badge>) },
  { accessorKey: "requiresLicense", header: "Ліцензія", cell: ({ row }) => row.original.requiresLicense ? <Badge className="bg-amber-100 text-amber-800">Так</Badge> : <span className="text-muted-foreground text-sm">Ні</span> },
  { accessorKey: "isPopular", header: "Популярний", cell: ({ row }) => row.original.isPopular ? <Badge className="bg-blue-100 text-blue-800">⭐</Badge> : null },
];

export default function KvedAdmin() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({ license: "all", popular: "all" });

  const sections = useMemo(() => [...new Set(KVED_ENTRIES.map((k) => k.section))], []);

  const filtered = useMemo(() => {
    let items = [...KVED_ENTRIES];
    if (filters.license === "yes") items = items.filter((k) => k.requiresLicense);
    if (filters.license === "no") items = items.filter((k) => !k.requiresLicense);
    if (filters.popular === "yes") items = items.filter((k) => k.isPopular);
    return items;
  }, [filters]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">КВЕД довідник</h1>
          <p className="text-sm text-muted-foreground">{KVED_ENTRIES.length} кодів</p>
        </div>
        <ContentCreatorDialog schema={kvedSchema} title="Додати КВЕД" />
      </div>

      <ContentFilters
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Пошук за кодом або назвою..."
        filters={[
          { key: "license", label: "Ліцензія", options: [{ value: "yes", label: "Потрібна" }, { value: "no", label: "Не потрібна" }] },
          { key: "popular", label: "Популярність", options: [{ value: "yes", label: "Популярні" }] },
        ]}
        filterValues={filters}
        onFilterChange={(k, v) => setFilters((p) => ({ ...p, [k]: v }))}
        onClearAll={() => { setSearch(""); setFilters({ license: "all", popular: "all" }); }}
      />

      <ContentTable data={filtered} columns={columns} globalFilter={search} onRowClick={(row) => navigate(`/admin/content/kved/${row.code}`)} />
    </div>
  );
}
