import { useState, useMemo } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { COURT_CASES, COURT_TOPIC_LABEL, COURT_INSTANCE_LABEL, COURT_OUTCOME_LABEL, type CourtCaseEntry } from "@/portal/data/courtCases";
import ContentTable from "@/admin/components/ContentTable";
import ContentFilters from "@/admin/components/ContentFilters";
import { Badge } from "@/components/ui/badge";

const columns: ColumnDef<CourtCaseEntry, any>[] = [
  {
    accessorKey: "title",
    header: "Назва справи",
    cell: ({ row }) => <span className="font-semibold text-sm line-clamp-2">{row.original.title}</span>,
  },
  {
    accessorKey: "caseNumber",
    header: "Номер",
    cell: ({ row }) => <span className="font-mono text-xs">{row.original.caseNumber}</span>,
  },
  { accessorKey: "decisionDate", header: "Дата", cell: ({ row }) => <span className="text-xs">{row.original.decisionDate}</span> },
  {
    accessorKey: "topic",
    header: "Тема",
    cell: ({ row }) => <Badge variant="outline" className="text-[10px]">{COURT_TOPIC_LABEL[row.original.topic]}</Badge>,
  },
  {
    accessorKey: "instance",
    header: "Інстанція",
    cell: ({ row }) => <Badge variant="secondary" className="text-[10px]">{COURT_INSTANCE_LABEL[row.original.instance]}</Badge>,
  },
  {
    accessorKey: "outcome",
    header: "Результат",
    cell: ({ row }) => <Badge className="text-[10px]">{COURT_OUTCOME_LABEL[row.original.outcome]}</Badge>,
  },
];

export default function CourtCasesAdmin() {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({ topic: "all", outcome: "all" });

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return COURT_CASES.filter((c) => {
      if (filters.topic !== "all" && c.topic !== filters.topic) return false;
      if (filters.outcome !== "all" && c.outcome !== filters.outcome) return false;
      if (q && !c.title.toLowerCase().includes(q) && !c.caseNumber.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [search, filters]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Судова практика</h1>
          <p className="text-sm text-muted-foreground">{COURT_CASES.length} рішень з ЄДРСР</p>
        </div>
      </div>
      <ContentFilters
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Пошук за назвою або номером справи..."
        filters={[
          { key: "topic", label: "Тема", options: Object.entries(COURT_TOPIC_LABEL).map(([v, l]) => ({ value: v, label: l })) },
          { key: "outcome", label: "Результат", options: Object.entries(COURT_OUTCOME_LABEL).map(([v, l]) => ({ value: v, label: l })) },
        ]}
        filterValues={filters}
        onFilterChange={(k, v) => setFilters((p) => ({ ...p, [k]: v }))}
        onClearAll={() => { setSearch(""); setFilters({ topic: "all", outcome: "all" }); }}
      />
      <ContentTable data={filtered} columns={columns} />
    </div>
  );
}
