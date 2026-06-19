import { useState, useMemo } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import {
  VIYSKOVYY_OBLIK,
  VIYSKOVYY_TOPIC_LABEL,
  VIYSKOVYY_TOPICS,
  type ViyskovyyEntry,
} from "@/portal/data/viyskovyyOblik";
import ContentTable from "@/admin/components/ContentTable";
import ContentFilters from "@/admin/components/ContentFilters";
import { Badge } from "@/components/ui/badge";

const columns: ColumnDef<ViyskovyyEntry, any>[] = [
  {
    accessorKey: "title",
    header: "Назва",
    cell: ({ row }) => <div className="text-sm font-medium">{row.original.title}</div>,
  },
  {
    accessorKey: "topic",
    header: "Тема",
    cell: ({ row }) => (
      <Badge variant="outline" className="text-[10px]">
        {VIYSKOVYY_TOPIC_LABEL[row.original.topic]}
      </Badge>
    ),
  },
  {
    accessorKey: "audience",
    header: "Аудиторія",
    cell: ({ row }) => <span className="text-xs">{row.original.audience}</span>,
  },
  {
    accessorKey: "legalBasis",
    header: "Підстава",
    cell: ({ row }) => <span className="text-xs text-muted-foreground line-clamp-1">{row.original.legalBasis}</span>,
  },
];

export default function ViyskovyyOblikAdmin() {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({ topic: "all" });

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return VIYSKOVYY_OBLIK.filter((e) => {
      if (filters.topic !== "all" && e.topic !== filters.topic) return false;
      if (q && !e.title.toLowerCase().includes(q) && !e.summary.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [search, filters]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Військовий облік</h1>
        <p className="text-sm text-muted-foreground">{VIYSKOVYY_OBLIK.length} матеріалів</p>
      </div>
      <ContentFilters
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Пошук за назвою або змістом..."
        filters={[
          {
            key: "topic",
            label: "Тема",
            options: VIYSKOVYY_TOPICS.map((t) => ({ value: t, label: VIYSKOVYY_TOPIC_LABEL[t] })),
          },
        ]}
        filterValues={filters}
        onFilterChange={(k, v) => setFilters((p) => ({ ...p, [k]: v }))}
        onClearAll={() => {
          setSearch("");
          setFilters({ topic: "all" });
        }}
      />
      <ContentTable data={filtered} columns={columns} />
    </div>
  );
}
