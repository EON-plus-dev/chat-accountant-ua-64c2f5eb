/**
 * Core: BookableResource
 *
 * Vertical-agnostic alias для ресурсу, що бронюється: крісло (salon),
 * корт (tennis), номер (hotel), стіл (restaurant).
 *
 * Поки що реалізовано як re-export з історичного `SalonWorkstation`,
 * щоб уникнути breaking changes. Нові модулі мають імпортувати
 * саме з `@/core/resources`.
 */
export type { SalonWorkstation as BookableResource } from "@/config/demoCabinets/salonData";
