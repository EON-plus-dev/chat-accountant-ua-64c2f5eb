/**
 * AnchorCardStrip Component
 * Horizontal scrollable strip for document creation anchor cards
 * With interactive specialized cards
 */

import { useRef, useMemo, useCallback } from "react";
import { cn } from "@/lib/utils";
import { useDragToScrollWithMomentum } from "@/hooks/use-drag-to-scroll";
import type { DocumentType } from "@/config/documentFlowConfig";
import type { DocumentTemplate } from "@/config/documentTemplatesConfig";
import type { Contractor } from "@/config/settingsConfig";
import type { DocumentPosition } from "@/config/documentTemplateGenerator";
import { calculatePositionTotals, type ExtendedDocumentPosition } from "@/types/extendedPosition";
import { TypeAnchorCard } from "./TypeAnchorCard";
import { TemplateAnchorCard } from "./TemplateAnchorCard";
import { ContractorAnchorCard } from "./ContractorAnchorCard";
import { DateAnchorCard } from "./DateAnchorCard";
import { PositionsAnchorCard } from "./PositionsAnchorCard";
import { AmountAnchorCard } from "./AmountAnchorCard";
import { FieldAnchorCard } from "./FieldAnchorCard";
import { getContractorsForCabinet } from "@/config/settingsConfig";
import type { Cabinet } from "@/types/cabinet";
import type { UnifiedTemplateField } from "@/types/templateField";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

type Currency = "UAH" | "USD" | "EUR";

export interface AnchorCardStripProps {
  documentType: DocumentType;
  template: DocumentTemplate | null;
  contractor: Contractor | null;
  positions: DocumentPosition[];
  formValues: Record<string, string | number | boolean>;
  readinessPercent: number;
  cabinet: Cabinet;
  onTypeChange: (type: DocumentType) => void;
  onTemplateChange: (template: DocumentTemplate) => void;
  onContractorChange: (contractor: Contractor) => void;
  onPositionsEdit: () => void;
  onFieldChange: (key: string, value: string | number | boolean) => void;
  onInviteContractor?: () => void;
  onNavigateToCreateTemplate?: () => void;
  highlightedCardId: string | null;
  onCardClick?: (cardId: string) => void;
  onCardHover?: (id: string | null) => void;
  lockType?: boolean;
  lockTemplate?: boolean;
  className?: string;
  // Amount calculator props
  vatAmount?: number;
  currency?: Currency;
  onAmountChange?: (total: number, vatAmount: number, currency: Currency) => void;
  // Scroll to card handler for progress dots
  scrollToCard?: (cardId: string) => void;
  // Template field cards
  templateFields?: UnifiedTemplateField[];
  templateFieldValues?: Record<string, string>;
  onTemplateFieldChange?: (key: string, value: string) => void;
}

export function AnchorCardStrip({
  documentType,
  template,
  contractor,
  positions,
  formValues,
  readinessPercent,
  cabinet,
  onTypeChange,
  onTemplateChange,
  onContractorChange,
  onPositionsEdit,
  onFieldChange,
  onInviteContractor,
  onNavigateToCreateTemplate,
  highlightedCardId,
  onCardClick,
  onCardHover,
  lockType,
  lockTemplate,
  className,
  vatAmount,
  currency,
  onAmountChange,
  scrollToCard,
  templateFields,
  templateFieldValues,
  onTemplateFieldChange,
}: AnchorCardStripProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  
  const { isDragging, handlers } = useDragToScrollWithMomentum(
    () => viewportRef.current,
    { friction: 0.92, minVelocity: 0.5 }
  );
  
  // Get contractors for cabinet
  const contractors = useMemo(() => getContractorsForCabinet(cabinet), [cabinet]);
  
  // Calculate totals with currency conversion
  const positionTotals = useMemo(() => 
    calculatePositionTotals(positions as ExtendedDocumentPosition[]),
    [positions]
  );
  const totalAmount = positionTotals.totalGrossUAH;
  
  // Build card configs for progress dots with semantic status
  const cardConfigs = useMemo(() => {
    const configs: Array<{ id: string; label: string; isFilled: boolean }> = [];
    
    // Only include type/template if not locked
    if (!lockType) {
      configs.push({ id: "type", label: "Тип", isFilled: !!documentType });
    }
    if (!lockTemplate) {
      configs.push({ id: "template", label: "Шаблон", isFilled: !!template });
    }
    
    // Always include: contractor, positions, date, amount
    configs.push({ id: "contractor", label: "Контрагент", isFilled: !!contractor });
    configs.push({ id: "positions", label: "Позиції", isFilled: positions.length > 0 });
    configs.push({ id: "date", label: "Дата", isFilled: !!formValues.documentDate });
    configs.push({ id: "amount", label: "Сума", isFilled: positions.length > 0 });
    
    // Add template field cards to progress dots
    if (templateFields) {
      templateFields.forEach(f => {
        configs.push({
          id: f.key,
          label: f.label,
          isFilled: !!(templateFieldValues?.[f.key]),
        });
      });
    }
    
    return configs;
  }, [documentType, template, contractor, positions, formValues.documentDate, lockType, lockTemplate, templateFields, templateFieldValues]);
  
  // Count for legacy compatibility
  const filledCount = cardConfigs.filter(c => c.isFilled).length;
  const totalCount = cardConfigs.length;
  
  // Handle dot click - scroll to card
  const handleDotClick = useCallback((cardId: string) => {
    if (scrollToCard) {
      scrollToCard(cardId);
    }
  }, [scrollToCard]);
  
  // Handle date change
  const handleDateChange = (date: string) => {
    onFieldChange("documentDate", date);
  };
  
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
          <div className="inline-flex items-start gap-3 px-4" style={{ width: "max-content" }}>
            {/* Type Card — hide if locked */}
            {!lockType && (
              <TypeAnchorCard
                value={documentType}
                onChange={onTypeChange}
                highlightedCardId={highlightedCardId}
                onHover={onCardHover}
                onNavigate={() => onCardClick?.("type")}
                disabled={lockType}
              />
            )}
            
            {/* Template Card — hide if locked */}
            {!lockTemplate && (
              <TemplateAnchorCard
                value={template}
                documentType={documentType}
                onChange={onTemplateChange}
                highlightedCardId={highlightedCardId}
                onHover={onCardHover}
                onNavigate={() => onCardClick?.("template")}
                onCreateNew={onNavigateToCreateTemplate}
                disabled={lockTemplate}
              />
            )}

            {/* Contractor Card */}
            <ContractorAnchorCard
              value={contractor}
              contractors={contractors}
              onChange={onContractorChange}
              highlightedCardId={highlightedCardId}
              onHover={onCardHover}
              onNavigate={() => onCardClick?.("contractor")}
              onInvite={onInviteContractor}
            />
            
            {/* Positions Card */}
            <PositionsAnchorCard
              positions={positions}
              totalAmount={totalAmount}
              highlightedCardId={highlightedCardId}
              onHover={onCardHover}
              onNavigate={() => onCardClick?.("positions")}
              onEdit={onPositionsEdit}
            />
            
            {/* Date Card */}
            <DateAnchorCard
              id="date"
              label="Дата"
              value={String(formValues.documentDate || "")}
              onChange={handleDateChange}
              highlightedCardId={highlightedCardId}
              onHover={onCardHover}
              onNavigate={() => onCardClick?.("date")}
            />
            
            {/* Amount Card (interactive with calculator) */}
            <AmountAnchorCard
              totalAmount={totalAmount}
              highlightedCardId={highlightedCardId}
              onHover={onCardHover}
              onNavigate={() => onCardClick?.("amount")}
              date={String(formValues.documentDate || "")}
              vatAmount={vatAmount}
              currency={currency}
              onAmountChange={onAmountChange}
            />
            
            {/* Template Field Cards */}
            {templateFields?.map((field) => (
              <FieldAnchorCard
                key={field.key}
                field={field}
                value={templateFieldValues?.[field.key] || ""}
                onChange={onTemplateFieldChange ? (val) => onTemplateFieldChange(field.key, val) : undefined}
                onNavigate={() => onCardClick?.(field.key)}
                isHighlighted={highlightedCardId === field.key}
                onHover={onCardHover}
              />
            ))}
          </div>
        </div>
      </div>
      
      {/* Progress dots - visible on all screens with semantic colors */}
      <div className="flex justify-center gap-1.5 py-2">
        {cardConfigs.map((config) => (
          <Tooltip key={config.id}>
            <TooltipTrigger asChild>
              <button
                onClick={() => handleDotClick(config.id)}
                className={cn(
                  "w-2 h-2 rounded-full transition-all cursor-pointer",
                  "hover:scale-125 focus:outline-none focus:ring-2 focus:ring-primary/50",
                  config.isFilled 
                    ? "bg-emerald-500" 
                    : "bg-amber-400"
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
