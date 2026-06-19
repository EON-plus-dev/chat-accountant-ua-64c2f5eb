/**
 * UnifiedFieldsStrip Component
 * Horizontal strip combining Selection Cards (entities) + Field Cards (individual fields)
 * Two-tier architecture: Selection Cards auto-fill related fields, Field Cards for manual/computed inputs
 */

import { useRef, useMemo, useCallback } from "react";
import { cn } from "@/lib/utils";
import { useDragToScrollWithMomentum } from "@/hooks/use-drag-to-scroll";
import { Building2, Package, User, Truck } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { SelectionAnchorCard } from "./SelectionAnchorCard";
import { FieldAnchorCard } from "./FieldAnchorCard";
import type { UnifiedTemplateField } from "@/types/templateField";
import type { Cabinet } from "@/types/cabinet";
import type { Contractor } from "@/config/settingsConfig";
import type { DocumentPosition } from "@/config/documentTemplateGenerator";

// Sources that are auto-filled via Selection Cards
const SELECTION_SOURCES = ["contractor", "employee", "vehicle", "nomenclature"];

interface UnifiedFieldsStripProps {
  /** All template fields */
  fields: UnifiedTemplateField[];
  /** Current field values */
  fieldValues: Record<string, string>;
  /** Cabinet for auto-fill data */
  cabinet: Cabinet;
  /** Selected contractor (for contractor selection card) */
  contractor: Contractor | null;
  /** Document positions (for positions selection card) */
  positions: DocumentPosition[];
  /** Field value change handler */
  onFieldChange: (key: string, value: string) => void;
  /** Contractor selection handler */
  onContractorSelect?: () => void;
  /** Positions edit handler */
  onPositionsEdit?: () => void;
  /** Navigate to field in document */
  onNavigate: (fieldKey: string) => void;
  /** Highlighted field (from document click) */
  highlightedFieldKey: string | null;
  /** Hover handler for bidirectional sync */
  onFieldHover: (fieldKey: string | null) => void;
  /** Additional class names */
  className?: string;
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

export function UnifiedFieldsStrip({
  fields,
  fieldValues,
  cabinet,
  contractor,
  positions,
  onFieldChange,
  onContractorSelect,
  onPositionsEdit,
  onNavigate,
  highlightedFieldKey,
  onFieldHover,
  className,
}: UnifiedFieldsStripProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  
  const { isDragging, handlers } = useDragToScrollWithMomentum(
    () => viewportRef.current,
    { friction: 0.92, minVelocity: 0.5 }
  );

  // Check if template has contractor fields
  const hasContractorFields = useMemo(() => 
    fields.some(f => f.source === "contractor"),
    [fields]
  );

  // Check if template has position fields  
  const hasPositionFields = useMemo(() =>
    fields.some(f => f.group === "positions"),
    [fields]
  );

  // Count auto-filled contractor fields
  const contractorFieldsCount = useMemo(() => 
    fields.filter(f => f.source === "contractor").length,
    [fields]
  );

  // Filter fields for Field Cards (exclude selection-based sources)
  const displayFields = useMemo(() => {
    return fields.filter(f => 
      !SELECTION_SOURCES.includes(f.source) &&
      f.group !== "positions" // Positions handled by selection card
    );
  }, [fields]);

  // Sort fields: manual first, then empty auto, then filled auto
  const sortedFields = useMemo(() => {
    return [...displayFields].sort((a, b) => {
      const aValue = fieldValues[a.key] || getCabinetValue(cabinet, a.sourceKey);
      const bValue = fieldValues[b.key] || getCabinetValue(cabinet, b.sourceKey);
      const aFilled = Boolean(aValue);
      const bFilled = Boolean(bValue);
      const aManual = a.source === "manual";
      const bManual = b.source === "manual";
      
      // Manual fields first
      if (aManual && !bManual) return -1;
      if (!aManual && bManual) return 1;
      
      // Then empty fields
      if (!aFilled && bFilled) return -1;
      if (aFilled && !bFilled) return 1;
      
      // Keep original order
      return (a.order || 0) - (b.order || 0);
    });
  }, [displayFields, fieldValues, cabinet]);

  // Build progress config for dots
  const progressConfig = useMemo(() => {
    const items: { id: string; label: string; isFilled: boolean; isManual: boolean }[] = [];
    
    // Add selection cards to progress
    if (hasContractorFields) {
      items.push({
        id: "contractor",
        label: "Контрагент",
        isFilled: !!contractor,
        isManual: false,
      });
    }
    if (hasPositionFields) {
      items.push({
        id: "positions",
        label: "Позиції",
        isFilled: positions.length > 0,
        isManual: false,
      });
    }
    
    // Add field cards to progress
    sortedFields.forEach(field => {
      const value = fieldValues[field.key] || getCabinetValue(cabinet, field.sourceKey);
      items.push({
        id: field.key,
        label: field.label,
        isFilled: Boolean(value),
        isManual: field.source === "manual",
      });
    });
    
    return items;
  }, [hasContractorFields, hasPositionFields, contractor, positions, sortedFields, fieldValues, cabinet]);

  // Scroll to card by id
  const scrollToCard = useCallback((cardId: string) => {
    const cardElement = document.querySelector(`[data-anchor-card-id="${cardId}"]`) as HTMLElement;
    const cardStrip = viewportRef.current;
    
    if (!cardElement || !cardStrip) return;
    
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
  }, []);

  // Get field value (from fieldValues or cabinet)
  const getFieldValue = useCallback((field: UnifiedTemplateField): string => {
    if (fieldValues[field.key]) {
      return fieldValues[field.key];
    }
    if (field.source === "cabinet") {
      return getCabinetValue(cabinet, field.sourceKey);
    }
    return "";
  }, [fieldValues, cabinet]);

  return (
    <div className={cn("border-b border-border bg-subtab-shelf", className)}>
      {/* Cards scroll container */}
      <div className="relative">
        {/* Fade masks */}
        <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-subtab-shelf to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-subtab-shelf to-transparent z-10 pointer-events-none" />
        
        <div
          ref={viewportRef}
          data-anchor-card-strip
          className={cn(
            "overflow-x-auto overflow-y-hidden overscroll-x-contain touch-pan-x py-3",
            "scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent",
            isDragging ? "cursor-grabbing select-none" : "cursor-grab",
            "snap-x snap-mandatory"
          )}
          style={{ WebkitOverflowScrolling: "touch" }}
          {...handlers}
        >
          <div className="inline-flex items-start gap-2 px-4" style={{ width: "max-content" }}>
            {/* Selection Cards Section */}
            {hasContractorFields && (
              <SelectionAnchorCard
                id="contractor"
                icon={Building2}
                label="Контрагент"
                displayValue={contractor?.name || ""}
                status={contractor ? "filled" : "empty"}
                autoFilledCount={contractorFieldsCount}
                isHighlighted={highlightedFieldKey === "contractor" || highlightedFieldKey?.startsWith("buyer") || highlightedFieldKey?.startsWith("customer")}
                onHover={(id) => onFieldHover(id)}
                onClick={onContractorSelect}
                onNavigate={() => onNavigate("buyerName")}
              />
            )}
            
            {hasPositionFields && (
              <SelectionAnchorCard
                id="positions"
                icon={Package}
                label="Позиції"
                displayValue={positions.length > 0 ? `${positions.length} поз.` : ""}
                status={positions.length > 0 ? "filled" : "empty"}
                autoFilledCount={positions.length > 0 ? positions.length : undefined}
                isHighlighted={highlightedFieldKey === "positions" || highlightedFieldKey === "positions-table"}
                onHover={(id) => onFieldHover(id)}
                onClick={onPositionsEdit}
                onNavigate={() => onNavigate("positions-table")}
              />
            )}
            
            {/* Separator if we have both selection and field cards */}
            {(hasContractorFields || hasPositionFields) && sortedFields.length > 0 && (
              <div className="w-px h-12 bg-border/50 self-center mx-1" />
            )}
            
            {/* Field Cards Section */}
            {sortedFields.map((field) => (
              <FieldAnchorCard
                key={field.key}
                field={field}
                value={getFieldValue(field)}
                onChange={field.source === "manual" ? (val) => onFieldChange(field.key, val) : undefined}
                onNavigate={() => onNavigate(field.key)}
                isHighlighted={highlightedFieldKey === field.key}
                onHover={onFieldHover}
                isAutoFilled={field.source === "cabinet" && !!getCabinetValue(cabinet, field.sourceKey)}
              />
            ))}
          </div>
        </div>
      </div>
      
      {/* Progress dots */}
      <div className="flex justify-center gap-1.5 py-2">
        {progressConfig.map((config) => (
          <Tooltip key={config.id}>
            <TooltipTrigger asChild>
              <button
                onClick={() => scrollToCard(config.id)}
                className={cn(
                  "w-2 h-2 rounded-full transition-all cursor-pointer",
                  "hover:scale-125 focus:outline-none focus:ring-2 focus:ring-primary/50",
                  config.isFilled 
                    ? "bg-emerald-500" 
                    : config.isManual 
                      ? "bg-amber-400"
                      : "bg-muted-foreground/30"
                )}
                aria-label={`${config.label} ${config.isFilled ? "(заповнено)" : "(потребує заповнення)"}`}
              />
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs">
              {config.label} {config.isFilled ? "✓" : ""}
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </div>
  );
}
