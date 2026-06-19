import { useState, useMemo } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { AGENCIES, AGENCY_CATEGORY_LABEL, type AgencyEntry } from "@/portal/data/agencies";
import ContentTable from "@/admin/components/ContentTable";
import ContentFilters from "@/admin/components/ContentFilters";
import { Badge } from "@/components/ui/badge";

const columns: ColumnDef<AgencyEntry, any>[] = [
  {
    accessorKey: "shortName",
    header: "Орган",
    cell: ({ row }) => (
      <div>
        <div className="font-semibold text-sm">{row.original.shortName}</div>
        <div className="text-xs text-muted-foreground line-clamp-1">{row.original.fullName}</div>
      </div>
    ),
  },
  {
    accessorKey: "category",
    header: "Категорія",
    cell: ({ row }) => (
      <Badge variant="outline" className="text-[10px]">
        {AGENCY_CATEGORY_LABEL[row.original.category]}
      </Badge>
    ),
  },
  {
    accessorKey: "edrpou",
    header: "ЄДРПОУ",
    cell: ({ row }) => <span className="font-mono text-xs">{row.original.edrpou ?? "—"}</span>,
  },
  {
    accessorKey: "services",
    header: "Послуг",
    cell: ({ row }) => <span className="text-xs">{row.original.services.length}</span>,
  },
];

export default function AgenciesAdmin() {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({ category: "all" });

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return AGENCIES.filter((a) => {
      if (filters.category !== "all" && a.category !== filters.category) return false;
      if (q && !a.shortName.toLowerCase().includes(q) && !a.fullName.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [search, filters]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Держоргани</h1>
          <p className="text-sm text-muted-foreground">{AGENCIES.length} відомств — контакти, послуги, кабінети</p>
        </div>
      </div>
      <ContentFilters
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Пошук за назвою..."
        filters={[
          {
            key: "category",
            label: "Категорія",
            options: Object.entries(AGENCY_CATEGORY_LABEL).map(([v, l]) => ({ value: v, label: l })),
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
