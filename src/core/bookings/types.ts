/**
 * Core: Booking
 *
 * Vertical-agnostic запис/бронювання. Re-export з історичного
 * `SalonBooking` (який вже отримав поля `nights`/`endDate`/`guestsCount`
 * для готелю і `salonCabinetId`/`masterCabinetId`/`revenueOwner` для
 * dual-cabinet моделі).
 */
export type {
  SalonBooking as Booking,
  SalonService as BookableService,
  SalonWaitlistEntry as WaitlistEntry,
} from "@/config/demoCabinets/salonData";
