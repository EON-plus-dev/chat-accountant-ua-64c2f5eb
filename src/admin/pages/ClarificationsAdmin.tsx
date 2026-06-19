import { useState, useMemo } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import {
  CLARIFICATIONS,
  CLARIFICATION_KIND_LABEL,
  CLARIFICATION_TOPIC_LABEL,
  CLARIFICATION_STATUS_LABEL,
  type ClarificationEntry,
} from "@/portal/data/taxClarifications";
import ContentTable from "@/admin/components/ContentTable";
import ContentFilters from "@/admin/components/ContentFilters";
import { Badge } from "@/components/ui/badge";

const columns: ColumnDef<ClarificationEntry, any>[] = [
  {
    accessorKey: "title",
    header: "Назва",
    cell: ({ row }) => <span className="font-semibold text-sm line-clamp-2">{row.original.title}</span>,
  },
  {
    accessorKey: "docNumber",
    header: "Номер",
    cell: ({ row }) => <span className="font-mono text-xs">{row.original.docNumber}</span>,
  },
  {
    accessorKey: "docDate",
    header: "Дата",
    cell: ({ row }) => <span className="text-xs">{row.original.docDate}</span>,
  },
  {
    accessorKey: "kind",
    header: "Тип",
    cell: ({ row }) => (
      <Badge variant="outline" className="text-[10px]">
        {CLARIFICATION_KIND_LABEL[row.original.kind]}
      </Badge>
    ),
  },
  {
    accessorKey: "topic",
    header: "Тема",
    cell: ({ row }) => (
      <Badge variant="secondary" className="text-[10px]">
        {CLARIFICATION_TOPIC_LABEL[row.original.topic]}
      </Badge>
    ),
  },
  {
    accessorKey: "status",
    header: "Статус",
    cell: ({ row }) => (
      <Badge className="text-[10px]">{CLARIFICATION_STATUS_LABEL[row.original.status]}</Badge>
    ),
  },
];

export default function ClarificationsAdmin() {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({
    kind: "all",
    topic: "all",
    status: "all",
  });

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return CLARIFICATIONS.filter((c) => {
      if (filters.kind !== "all" && c.kind !== filters.kind) return false;
      if (filters.topic !== "all" && c.topic !== filters.topic) return false;
      if (filters.status !== "all" && c.status !== filters.status) return false;
      if (q && !c.title.toLowerCase().includes(q) && !c.docNumber.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [search, filters]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Розʼяснення ДПС</h1>
          <p className="text-sm text-muted-foreground">
            {CLARIFICATIONS.length} ІПК, ЗІР та листів — офіційні позиції контролюючих органів
          </p>
        </div>
      </div>
      <ContentFilters
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Пошук за назвою або номером ІПК..."
        filters={[
          {
            key: "kind",
            label: "Тип",
            options: Object.entries(CLARIFICATION_KIND_LABEL).map(([v, l]) => ({ value: v, label: l })),
          },
          {
            key: "topic",
            label: "Тема",
            options: Object.entries(CLARIFICATION_TOPIC_LABEL).map(([v, l]) => ({ value: v, label: l })),
          },
          {
            key: "status",
            label: "Статус",
            options: Object.entries(CLARIFICATION_STATUS_LABEL).map(([v, l]) => ({ value: v, label: l })),
          },
        ]}
        filterValues={filters}
        onFilterChange={(k, v) => setFilters((p) => ({ ...p, [k]: v }))}
        onClearAll={() => {
          setSearch("");
          setFilters({ kind: "all", topic: "all", status: "all" });
        }}
      />
      <ContentTable data={filtered} columns={columns} />
    </div>
  );
}
