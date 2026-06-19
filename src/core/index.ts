/**
 * @/core — vertical-agnostic ядро для bookings/clients/resources/staff.
 *
 * Правило: новий код у `cabinets/settings/*`, `bookings/*`, `public-booking/*`
 * має імпортувати саме звідси, а не з історичних `SalonWorkstation`/`SalonMaster`/
 * `SalonClient`/`SalonBooking`. Старі імпорти продовжують працювати — це
 * сумісний шар поверх існуючих типів у `@/config/demoCabinets/salonData`.
 */
export type { BookableResource } from "./resources/types";
export type {
  StaffMember,
  StaffContractKind,
  StaffTerms,
  StaffPermission,
  StaffDelegationContract,
  StaffInvitation,
} from "./staff/types";
export type { Client } from "./clients/types";
export type { Booking, BookableService, WaitlistEntry } from "./bookings/types";

export { getVerticalPack, getVerticalPackById, getVerticalId, getVerticalIdOrNull, getSettingsSectionLabel } from "./verticalPack";
export { getBookableContext, type BookableContext } from "./bookings/context";
export type {
  VerticalPack,
  VerticalId,
  VerticalLabels,
  VerticalBookings,
  VerticalBookingRules,
  VerticalDefaults,
  VerticalSettings,
  ResourceKind,
  SettingsSectionId,
} from "./verticalPack";

