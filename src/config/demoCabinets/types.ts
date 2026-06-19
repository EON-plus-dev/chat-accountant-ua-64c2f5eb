/**
 * DEMO CABINET TYPES
 * Shared type definitions and constants
 */

// Список ID демо-кабінетів
export const DEMO_CABINET_IDS = [
  "demo-consulting-3",
  "demo-autorepair-2",
  "demo-it-3",
  "demo-dealer-2",
  "demo-individual-declarant",
  "demo-salon-3",
  "demo-tennis-3",
] as const;

export type DemoCabinetId = typeof DEMO_CABINET_IDS[number];

export const isDemoCabinet = (cabinetId: string): cabinetId is DemoCabinetId => {
  return DEMO_CABINET_IDS.includes(cabinetId as DemoCabinetId);
};
