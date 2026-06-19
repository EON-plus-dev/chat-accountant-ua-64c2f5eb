import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { type ColumnDef } from "@tanstack/react-table";
import { INSTITUTION_PROFILES, type FullInstitutionProfile } from "@/portal/data/institutionProfiles";
import ContentTable from "@/admin/components/ContentTable";
import ContentFilters from "@/admin/components/ContentFilters";
import AddInstitutionDialog from "@/admin/components/AddInstitutionDialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Building, Star, Package, CheckCircle, Search } from "lucide-react";

const columns: ColumnDef<FullInstitutionProfile, any>[] = [
  {
    accessorKey: "name",
    header: "Установа",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded flex items-center justify-center text-xs font-bold text-primary-foreground" style={{ backgroundColor: row.original.logo.color }}>
          {row.original.logo.initials}
        </div>
        <div>
          <span className="font-medium text-foreground">{row.original.name}</span>
          {row.original.verified && <CheckCircle className="inline h-3 w-3 text-green-500 ml-1" />}
        </div>
      </div>
    ),
  },
  {
    id: "types",
    header: "Типи",
    cell: ({ row }) => (
      <div className="flex gap-1 flex-wrap max-w-[200px]">
        {row.original.types.slice(0, 2).map((t) => <Badge key={t} variant="outline" className="text-[10px]">{t}</Badge>)}
        {row.original.types.length > 2 && <span className="text-[10px] text-muted-foreground">+{row.original.types.length - 2}</span>}
      </div>
    ),
  },
  {
    id: "foundedYear",
    header: "Рік заснування",
    cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.original.company.foundedYear}</span>,
  },
  {
    id: "products",
    header: "Продуктів",
    cell: ({ row }) => <Badge variant="secondary">{row.original.products?.length ?? 0}</Badge>,
  },
  {
    id: "seo",
    header: "SEO",
    cell: ({ row }) => {
      const p = row.original as any;
      const hasSeoTitle = !!p.seoTitle;
      const hasSeoDesc = !!p.seoDescription;
      if (hasSeoTitle && hasSeoDesc) return <Badge className="bg-green-500/15 text-green-600 border-green-500/30 text-[10px]">✓ SEO</Badge>;
      if (hasSeoTitle || hasSeoDesc) return <Badge className="bg-amber-500/15 text-amber-600 border-amber-500/30 text-[10px]">Частково</Badge>;
      return <Badge className="bg-destructive/15 text-destructive border-destructive/30 text-[10px]"><Search className="h-2.5 w-2.5 mr-0.5" />Немає</Badge>;
    },
  },
  {
    id: "legalStatus",
    header: "Статус",
    cell: ({ row }) => (
      <Badge variant={row.original.legal.status === "active" ? "default" : "destructive"}>
        {row.original.legal.status === "active" ? "Активна" : row.original.legal.status}
      </Badge>
    ),
  },
];

export default function InstitutionProfilesAdmin() {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [localProfiles, setLocalProfiles] = useState<FullInstitutionProfile[]>([...INSTITUTION_PROFILES]);
  const navigate = useNavigate();

  const allTypes = useMemo(() => [...new Set(localProfiles.flatMap((p) => p.types))].sort(), [localProfiles]);

  const filtered = useMemo(() => {
    let result = [...localProfiles];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((p) => p.name.toLowerCase().includes(q) || p.types.some((t) => t.toLowerCase().includes(q)));
    }
    if (filters.type && filters.type !== "all") result = result.filter((p) => p.types.includes(filters.type));
    if (filters.status === "active") result = result.filter((p) => p.legal.status === "active");
    if (filters.status === "other") result = result.filter((p) => p.legal.status !== "active");
    if (filters.verified === "yes") result = result.filter((p) => p.verified);
    if (filters.verified === "no") result = result.filter((p) => !p.verified);
    if (filters.seo === "yes") result = result.filter((p) => (p as any).seoTitle && (p as any).seoDescription);
    if (filters.seo === "no") result = result.filter((p) => !(p as any).seoTitle || !(p as any).seoDescription);
    return result;
  }, [search, filters, localProfiles]);

  const handleAddProfile = (profile: FullInstitutionProfile) => {
    setLocalProfiles(prev => [profile, ...prev]);
  };



  const verifiedCount = localProfiles.filter((p) => p.verified).length;
  const totalProducts = localProfiles.reduce((s, p) => s + (p.products?.length ?? 0), 0);
  const seoFilledCount = localProfiles.filter((p) => (p as any).seoTitle && (p as any).seoDescription).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Профілі установ</h1>
          <p className="text-muted-foreground text-sm mt-1">{localProfiles.length} детальних профілів · SEO: {seoFilledCount}/{localProfiles.length}</p>
        </div>
        <AddInstitutionDialog onAdd={handleAddProfile} existingTypes={allTypes} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="p-2 rounded-lg bg-primary/10"><Building className="h-5 w-5 text-primary" /></div><div><p className="text-2xl font-bold text-foreground">{localProfiles.length}</p><p className="text-xs text-muted-foreground">Установ</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="p-2 rounded-lg bg-primary/10"><CheckCircle className="h-5 w-5 text-primary" /></div><div><p className="text-2xl font-bold text-foreground">{verifiedCount}</p><p className="text-xs text-muted-foreground">Верифікованих</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="p-2 rounded-lg bg-primary/10"><Package className="h-5 w-5 text-primary" /></div><div><p className="text-2xl font-bold text-foreground">{totalProducts}</p><p className="text-xs text-muted-foreground">Продуктів</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="p-2 rounded-lg bg-primary/10"><Star className="h-5 w-5 text-primary" /></div><div><p className="text-2xl font-bold text-foreground">{new Set(localProfiles.flatMap((p) => p.types)).size}</p><p className="text-xs text-muted-foreground">Типів послуг</p></div></CardContent></Card>
      </div>

      <ContentFilters
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Пошук установ..."
        filters={[
          { key: "type", label: "Тип послуг", options: allTypes.map((t) => ({ value: t, label: t })) },
          { key: "status", label: "Статус", options: [{ value: "active", label: "Активна" }, { value: "other", label: "Неактивна" }] },
          { key: "verified", label: "Верифікація", options: [{ value: "yes", label: "Верифіковані" }, { value: "no", label: "Не верифіковані" }] },
          { key: "seo", label: "SEO", options: [{ value: "yes", label: "Заповнено" }, { value: "no", label: "Не заповнено" }] },
        ]}
        filterValues={filters}
        onFilterChange={(k, v) => setFilters((p) => ({ ...p, [k]: v }))}
        onClearAll={() => { setSearch(""); setFilters({}); }}
      />

      <ContentTable columns={columns} data={filtered} onRowClick={(row) => navigate(`/admin/content/institution/${row.slug}`)} />
    </div>
  );
}