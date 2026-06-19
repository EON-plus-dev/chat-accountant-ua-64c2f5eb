import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Check } from "lucide-react";
import type { DiscrepancyCard } from "@/types/discrepancy";

interface DiscrepancyCardEditDialogProps {
  card: DiscrepancyCard | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (card: DiscrepancyCard) => void;
}

export const DiscrepancyCardEditDialog = ({
  card,
  open,
  onOpenChange,
  onSave,
}: DiscrepancyCardEditDialogProps) => {
  const [proposedText, setProposedText] = useState("");
  const [userComment, setUserComment] = useState("");

  // Reset on card change
  useEffect(() => {
    if (card) {
      setProposedText(card.proposedText || "");
      setUserComment(card.userComment || "");
    }
  }, [card]);

  const handleSave = () => {
    if (!card) return;
    onSave({
      ...card,
      proposedText: proposedText || undefined,
      userComment: userComment || undefined,
      status: "reviewed",
    });
    onOpenChange(false);
  };

  if (!card) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Редагування розбіжності
            {card.clauseReference && (
              <Badge variant="outline">{card.clauseReference}</Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Original text (read-only) */}
          <div>
            <Label className="text-xs text-muted-foreground">Оригінальний текст:</Label>
            <p className="text-sm italic bg-muted/30 p-3 rounded mt-1 max-h-[120px] overflow-y-auto">
              "{card.originalText}"
            </p>
          </div>

          {/* AI comment if exists */}
          {card.aiComment && (
            <div className="flex items-start gap-2 p-3 rounded bg-violet-50 dark:bg-violet-950/30">
              <Sparkles className="w-4 h-4 text-violet-500 mt-0.5 shrink-0" />
              <p className="text-sm text-violet-700 dark:text-violet-300">{card.aiComment}</p>
            </div>
          )}

          {/* Proposed text */}
          <div>
            <Label htmlFor="proposedText">Пропозиція редакції:</Label>
            <Textarea
              id="proposedText"
              value={proposedText}
              onChange={(e) => setProposedText(e.target.value)}
              placeholder="Введіть пропоновану редакцію тексту..."
              className="mt-1 min-h-[100px]"
            />
          </div>

          {/* User comment */}
          <div>
            <Label htmlFor="userComment">Ваш коментар:</Label>
            <Textarea
              id="userComment"
              value={userComment}
              onChange={(e) => setUserComment(e.target.value)}
              placeholder="Додати коментар або обґрунтування..."
              className="mt-1 min-h-[80px]"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Скасувати
          </Button>
          <Button onClick={handleSave}>
            <Check className="w-4 h-4 mr-2" />
            Зберегти
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
