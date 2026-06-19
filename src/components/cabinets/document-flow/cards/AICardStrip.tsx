/**
 * AICardStrip Component
 * Horizontal scrollable strip of unified AI cards with filtering and summary
 * Uses native overflow-x for reliable horizontal scrolling (SubtabShelf pattern)
 */

import { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronUp, ChevronDown, BarChart3 } from "lucide-react";
import { UnifiedAICard } from "./UnifiedAICard";
import { useDragToScrollWithMomentum } from "@/hooks/use-drag-to-scroll";
import type { UnifiedAICardData, AICardFilterType } from "@/types/aiVerification";

interface AICardStripProps {
  cards: UnifiedAICardData[];
  highlightedId?: string;
  scrollToCardId?: string; // Triggers scroll only when set (click from editor)
  onCardHover?: (id: string | null) => void;
  onCardClick?: (id: string) => void;
  onAccept: (id: string, comment?: string) => void;
  onDismiss: (id: string, comment?: string) => void;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  className?: string;
}

// Filter chip component
function FilterChip({ 
  label, 
  count, 
  isActive, 
  onClick 
}: { 
  label: string; 
  count: number; 
  isActive: boolean; 
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-3 py-2 sm:py-1 min-h-[44px] sm:min-h-[28px] text-xs font-medium rounded-full transition-all",
        "touch-manipulation",
        isActive 
          ? "bg-primary text-primary-foreground" 
          : "bg-muted/70 text-muted-foreground hover:bg-muted"
      )}
    >
      {label} {count}
    </button>
  );
}

export function AICardStrip({
  cards,
  highlightedId,
  scrollToCardId,
  onCardHover,
  onCardClick,
  onAccept,
  onDismiss,
  isExpanded = true,
  onToggleExpand,
  className,
}: AICardStripProps) {
  
  const [filterType, setFilterType] = useState<AICardFilterType>("all");
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);
  const [isProgrammaticScrolling, setIsProgrammaticScrolling] = useState(false);
  const viewportRef = useRef<HTMLDivElement>(null);
  
  // Drag-to-scroll with momentum for desktop
  const { isDragging, stopMomentum, handlers } = useDragToScrollWithMomentum(
    () => viewportRef.current,
    { friction: 0.92, minVelocity: 0.5 }
  );
  
  // Sort cards: needs_review first, then pending, approved, accepted, dismissed last
  const sortedCards = useMemo(() => {
    const statusOrder: Record<string, number> = {
      needs_review: 0,
      pending: 1,
      approved: 2,
      accepted: 3,
      dismissed: 4,
    };
    
    return [...cards].sort((a, b) => {
      const orderA = statusOrder[a.status] ?? 5;
      const orderB = statusOrder[b.status] ?? 5;
      return orderA - orderB;
    });
  }, [cards]);
  
  // Filter cards
  const filteredCards = useMemo(() => {
    if (filterType === "all") return sortedCards;
    return sortedCards.filter(card => card.type === filterType);
  }, [sortedCards, filterType]);
  
  // Calculate summary stats
  const stats = useMemo(() => {
    const approved = cards.filter(c => 
      c.status === "approved" || c.status === "accepted"
    ).length;
    const needsReview = cards.filter(c => c.status === "needs_review").length;
    const dismissed = cards.filter(c => c.status === "dismissed").length;
    const autoFilled = cards.filter(c => c.type === "auto-filled").length;
    const verified = cards.filter(c => c.type === "ai-verified").length;
    
    return { approved, needsReview, dismissed, autoFilled, verified };
  }, [cards]);
  
  // Helper: scroll a card to center - simplified single scrollIntoView (no jitter)
  const scrollCardToCenter = useCallback((cardId: string, attempt = 0) => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const cardElement = viewport.querySelector(`[data-card-strip-id="${cardId}"]`) as HTMLElement | null;
    
    // Retry up to 5 times if element not found (may still be rendering)
    if (!cardElement) {
      if (attempt < 5) {
        requestAnimationFrame(() => scrollCardToCenter(cardId, attempt + 1));
      }
      return;
    }

    // Stop any ongoing momentum animation before programmatic scroll
    stopMomentum();
    setIsProgrammaticScrolling(true);
    
    // Disable snap during programmatic scroll
    viewport.style.scrollSnapType = 'none';
    
    // Single smooth scrollIntoView - no double scrollTo that causes jitter
    cardElement.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'center'
    });
    
    // Re-enable snap after scroll completes
    setTimeout(() => {
      viewport.style.scrollSnapType = '';
      setIsProgrammaticScrolling(false);
    }, 400);
  }, [stopMomentum]);
  
  // Auto-scroll to card when scrollToCardId changes (click from text)
  // Also resets filter to "all" to ensure card is visible
  useEffect(() => {
    if (import.meta.env.DEV) console.log(`[CardStrip] scrollToCardId changed: ${scrollToCardId}`);
    if (!scrollToCardId) return;

    // Reset filter to "all" if needed to ensure target card is visible
    if (filterType !== 'all') {
      setFilterType('all');
    }
    
    // CRITICAL: Always use double-rAF to ensure DOM is fully updated after React render
    // This fixes the timing issue where scroll runs before card element exists
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        scrollCardToCenter(scrollToCardId);
      });
    });
  }, [scrollToCardId, scrollCardToCenter]); // Removed filterType dependency to prevent double-trigger
  
  // NOTE: Auto-scroll on expand REMOVED to prevent "jitter" UX bug
  // Cards now expand in-place without forced centering (Stripe/Linear pattern)
  
  if (cards.length === 0) return null;
  
  return (
    <div className={cn("border-b border-border bg-subtab-shelf min-w-0 overflow-hidden", className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <BarChart3 className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">
              AI-аналіз ({cards.length})
            </span>
          </div>
          
          {/* Filter chips */}
          {isExpanded && (
            <div className="flex items-center gap-1.5">
              <FilterChip
                label="Всі"
                count={cards.length}
                isActive={filterType === "all"}
                onClick={() => setFilterType("all")}
              />
              <FilterChip
                label="Поля"
                count={stats.autoFilled}
                isActive={filterType === "auto-filled"}
                onClick={() => setFilterType("auto-filled")}
              />
              <FilterChip
                label="Перевірка"
                count={stats.verified}
                isActive={filterType === "ai-verified"}
                onClick={() => setFilterType("ai-verified")}
              />
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {/* Summary badges */}
          <div className="flex items-center gap-1.5">
            {stats.approved > 0 && (
              <Badge 
                variant="secondary" 
                className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300 text-xs px-1.5"
              >
                {stats.approved}✓
              </Badge>
            )}
            {stats.needsReview > 0 && (
              <Badge 
                variant="secondary" 
                className="bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300 text-xs px-1.5"
              >
                {stats.needsReview}⚠️
              </Badge>
            )}
            {stats.dismissed > 0 && (
              <Badge 
                variant="secondary" 
                className="text-xs px-1.5"
              >
                {stats.dismissed}✗
              </Badge>
            )}
          </div>
          
          {/* Collapse toggle - 44px touch target */}
          {onToggleExpand && (
            <Button
              variant="ghost"
              size="icon"
              className="min-h-[44px] min-w-[44px] h-auto w-auto rounded-lg"
              onClick={onToggleExpand}
              aria-label={isExpanded ? "Згорнути AI-аналіз" : "Розгорнути AI-аналіз"}
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
      
      {/* Cards scroll container - SubtabShelf pattern with native overflow */}
      {isExpanded && (
        <div className="relative">
          {/* Left fade mask */}
          <div 
            className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-subtab-shelf to-transparent z-10 pointer-events-none"
            aria-hidden="true"
          />
          {/* Right fade mask */}
          <div 
            className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-subtab-shelf to-transparent z-10 pointer-events-none"
            aria-hidden="true"
          />
          
          {/* Frame container for cards - constrained width to force overflow */}
          <div className="mx-2 mb-3 rounded-xl border border-border/60 bg-background/80 shadow-[0_2px_8px_rgba(0,0,0,0.04)] min-w-0 max-w-full">
            {/* Native horizontal scroll viewport with drag-to-scroll */}
            <div
              ref={viewportRef}
              data-ai-card-strip-viewport
              className={cn(
                // CRITICAL: w-full max-w-full min-w-0 prevents container expansion
                "w-full max-w-full min-w-0",
                "overflow-x-auto overflow-y-hidden overscroll-x-contain touch-pan-x",
                "scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent",
                // Drag states
                isDragging ? "cursor-grabbing select-none" : "cursor-grab",
                // Snap scrolling for better UX - disabled during programmatic scroll
                !isProgrammaticScrolling && "snap-x snap-mandatory"
              )}
              style={{ 
                WebkitOverflowScrolling: 'touch',
                scrollbarWidth: 'thin',
              }}
              onMouseDown={handlers.onMouseDown}
              onMouseMove={handlers.onMouseMove}
              onMouseUp={handlers.onMouseUp}
              onMouseLeave={handlers.onMouseLeave}
            >
              {/* Cards container - w-max creates the overflow, but cards are fixed width */}
              <div
                className="inline-flex items-start gap-3 py-3"
                style={{ width: 'max-content' }}
              >
                {/* Left spacer for symmetric padding */}
                <span aria-hidden="true" className="w-3 shrink-0" />
                
                {filteredCards.map((card, index) => (
                  <div 
                    key={card.id} 
                    data-card-strip-id={card.id}
                    className="snap-start flex-shrink-0"
                  >
                    <UnifiedAICard
                      card={card}
                      index={index}
                      isExpanded={expandedCardId === card.id}
                      isHighlighted={highlightedId === card.id}
                      onToggleExpand={() => {
                        setExpandedCardId(prev => prev === card.id ? null : card.id);
                      }}
                      onHover={onCardHover ?? (() => {})}
                      onClick={() => onCardClick?.(card.id)}
                      onAccept={onAccept}
                      onDismiss={onDismiss}
                    />
                  </div>
                ))}
                
                {/* Right spacer for symmetric padding */}
                <span aria-hidden="true" className="w-3 shrink-0" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
