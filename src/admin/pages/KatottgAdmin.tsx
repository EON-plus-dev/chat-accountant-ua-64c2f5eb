import { useState, useMemo } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import {
  KATOTTG_ENTRIES,
  KATOTTG_LEVEL_LABEL,
  KATOTTG_OBLASTS,
  type KatottgEntry,
} from "@/portal/data/katottg";
import ContentTable from "@/admin/components/ContentTable";
import ContentFilters from "@/admin/components/ContentFilters";
import { Badge } from "@/components/ui/badge";

const columns: ColumnDef<KatottgEntry, any>[] = [
  {
    accessorKey: "name",
    header: "Одиниця",
    cell: ({ row }) => (
      <div>
        <div className="font-semibold text-sm">{row.original.name}</div>
        <div className="text-xs text-muted-foreground capitalize">{row.original.unitType} · {row.original.oblast}</div>
      </div>
    ),
  },
  {
    accessorKey: "code",
    header: "Код КАТОТТГ",
    cell: ({ row }) => <span className="font-mono text-xs">{row.original.code}</span>,
  },
  {
    accessorKey: "level",
    header: "Рівень",
    cell: ({ row }) => (
      <Badge variant="outline" className="text-[10px]">
        {KATOTTG_LEVEL_LABEL[row.original.level]}
      </Badge>
    ),
  },
  {
    accessorKey: "postalCode",
    header: "Індекс",
    cell: ({ row }) => <span className="font-mono text-xs">{row.original.postalCode ?? "—"}</span>,
  },
];

export default function KatottgAdmin() {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({ level: "all", oblast: "all" });

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return KATOTTG_ENTRIES.filter((e) => {
      if (filters.level !== "all" && e.level !== filters.level) return false;
      if (filters.oblast !== "all" && e.oblast !== filters.oblast) return false;
      if (q && !e.name.toLowerCase().includes(q) && !e.code.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [search, filters]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">КАТОТТГ</h1>
          <p className="text-sm text-muted-foreground">
            {KATOTTG_ENTRIES.length} адмін-територіальних одиниць
          </p>
        </div>
      </div>
      <ContentFilters
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Пошук за назвою або кодом..."
        filters={[
          {
            key: "level",
            label: "Рівень",
            options: Object.entries(KATOTTG_LEVEL_LABEL).map(([v, l]) => ({ value: v, label: l })),
          },
          {
            key: "oblast",
            label: "Область",
            options: KATOTTG_OBLASTS.map((o) => ({ value: o, label: o })),
          },
        ]}
        filterValues={filters}
        onFilterChange={(k, v) => setFilters((p) => ({ ...p, [k]: v }))}
        onClearAll={() => {
          setSearch("");
          setFilters({ level: "all", oblast: "all" });
        }}
      />
      <ContentTable data={filtered} columns={columns} />
    </div>
  );
}
