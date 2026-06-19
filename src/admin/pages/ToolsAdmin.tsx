import { useState, useMemo } from "react";
import { TOOLS } from "@/portal/data/tools";
import ContentTable from "@/admin/components/ContentTable";
import ContentFilters from "@/admin/components/ContentFilters";
import ContentEditorDrawer from "@/admin/components/ContentEditorDrawer";
import ContentCreatorDialog from "@/admin/components/ContentCreatorDialog";
import { toolSchema } from "@/admin/schemas/contentSchemas";
import { Badge } from "@/components/ui/badge";
import type { ColumnDef } from "@tanstack/react-table";
import type { Tool } from "@/portal/data/tools";
import { Wrench } from "lucide-react";

const CATEGORY_LABELS: Record<string, string> = {
  calculator: "Калькулятор", calendar: "Календар", constructor: "Конструктор",
  reference: "Довідник", management: "Управління", hr: "HR", documents: "Документи", generator: "Генератор",
};

const columns: ColumnDef<Tool, any>[] = [
  { accessorKey: "name", header: "Інструмент", cell: ({ row }) => <div className="flex items-center gap-2"><span className="text-lg">{row.original.emoji}</span><span className="font-medium text-sm">{row.original.name}</span></div> },
  { accessorKey: "category", header: "Категорія", cell: ({ row }) => <Badge variant="outline" className="text-xs">{CATEGORY_LABELS[row.original.category] || row.original.category}</Badge> },
  { accessorKey: "usageCount", header: "Використання", cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.original.usageLabel || "—"}</span> },
  { id: "status", header: "Статус", enableSorting: false, cell: ({ row }) => (
    <div className="flex gap-1">
      {row.original.isPremium && <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30 text-xs">Premium</Badge>}
      {row.original.isNew && <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 text-xs">New</Badge>}
      {!row.original.isPremium && !row.original.isNew && <span className="text-xs text-muted-foreground">Активний</span>}
    </div>
  )},
  { accessorKey: "slug", header: "Slug", cell: ({ row }) => <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{row.original.slug}</code> },
];

export default function ToolsAdmin() {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({ category: "all", premium: "all" });
  const [selectedItem, setSelectedItem] = useState<Tool | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const filtered = useMemo(() => {
    return TOOLS.filter(t => {
      if (filters.category !== "all" && t.category !== filters.category) return false;
      if (filters.premium === "yes" && !t.isPremium) return false;
      if (filters.premium === "no" && t.isPremium) return false;
      return true;
    });
  }, [filters]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Інструменти</h1>
          <p className="text-sm text-muted-foreground">{TOOLS.length} інструментів у реєстрі</p>
        </div>
        <ContentCreatorDialog schema={toolSchema} title="Додати інструмент" />
      </div>

      <ContentFilters searchValue={search} onSearchChange={setSearch} searchPlaceholder="Пошук інструментів..."
        filters={[
          { key: "category", label: "Категорія", options: Object.entries(CATEGORY_LABELS).map(([v, l]) => ({ value: v, label: l })) },
          { key: "premium", label: "Тип", options: [{ value: "yes", label: "Premium" }, { value: "no", label: "Безкоштовні" }] },
        ]}
        filterValues={filters}
        onFilterChange={(k, v) => setFilters(prev => ({ ...prev, [k]: v }))}
        onClearAll={() => { setSearch(""); setFilters({ category: "all", premium: "all" }); }}
      />

      <ContentTable data={filtered} columns={columns} globalFilter={search}
        onRowClick={(row) => { setSelectedItem(row); setDrawerOpen(true); }}
      />

      <ContentEditorDrawer open={drawerOpen} onOpenChange={setDrawerOpen} data={selectedItem} schema={toolSchema} title="Інструмент" />
    </div>
  );
}
