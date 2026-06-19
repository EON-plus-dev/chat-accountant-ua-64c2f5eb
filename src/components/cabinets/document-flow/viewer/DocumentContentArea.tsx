/**
 * DocumentContentArea - Основна зона тексту документа
 * Підтримує HTML, plain text та PDF (через зовнішній viewer)
 */

import { useRef, useCallback, useMemo, useEffect } from "react";
import DOMPurify from "dompurify";
import { Pencil } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { TextSelectionPopover } from "../TextSelectionPopover";
import { cn } from "@/lib/utils";

export type ContentType = "html" | "pdf" | "plaintext";

interface TextSelection {
  text: string;
  x: number;
  y: number;
}

interface FragmentHighlight {
  fragmentId: string;
  type: "comment" | "discrepancy" | "risk";
  count?: number;
}

// AI Card highlight for View mode integration
interface AICardHighlight {
  id: string;
  textRef: string;
  status: 'approved' | 'needs_review' | 'accepted' | 'dismissed' | 'pending';
}

interface DocumentContentAreaProps {
  contentType: ContentType;
  htmlContent?: string;
  plainText?: string;
  pdfUrl?: string;
  ocrText?: string;
  
  // View settings
  zoom: number;
  viewLayout: "continuous" | "paginated";
  
  // Search
  searchQuery?: string;
  currentMatchIndex?: number;
  
  // Highlighting
  highlightedFragments?: FragmentHighlight[];
  highlightedText?: string;
  highlightKeywords?: boolean;
  highlightedSectionId?: string; // Section highlighted from ContextShelf hover
  
  // AI Card highlighting (View mode demo)
  aiCardHighlights?: AICardHighlight[];
  activeAiCardId?: string | null;
  hoveredAiCardId?: string | null;
  scrollToAiCardTextRef?: string | null;
  onAiHighlightClick?: (cardId: string) => void;
  
  // Selection
  selection: TextSelection | null;
  onSelectionChange: (selection: TextSelection | null) => void;
  
  // Actions
  onExplainSelection?: (text: string) => void;
  onCheckRisk?: (text: string) => void;
  onAddComment?: () => void;
  onAddToDiscrepancy?: () => void;
  showDiscrepancyOption?: boolean;
  showCommentOption?: boolean;
  
  // Scroll control
  scrollToAnchor?: string;
  
  // Edit mode
  canEdit?: boolean;
  onStartEdit?: () => void;
  
  className?: string;
}

// Важливі ключові слова для підсвітки
const importantKeywords = [
  "сума", "оплата", "термін", "штраф", "пеня", "розірвання", 
  "відповідальність", "зобов'язання", "гарантія", "строк", 
  "грн", "₴", "днів", "місяців", "років"
];

export const DocumentContentArea = ({
  contentType,
  htmlContent,
  plainText,
  pdfUrl,
  ocrText,
  zoom = 100,
  viewLayout = "continuous",
  searchQuery,
  currentMatchIndex,
  highlightedFragments = [],
  highlightedText,
  highlightKeywords = false,
  highlightedSectionId,
  aiCardHighlights = [],
  activeAiCardId,
  hoveredAiCardId,
  scrollToAiCardTextRef,
  onAiHighlightClick,
  selection,
  onSelectionChange,
  onExplainSelection,
  onCheckRisk,
  onAddComment,
  onAddToDiscrepancy,
  showDiscrepancyOption = false,
  showCommentOption = true,
  scrollToAnchor,
  canEdit = false,
  onStartEdit,
  className,
}: DocumentContentAreaProps) => {
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Scroll to anchor
  useEffect(() => {
    if (scrollToAnchor && contentRef.current) {
      const element = contentRef.current.querySelector(
        `#${scrollToAnchor}, [data-anchor="${scrollToAnchor}"], [data-section-id="${scrollToAnchor}"]`
      );
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.classList.add('ring-2', 'ring-primary', 'animate-pulse');
        setTimeout(() => element.classList.remove('ring-2', 'ring-primary', 'animate-pulse'), 2000);
      }
    }
  }, [scrollToAnchor]);
  
  // Handle text selection
  const handleMouseUp = useCallback(() => {
    const selectionObj = window.getSelection();
    const selectedText = selectionObj?.toString().trim();
    
    if (selectedText && selectedText.length > 3 && contentRef.current) {
      const range = selectionObj?.getRangeAt(0);
      if (range) {
        const rect = range.getBoundingClientRect();
        const containerRect = contentRef.current.getBoundingClientRect();
        
        onSelectionChange({
          text: selectedText,
          x: rect.left + rect.width / 2 - containerRect.left,
          y: rect.top - containerRect.top - 10,
        });
      }
    } else {
      onSelectionChange(null);
    }
  }, [onSelectionChange]);
  
  // Close selection on click outside
  useEffect(() => {
    const handleClickOutside = () => {
      setTimeout(() => {
        const selectionObj = window.getSelection();
        if (!selectionObj?.toString().trim()) {
          onSelectionChange(null);
        }
      }, 100);
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onSelectionChange]);
  
  // Process HTML with highlights and inject data-section-id attributes
  const processedHtml = useMemo(() => {
    if (!htmlContent) return "";
    
    // Parse HTML and inject data-section-id to headings for navigation
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, "text/html");
    
    // Add section IDs to headings
    doc.querySelectorAll("h1, h2, h3, h4, h5, h6").forEach((heading, index) => {
      const sectionId = `section-${index}`;
      heading.setAttribute("data-section-id", sectionId);
      heading.setAttribute("id", sectionId);
      // Add transition classes for smooth highlighting
      heading.classList.add("transition-all", "duration-300", "scroll-mt-20");
    });
    
    // Also find numbered sections in paragraphs (1. НАЗВА, РОЗДІЛ 1:, etc.)
    let sectionCounter = doc.querySelectorAll("h1, h2, h3, h4, h5, h6").length;
    doc.querySelectorAll("p, div").forEach((el) => {
      const text = el.textContent?.trim() || "";
      // Match: "1. НАЗВА" or "РОЗДІЛ 1:" or "Стаття 1:"
      if (/^(\d+)\.\s+[А-ЯІЇЄҐA-Z]/.test(text) || /^(?:РОЗДІЛ|СТАТТЯ)\s+\d+/i.test(text)) {
        const sectionId = `section-${sectionCounter}`;
        el.setAttribute("data-section-id", sectionId);
        el.setAttribute("id", sectionId);
        el.classList.add("transition-all", "duration-300", "scroll-mt-20");
        sectionCounter++;
      }
    });
    
    let html = doc.body.innerHTML;
    
    // AI Card highlights for View mode demo
    if (aiCardHighlights.length > 0) {
      aiCardHighlights.forEach(card => {
        if (!card.textRef || card.textRef.length < 2) return;
        
        const escapedRef = card.textRef.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const isActive = card.id === activeAiCardId;
        const isHovered = card.id === hoveredAiCardId;
        
        // Determine highlight style based on status
        const baseClass = card.status === 'needs_review'
          ? 'bg-amber-200/50 dark:bg-amber-800/40'
          : 'bg-emerald-200/50 dark:bg-emerald-800/40';
        
        const activeClass = isActive ? 'ring-2 ring-primary ring-offset-1 animate-pulse' : '';
        const hoverClass = isHovered && !isActive ? 'ring-1 ring-primary/50' : '';
        
        html = html.replace(
          new RegExp(`(${escapedRef})`, 'gi'),
          `<mark class="${baseClass} ${activeClass} ${hoverClass} px-0.5 rounded cursor-pointer transition-all" data-ai-card-id="${card.id}">$1</mark>`
        );
      });
    }
    
    // Highlight specific text if provided
    if (highlightedText) {
      const escapedText = highlightedText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const flexiblePattern = escapedText.replace(/\\ /g, '\\s+');
      html = html.replace(
        new RegExp(`(${flexiblePattern})`, 'gi'),
        '<mark class="bg-primary/25 text-foreground px-1 py-0.5 rounded ring-2 ring-primary ring-offset-1" data-field-highlight="true">$1</mark>'
      );
    }
    
    // Highlight search matches
    if (searchQuery && searchQuery.length > 2) {
      const escapedQuery = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      html = html.replace(
        new RegExp(`(${escapedQuery})`, 'gi'),
        '<mark class="bg-yellow-200 dark:bg-yellow-800" data-search-match="true">$1</mark>'
      );
    }
    
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: [
        'div', 'p', 'span', 'table', 'tr', 'td', 'th', 'thead', 'tbody', 'tfoot',
        'strong', 'em', 'b', 'i', 'br', 'hr', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'ul', 'ol', 'li', 'style', 'header', 'footer', 'section', 'article', 'mark'
      ],
      ALLOWED_ATTR: [
        'class', 'style', 'colspan', 'rowspan', 'id', 
        'data-field-highlight', 'data-anchor', 'data-fragment-id', 'data-section-id',
        'data-search-match', 'data-ai-card-id'
      ],
      ALLOW_DATA_ATTR: true,
    });
  }, [htmlContent, aiCardHighlights, activeAiCardId, hoveredAiCardId, highlightedText, searchQuery]);
  
  // Highlight section when hovering card in ContextShelf
  useEffect(() => {
    if (!highlightedSectionId || !contentRef.current) return;
    
    const element = contentRef.current.querySelector(
      `[data-section-id="${highlightedSectionId}"]`
    );
    
    if (element) {
      element.classList.add('bg-primary/10', 'ring-2', 'ring-primary/30', 'rounded-md', 'px-2', '-mx-2');
    }
    
    return () => {
      if (element) {
        element.classList.remove('bg-primary/10', 'ring-2', 'ring-primary/30', 'rounded-md', 'px-2', '-mx-2');
      }
    };
  }, [highlightedSectionId]);
  
  // Scroll to AI card text when clicking on a card
  useEffect(() => {
    if (!scrollToAiCardTextRef || !contentRef.current) return;
    
    // Find mark with matching text
    const marks = contentRef.current.querySelectorAll('[data-ai-card-id]');
    let targetMark: HTMLElement | null = null;
    
    for (const mark of marks) {
      if (mark.textContent?.includes(scrollToAiCardTextRef)) {
        targetMark = mark as HTMLElement;
        break;
      }
    }
    
    if (targetMark) {
      targetMark.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [scrollToAiCardTextRef]);
  
  // Handle click on AI-highlighted text
  const handleContentClick = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const cardId = target.closest('[data-ai-card-id]')?.getAttribute('data-ai-card-id');
    
    if (cardId && onAiHighlightClick) {
      onAiHighlightClick(cardId);
    }
  }, [onAiHighlightClick]);
  // Render plain text with highlights
  const renderPlainText = () => {
    const text = plainText || "";
    
    if (!highlightKeywords && !highlightedText && !searchQuery) {
      return <span>{text}</span>;
    }
    
    const lines = text.split("\n");
    
    return lines.map((line, lineIndex) => {
      // Highlight important keywords
      if (highlightKeywords) {
        const hasImportantKeyword = importantKeywords.some(keyword => 
          line.toLowerCase().includes(keyword.toLowerCase())
        );

        if (hasImportantKeyword) {
          return (
            <span 
              key={lineIndex} 
              className="bg-amber-100/60 dark:bg-amber-900/30 px-1 -mx-1 rounded"
            >
              {line}
              {lineIndex < lines.length - 1 && "\n"}
            </span>
          );
        }
      }

      return (
        <span key={lineIndex}>
          {line}
          {lineIndex < lines.length - 1 && "\n"}
        </span>
      );
    });
  };
  
  // Determine content to render
  const isHtml = contentType === "html" || (plainText?.trim().startsWith('<'));
  const isPdf = contentType === "pdf" && pdfUrl;
  
  // Use CSS zoom for better layout preservation
  const zoomStyle: React.CSSProperties = zoom !== 100 ? { 
    transform: `scale(${zoom / 100})`,
    transformOrigin: 'top left',
    width: `${10000 / zoom}%`,
  } : {};
  
  // PDF Viewer
  if (isPdf) {
    return (
      <div className={cn("flex-1 flex flex-col", className)}>
        <div 
          className="flex-1 relative"
          style={zoomStyle}
        >
          <iframe
            src={`${pdfUrl}#view=FitH&scrollbar=1&toolbar=0&navpanes=0`}
            className="w-full h-full border-0 bg-muted"
            title="PDF Document"
            loading="lazy"
          />
        </div>
        
        {/* OCR text for search (hidden) */}
        {ocrText && (
          <div className="sr-only" aria-hidden="true">
            {ocrText}
          </div>
        )}
      </div>
    );
  }
  
  return (
    <ScrollArea className={cn("flex-1", className)}>
      <div 
        ref={contentRef}
        className="relative p-6"
        onMouseUp={handleMouseUp}
        onClick={handleContentClick}
        data-section="document-content"
        style={zoomStyle}
      >
        {isHtml ? (
          <div 
            className="document-html-preview select-text prose prose-sm dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: processedHtml }}
          />
        ) : (
          <pre className="whitespace-pre-wrap text-sm font-sans text-foreground/90 leading-relaxed select-text">
            {renderPlainText()}
          </pre>
        )}
        
        {/* Selection Popover */}
        {selection && (
          <TextSelectionPopover
            selectedText={selection.text}
            position={{ x: selection.x, y: selection.y }}
            onExplain={() => {
              onExplainSelection?.(selection.text);
              onSelectionChange(null);
              window.getSelection()?.removeAllRanges();
            }}
            onCheckRisk={() => {
              onCheckRisk?.(selection.text);
              onSelectionChange(null);
              window.getSelection()?.removeAllRanges();
            }}
            showDiscrepancyOption={showDiscrepancyOption}
            onAddToDiscrepancy={() => {
              onAddToDiscrepancy?.();
              onSelectionChange(null);
              window.getSelection()?.removeAllRanges();
            }}
            showCommentOption={showCommentOption}
            onAddComment={() => {
              onAddComment?.();
              onSelectionChange(null);
              window.getSelection()?.removeAllRanges();
            }}
            onClose={() => {
              onSelectionChange(null);
              window.getSelection()?.removeAllRanges();
            }}
          />
        )}
      </div>
      
      {/* Footer with hint */}
      <div className="px-4 py-2.5 border-t bg-muted/30 sticky bottom-0" role="status">
        <p className="text-xs text-muted-foreground">
          💡 Виділіть текст мишею для AI-пояснення або коментаря
        </p>
      </div>
    </ScrollArea>
  );
};
