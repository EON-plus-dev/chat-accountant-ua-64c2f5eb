import { FileX, Edit3, Trash2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { DiscrepancyCard, DiscrepancyStatus } from "@/types/discrepancy";

// Re-export the type for convenience
export type { DiscrepancyCard };

interface DiscrepancyCardListProps {
  cards: DiscrepancyCard[];
  layout?: "horizontal" | "vertical";
  onEditCard?: (card: DiscrepancyCard) => void;
  onDeleteCard?: (id: string) => void;
  className?: string;
}

const statusConfig: Record<DiscrepancyStatus, { label: string; color: string }> = {
  draft: { label: "Чернетка", color: "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400" },
  reviewed: { label: "Перевірено", color: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400" },
  accepted: { label: "Прийнято", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400" },
  rejected: { label: "Відхилено", color: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400" },
};

export const DiscrepancyCardList = ({
  cards,
  layout = "vertical",
  onEditCard,
  onDeleteCard,
  className,
}: DiscrepancyCardListProps) => {
  if (cards.length === 0) {
    return (
      <div className="text-center py-4 text-sm text-muted-foreground">
        Виділіть текст у документі, щоб створити пункт розбіжностей
      </div>
    );
  }

  const CardItem = ({ card, index }: { card: DiscrepancyCard; index: number }) => (
    <div
      className={cn(
        "p-3 rounded-lg border bg-card shrink-0",
        layout === "horizontal" ? "w-64" : "w-full"
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5">
          <Badge variant="outline" className="text-[10px] font-mono">
            {index + 1}
          </Badge>
          <Badge className={cn("text-[10px]", statusConfig[card.status].color)}>
            {statusConfig[card.status].label}
          </Badge>
        </div>
        <div className="flex items-center gap-1">
          {onEditCard && (
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onEditCard(card)}>
              <Edit3 className="w-3 h-3" />
            </Button>
          )}
          {onDeleteCard && (
            <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => onDeleteCard(card.id)}>
              <Trash2 className="w-3 h-3" />
            </Button>
          )}
        </div>
      </div>

      {card.clauseReference && (
        <p className="text-[10px] text-muted-foreground mb-1">📍 {card.clauseReference}</p>
      )}

      <p className="text-xs line-clamp-2 text-foreground/80 italic">
        "{card.originalText}"
      </p>

      {card.proposedText && (
        <p className="text-xs mt-1 text-emerald-600 dark:text-emerald-400 line-clamp-2">
          → {card.proposedText}
        </p>
      )}
    </div>
  );

  if (layout === "horizontal") {
    return (
      <ScrollArea orientation="horizontal" className={cn("w-full", className)}>
        <div className="flex gap-2 pb-2">
          {cards.map((card, index) => (
            <CardItem key={card.id} card={card} index={index} />
          ))}
        </div>
      </ScrollArea>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      {cards.map((card, index) => (
        <CardItem key={card.id} card={card} index={index} />
      ))}
    </div>
  );
};
