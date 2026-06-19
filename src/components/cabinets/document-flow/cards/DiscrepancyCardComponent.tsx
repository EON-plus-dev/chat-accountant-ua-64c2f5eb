import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  Sparkles, 
  Pencil, 
  Trash2, 
  Check, 
  X,
  MessageSquare,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { DiscrepancyCard, DiscrepancyStatus } from "@/types/discrepancy";

interface DiscrepancyCardComponentProps {
  card: DiscrepancyCard;
  onEdit: (card: DiscrepancyCard) => void;
  onDelete: (id: string) => void;
  onAskAI: (card: DiscrepancyCard) => void;
  isHighlighted?: boolean;
  index: number;
}

const statusLabels: Record<DiscrepancyStatus, string> = {
  draft: "Чернетка",
  reviewed: "Переглянуто",
  accepted: "Прийнято",
  rejected: "Відхилено",
};

const statusColors: Record<DiscrepancyStatus, string> = {
  draft: "bg-muted text-muted-foreground",
  reviewed: "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300",
  accepted: "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300",
  rejected: "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300",
};

export const DiscrepancyCardComponent = ({ 
  card, 
  onEdit, 
  onDelete, 
  onAskAI,
  isHighlighted,
  index,
}: DiscrepancyCardComponentProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedProposedText, setEditedProposedText] = useState(card.proposedText || "");
  const [editedUserComment, setEditedUserComment] = useState(card.userComment || "");
  const [isExpanded, setIsExpanded] = useState(true);

  const handleSave = () => {
    onEdit({
      ...card,
      proposedText: editedProposedText || undefined,
      userComment: editedUserComment || undefined,
      status: "reviewed",
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedProposedText(card.proposedText || "");
    setEditedUserComment(card.userComment || "");
    setIsEditing(false);
  };

  return (
    <Card 
      className={cn(
        "transition-all duration-200",
        isHighlighted && "ring-2 ring-primary shadow-lg",
        card.status === "accepted" && "border-green-200 bg-green-50/30 dark:bg-green-950/10",
        card.status === "rejected" && "opacity-60"
      )}
    >
      {/* Header */}
      <div 
        className="flex items-center justify-between p-3 cursor-pointer hover:bg-muted/30"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-xs font-medium text-orange-700 dark:text-orange-300">
            {index + 1}
          </span>
          {card.clauseReference && (
            <Badge variant="outline" className="text-xs">
              {card.clauseReference}
            </Badge>
          )}
          <Badge className={cn("text-[10px]", statusColors[card.status])}>
            {statusLabels[card.status]}
          </Badge>
        </div>
        <Button variant="ghost" size="icon" className="h-6 w-6">
          {isExpanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </Button>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="px-3 pb-3 space-y-3">
          {/* Original text */}
          <div>
            <p className="text-xs text-muted-foreground mb-1">Оригінальний текст:</p>
            <p className="text-sm italic bg-muted/30 p-2 rounded line-clamp-3">
              &ldquo;{card.originalText}&rdquo;
            </p>
          </div>

          {/* Proposed text */}
          {isEditing ? (
            <div>
              <p className="text-xs text-muted-foreground mb-1">Пропозиція редакції:</p>
              <Textarea
                value={editedProposedText}
                onChange={(e) => setEditedProposedText(e.target.value)}
                placeholder="Введіть пропоновану редакцію..."
                className="text-sm min-h-[80px]"
              />
            </div>
          ) : card.proposedText ? (
            <div>
              <p className="text-xs text-muted-foreground mb-1">Пропозиція редакції:</p>
              <p className="text-sm text-primary bg-primary/5 p-2 rounded">
                {card.proposedText}
              </p>
            </div>
          ) : null}

          {/* AI comment */}
          {card.aiComment && !isEditing && (
            <div className="flex items-start gap-2 p-2 rounded bg-violet-50 dark:bg-violet-950/30 text-xs">
              <Sparkles className="w-3 h-3 text-violet-500 mt-0.5 shrink-0" />
              <p className="text-violet-700 dark:text-violet-300">{card.aiComment}</p>
            </div>
          )}

          {/* User comment */}
          {isEditing ? (
            <div>
              <p className="text-xs text-muted-foreground mb-1">Ваш коментар:</p>
              <Textarea
                value={editedUserComment}
                onChange={(e) => setEditedUserComment(e.target.value)}
                placeholder="Додати коментар..."
                className="text-sm min-h-[60px]"
              />
            </div>
          ) : card.userComment ? (
            <div className="flex items-start gap-2 p-2 rounded bg-muted/50 text-xs">
              <MessageSquare className="w-3 h-3 text-muted-foreground mt-0.5 shrink-0" />
              <p>{card.userComment}</p>
            </div>
          ) : null}

          {/* Actions */}
          <div className="flex gap-2 pt-1 border-t">
            {isEditing ? (
              <>
                <Button variant="default" size="sm" onClick={handleSave} className="h-7 text-xs">
                  <Check className="w-3 h-3 mr-1" />
                  Зберегти
                </Button>
                <Button variant="ghost" size="sm" onClick={handleCancel} className="h-7 text-xs">
                  <X className="w-3 h-3 mr-1" />
                  Скасувати
                </Button>
              </>
            ) : (
              <>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => onAskAI(card)}
                  className="h-7 text-xs text-violet-600 hover:text-violet-700 hover:bg-violet-50"
                >
                  <Sparkles className="w-3 h-3 mr-1" />
                  AI
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setIsEditing(true)}
                  className="h-7 text-xs"
                >
                  <Pencil className="w-3 h-3 mr-1" />
                  Ред.
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => onDelete(card.id)}
                  className="h-7 text-xs text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </Card>
  );
};
