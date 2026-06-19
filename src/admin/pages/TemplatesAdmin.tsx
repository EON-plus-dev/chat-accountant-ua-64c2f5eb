import { useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { TEMPLATES, TEMPLATE_CATEGORIES, type DocumentTemplate } from "@/portal/data/templates";
import ContentTable from "@/admin/components/ContentTable";
import ContentFilters from "@/admin/components/ContentFilters";
import ContentEditorDrawer from "@/admin/components/ContentEditorDrawer";
import ContentCreatorDialog from "@/admin/components/ContentCreatorDialog";
import { templateSchema } from "@/admin/schemas/contentSchemas";
import { Badge } from "@/components/ui/badge";

const columns: ColumnDef<DocumentTemplate, any>[] = [
  { accessorKey: "name", header: "Назва", cell: ({ row }) => <span className="font-medium max-w-[300px] truncate block">{row.original.name}</span> },
  { accessorKey: "category", header: "Категорія", cell: ({ row }) => <Badge variant="outline">{row.original.category}</Badge> },
  { accessorKey: "format", header: "Формат", cell: ({ row }) => <Badge variant="secondary" className="text-[10px]">{row.original.format}</Badge> },
  { accessorKey: "audience", header: "Аудиторія", cell: ({ row }) => <span className="text-sm">{row.original.audience === "business" ? "Бізнес" : row.original.audience === "personal" ? "Фізособа" : "Обидва"}</span> },
  { accessorKey: "isPopular", header: "Популярний", cell: ({ row }) => row.original.isPopular ? <Badge>Popular</Badge> : <span className="text-muted-foreground">—</span> },
];

export default function TemplatesAdmin() {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [selectedItem, setSelectedItem] = useState<DocumentTemplate | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const filtered = TEMPLATES.filter((t) => {
    if (search && !t.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (filters.category && filters.category !== "all" && t.category !== filters.category) return false;
    if (filters.audience && filters.audience !== "all" && t.audience !== filters.audience) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Шаблони документів</h1>
          <p className="text-sm text-muted-foreground">{TEMPLATES.length} шаблонів</p>
        </div>
        <ContentCreatorDialog schema={templateSchema} title="Додати шаблон" />
      </div>
      <ContentFilters
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Пошук шаблонів..."
        filters={[
          { key: "category", label: "Категорія", options: TEMPLATE_CATEGORIES.map((c) => ({ value: c.id, label: c.label })) },
          { key: "audience", label: "Аудиторія", options: [{ value: "business", label: "Бізнес" }, { value: "personal", label: "Фізособа" }, { value: "both", label: "Обидва" }] },
        ]}
        filterValues={filters}
        onFilterChange={(k, v) => setFilters((p) => ({ ...p, [k]: v }))}
        onClearAll={() => { setSearch(""); setFilters({}); }}
      />
      <ContentTable data={filtered} columns={columns} globalFilter={search} onRowClick={(row) => { setSelectedItem(row); setDrawerOpen(true); }} />
      <ContentEditorDrawer open={drawerOpen} onOpenChange={setDrawerOpen} data={selectedItem} schema={templateSchema} title="Шаблон" />
    </div>
  );
}
