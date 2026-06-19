/**
 * FieldSchemaShelf - Two-section horizontal shelf (VIEW mode)
 * Section 1: Selection Cards (system data groups) - always visible
 * Section 2: Field Cards (individual placeholders) - filtered by badges
 */

import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ChevronUp, 
  ChevronDown,
  FileText,
  Building2,
  Package,
  Truck,
  Sparkles,
  Edit,
  Plus,
  Beaker,
  User,
  Calendar,
  Hash,
  DollarSign,
  type LucideIcon,
} from "lucide-react";
import { useDragToScrollWithMomentum } from "@/hooks/use-drag-to-scroll";
import type { UnifiedTemplateField, FieldDataType } from "@/types/templateField";
import type { FieldGroup } from "@/config/documentFormSchemas";

// Filter type - includes selection cards filter
type FilterType = "all" | "auto" | "manual" | "selection";

// Selection card config (system data groups)
interface SelectionCardConfig {
  id: string;
  icon: LucideIcon;
  label: string;
  value: string;
  fieldsCount: number;
  color: "purple" | "orange" | "blue" | "emerald";
}

// Field card config (individual placeholders)
interface FieldCardConfig {
  id: string;
  icon: LucideIcon;
  label: string;
  value: string;
  source: string;
  color: "purple" | "orange" | "blue" | "emerald" | "amber";
}

// Color styles for cards
const cardColorStyles = {
  purple: {
    border: "border-purple-200 dark:border-purple-800/60",
    bg: "bg-purple-50/30 dark:bg-purple-950/20",
    text: "text-purple-600 dark:text-purple-400",
  },
  orange: {
    border: "border-orange-200 dark:border-orange-800/60",
    bg: "bg-orange-50/30 dark:bg-orange-950/20",
    text: "text-orange-600 dark:text-orange-400",
  },
  blue: {
    border: "border-blue-200 dark:border-blue-800/60",
    bg: "bg-blue-50/30 dark:bg-blue-950/20",
    text: "text-blue-600 dark:text-blue-400",
  },
  emerald: {
    border: "border-emerald-200 dark:border-emerald-800/60",
    bg: "bg-emerald-50/30 dark:bg-emerald-950/20",
    text: "text-emerald-600 dark:text-emerald-400",
  },
  amber: {
    border: "border-amber-200 dark:border-amber-800/60",
    bg: "bg-amber-50/30 dark:bg-amber-950/20",
    text: "text-amber-600 dark:text-amber-400",
  },
};

// Get icon for field dataType
function getFieldIcon(dataType: FieldDataType): LucideIcon {
  switch (dataType) {
    case "date":
      return Calendar;
    case "number":
    case "currency":
      return DollarSign;
    case "edrpou":
    case "ipn":
    case "iban":
      return Hash;
    default:
      return FileText;
  }
}

// Get color for source (only for displayable fields)
function getSourceColor(source: string): "blue" | "emerald" | "amber" {
  switch (source) {
    case "cabinet":
      return "blue";
    case "computed":
      return "emerald";
    case "manual":
    default:
      return "amber";
  }
}

// Selection Card Preview component (similar to SelectionAnchorCard)
function SelectionCardPreview({
  icon: Icon,
  label,
  value,
  fieldsCount,
  color,
  onClick,
}: SelectionCardConfig & { onClick?: () => void }) {
  const colorStyle = cardColorStyles[color];
  
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group relative flex flex-col gap-1.5 p-3 rounded-xl border transition-all duration-200",
        "min-w-[140px] w-[160px] flex-shrink-0",
        "min-h-[80px] cursor-pointer select-none touch-manipulation",
        "hover:shadow-md hover:border-primary/30",
        colorStyle.border,
        colorStyle.bg,
      )}
      data-no-drag
    >
      {/* Header */}
      <div className="flex items-center gap-1.5">
        <div className={cn("p-1 rounded-md", colorStyle.bg)}>
          <Icon className={cn("w-4 h-4", colorStyle.text)} />
        </div>
        <span className={cn("text-xs font-medium", colorStyle.text)}>{label}</span>
      </div>
      
      {/* Value */}
      <p className="text-sm font-medium truncate text-foreground">{value}</p>
      
      {/* Auto-fill indicator */}
      <div className={cn("flex items-center gap-1 text-[10px]", colorStyle.text)}>
        <Sparkles className="w-3 h-3" />
        <span>Авто: {fieldsCount} полів</span>
      </div>
    </button>
  );
}

// Field Card component (for individual placeholders)
function FieldCard({
  icon: Icon,
  label,
  value,
  source,
  color,
  onClick,
  isHighlighted,
}: FieldCardConfig & { onClick?: () => void; isHighlighted?: boolean }) {
  const colorStyle = cardColorStyles[color];
  const isAuto = source !== "manual";
  
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group relative flex flex-col gap-1 p-3 rounded-xl border transition-all duration-200",
        "min-w-[160px] w-[180px] flex-shrink-0",
        "min-h-[68px] cursor-pointer select-none touch-manipulation",
        "hover:shadow-md hover:border-primary/30",
        colorStyle.border,
        colorStyle.bg,
        isHighlighted && "ring-2 ring-primary/50"
      )}
      data-no-drag
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className={cn("flex items-center gap-1.5", colorStyle.text)}>
          <Icon className="w-4 h-4" />
          <span className="text-xs font-medium truncate max-w-[100px]">{label}</span>
        </div>
        <Badge 
          variant="secondary" 
          className={cn(
            "p-1 h-5 w-5 flex items-center justify-center flex-shrink-0",
            isAuto 
              ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400" 
              : "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"
          )}
        >
          {isAuto ? (
            <Sparkles className="w-3 h-3" />
          ) : (
            <Edit className="w-3 h-3" />
          )}
        </Badge>
      </div>
      
      {/* Value */}
      <p className="text-sm font-medium truncate pr-1 text-foreground">
        {value}
      </p>
    </button>
  );
}

interface FieldSchemaShelfProps {
  fields: UnifiedTemplateField[];
  isExpanded: boolean;
  onToggleExpand: () => void;
  onFieldClick?: (fieldKey: string) => void;
  onGroupClick?: (group: FieldGroup, index: number) => void;
  highlightedFieldKey?: string | null;
  activeGroupIndex?: number;
  onAddField?: () => void;
  isDemo?: boolean;
  className?: string;
}

export const FieldSchemaShelf = ({
  fields,
  isExpanded,
  onToggleExpand,
  onFieldClick,
  highlightedFieldKey,
  onAddField,
  isDemo = false,
  className,
}: FieldSchemaShelfProps) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [scrollState, setScrollState] = useState({ canScrollLeft: false, canScrollRight: false });
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  
  // Drag-to-scroll hook
  const { isDragging, handlers: dragHandlers } = useDragToScrollWithMomentum(
    () => scrollContainerRef.current
  );
  
  // Selection cards (system data groups)
  const selectionCards = useMemo(() => {
    const cards: SelectionCardConfig[] = [];
    
    // Contractor card
    const contractorFields = fields.filter(f => f.source === "contractor");
    if (contractorFields.length > 0) {
      cards.push({ 
        id: "selection-contractor", 
        icon: Building2, 
        label: "Контрагент", 
        value: "Дані контрагента",
        fieldsCount: contractorFields.length,
        color: "purple",
      });
    }
    
    // Employee card
    const employeeFields = fields.filter(f => f.source === "employee");
    if (employeeFields.length > 0) {
      cards.push({ 
        id: "selection-employee", 
        icon: User, 
        label: "Працівник", 
        value: "Дані працівника",
        fieldsCount: employeeFields.length,
        color: "orange",
      });
    }
    
    // Positions card
    const positionsFields = fields.filter(f => f.group === "positions");
    if (positionsFields.length > 0) {
      cards.push({ 
        id: "selection-positions", 
        icon: Package, 
        label: "Позиції", 
        value: "Таблиця товарів",
        fieldsCount: positionsFields.length,
        color: "blue",
      });
    }
    
    // Transport card
    const transportFields = fields.filter(f => f.group === "transport");
    if (transportFields.length > 0) {
      cards.push({ 
        id: "selection-transport", 
        icon: Truck, 
        label: "Транспорт", 
        value: "Дані транспорту",
        fieldsCount: transportFields.length,
        color: "emerald",
      });
    }
    
    return cards;
  }, [fields]);
  
  // Displayable fields (excluding those in selection cards)
  const displayableFields = useMemo(() => {
    return fields.filter(f => 
      !["contractor", "employee"].includes(f.source) &&
      !["positions", "transport"].includes(f.group)
    );
  }, [fields]);
  
  // Calculate field statistics (only for displayable fields)
  const stats = useMemo(() => {
    const autoSources = ["cabinet", "computed"];
    return {
      total: displayableFields.length,
      auto: displayableFields.filter(f => autoSources.includes(f.source)).length,
      manual: displayableFields.filter(f => f.source === "manual").length,
    };
  }, [displayableFields]);
  
  // Filtered field cards based on active filter
  const filteredFieldCards = useMemo((): FieldCardConfig[] => {
    const autoSources = ["cabinet", "computed"];
    
    let filtered = displayableFields;
    
    switch (activeFilter) {
      case "auto":
        filtered = displayableFields.filter(f => autoSources.includes(f.source));
        break;
      case "manual":
        filtered = displayableFields.filter(f => f.source === "manual");
        break;
    }
    
    return filtered.map(field => ({
      id: field.key,
      icon: getFieldIcon(field.dataType),
      label: field.label,
      value: field.originalText || `[${field.label}]`,
      source: field.source,
      color: getSourceColor(field.source),
    }));
  }, [displayableFields, activeFilter]);
  
  // Check scroll state for fade masks
  const updateScrollState = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    
    const canScrollLeft = el.scrollLeft > 10;
    const canScrollRight = el.scrollLeft < el.scrollWidth - el.clientWidth - 10;
    
    setScrollState({ canScrollLeft, canScrollRight });
  }, []);
  
  useEffect(() => {
    updateScrollState();
    window.addEventListener('resize', updateScrollState);
    return () => window.removeEventListener('resize', updateScrollState);
  }, [updateScrollState]);
  
  return (
    <div 
      className={cn(
        "border-b border-border bg-subtab-shelf min-w-0 overflow-hidden",
        className
      )}
    >
      {/* Header - fully clickable to toggle */}
      <button
        type="button"
        onClick={onToggleExpand}
        className="w-full flex items-center justify-between px-6 py-2.5 hover:bg-muted/30 transition-colors cursor-pointer"
        aria-label={isExpanded ? "Згорнути панель полів" : "Розгорнути панель полів"}
      >
        <div className="flex items-center gap-2 flex-wrap">
          {/* Total fields badge - clickable filter */}
          <Badge 
            variant={activeFilter === "all" ? "default" : "secondary"} 
            className={cn(
              "text-xs cursor-pointer transition-all",
              activeFilter === "all" && "ring-2 ring-primary/50"
            )}
            onClick={(e) => {
              e.stopPropagation();
              setActiveFilter("all");
            }}
          >
            <FileText className="w-3 h-3 mr-1" />
            {stats.total} полів
          </Badge>
          
          {/* Auto filter badge */}
          <Badge 
            variant={activeFilter === "auto" ? "default" : "secondary"} 
            className={cn(
              "text-xs cursor-pointer transition-all gap-1",
              activeFilter === "auto" && "ring-2 ring-primary/50",
              activeFilter !== "auto" && "bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40"
            )}
            onClick={(e) => {
              e.stopPropagation();
              setActiveFilter("auto");
            }}
          >
            <Sparkles className="w-3 h-3" />
            Авто: {stats.auto}
          </Badge>
          
          {/* Manual filter badge */}
          <Badge 
            variant={activeFilter === "manual" ? "default" : "secondary"} 
            className={cn(
              "text-xs cursor-pointer transition-all gap-1",
              activeFilter === "manual" && "ring-2 ring-primary/50",
              activeFilter !== "manual" && "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/40"
            )}
            onClick={(e) => {
              e.stopPropagation();
              setActiveFilter("manual");
            }}
          >
            <Edit className="w-3 h-3" />
            Ручне: {stats.manual}
          </Badge>
          
          {/* Selection cards filter badge (purple) */}
          {selectionCards.length > 0 && (
            <Badge 
              variant={activeFilter === "selection" ? "default" : "secondary"} 
              className={cn(
                "text-xs cursor-pointer transition-all gap-1",
                activeFilter === "selection" && "ring-2 ring-primary/50",
                activeFilter !== "selection" && "bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/40"
              )}
              onClick={(e) => {
                e.stopPropagation();
                setActiveFilter("selection");
              }}
            >
              <Building2 className="w-3 h-3" />
              Картки: {selectionCards.length}
            </Badge>
          )}
          
          {/* Demo badge */}
          {isDemo && (
            <Badge variant="outline" className="text-xs gap-1 text-muted-foreground pointer-events-none">
              <Beaker className="w-3 h-3" />
              Demo
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {/* Add Field button */}
          {onAddField && (
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs gap-1.5"
              onClick={(e) => {
                e.stopPropagation();
                onAddField();
              }}
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Поле</span>
            </Button>
          )}
          
          <div className="h-9 w-9 flex items-center justify-center">
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </div>
        </div>
      </button>
      
      {/* Content - single unified strip */}
      {isExpanded && (
        <div className="mx-6 mb-2.5 rounded-lg border border-border/60 bg-background/80 shadow-[0_2px_8px_rgba(0,0,0,0.04)] relative overflow-hidden">
          <div className="p-3 relative">
            {/* Section label - dynamic based on filter */}
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium">
                {activeFilter === "selection" ? "Картки вибору" : "Поля"}
              </span>
              <div className="flex-1 h-px bg-border/40" />
            </div>
            
            {/* Left fade mask */}
            <div 
              className={cn(
                "absolute left-0 top-8 bottom-0 w-8 z-10 pointer-events-none transition-opacity duration-200",
                "bg-gradient-to-r from-background/95 to-transparent",
                scrollState.canScrollLeft ? "opacity-100" : "opacity-0"
              )}
            />
            
            {/* Right fade mask */}
            <div 
              className={cn(
                "absolute right-0 top-8 bottom-0 w-8 z-10 pointer-events-none transition-opacity duration-200",
                "bg-gradient-to-l from-background/95 to-transparent",
                scrollState.canScrollRight ? "opacity-100" : "opacity-0"
              )}
            />
            
            {/* Unified cards strip */}
            <div
              ref={scrollContainerRef}
              className={cn(
                "flex gap-2 overflow-x-auto scrollbar-thin scrollbar-thumb-border",
                isDragging && "cursor-grabbing select-none"
              )}
              onScroll={updateScrollState}
              {...dragHandlers}
            >
              {activeFilter === "selection" ? (
                // Show selection cards
                selectionCards.map((card) => (
                  <SelectionCardPreview 
                    key={card.id} 
                    {...card} 
                    onClick={() => {
                      // Handle selection card click (bidirectional sync)
                    }}
                  />
                ))
              ) : (
                // Show field cards
                filteredFieldCards.map((card) => (
                  <FieldCard
                    key={card.id}
                    {...card}
                    onClick={() => {
                      if (onFieldClick) {
                        onFieldClick(card.id);
                      }
                    }}
                    isHighlighted={highlightedFieldKey === card.id}
                  />
                ))
              )}
            </div>
          </div>
          
          {/* Empty state for selection cards */}
          {activeFilter === "selection" && selectionCards.length === 0 && (
            <div className="flex items-center justify-center w-full py-4 text-sm text-muted-foreground">
              Немає карток вибору
            </div>
          )}
          
          {/* Empty state for fields */}
          {activeFilter !== "selection" && filteredFieldCards.length === 0 && (
            <div className="flex items-center justify-center w-full py-4 text-sm text-muted-foreground">
              {activeFilter === "auto" 
                ? "Немає авто-полів" 
                : activeFilter === "manual" 
                  ? "Немає ручних полів"
                  : "Немає полів"}
            </div>
          )}
          
          {/* Progress dots for current strip */}
          {((activeFilter === "selection" && selectionCards.length > 3) ||
            (activeFilter !== "selection" && filteredFieldCards.length > 3)) && (
            <div className="flex items-center justify-center gap-1.5 py-2 border-t border-border/50">
              {Array.from({ 
                length: Math.min(7, Math.ceil(
                  (activeFilter === "selection" ? selectionCards.length : filteredFieldCards.length) / 3
                )) 
              }).map((_, index) => (
                <div
                  key={index}
                  className={cn(
                    "w-1.5 h-1.5 rounded-full transition-all",
                    index === 0
                      ? "bg-primary scale-125"
                      : "bg-muted-foreground/30"
                  )}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
