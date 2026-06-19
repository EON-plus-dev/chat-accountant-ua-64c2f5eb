/**
 * Bookable context — джерело bookings/masters/services/workstations/clients
 * для конкретного кабінету з типом `bookings` (салон / тенісний клуб / клініка / ...).
 *
 * Дозволяє BookingsPage / useMergedSalonBookings / похідним хукам не
 * хардкодити salonXxx, а отримувати дані за `cabinet.id`.
 */

import {
  salonBookings,
  salonClients,
  salonMasters,
  salonServices,
  salonShifts,
  salonWorkstations,
  type MasterShift,
  type SalonBooking,
  type SalonClient,
  type SalonMaster,
  type SalonService,
  type SalonWorkstation,
} from "./salonData";
import {
  tennisBookings,
  tennisClients,
  tennisCoaches,
  tennisServices,
  tennisWorkstations,
} from "./tennisData";
import {
  restaurantBookings,
  restaurantClients,
  restaurantStaff,
  restaurantServices,
  restaurantTables,
} from "./restaurantData";
import {
  hotelBookings,
  hotelClients,
  hotelRooms,
  hotelServices,
} from "./hotelData";

export interface BookableContext {
  masters: SalonMaster[];
  services: SalonService[];
  clients: SalonClient[];
  workstations: SalonWorkstation[];
  bookings: SalonBooking[];
  shifts: MasterShift[];
}

/** Генерує `MasterShift[]` ±7 днів за `schedule` майстра + 1-й preferred workstation. */
function generateShiftsFor(masters: SalonMaster[]): MasterShift[] {
  const out: MasterShift[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let offset = -7; offset <= 7; offset++) {
    const d = new Date(today);
    d.setDate(d.getDate() + offset);
    const dateIso = d.toISOString().split("T")[0];
    const dow = d.getDay();
    for (const m of masters) {
      if (!m.schedule.workDays.includes(dow)) continue;
      const wsId = m.preferredWorkstationIds?.[0];
      if (!wsId) continue;
      out.push({
        date: dateIso,
        masterId: m.id,
        workstationId: wsId,
        startHour: m.schedule.startHour,
        endHour: m.schedule.endHour,
      });
    }
  }
  return out;
}

const tennisShifts: MasterShift[] = generateShiftsFor(tennisCoaches);
const restaurantShifts: MasterShift[] = generateShiftsFor(restaurantStaff);

export function getBookableContext(cabinetId: string): BookableContext {
  if (cabinetId === "demo-tennis-3") {
    return {
      masters: tennisCoaches,
      services: tennisServices,
      clients: tennisClients,
      workstations: tennisWorkstations,
      bookings: tennisBookings,
      shifts: tennisShifts,
    };
  }
  if (cabinetId === "demo-restaurant-3") {
    return {
      masters: restaurantStaff,
      services: restaurantServices,
      clients: restaurantClients,
      workstations: restaurantTables,
      bookings: restaurantBookings,
      shifts: restaurantShifts,
    };
  }
  if (cabinetId === "demo-hotel-3") {
    // Готель: гість бронює номер напряму, без вибору майстра.
    return {
      masters: [],
      services: hotelServices,
      clients: hotelClients,
      workstations: hotelRooms,
      bookings: hotelBookings,
      shifts: [],
    };
  }
  return {
    masters: salonMasters,
    services: salonServices,
    clients: salonClients,
    workstations: salonWorkstations,
    bookings: salonBookings,
    shifts: salonShifts,
  };
}
