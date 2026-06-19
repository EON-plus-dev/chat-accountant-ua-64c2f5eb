/**
 * TemplateTestStep - Testing step for template editing flow
 * Uses AnchorCardStrip (same as document creation) with DocumentLivePreview
 * Implements bidirectional sync: card ↔ document field navigation
 */

import { useMemo, useCallback, useState, useRef } from "react";
import { cn } from "@/lib/utils";
import DOMPurify from "dompurify";
import { AnchorCardStrip } from "../anchor-cards/AnchorCardStrip";
import { PositionsSheet } from "../PositionsSheet";
import { PartyRoleSelector } from "./PartyRoleSelector";
import type { UnifiedTemplateField } from "@/types/templateField";
import type { Cabinet } from "@/types/cabinet";
import type { DocumentTemplate } from "@/config/documentTemplatesConfig";
import type { DocumentType } from "@/config/documentFlowConfig";
import type { DocumentPosition } from "@/config/documentTemplateGenerator";
import type { Contractor } from "@/config/settingsConfig";

// Escape HTML for safe rendering
const escapeHtml = (text: string): string => {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
};

interface TemplateTestStepProps {
  fields: UnifiedTemplateField[];
  documentText: string;
  cabinet: Cabinet;
  testValues: Record<string, string>;
  onTestValuesChange: (values: Record<string, string>) => void;
  // Template info for preview
  template?: DocumentTemplate;
  documentType?: DocumentType;
}

// Get cabinet value by source key
const getCabinetValue = (cabinet: Cabinet, sourceKey?: string): string => {
  if (!sourceKey) return "";
  
  const keyMap: Record<string, string | undefined> = {
    "cabinet.name": cabinet.name,
    "cabinet.edrpou": cabinet.taxId,
    "cabinet.taxId": cabinet.taxId,
  };

  return keyMap[sourceKey] || "";
};

// Get contractor value by source key
const getContractorValue = (contractor: Contractor | null, sourceKey?: string): string => {
  if (!contractor || !sourceKey) return "";
  
  const keyMap: Record<string, string | undefined> = {
    "contractor.name": contractor.name,
    "contractor.code": contractor.code,
    "contractor.edrpou": contractor.code,
    "contractor.address": contractor.address,
    "contractor.iban": contractor.iban,
    "contractor.phone": contractor.phone,
    "contractor.email": contractor.email,
  };

  return keyMap[sourceKey] || "";
};

export const TemplateTestStep = ({
  fields,
  documentText,
  cabinet,
  testValues,
  onTestValuesChange,
  template,
  documentType = "invoice",
}: TemplateTestStepProps) => {
  const previewRef = useRef<HTMLDivElement>(null);
  
  // Highlighted field for bidirectional sync
  const [highlightedFieldId, setHighlightedFieldId] = useState<string | null>(null);
  
  // Contractor state (interactive selection)
  const [testContractor, setTestContractor] = useState<Contractor | null>(null);
  
  // Positions state and sheet
  const [positions, setPositions] = useState<DocumentPosition[]>([]);
  
  // Party role selection state
  const [partyRole, setPartyRole] = useState<"cabinet" | "contractor" | null>(null);
  const [positionsSheetOpen, setPositionsSheetOpen] = useState(false);

  // Remap fields based on party role selection
  const remappedFields = useMemo(() => {
    if (!partyRole || partyRole === "cabinet") return fields;
    // User chose "contractor" role — swap cabinet <-> contractor sources
    return fields.map(f => {
      if (f.source === "cabinet") {
        return {
          ...f,
          source: "contractor" as const,
          sourceKey: f.sourceKey?.replace(/^cabinet\./, "contractor."),
        };
      }
      if (f.source === "contractor") {
        return {
          ...f,
          source: "cabinet" as const,
          sourceKey: f.sourceKey?.replace(/^contractor\./, "cabinet."),
        };
      }
      return f;
    });
  }, [fields, partyRole]);

  // Handle field value change
  const handleFieldChange = useCallback((key: string, value: string | number | boolean) => {
    onTestValuesChange({
      ...testValues,
      [key]: String(value),
    });
  }, [testValues, onTestValuesChange]);

  // Handle card click - scroll to field in preview
  const handleCardClick = useCallback((cardId: string) => {
    setHighlightedFieldId(cardId);
    
    // Scroll to field in preview
    if (previewRef.current) {
      const fieldElement = previewRef.current.querySelector(
        `[data-field-key="${cardId}"]`
      ) as HTMLElement;
      
      if (fieldElement) {
        fieldElement.scrollIntoView({ behavior: "smooth", block: "center" });
        fieldElement.classList.add("highlight-pulse");
        setTimeout(() => fieldElement.classList.remove("highlight-pulse"), 2000);
      }
    }
    
    // Clear after animation
    setTimeout(() => {
      setHighlightedFieldId(null);
    }, 2000);
  }, []);

  // Handle field hover for visual feedback
  const handleCardHover = useCallback((fieldKey: string | null) => {
    if (fieldKey) {
      setHighlightedFieldId(fieldKey);
    }
  }, []);

  // Handle field click in preview - highlight corresponding card
  const handleFieldClick = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const fieldElement = target.closest("[data-field-key]") as HTMLElement;
    
    if (fieldElement) {
      const fieldKey = fieldElement.getAttribute("data-field-key");
      if (!fieldKey) return;
      
      setHighlightedFieldId(fieldKey);
      
      // Scroll to card in strip
      requestAnimationFrame(() => {
        const cardElement = document.querySelector(`[data-anchor-card-id="${fieldKey}"]`) as HTMLElement;
        const cardStrip = document.querySelector('[data-anchor-card-strip]') as HTMLElement;
        
        if (cardElement && cardStrip) {
          // Disable snap during programmatic scroll
          cardStrip.style.scrollSnapType = "none";
          
          const stripRect = cardStrip.getBoundingClientRect();
          const cardRect = cardElement.getBoundingClientRect();
          const targetScrollLeft = cardStrip.scrollLeft + (cardRect.left - stripRect.left) - (stripRect.width / 2) + (cardRect.width / 2);
          
          cardStrip.scrollTo({ left: targetScrollLeft, behavior: "smooth" });
          
          // Add highlight animation
          cardElement.classList.add("highlight-pulse");
          setTimeout(() => {
            cardElement.classList.remove("highlight-pulse");
            cardStrip.style.scrollSnapType = "";
          }, 1500);
        }
      });
      
      // Clear highlight after animation
      setTimeout(() => {
        setHighlightedFieldId(null);
      }, 2000);
    }
  }, []);

  // Convert test values to form values for AnchorCardStrip
  const formValues = useMemo(() => {
    const values: Record<string, string | number | boolean> = {};
    
    // Add all test values
    Object.entries(testValues).forEach(([key, value]) => {
      values[key] = value;
    });
    
    // Add auto-fill values from cabinet for fields not yet filled
    remappedFields.forEach((field) => {
      if (!values[field.key]) {
        if (field.source === "cabinet") {
          const autoValue = getCabinetValue(cabinet, field.sourceKey);
          if (autoValue) {
            values[field.key] = autoValue;
          }
        } else if (field.source === "contractor") {
          const autoValue = getContractorValue(testContractor, field.sourceKey);
          if (autoValue) {
            values[field.key] = autoValue;
          }
        }
      }
    });
    
    // Add default document values if not present
    if (!values.documentNumber) {
      values.documentNumber = "ТЕСТ-001";
    }
    if (!values.documentDate) {
      values.documentDate = new Date().toISOString().split("T")[0];
    }
    
    // Auto-fill computed fields from positions
    if (positions.length > 0) {
      values.service_description = positions.map(p => p.name).filter(Boolean).join(", ");
      values.total_amount = positions.reduce((sum, p) => sum + p.amount, 0).toLocaleString("uk-UA");
    }
    
    return values;
  }, [testValues, remappedFields, cabinet, testContractor, positions]);

  // Filter fields not covered by system cards (contractor, positions)
  // These become individual FieldAnchorCard entries
  const templateFieldCards = useMemo(() => {
    return remappedFields.filter(f => {
      // Cabinet fields are auto-filled from user's cabinet data
      if (f.source === "cabinet") return false;
      // Contractor fields are covered by ContractorAnchorCard
      if (f.source === "contractor") return false;
      // Position fields are covered by PositionsAnchorCard
      if (f.group === "positions") return false;
      // Computed fields derived from positions (total_amount, vat, etc.)
      if (f.source === "computed") return false;
      // documentDate is covered by DateAnchorCard
      if (f.key === "documentDate") return false;
      // documentNumber is a header field
      if (f.key === "documentNumber") return false;
      return true;
    });
  }, [remappedFields]);

  // Build template field values map for the strip
  const templateFieldValues = useMemo(() => {
    const values: Record<string, string> = {};
    templateFieldCards.forEach(f => {
      const v = formValues[f.key];
      if (v !== undefined && v !== "") {
        values[f.key] = String(v);
      }
    });
    return values;
  }, [templateFieldCards, formValues]);

  // Handle template field change from FieldAnchorCard
  const handleTemplateFieldChange = useCallback((key: string, value: string) => {
    onTestValuesChange({
      ...testValues,
      [key]: value,
    });
  }, [testValues, onTestValuesChange]);

  // Calculate readiness percent
  const readinessPercent = useMemo(() => {
    const requiredFields = remappedFields.filter(f => f.required !== false);
    if (requiredFields.length === 0) return 100;
    
    const filledCount = requiredFields.filter(f => {
      const value = formValues[f.key];
      return value !== undefined && value !== "";
    }).length;
    
    return Math.round((filledCount / requiredFields.length) * 100);
  }, [remappedFields, formValues]);


  // Generate preview HTML from documentText with filled values
  const previewHtml = useMemo(() => {
    if (!documentText || !documentText.trim()) {
      return `
        <div class="flex items-center justify-center h-full text-muted-foreground">
          <div class="text-center">
            <p class="text-lg font-medium mb-2">Немає тексту шаблону</p>
            <p class="text-sm">Додайте текст у вкладці "Шаблон"</p>
          </div>
        </div>
      `;
    }
    
    // Build field value map
    const fieldValueMap: Record<string, { value: string; key: string; source: string }> = {};
    
    remappedFields.forEach(field => {
      let value = String(formValues[field.key] || "");
      
      // If no value, use placeholder
      if (!value) {
        value = field.originalText || `[${field.label}]`;
      }
      
      const searchText = `[${field.originalText || field.label}]`;
      fieldValueMap[searchText] = {
        value,
        key: field.key,
        source: field.source || "manual",
      };
    });
    
    // Replace placeholders with highlighted spans directly in HTML
    let html = documentText;
    
    // Sort by length descending to replace longer matches first
    const sortedPlaceholders = Object.keys(fieldValueMap).sort((a, b) => b.length - a.length);
    
    sortedPlaceholders.forEach(placeholder => {
      const { value, key, source } = fieldValueMap[placeholder];
      
      // Color based on source
      const colorClass = source === "cabinet" || source === "computed" 
        ? "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200"
        : source === "contractor"
          ? "bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200"
          : "bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200";
      
      const highlightClass = key === highlightedFieldId ? "ring-2 ring-primary" : "";
      
      const replacement = `<span 
        data-field-key="${key}" 
        class="inline-block px-1 py-0.5 rounded cursor-pointer transition-all hover:ring-2 hover:ring-primary/50 ${colorClass} ${highlightClass}"
      >${escapeHtml(value)}</span>`;
      
      // Replace all occurrences
      html = html.split(placeholder).join(replacement);
    });
    
    return DOMPurify.sanitize(html, {
      ADD_ATTR: ['data-field-key', 'style'],
      ADD_TAGS: ['table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td'],
    });
  }, [documentText, remappedFields, formValues, highlightedFieldId]);

  // Show role selector before testing interface
  if (partyRole === null) {
    return (
      <div className="flex flex-col h-full">
        <PartyRoleSelector
          documentText={documentText}
          onSelect={setPartyRole}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Interactive AnchorCardStrip - same as document creation */}
      <div className="shrink-0">
        <AnchorCardStrip
          documentType={documentType}
          template={template || null}
          contractor={testContractor}
          positions={positions}
          formValues={formValues}
          readinessPercent={readinessPercent}
          cabinet={cabinet}
          onTypeChange={() => {}} // Locked for testing
          onTemplateChange={() => {}} // Locked for testing
          onContractorChange={setTestContractor}
          onPositionsEdit={() => setPositionsSheetOpen(true)}
          onFieldChange={handleFieldChange}
          highlightedCardId={highlightedFieldId}
          onCardClick={handleCardClick}
          onCardHover={handleCardHover}
          lockType={true}
          lockTemplate={true}
          templateFields={templateFieldCards}
          templateFieldValues={templateFieldValues}
          onTemplateFieldChange={handleTemplateFieldChange}
        />
      </div>

      {/* Live Preview with documentText */}
      <div className="flex-1 min-h-0 overflow-auto p-4 bg-muted/20">
        <div
          ref={previewRef}
          className="mx-auto bg-card rounded-lg border shadow-sm p-6"
          style={{ maxWidth: "210mm", minHeight: "297mm" }}
          onClick={handleFieldClick}
          dangerouslySetInnerHTML={{ __html: previewHtml }}
        />
      </div>

      {/* Positions Sheet for editing */}
      <PositionsSheet
        open={positionsSheetOpen}
        onOpenChange={setPositionsSheetOpen}
        positions={positions}
        onPositionsChange={setPositions}
        cabinet={cabinet}
        documentDate={String(formValues.documentDate || "")}
      />
    </div>
  );
};
