/**
 * NOMENCLATURE DOCUMENTS TAB
 * 
 * Обгортка для NomenclatureDocumentsSection як таб у деталях номенклатури
 */

import { NomenclatureDocumentsSection } from "./NomenclatureDocumentsSection";
import type { NomenclatureItemV2 } from "@/config/nomenclatureConfig";

interface NomenclatureDocumentsTabProps {
  item: NomenclatureItemV2;
  onNavigateToDocument?: (documentId: string) => void;
  onAddDocument?: () => void;
}

export const NomenclatureDocumentsTab = ({
  item,
  onNavigateToDocument,
  onAddDocument,
}: NomenclatureDocumentsTabProps) => {
  return (
    <NomenclatureDocumentsSection
      item={item}
      onNavigateToDocument={onNavigateToDocument}
      onAddDocument={onAddDocument}
    />
  );
};
