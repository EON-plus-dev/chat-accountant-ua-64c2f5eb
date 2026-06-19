/**
 * ServiceEditorSheet — демо-форма створення/редагування послуги салону.
 */

import { useEffect, useState } from "react";
import { Sparkles, Trash2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency } from "@/lib/formatters";
import type { BookableService as SalonService } from "@/core";
import type { ServiceCategory } from "@/config/demoCabinets/salonData";

const CATEGORY_LABEL: Partial<Record<ServiceCategory, string>> = {
  hair: "Перукарські",
  nails: "Манікюр / педикюр",
  massage: "Масаж",
  spa: "SPA",
  brows: "Брови / вії",
};

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  /** undefined → новий */
  service: SalonService | null;
  onSave: (s: SalonService) => void;
  onDelete?: (id: string) => void;
}

const EMPTY: SalonService = {
  id: "",
  name: "",
  category: "hair",
  durationMin: 60,
  price: 500,
  defaultCommissionPct: 40,
};

export function ServiceEditorSheet({ open, onOpenChange, service, onSave, onDelete }: Props) {
  const [form, setForm] = useState<SalonService>(EMPTY);
  const [description, setDescription] = useState("");
  const [onlineAvailable, setOnlineAvailable] = useState(true);
  const isEdit = !!service?.id;

  useEffect(() => {
    if (open) {
      setForm(service ?? EMPTY);
      setDescription("");
      setOnlineAvailable(true);
    }
  }, [open, service]);

  const set = <K extends keyof SalonService>(k: K, v: SalonService[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const isValid = form.name.trim().length > 1 && form.durationMin >= 15 && form.price >= 0;

  const handleSave = () => {
    if (!isValid) return;
    const next: SalonService = {
      ...form,
      id: form.id || `svc-demo-${Date.now()}`,
      name: form.name.trim(),
    };
    onSave(next);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            {isEdit ? "Редагувати послугу" : "Нова послуга"}
          </SheetTitle>
          <SheetDescription>
            Зʼявиться у каталозі салону і в публічному віджеті онлайн-запису.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-1.5">
            <Label htmlFor="sv-name">Назва *</Label>
            <Input
              id="sv-name"
              placeholder="Стрижка жіноча, базова"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Категорія</Label>
              <Select value={form.category} onValueChange={(v) => set("category", v as ServiceCategory)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(Object.keys(CATEGORY_LABEL) as ServiceCategory[]).map((c) => (
                    <SelectItem key={c} value={c}>{CATEGORY_LABEL[c]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sv-price">Ціна, ₴ *</Label>
              <Input
                id="sv-price"
                type="number"
                min={0}
                step={50}
                value={form.price}
                onChange={(e) => set("price", Number(e.target.value))}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label>Тривалість</Label>
              <span className="text-xs tabular-nums text-muted-foreground">{form.durationMin} хв</span>
            </div>
            <Slider
              min={15}
              max={240}
              step={15}
              value={[form.durationMin]}
              onValueChange={([v]) => set("durationMin", v)}
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label>Комісія майстру за замовч.</Label>
              <span className="text-xs tabular-nums text-muted-foreground">
                {form.defaultCommissionPct}% · {formatCurrency(Math.round(form.price * form.defaultCommissionPct / 100))}
              </span>
            </div>
            <Slider
              min={0}
              max={70}
              step={5}
              value={[form.defaultCommissionPct]}
              onValueChange={([v]) => set("defaultCommissionPct", v)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="sv-desc">Опис (для віджета онлайн-запису)</Label>
            <Textarea
              id="sv-desc"
              rows={3}
              placeholder="Коротко опишіть, що включено"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between rounded-md border bg-card p-3">
            <div>
              <div className="text-sm font-medium">Доступна онлайн</div>
              <div className="text-[11px] text-muted-foreground">Показувати у віджеті онлайн-запису</div>
            </div>
            <Switch checked={onlineAvailable} onCheckedChange={setOnlineAvailable} />
          </div>
        </div>

        <SheetFooter className="gap-2 flex-row justify-between sm:justify-between">
          {isEdit && onDelete ? (
            <Button
              variant="ghost"
              className="text-destructive hover:text-destructive gap-1.5"
              onClick={() => { onDelete(service!.id); onOpenChange(false); }}
            >
              <Trash2 className="w-4 h-4" /> Видалити
            </Button>
          ) : <span />}
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>Скасувати</Button>
            <Button onClick={handleSave} disabled={!isValid}>Зберегти</Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
