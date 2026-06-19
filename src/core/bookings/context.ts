/**
 * Core re-export of `getBookableContext`.
 *
 * Новий код у `cabinets/bookings/*` і `public-booking/*` має імпортувати
 * саме звідси (`@/core/bookings/context`), а не з `@/config/demoCabinets/bookableContext`.
 * Реалізація поки що лишається у demoCabinets (це seed-резолвер демо-даних).
 */
export { getBookableContext, type BookableContext } from "@/config/demoCabinets/bookableContext";
