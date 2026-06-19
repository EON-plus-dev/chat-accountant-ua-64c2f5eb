import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import ContentTable from "@/admin/components/ContentTable";
import ContentFilters from "@/admin/components/ContentFilters";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Plus, X } from "lucide-react";
import { useUpsertService, useDeleteService } from "@/admin/hooks/useGovAdmin";
import type { ColumnDef } from "@tanstack/react-table";
import type { Tables } from "@/integrations/supabase/types";

type Service = Tables<'gov_services'>;

const AGENCY_OPTIONS = [
  { value: "dps", label: "ДПС" },
  { value: "pfu", label: "ПФУ" },
  { value: "cnap", label: "ЦНАП" },
  { value: "dracs", label: "ДРАЦС" },
  { value: "courts", label: "Суди" },
];

const AUDIENCE_OPTIONS = [
  { value: "business", label: "Бізнес" },
  { value: "personal", label: "Фізособи" },
  { value: "both", label: "Усі" },
];

const columns: ColumnDef<Service, any>[] = [
  { accessorKey: "name", header: "Послуга", cell: ({ row }) => <span className="font-medium text-sm line-clamp-1">{row.original.name}</span> },
  { accessorKey: "agency_slug", header: "Орган", cell: ({ row }) => <Badge variant="outline" className="text-xs">{AGENCY_OPTIONS.find(a => a.value === row.original.agency_slug)?.label ?? row.original.agency_slug}</Badge> },
  { accessorKey: "price", header: "Ціна", cell: ({ row }) => <span className="text-sm">{row.original.price || "Безкоштовно"}</span> },
  { accessorKey: "processing_time", header: "Термін", cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.original.processing_time || "—"}</span> },
  { accessorKey: "is_online_available", header: "Онлайн", cell: ({ row }) => row.original.is_online_available ? <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 text-xs">Так</Badge> : <span className="text-xs text-muted-foreground">Ні</span> },
  { accessorKey: "audience", header: "Аудиторія", cell: ({ row }) => <span className="text-xs">{AUDIENCE_OPTIONS.find(a => a.value === row.original.audience)?.label}</span> },
];

const emptyService: Partial<Service> = {
  name: "", agency_slug: "dps", audience: "both", category: "", description: "",
  price: "", price_note: "", processing_time: "", is_online_available: false, online_url: "",
  legal_basis: "", requirements: [], common_mistakes: [], tips: [], sort_order: 0,
};

function ArrayEditor({ label, values, onChange }: { label: string; values: string[]; onChange: (v: string[]) => void }) {
  return (
    <div>
      <Label>{label}</Label>
      <div className="space-y-1">
        {values.map((v, i) => (
          <div key={i} className="flex gap-2">
            <Input value={v} onChange={e => { const arr = [...values]; arr[i] = e.target.value; onChange(arr); }} />
            <Button variant="ghost" size="icon" onClick={() => onChange(values.filter((_, j) => j !== i))}><X className="h-4 w-4" /></Button>
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={() => onChange([...values, ""])}><Plus className="h-3 w-3 mr-1" />Додати</Button>
      </div>
    </div>
  );
}

export default function GovServicesAdmin() {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({ agency: "all", audience: "all" });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<Service> | null>(null);

  const { data: services = [], isLoading } = useQuery({
    queryKey: ['gov-services', 'admin'],
    queryFn: async () => {
      const { data, error } = await supabase.from('gov_services').select('*').order('sort_order');
      if (error) throw error;
      return data as Service[];
    },
  });

  const upsert = useUpsertService();
  const deleteMut = useDeleteService();

  const filtered = useMemo(() => {
    return services.filter(s => {
      if (filters.agency !== "all" && s.agency_slug !== filters.agency) return false;
      if (filters.audience !== "all" && s.audience !== filters.audience) return false;
      if (search) return s.name.toLowerCase().includes(search.toLowerCase());
      return true;
    });
  }, [services, filters, search]);

  const openEdit = (svc: Service) => { setEditing({ ...svc }); setDialogOpen(true); };
  const openCreate = () => { setEditing({ ...emptyService }); setDialogOpen(true); };
  const updateField = (key: string, value: any) => setEditing(prev => prev ? { ...prev, [key]: value } : prev);

  const handleSave = () => {
    if (!editing?.name || !editing?.agency_slug) return;
    upsert.mutate(editing as any, { onSuccess: () => setDialogOpen(false) });
  };

  const handleDelete = () => {
    if (!editing?.id || !confirm("Видалити послугу?")) return;
    deleteMut.mutate(editing.id, { onSuccess: () => setDialogOpen(false) });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Послуги держорганів</h1>
          <p className="text-sm text-muted-foreground">{services.length} послуг у базі</p>
        </div>
        <Button onClick={openCreate} size="sm"><Plus className="h-4 w-4 mr-1" />Додати</Button>
      </div>

      <ContentFilters
        searchValue={search} onSearchChange={setSearch} searchPlaceholder="Пошук послуг..."
        filters={[
          { key: "agency", label: "Орган", options: AGENCY_OPTIONS },
          { key: "audience", label: "Аудиторія", options: AUDIENCE_OPTIONS },
        ]}
        filterValues={filters}
        onFilterChange={(k, v) => setFilters(prev => ({ ...prev, [k]: v }))}
        onClearAll={() => { setSearch(""); setFilters({ agency: "all", audience: "all" }); }}
      />

      {isLoading ? <p className="text-sm text-muted-foreground">Завантаження...</p> : (
        <ContentTable data={filtered} columns={columns} globalFilter={search} onRowClick={openEdit} />
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Редагувати послугу" : "Нова послуга"}</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="grid gap-4">
              <div><Label>Назва *</Label><Input value={editing.name || ""} onChange={e => updateField("name", e.target.value)} /></div>

              <div className="grid grid-cols-3 gap-3">
                <div><Label>Орган *</Label>
                  <Select value={editing.agency_slug || ""} onValueChange={v => updateField("agency_slug", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{AGENCY_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Аудиторія</Label>
                  <Select value={editing.audience || "both"} onValueChange={v => updateField("audience", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{AUDIENCE_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Категорія</Label><Input value={editing.category || ""} onChange={e => updateField("category", e.target.value)} /></div>
              </div>

              <div><Label>Опис</Label><Textarea value={editing.description || ""} onChange={e => updateField("description", e.target.value)} rows={2} /></div>

              <div className="grid grid-cols-3 gap-3">
                <div><Label>Ціна</Label><Input value={editing.price || ""} onChange={e => updateField("price", e.target.value)} placeholder="Безкоштовно" /></div>
                <div><Label>Примітка до ціни</Label><Input value={editing.price_note || ""} onChange={e => updateField("price_note", e.target.value)} /></div>
                <div><Label>Термін</Label><Input value={editing.processing_time || ""} onChange={e => updateField("processing_time", e.target.value)} placeholder="5 робочих днів" /></div>
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm"><Checkbox checked={editing.is_online_available || false} onCheckedChange={v => updateField("is_online_available", !!v)} />Доступно онлайн</label>
                {editing.is_online_available && <Input value={editing.online_url || ""} onChange={e => updateField("online_url", e.target.value)} placeholder="URL онлайн-сервісу" className="flex-1" />}
              </div>

              <div><Label>Правова основа</Label><Input value={editing.legal_basis || ""} onChange={e => updateField("legal_basis", e.target.value)} /></div>

              <ArrayEditor label="Вимоги" values={editing.requirements || []} onChange={v => updateField("requirements", v)} />
              <ArrayEditor label="Типові помилки" values={editing.common_mistakes || []} onChange={v => updateField("common_mistakes", v)} />
              <ArrayEditor label="Поради" values={editing.tips || []} onChange={v => updateField("tips", v)} />

              <div><Label>Порядок сортування</Label><Input type="number" value={editing.sort_order ?? 0} onChange={e => updateField("sort_order", +e.target.value)} /></div>

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
