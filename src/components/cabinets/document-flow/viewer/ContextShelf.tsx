/**
 * ContextShelf - Responsive shelf for View mode
 * Works on both mobile and desktop
 * 
 * Structure tab: Grid layout (3 columns)
 * Comments/Versions tabs: Vertical list with scroll
 * 
 * v3: Added fade masks + drag-to-scroll + demo marking
 */

import { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  FileText, 
  MessageCircle, 
  ChevronUp, 
  ChevronDown,
  Beaker,
  Plus,
} from "lucide-react";
import { useDragToScrollWithMomentum } from "@/hooks/use-drag-to-scroll";

// Card components
import { StructureCard } from "../cards/StructureCard";
import { CommentCard } from "../cards/CommentCard";
import { VersionCard } from "../cards/VersionCard";

// Types
import type { DocumentSection } from "./utils/documentStructureParser";
import type { DocumentComment } from "./panels/CommentsPanel";
import type { DocumentVersion } from "@/config/documentVersioningConfig";

export type ContextShelfTab = "structure" | "comments";

// Reaction type for comments
export interface CommentReaction {
  emoji: string;
  count: number;
  hasReacted: boolean;
}

// Check if structure is demo-generated
const isDemoStructure = (sections: DocumentSection[]): boolean => {
  // Demo structure from generateDemoStructure has specific IDs like "s1", "s2"
  if (sections.length === 0) return false;
  return sections[0]?.id?.startsWith("s") && sections[0]?.id?.length <= 3;
};

// Demo comments for testing
export const DEMO_COMMENTS: DocumentComment[] = [
  {
    id: "comment-1",
    author: "Олена Коваленко",
    authorInitials: "ОК",
    content: "Потрібно уточнити умови оплати. Стандартний термін 14 днів, але в договорі вказано 30.",
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 хв тому
    fragmentId: "fragment-1",
    fragmentText: "термін оплати становить 30 календарних днів",
    isResolved: false,
  },
  {
    id: "comment-2",
    author: "Максим Петренко",
    authorInitials: "МП",
    content: "Перевірив реквізити контрагента - все вірно.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 години тому
    isResolved: true,
  },
  {
    id: "comment-3",
    author: "Ірина Шевченко",
    authorInitials: "ІШ",
    content: "Зверніть увагу на пункт про відповідальність сторін. Штрафні санкції значно вищі за стандартні.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 годин тому
    fragmentId: "fragment-2",
    fragmentText: "штрафні санкції у розмірі 0.5% за кожен день",
    isResolved: false,
    replies: [
      {
        id: "reply-1",
        author: "Олена Коваленко",
        content: "Погоджуюсь, треба узгодити з юристом",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
      }
    ],
  },
  {
    id: "comment-4",
    author: "Андрій Бондаренко",
    authorInitials: "АБ",
    content: "Сума договору відповідає затвердженому бюджету на Q1.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 день тому
    isResolved: true,
  },
  {
    id: "comment-5",
    author: "Наталія Ткаченко",
    authorInitials: "НТ",
    content: "Додала примітку щодо особливих умов доставки. Контрагент погодився на безкоштовну доставку при замовленні від 10 000 грн.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 дні тому
    fragmentId: "fragment-3",
    fragmentText: "умови доставки",
    isResolved: false,
  },
  {
    id: "comment-6",
    author: "Олексій Мельник",
    authorInitials: "ОМ",
    content: "Документ готовий до підписання після узгодження коментарів вище.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), // 3 дні тому
    isResolved: false,
  },
];

interface ContextShelfProps {
  // Active tab
  activeTab: ContextShelfTab;
  onTabChange: (tab: ContextShelfTab) => void;
  
  // Data
  sections: DocumentSection[];
  comments: DocumentComment[];
  versions?: DocumentVersion[]; // Keep prop for backward compatibility but not displayed
  
  // Active states
  activeSectionId?: string;
  highlightedSectionId?: string;
  highlightedCommentId?: string;
  
  // Callbacks - Structure
  onSectionHover?: (sectionId: string | null) => void;
  onSectionClick?: (sectionId: string) => void;
  
  // Callbacks - Comments
  onCommentHover?: (fragmentId: string | null) => void;
  onCommentClick?: (commentId: string) => void;
  onCommentReply?: (commentId: string) => void;
  onCommentResolve?: (commentId: string) => void;
  onAddComment?: () => void;
  
  // Callbacks - Versions (kept for backward compatibility)
  onVersionView?: (versionId: string) => void;
  onVersionCompare?: (version: DocumentVersion, previousVersion: DocumentVersion) => void;
  onVersionRestore?: (version: DocumentVersion) => void;
  
  // Expand/collapse
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  
  // Show/hide structure tab (hide in edit mode)
  showStructure?: boolean;
  
  className?: string;
}

// Tab button component
function TabButton({ 
  id,
  label, 
  icon: Icon,
  count, 
  isActive, 
  onClick 
}: { 
  id: ContextShelfTab;
  label: string;
  icon: React.ElementType;
  count?: number;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-full transition-all",
        isActive 
          ? "bg-primary text-primary-foreground shadow-sm" 
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
    >
      <Icon className="w-3.5 h-3.5" />
      <span className="hidden sm:inline">{label}</span>
      {count !== undefined && count > 0 && (
        <Badge 
          variant={isActive ? "secondary" : "outline"} 
          className={cn(
            "text-[9px] h-4 px-1 ml-0.5",
            isActive && "bg-primary-foreground/20 text-primary-foreground"
          )}
        >
          {count}
        </Badge>
      )}
    </button>
  );
}

export const ContextShelf = ({
  activeTab,
  onTabChange,
  sections,
  comments: externalComments,
  versions,
  activeSectionId,
  highlightedSectionId,
  highlightedCommentId,
  onSectionHover,
  onSectionClick,
  onCommentHover,
  onCommentClick,
  onCommentReply,
  onCommentResolve,
  onAddComment,
  onVersionView,
  onVersionCompare,
  onVersionRestore,
  isExpanded = true,
  onToggleExpand,
  showStructure = true,
  className,
}: ContextShelfProps) => {
  // Scroll container ref for fade masks and drag-to-scroll
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [scrollState, setScrollState] = useState({ canScrollLeft: false, canScrollRight: false });
  
  // Drag-to-scroll hook
  const { isDragging, handlers: dragHandlers } = useDragToScrollWithMomentum(
    () => scrollContainerRef.current
  );
  
  // Check scroll state for fade masks
  const updateScrollState = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    
    const canScrollLeft = el.scrollLeft > 10;
    const canScrollRight = el.scrollLeft < el.scrollWidth - el.clientWidth - 10;
    
    setScrollState({ canScrollLeft, canScrollRight });
  }, []);
  
  // Update scroll state on mount and resize
  useEffect(() => {
    updateScrollState();
    window.addEventListener('resize', updateScrollState);
    return () => window.removeEventListener('resize', updateScrollState);
  }, [updateScrollState]);
  
  // Track if showing demo data
  const isUsingDemoComments = !externalComments || externalComments.length === 0;
  
  // Use demo comments if no external comments provided
  const comments = useMemo(() => {
    if (externalComments && externalComments.length > 0) {
      return externalComments;
    }
    return DEMO_COMMENTS;
  }, [externalComments]);
  
  // Sort comments by date (newest first)
  const sortedComments = useMemo(() => 
    [...comments].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ), 
    [comments]
  );
  
  // Flatten sections for display (max 2 levels)
  const flattenedSections = useMemo(() => {
    const result: DocumentSection[] = [];
    sections.forEach(section => {
      result.push(section);
      section.children?.forEach(child => {
        result.push(child);
      });
    });
    return result;
  }, [sections]);
  
  // Open comments count
  const openCommentsCount = useMemo(() => 
    comments.filter(c => !c.isResolved).length, 
    [comments]
  );
  
  // Normalize activeTab when showStructure=false
  // This ensures content always matches the tab header
  const effectiveTab = showStructure ? activeTab : "comments";
  
  // Empty state
  const isEmpty = 
    (effectiveTab === "structure" && flattenedSections.length === 0) ||
    (effectiveTab === "comments" && sortedComments.length === 0);
  
  const emptyMessages: Record<ContextShelfTab, string> = {
    structure: "Структура документа недоступна",
    comments: "Коментарів поки немає",
  };
  
  // Render content based on effective tab (normalized when showStructure=false)
  const renderContent = () => {
    // Empty state with CTA for comments
    if (effectiveTab === "comments" && sortedComments.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-8 px-4 gap-3">
          <MessageCircle className="w-10 h-10 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">Коментарів поки немає</p>
          {onAddComment && (
            <Button 
              variant="outline" 
              size="sm"
              className="min-h-[44px] gap-1.5"
              onClick={onAddComment}
            >
              <Plus className="w-4 h-4" />
              Додати перший коментар
            </Button>
          )}
        </div>
      );
    }
    
    if (isEmpty) {
      return (
        <div className="flex items-center justify-center py-6 px-4 text-muted-foreground text-xs">
          {emptyMessages[effectiveTab]}
        </div>
      );
    }
    
    switch (effectiveTab) {
      case "structure":
        return (
          <div 
            ref={scrollContainerRef}
            className={cn(
              "flex gap-2 p-3 overflow-x-auto snap-x snap-mandatory scrollbar-thin scrollbar-thumb-border",
              isDragging && "cursor-grabbing select-none"
            )}
            onScroll={updateScrollState}
            {...dragHandlers}
          >
            {flattenedSections.map((section, index) => (
              <StructureCard
                key={section.id}
                section={section}
                index={index}
                isActive={activeSectionId === section.fragmentRef || activeSectionId === section.id}
                isHighlighted={highlightedSectionId === section.fragmentRef || highlightedSectionId === section.id}
                onHover={onSectionHover}
                onClick={onSectionClick}
              />
            ))}
          </div>
        );
        
      case "comments":
        return (
          <div 
            ref={scrollContainerRef}
            className={cn(
              "flex gap-2 p-3 overflow-x-auto snap-x snap-mandatory scrollbar-thin scrollbar-thumb-border",
              isDragging && "cursor-grabbing select-none"
            )}
            onScroll={updateScrollState}
            {...dragHandlers}
          >
            {sortedComments.map((comment) => (
              <CommentCard
                key={comment.id}
                comment={comment}
                isHighlighted={highlightedCommentId === comment.id}
                onHover={onCommentHover}
                onClick={onCommentClick}
                onReply={onCommentReply}
                onResolve={onCommentResolve}
              />
            ))}
          </div>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <div 
      className={cn(
        "border-b border-border bg-subtab-shelf min-w-0 overflow-hidden",
        className
      )}
      data-section="context-shelf"
    >
      {/* Header with tabs */}
      <div className="flex items-center justify-between px-6 py-2.5">
        <div className="flex items-center gap-1.5">
          {/* Structure tab - only show when showStructure is true */}
          {showStructure && (
            <TabButton
              id="structure"
              label="Структура"
              icon={FileText}
              count={flattenedSections.length}
              isActive={activeTab === "structure"}
              onClick={() => onTabChange("structure")}
            />
          )}
          <TabButton
            id="comments"
            label="Коментарі"
            icon={MessageCircle}
            count={openCommentsCount}
            isActive={activeTab === "comments" || (!showStructure && activeTab === "structure")}
            onClick={() => onTabChange("comments")}
          />
          
          {/* Demo data indicator - for comments */}
          {effectiveTab === "comments" && isUsingDemoComments && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 gap-1 border-dashed border-warning text-warning">
                    <Beaker className="w-3 h-3" />
                    Demo
                  </Badge>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p className="text-xs">Приклад коментарів для демонстрації</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          
          {/* Demo data indicator - for structure */}
          {effectiveTab === "structure" && isDemoStructure(sections) && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 gap-1 border-dashed border-warning text-warning">
                    <Beaker className="w-3 h-3" />
                    Demo
                  </Badge>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p className="text-xs">Структура згенерована автоматично для демонстрації</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        
        {/* Right side: Add comment button + Collapse toggle */}
        <div className="flex items-center gap-1">
          {effectiveTab === "comments" && onAddComment && (
            <Button
              variant="outline"
              size="sm"
              className="h-9 text-xs gap-1.5 px-3 rounded-full border-primary/30 text-primary hover:bg-primary/10"
              onClick={onAddComment}
            >
              <Plus className="w-4 h-4" />
              <span className="hidden xs:inline">Коментар</span>
            </Button>
          )}
          {onToggleExpand && (
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={onToggleExpand}
              aria-label={isExpanded ? "Згорнути панель" : "Розгорнути панель"}
            >
              {isExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </Button>
          )}
        </div>
      </div>
      
      {/* Content area with scroll and fade masks */}
      {isExpanded && (
        <div className="mx-6 mb-2.5 rounded-lg border border-border/60 bg-background/80 shadow-[0_2px_8px_rgba(0,0,0,0.04)] relative overflow-hidden">
          {/* Left fade mask */}
          <div 
            className={cn(
              "absolute left-0 top-0 bottom-0 w-8 z-10 pointer-events-none transition-opacity duration-200",
              "bg-gradient-to-r from-background/95 to-transparent",
              scrollState.canScrollLeft ? "opacity-100" : "opacity-0"
            )}
          />
          
          {/* Right fade mask */}
          <div 
            className={cn(
              "absolute right-0 top-0 bottom-0 w-8 z-10 pointer-events-none transition-opacity duration-200",
              "bg-gradient-to-l from-background/95 to-transparent",
              scrollState.canScrollRight ? "opacity-100" : "opacity-0"
            )}
          />
          
          <div className="overflow-hidden">
            {renderContent()}
          </div>
        </div>
      )}
    </div>
  );
};

export default ContextShelf;
