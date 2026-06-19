/**
 * Виявлення конфліктів бронювань:
 *  - master double-book (один майстер у два місця в один час)
 *  - workstation double-book (одне крісло у два майстри/клієнти)
 *
 * Усі функції приймають вже відфільтрований масив (зазвичай за днем).
 */

import type { Booking as SalonBooking } from "@/core";

export type ConflictKind = "master" | "workstation";

export interface BookingConflict {
  bookingId: string;
  kind: ConflictKind;
  otherId: string;
}

function toMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function overlaps(a: SalonBooking, b: SalonBooking): boolean {
  if (a.date !== b.date) return false;
  const aStart = toMinutes(a.startTime);
  const aEnd = aStart + a.durationMin;
  const bStart = toMinutes(b.startTime);
  const bEnd = bStart + b.durationMin;
  return aStart < bEnd && bStart < aEnd;
}

const ACTIVE: SalonBooking["status"][] = ["scheduled", "confirmed", "done"];

export function findConflicts(bookings: SalonBooking[]): Map<string, BookingConflict[]> {
  const out = new Map<string, BookingConflict[]>();
  const active = bookings.filter((b) => ACTIVE.includes(b.status));
  for (let i = 0; i < active.length; i++) {
    for (let j = i + 1; j < active.length; j++) {
      const a = active[i];
      const b = active[j];
      if (!overlaps(a, b)) continue;
      if (a.masterId === b.masterId) {
        push(out, a.id, { bookingId: a.id, kind: "master", otherId: b.id });
        push(out, b.id, { bookingId: b.id, kind: "master", otherId: a.id });
      }
      if (a.workstationId && a.workstationId === b.workstationId) {
        push(out, a.id, { bookingId: a.id, kind: "workstation", otherId: b.id });
        push(out, b.id, { bookingId: b.id, kind: "workstation", otherId: a.id });
      }
    }
  }
  return out;
}

function push(map: Map<string, BookingConflict[]>, id: string, c: BookingConflict) {
  const arr = map.get(id) ?? [];
  arr.push(c);
  map.set(id, arr);
}

/** Перевірити, чи перенесення/створення створить конфлікт. Повертає причини. */
export function checkPlacement(args: {
  bookings: SalonBooking[];
  excludeId?: string;
  date: string;
  startTime: string;
  durationMin: number;
  masterId: string;
  workstationId?: string;
}): { master: boolean; workstation: boolean } {
  const candidate: SalonBooking = {
    id: "__candidate__",
    date: args.date,
    startTime: args.startTime,
    durationMin: args.durationMin,
    masterId: args.masterId,
    workstationId: args.workstationId ?? "",
    clientId: "",
    serviceIds: [],
    totalPrice: 0,
    commissionAmount: 0,
    status: "confirmed",
  };
  let master = false;
  let workstation = false;
  for (const b of args.bookings) {
    if (b.id === args.excludeId) continue;
    if (!ACTIVE.includes(b.status)) continue;
    if (!overlaps(candidate, b)) continue;
    if (b.masterId === args.masterId) master = true;
    if (args.workstationId && b.workstationId === args.workstationId) workstation = true;
  }
  return { master, workstation };
}
