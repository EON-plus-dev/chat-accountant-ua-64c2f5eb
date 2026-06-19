import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { LAWS, LAW_CATEGORY_MAP, LAW_TYPE_MAP } from "@/portal/data/laws";
import ContentTable from "@/admin/components/ContentTable";
import ContentFilters from "@/admin/components/ContentFilters";
import ContentCreatorDialog from "@/admin/components/ContentCreatorDialog";
import { lawSchema } from "@/admin/schemas/contentSchemas";
import { Badge } from "@/components/ui/badge";
import { Scale } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import type { LawEntry } from "@/portal/data/laws";

const IMPACT_COLORS: Record<string, string> = {
  high: "bg-destructive/15 text-destructive border-destructive/30",
  medium: "bg-yellow-500/15 text-yellow-700 dark:text-yellow-400 border-yellow-500/30",
  low: "bg-muted text-muted-foreground",
};

const columns: ColumnDef<LawEntry, any>[] = [
  { accessorKey: "shortName", header: "Назва", cell: ({ row }) => <span className="font-semibold text-sm">{row.original.shortName}</span> },
  { accessorKey: "number", header: "Номер", cell: ({ row }) => <span className="text-xs text-muted-foreground">{row.original.number}</span> },
  { accessorKey: "type", header: "Тип", cell: ({ row }) => <Badge variant="outline" className="text-xs">{LAW_TYPE_MAP[row.original.type]}</Badge> },
  { accessorKey: "category", header: "Категорія", cell: ({ row }) => <Badge variant="secondary" className="text-xs">{LAW_CATEGORY_MAP[row.original.category]}</Badge> },
  {
    id: "lastChange", header: "Остання зміна",
    cell: ({ row }) => {
      const c = row.original.recentChanges[0];
      return c ? <Badge className={`text-xs ${IMPACT_COLORS[c.impact]}`}>{c.date}</Badge> : <span className="text-xs text-muted-foreground">—</span>;
    },
  },
  { id: "relations", header: "Зв'язки", cell: ({ row }) => <span className="text-xs text-muted-foreground">{row.original.relatedArticleIds.length} ст. / {row.original.relatedToolIds.length} інстр.</span> },
];

export default function LawsAdmin() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({ category: "all", type: "all" });

  const filtered = useMemo(() => {
    return LAWS.filter(l => {
      if (filters.category !== "all" && l.category !== filters.category) return false;
      if (filters.type !== "all" && l.type !== filters.type) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!l.fullName.toLowerCase().includes(q) && !l.shortName.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [filters, search]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Законодавство</h1>
          <p className="text-sm text-muted-foreground">{LAWS.length} нормативних актів</p>
        </div>
        <ContentCreatorDialog schema={lawSchema} title="Додати закон" />
      </div>

      <ContentFilters
        searchValue={search} onSearchChange={setSearch} searchPlaceholder="Пошук законів..."
        filters={[
          { key: "category", label: "Категорія", options: Object.entries(LAW_CATEGORY_MAP).map(([v, l]) => ({ value: v, label: l })) },
          { key: "type", label: "Тип", options: Object.entries(LAW_TYPE_MAP).map(([v, l]) => ({ value: v, label: l })) },
        ]}
        filterValues={filters}
        onFilterChange={(k, v) => setFilters(prev => ({ ...prev, [k]: v }))}
        onClearAll={() => { setSearch(""); setFilters({ category: "all", type: "all" }); }}
      />

      <ContentTable data={filtered} columns={columns} globalFilter={search}
        onRowClick={(row) => navigate(`/admin/content/law/${row.slug}`)}
      />
    </div>
  );
}
