import { useState, useMemo } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import {
  PDV_PILHY,
  PDV_PILHA_TYPE_LABEL,
  PDV_SECTOR_LABEL,
  PDV_SECTORS,
  type PdvPilhaEntry,
} from "@/portal/data/pdvPilhy";
import ContentTable from "@/admin/components/ContentTable";
import ContentFilters from "@/admin/components/ContentFilters";
import { Badge } from "@/components/ui/badge";

const columns: ColumnDef<PdvPilhaEntry, any>[] = [
  {
    accessorKey: "title",
    header: "Назва",
    cell: ({ row }) => <div className="text-sm font-medium">{row.original.title}</div>,
  },
  {
    accessorKey: "type",
    header: "Тип",
    cell: ({ row }) => (
      <Badge variant="outline" className="text-[10px]">
        {PDV_PILHA_TYPE_LABEL[row.original.type]}
      </Badge>
    ),
  },
  {
    accessorKey: "sector",
    header: "Галузь",
    cell: ({ row }) => <span className="text-xs">{PDV_SECTOR_LABEL[row.original.sector]}</span>,
  },
  {
    accessorKey: "articleRef",
    header: "Стаття",
    cell: ({ row }) => <span className="text-xs font-mono">{row.original.articleRef}</span>,
  },
  {
    accessorKey: "benefitCode",
    header: "Код пільги",
    cell: ({ row }) =>
      row.original.benefitCode ? (
        <span className="text-xs font-mono">{row.original.benefitCode}</span>
      ) : (
        <span className="text-xs text-muted-foreground">—</span>
      ),
  },
];

export default function PdvPilhyAdmin() {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({ sector: "all", type: "all" });

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return PDV_PILHY.filter((e) => {
      if (filters.sector !== "all" && e.sector !== filters.sector) return false;
      if (filters.type !== "all" && e.type !== filters.type) return false;
      if (q && !e.title.toLowerCase().includes(q) && !(e.benefitCode ?? "").includes(q)) return false;
      return true;
    });
  }, [search, filters]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Пільги з ПДВ</h1>
        <p className="text-sm text-muted-foreground">{PDV_PILHY.length} пільг</p>
      </div>
      <ContentFilters
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Пошук за назвою або кодом пільги..."
        filters={[
          {
            key: "type",
            label: "Тип",
            options: (Object.entries(PDV_PILHA_TYPE_LABEL) as [string, string][]).map(([v, l]) => ({
              value: v,
              label: l,
            })),
          },
          {
            key: "sector",
            label: "Галузь",
            options: PDV_SECTORS.map((s) => ({ value: s, label: PDV_SECTOR_LABEL[s] })),
          },
        ]}
        filterValues={filters}
        onFilterChange={(k, v) => setFilters((p) => ({ ...p, [k]: v }))}
        onClearAll={() => {
          setSearch("");
          setFilters({ sector: "all", type: "all" });
        }}
      />
      <ContentTable data={filtered} columns={columns} />
    </div>
  );
}
