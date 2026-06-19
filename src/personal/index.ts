/**
 * @/personal — top-level namespace для individual-кабінетів.
 *
 * Паралельно з:
 *   - `@/core/*`       — Vertical Packs для бізнес-кабінетів
 *   - `@/modules/*`    — horizontal shared modules (crm/tasks/orders/warehouse/documents)
 *
 * Правило: код, що стосується ментальної моделі ФІЗИЧНОЇ ОСОБИ
 * (час > гроші, дім > компанія, родина > команда) живе тут, а не в `@/core/`.
 */

export type { PersonalPack, PersonalSection, PersonalSectionId } from "./composition";
export { DEFAULT_PERSONAL_PACK, getPersonalPack, getPersonalSection } from "./composition";
