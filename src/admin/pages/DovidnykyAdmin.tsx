import { useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { DOVIDNYKY_SECTIONS, DovidnykySection } from "@/portal/data/dovidnyky";
import ContentTable from "@/admin/components/ContentTable";
import ContentFilters from "@/admin/components/ContentFilters";
import ContentEditorDrawer from "@/admin/components/ContentEditorDrawer";
import ContentCreatorDialog from "@/admin/components/ContentCreatorDialog";
import { dovidnykySchema } from "@/admin/schemas/contentSchemas";
import { Badge } from "@/components/ui/badge";

const audienceLabel: Record<string, string> = { business: "Бізнес", personal: "Фізособа", both: "Обидва" };

const columns: ColumnDef<DovidnykySection, any>[] = [
  {
    accessorKey: "name",
    header: "Назва",
    cell: ({ row }) => <span>{row.original.emoji} {row.original.name}</span>,
  },
  { accessorKey: "tagline", header: "Tagline" },
  {
    accessorKey: "audience",
    header: "Аудиторія",
    cell: ({ row }) => <Badge variant="outline" className="text-[10px]">{audienceLabel[row.original.audience]}</Badge>,
  },
  {
    accessorKey: "entryCount",
    header: "Записів",
    cell: ({ row }) => `${row.original.entryCount} ${row.original.entryLabel}`,
  },
  {
    id: "status",
    header: "Статус",
    cell: ({ row }) => (
      <div className="flex gap-1">
        {row.original.isLive && <Badge variant="default" className="text-[10px]">Live</Badge>}
        {row.original.isNew && <Badge variant="secondary" className="text-[10px]">New</Badge>}
        {!row.original.isLive && <Badge variant="outline" className="text-[10px]">Draft</Badge>}
      </div>
    ),
  },
];

export default function DovidnykyAdmin() {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [selectedItem, setSelectedItem] = useState<DovidnykySection | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const filtered = DOVIDNYKY_SECTIONS.filter((d) => {
    if (search && !d.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (filters.audience && filters.audience !== "all" && d.audience !== filters.audience) return false;
    if (filters.isLive && filters.isLive !== "all") {
      if (filters.isLive === "yes" && !d.isLive) return false;
      if (filters.isLive === "no" && d.isLive) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Довідники (секції)</h1>
          <p className="text-muted-foreground">{DOVIDNYKY_SECTIONS.length} секцій</p>
        </div>
        <ContentCreatorDialog schema={dovidnykySchema} title="Нова секція" />
      </div>
      <ContentFilters
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Пошук за назвою..."
        filters={[
          { key: "audience", label: "Аудиторія", options: [{ value: "business", label: "Бізнес" }, { value: "personal", label: "Фізособа" }, { value: "both", label: "Обидва" }] },
          { key: "isLive", label: "Статус", options: [{ value: "yes", label: "Live" }, { value: "no", label: "Draft" }] },
        ]}
        filterValues={filters}
        onFilterChange={(k, v) => setFilters((p) => ({ ...p, [k]: v }))}
        onClearAll={() => { setSearch(""); setFilters({}); }}
      />
      <ContentTable columns={columns} data={filtered} onRowClick={(row) => { setSelectedItem(row); setDrawerOpen(true); }} />
      <ContentEditorDrawer open={drawerOpen} onOpenChange={setDrawerOpen} data={selectedItem} schema={dovidnykySchema} title="Довідник" />
    </div>
  );
}
