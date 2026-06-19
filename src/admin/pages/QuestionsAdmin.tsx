import { useState, useMemo } from "react";
import { POPULAR_QUESTIONS } from "@/portal/data/popularQuestions";
import ContentTable from "@/admin/components/ContentTable";
import ContentFilters from "@/admin/components/ContentFilters";
import { Badge } from "@/components/ui/badge";
import { type ColumnDef } from "@tanstack/react-table";
import type { PopularQuestion } from "@/portal/data/popularQuestions";
import ContentEditorDrawer from "@/admin/components/ContentEditorDrawer";
import ContentCreatorDialog from "@/admin/components/ContentCreatorDialog";
import { questionSchema } from "@/admin/schemas/contentSchemas";

const audBadge: Record<string, string> = {
  business: "bg-blue-100 text-blue-800",
  personal: "bg-green-100 text-green-800",
  accountant: "bg-purple-100 text-purple-800",
  both: "bg-muted text-muted-foreground",
};

const columns: ColumnDef<PopularQuestion, any>[] = [
  { accessorKey: "emoji", header: "🔹", cell: ({ row }) => <span className="text-lg">{row.original.emoji}</span>, size: 40 },
  { accessorKey: "question", header: "Питання", cell: ({ row }) => <span className="font-medium">{row.original.question}</span> },
  { accessorKey: "audience", header: "Аудиторія", cell: ({ row }) => <Badge className={audBadge[row.original.audience]}>{row.original.audience}</Badge> },
  { accessorKey: "category", header: "Категорія", cell: ({ row }) => <Badge variant="outline">{row.original.category || "—"}</Badge> },
];

export default function QuestionsAdmin() {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({ audience: "all" });
  const [selectedItem, setSelectedItem] = useState<PopularQuestion | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const filtered = useMemo(() => {
    if (filters.audience === "all") return POPULAR_QUESTIONS;
    return POPULAR_QUESTIONS.filter((q) => q.audience === filters.audience);
  }, [filters]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Популярні питання</h1>
          <p className="text-sm text-muted-foreground">{POPULAR_QUESTIONS.length} питань</p>
        </div>
        <ContentCreatorDialog schema={questionSchema} title="Додати питання" />
      </div>

      <ContentFilters
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Пошук питань..."
        filters={[
          { key: "audience", label: "Аудиторія", options: [
            { value: "business", label: "Бізнес" },
            { value: "personal", label: "Фізособа" },
            { value: "accountant", label: "Бухгалтер" },
            { value: "both", label: "Всі" },
          ]},
        ]}
        filterValues={filters}
        onFilterChange={(k, v) => setFilters((p) => ({ ...p, [k]: v }))}
        onClearAll={() => { setSearch(""); setFilters({ audience: "all" }); }}
      />

      <ContentTable data={filtered} columns={columns} globalFilter={search} onRowClick={(row) => { setSelectedItem(row); setDrawerOpen(true); }} />

      <ContentEditorDrawer open={drawerOpen} onOpenChange={setDrawerOpen} data={selectedItem} schema={questionSchema} title="Питання" />
    </div>
  );
}
