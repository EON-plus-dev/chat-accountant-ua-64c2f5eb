import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { GRANTS, GRANT_STATUS_MAP, GRANT_TYPE_MAP } from "@/portal/data/grants";
import ContentTable from "@/admin/components/ContentTable";
import ContentFilters from "@/admin/components/ContentFilters";
import { Badge } from "@/components/ui/badge";
import { type ColumnDef } from "@tanstack/react-table";
import type { GrantEntry } from "@/portal/data/grants";
import ContentCreatorDialog from "@/admin/components/ContentCreatorDialog";
import { grantSchema } from "@/admin/schemas/contentSchemas";

const statusColor: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-800",
  upcoming: "bg-amber-100 text-amber-800",
  announced: "bg-blue-100 text-blue-800",
  closed: "bg-muted text-muted-foreground",
};

const columns: ColumnDef<GrantEntry, any>[] = [
  { accessorKey: "name", header: "Назва", cell: ({ row }) => <span className="font-medium">{row.original.name}</span> },
  { accessorKey: "organization", header: "Організація" },
  {
    accessorKey: "type", header: "Тип",
    cell: ({ row }) => <Badge variant="outline">{GRANT_TYPE_MAP[row.original.type] || row.original.type}</Badge>,
  },
  { accessorKey: "amount", header: "Сума" },
  { accessorKey: "deadline", header: "Дедлайн" },
  {
    accessorKey: "status", header: "Статус",
    cell: ({ row }) => (
      <Badge className={statusColor[row.original.status] || ""}>
        {GRANT_STATUS_MAP[row.original.status] || row.original.status}
      </Badge>
    ),
  },
];

export default function GrantsAdmin() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({ type: "all", status: "all" });

  const filtered = useMemo(() => {
    let items = GRANTS;
    if (filters.type !== "all") items = items.filter((g) => g.type === filters.type);
    if (filters.status !== "all") items = items.filter((g) => g.status === filters.status);
    return items;
  }, [filters]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Гранти та програми</h1>
          <p className="text-sm text-muted-foreground">{GRANTS.length} записів</p>
        </div>
        <ContentCreatorDialog schema={grantSchema} title="Додати грант" />
      </div>

      <ContentFilters
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Пошук грантів..."
        filters={[
          { key: "type", label: "Тип", options: [
            { value: "grant", label: "Грант" },
            { value: "loan", label: "Кредит" },
            { value: "guarantee", label: "Гарантія" },
            { value: "technical_assistance", label: "Тех. допомога" },
          ]},
          { key: "status", label: "Статус", options: [
            { value: "active", label: "Активний" },
            { value: "upcoming", label: "Скоро" },
            { value: "closed", label: "Завершений" },
          ]},
        ]}
        filterValues={filters}
        onFilterChange={(k, v) => setFilters((p) => ({ ...p, [k]: v }))}
        onClearAll={() => { setSearch(""); setFilters({ type: "all", status: "all" }); }}
      />

      <ContentTable
        data={filtered}
        columns={columns}
        globalFilter={search}
        onRowClick={(row) => navigate(`/admin/content/grant/${row.slug}`)}
      />
    </div>
  );
}
