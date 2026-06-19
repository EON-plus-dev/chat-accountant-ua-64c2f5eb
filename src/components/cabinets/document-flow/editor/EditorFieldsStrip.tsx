/**
 * EditorFieldsStrip - Horizontal strip of field cards for template editing
 * Features: numbered cards, source badges, drag-to-scroll, bidirectional navigation, edit/delete
 * Mobile: Collapsible with compact summary view
 */

import { useRef, useEffect, useCallback, useState } from "react";
import { useDragToScrollWithMomentum } from "@/hooks/use-drag-to-scroll";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, Pencil, MoreHorizontal, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useIsMobile } from "@/hooks/use-mobile";
import type { UnifiedTemplateField } from "@/types/templateField";

interface EditorFieldsStripProps {
  fields: UnifiedTemplateField[];
  highlightedFieldKey: string | null;
  onFieldClick: (fieldKey: string) => void;
  onFieldHover?: (fieldKey: string | null) => void;
  onFieldEdit?: (field: UnifiedTemplateField) => void;
  onFieldDelete?: (fieldKey: string) => void;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  className?: string;
}

/**
 * Single field card component with edit/delete menu
 */
const FieldCard = ({
  index,
  field,
  isHighlighted,
  onClick,
  onHover,
  onEdit,
  onDelete,
}: {
  index: number;
  field: UnifiedTemplateField;
  isHighlighted: boolean;
  onClick: () => void;
  onHover?: (key: string | null) => void;
  onEdit?: (field: UnifiedTemplateField) => void;
  onDelete?: (fieldKey: string) => void;
}) => {
  const isAuto = field.source !== "manual";

  return (
    <div
      data-field-key={field.key}
      className={cn(
        "group relative flex-shrink-0 flex flex-col items-start gap-0.5 sm:gap-1 p-1.5 sm:p-2.5 rounded-lg border transition-all duration-200",
        "min-w-[80px] max-w-[120px] sm:min-w-[120px] sm:max-w-[160px] text-left cursor-pointer",
        // Calm hover - subtle shadow and border tint instead of scale
        "hover:shadow-sm hover:border-primary/30",
        "snap-start",
        // Background based on source
        isAuto 
          ? "bg-blue-50/50 dark:bg-blue-950/20 border-blue-200/50 dark:border-blue-800/30"
          : "bg-amber-50/50 dark:bg-amber-950/20 border-amber-200/50 dark:border-amber-800/30",
        // Highlighted state - soft ring without pulse
        isHighlighted && "ring-2 ring-primary/50 ring-offset-1 bg-primary/5"
      )}
      onClick={onClick}
      onMouseEnter={() => onHover?.(field.key)}
      onMouseLeave={() => onHover?.(null)}
    >
      {/* Header: Number + Name + Menu */}
      <div className="flex items-center gap-1 sm:gap-1.5 w-full">
        <span
          className={cn(
            "flex-shrink-0 w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-medium",
            isAuto ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
          )}
        >
          {index}
        </span>
        <span className="text-[11px] sm:text-sm font-medium text-foreground truncate flex-1">
          {field.label}
        </span>

        {/* Edit/Delete dropdown - shows on hover */}
        {(onEdit || onDelete) && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className={cn(
                  "flex-shrink-0 p-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity",
                  "hover:bg-muted/80 focus:opacity-100"
                )}
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-36">
              {onEdit && (
                <DropdownMenuItem onClick={() => onEdit(field)}>
                  <Pencil className="w-3.5 h-3.5 mr-2" />
                  Редагувати
                </DropdownMenuItem>
              )}
              {onEdit && onDelete && <DropdownMenuSeparator />}
              {onDelete && (
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => onDelete(field.key)}
                >
                  <Trash2 className="w-3.5 h-3.5 mr-2" />
                  Видалити
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Badge: Source indicator (single icon only) */}
      <Badge
        variant="secondary"
        className={cn(
          "p-0.5 sm:p-1 h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center flex-shrink-0",
          isAuto ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
        )}
      >
        {isAuto ? <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> : <Pencil className="w-2.5 h-2.5 sm:w-3 sm:h-3" />}
      </Badge>
    </div>
  );
};

export const EditorFieldsStrip = ({
  fields,
  highlightedFieldKey,
  onFieldClick,
  onFieldHover,
  onFieldEdit,
  onFieldDelete,
  collapsible = true,
  defaultCollapsed = true,
  className,
}: EditorFieldsStripProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const isMobile = useIsMobile();
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed && isMobile);
  const [showLeftFade, setShowLeftFade] = useState(false);
  const [showRightFade, setShowRightFade] = useState(false);

  // Use unified drag-to-scroll with momentum (same as AnchorCardStrip)
  const getViewport = useCallback(() => scrollRef.current, []);
  const { isDragging: isDraggingState, handlers } = useDragToScrollWithMomentum(getViewport, {
    friction: 0.94,
    minVelocity: 0.5,
  });

  // Calculate auto vs manual counts
  const autoCount = fields.filter(f => f.source !== "manual").length;
  const manualCount = fields.length - autoCount;

  // Fade mask scroll detection
  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (el) {
      setShowLeftFade(el.scrollLeft > 0);
      setShowRightFade(el.scrollLeft < el.scrollWidth - el.clientWidth - 1);
    }
  }, []);

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (el) {
      el.addEventListener("scroll", checkScroll);
      return () => el.removeEventListener("scroll", checkScroll);
    }
  }, [fields, checkScroll, isCollapsed]);

  // Auto-expand when field is highlighted
  useEffect(() => {
    if (highlightedFieldKey && isCollapsed) {
      setIsCollapsed(false);
    }
  }, [highlightedFieldKey, isCollapsed]);

  // Update collapsed state when switching between mobile/desktop
  useEffect(() => {
    if (!isMobile && isCollapsed) {
      setIsCollapsed(false);
    }
  }, [isMobile, isCollapsed]);

  // Scroll to highlighted field
  useEffect(() => {
    if (highlightedFieldKey && scrollRef.current && !isCollapsed) {
      const fieldCard = scrollRef.current.querySelector(
        `[data-field-key="${highlightedFieldKey}"]`
      );
      if (fieldCard) {
        fieldCard.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });
      }
    }
  }, [highlightedFieldKey, isCollapsed]);

  if (fields.length === 0) {
    return null;
  }

  const showCollapsible = collapsible && isMobile;

  return (
    <div className={cn("border-b bg-muted/30", className)}>
      {/* Collapsed view - compact summary (mobile only) */}
      {showCollapsible && isCollapsed ? (
        <div 
          className="flex items-center gap-2 px-2 py-1.5 cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => setIsCollapsed(false)}
        >
          <Badge variant="outline" className="text-[10px] h-5 px-1.5">
            {fields.length} полів
          </Badge>
          {autoCount > 0 && (
            <Badge variant="secondary" className="text-[10px] h-5 px-1.5 bg-primary/10 text-primary border-0">
              <Sparkles className="w-2.5 h-2.5 mr-0.5" />
              {autoCount}
            </Badge>
          )}
          {manualCount > 0 && (
            <Badge variant="secondary" className="text-[10px] h-5 px-1.5 bg-muted text-muted-foreground border-0">
              <Pencil className="w-2.5 h-2.5 mr-0.5" />
              {manualCount}
            </Badge>
          )}
          <ChevronDown className="w-3.5 h-3.5 ml-auto text-muted-foreground" />
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="flex items-center justify-between px-2 sm:px-3 py-1 sm:py-1.5 border-b border-border/50">
            <span className="text-[10px] sm:text-xs font-medium text-muted-foreground">
              Поля шаблону ({fields.length})
            </span>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-primary" />
                  <span className="hidden sm:inline">Авто</span>
                </span>
                <span className="flex items-center gap-1">
                  <Pencil className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                  <span className="hidden sm:inline">Ручне</span>
                </span>
              </div>
              {/* Collapse button (mobile only) */}
              {showCollapsible && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 sm:hidden"
                  onClick={() => setIsCollapsed(true)}
                >
                  <ChevronUp className="w-3 h-3" />
                </Button>
              )}
            </div>
          </div>

          {/* Scrollable strip with fade masks */}
          <div className="relative">
            {/* Left fade mask */}
            {showLeftFade && (
              <div className="absolute left-0 top-0 bottom-0 w-6 z-10 pointer-events-none fade-mask-left" />
            )}
            {/* Right fade mask */}
            {showRightFade && (
              <div className="absolute right-0 top-0 bottom-0 w-6 z-10 pointer-events-none fade-mask-right" />
            )}

            <div
              ref={scrollRef}
              {...handlers}
              className={cn(
                "flex gap-1.5 sm:gap-2 p-1.5 sm:p-2 overflow-x-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent",
                "select-none overscroll-x-contain touch-pan-x snap-x snap-mandatory",
                isDraggingState ? "cursor-grabbing" : "cursor-grab",
                "min-h-[56px] sm:min-h-[76px]"
              )}
            >
              {fields.map((field, index) => (
                <FieldCard
                  key={field.key}
                  index={index + 1}
                  field={field}
                  isHighlighted={highlightedFieldKey === field.key}
                  onClick={() => onFieldClick(field.key)}
                  onHover={onFieldHover}
                  onEdit={onFieldEdit}
                  onDelete={onFieldDelete}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
