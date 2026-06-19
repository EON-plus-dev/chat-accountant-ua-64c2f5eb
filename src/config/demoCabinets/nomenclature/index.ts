/**
 * NOMENCLATURE DEMO DATA - Central Export
 * 
 * Демо-дані номенклатури для 4-х спеціалізованих кабінетів
 * з різними сценаріями синхронізації та станами
 */

export * from "./consultingNomenclature";
export * from "./autorepairNomenclature";
export * from "./itNomenclature";
export * from "./dealerNomenclature";

// ============================================
// UNIFIED GETTER
// ============================================

import type { NomenclatureItemV2 } from "@/config/nomenclatureConfig";
import { consultingNomenclature } from "./consultingNomenclature";
import { autorepairNomenclature } from "./autorepairNomenclature";
import { itNomenclature } from "./itNomenclature";
import { dealerNomenclature } from "./dealerNomenclature";

export const getDemoNomenclatureV2ForCabinet = (cabinetId: string): NomenclatureItemV2[] => {
  switch (cabinetId) {
    case "demo-consulting-3":
      return consultingNomenclature;
    case "demo-autorepair-2":
      return autorepairNomenclature;
    case "demo-it-3":
      return itNomenclature;
    case "demo-dealer-2":
      return dealerNomenclature;
    default:
      return [];
  }
};
