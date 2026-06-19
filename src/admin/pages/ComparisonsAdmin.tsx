import { useState, useMemo } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { COMPARISONS } from "@/portal/data/comparisons";
import ContentTable from "@/admin/components/ContentTable";
import ContentFilters from "@/admin/components/ContentFilters";
import ContentEditorDrawer from "@/admin/components/ContentEditorDrawer";
import ContentCreatorDialog from "@/admin/components/ContentCreatorDialog";
import { comparisonSchema } from "@/admin/schemas/contentSchemas";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeftRight, ThumbsUp, ThumbsDown } from "lucide-react";

const comparisonsArray = Object.entries(COMPARISONS).map(([key, val]) => ({ id: key, ...val }));
type ComparisonRow = typeof comparisonsArray[0];

const columns: ColumnDef<ComparisonRow, any>[] = [
  { accessorKey: "id", header: "Slug" },
  { accessorKey: "leftTitle", header: "Ліва сторона" },
  { accessorKey: "rightTitle", header: "Права сторона" },
  {
    id: "leftItems",
    header: "Ліві пункти",
    cell: ({ row }) => (
      <div className="flex gap-1">
        <Badge variant="default" className="text-[10px]">{row.original.leftItems.filter((i: any) => i.type === "pro").length} pro</Badge>
        <Badge variant="destructive" className="text-[10px]">{row.original.leftItems.filter((i: any) => i.type === "con").length} con</Badge>
      </div>
    ),
  },
  {
    id: "rightItems",
    header: "Праві пункти",
    cell: ({ row }) => (
      <div className="flex gap-1">
        <Badge variant="default" className="text-[10px]">{row.original.rightItems.filter((i: any) => i.type === "pro").length} pro</Badge>
        <Badge variant="destructive" className="text-[10px]">{row.original.rightItems.filter((i: any) => i.type === "con").length} con</Badge>
      </div>
    ),
  },
];

export default function ComparisonsAdmin() {
  const [search, setSearch] = useState("");
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const totalPros = useMemo(() => comparisonsArray.reduce((s, c) =>
    s + c.leftItems.filter((i: any) => i.type === "pro").length + c.rightItems.filter((i: any) => i.type === "pro").length, 0), []);
  const totalCons = useMemo(() => comparisonsArray.reduce((s, c) =>
    s + c.leftItems.filter((i: any) => i.type === "con").length + c.rightItems.filter((i: any) => i.type === "con").length, 0), []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Порівняння</h1>
          <p className="text-muted-foreground">{comparisonsArray.length} записів</p>
        </div>
        <ContentCreatorDialog schema={comparisonSchema} title="Нове порівняння" />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10"><ArrowLeftRight className="h-5 w-5 text-primary" /></div>
            <div>
              <p className="text-2xl font-bold">{comparisonsArray.length}</p>
              <p className="text-xs text-muted-foreground">Порівнянь</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10"><ThumbsUp className="h-5 w-5 text-emerald-600" /></div>
            <div>
              <p className="text-2xl font-bold">{totalPros}</p>
              <p className="text-xs text-muted-foreground">Pro аргументів</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-destructive/10"><ThumbsDown className="h-5 w-5 text-destructive" /></div>
            <div>
              <p className="text-2xl font-bold">{totalCons}</p>
              <p className="text-xs text-muted-foreground">Con аргументів</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <ContentFilters
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Пошук порівнянь..."
        filters={[]}
        filterValues={{}}
        onFilterChange={() => {}}
        onClearAll={() => setSearch("")}
      />

      <ContentTable columns={columns} data={comparisonsArray} globalFilter={search} onRowClick={(row) => { setSelectedItem(row); setDrawerOpen(true); }} />
      <ContentEditorDrawer open={drawerOpen} onOpenChange={setDrawerOpen} data={selectedItem} schema={comparisonSchema} title="Порівняння" />
    </div>
  );
}
