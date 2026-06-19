import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, FileX } from "lucide-react";
import { DiscrepancyCardComponent } from "./DiscrepancyCardComponent";
import { DiscrepancyCardCompact } from "./DiscrepancyCardCompact";
import type { DiscrepancyCard } from "@/types/discrepancy";

interface DiscrepancyCardListProps {
  cards: DiscrepancyCard[];
  onEditCard: (card: DiscrepancyCard) => void;
  onDeleteCard: (id: string) => void;
  onAskAI: (card: DiscrepancyCard) => void;
  onAddCard: () => void;
  selectedText?: string;
  highlightedCardId?: string;
  onHoverCard?: (cardId: string) => void;
  onLeaveCard?: () => void;
  onCardClick?: (cardId: string) => void;
  layout?: "vertical" | "horizontal";
  className?: string;
}

export const DiscrepancyCardList = ({
  cards,
  onEditCard,
  onDeleteCard,
  onAskAI,
  onAddCard,
  selectedText,
  highlightedCardId,
  onHoverCard,
  onLeaveCard,
  onCardClick,
  layout = "vertical",
  className,
}: DiscrepancyCardListProps) => {
  const draftCount = cards.filter(c => c.status === "draft").length;
  const reviewedCount = cards.filter(c => c.status === "reviewed").length;

  // Horizontal layout for top strip
  if (layout === "horizontal") {
    return (
      <div className="flex items-center gap-3">
        {/* Horizontal scroll container - badge is already in sheet header */}
        {cards.length > 0 ? (
          <ScrollArea orientation="horizontal" className="flex-1">
            <div className="flex gap-2 pb-2">
              {cards.map((card, index) => (
                <DiscrepancyCardCompact
                  key={card.id}
                  card={card}
                  index={index}
                  isHighlighted={card.id === highlightedCardId}
                  onMouseEnter={() => onHoverCard?.(card.id)}
                  onMouseLeave={onLeaveCard}
                  onCardClick={() => onCardClick?.(card.id)}
                  onEdit={onEditCard}
                  onDelete={onDeleteCard}
                />
              ))}
            </div>
          </ScrollArea>
        ) : (
          <span className="text-xs text-muted-foreground">
            Виділіть текст у документі для створення картки
          </span>
        )}

        {/* Add button */}
        {selectedText && (
          <Button 
            onClick={onAddCard} 
            size="sm" 
            variant="outline" 
            className="shrink-0 gap-1 text-orange-600 border-orange-200 hover:bg-orange-50"
          >
            <Plus className="w-3 h-3" />
            Додати
          </Button>
        )}
      </div>
    );
  }

  // Vertical layout (original)
  return (
    <div className={className}>
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b">
        <div className="flex items-center gap-2">
          <FileX className="w-4 h-4 text-orange-500" />
          <h3 className="font-medium text-sm">Картки розбіжностей</h3>
          <Badge variant="secondary" className="text-xs">
            {cards.length}
          </Badge>
        </div>
        {cards.length > 0 && (
          <div className="flex gap-1 text-xs text-muted-foreground">
            <span>{draftCount} чернеток</span>
            <span>•</span>
            <span>{reviewedCount} готових</span>
          </div>
        )}
      </div>

      {/* Cards list */}
      <ScrollArea className="flex-1 mt-3 pr-1 min-h-0">
        <div className="pb-4">
          {cards.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileX className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm font-medium mb-1">Немає карток розбіжностей</p>
              <p className="text-xs mb-4">
                Виділіть текст у документі або опишіть проблему в чаті
              </p>
              {selectedText && (
                <Button onClick={onAddCard} size="sm" className="gap-1">
                  <Plus className="w-3 h-3" />
                  Додати виділений текст
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {cards.map((card, index) => (
                <DiscrepancyCardComponent
                  key={card.id}
                  card={card}
                  index={index}
                  onEdit={onEditCard}
                  onDelete={onDeleteCard}
                  onAskAI={onAskAI}
                  isHighlighted={card.id === highlightedCardId}
                />
              ))}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Add button (when cards exist) */}
      {cards.length > 0 && selectedText && (
        <div className="pt-3 border-t mt-3">
          <Button 
            onClick={onAddCard} 
            variant="outline" 
            size="sm" 
            className="w-full gap-1 text-orange-600 border-orange-200 hover:bg-orange-50"
          >
            <Plus className="w-3 h-3" />
            Додати виділений текст
          </Button>
        </div>
      )}
    </div>
  );
};
