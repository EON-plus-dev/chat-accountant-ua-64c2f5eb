import { useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { TAX_CATEGORIES, TaxCategory } from "@/portal/data/categories";
import ContentTable from "@/admin/components/ContentTable";
import ContentFilters from "@/admin/components/ContentFilters";
import ContentEditorDrawer from "@/admin/components/ContentEditorDrawer";
import ContentCreatorDialog from "@/admin/components/ContentCreatorDialog";
import { categorySchema } from "@/admin/schemas/contentSchemas";

const columns: ColumnDef<TaxCategory, any>[] = [
  {
    accessorKey: "name",
    header: "Категорія",
    cell: ({ row }) => <span>{row.original.emoji} {row.original.name}</span>,
  },
  { accessorKey: "count", header: "Статей" },
  { accessorKey: "hotTopic", header: "Hot Topic" },
  { accessorKey: "slug", header: "Slug" },
];

export default function CategoriesAdmin() {
  const [search, setSearch] = useState("");
  const [selectedItem, setSelectedItem] = useState<TaxCategory | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Категорії</h1>
          <p className="text-muted-foreground">{TAX_CATEGORIES.length} категорій</p>
        </div>
        <ContentCreatorDialog schema={categorySchema} title="Нова категорія" />
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

      <ContentTable columns={columns} data={TAX_CATEGORIES} globalFilter={search} onRowClick={(row) => { setSelectedItem(row); setDrawerOpen(true); }} />
      <ContentEditorDrawer open={drawerOpen} onOpenChange={setDrawerOpen} data={selectedItem} schema={categorySchema} title="Категорія" />
    </div>
  );
}
