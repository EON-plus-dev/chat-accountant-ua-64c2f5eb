/**
 * computeAvailability — єдиний рушій розрахунку вільних слотів.
 * Використовується wizard'ом і AI-tool'ом `check_availability`.
 *
 * Враховує:
 *  - робочі дні + години майстра (`SalonMaster.schedule`)
 *  - наявні записи (`salonBookings` + локальні публічні)
 *  - тривалість послуг (сума `durationMin`)
 *  - buffer-time (10 хв між записами за замовч.)
 *  - lock робочого місця (workstationId зайнятий → слот недоступний)
 *  - мін. лід-час (2 год за замовч.)
 *  - горизонт (14 днів за замовч.)
 *  - округлення до 15-хв сітки
 */

import type { StaffMember as SalonMaster, BookableService as SalonService, BookableResource as SalonWorkstation } from "@/core";
import { getBookableContext } from "@/core";
import type { AvailableSlot } from "./types";
import { listPublicBookings } from "./store";

interface ComputeArgs {
  cabinetId: string;
  serviceIds: string[];
  masterId?: string;
  fromDate?: Date;
  daysAhead?: number;
  bufferMin?: number;
  minLeadHours?: number;
}

const SLOT_STEP_MIN = 15;

function toMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function fromMinutes(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function findWorkstationFor(
  master: SalonMaster,
  serviceIds: string[],
  services: SalonService[],
  workstations: SalonWorkstation[],
): string | null {
  const cats = new Set(
    serviceIds
      .map((id) => services.find((s) => s.id === id)?.category)
      .filter(Boolean) as string[],
  );
  for (const wsId of master.preferredWorkstationIds ?? []) {
    const ws = workstations.find((w) => w.id === wsId);
    if (!ws) continue;
    if ([...cats].every((c) => ws.allowedCategories.includes(c as never))) {
      return ws.id;
    }
  }
  const ws = workstations.find((w) =>
    [...cats].every((c) => w.allowedCategories.includes(c as never)),
  );
  return ws?.id ?? null;
}

export function computeAvailability(args: ComputeArgs): AvailableSlot[] {
  const {
    cabinetId,
    serviceIds,
    masterId,
    fromDate = new Date(),
    daysAhead = 14,
    bufferMin = 10,
    minLeadHours = 2,
  } = args;

  if (serviceIds.length === 0) return [];

  const ctx = getBookableContext(cabinetId);
  const { services, masters, workstations, bookings } = ctx;

  const totalDuration =
    serviceIds.reduce((sum, id) => {
      const svc = services.find((s) => s.id === id);
      return sum + (svc?.durationMin ?? 0);
    }, 0) || 30;

  const candidates = masterId
    ? masters.filter((m) => m.id === masterId)
    : masters.filter((m) => {
        // Майстер має вміти ВСІ обрані категорії
        const cats = new Set(
          serviceIds.map((id) => services.find((s) => s.id === id)?.category).filter(Boolean),
        );
        return [...cats].every((c) => m.specialties.includes(c as never));
      });

  const publicBookings = listPublicBookings(cabinetId);
  const now = new Date();
  const minStartMs = now.getTime() + minLeadHours * 60 * 60 * 1000;
  const slots: AvailableSlot[] = [];

  for (let d = 0; d <= daysAhead; d++) {
    const day = new Date(fromDate);
    day.setDate(day.getDate() + d);
    const date = isoDate(day);
    const dow = day.getDay();

    for (const master of candidates) {
      if (!master.schedule.workDays.includes(dow)) continue;
      const workstationId = findWorkstationFor(master, serviceIds, services, workstations);
      if (!workstationId) continue;

      // Зайняті інтервали для цього майстра в цей день
      const busy = [
        ...bookings
          .filter((b) => b.date === date && b.masterId === master.id && b.status !== "canceled")
          .map((b) => ({
            start: toMinutes(b.startTime),
            end: toMinutes(b.startTime) + b.durationMin,
          })),
        ...publicBookings
          .filter((b) => b.date === date && b.masterId === master.id && b.status === "scheduled")
          .map((b) => ({
            start: toMinutes(b.startTime),
            end: toMinutes(b.startTime) + b.durationMin,
          })),
        // Зайнятість робочого місця іншими майстрами
        ...bookings
          .filter(
            (b) =>
              b.date === date &&
              b.workstationId === workstationId &&
              b.masterId !== master.id &&
              b.status !== "canceled",
          )
          .map((b) => ({
            start: toMinutes(b.startTime),
            end: toMinutes(b.startTime) + b.durationMin,
          })),
      ];

      const startMin = master.schedule.startHour * 60;
      const endMin = master.schedule.endHour * 60 - totalDuration;

      for (let t = startMin; t <= endMin; t += SLOT_STEP_MIN) {
        const slotStart = t;
        const slotEnd = t + totalDuration;

        // Перетин з зайнятими (з урахуванням buffer)
        const overlaps = busy.some(
          (b) => slotStart < b.end + bufferMin && slotEnd > b.start - bufferMin,
        );
        if (overlaps) continue;

        // Мін. лід-час
        const slotMs = new Date(`${date}T${fromMinutes(slotStart)}:00`).getTime();
        if (slotMs < minStartMs) continue;

        slots.push({
          date,
          startTime: fromMinutes(slotStart),
          endTime: fromMinutes(slotEnd),
          masterId: master.id,
          workstationId,
        });
      }
    }
  }

  return slots;
}

export function groupSlotsByDate(slots: AvailableSlot[]): Record<string, AvailableSlot[]> {
  return slots.reduce<Record<string, AvailableSlot[]>>((acc, slot) => {
    (acc[slot.date] ||= []).push(slot);
    return acc;
  }, {});
}
