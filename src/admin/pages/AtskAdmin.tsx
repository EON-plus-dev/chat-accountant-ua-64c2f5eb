import { useState, useMemo } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import {
  ATSK_PROVIDERS,
  ATSK_CATEGORY_LABEL,
  KEP_MEDIUM_LABEL,
  type AtskEntry,
} from "@/portal/data/atskProviders";
import ContentTable from "@/admin/components/ContentTable";
import ContentFilters from "@/admin/components/ContentFilters";
import { Badge } from "@/components/ui/badge";

const columns: ColumnDef<AtskEntry, any>[] = [
  {
    accessorKey: "shortName",
    header: "Надавач",
    cell: ({ row }) => (
      <div>
        <div className="font-semibold text-sm">{row.original.shortName}</div>
        <div className="text-xs text-muted-foreground line-clamp-1">{row.original.fullName}</div>
      </div>
    ),
  },
  {
    accessorKey: "category",
    header: "Тип",
    cell: ({ row }) => (
      <Badge variant="outline" className="text-[10px]">
        {ATSK_CATEGORY_LABEL[row.original.category]}
      </Badge>
    ),
  },
  {
    accessorKey: "mediums",
    header: "Носії",
    cell: ({ row }) => (
      <div className="flex flex-wrap gap-1">
        {row.original.mediums.map((m) => (
          <Badge key={m} variant="secondary" className="text-[10px]">
            {KEP_MEDIUM_LABEL[m]}
          </Badge>
        ))}
      </div>
    ),
  },
  {
    accessorKey: "edrpou",
    header: "ЄДРПОУ",
    cell: ({ row }) => <span className="font-mono text-xs">{row.original.edrpou ?? "—"}</span>,
  },
];

export default function AtskAdmin() {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({ category: "all" });

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return ATSK_PROVIDERS.filter((a) => {
      if (filters.category !== "all" && a.category !== filters.category) return false;
      if (q && !a.shortName.toLowerCase().includes(q) && !a.fullName.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [search, filters]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">АЦСК та КЕП</h1>
          <p className="text-sm text-muted-foreground">
            {ATSK_PROVIDERS.length} надавачів кваліфікованого електронного підпису
          </p>
        </div>
      </div>
      <ContentFilters
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Пошук за назвою..."
        filters={[
          {
            key: "category",
            label: "Тип",
            options: Object.entries(ATSK_CATEGORY_LABEL).map(([v, l]) => ({ value: v, label: l })),
          },
        ]}
        filterValues={filters}
        onFilterChange={(k, v) => setFilters((p) => ({ ...p, [k]: v }))}
        onClearAll={() => {
          setSearch("");
          setFilters({ category: "all" });
        }}
      />
      <ContentTable data={filtered} columns={columns} />
    </div>
  );
}
