/**
 * TestFieldsAnchorStrip Component
 * Horizontal scrollable strip for template testing - groups fields by FieldGroup
 * Mirrors AnchorCardStrip pattern but uses field groups instead of document creation cards
 */

import { useRef, useMemo, useCallback, useState } from "react";
import { cn } from "@/lib/utils";
import { useDragToScrollWithMomentum } from "@/hooks/use-drag-to-scroll";
import { Sparkles, Edit3, Link2, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { UnifiedTemplateField } from "@/types/templateField";
import type { FieldGroup } from "@/config/documentFormSchemas";
import type { Cabinet } from "@/types/cabinet";

// Group labels for display
const GROUP_LABELS: Record<FieldGroup, string> = {
  header: "Заголовок",
  supplier: "Постачальник",
  buyer: "Покупець",
  employee: "Працівник",
  positions: "Позиції",
  totals: "Підсумки",
  terms: "Умови",
  transport: "Транспорт",
  signatures: "Підписи",
};

// Group short labels for cards
const GROUP_SHORT_LABELS: Record<FieldGroup, string> = {
  header: "Заголов",
  supplier: "Постач",
  buyer: "Покупц",
  employee: "Працівн",
  positions: "Позиції",
  totals: "Підсумк",
  terms: "Умови",
  transport: "Трансп",
  signatures: "Підписи",
};

// Group icons (emoji for simplicity)
const GROUP_ICONS: Record<FieldGroup, string> = {
  header: "📄",
  supplier: "🏢",
  buyer: "👤",
  employee: "👷",
  positions: "📦",
  totals: "💰",
  terms: "📋",
  transport: "🚚",
  signatures: "✍️",
};

interface TestFieldsAnchorStripProps {
  groupedFields: Record<FieldGroup, UnifiedTemplateField[]>;
  testValues: Record<string, string>;
  cabinet: Cabinet;
  onFieldChange: (key: string, value: string) => void;
  highlightedGroupId: FieldGroup | null;
  onGroupClick: (groupId: FieldGroup) => void;
  onGroupHover: (groupId: FieldGroup | null) => void;
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

// Map data type to input type
function getInputType(dataType: string): string {
  switch (dataType) {
    case "number":
    case "currency":
      return "number";
    case "date":
      return "date";
    case "email":
      return "email";
    case "phone":
      return "tel";
    default:
      return "text";
  }
}

export function TestFieldsAnchorStrip({
  groupedFields,
  testValues,
  cabinet,
  onFieldChange,
  highlightedGroupId,
  onGroupClick,
  onGroupHover,
  className,
}: TestFieldsAnchorStripProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [activeSheet, setActiveSheet] = useState<FieldGroup | null>(null);
  
  const { isDragging, handlers } = useDragToScrollWithMomentum(
    () => viewportRef.current,
    { friction: 0.92, minVelocity: 0.5 }
  );

  // Get active groups (groups that have fields)
  const activeGroups = useMemo(() => {
    return (Object.entries(groupedFields) as [FieldGroup, UnifiedTemplateField[]][])
      .filter(([, fields]) => fields.length > 0)
      .map(([group]) => group);
  }, [groupedFields]);

  // Calculate fill status for each group
  const groupStats = useMemo(() => {
    const stats: Record<FieldGroup, { filled: number; total: number; hasAuto: boolean }> = {} as any;
    
    activeGroups.forEach((group) => {
      const fields = groupedFields[group];
      let filled = 0;
      let hasAuto = false;
      
      fields.forEach((field) => {
        const isAuto = field.source === "cabinet" || field.source === "contractor";
        const autoValue = isAuto ? getCabinetValue(cabinet, field.sourceKey) : "";
        const value = testValues[field.key] || autoValue;
        
        if (value) filled++;
        if (isAuto && autoValue) hasAuto = true;
      });
      
      stats[group] = { filled, total: fields.length, hasAuto };
    });
    
    return stats;
  }, [activeGroups, groupedFields, testValues, cabinet]);

  // Build card configs for progress dots
  const cardConfigs = useMemo(() => {
    return activeGroups.map((group) => {
      const stats = groupStats[group];
      return {
        id: group,
        label: GROUP_LABELS[group],
        isFilled: stats.filled === stats.total,
        isPartial: stats.filled > 0 && stats.filled < stats.total,
      };
    });
  }, [activeGroups, groupStats]);

  // Handle card click - open sheet for editing
  const handleCardClick = useCallback((group: FieldGroup) => {
    setActiveSheet(group);
  }, []);

  // Handle navigate button click - scroll to field in preview
  const handleNavigate = useCallback((group: FieldGroup) => {
    onGroupClick(group);
  }, [onGroupClick]);

  // Scroll to card by id
  const scrollToCard = useCallback((groupId: string) => {
    const cardElement = document.querySelector(`[data-test-card-id="${groupId}"]`) as HTMLElement;
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

  return (
    <div className={cn("border-b border-border bg-subtab-shelf", className)}>
      {/* Cards scroll container */}
      <div className="relative">
        {/* Fade masks */}
        <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-subtab-shelf to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-subtab-shelf to-transparent z-10 pointer-events-none" />
        
        <div
          ref={viewportRef}
          data-test-card-strip
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
            {activeGroups.map((group) => {
              const stats = groupStats[group];
              const isHighlighted = highlightedGroupId === group;
              const isFilled = stats.filled === stats.total;
              
              return (
                <div
                  key={group}
                  data-test-card-id={group}
                  className={cn(
                    "flex flex-col items-center gap-1 p-3 rounded-xl border transition-all min-w-[100px] snap-center",
                    "bg-card hover:bg-muted/50 cursor-pointer",
                    isHighlighted && "ring-2 ring-primary ring-offset-2",
                    isFilled ? "border-success/50" : "border-border"
                  )}
                  onClick={() => handleCardClick(group)}
                  onMouseEnter={() => onGroupHover(group)}
                  onMouseLeave={() => onGroupHover(null)}
                >
                  {/* Icon */}
                  <span className="text-xl">{GROUP_ICONS[group]}</span>
                  
                  {/* Label */}
                  <span className="text-xs font-medium text-center truncate max-w-[80px]">
                    {GROUP_SHORT_LABELS[group]}
                  </span>
                  
                  {/* Status */}
                  <div className="flex items-center gap-1">
                    {stats.hasAuto && (
                      <Sparkles className="w-3 h-3 text-primary" />
                    )}
                    <span className={cn(
                      "text-[10px] tabular-nums",
                      isFilled ? "text-success" : "text-muted-foreground"
                    )}>
                      {stats.filled}/{stats.total}
                    </span>
                  </div>
                  
                  {/* Navigate button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNavigate(group);
                    }}
                    className="flex items-center gap-0.5 text-[10px] text-primary hover:underline mt-1"
                  >
                    <Link2 className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Progress dots */}
      <div className="flex justify-center gap-1.5 py-2">
        {cardConfigs.map((config) => (
          <Tooltip key={config.id}>
            <TooltipTrigger asChild>
              <button
                onClick={() => scrollToCard(config.id)}
                className={cn(
                  "w-2 h-2 rounded-full transition-all cursor-pointer",
                  "hover:scale-125 focus:outline-none focus:ring-2 focus:ring-primary/50",
                  config.isFilled 
                    ? "bg-success" 
                    : config.isPartial 
                      ? "bg-warning"
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
      
      {/* Field editing sheet */}
      <Sheet open={!!activeSheet} onOpenChange={(open) => !open && setActiveSheet(null)}>
        <SheetContent side="right" className="w-full sm:max-w-md">
          {activeSheet && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <span>{GROUP_ICONS[activeSheet]}</span>
                  {GROUP_LABELS[activeSheet]}
                  <Badge variant="secondary" className="ml-auto text-xs">
                    {groupStats[activeSheet].filled}/{groupStats[activeSheet].total}
                  </Badge>
                </SheetTitle>
              </SheetHeader>
              
              <div className="mt-6 space-y-4">
                {groupedFields[activeSheet].map((field) => {
                  const isAuto = field.source === "cabinet" || field.source === "contractor";
                  const autoValue = isAuto ? getCabinetValue(cabinet, field.sourceKey) : "";
                  const currentValue = testValues[field.key] || autoValue;
                  const isFilled = Boolean(currentValue);
                  
                  return (
                    <div key={field.key} className="space-y-1.5">
                      <Label htmlFor={`sheet-${field.key}`} className="text-sm flex items-center gap-1.5">
                        {field.label}
                        {field.required && <span className="text-destructive">*</span>}
                        {isAuto && isFilled && (
                          <Sparkles className="w-3 h-3 text-primary ml-1" />
                        )}
                      </Label>
                      <Input
                        id={`sheet-${field.key}`}
                        type={getInputType(field.dataType)}
                        value={currentValue}
                        onChange={(e) => onFieldChange(field.key, e.target.value)}
                        placeholder={field.placeholder || `Введіть ${field.label.toLowerCase()}`}
                        className={cn(
                          isAuto && isFilled && "bg-primary/5 border-primary/30"
                        )}
                        readOnly={isAuto && Boolean(autoValue)}
                      />
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
