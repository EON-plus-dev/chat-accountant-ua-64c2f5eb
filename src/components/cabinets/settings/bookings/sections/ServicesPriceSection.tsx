/**
 * ServicesPriceSection — CRUD послуг і прайс.
 */

import { useState, useMemo } from "react";
import { Plus, Pencil, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import type { Cabinet } from "@/types/cabinet";
import {
  salonServices as initialServices,
  type SalonService,
  type ServiceCategory,
} from "@/config/demoCabinets/salonData";
import { SectionShell } from "../shared/SectionShell";
import { getSettingsSectionLabel, getVerticalPack } from "@/core";
import { ServiceEditorSheet } from "./_ServiceEditorSheet";

const CATEGORY_LABEL: Partial<Record<ServiceCategory, string>> = {
  hair: "Перукарські",
  nails: "Манікюр / педикюр",
  massage: "Масаж",
  spa: "SPA",
  brows: "Брови / вії",
};

const CATEGORY_COLOR: Partial<Record<ServiceCategory, string>> = {
  hair: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
  nails: "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20",
  massage: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20",
  spa: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  brows: "bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20",
};

export function ServicesPriceSection({ cabinet }: { cabinet: Cabinet }) {
  const { toast } = useToast();
  const [items, setItems] = useState<SalonService[]>(initialServices);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<ServiceCategory | "all">("all");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<SalonService | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((s) => {
      if (filter !== "all" && s.category !== filter) return false;
      if (q && !s.name.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [items, search, filter]);

  const byCategory = useMemo(() => {
    const map = new Map<ServiceCategory, SalonService[]>();
    filtered.forEach((s) => {
      if (!map.has(s.category)) map.set(s.category, []);
      map.get(s.category)!.push(s);
    });
    return map;
  }, [filtered]);

  const pack = getVerticalPack(cabinet);
  const label = getSettingsSectionLabel(cabinet, "services", {
    title: "Послуги та прайс",
    description: "Каталог послуг салону: тривалість, ціна, комісія майстра за замовч. Прайс автоматично відображається у модулі «Бронювання».",
  });
  return (
    <SectionShell
      title={label.title}
      description={label.description}
      actions={
        <Button
          size="sm"
          className="gap-1.5"
          onClick={() => { setEditing(null); setEditorOpen(true); }}
        >
          <Plus className="w-4 h-4" />
          Додати {pack.labels.serviceSingular.toLowerCase()}
        </Button>
      }
    >
      <div className="flex flex-col sm:flex-row gap-2 mb-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2" />
          <Input
            placeholder="Пошук за назвою…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-9"
          />
        </div>
        <div className="flex gap-1 flex-wrap">
          <FilterChip active={filter === "all"} onClick={() => setFilter("all")}>
            Усі ({items.length})
          </FilterChip>
          {(Object.keys(CATEGORY_LABEL) as ServiceCategory[]).map((c) => (
            <FilterChip key={c} active={filter === c} onClick={() => setFilter(c)}>
              {CATEGORY_LABEL[c]}
            </FilterChip>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {Array.from(byCategory.entries()).map(([cat, services]) => (
          <div key={cat}>
            <div className="flex items-center gap-2 mb-1.5">
              <Badge variant="outline" className={cn("text-[10px] font-medium", CATEGORY_COLOR[cat])}>
                {CATEGORY_LABEL[cat]}
              </Badge>
              <span className="text-xs text-muted-foreground">{services.length} послуг</span>
            </div>
            <div className="rounded-lg border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 text-[11px] uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="text-left font-medium px-3 py-2">Назва</th>
                    <th className="text-right font-medium px-3 py-2 w-20">Час</th>
                    <th className="text-right font-medium px-3 py-2 w-28">Ціна</th>
                    <th className="text-right font-medium px-3 py-2 w-20 hidden sm:table-cell">Майстру</th>
                    <th className="w-8" />
                  </tr>
                </thead>
                <tbody>
                  {services.map((s) => (
                    <tr key={s.id} className="border-t hover:bg-muted/30 transition-colors">
                      <td className="px-3 py-2 font-medium">{s.name}</td>
                      <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">{s.durationMin} хв</td>
                      <td className="px-3 py-2 text-right tabular-nums font-medium">{formatCurrency(s.price)}</td>
                      <td className="px-3 py-2 text-right tabular-nums text-muted-foreground hidden sm:table-cell">
                        {s.defaultCommissionPct}%
                      </td>
                      <td className="px-1 py-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7"
                          aria-label="Редагувати"
                          onClick={() => { setEditing(s); setEditorOpen(true); }}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="rounded-md border border-dashed bg-muted/20 p-6 text-sm text-muted-foreground text-center">
            Жодної послуги не знайдено за критеріями.
          </div>
        )}
      </div>

      <ServiceEditorSheet
        open={editorOpen}
        onOpenChange={setEditorOpen}
        service={editing}
        onSave={(svc) => {
          setItems((arr) => {
            const exists = arr.some((x) => x.id === svc.id);
            return exists ? arr.map((x) => (x.id === svc.id ? svc : x)) : [svc, ...arr];
          });
          toast({ title: editing ? "Послугу оновлено (демо)" : "Послугу додано (демо)" });
        }}
        onDelete={(id) => {
          setItems((arr) => arr.filter((x) => x.id !== id));
          toast({ title: "Послугу видалено (демо)" });
        }}
      />
    </SectionShell>
  );
}

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "px-2.5 h-9 rounded-md border text-xs font-medium transition-colors whitespace-nowrap",
        active
          ? "bg-primary text-primary-foreground border-primary"
          : "bg-background hover:bg-muted/60 border-border",
      )}
    >
      {children}
    </button>
  );
}
