import { useState, useMemo } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import {
  BUDGET_ACCOUNTS,
  BUDGET_TAX_LABEL,
  BUDGET_REGION_LABEL,
  type BudgetAccountEntry,
} from "@/portal/data/budgetAccounts";
import ContentTable from "@/admin/components/ContentTable";
import ContentFilters from "@/admin/components/ContentFilters";
import { Badge } from "@/components/ui/badge";

const columns: ColumnDef<BudgetAccountEntry, any>[] = [
  {
    accessorKey: "title",
    header: "Рахунок",
    cell: ({ row }) => (
      <div>
        <div className="font-semibold text-sm">{row.original.title}</div>
        <div className="text-xs text-muted-foreground line-clamp-1 font-mono">{row.original.iban}</div>
      </div>
    ),
  },
  {
    accessorKey: "taxType",
    header: "Податок",
    cell: ({ row }) => (
      <Badge variant="default" className="text-[10px]">
        {BUDGET_TAX_LABEL[row.original.taxType]}
      </Badge>
    ),
  },
  {
    accessorKey: "region",
    header: "Регіон",
    cell: ({ row }) => (
      <Badge variant="outline" className="text-[10px]">
        {BUDGET_REGION_LABEL[row.original.region]}
      </Badge>
    ),
  },
  {
    accessorKey: "asOf",
    header: "Актуально на",
    cell: ({ row }) => <span className="font-mono text-xs">{row.original.asOf}</span>,
  },
];

export default function BudgetAccountsAdmin() {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({ taxType: "all", region: "all" });

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return BUDGET_ACCOUNTS.filter((a) => {
      if (filters.taxType !== "all" && a.taxType !== filters.taxType) return false;
      if (filters.region !== "all" && a.region !== filters.region) return false;
      if (q && !a.title.toLowerCase().includes(q) && !a.iban.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [search, filters]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Бюджетні рахунки</h1>
          <p className="text-sm text-muted-foreground">
            {BUDGET_ACCOUNTS.length} рахунків Держказначейства для сплати податків
          </p>
        </div>
      </div>
      <ContentFilters
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Пошук за назвою або IBAN..."
        filters={[
          {
            key: "taxType",
            label: "Податок",
            options: Object.entries(BUDGET_TAX_LABEL).map(([v, l]) => ({ value: v, label: l })),
          },
          {
            key: "region",
            label: "Регіон",
            options: Object.entries(BUDGET_REGION_LABEL).map(([v, l]) => ({ value: v, label: l })),
          },
        ]}
        filterValues={filters}
        onFilterChange={(k, v) => setFilters((p) => ({ ...p, [k]: v }))}
        onClearAll={() => {
          setSearch("");
          setFilters({ taxType: "all", region: "all" });
        }}
      />
      <ContentTable data={filtered} columns={columns} />
    </div>
  );
}
