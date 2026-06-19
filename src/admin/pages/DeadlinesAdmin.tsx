import { useState, useMemo } from "react";
import { DEADLINES } from "@/portal/data/deadlines";
import ContentTable from "@/admin/components/ContentTable";
import ContentFilters from "@/admin/components/ContentFilters";
import ContentEditorDrawer from "@/admin/components/ContentEditorDrawer";
import ContentCreatorDialog from "@/admin/components/ContentCreatorDialog";
import { deadlineSchema } from "@/admin/schemas/contentSchemas";
import { Badge } from "@/components/ui/badge";
import type { ColumnDef } from "@tanstack/react-table";
import type { Deadline } from "@/portal/data/deadlines";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AlertTriangle, CalendarDays } from "lucide-react";

const TAX_TYPE_LABELS: Record<string, string> = {
  fop1: "ФОП 1-2", fop2: "ФОП 2", fop3: "ФОП 3", tov: "ТОВ", all: "Всі",
};

const columns: ColumnDef<Deadline, any>[] = [
  { accessorKey: "date", header: "Дата", cell: ({ row }) => <span className="font-medium whitespace-nowrap">{row.original.date}</span> },
  { accessorKey: "title", header: "Назва", cell: ({ row }) => (
    <div className="flex items-center gap-2">
      {row.original.isCritical && <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />}
      <span className="text-sm">{row.original.title}</span>
    </div>
  )},
  { accessorKey: "type", header: "Тип", cell: ({ row }) => <Badge variant={row.original.type === "payment" ? "default" : "secondary"} className="text-xs">{row.original.type === "payment" ? "Оплата" : "Звіт"}</Badge> },
  { accessorKey: "taxType", header: "Платник", cell: ({ row }) => <Badge variant="outline" className="text-xs">{TAX_TYPE_LABELS[row.original.taxType] || row.original.taxType}</Badge> },
  { accessorKey: "quarter", header: "Q", cell: ({ row }) => <span className="text-muted-foreground text-sm">Q{row.original.quarter}</span> },
  { accessorKey: "daysLeft", header: "Днів", cell: ({ row }) => {
    const d = row.original;
    const color = d.urgency === "urgent" ? "text-destructive font-bold" : d.urgency === "upcoming" ? "text-yellow-600 dark:text-yellow-400 font-medium" : "text-muted-foreground";
    return <span className={`text-sm ${color}`}>{d.daysLeft < 0 ? "Минув" : d.daysLeft}</span>;
  }},
  { id: "penalty", header: "Штраф", enableSorting: false, cell: ({ row }) => (
    <TooltipProvider><Tooltip><TooltipTrigger asChild><span className="text-xs text-muted-foreground cursor-help underline decoration-dotted">{row.original.legalBasis}</span></TooltipTrigger><TooltipContent><p>{row.original.penalty}</p></TooltipContent></Tooltip></TooltipProvider>
  )},
];

export default function DeadlinesAdmin() {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({ quarter: "all", type: "all", taxType: "all" });
  const [selectedItem, setSelectedItem] = useState<Deadline | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const filtered = useMemo(() => {
    return DEADLINES.filter(d => {
      if (filters.quarter !== "all" && String(d.quarter) !== filters.quarter) return false;
      if (filters.type !== "all" && d.type !== filters.type) return false;
      if (filters.taxType !== "all" && d.taxType !== filters.taxType) return false;
      return true;
    }).sort((a, b) => a.daysLeft - b.daysLeft);
  }, [filters]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Події / Дедлайни</h1>
          <p className="text-sm text-muted-foreground">{DEADLINES.length} подій у календарі</p>
        </div>
        <ContentCreatorDialog schema={deadlineSchema} title="Додати подію" />
      </div>

      <ContentFilters
        searchValue={search} onSearchChange={setSearch} searchPlaceholder="Пошук подій..."
        filters={[
          { key: "quarter", label: "Квартал", options: [{ value: "1", label: "Q1" }, { value: "2", label: "Q2" }, { value: "3", label: "Q3" }, { value: "4", label: "Q4" }] },
          { key: "type", label: "Тип", options: [{ value: "payment", label: "Оплата" }, { value: "report", label: "Звіт" }] },
          { key: "taxType", label: "Платник", options: [{ value: "fop1", label: "ФОП 1-2" }, { value: "fop3", label: "ФОП 3" }, { value: "all", label: "Всі типи" }] },
        ]}
        filterValues={filters}
        onFilterChange={(k, v) => setFilters(prev => ({ ...prev, [k]: v }))}
        onClearAll={() => { setSearch(""); setFilters({ quarter: "all", type: "all", taxType: "all" }); }}
      />

      <ContentTable data={filtered} columns={columns} globalFilter={search} pageSize={20}
        onRowClick={(row) => { setSelectedItem(row); setDrawerOpen(true); }}
      />

      <ContentEditorDrawer open={drawerOpen} onOpenChange={setDrawerOpen} data={selectedItem} schema={deadlineSchema} title="Подія" />
    </div>
  );
}
