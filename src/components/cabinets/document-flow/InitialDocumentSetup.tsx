/**
 * InitialDocumentSetup Component
 * Stage 1: Select document type and template before entering the editor
 * Uses Enterprise Card Grid TemplateSelector with Quick Preview
 */

import type { Cabinet } from "@/types/cabinet";
import { type DocumentType } from "@/config/documentFlowConfig";
import { type DocumentTemplate } from "@/config/documentTemplatesConfig";
import { TemplateSelector } from "./template-selector";

interface InitialDocumentSetupProps {
  cabinet: Cabinet;
  onProceed: (type: DocumentType, template: DocumentTemplate | null) => void;
  onNavigateToCreateTemplate?: () => void;
}

export function InitialDocumentSetup({
  cabinet,
  onProceed,
  onNavigateToCreateTemplate,
}: InitialDocumentSetupProps) {
  const handleSelect = (type: DocumentType, template: DocumentTemplate) => {
    onProceed(type, template);
  };

  return (
    <TemplateSelector
      cabinet={cabinet}
      onSelect={handleSelect}
      onCreateTemplate={onNavigateToCreateTemplate}
    />
  );
}
