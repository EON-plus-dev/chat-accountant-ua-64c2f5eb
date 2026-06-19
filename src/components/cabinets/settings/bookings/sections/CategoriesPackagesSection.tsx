/**
 * CategoriesPackagesSection — категорії, пакети та абонементи салону (демо-CRUD).
 */

import { useEffect, useMemo, useState } from "react";
import { Tags, Package, Ticket, Plus, Pencil, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { Cabinet } from "@/types/cabinet";
import { salonServices } from "@/config/demoCabinets/salonData";
import { SectionShell } from "../shared/SectionShell";
import { getSettingsSectionLabel } from "@/core";

interface Category { id: string; label: string; count: number; color: string; }
interface PackageItem { id: string; name: string; serviceIds: string[]; packagePrice: number; }
interface Subscription { id: string; name: string; count: number; validityDays: number; price: number; }

const INITIAL_CATEGORIES: Category[] = [
  { id: "hair", label: "Перукарські", count: 8, color: "#E11D48" },
  { id: "nails", label: "Манікюр / педикюр", count: 6, color: "#7C3AED" },
  { id: "massage", label: "Масаж", count: 3, color: "#0891B2" },
  { id: "spa", label: "SPA", count: 1, color: "#10B981" },
  { id: "brows", label: "Брови / вії", count: 2, color: "#DB2777" },
];

const INITIAL_PACKAGES: PackageItem[] = [
  { id: "pkg-1", name: "Стрижка + укладка", serviceIds: salonServices.slice(0, 2).map((s) => s.id), packagePrice: 990 },
  { id: "pkg-2", name: "Манікюр + педикюр", serviceIds: salonServices.filter((s) => s.category === "nails").slice(0, 2).map((s) => s.id), packagePrice: 1150 },
  { id: "pkg-3", name: "SPA-програма «Релакс»", serviceIds: salonServices.filter((s) => s.category === "spa" || s.category === "massage").slice(0, 3).map((s) => s.id), packagePrice: 2400 },
];

const INITIAL_SUBSCRIPTIONS: Subscription[] = [
  { id: "sub-1", name: "Абонемент 5 масажів", count: 5, validityDays: 60, price: 4250 },
  { id: "sub-2", name: "Абонемент 10 манікюрів", count: 10, validityDays: 180, price: 6750 },
];

const COLOR_OPTIONS = ["#E11D48", "#F97316", "#EAB308", "#10B981", "#0891B2", "#3B82F6", "#7C3AED", "#DB2777", "#6B7280"];

export function CategoriesPackagesSection({ cabinet }: { cabinet: Cabinet }) {
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [packages, setPackages] = useState<PackageItem[]>(INITIAL_PACKAGES);
  const [subs, setSubs] = useState<Subscription[]>(INITIAL_SUBSCRIPTIONS);

  const [catEdit, setCatEdit] = useState<Category | null>(null);
  const [pkgEdit, setPkgEdit] = useState<PackageItem | null>(null);
  const [subEdit, setSubEdit] = useState<Subscription | null>(null);
  const [catOpen, setCatOpen] = useState(false);
  const [pkgOpen, setPkgOpen] = useState(false);
  const [subOpen, setSubOpen] = useState(false);

  const calcRegular = (ids: string[]) =>
    ids.reduce((s, id) => s + (salonServices.find((x) => x.id === id)?.price ?? 0), 0);

  const label = getSettingsSectionLabel(cabinet, "categories", {
    title: "Категорії та пакети",
    description: "Групи послуг із кольоровим кодуванням, готові комбо-пакети та абонементи. Усі зміни — у демо-режимі.",
  });
  return (
    <SectionShell
      title={label.title}
      description={label.description}
    >
      <div className="space-y-5">
        {/* CATEGORIES */}
        <div>
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <Tags className="w-4 h-4 text-muted-foreground" />
              <h4 className="text-sm font-medium">Категорії послуг</h4>
            </div>
            <Button size="sm" variant="outline" className="gap-1.5 h-8" onClick={() => { setCatEdit(null); setCatOpen(true); }}>
              <Plus className="w-3.5 h-3.5" /> Категорія
            </Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
            {categories.map((c) => (
              <Card key={c.id} className="group relative">
                <CardContent className="p-2.5 flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-medium truncate">{c.label}</div>
                    <div className="text-[10px] text-muted-foreground">{c.count} послуг</div>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition flex gap-0.5">
                    <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => { setCatEdit(c); setCatOpen(true); }}>
                      <Pencil className="w-3 h-3" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive" onClick={() => { setCategories((arr) => arr.filter((x) => x.id !== c.id)); toast({ title: "Категорію видалено (демо)" }); }}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* PACKAGES */}
        <div>
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-muted-foreground" />
              <h4 className="text-sm font-medium">Пакети послуг</h4>
            </div>
            <Button size="sm" variant="outline" className="gap-1.5 h-8" onClick={() => { setPkgEdit(null); setPkgOpen(true); }}>
              <Plus className="w-3.5 h-3.5" /> Пакет
            </Button>
          </div>
          <div className="rounded-lg border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-[11px] uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="text-left font-medium px-3 py-2">Назва</th>
                  <th className="text-center font-medium px-3 py-2">Послуг</th>
                  <th className="text-right font-medium px-3 py-2 hidden sm:table-cell">Звичайно</th>
                  <th className="text-right font-medium px-3 py-2">Пакет</th>
                  <th className="text-right font-medium px-3 py-2">Знижка</th>
                  <th className="w-16" />
                </tr>
              </thead>
              <tbody>
                {packages.map((p) => {
                  const reg = calcRegular(p.serviceIds);
                  const discount = reg > 0 ? Math.round((1 - p.packagePrice / reg) * 100) : 0;
                  return (
                    <tr key={p.id} className="border-t hover:bg-muted/30">
                      <td className="px-3 py-2 font-medium">{p.name}</td>
                      <td className="px-3 py-2 text-center tabular-nums">{p.serviceIds.length}</td>
                      <td className="px-3 py-2 text-right tabular-nums text-muted-foreground line-through hidden sm:table-cell">{reg.toLocaleString("uk-UA")} ₴</td>
                      <td className="px-3 py-2 text-right tabular-nums font-medium">{p.packagePrice.toLocaleString("uk-UA")} ₴</td>
                      <td className="px-3 py-2 text-right">
                        <Badge variant="outline" className={cn("text-[10px]", discount > 0 ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "")}>
                          {discount > 0 ? `−${discount}%` : "—"}
                        </Badge>
                      </td>
                      <td className="px-1 py-2 text-right">
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { setPkgEdit(p); setPkgOpen(true); }}>
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => { setPackages((arr) => arr.filter((x) => x.id !== p.id)); toast({ title: "Пакет видалено (демо)" }); }}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
                {packages.length === 0 && (
                  <tr><td colSpan={6} className="px-3 py-4 text-center text-muted-foreground text-xs">Жодного пакету. Додайте перший.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* SUBSCRIPTIONS */}
        <div>
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <Ticket className="w-4 h-4 text-muted-foreground" />
              <h4 className="text-sm font-medium">Абонементи</h4>
            </div>
            <Button size="sm" variant="outline" className="gap-1.5 h-8" onClick={() => { setSubEdit(null); setSubOpen(true); }}>
              <Plus className="w-3.5 h-3.5" /> Абонемент
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {subs.map((s) => (
              <Card key={s.id} className="group relative">
                <CardContent className="p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-medium text-sm">{s.name}</div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">
                        {s.count} процедур · валідність {s.validityDays} днів
                      </div>
                      <div className="text-base font-semibold tabular-nums mt-1.5">{s.price.toLocaleString("uk-UA")} ₴</div>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition flex gap-0.5">
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { setSubEdit(s); setSubOpen(true); }}>
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => { setSubs((arr) => arr.filter((x) => x.id !== s.id)); toast({ title: "Абонемент видалено (демо)" }); }}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Editors */}
      <CategoryEditor
        open={catOpen}
        onOpenChange={setCatOpen}
        initial={catEdit}
        onSave={(c) => {
          setCategories((arr) => arr.some((x) => x.id === c.id) ? arr.map((x) => x.id === c.id ? c : x) : [...arr, c]);
          toast({ title: catEdit ? "Категорію оновлено (демо)" : "Категорію додано (демо)" });
        }}
      />
      <PackageEditor
        open={pkgOpen}
        onOpenChange={setPkgOpen}
        initial={pkgEdit}
        onSave={(p) => {
          setPackages((arr) => arr.some((x) => x.id === p.id) ? arr.map((x) => x.id === p.id ? p : x) : [...arr, p]);
          toast({ title: pkgEdit ? "Пакет оновлено (демо)" : "Пакет додано (демо)" });
        }}
      />
      <SubscriptionEditor
        open={subOpen}
        onOpenChange={setSubOpen}
        initial={subEdit}
        onSave={(s) => {
          setSubs((arr) => arr.some((x) => x.id === s.id) ? arr.map((x) => x.id === s.id ? s : x) : [...arr, s]);
          toast({ title: subEdit ? "Абонемент оновлено (демо)" : "Абонемент додано (демо)" });
        }}
      />
    </SectionShell>
  );
}

// ============================================================================
// Editors
// ============================================================================

function CategoryEditor({ open, onOpenChange, initial, onSave }: { open: boolean; onOpenChange: (o: boolean) => void; initial: Category | null; onSave: (c: Category) => void }) {
  const [label, setLabel] = useState(initial?.label ?? "");
  const [color, setColor] = useState(initial?.color ?? COLOR_OPTIONS[0]);
  useEffect(() => { setLabel(initial?.label ?? ""); setColor(initial?.color ?? COLOR_OPTIONS[0]); }, [initial, open]);
  const valid = label.trim().length > 1;
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{initial ? "Редагувати категорію" : "Нова категорія"}</SheetTitle>
          <SheetDescription>Категорія використовується для групування послуг і фільтрів.</SheetDescription>
        </SheetHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-1.5">
            <Label>Назва</Label>
            <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Наприклад, Стилізація волосся" />
          </div>
          <div className="space-y-1.5">
            <Label>Колір</Label>
            <div className="flex gap-1.5 flex-wrap">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={cn("w-7 h-7 rounded-full border-2 transition", color === c ? "border-foreground scale-110" : "border-transparent")}
                  style={{ backgroundColor: c }}
                  aria-label={c}
                />
              ))}
            </div>
          </div>
        </div>
        <SheetFooter className="gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Скасувати</Button>
          <Button disabled={!valid} onClick={() => {
            onSave({ id: initial?.id ?? `cat-demo-${Date.now()}`, label: label.trim(), color, count: initial?.count ?? 0 });
            onOpenChange(false);
          }}>Зберегти</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function PackageEditor({ open, onOpenChange, initial, onSave }: { open: boolean; onOpenChange: (o: boolean) => void; initial: PackageItem | null; onSave: (p: PackageItem) => void }) {
  const [name, setName] = useState(initial?.name ?? "");
  const [serviceIds, setServiceIds] = useState<string[]>(initial?.serviceIds ?? []);
  const [packagePrice, setPackagePrice] = useState(initial?.packagePrice ?? 0);
  useEffect(() => {
    setName(initial?.name ?? "");
    setServiceIds(initial?.serviceIds ?? []);
    setPackagePrice(initial?.packagePrice ?? 0);
  }, [initial, open]);
  const reg = serviceIds.reduce((s, id) => s + (salonServices.find((x) => x.id === id)?.price ?? 0), 0);
  const discount = reg > 0 ? Math.round((1 - packagePrice / reg) * 100) : 0;
  const toggle = (id: string) => setServiceIds((arr) => arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id]);
  const valid = name.trim().length > 1 && serviceIds.length >= 2 && packagePrice > 0;
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{initial ? "Редагувати пакет" : "Новий пакет"}</SheetTitle>
          <SheetDescription>Виберіть від двох послуг та задайте акційну ціну.</SheetDescription>
        </SheetHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-1.5">
            <Label>Назва</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Стрижка + укладка" />
          </div>
          <div className="space-y-1.5">
            <Label>Послуги ({serviceIds.length})</Label>
            <div className="rounded-md border max-h-64 overflow-y-auto divide-y">
              {salonServices.map((s) => {
                const active = serviceIds.includes(s.id);
                return (
                  <button key={s.id} type="button" onClick={() => toggle(s.id)} className={cn("w-full text-left px-3 py-2 flex items-center justify-between gap-2 text-sm hover:bg-muted/40", active && "bg-primary/5")}>
                    <span className="truncate">
                      <input type="checkbox" checked={active} readOnly className="mr-2 align-middle" />
                      {s.name}
                    </span>
                    <span className="text-xs tabular-nums text-muted-foreground">{s.price} ₴</span>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Звичайна вартість</Label>
              <Input value={reg.toLocaleString("uk-UA") + " ₴"} disabled />
            </div>
            <div className="space-y-1.5">
              <Label>Ціна пакету, ₴</Label>
              <Input type="number" min={0} step={50} value={packagePrice} onChange={(e) => setPackagePrice(Number(e.target.value))} />
            </div>
          </div>
          {discount > 0 && (
            <div className="rounded-md border bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 px-3 py-2 text-sm">
              Знижка <span className="font-semibold">−{discount}%</span> від звичайної вартості.
            </div>
          )}
        </div>
        <SheetFooter className="gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Скасувати</Button>
          <Button disabled={!valid} onClick={() => {
            onSave({ id: initial?.id ?? `pkg-demo-${Date.now()}`, name: name.trim(), serviceIds, packagePrice });
            onOpenChange(false);
          }}>Зберегти</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function SubscriptionEditor({ open, onOpenChange, initial, onSave }: { open: boolean; onOpenChange: (o: boolean) => void; initial: Subscription | null; onSave: (s: Subscription) => void }) {
  const [name, setName] = useState(initial?.name ?? "");
  const [count, setCount] = useState(initial?.count ?? 5);
  const [validityDays, setValidityDays] = useState(initial?.validityDays ?? 90);
  const [price, setPrice] = useState(initial?.price ?? 0);
  useEffect(() => {
    setName(initial?.name ?? "");
    setCount(initial?.count ?? 5);
    setValidityDays(initial?.validityDays ?? 90);
    setPrice(initial?.price ?? 0);
  }, [initial, open]);
  const valid = name.trim().length > 1 && count > 0 && validityDays > 0 && price > 0;
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{initial ? "Редагувати абонемент" : "Новий абонемент"}</SheetTitle>
          <SheetDescription>Пакет із кількістю процедур та терміном дії.</SheetDescription>
        </SheetHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-1.5">
            <Label>Назва</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Абонемент 5 масажів" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Кількість процедур</Label>
              <Input type="number" min={1} value={count} onChange={(e) => setCount(Number(e.target.value))} />
            </div>
            <div className="space-y-1.5">
              <Label>Термін дії, днів</Label>
              <Select value={String(validityDays)} onValueChange={(v) => setValidityDays(Number(v))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[30, 60, 90, 180, 365].map((d) => <SelectItem key={d} value={String(d)}>{d}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Ціна, ₴</Label>
            <Input type="number" min={0} step={100} value={price} onChange={(e) => setPrice(Number(e.target.value))} />
          </div>
        </div>
        <SheetFooter className="gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Скасувати</Button>
          <Button disabled={!valid} onClick={() => {
            onSave({ id: initial?.id ?? `sub-demo-${Date.now()}`, name: name.trim(), count, validityDays, price });
            onOpenChange(false);
          }}>Зберегти</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
