import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { KNOWLEDGE } from "@/portal/data/knowledge";
import ContentTable from "@/admin/components/ContentTable";
import ContentFilters from "@/admin/components/ContentFilters";
import ContentCreatorDialog from "@/admin/components/ContentCreatorDialog";
import { knowledgeSchema } from "@/admin/schemas/contentSchemas";
import { Badge } from "@/components/ui/badge";
import type { ColumnDef } from "@tanstack/react-table";
import type { KnowledgeEntry } from "@/portal/data/knowledge";
import { BookOpen } from "lucide-react";

const CAT_LABELS: Record<string, string> = { tax: "Податки", accounting: "Облік", law: "Право", finance: "Фінанси" };
const CAT_COLORS: Record<string, string> = {
  tax: "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30",
  accounting: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30",
  law: "bg-violet-500/15 text-violet-700 dark:text-violet-400 border-violet-500/30",
  finance: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30",
};

const columns: ColumnDef<KnowledgeEntry, any>[] = [
  { accessorKey: "term", header: "Термін", cell: ({ row }) => <span className="font-semibold text-sm">{row.original.term}</span> },
  { accessorKey: "category", header: "Категорія", cell: ({ row }) => <Badge className={`text-xs ${CAT_COLORS[row.original.category] || ""}`}>{CAT_LABELS[row.original.category] || row.original.category}</Badge> },
  { accessorKey: "shortDefinition", header: "Визначення", cell: ({ row }) => <span className="text-sm text-muted-foreground line-clamp-2 max-w-md">{row.original.shortDefinition}</span> },
  { id: "relations", header: "Зв'язки", enableSorting: false, cell: ({ row }) => <div className="flex gap-2 text-xs text-muted-foreground"><span>{row.original.relatedTermSlugs.length} терм.</span><span>{row.original.relatedArticleIds.length} ст.</span><span>{row.original.relatedToolIds.length} інстр.</span></div> },
  { accessorKey: "slug", header: "Slug", cell: ({ row }) => <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{row.original.slug}</code> },
];

export default function KnowledgeAdmin() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({ category: "all" });

  const filtered = useMemo(() => KNOWLEDGE.filter(k => {
    if (filters.category !== "all" && k.category !== filters.category) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!k.term.toLowerCase().includes(q) && !k.shortDefinition.toLowerCase().includes(q)) return false;
    }
    return true;
  }), [filters, search]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Словник</h1>
          <p className="text-sm text-muted-foreground">{KNOWLEDGE.length} термінів</p>
        </div>
        <ContentCreatorDialog schema={knowledgeSchema} title="Додати термін" />
      </div>

      <ContentFilters searchValue={search} onSearchChange={setSearch} searchPlaceholder="Пошук термінів..."
        filters={[{ key: "category", label: "Категорія", options: Object.entries(CAT_LABELS).map(([v, l]) => ({ value: v, label: l })) }]}
        filterValues={filters}
        onFilterChange={(k, v) => setFilters(prev => ({ ...prev, [k]: v }))}
        onClearAll={() => { setSearch(""); setFilters({ category: "all" }); }}
      />

      <ContentTable data={filtered} columns={columns} globalFilter={search}
        onRowClick={(row) => navigate(`/admin/content/knowledge/${row.slug}`)}
      />
    </div>
  );
}
