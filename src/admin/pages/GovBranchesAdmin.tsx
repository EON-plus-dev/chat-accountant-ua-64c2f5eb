import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import ContentTable from "@/admin/components/ContentTable";
import ContentFilters from "@/admin/components/ContentFilters";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Plus, X } from "lucide-react";
import { useUpsertBranch, useDeleteBranch } from "@/admin/hooks/useGovAdmin";
import type { ColumnDef } from "@tanstack/react-table";
import type { Tables } from "@/integrations/supabase/types";
import { format } from "date-fns";

type Branch = Tables<'gov_branches'>;

const AGENCY_OPTIONS = [
  { value: "dps", label: "ДПС" },
  { value: "pfu", label: "ПФУ" },
  { value: "cnap", label: "ЦНАП" },
  { value: "dracs", label: "ДРАЦС" },
  { value: "courts", label: "Суди" },
];

const STATUS_OPTIONS = [
  { value: "active", label: "Активний" },
  { value: "temporarily_closed", label: "Тимчасово зачинений" },
  { value: "destroyed", label: "Зруйнований" },
];

const TYPE_OPTIONS = [
  { value: "main", label: "Головний" },
  { value: "regional", label: "Обласний" },
  { value: "district", label: "Районний" },
  { value: "cnap", label: "ЦНАП" },
  { value: "court", label: "Суд" },
  { value: "other", label: "Інший" },
];

const STATUS_COLORS: Record<string, string> = {
  active: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30",
  temporarily_closed: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30",
  destroyed: "bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/30",
};

const columns: ColumnDef<Branch, any>[] = [
  { accessorKey: "name", header: "Назва", cell: ({ row }) => <span className="font-medium text-sm line-clamp-1">{row.original.name}</span> },
  { accessorKey: "agency_slug", header: "Орган", cell: ({ row }) => <Badge variant="outline" className="text-xs">{AGENCY_OPTIONS.find(a => a.value === row.original.agency_slug)?.label ?? row.original.agency_slug}</Badge> },
  { accessorKey: "city", header: "Місто", cell: ({ row }) => <span className="text-sm">{row.original.city}</span> },
  { accessorKey: "status", header: "Статус", cell: ({ row }) => <Badge className={`text-xs ${STATUS_COLORS[row.original.status] || ""}`}>{STATUS_OPTIONS.find(s => s.value === row.original.status)?.label}</Badge> },
  { accessorKey: "phones", header: "Телефон", enableSorting: false, cell: ({ row }) => <span className="text-xs text-muted-foreground">{row.original.phones?.[0] || "—"}</span> },
  { accessorKey: "updated_at", header: "Оновлено", cell: ({ row }) => <span className="text-xs text-muted-foreground">{format(new Date(row.original.updated_at), "dd.MM.yy")}</span> },
];

const emptyBranch: Partial<Branch> = {
  name: "", agency_slug: "dps", branch_type: "regional", region: "", city: "", address: "",
  status: "active", phones: [], email: "", website: "", working_hours: { weekdays: "09:00–18:00", saturday: null, sunday: null },
  is_open_24h: false, has_queue_system: false, has_accessibility: false,
};

export default function GovBranchesAdmin() {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({ agency: "all", status: "all" });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<Branch> | null>(null);

  const { data: branches = [], isLoading } = useQuery({
    queryKey: ['gov-branches', 'admin'],
    queryFn: async () => {
      const { data, error } = await supabase.from('gov_branches').select('*').order('city');
      if (error) throw error;
      return data as Branch[];
    },
  });

  const upsert = useUpsertBranch();
  const deleteMut = useDeleteBranch();

  const cities = useMemo(() => {
    const set = new Set(branches.map(b => b.city));
    return Array.from(set).sort();
  }, [branches]);

  const filtered = useMemo(() => {
    return branches.filter(b => {
      if (filters.agency !== "all" && b.agency_slug !== filters.agency) return false;
      if (filters.status !== "all" && b.status !== filters.status) return false;
      if (filters.city && filters.city !== "all" && b.city !== filters.city) return false;
      if (search) {
        const q = search.toLowerCase();
        return b.name.toLowerCase().includes(q) || b.city.toLowerCase().includes(q) || b.address.toLowerCase().includes(q);
      }
      return true;
    });
  }, [branches, filters, search]);

  const openEdit = (branch: Branch) => { setEditing({ ...branch }); setDialogOpen(true); };
  const openCreate = () => { setEditing({ ...emptyBranch }); setDialogOpen(true); };

  const handleSave = () => {
    if (!editing?.name || !editing?.city || !editing?.region || !editing?.address) return;
    upsert.mutate(editing as any, { onSuccess: () => setDialogOpen(false) });
  };

  const handleDelete = () => {
    if (!editing?.id || !confirm("Видалити відділення?")) return;
    deleteMut.mutate(editing.id, { onSuccess: () => setDialogOpen(false) });
  };

  const updateField = (key: string, value: any) => setEditing(prev => prev ? { ...prev, [key]: value } : prev);
  const wh = (editing?.working_hours as any) || {};

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Відділення держорганів</h1>
          <p className="text-sm text-muted-foreground">{branches.length} відділень у базі</p>
        </div>
        <Button onClick={openCreate} size="sm"><Plus className="h-4 w-4 mr-1" />Додати</Button>
      </div>

      <ContentFilters
        searchValue={search} onSearchChange={setSearch} searchPlaceholder="Пошук по назві, місту..."
        filters={[
          { key: "agency", label: "Орган", options: AGENCY_OPTIONS },
          { key: "status", label: "Статус", options: STATUS_OPTIONS },
          { key: "city", label: "Місто", options: cities.slice(0, 30).map(c => ({ value: c, label: c })) },
        ]}
        filterValues={filters}
        onFilterChange={(k, v) => setFilters(prev => ({ ...prev, [k]: v }))}
        onClearAll={() => { setSearch(""); setFilters({ agency: "all", status: "all" }); }}
      />

      {isLoading ? <p className="text-sm text-muted-foreground">Завантаження...</p> : (
        <ContentTable data={filtered} columns={columns} globalFilter={search} onRowClick={openEdit} />
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Редагувати відділення" : "Нове відділення"}</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Назва *</Label><Input value={editing.name || ""} onChange={e => updateField("name", e.target.value)} /></div>
                <div><Label>Орган *</Label>
                  <Select value={editing.agency_slug || ""} onValueChange={v => updateField("agency_slug", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{AGENCY_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div><Label>Тип</Label>
                  <Select value={editing.branch_type || "regional"} onValueChange={v => updateField("branch_type", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{TYPE_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Статус</Label>
                  <Select value={editing.status || "active"} onValueChange={v => updateField("status", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{STATUS_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Регіон *</Label><Input value={editing.region || ""} onChange={e => updateField("region", e.target.value)} /></div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div><Label>Місто *</Label><Input value={editing.city || ""} onChange={e => updateField("city", e.target.value)} /></div>
                <div><Label>Район</Label><Input value={editing.district || ""} onChange={e => updateField("district", e.target.value)} /></div>
                <div><Label>Адреса *</Label><Input value={editing.address || ""} onChange={e => updateField("address", e.target.value)} /></div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div><Label>Email</Label><Input value={editing.email || ""} onChange={e => updateField("email", e.target.value)} /></div>
                <div><Label>Сайт</Label><Input value={editing.website || ""} onChange={e => updateField("website", e.target.value)} /></div>
              </div>

              <div>
                <Label>Телефони</Label>
                <div className="space-y-1">
                  {(editing.phones || []).map((p, i) => (
                    <div key={i} className="flex gap-2">
                      <Input value={p} onChange={e => { const arr = [...(editing.phones || [])]; arr[i] = e.target.value; updateField("phones", arr); }} />
                      <Button variant="ghost" size="icon" onClick={() => { const arr = (editing.phones || []).filter((_, j) => j !== i); updateField("phones", arr); }}><X className="h-4 w-4" /></Button>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" onClick={() => updateField("phones", [...(editing.phones || []), ""])}><Plus className="h-3 w-3 mr-1" />Додати</Button>
                </div>
              </div>

              <div className="border rounded-lg p-3 space-y-2">
                <Label className="font-medium">Графік роботи</Label>
                <div className="grid grid-cols-3 gap-3">
                  <div><Label className="text-xs">Будні</Label><Input value={wh.weekdays || ""} placeholder="09:00–18:00" onChange={e => updateField("working_hours", { ...wh, weekdays: e.target.value || null })} /></div>
                  <div><Label className="text-xs">Субота</Label><Input value={wh.saturday || ""} placeholder="Вихідний" onChange={e => updateField("working_hours", { ...wh, saturday: e.target.value || null })} /></div>
                  <div><Label className="text-xs">Неділя</Label><Input value={wh.sunday || ""} placeholder="Вихідний" onChange={e => updateField("working_hours", { ...wh, sunday: e.target.value || null })} /></div>
                </div>
                <div className="flex gap-4 pt-1">
                  <label className="flex items-center gap-2 text-sm"><Checkbox checked={editing.is_open_24h || false} onCheckedChange={v => updateField("is_open_24h", !!v)} />Цілодобово</label>
                  <label className="flex items-center gap-2 text-sm"><Checkbox checked={editing.has_queue_system || false} onCheckedChange={v => updateField("has_queue_system", !!v)} />Система черг</label>
                  <label className="flex items-center gap-2 text-sm"><Checkbox checked={editing.has_accessibility || false} onCheckedChange={v => updateField("has_accessibility", !!v)} />Доступність</label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div><Label>Керівник</Label><Input value={editing.head_name || ""} onChange={e => updateField("head_name", e.target.value)} /></div>
                <div><Label>Посада</Label><Input value={editing.head_position || ""} onChange={e => updateField("head_position", e.target.value)} /></div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div><Label>Lat</Label><Input type="number" value={editing.lat ?? ""} onChange={e => updateField("lat", e.target.value ? +e.target.value : null)} /></div>
                <div><Label>Lng</Label><Input type="number" value={editing.lng ?? ""} onChange={e => updateField("lng", e.target.value ? +e.target.value : null)} /></div>
                <div><Label>Map URL</Label><Input value={editing.map_url || ""} onChange={e => updateField("map_url", e.target.value)} /></div>
              </div>

              <div><Label>Примітка (війна)</Label><Textarea value={editing.war_note || ""} onChange={e => updateField("war_note", e.target.value)} rows={2} /></div>

              <div className="flex justify-between pt-2">
                {editing.id && <Button variant="destructive" size="sm" onClick={handleDelete}>Видалити</Button>}
                <div className="flex gap-2 ml-auto">
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>Скасувати</Button>
                  <Button onClick={handleSave} disabled={upsert.isPending}>{upsert.isPending ? "Збереження..." : "Зберегти"}</Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
