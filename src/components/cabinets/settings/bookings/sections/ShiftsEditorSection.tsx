/**
 * ShiftsEditorSection — тижневий редактор змін майстрів.
 * Грід день × майстер, з робочим місцем і годинами зміни на дату.
 */

import { useState, useMemo } from "react";
import { CalendarClock, AlertTriangle, Copy, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { Cabinet } from "@/types/cabinet";
import {
  salonMasters,
  salonWorkstations,
  salonShifts as initialShifts,
  type MasterShift,
} from "@/config/demoCabinets/salonData";
import { SectionShell } from "../shared/SectionShell";
import { getSettingsSectionLabel } from "@/core";
import { ShiftEditorSheet, shiftKey, type ShiftDraft } from "./_ShiftEditorSheet";

const DAY_LABELS = ["Нд", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];

export function ShiftsEditorSection({ cabinet }: { cabinet: Cabinet }) {
  const { toast } = useToast();
  const [shifts, setShifts] = useState<MasterShift[]>(initialShifts);
  const [editorOpen, setEditorOpen] = useState(false);
  const [draft, setDraft] = useState<ShiftDraft | null>(null);
  const [copyDialog, setCopyDialog] = useState(false);
  const [weekStart] = useState(() => {
    const d = new Date();
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diff);
    d.setHours(0, 0, 0, 0);
    return d;
  });

  const days = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekStart);
      d.setDate(d.getDate() + i);
      return {
        date: d,
        iso: d.toISOString().split("T")[0],
        label: DAY_LABELS[d.getDay()],
        dayNum: d.getDate(),
      };
    });
  }, [weekStart]);

  // Конфлікти: дві зміни на тому ж місці в той самий день з перетином годин
  const conflicts = useMemo(() => {
    const set = new Set<string>();
    days.forEach((d) => {
      const dayShifts = shifts.filter((s) => s.date === d.iso);
      for (let i = 0; i < dayShifts.length; i++) {
        for (let j = i + 1; j < dayShifts.length; j++) {
          const a = dayShifts[i];
          const b = dayShifts[j];
          if (a.workstationId === b.workstationId && overlaps(a, b)) {
            set.add(`${d.iso}::${a.masterId}`);
            set.add(`${d.iso}::${b.masterId}`);
          }
        }
      }
    });
    return set;
  }, [days, shifts]);

  const label = getSettingsSectionLabel(cabinet, "shifts", {
    title: "Графік змін",
    description: "Тижневий редактор: хто, коли, на якому робочому місці. Конфлікти двох майстрів на одному місці підсвічуються.",
  });
  return (
    <SectionShell
      title={label.title}
      description={label.description}
      actions={
        <Button
          size="sm"
          variant="outline"
          className="gap-1.5"
          onClick={() => setCopyDialog(true)}
        >
          <Copy className="w-4 h-4" />
          Копіювати тиждень вперед
        </Button>
      }
    >
      {conflicts.size > 0 && (
        <div className="flex items-start gap-2 p-2.5 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 text-xs">
          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>
            Виявлено {conflicts.size / 2} конфлікт{conflicts.size / 2 === 1 ? "" : "и"}: двоє майстрів на одному робочому місці в перетинні годин.
          </span>
        </div>
      )}

      <div className="rounded-lg border overflow-x-auto">
        <table className="w-full text-xs min-w-[640px]">
          <thead className="bg-muted/40 text-[10px] uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="text-left font-medium px-2 py-2 sticky left-0 bg-muted/40 z-10">Майстер</th>
              {days.map((d) => (
                <th key={d.iso} className="text-center font-medium px-2 py-2 min-w-[88px]">
                  <div>{d.label}</div>
                  <div className="text-[11px] text-foreground font-semibold">{d.dayNum}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {salonMasters.map((m) => (
              <tr key={m.id} className="border-t">
                <td className="px-2 py-1.5 sticky left-0 bg-card z-10 border-r">
                  <div className="flex items-center gap-1.5 min-w-[120px]">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-semibold text-white shrink-0"
                      style={{ backgroundColor: m.color }}
                    >
                      {m.avatarInitials}
                    </div>
                    <span className="truncate text-[11px] font-medium">{m.shortName}</span>
                  </div>
                </td>
                {days.map((d) => {
                  const shift = shifts.find((s) => s.date === d.iso && s.masterId === m.id);
                  const conflict = conflicts.has(`${d.iso}::${m.id}`);
                  const ws = shift ? salonWorkstations.find((w) => w.id === shift.workstationId) : null;
                  const openEditor = () => {
                    if (shift) {
                      setDraft({
                        date: shift.date,
                        masterId: shift.masterId,
                        workstationId: shift.workstationId,
                        startHour: shift.startHour,
                        endHour: shift.endHour,
                        originalKey: shiftKey(shift),
                      });
                    } else {
                      const defaultWs = m.preferredWorkstationIds?.[0] ?? salonWorkstations.find((w) => w.allowedCategories.some((c) => m.specialties.includes(c)))?.id ?? salonWorkstations[0].id;
                      setDraft({
                        date: d.iso,
                        masterId: m.id,
                        workstationId: defaultWs,
                        startHour: m.schedule.startHour,
                        endHour: m.schedule.endHour,
                      });
                    }
                    setEditorOpen(true);
                  };
                  return (
                    <td key={d.iso} className="px-1 py-1 align-top">
                      {shift && ws ? (
                        <button
                          type="button"
                          onClick={openEditor}
                          className={cn(
                            "w-full text-left rounded-md p-1.5 text-[10px] leading-tight border cursor-pointer hover:shadow-sm transition-all",
                            conflict
                              ? "bg-amber-500/10 border-amber-500/40 text-amber-700 dark:text-amber-400"
                              : "bg-primary/5 border-primary/20",
                          )}
                        >
                          <div className="font-medium tabular-nums">
                            {shift.startHour}:00–{shift.endHour}:00
                          </div>
                          <div className="text-muted-foreground truncate">{ws.name}</div>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={openEditor}
                          className="w-full h-full min-h-[36px] rounded-md border border-dashed border-border/40 hover:border-primary/40 hover:bg-primary/5 flex items-center justify-center text-muted-foreground/60 hover:text-primary transition"
                          aria-label="Додати зміну"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-start gap-2 text-[11px] text-muted-foreground p-2.5 rounded-md bg-muted/30 border">
        <CalendarClock className="w-3.5 h-3.5 mt-0.5 shrink-0" />
        <span>
          За замовч. майстер працює на своєму «основному» робочому місці (з картки майстра).
          Зміни тут перевизначають для конкретної дати.
        </span>
      </div>

      <ShiftEditorSheet
        open={editorOpen}
        onOpenChange={setEditorOpen}
        draft={draft}
        allShifts={shifts}
        onSave={(d) => {
          setShifts((arr) => {
            const filtered = d.originalKey ? arr.filter((s) => shiftKey(s) !== d.originalKey) : arr;
            return [...filtered, { date: d.date, masterId: d.masterId, workstationId: d.workstationId, startHour: d.startHour, endHour: d.endHour }];
          });
          toast({ title: d.originalKey ? "Зміну оновлено (демо)" : "Зміну додано (демо)" });
        }}
        onDelete={(d) => {
          setShifts((arr) => arr.filter((s) => shiftKey(s) !== d.originalKey));
          toast({ title: "Зміну видалено (демо)" });
        }}
      />

      <AlertDialog open={copyDialog} onOpenChange={setCopyDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Копіювати поточний тиждень?</AlertDialogTitle>
            <AlertDialogDescription>
              Усі зміни цього тижня будуть продубльовані на наступний. Конфлікти на робочих місцях будуть пропущені.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Скасувати</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                const wkIsos = new Set(days.map((d) => d.iso));
                const additions: MasterShift[] = [];
                shifts.forEach((s) => {
                  if (!wkIsos.has(s.date)) return;
                  const next = new Date(s.date);
                  next.setDate(next.getDate() + 7);
                  const nextIso = next.toISOString().split("T")[0];
                  const conflict = shifts.some(
                    (x) => x.date === nextIso && (x.workstationId === s.workstationId || x.masterId === s.masterId) && !(x.endHour <= s.startHour || x.startHour >= s.endHour),
                  );
                  if (!conflict) {
                    additions.push({ ...s, date: nextIso });
                  }
                });
                setShifts((arr) => [...arr, ...additions]);
                toast({ title: `Скопійовано ${additions.length} змін (демо)` });
              }}
            >
              Скопіювати
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SectionShell>
  );
}

function overlaps(a: MasterShift, b: MasterShift): boolean {
  return a.startHour < b.endHour && b.startHour < a.endHour;
}
