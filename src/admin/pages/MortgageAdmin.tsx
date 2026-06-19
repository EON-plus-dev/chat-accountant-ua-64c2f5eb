import { useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { MORTGAGE_PROGRAMS, MortgageProgram } from "@/portal/data/mortgageRates";
import ContentTable from "@/admin/components/ContentTable";
import ContentFilters from "@/admin/components/ContentFilters";
import ContentEditorDrawer from "@/admin/components/ContentEditorDrawer";
import ContentCreatorDialog from "@/admin/components/ContentCreatorDialog";
import { mortgageSchema } from "@/admin/schemas/contentSchemas";
import { Badge } from "@/components/ui/badge";

const columns: ColumnDef<MortgageProgram, any>[] = [
  { accessorKey: "name", header: "Назва" },
  { accessorKey: "bank", header: "Банк" },
  {
    accessorKey: "type",
    header: "Тип",
    cell: ({ row }) => <Badge variant={row.original.type === "state" ? "default" : "secondary"} className="text-[10px]">{row.original.type === "state" ? "Державна" : "Комерційна"}</Badge>,
  },
  { accessorKey: "rateDisplay", header: "Ставка" },
  {
    accessorKey: "minDownPayment",
    header: "Мін. внесок",
    cell: ({ row }) => `${row.original.minDownPayment}%`,
  },
  {
    accessorKey: "isOpen",
    header: "Статус",
    cell: ({ row }) => <Badge variant={row.original.isOpen ? "default" : "destructive"} className="text-[10px]">{row.original.isOpen ? "Відкрита" : "Закрита"}</Badge>,
  },
];

export default function MortgageAdmin() {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [selectedItem, setSelectedItem] = useState<MortgageProgram | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const filtered = MORTGAGE_PROGRAMS.filter((m) => {
    if (search && !m.name.toLowerCase().includes(search.toLowerCase()) && !m.bank.toLowerCase().includes(search.toLowerCase())) return false;
    if (filters.type && filters.type !== "all" && m.type !== filters.type) return false;
    if (filters.isOpen && filters.isOpen !== "all") {
      if (filters.isOpen === "yes" && !m.isOpen) return false;
      if (filters.isOpen === "no" && m.isOpen) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Іпотечні програми</h1>
          <p className="text-muted-foreground">{MORTGAGE_PROGRAMS.length} програм</p>
        </div>
        <ContentCreatorDialog schema={mortgageSchema} title="Нова програма" />
      </div>
      <ContentFilters
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Пошук за назвою або банком..."
        filters={[
          { key: "type", label: "Тип", options: [{ value: "state", label: "Державна" }, { value: "commercial", label: "Комерційна" }] },
          { key: "isOpen", label: "Статус", options: [{ value: "yes", label: "Відкрита" }, { value: "no", label: "Закрита" }] },
        ]}
        filterValues={filters}
        onFilterChange={(k, v) => setFilters((p) => ({ ...p, [k]: v }))}
        onClearAll={() => { setSearch(""); setFilters({}); }}
      />
      <ContentTable columns={columns} data={filtered} onRowClick={(row) => { setSelectedItem(row); setDrawerOpen(true); }} />
      <ContentEditorDrawer open={drawerOpen} onOpenChange={setDrawerOpen} data={selectedItem} schema={mortgageSchema} title="Іпотечна програма" />
    </div>
  );
}
