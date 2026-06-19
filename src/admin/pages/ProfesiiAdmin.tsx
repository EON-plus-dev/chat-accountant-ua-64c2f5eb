import { useState, useMemo } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import {
  PROFESII,
  PROFESIA_SECTION_LABEL,
  type ProfesiaEntry,
} from "@/portal/data/profesii";
import ContentTable from "@/admin/components/ContentTable";
import ContentFilters from "@/admin/components/ContentFilters";
import { Badge } from "@/components/ui/badge";

const columns: ColumnDef<ProfesiaEntry, any>[] = [
  {
    accessorKey: "name",
    header: "Професія",
    cell: ({ row }) => (
      <div>
        <div className="font-semibold text-sm">{row.original.name}</div>
        {row.original.aliases && (
          <div className="text-xs text-muted-foreground line-clamp-1 italic">
            {row.original.aliases.join(" · ")}
          </div>
        )}
      </div>
    ),
  },
  {
    accessorKey: "code",
    header: "Код",
    cell: ({ row }) => <span className="font-mono text-xs font-semibold">{row.original.code}</span>,
  },
  {
    accessorKey: "section",
    header: "Розділ",
    cell: ({ row }) => (
      <Badge variant="outline" className="text-[10px]">
        {row.original.section}. {PROFESIA_SECTION_LABEL[row.original.section]}
      </Badge>
    ),
  },
  {
    accessorKey: "pensionList",
    header: "Пільг. пенсія",
    cell: ({ row }) =>
      row.original.pensionList && row.original.pensionList !== "none" ? (
        <Badge variant="default" className="text-[10px]">Список {row.original.pensionList}</Badge>
      ) : (
        <span className="text-xs text-muted-foreground">—</span>
      ),
  },
  {
    accessorKey: "typicalSalary",
    header: "ЗП орієнтовно",
    cell: ({ row }) => <span className="text-xs">{row.original.typicalSalary ?? "—"}</span>,
  },
];

export default function ProfesiiAdmin() {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({ section: "all" });

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return PROFESII.filter((p) => {
      if (filters.section !== "all" && p.section !== filters.section) return false;
      if (q && !p.name.toLowerCase().includes(q) && !p.code.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [search, filters]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Класифікатор професій</h1>
          <p className="text-sm text-muted-foreground">
            {PROFESII.length} професій (ДК 003:2010)
          </p>
        </div>
      </div>
      <ContentFilters
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Пошук за назвою або кодом..."
        filters={[
          {
            key: "section",
            label: "Розділ",
            options: Object.entries(PROFESIA_SECTION_LABEL).map(([v, l]) => ({
              value: v,
              label: `${v}. ${l}`,
            })),
          },
        ]}
        filterValues={filters}
        onFilterChange={(k, v) => setFilters((p) => ({ ...p, [k]: v }))}
        onClearAll={() => {
          setSearch("");
          setFilters({ section: "all" });
        }}
      />
      <ContentTable data={filtered} columns={columns} />
    </div>
  );
}
