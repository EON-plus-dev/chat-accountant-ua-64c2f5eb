/**
 * ShiftEditorSheet — демо-форма створення/редагування зміни майстра.
 */

import { useMemo, useState, useEffect } from "react";
import { CalendarClock, AlertTriangle, Trash2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  salonMasters,
  salonWorkstations,
  type MasterShift,
} from "@/config/demoCabinets/salonData";

export interface ShiftDraft {
  date: string;
  masterId: string;
  workstationId: string;
  startHour: number;
  endHour: number;
  /** Якщо undefined — новий запис. */
  originalKey?: string;
}

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  draft: ShiftDraft | null;
  allShifts: MasterShift[];
  onSave: (draft: ShiftDraft) => void;
  onDelete?: (draft: ShiftDraft) => void;
}

const HOURS = Array.from({ length: 25 }, (_, i) => i); // 0..24 для start, end

export function ShiftEditorSheet({ open, onOpenChange, draft, allShifts, onSave, onDelete }: Props) {
  const [workstationId, setWorkstationId] = useState<string>("");
  const [startHour, setStartHour] = useState<number>(9);
  const [endHour, setEndHour] = useState<number>(18);

  useEffect(() => {
    if (!draft) return;
    setWorkstationId(draft.workstationId);
    setStartHour(draft.startHour);
    setEndHour(draft.endHour);
  }, [draft]);

  const master = draft ? salonMasters.find((m) => m.id === draft.masterId) : null;

  const allowedWorkstations = useMemo(() => {
    if (!master) return salonWorkstations;
    // Робочі місця, де категорія перетинається зі спеціальністю майстра
    return salonWorkstations.filter((w) =>
      w.allowedCategories.some((c) => master.specialties.includes(c)),
    );
  }, [master]);

  const conflict = useMemo(() => {
    if (!draft) return null;
    const overlap = (s: MasterShift) =>
      s.date === draft.date &&
      !(endHour <= s.startHour || startHour >= s.endHour);
    const conflicts = allShifts.filter((s) => {
      if (draft.originalKey && shiftKey(s) === draft.originalKey) return false;
      if (!overlap(s)) return false;
      return s.masterId === draft.masterId || s.workstationId === workstationId;
    });
    if (conflicts.length === 0) return null;
    const c = conflicts[0];
    if (c.workstationId === workstationId) {
      const otherMaster = salonMasters.find((m) => m.id === c.masterId);
      return `Це місце вже зайняте: ${otherMaster?.shortName ?? c.masterId} · ${c.startHour}:00–${c.endHour}:00`;
    }
    return `У майстра вже є зміна цього дня: ${c.startHour}:00–${c.endHour}:00`;
  }, [draft, allShifts, workstationId, startHour, endHour]);

  const isValid = workstationId && startHour < endHour && !conflict;

  if (!draft) return null;

  const handleSave = () => {
    if (!isValid) return;
    onSave({ ...draft, workstationId, startHour, endHour });
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <CalendarClock className="w-4 h-4" />
            {draft.originalKey ? "Редагувати зміну" : "Нова зміна"}
          </SheetTitle>
          <SheetDescription>
            {master?.fullName} ·{" "}
            {new Date(draft.date).toLocaleDateString("uk-UA", { weekday: "long", day: "2-digit", month: "long" })}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-1.5">
            <Label>Робоче місце</Label>
            <Select value={workstationId} onValueChange={setWorkstationId}>
              <SelectTrigger><SelectValue placeholder="Виберіть місце" /></SelectTrigger>
              <SelectContent>
                {allowedWorkstations.map((w) => (
                  <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-[11px] text-muted-foreground">
              Доступні місця за спеціальностями: {master?.specialties.join(", ")}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Початок</Label>
              <Select value={String(startHour)} onValueChange={(v) => setStartHour(Number(v))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {HOURS.slice(6, 23).map((h) => (
                    <SelectItem key={h} value={String(h)}>{String(h).padStart(2, "0")}:00</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Кінець</Label>
              <Select value={String(endHour)} onValueChange={(v) => setEndHour(Number(v))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {HOURS.slice(7, 24).map((h) => (
                    <SelectItem key={h} value={String(h)}>{String(h).padStart(2, "0")}:00</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {conflict && (
            <div className="flex items-start gap-2 p-2.5 rounded-md bg-destructive/10 border border-destructive/30 text-destructive text-xs">
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{conflict}</span>
            </div>
          )}

          {!conflict && startHour < endHour && (
            <div className="rounded-md border bg-muted/30 p-2.5 text-xs">
              Тривалість: <span className="font-semibold">{endHour - startHour} год</span>
            </div>
          )}
        </div>

        <SheetFooter className="gap-2 flex-row justify-between sm:justify-between">
          {draft.originalKey && onDelete ? (
            <Button
              variant="ghost"
              className="text-destructive hover:text-destructive gap-1.5"
              onClick={() => { onDelete(draft); onOpenChange(false); }}
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

export function shiftKey(s: { date: string; masterId: string; workstationId: string; startHour: number }) {
  return `${s.date}::${s.masterId}::${s.workstationId}::${s.startHour}`;
}
