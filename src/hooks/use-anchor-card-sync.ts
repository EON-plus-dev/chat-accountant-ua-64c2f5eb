/**
 * useAnchorCardSync Hook
 * Provides bidirectional synchronization between anchor cards and document preview
 */

import { useState, useCallback, useRef } from "react";

export interface UseAnchorCardSyncOptions {
  scrollBehavior?: ScrollBehavior;
  highlightDuration?: number;
}

export interface UseAnchorCardSyncReturn {
  highlightedCardId: string | null;
  highlightedFieldId: string | null;
  setHighlightedCardId: (id: string | null) => void;
  setHighlightedFieldId: (id: string | null) => void;
  onCardClick: (cardId: string) => void;
  onCardHover: (cardId: string | null) => void;
  onFieldClick: (fieldId: string) => void;
  scrollToCard: (cardId: string) => void;
  scrollToField: (fieldId: string) => void;
  clearHighlights: () => void;
}

// Mapping between card IDs and field IDs in the document
const cardToFieldMapping: Record<string, string> = {
  type: "document-type",
  template: "template",
  contractor: "buyerName",
  positions: "positions",
  date: "documentDate",
  dueDate: "dueDate",
  amount: "total",
};

const fieldToCardMapping: Record<string, string> = {
  "document-type": "type",
  "template": "template",
  "buyerName": "contractor",
  "buyerCode": "contractor",
  "customerName": "contractor",
  "customerCode": "contractor",
  "contractorName": "contractor",
  "contractorCode": "contractor",
  "sellerName": "contractor",
  "sellerCode": "contractor",
  "positions-table": "positions",
  "positions": "positions",
  "documentDate": "date",
  "invoiceDate": "date",
  "actDate": "date",
  "contractDate": "date",
  "dueDate": "dueDate",
  "paymentDueDate": "dueDate",
  "total": "amount",
  "totalAmount": "amount",
  "grandTotal": "amount",
  "invoiceNumber": "type",
  "documentNumber": "type",
  "supplierName": "supplier",
  "supplierCode": "supplier",
};

export function useAnchorCardSync(
  options: UseAnchorCardSyncOptions = {}
): UseAnchorCardSyncReturn {
  const { scrollBehavior = "smooth", highlightDuration = 2000 } = options;
  
  const [highlightedCardId, setHighlightedCardId] = useState<string | null>(null);
  const [highlightedFieldId, setHighlightedFieldId] = useState<string | null>(null);
  
  const highlightTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const cardStripRef = useRef<HTMLElement | null>(null);
  const previewRef = useRef<HTMLElement | null>(null);
  
  // Clear highlights after duration
  const scheduleHighlightClear = useCallback(() => {
    if (highlightTimeoutRef.current) {
      clearTimeout(highlightTimeoutRef.current);
    }
    highlightTimeoutRef.current = setTimeout(() => {
      setHighlightedCardId(null);
      setHighlightedFieldId(null);
    }, highlightDuration);
  }, [highlightDuration]);
  
  // Scroll card to center in the strip using direct scrollLeft manipulation
  // Also scrolls vertically to make the strip visible first
  const scrollToCard = useCallback((cardId: string) => {
    // Delay to ensure DOM is ready after any state updates
    requestAnimationFrame(() => {
      const cardStrip = document.querySelector("[data-anchor-card-strip]") as HTMLElement;
      const cardElement = document.querySelector(`[data-anchor-card-id="${cardId}"]`) as HTMLElement;
      
      if (!cardStrip) {
        console.warn(`[scrollToCard] Card strip not found`);
        return;
      }
      
      if (!cardElement) {
        console.warn(`[scrollToCard] Card element not found for id: ${cardId}`);
        // Card might be hidden (lockType/lockTemplate) - this is expected
        return;
      }
      
      // Step 1: Scroll vertically to make the card strip visible
      cardStrip.scrollIntoView({
        behavior: "smooth",
        block: "nearest", // Only scroll if needed
      });
      
      // Step 2: After vertical scroll completes, scroll horizontally to center the card
      setTimeout(() => {
        // Disable snap during programmatic scroll
        cardStrip.style.scrollSnapType = "none";
        
        // Calculate center position using scrollLeft for reliable horizontal scrolling
        const stripRect = cardStrip.getBoundingClientRect();
        const cardRect = cardElement.getBoundingClientRect();
        const targetScrollLeft = cardStrip.scrollLeft + (cardRect.left - stripRect.left) - (stripRect.width / 2) + (cardRect.width / 2);
        
        // Safari workaround: instant scroll first, then smooth for visual feedback
        cardStrip.scrollTo({ left: targetScrollLeft, behavior: "instant" as ScrollBehavior });
        requestAnimationFrame(() => {
          cardStrip.scrollTo({ left: targetScrollLeft, behavior: "smooth" });
        });
        
        // Add highlight animation to card
        cardElement.classList.add("highlight-pulse");
        setTimeout(() => {
          cardElement.classList.remove("highlight-pulse");
        }, 1500);
        
        // Re-enable snap after animation
        setTimeout(() => {
          cardStrip.style.scrollSnapType = "";
        }, 400);
      }, 150);
    });
  }, []);
  
  // Scroll to field in document preview
  const scrollToField = useCallback((fieldId: string) => {
    const previewContainer = document.querySelector('[data-document-preview-scroll]');
    let fieldElement: HTMLElement | null = null;
    
    // Array of selectors from most to least specific
    const selectors = [
      `#field-${fieldId}`,           // e.g., #field-total
      `#${fieldId}`,                 // e.g., #positions-table
      `[data-field-key="${fieldId}"]`, // e.g., data-field-key="positions"
    ];
    
    // First try within document preview container
    if (previewContainer) {
      for (const selector of selectors) {
        fieldElement = previewContainer.querySelector(selector) as HTMLElement;
        if (fieldElement) break;
      }
    }
    
    // Fallback to global search
    if (!fieldElement) {
      for (const selector of selectors) {
        fieldElement = document.querySelector(selector) as HTMLElement;
        if (fieldElement) break;
      }
    }
    
    if (!fieldElement) {
      console.warn(`[scrollToField] Element not found for fieldId: ${fieldId}`);
      return;
    }
    
    fieldElement.scrollIntoView({
      behavior: scrollBehavior,
      block: "center",
    });
    
    // Add highlight animation
    fieldElement.classList.add("highlight-pulse");
    setTimeout(() => {
      fieldElement.classList.remove("highlight-pulse");
    }, 1500);
  }, [scrollBehavior]);
  
  // Card click: highlight field in preview with forced retrigger
  // Reset to null first, then set in next frame to force useEffect even if same value
  // Also directly call scrollToField for deterministic scroll behavior
  const onCardClick = useCallback((cardId: string) => {
    const fieldId = cardToFieldMapping[cardId];
    
    setHighlightedCardId(cardId);
    
    if (fieldId) {
      // Force retrigger useEffect even if same value
      // Reset to null first, then set in next frame
      setHighlightedFieldId(null);
      requestAnimationFrame(() => {
        setHighlightedFieldId(fieldId);
        // Direct scroll call - ensures scroll happens even if useEffect doesn't fire
        scrollToField(fieldId);
      });
    }
    
    scheduleHighlightClear();
  }, [scheduleHighlightClear, scrollToField]);
  
  // Card hover: only highlight the card visually, NOT the field in document
  // Navigation to field is handled exclusively by the 🔗 button click
  const onCardHover = useCallback((cardId: string | null) => {
    // Only set card highlight for visual feedback, don't trigger document scroll
    setHighlightedCardId(cardId);
  }, []);
  
  // Field click: highlight and scroll to card
  const onFieldClick = useCallback((fieldId: string) => {
    const cardId = fieldToCardMapping[fieldId];
    
    setHighlightedFieldId(fieldId);
    
    if (cardId) {
      setHighlightedCardId(cardId);
      scrollToCard(cardId);
    }
    
    scheduleHighlightClear();
  }, [scrollToCard, scheduleHighlightClear]);
  
  // Clear all highlights
  const clearHighlights = useCallback(() => {
    if (highlightTimeoutRef.current) {
      clearTimeout(highlightTimeoutRef.current);
    }
    setHighlightedCardId(null);
    setHighlightedFieldId(null);
  }, []);
  
  return {
    highlightedCardId,
    highlightedFieldId,
    setHighlightedCardId,
    setHighlightedFieldId,
    onCardClick,
    onCardHover,
    onFieldClick,
    scrollToCard,
    scrollToField,
    clearHighlights,
  };
}
