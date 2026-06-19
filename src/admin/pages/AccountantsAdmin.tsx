import { useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { ACCOUNTANTS, AccountantProfile } from "@/portal/data/accountants";
import ContentTable from "@/admin/components/ContentTable";
import ContentFilters from "@/admin/components/ContentFilters";
import ContentEditorDrawer from "@/admin/components/ContentEditorDrawer";
import ContentCreatorDialog from "@/admin/components/ContentCreatorDialog";
import { accountantSchema } from "@/admin/schemas/contentSchemas";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";

const columns: ColumnDef<AccountantProfile, any>[] = [
  {
    accessorKey: "name",
    header: "Ім'я",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-primary-foreground" style={{ backgroundColor: row.original.initialsColor }}>
          {row.original.initials}
        </div>
        <span className="font-medium">{row.original.name}</span>
      </div>
    ),
  },
  { accessorKey: "city", header: "Місто" },
  {
    accessorKey: "rating",
    header: "Рейтинг",
    cell: ({ row }) => (
      <div className="flex items-center gap-1">
        <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
        <span>{row.original.rating}</span>
        <span className="text-muted-foreground text-xs">({row.original.reviewCount})</span>
      </div>
    ),
  },
  { accessorKey: "experience", header: "Досвід (р.)" },
  { accessorKey: "priceDisplay", header: "Ціна" },
  {
    id: "status",
    header: "Статус",
    cell: ({ row }) => (
      <div className="flex gap-1">
        {row.original.isVerified && <Badge variant="default" className="text-[10px]">Verified</Badge>}
        {row.original.isFintodoCertified && <Badge variant="secondary" className="text-[10px]">Certified</Badge>}
      </div>
    ),
  },
];

export default function AccountantsAdmin() {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [selectedItem, setSelectedItem] = useState<AccountantProfile | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const filtered = ACCOUNTANTS.filter((a) => {
    if (search && !a.name.toLowerCase().includes(search.toLowerCase()) && !a.city.toLowerCase().includes(search.toLowerCase())) return false;
    if (filters.city && filters.city !== "all" && a.city !== filters.city) return false;
    if (filters.certified && filters.certified !== "all") {
      if (filters.certified === "yes" && !a.isFintodoCertified) return false;
      if (filters.certified === "no" && a.isFintodoCertified) return false;
    }
    return true;
  });

  const cities = [...new Set(ACCOUNTANTS.map((a) => a.city))];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Бухгалтери</h1>
          <p className="text-muted-foreground">{ACCOUNTANTS.length} профілів</p>
        </div>
        <ContentCreatorDialog schema={accountantSchema} title="Новий бухгалтер" />
      </div>
      <ContentFilters
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Пошук за ім'ям або містом..."
        filters={[
          { key: "city", label: "Місто", options: cities.map((c) => ({ value: c, label: c })) },
          { key: "certified", label: "Certified", options: [{ value: "yes", label: "Так" }, { value: "no", label: "Ні" }] },
        ]}
        filterValues={filters}
        onFilterChange={(k, v) => setFilters((p) => ({ ...p, [k]: v }))}
        onClearAll={() => { setSearch(""); setFilters({}); }}
      />
      <ContentTable columns={columns} data={filtered} onRowClick={(row) => { setSelectedItem(row); setDrawerOpen(true); }} />
      <ContentEditorDrawer open={drawerOpen} onOpenChange={setDrawerOpen} data={selectedItem} schema={accountantSchema} title="Бухгалтер" />
    </div>
  );
}
