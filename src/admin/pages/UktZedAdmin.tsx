import { useState, useMemo } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { UKT_ZED, UKT_SECTION_LABEL, UKT_ZED_SECTIONS, type UktZedEntry } from "@/portal/data/uktZed";
import ContentTable from "@/admin/components/ContentTable";
import ContentFilters from "@/admin/components/ContentFilters";
import { Badge } from "@/components/ui/badge";

const columns: ColumnDef<UktZedEntry, any>[] = [
  { accessorKey: "code", header: "Код УКТ ЗЕД", cell: ({ row }) => <span className="font-mono text-sm">{row.original.code}</span> },
  { accessorKey: "name", header: "Товар", cell: ({ row }) => <div className="text-sm font-medium">{row.original.name}</div> },
  { accessorKey: "section", header: "Розділ", cell: ({ row }) => <Badge variant="outline" className="text-[10px]">{row.original.section}. {UKT_SECTION_LABEL[row.original.section]}</Badge> },
  { accessorKey: "importRate", header: "Мито", cell: ({ row }) => <span className="text-xs">{row.original.duty.importRate}</span> },
  { accessorKey: "vatRate", header: "ПДВ", cell: ({ row }) => <span className="text-xs">{row.original.duty.vatRate}</span> },
  { accessorKey: "excise", header: "Акциз", cell: ({ row }) => row.original.duty.excise ? <Badge variant="secondary" className="text-[10px]">є</Badge> : <span className="text-xs text-muted-foreground">—</span> },
];

export default function UktZedAdmin() {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({ section: "all" });

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return UKT_ZED.filter((e) => {
      if (filters.section !== "all" && e.section !== filters.section) return false;
      if (q && !e.name.toLowerCase().includes(q) && !e.codeRaw.includes(q.replace(/\s+/g, ""))) return false;
      return true;
    });
  }, [search, filters]);

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">УКТ ЗЕД</h1><p className="text-sm text-muted-foreground">{UKT_ZED.length} товарних позицій</p></div>
      <ContentFilters
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Пошук за назвою або кодом..."
        filters={[{ key: "section", label: "Розділ", options: UKT_ZED_SECTIONS.map((s) => ({ value: s, label: `${s}. ${UKT_SECTION_LABEL[s]}` })) }]}
        filterValues={filters}
        onFilterChange={(k, v) => setFilters((p) => ({ ...p, [k]: v }))}
        onClearAll={() => { setSearch(""); setFilters({ section: "all" }); }}
      />
      <ContentTable data={filtered} columns={columns} />
    </div>
  );
}
