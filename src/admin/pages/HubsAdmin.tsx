import { useState, useMemo } from "react";
import { HUBS } from "@/portal/data/hubs";
import ContentTable from "@/admin/components/ContentTable";
import ContentFilters from "@/admin/components/ContentFilters";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { type ColumnDef } from "@tanstack/react-table";
import type { HubConfig } from "@/portal/types/hub";
import ContentEditorDrawer from "@/admin/components/ContentEditorDrawer";
import { hubViewSchema } from "@/admin/schemas/contentSchemas";
import { Globe, Layers, CreditCard } from "lucide-react";

const columns: ColumnDef<HubConfig, any>[] = [
  { accessorKey: "title", header: "Назва", cell: ({ row }) => <span className="font-medium">{row.original.title}</span> },
  { accessorKey: "slug", header: "Slug", cell: ({ row }) => <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{row.original.slug}</code> },
  { id: "sections", header: "Секцій", cell: ({ row }) => <Badge variant="outline">{row.original.sections.length}</Badge> },
  { id: "anchors", header: "Anchor cards", cell: ({ row }) => <Badge variant="outline">{row.original.anchorCards?.length ?? 0}</Badge> },
  { accessorKey: "featuredArticleSlug", header: "Featured article", cell: ({ row }) => <span className="text-xs text-muted-foreground">{row.original.featuredArticleSlug || "—"}</span> },
  { accessorKey: "updatedAt", header: "Оновлено" },
];

export default function HubsAdmin() {
  const [search, setSearch] = useState("");
  const [selectedItem, setSelectedItem] = useState<HubConfig | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const totalSections = useMemo(() => HUBS.reduce((s, h) => s + h.sections.length, 0), []);
  const totalAnchors = useMemo(() => HUBS.reduce((s, h) => s + (h.anchorCards?.length ?? 0), 0), []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Тематичні розділи</h1>
          <p className="text-sm text-muted-foreground">{HUBS.length} розділів</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10"><Globe className="h-5 w-5 text-primary" /></div>
            <div>
              <p className="text-2xl font-bold">{HUBS.length}</p>
              <p className="text-xs text-muted-foreground">Розділів</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10"><Layers className="h-5 w-5 text-primary" /></div>
            <div>
              <p className="text-2xl font-bold">{totalSections}</p>
              <p className="text-xs text-muted-foreground">Секцій</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10"><CreditCard className="h-5 w-5 text-primary" /></div>
            <div>
              <p className="text-2xl font-bold">{totalAnchors}</p>
              <p className="text-xs text-muted-foreground">Anchor cards</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <ContentFilters
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Пошук розділів..."
        filters={[]}
        filterValues={{}}
        onFilterChange={() => {}}
        onClearAll={() => setSearch("")}
      />

      <ContentTable data={HUBS} columns={columns} globalFilter={search} onRowClick={(row) => { setSelectedItem(row); setDrawerOpen(true); }} />

      <ContentEditorDrawer open={drawerOpen} onOpenChange={setDrawerOpen} data={selectedItem} schema={hubViewSchema} title="Розділ" />
    </div>
  );
}
