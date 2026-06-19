import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  ArrowLeft, 
  FileX, 
  Send, 
  Save,
  AlertTriangle,
  FileText,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import DOMPurify from "dompurify";
import type { Document } from "@/config/documentFlowConfig";
import type { Cabinet } from "@/types/cabinet";
import type { DiscrepancyCard, DiscrepancyAct } from "@/types/discrepancy";
import { demoDiscrepancyCards } from "@/types/discrepancy";
import { DiscrepancyCardList } from "./cards/DiscrepancyCardList";
import { TextSelectionPopover } from "./TextSelectionPopover";
import { DiscrepancyCardEditDialog } from "./cards/DiscrepancyCardEditDialog";

interface DiscrepancyEditorSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  document: Document;
  cabinet: Cabinet;
  bodyText?: string;
  onCreateDiscrepancyAct: (act: DiscrepancyAct) => void;
}

export const DiscrepancyEditorSheet = ({
  open,
  onOpenChange,
  document,
  cabinet,
  bodyText,
  onCreateDiscrepancyAct,
}: DiscrepancyEditorSheetProps) => {
  // Initialize with demo cards if available for this document
  const [cards, setCards] = useState<DiscrepancyCard[]>(() => {
    return demoDiscrepancyCards[document.id] || [];
  });
  const [selectedText, setSelectedText] = useState<string | null>(null);
  const [highlightedCardId, setHighlightedCardId] = useState<string | null>(null);
  const [popoverPosition, setPopoverPosition] = useState<{ x: number; y: number } | null>(null);
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [cardsExpanded, setCardsExpanded] = useState(true);
  
  const documentContentRef = useRef<HTMLDivElement>(null);

  // Get selected card for edit dialog
  const selectedCard = useMemo(() => 
    cards.find(c => c.id === selectedCardId) || null, 
    [cards, selectedCardId]
  );

  // Active card for highlighting (selected takes priority over hovered)
  const activeCardId = selectedCardId || hoveredCardId;

  // Handle text selection in document viewer
  const handleTextSelect = useCallback(() => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim()) {
      const text = selection.toString().trim();
      setSelectedText(text);
      
      // Get position for popover
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      setPopoverPosition({
        x: rect.left + rect.width / 2,
        y: rect.top - 10,
      });
    } else {
      setSelectedText(null);
      setPopoverPosition(null);
    }
  }, []);

  // Add card from selected text
  const handleAddFromSelection = useCallback(() => {
    if (import.meta.env.DEV) console.log('[Discrepancy] handleAddFromSelection called, selectedText:', selectedText?.substring(0, 50));
    if (!selectedText) {
      console.warn('[Discrepancy] No selectedText, aborting');
      return;
    }
    
    const newCard: DiscrepancyCard = {
      id: `card-${Date.now()}`,
      originalText: selectedText,
      status: "draft",
      createdAt: new Date().toISOString(),
    };
    
    if (import.meta.env.DEV) console.log('[Discrepancy] Adding new card:', newCard.id);
    setCards(prev => {
      if (import.meta.env.DEV) console.log('[Discrepancy] Previous cards:', prev.length, '→ New total:', prev.length + 1);
      return [...prev, newCard];
    });
    setSelectedText(null);
    setPopoverPosition(null);
    setHighlightedCardId(newCard.id);
    
    // Clear highlight after a moment
    setTimeout(() => setHighlightedCardId(null), 2000);
    
    toast.success("Картку додано", { 
      description: "Відредагуйте пропозицію або запитайте AI" 
    });
  }, [selectedText]);

  // Edit card
  const handleEditCard = useCallback((updatedCard: DiscrepancyCard) => {
    setCards(prev => prev.map(c => c.id === updatedCard.id ? updatedCard : c));
  }, []);

  // Delete card
  const handleDeleteCard = useCallback((id: string) => {
    setCards(prev => prev.filter(c => c.id !== id));
    toast.info("Картку видалено");
  }, []);

  // Ask AI about specific card
  const handleAskAIAboutCard = useCallback((card: DiscrepancyCard) => {
    toast.info("Використовуйте головний чат системи", { description: "AI допоможе з аналізом розбіжностей" });
  }, []);

  // Create discrepancy act
  const handleCreateAct = useCallback(() => {
    if (cards.length === 0) {
      toast.error("Немає карток", { description: "Додайте хоча б одну картку розбіжності" });
      return;
    }

    const reviewedCards = cards.filter(c => c.status === "reviewed" || c.status === "accepted");
    if (reviewedCards.length < cards.length) {
      toast.warning("Не всі картки готові", { 
        description: `${cards.length - reviewedCards.length} картка(ок) у чернетці` 
      });
    }

    const act: DiscrepancyAct = {
      id: `discrepancy-${Date.now()}`,
      originalDocumentId: document.id,
      originalDocumentNumber: document.number,
      originalDocumentType: document.type,
      cards: cards,
      summary: `Акт розбіжностей містить ${cards.length} пункт(ів) до узгодження`,
      status: "draft",
      createdAt: new Date().toISOString(),
      createdBy: cabinet.name,
    };

    onCreateDiscrepancyAct(act);
  }, [cards, document, cabinet.name, onCreateDiscrepancyAct]);

  // Save as draft
  const handleSaveDraft = useCallback(() => {
    toast.success("Чернетку збережено", { 
      description: `${cards.length} картка(ок) розбіжностей` 
    });
  }, [cards.length]);

  // Handle hover on card - set hoveredCardId
  const handleHoverCard = useCallback((cardId: string) => {
    setHoveredCardId(cardId);
  }, []);

  // Handle leave hover
  const handleLeaveHover = useCallback(() => {
    setHoveredCardId(null);
  }, []);

  // Handle click on card - ONLY highlight and scroll (no dialog)
  const handleCardClick = useCallback((cardId: string) => {
    setSelectedCardId(cardId);
  }, []);

  // Handle click on edit button - highlight + open dialog
  const handleOpenEditDialog = useCallback((card: DiscrepancyCard) => {
    setSelectedCardId(card.id);
    setEditDialogOpen(true);
  }, []);

  // Handle edit dialog close
  const handleEditDialogClose = useCallback((open: boolean) => {
    setEditDialogOpen(open);
    if (!open) {
      setSelectedCardId(null);
    }
  }, []);

  // Prioritize bodyText prop over generated demo text
  const displayText = useMemo(() => {
    if (bodyText) {
      return bodyText;
    }
    
    // Fallback demo text only if no bodyText provided
    return `
ДОГОВІР ПОСТАВКИ № ${document.number}

м. Київ                                                    ${document.date}

${cabinet.name} (надалі – "Покупець"), з однієї сторони, та ${document.contractor?.name || "Контрагент"} (надалі – "Постачальник"), з іншої сторони, уклали цей Договір про наступне:

1. ПРЕДМЕТ ДОГОВОРУ
1.1. Постачальник зобов'язується поставити, а Покупець прийняти та оплатити товар згідно з Специфікацією.
1.2. Асортимент, кількість, ціна товару визначаються у Специфікаціях до даного Договору.

2. ЦІНА ТА УМОВИ ОПЛАТИ
2.1. Ціни на товар вказуються у Специфікаціях.
2.2. Оплата здійснюється протягом 5 (п'яти) банківських днів з моменту поставки.
2.3. Затримка оплати понад 10 днів тягне за собою штраф у розмірі 0.5% від суми заборгованості за кожен день прострочення.

3. ПОСТАВКА ТОВАРУ
3.1. Термін поставки – 10 робочих днів з моменту підписання Специфікації.
3.2. Поставка здійснюється на умовах DDP (склад Покупця).

4. ВІДПОВІДАЛЬНІСТЬ СТОРІН
4.1. За порушення умов договору сторони несуть відповідальність згідно з чинним законодавством України.
4.2. Сторона, яка порушила договір, відшкодовує іншій стороні всі прямі та непрямі збитки.
4.3. Форс-мажорні обставини звільняють сторони від відповідальності. Форс-мажором вважаються будь-які надзвичайні обставини.

5. ГАРАНТІЇ
5.1. Постачальник надає гарантію на товар строком 12 місяців.

6. СТРОК ДІЇ ДОГОВОРУ
6.1. Договір набуває чинності з моменту підписання і діє до 31.12.2025.

РЕКВІЗИТИ СТОРІН

Покупець:                              Постачальник:
${cabinet.name}                        ${document.contractor?.name || "ТОВ \"Постачальник\""}
ЄДРПОУ: ${cabinet.taxId || "12345678"}              ЄДРПОУ: ${document.contractor?.code || "87654321"}
    `.trim();
  }, [bodyText, document, cabinet]);

  // Highlight ALL cards with numbers in document, active one brighter
  // Use word-based matching to handle HTML tags in bodyHtml
  const highlightedHtml = useMemo(() => {
    let html = DOMPurify.sanitize(displayText);
    
    // Process each card to add numbered highlights
    cards.forEach((card, index) => {
      if (!card.originalText) return;
      
      // Take first 60 chars and extract key words (skip short ones)
      const textToMatch = card.originalText.slice(0, 60);
      const words = textToMatch.split(/\s+/).filter(w => w.length > 3);
      
      if (words.length < 2) return;
      
      // Create a flexible regex that allows HTML tags between words
      const firstWords = words.slice(0, 5).map(w => 
        w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      ).join('[^<]*?');
      
      const regex = new RegExp(`(${firstWords}[^<]*)`, 'gi');
      
      const isActive = card.id === activeCardId;
      const cardNumber = index + 1;
      
      html = html.replace(regex, (match) => 
        `<span class="inline-flex items-start gap-1 ${isActive ? 'bg-orange-200 dark:bg-orange-800/50 ring-2 ring-orange-400' : 'bg-orange-100/60 dark:bg-orange-900/40'} rounded px-1 scroll-mt-20" data-highlight="true" data-card-id="${card.id}"><span class="shrink-0 w-4 h-4 rounded-full ${isActive ? 'bg-orange-500 text-white' : 'bg-orange-200 dark:bg-orange-700 text-orange-700 dark:text-orange-200'} flex items-center justify-center text-[10px] font-bold mt-0.5">${cardNumber}</span><span>${match}</span></span>`
      );
    });
    
    return html;
  }, [displayText, activeCardId, cards]);

  // Auto-scroll to highlighted text by card id
  useEffect(() => {
    if (activeCardId && documentContentRef.current) {
      const mark = documentContentRef.current.querySelector(`[data-card-id="${activeCardId}"]`);
      if (mark) {
        mark.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [activeCardId]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        side="right" 
        className="w-full sm:max-w-[95vw] p-0 flex flex-col [&>button.absolute]:hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b bg-background shrink-0">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => onOpenChange(false)}
              className="h-8 w-8"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-2">
              <FileX className="w-5 h-5 text-orange-500" />
              <div>
                <h2 className="font-semibold text-sm">Акт розбіжностей</h2>
                <p className="text-xs text-muted-foreground">
                  до {document.number}
                </p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setCardsExpanded(!cardsExpanded)}
              className="gap-1.5 h-7 px-2 ml-2"
            >
              <Badge variant="secondary" className="pointer-events-none">
                {cards.length} пунктів
              </Badge>
              <ChevronDown className={cn(
                "w-3 h-3 transition-transform", 
                cardsExpanded && "rotate-180"
              )} />
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleSaveDraft}
              className="gap-1"
            >
              <Save className="w-3 h-3" />
              Зберегти чернетку
            </Button>
            <Button 
              size="sm" 
              onClick={handleCreateAct}
              disabled={cards.length === 0}
              className="gap-1 bg-orange-500 hover:bg-orange-600"
            >
              <Send className="w-3 h-3" />
              Створити акт
            </Button>
          </div>
        </div>

        {/* Main content - new layout */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* TOP: Horizontal cards strip - collapsible */}
          {cardsExpanded && (
            <div className="shrink-0 border-b bg-muted/30 py-3 px-4">
              <DiscrepancyCardList
                cards={cards}
                onEditCard={handleOpenEditDialog}
                onDeleteCard={handleDeleteCard}
                onAskAI={handleAskAIAboutCard}
                onAddCard={handleAddFromSelection}
                selectedText={selectedText || undefined}
                highlightedCardId={highlightedCardId || undefined}
                onHoverCard={handleHoverCard}
                onLeaveCard={handleLeaveHover}
                onCardClick={handleCardClick}
                layout="horizontal"
              />
            </div>
          )}

          {/* BOTTOM: Document viewer */}
          <div className="flex-1 flex flex-col min-h-0">
            {/* Document header */}
            <div className="px-4 py-2 border-b bg-muted/30 flex items-center gap-2 shrink-0">
              <FileText className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">{document.number}</span>
              <span className="text-xs text-muted-foreground">
                Виділіть текст, щоб додати до розбіжностей
              </span>
            </div>
            
            {/* Document content */}
            <ScrollArea className="flex-1">
              <div 
                ref={documentContentRef}
                className="p-6 text-sm leading-relaxed select-text prose prose-sm max-w-none
                  [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:mt-6 [&_h2]:mb-3
                  [&_h3]:text-base [&_h3]:font-semibold [&_h3]:mt-4 [&_h3]:mb-2
                  [&_p]:my-2 [&_table]:my-4 [&_table]:w-full
                  [&_th]:border [&_th]:px-2 [&_th]:py-1 [&_th]:bg-muted/50
                  [&_td]:border [&_td]:px-2 [&_td]:py-1"
                onMouseUp={handleTextSelect}
                dangerouslySetInnerHTML={{ __html: highlightedHtml }}
              />
            </ScrollArea>

            {/* Selection popover */}
            {popoverPosition && selectedText && (
              <TextSelectionPopover
                selectedText={selectedText}
                position={popoverPosition}
                onClose={() => {
                  setSelectedText(null);
                  setPopoverPosition(null);
                }}
                showDiscrepancyOption
                onAddToDiscrepancy={handleAddFromSelection}
              />
            )}
          </div>
        </div>

        {/* Warning banner if has draft cards */}
        {cards.some(c => c.status === "draft") && (
          <div className="px-4 py-2 bg-amber-50 dark:bg-amber-950/30 border-t flex items-center gap-2 shrink-0">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span className="text-xs text-amber-700 dark:text-amber-300">
              {cards.filter(c => c.status === "draft").length} картка(ок) у чернетці — відредагуйте перед створенням акту
            </span>
          </div>
        )}

        {/* Edit card dialog */}
        <DiscrepancyCardEditDialog
          card={selectedCard}
          open={editDialogOpen}
          onOpenChange={handleEditDialogClose}
          onSave={handleEditCard}
        />
      </SheetContent>
    </Sheet>
  );
};
