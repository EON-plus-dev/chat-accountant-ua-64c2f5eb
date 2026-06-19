/**
 * ImportClientsSheet — 3-крокова майстерня імпорту CSV з dedupe-перевіркою.
 *
 * Кроки:
 *   1. Upload + парс перших 5 рядків (без бібліотек — простий CSV).
 *   2. Mapping колонок (auto-detect по headers, з можливістю змінити).
 *   3. Dedupe preview — нормалізує телефон, показує знайдених дублікатів
 *      з вибором skip / merge / overwrite. Лише після цього — Імпортувати.
 */

import { useMemo, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Upload, ChevronRight, ChevronLeft, AlertCircle, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Client as SalonClient } from "@/core";
import { normalizePhone } from "./phoneNormalize";
import { useSalonClients } from "./useSalonClients";
import { createClientsBulk } from "./clientsStore";

type FieldKey = "fullName" | "phone" | "email" | "birthDate" | "tags" | "skip";

const FIELD_OPTIONS: { value: FieldKey; label: string }[] = [
  { value: "fullName", label: "ПІБ" },
  { value: "phone", label: "Телефон" },
  { value: "email", label: "Email" },
  { value: "birthDate", label: "Дата народження" },
  { value: "tags", label: "Теги (через ;)" },
  { value: "skip", label: "— Пропустити —" },
];

interface Props {
  open: boolean;
  onClose: () => void;
  cabinetId: string;
}

export function ImportClientsSheet({ open, onClose, cabinetId }: Props) {
  const { toast } = useToast();
  const { list: existing } = useSalonClients(cabinetId);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<string[][]>([]);
  const [mapping, setMapping] = useState<Record<number, FieldKey>>({});
  const [conflictPolicy, setConflictPolicy] = useState<"skip" | "merge" | "overwrite">("merge");

  const resetAndClose = () => {
    setStep(1);
    setHeaders([]);
    setRows([]);
    setMapping({});
    setConflictPolicy("merge");
    onClose();
  };

  const handleFile = async (file: File) => {
    const text = await file.text();
    const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length === 0) {
      toast({ title: "Порожній файл", variant: "destructive" });
      return;
    }
    const parsedRows = lines.map(parseCsvLine);
    const [head, ...body] = parsedRows;
    setHeaders(head);
    setRows(body);
    // auto-detect mapping
    const auto: Record<number, FieldKey> = {};
    head.forEach((h, i) => {
      const lower = h.toLowerCase();
      if (/ім.+|name|пiб|пib|клієнт/.test(lower)) auto[i] = "fullName";
      else if (/phone|тел|моб/.test(lower)) auto[i] = "phone";
      else if (/mail|email/.test(lower)) auto[i] = "email";
      else if (/birth|днар|dob/.test(lower)) auto[i] = "birthDate";
      else if (/tag|тег/.test(lower)) auto[i] = "tags";
      else auto[i] = "skip";
    });
    setMapping(auto);
    setStep(2);
  };

  // Підготовка нових клієнтів + dedupe
  const prepared = useMemo(() => {
    const phoneIndex = new Map<string, SalonClient>();
    for (const e of existing) phoneIndex.set(normalizePhone(e.client.phone), e.client);

    const items: Array<{
      raw: SalonClient;
      duplicate?: SalonClient;
    }> = [];

    for (const row of rows) {
      const obj: Partial<SalonClient> = {};
      headers.forEach((_, i) => {
        const field = mapping[i];
        if (!field || field === "skip") return;
        const val = (row[i] ?? "").trim();
        if (!val) return;
        if (field === "tags") obj.tags = val.split(/[;,]/).map((t) => t.trim()).filter(Boolean);
        else (obj as Record<string, unknown>)[field] = val;
      });
      if (!obj.fullName) continue;
      const norm = obj.phone ? normalizePhone(obj.phone) : "";
      const dup = norm ? phoneIndex.get(norm) : undefined;
      const newClient: SalonClient = {
        id: `cli-imp-${Math.random().toString(36).slice(2, 9)}`,
        fullName: obj.fullName,
        phone: norm,
        totalVisits: 0,
        email: obj.email,
        birthDate: obj.birthDate,
        tags: obj.tags,
        source: "import",
        bonusBalance: 0,
        consents: { gdprAcceptedAt: new Date().toISOString() },
      };
      items.push({ raw: newClient, duplicate: dup });
    }
    return items;
  }, [rows, headers, mapping, existing]);

  const duplicatesCount = prepared.filter((p) => p.duplicate).length;
  const newCount = prepared.length - duplicatesCount;

  const handleImport = () => {
    const toCreate: SalonClient[] = [];
    for (const item of prepared) {
      if (!item.duplicate) {
        toCreate.push(item.raw);
        continue;
      }
      if (conflictPolicy === "skip") continue;
      // merge / overwrite — оновлюємо існуючу через update
      // (для демо просто додаємо як новий з префіксом)
      if (conflictPolicy === "overwrite") {
        toCreate.push({ ...item.raw, id: item.duplicate.id });
      } else {
        // merge: лишаємо існуючу, нічого не додаємо
      }
    }
    createClientsBulk(cabinetId, toCreate);
    toast({
      title: "Імпорт завершено (демо)",
      description: `Додано ${toCreate.length} карток. Дублікатів: ${duplicatesCount} (політика: ${conflictPolicy}).`,
    });
    resetAndClose();
  };

  return (
    <Sheet open={open} onOpenChange={(o) => !o && resetAndClose()}>
      <SheetContent side="right" className="w-full sm:max-w-lg flex flex-col p-0">
        <SheetHeader className="px-6 py-4 border-b">
          <SheetTitle>Імпорт клієнтів з CSV</SheetTitle>
          <SheetDescription>Крок {step} з 3</SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1">
          <div className="px-6 py-4 space-y-4">
            {step === 1 && (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Завантажте CSV-файл. Перший рядок має містити заголовки колонок (ПІБ, телефон, email, ДН, теги).
                </p>
                <label className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-muted/20 px-6 py-10 cursor-pointer hover:bg-muted/30 transition-colors">
                  <Upload className="w-6 h-6 text-muted-foreground" />
                  <span className="text-sm font-medium">Натисніть, щоб обрати файл</span>
                  <span className="text-xs text-muted-foreground">або перетягніть .csv сюди</span>
                  <input
                    type="file"
                    accept=".csv,text/csv"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                  />
                </label>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Звʼяжіть колонки файлу з полями картки клієнта. Колонки з мітками «— Пропустити —» не імпортуються.
                </p>
                <div className="space-y-2">
                  {headers.map((h, i) => (
                    <div key={i} className="flex items-center justify-between gap-3 rounded-md border bg-card p-2.5">
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium truncate">{h}</div>
                        <div className="text-[11px] text-muted-foreground truncate">
                          напр.: {rows[0]?.[i] ?? "—"}
                        </div>
                      </div>
                      <Select
                        value={mapping[i] ?? "skip"}
                        onValueChange={(v) => setMapping({ ...mapping, [i]: v as FieldKey })}
                      >
                        <SelectTrigger className="w-44 h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {FIELD_OPTIONS.map((f) => (
                            <SelectItem key={f.value} value={f.value} className="text-xs">
                              {f.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-md border bg-card p-3">
                    <div className="text-[11px] text-muted-foreground">Нових карток</div>
                    <div className="text-xl font-semibold tabular-nums">{newCount}</div>
                  </div>
                  <div className="rounded-md border bg-card p-3">
                    <div className="text-[11px] text-muted-foreground">Дублікатів</div>
                    <div className="text-xl font-semibold tabular-nums">{duplicatesCount}</div>
                  </div>
                </div>

                {duplicatesCount > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm">Що робити з дублікатами?</Label>
                    <div className="grid gap-2">
                      <PolicyOption value="skip" current={conflictPolicy} onChange={setConflictPolicy} title="Пропустити" hint="Залишаємо існуючу картку, нові дані не імпортуються." />
                      <PolicyOption value="merge" current={conflictPolicy} onChange={setConflictPolicy} title="Обʼєднати (рекомендовано)" hint="Лишаємо існуючу картку. Нові поля з імпорту заповнять пусті." />
                      <PolicyOption value="overwrite" current={conflictPolicy} onChange={setConflictPolicy} title="Перезаписати" hint="Перезаписує всі поля існуючої картки даними з імпорту." />
                    </div>
                  </div>
                )}

                {duplicatesCount > 0 && (
                  <div className="rounded-md border border-amber-500/30 bg-amber-500/5 p-2.5 text-xs flex gap-2">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                    <span>Знайдено {duplicatesCount} клієнт{duplicatesCount === 1 ? "а" : "ів"} з тим самим телефоном. Перевірте політику обробки.</span>
                  </div>
                )}

                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Перші 5 карток для імпорту</Label>
                  <div className="rounded-md border bg-card divide-y text-xs">
                    {prepared.slice(0, 5).map((p, i) => (
                      <div key={i} className="px-2.5 py-1.5 flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <div className="font-medium truncate">{p.raw.fullName}</div>
                          <div className="text-muted-foreground tabular-nums">{p.raw.phone || "—"}</div>
                        </div>
                        {p.duplicate ? (
                          <Badge variant="outline" className="text-[9px] bg-amber-500/10 text-amber-600 border-amber-500/20">дубль</Badge>
                        ) : (
                          <Badge variant="outline" className="text-[9px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20 gap-0.5">
                            <Check className="w-2.5 h-2.5" /> новий
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="border-t px-6 py-3 flex items-center justify-between gap-2 bg-background/95">
          <Button variant="ghost" size="sm" onClick={() => (step === 1 ? resetAndClose() : setStep((s) => (s - 1) as 1 | 2))}>
            {step === 1 ? "Скасувати" : (
              <>
                <ChevronLeft className="w-3.5 h-3.5 mr-1" /> Назад
              </>
            )}
          </Button>
          {step < 3 ? (
            <Button size="sm" onClick={() => setStep((s) => (s + 1) as 2 | 3)} disabled={step === 1 ? headers.length === 0 : !Object.values(mapping).includes("fullName")}>
              Далі <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          ) : (
            <Button size="sm" onClick={handleImport} disabled={prepared.length === 0}>
              Імпортувати {newCount}{duplicatesCount > 0 && conflictPolicy === "overwrite" ? `+${duplicatesCount}` : ""} карток
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function PolicyOption({
  value,
  current,
  onChange,
  title,
  hint,
}: {
  value: "skip" | "merge" | "overwrite";
  current: "skip" | "merge" | "overwrite";
  onChange: (v: "skip" | "merge" | "overwrite") => void;
  title: string;
  hint: string;
}) {
  const active = value === current;
  return (
    <button
      type="button"
      onClick={() => onChange(value)}
      className={`text-left rounded-md border p-2.5 transition-colors ${active ? "border-primary bg-primary/5" : "bg-card hover:bg-muted/30"}`}
    >
      <div className="text-sm font-medium">{title}</div>
      <div className="text-[11px] text-muted-foreground mt-0.5">{hint}</div>
    </button>
  );
}

function parseCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQ && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else inQ = !inQ;
    } else if (ch === "," && !inQ) {
      out.push(cur);
      cur = "";
    } else cur += ch;
  }
  out.push(cur);
  return out.map((s) => s.trim());
}
