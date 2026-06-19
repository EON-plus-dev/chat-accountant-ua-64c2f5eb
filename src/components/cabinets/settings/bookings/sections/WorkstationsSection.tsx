/**
 * WorkstationsSection — CRUD робочих місць (крісла салону / корти клубу / столики / номери).
 * Початкові дані беруться з `getBookableContext(cabinet.id)`, тож для tennis-кабінету
 * показуються реальні корти з полями `surface` / `indoor` / `hourlyRate`, а не
 * крісла салону.
 */

import { useState, useMemo } from "react";
import { Plus, Armchair, Sparkles, Hand, Heart, Trash2, Wrench, CircleDot, Trees, Home } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { Cabinet } from "@/types/cabinet";
import {
  salonMasters,
  type SalonWorkstation,
  type WorkstationKind,
  type ServiceCategory,
} from "@/config/demoCabinets/salonData";
import { getBookableContext } from "@/core";
import { getVerticalPack } from "@/core";
import { SectionShell } from "../shared/SectionShell";
import { WorkstationAssetsTable, type LinkedAsset } from "../shared/WorkstationAssetsTable";

type Status = "active" | "maintenance" | "archived";

interface WorkstationRow extends SalonWorkstation {
  status: Status;
  colorAccent: string;
  assetIds: string[];
}

const KIND_META: Record<WorkstationKind, { label: string; icon: LucideIcon; color: string }> = {
  hair_chair: { label: "Крісло перукаря", icon: Armchair, color: "#E11D48" },
  nail_table: { label: "Манікюрний стіл", icon: Hand, color: "#7C3AED" },
  massage_room: { label: "Масажний кабінет", icon: Heart, color: "#0891B2" },
  brow_chair: { label: "Брови / візаж", icon: Sparkles, color: "#DB2777" },
  court: { label: "Корт", icon: CircleDot, color: "#16A34A" },
  shop_counter: { label: "Стійка Pro Shop", icon: Wrench, color: "#0891B2" },
  cafe_table: { label: "Столик кафе", icon: Armchair, color: "#D97706" },
  restaurant_table: { label: "Столик ресторану", icon: Armchair, color: "#D97706" },
  hotel_room: { label: "Номер готелю", icon: Home, color: "#0F766E" },
};

const CATEGORY_LABEL: Partial<Record<ServiceCategory, string>> = {
  hair: "Перукарські",
  nails: "Манікюр / педикюр",
  massage: "Масаж",
  spa: "SPA",
  brows: "Брови / вії",
  court_rent: "Оренда корту",
  training: "Тренування",
  group_class: "Групові",
  rental: "Прокат",
};

const TENNIS_CATEGORIES: ServiceCategory[] = ["court_rent", "training", "group_class"];

const SURFACE_META: Record<NonNullable<SalonWorkstation["surface"]>, { label: string; tone: string; indoor: boolean }> = {
  clay: { label: "Ґрунт", tone: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30", indoor: false },
  "hard-out": { label: "Хард outdoor", tone: "bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/30", indoor: false },
  "hard-in": { label: "Хард indoor", tone: "bg-violet-500/10 text-violet-700 dark:text-violet-300 border-violet-500/30", indoor: true },
};

// Mock ОЗ для демо
const MOCK_ASSETS: Record<string, LinkedAsset[]> = {
  "ws-h-1": [
    { id: "a-1", name: "Крісло перукарське Belmont", inventoryNumber: "ОЗ-014", initialCost: 28500, residualCost: 19200, status: "in_use" },
    { id: "a-2", name: "Дзеркало з підсвіткою LED 80×120", inventoryNumber: "ОЗ-015", initialCost: 6400, residualCost: 4100, status: "in_use" },
  ],
  "ws-n-1": [
    { id: "a-3", name: "Стіл манікюрний з витяжкою", inventoryNumber: "ОЗ-022", initialCost: 12800, residualCost: 9200, status: "in_use" },
    { id: "a-4", name: "Лампа LED/UV 48W", inventoryNumber: "ОЗ-023", initialCost: 2400, residualCost: 1800, status: "in_use" },
  ],
  "ws-m-1": [
    { id: "a-5", name: "Кушетка масажна Lemi 4", inventoryNumber: "ОЗ-031", initialCost: 42000, residualCost: 31500, status: "in_use" },
    { id: "a-6", name: "Стерилізатор сухожаровий", inventoryNumber: "ОЗ-032", initialCost: 8200, residualCost: 5600, status: "maintenance" },
  ],
};

export function WorkstationsSection({ cabinet }: { cabinet: Cabinet }) {
  const { toast } = useToast();
  const pack = getVerticalPack(cabinet);
  const isTennis = pack.id === "tennis_club";

  const ctx = useMemo(() => getBookableContext(cabinet.id), [cabinet.id]);

  // Локальний state: збагачуємо демо-дані статусом, кольором і ОЗ
  const [items, setItems] = useState<WorkstationRow[]>(() =>
    ctx.workstations.map((w) => ({
      ...w,
      status: "active",
      colorAccent: KIND_META[w.kind]?.color ?? "#64748B",
      assetIds: (MOCK_ASSETS[w.id] ?? []).map((a) => a.id),
    })),
  );
  const [openId, setOpenId] = useState<string | null>(null);
  const [draft, setDraft] = useState<WorkstationRow | null>(null);

  const openItem = useMemo(() => items.find((i) => i.id === openId) ?? null, [items, openId]);
  const activeItem = draft ?? openItem;
  const isNew = draft !== null;

  const mastersByWs = useMemo(() => {
    const map = new Map<string, typeof salonMasters>();
    ctx.masters.forEach((m) => {
      (m.preferredWorkstationIds ?? []).forEach((wid) => {
        if (!map.has(wid)) map.set(wid, []);
        map.get(wid)!.push(m);
      });
    });
    return map;
  }, [ctx.masters]);

  const closeSheet = () => { setOpenId(null); setDraft(null); };

  const handleAdd = () => {
    setOpenId(null);
    if (isTennis) {
      setDraft({
        id: `tcourt-${Date.now()}`,
        name: "",
        kind: "court",
        resourceKind: "court",
        surface: "clay",
        indoor: false,
        hourlyRate: 280,
        allowedCategories: ["court_rent", "training", "group_class"],
        status: "active",
        colorAccent: KIND_META.court.color,
        assetIds: [],
      });
    } else {
      setDraft({
        id: `ws-${Date.now()}`,
        name: "",
        kind: "hair_chair",
        allowedCategories: ["hair"],
        status: "active",
        colorAccent: KIND_META.hair_chair.color,
        assetIds: [],
      });
    }
  };

  const handleCreate = () => {
    if (!draft || draft.name.trim().length < 2) return;
    setItems((prev) => [...prev, draft]);
    toast({ title: `${pack.labels.resourceSingular} додано`, description: draft.name });
    closeSheet();
  };

  const handleDelete = (id: string) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
    toast({ title: `${pack.labels.resourceSingular} видалено` });
    closeSheet();
  };

  return (
    <SectionShell
      title={pack.labels.resourcePlural}
      description={
        isTennis
          ? "Корти клубу: покриття (ґрунт / хард outdoor / хард indoor), ставка ₴/год, доступні види бронювання. Використовуються рушієм доступності та публічним віджетом."
          : "Фізичні точки виконання послуг: крісла, манікюрні столи, масажні кабінети. Слугують контейнером для обладнання і прив'язки майстрів."
      }
      actions={
        <Button size="sm" onClick={handleAdd} className="gap-1.5">
          <Plus className="w-4 h-4" />
          Додати {pack.labels.resourceSingular.toLowerCase()}
        </Button>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {items.map((w) => {
          const meta = KIND_META[w.kind] ?? { label: w.kind, icon: Armchair, color: "#64748B" };
          const Icon = meta.icon;
          const masters = mastersByWs.get(w.id) ?? [];
          const assetCount = (MOCK_ASSETS[w.id] ?? []).length;
          const surfaceMeta = w.surface ? SURFACE_META[w.surface] : null;
          return (
            <button
              key={w.id}
              type="button"
              onClick={() => { setDraft(null); setOpenId(w.id); }}
              className="text-left"
            >
              <Card className="hover:border-primary/40 hover:shadow-sm transition-all">
                <CardContent className="p-3 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className="p-1.5 rounded-md shrink-0"
                        style={{ backgroundColor: `${w.colorAccent}1A`, color: w.colorAccent }}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium text-sm truncate">{w.name}</div>
                        <div className="text-[11px] text-muted-foreground">{meta.label}</div>
                      </div>
                    </div>
                    <StatusBadge status={w.status} />
                  </div>

                  {isTennis && surfaceMeta ? (
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Badge variant="outline" className={cn("text-[10px] font-medium h-5", surfaceMeta.tone)}>
                        {surfaceMeta.label}
                      </Badge>
                      <Badge variant="secondary" className="text-[10px] font-normal h-5 gap-1">
                        {w.indoor ? <Home className="w-2.5 h-2.5" /> : <Trees className="w-2.5 h-2.5" />}
                        {w.indoor ? "Indoor" : "Outdoor"}
                      </Badge>
                      {w.hourlyRate != null && (
                        <Badge variant="secondary" className="text-[10px] font-normal h-5 tabular-nums">
                          {w.hourlyRate} ₴/год
                        </Badge>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      {w.allowedCategories.map((c) => (
                        <Badge key={c} variant="secondary" className="text-[10px] font-normal h-5">
                          {CATEGORY_LABEL[c] ?? c}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-3 text-[11px] text-muted-foreground pt-1 border-t">
                    <span className="flex items-center gap-1">
                      <Wrench className="w-3 h-3" />
                      {assetCount} ОЗ
                    </span>
                    {!isTennis && (
                      <span>· {masters.length} майстр{masters.length === 1 ? "" : "ів"}</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </button>
          );
        })}
      </div>

      <Sheet open={activeItem !== null} onOpenChange={(o) => !o && closeSheet()}>
        <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto">
          {activeItem && (
            <WorkstationDetail
              cabinet={cabinet}
              isTennis={isTennis}
              item={activeItem}
              isNew={isNew}
              masters={isNew ? [] : (mastersByWs.get(activeItem.id) ?? [])}
              assets={isNew ? [] : (MOCK_ASSETS[activeItem.id] ?? [])}
              onPatch={(patch) => {
                if (isNew) setDraft((p) => (p ? { ...p, ...patch } : p));
                else setItems((prev) => prev.map((it) => (it.id === activeItem.id ? { ...it, ...patch } : it)));
              }}
              onCreate={handleCreate}
              onCancel={closeSheet}
              onDelete={() => handleDelete(activeItem.id)}
            />
          )}
        </SheetContent>
      </Sheet>
    </SectionShell>
  );
}

function StatusBadge({ status }: { status: Status }) {
  const map = {
    active: { label: "Активне", cls: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" },
    maintenance: { label: "Тех.перерва", cls: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20" },
    archived: { label: "Архів", cls: "bg-muted text-muted-foreground border-border" },
  }[status];
  return (
    <Badge variant="outline" className={cn("text-[10px] font-medium shrink-0", map.cls)}>
      {map.label}
    </Badge>
  );
}

interface DetailProps {
  cabinet: Cabinet;
  isTennis: boolean;
  item: WorkstationRow;
  isNew: boolean;
  masters: typeof salonMasters;
  assets: LinkedAsset[];
  onPatch: (patch: Partial<WorkstationRow>) => void;
  onCreate: () => void;
  onCancel: () => void;
  onDelete: () => void;
}

function WorkstationDetail({ cabinet, isTennis, item, isNew, masters, assets, onPatch, onCreate, onCancel, onDelete }: DetailProps) {
  const canCreate = item.name.trim().length >= 2 && item.allowedCategories.length > 0;
  const meta = KIND_META[item.kind] ?? { label: item.kind, icon: Armchair, color: "#64748B" };
  const Icon = meta.icon;
  const categoriesToShow = (isTennis ? TENNIS_CATEGORIES : (Object.keys(CATEGORY_LABEL) as ServiceCategory[]).filter((c) => !TENNIS_CATEGORIES.includes(c)));

  return (
    <>
      <SheetHeader className="space-y-2">
        <div className="flex items-center gap-2">
          <div
            className="p-2 rounded-md"
            style={{ backgroundColor: `${item.colorAccent}1A`, color: item.colorAccent }}
          >
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <SheetTitle>
              {isNew ? (isTennis ? "Новий корт" : "Нове робоче місце") : item.name}
            </SheetTitle>
            <SheetDescription>{meta.label}</SheetDescription>
          </div>
        </div>
      </SheetHeader>

      <Tabs defaultValue="general" className="mt-4">
        <TabsList className={cn("grid w-full", isTennis ? "grid-cols-2" : "grid-cols-3")}>
          <TabsTrigger value="general">Загальне</TabsTrigger>
          {!isTennis && <TabsTrigger value="masters">Майстри</TabsTrigger>}
          <TabsTrigger value="equipment">Обладнання</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-3 mt-3">
          <div className="space-y-1.5">
            <Label htmlFor="ws-name">Назва</Label>
            <Input
              id="ws-name"
              value={item.name}
              onChange={(e) => onPatch({ name: e.target.value })}
              placeholder={isTennis ? "Корт №9 (хард indoor)" : ""}
            />
          </div>

          {isTennis ? (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Покриття</Label>
                  <Select
                    value={item.surface ?? "clay"}
                    onValueChange={(v: NonNullable<SalonWorkstation["surface"]>) => {
                      const autoIndoor = v === "hard-in";
                      onPatch({ surface: v, indoor: autoIndoor });
                    }}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="clay">Ґрунт</SelectItem>
                      <SelectItem value="hard-out">Хард (outdoor)</SelectItem>
                      <SelectItem value="hard-in">Хард (indoor)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label>Ставка, ₴/год</Label>
                  <Input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    value={item.hourlyRate ?? 0}
                    onChange={(e) => onPatch({ hourlyRate: Number(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between rounded-md border p-3">
                <div className="space-y-0.5">
                  <Label className="text-sm">Indoor (критий)</Label>
                  <p className="text-[11px] text-muted-foreground">
                    Доступний у дощ; робочі години 07–22.
                  </p>
                </div>
                <Switch
                  checked={!!item.indoor}
                  onCheckedChange={(c) => onPatch({ indoor: c })}
                />
              </div>

              <div className="space-y-1.5">
                <Label>Статус</Label>
                <Select value={item.status} onValueChange={(v: Status) => onPatch({ status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Активний</SelectItem>
                    <SelectItem value="maintenance">Тех.перерва</SelectItem>
                    <SelectItem value="archived">Архів</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Тип</Label>
                  <Select
                    value={item.kind}
                    onValueChange={(v: WorkstationKind) =>
                      onPatch({ kind: v, colorAccent: KIND_META[v]?.color ?? item.colorAccent })
                    }
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {(["hair_chair", "nail_table", "massage_room", "brow_chair"] as WorkstationKind[]).map((k) => (
                        <SelectItem key={k} value={k}>{KIND_META[k].label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label>Статус</Label>
                  <Select value={item.status} onValueChange={(v: Status) => onPatch({ status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Активне</SelectItem>
                      <SelectItem value="maintenance">Тех.перерва</SelectItem>
                      <SelectItem value="archived">Архів</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Колір-акцент</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={item.colorAccent}
                    onChange={(e) => onPatch({ colorAccent: e.target.value })}
                    className="h-9 w-12 rounded-md border bg-background cursor-pointer"
                    aria-label="Колір-акцент"
                  />
                  <span className="text-xs font-mono text-muted-foreground">{item.colorAccent}</span>
                </div>
              </div>
            </>
          )}

          <div className="space-y-1.5">
            <Label className="text-xs">
              {isTennis ? "Доступні види бронювання" : "Дозволені категорії послуг"}
            </Label>
            <div className="flex flex-wrap gap-1.5">
              {categoriesToShow.map((c) => {
                const active = item.allowedCategories.includes(c);
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() =>
                      onPatch({
                        allowedCategories: active
                          ? item.allowedCategories.filter((x) => x !== c)
                          : [...item.allowedCategories, c],
                      })
                    }
                    className={cn(
                      "px-2.5 py-1 rounded-full text-xs border transition-colors",
                      active
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background hover:bg-muted/60 border-border",
                    )}
                  >
                    {CATEGORY_LABEL[c] ?? c}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-between items-center pt-2 border-t gap-2">
            {isNew ? (
              <>
                <Button variant="ghost" size="sm" onClick={onCancel}>Скасувати</Button>
                <Button size="sm" onClick={onCreate} disabled={!canCreate} className="gap-1.5">
                  <Plus className="w-4 h-4" />
                  Створити
                </Button>
              </>
            ) : (
              <>
                <span />
                <Button variant="ghost" size="sm" onClick={onDelete} className="text-destructive gap-1.5">
                  <Trash2 className="w-4 h-4" />
                  Видалити
                </Button>
              </>
            )}
          </div>
        </TabsContent>

        {!isTennis && (
          <TabsContent value="masters" className="mt-3">
            {masters.length === 0 ? (
              <div className="rounded-md border border-dashed bg-muted/20 p-4 text-sm text-muted-foreground text-center">
                Жоден майстер не має цього місця як постійне.
                Додайте у налаштуваннях майстра в розділі «Майстри і ставки».
              </div>
            ) : (
              <ul className="divide-y border rounded-md">
                {masters.map((m) => (
                  <li key={m.id} className="flex items-center justify-between gap-2 px-3 py-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-semibold text-white shrink-0"
                        style={{ backgroundColor: m.color }}
                      >
                        {m.avatarInitials}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-medium truncate">{m.fullName}</div>
                        <div className="text-[11px] text-muted-foreground">
                          {m.type === "staff" ? "Штатний" : "ФОП"} · {m.commissionPct}%
                        </div>
                      </div>
                    </div>
                    {m.preferredWorkstationIds?.[0] === item.id && (
                      <Badge variant="secondary" className="text-[10px]">Основне</Badge>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </TabsContent>
        )}

        <TabsContent value="equipment" className="mt-3">
          <WorkstationAssetsTable
            cabinet={cabinet}
            workstationName={item.name}
            assets={assets}
          />
        </TabsContent>
      </Tabs>
    </>
  );
}
