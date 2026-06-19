import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DiscrepancyCard, DiscrepancyStatus } from "@/types/discrepancy";

interface DiscrepancyCardCompactProps {
  card: DiscrepancyCard;
  index: number;
  isHighlighted?: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onCardClick?: () => void;
  onEdit: (card: DiscrepancyCard) => void;
  onDelete: (id: string) => void;
}

const statusLabels: Record<DiscrepancyStatus, string> = {
  draft: "Чернетка",
  reviewed: "Готово",
  accepted: "Прийнято",
  rejected: "Відхилено",
};

const statusColors: Record<DiscrepancyStatus, string> = {
  draft: "bg-muted text-muted-foreground",
  reviewed: "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300",
  accepted: "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300",
  rejected: "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300",
};

export const DiscrepancyCardCompact = ({
  card,
  index,
  isHighlighted,
  onMouseEnter,
  onMouseLeave,
  onCardClick,
  onEdit,
  onDelete,
}: DiscrepancyCardCompactProps) => {
  return (
    <Card
      className={cn(
        "shrink-0 w-[220px] p-3 cursor-pointer transition-all hover:shadow-md",
        isHighlighted && "ring-2 ring-orange-500 shadow-lg bg-orange-50 dark:bg-orange-950/30"
      )}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onCardClick}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <span className="w-5 h-5 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-xs font-medium text-orange-700 dark:text-orange-300">
            {index + 1}
          </span>
          {card.clauseReference && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
              {card.clauseReference}
            </Badge>
          )}
        </div>
        <Badge className={cn(
          "text-[9px] px-1.5 py-0 cursor-default pointer-events-none", 
          statusColors[card.status]
        )}>
          {statusLabels[card.status]}
        </Badge>
      </div>

      {/* Preview text */}
      <p className="text-xs line-clamp-2 text-muted-foreground mb-2">
        {card.originalText.slice(0, 80)}...
      </p>

      {/* Actions */}
      <div className="flex gap-1 justify-end">
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-6 w-6" 
          onClick={(e) => {
            e.stopPropagation();
            onEdit(card);
          }}
        >
          <Pencil className="w-3 h-3" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-6 w-6 text-destructive hover:text-destructive" 
          onClick={(e) => {
            e.stopPropagation();
            onDelete(card.id);
          }}
        >
          <Trash2 className="w-3 h-3" />
        </Button>
      </div>
    </Card>
  );
};
