import { useState, useMemo } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { PLAN_RAKHUNKIV, ACCOUNT_CLASS_LABEL, ACCOUNT_TYPE_LABEL, type PlanRakhunkuEntry } from "@/portal/data/planRakhunkiv";
import ContentTable from "@/admin/components/ContentTable";
import ContentFilters from "@/admin/components/ContentFilters";
import { Badge } from "@/components/ui/badge";

const columns: ColumnDef<PlanRakhunkuEntry, any>[] = [
  { accessorKey: "code", header: "Код", cell: ({ row }) => <span className="font-mono font-semibold">{row.original.code}</span> },
  { accessorKey: "name", header: "Назва", cell: ({ row }) => <div className="text-sm">{row.original.name}</div> },
  { accessorKey: "class", header: "Клас", cell: ({ row }) => <Badge variant="outline" className="text-[10px]">{row.original.class}. {ACCOUNT_CLASS_LABEL[row.original.class]}</Badge> },
  { accessorKey: "type", header: "Тип", cell: ({ row }) => <Badge variant="secondary" className="text-[10px]">{ACCOUNT_TYPE_LABEL[row.original.type]}</Badge> },
  { accessorKey: "subaccounts", header: "Субрахунків", cell: ({ row }) => <span className="text-xs">{row.original.subaccounts?.length ?? 0}</span> },
];

export default function PlanRakhunkivAdmin() {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({ class: "all", type: "all" });

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return PLAN_RAKHUNKIV.filter((e) => {
      if (filters.class !== "all" && e.class !== filters.class) return false;
      if (filters.type !== "all" && e.type !== filters.type) return false;
      if (q && !e.name.toLowerCase().includes(q) && !e.code.includes(q)) return false;
      return true;
    });
  }, [search, filters]);

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">План рахунків</h1><p className="text-sm text-muted-foreground">{PLAN_RAKHUNKIV.length} синтетичних рахунків (наказ Мінфіну № 291)</p></div>
      <ContentFilters
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Пошук за кодом або назвою..."
        filters={[
          { key: "class", label: "Клас", options: Object.entries(ACCOUNT_CLASS_LABEL).map(([v, l]) => ({ value: v, label: `${v}. ${l}` })) },
          { key: "type", label: "Тип", options: Object.entries(ACCOUNT_TYPE_LABEL).map(([v, l]) => ({ value: v, label: l })) },
        ]}
        filterValues={filters}
        onFilterChange={(k, v) => setFilters((p) => ({ ...p, [k]: v }))}
        onClearAll={() => { setSearch(""); setFilters({ class: "all", type: "all" }); }}
      />
      <ContentTable data={filtered} columns={columns} />
    </div>
  );
}
