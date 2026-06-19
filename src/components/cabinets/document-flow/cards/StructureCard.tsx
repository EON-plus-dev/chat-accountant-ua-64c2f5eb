/**
 * StructureCard - Compact expandable card for document section navigation
 * Used in horizontal Context Shelf for View mode
 */

import { useState } from "react";
import { cn } from "@/lib/utils";
import { FileText, ChevronRight, ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { DocumentSection } from "../viewer/utils/documentStructureParser";

interface StructureCardProps {
  section: DocumentSection;
  index?: number;
  isActive?: boolean;
  isHighlighted?: boolean;
  onHover?: (sectionId: string | null) => void;
  onClick?: (sectionId: string) => void;
  className?: string;
}

export const StructureCard = ({
  section,
  index,
  isActive = false,
  isHighlighted = false,
  onHover,
  onClick,
  className,
}: StructureCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const childrenCount = section.children?.length || 0;
  const hasExpandableContent = childrenCount > 0 || (section.title?.length || 0) > 40;
  
  // Level-based styling
  const levelStyles = {
    1: "border-l-primary/70",
    2: "border-l-blue-400/60",
    3: "border-l-slate-400/50",
  };
  
  return (
    <div
      data-structure-card-id={section.id}
      className={cn(
        // Fixed width for horizontal scroll (unified)
        "w-[220px] shrink-0 snap-center",
        // Flex layout to pin footer
        "flex flex-col",
        // Card styling
        "rounded-lg border bg-card p-3",
        "border-l-[3px]",
        levelStyles[section.level],
        // States
        "transition-all duration-200",
        "hover:shadow-md hover:border-primary/30",
        isActive && "ring-2 ring-primary/50 bg-primary/5",
        isHighlighted && "bg-accent/50 shadow-md",
        // Cursor
        "cursor-pointer select-none",
        className
      )}
      style={{
        height: isExpanded ? 240 : 140,
        transition: 'height 250ms ease-in-out',
      }}
      onMouseEnter={() => onHover?.(section.fragmentRef)}
      onMouseLeave={() => onHover?.(null)}
      onClick={() => onClick?.(section.fragmentRef)}
    >
      {/* Content area - flexible */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {/* Header with number and title */}
        <div className="flex items-start gap-2 mb-1.5">
          {index !== undefined && (
            <span className="text-xs font-mono text-muted-foreground shrink-0 mt-0.5">
              #{index + 1}
            </span>
          )}
          <FileText className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className={cn(
              "text-xs font-medium leading-tight break-words",
              section.level === 1 && "text-foreground",
              section.level === 2 && "text-foreground/90",
              section.level === 3 && "text-muted-foreground",
              !isExpanded && "line-clamp-2"
            )}>
              {section.title}
            </p>
          </div>
        </div>
        
        {/* Children list (expanded only) */}
        {isExpanded && childrenCount > 0 && (
          <div className="pl-6 space-y-1 max-h-[80px] overflow-y-auto">
            {section.children?.map((child, idx) => (
              <p 
                key={child.id} 
                className="text-[10px] text-muted-foreground truncate cursor-pointer hover:text-foreground"
                onClick={(e) => {
                  e.stopPropagation();
                  onClick?.(child.fragmentRef);
                }}
              >
                {idx + 1}. {child.title}
              </p>
            ))}
          </div>
        )}
      </div>
      
      {/* Footer with subsection count - always visible */}
      <div className="flex items-center justify-between mt-auto pt-2 shrink-0">
        <div className="flex items-center gap-1">
          {childrenCount > 0 && (
            <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
              {childrenCount} підрозділ{childrenCount === 1 ? '' : childrenCount < 5 ? 'и' : 'ів'}
            </Badge>
          )}
          {section.level > 1 && (
            <Badge variant="outline" className="text-[10px] h-4 px-1.5 text-muted-foreground">
              Рівень {section.level}
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(prev => !prev);
            }}
          >
            {isExpanded ? (
              <ChevronUp className="w-3 h-3" />
            ) : (
              <ChevronDown className="w-3 h-3" />
            )}
          </Button>
          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
        </div>
      </div>
    </div>
  );
};

export default StructureCard;
