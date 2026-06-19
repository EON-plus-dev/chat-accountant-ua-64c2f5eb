import { useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { BUSINESS_FORMS, type BusinessForm } from "@/portal/data/businessForms";
import ContentTable from "@/admin/components/ContentTable";
import ContentFilters from "@/admin/components/ContentFilters";
import ContentEditorDrawer from "@/admin/components/ContentEditorDrawer";
import ContentCreatorDialog from "@/admin/components/ContentCreatorDialog";
import { businessFormSchema } from "@/admin/schemas/contentSchemas";
import { Badge } from "@/components/ui/badge";

const columns: ColumnDef<BusinessForm, any>[] = [
  { accessorKey: "name", header: "Назва", cell: ({ row }) => <span className="font-medium">{row.original.emoji} {row.original.name}</span> },
  { accessorKey: "fullName", header: "Повна назва" },
  { accessorKey: "accountingComplexity", header: "Складність", cell: ({ row }) => <Badge variant="outline">{row.original.accountingComplexity}</Badge> },
  { accessorKey: "minCapital", header: "Стат. капітал", cell: ({ row }) => <span className="text-sm">{row.original.minCapital}</span> },
  { accessorKey: "taxOptions", header: "Системи", cell: ({ row }) => <span className="text-sm">{row.original.taxOptions.join(", ")}</span> },
];

export default function BusinessFormsAdmin() {
  const [search, setSearch] = useState("");
  const [selectedItem, setSelectedItem] = useState<BusinessForm | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const filtered = BUSINESS_FORMS.filter((f) => {
    if (search && !f.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Форми бізнесу</h1>
          <p className="text-sm text-muted-foreground">{BUSINESS_FORMS.length} форм</p>
        </div>
        <ContentCreatorDialog schema={businessFormSchema} title="Додати форму" />
      </div>
      <ContentFilters
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Пошук форм..."
        filters={[]}
        filterValues={{}}
        onFilterChange={() => {}}
        onClearAll={() => setSearch("")}
      />
      <ContentTable data={filtered} columns={columns} globalFilter={search} onRowClick={(row) => { setSelectedItem(row); setDrawerOpen(true); }} />
      <ContentEditorDrawer open={drawerOpen} onOpenChange={setDrawerOpen} data={selectedItem} schema={businessFormSchema} title="Форма бізнесу" />
    </div>
  );
}
