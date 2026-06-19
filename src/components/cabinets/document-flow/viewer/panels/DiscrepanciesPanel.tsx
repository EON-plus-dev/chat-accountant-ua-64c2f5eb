/**
 * DiscrepanciesPanel - Вкладка "Розбіжності" бокової панелі
 * Показує список розбіжностей для формування акту
 * 
 * Re-exports types from the original discrepancy module for compatibility
 */

import { useState } from "react";
import { 
  FileX, Plus, Edit2, Trash2, Check, X as XIcon,
  AlertTriangle, FileCheck2, Send, Sparkles
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

// Import from original types for compatibility
import type { DiscrepancyCard, DiscrepancyStatus } from "@/types/discrepancy";

// Re-export for consumers
export type { DiscrepancyCard, DiscrepancyStatus };

interface DiscrepanciesPanelProps {
  cards: DiscrepancyCard[];
  canEdit?: boolean;
  onAddCard?: () => void;
  onEditCard?: (card: DiscrepancyCard) => void;
  onDeleteCard?: (id: string) => void;
  onCreateAct?: () => void;
  onAskAI?: (card: DiscrepancyCard) => void;
  onScrollToFragment?: (fragmentId: string) => void;
  className?: string;
}

// Status config mapped to original DiscrepancyStatus values
const statusConfig: Record<DiscrepancyStatus, { label: string; color: string; bg: string }> = {
  draft: { 
    label: "Чернетка", 
    color: "text-muted-foreground",
    bg: "bg-muted" 
  },
  reviewed: { 
    label: "Перевірено", 
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-100 dark:bg-amber-900/30" 
  },
  accepted: { 
    label: "Узгоджено", 
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-100 dark:bg-emerald-900/30" 
  },
  rejected: { 
    label: "Відхилено", 
    color: "text-destructive",
    bg: "bg-destructive/10" 
  },
};

// Демо-дані (використовують оригінальні типи)
const generateDemoCards = (): DiscrepancyCard[] => [
  {
    id: "disc-1",
    clauseReference: "п. 3.5",
    originalText: "Загальний розмір відповідальності обмежується 10% від вартості договору",
    proposedText: "Пропонуємо встановити ліміт відповідальності 50% від вартості договору",
    status: "reviewed",
    createdAt: new Date().toISOString(),
  },
  {
    id: "disc-2",
    clauseReference: "п. 9.4",
    originalText: "Оплата здійснюється протягом 60 банківських днів після підписання акту",
    proposedText: "Пропонуємо скоротити термін оплати до 14 календарних днів",
    userComment: "60 днів - надто довгий термін для нашого бізнесу",
    status: "draft",
    createdAt: new Date().toISOString(),
  },
  {
    id: "disc-3",
    clauseReference: "п. 5.2",
    originalText: "Виконавець несе повну матеріальну відповідальність за всі збитки",
    proposedText: "Обмежити відповідальність прямими збитками",
    status: "accepted",
    createdAt: new Date().toISOString(),
  },
];

export const DiscrepanciesPanel = ({
  cards: propCards,
  canEdit = true,
  onAddCard,
  onEditCard,
  onDeleteCard,
  onCreateAct,
  onAskAI,
  onScrollToFragment,
  className,
}: DiscrepanciesPanelProps) => {
  const [editingCard, setEditingCard] = useState<DiscrepancyCard | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  
  // Використовуємо демо-дані якщо cards пусті
  const cards = propCards.length > 0 ? propCards : generateDemoCards();
  
  const draftCount = cards.filter(c => c.status === "draft").length;
  const reviewedCount = cards.filter(c => c.status === "reviewed").length;
  const acceptedCount = cards.filter(c => c.status === "accepted").length;
  
  const handleSaveEdit = () => {
    if (editingCard && onEditCard) {
      onEditCard(editingCard);
    }
    setEditingCard(null);
  };
  
  const handleDelete = (id: string) => {
    onDeleteCard?.(id);
    setShowDeleteConfirm(null);
  };
  
  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Header */}
      <div className="px-4 py-3 border-b">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-sm flex items-center gap-2">
            <FileX className="w-4 h-4 text-orange-500" />
            Розбіжності
          </h3>
          {canEdit && onAddCard && (
            <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={onAddCard}>
              <Plus className="w-3.5 h-3.5" />
              Додати
            </Button>
          )}
        </div>
        
        <div className="flex items-center gap-2 mt-2">
          <Badge variant="outline" className="text-xs">
            {cards.length} пунктів
          </Badge>
          {acceptedCount > 0 && (
            <Badge variant="secondary" className="text-xs text-emerald-600">
              {acceptedCount} узгоджено
            </Badge>
          )}
          {reviewedCount > 0 && (
            <Badge variant="secondary" className="text-xs text-amber-600">
              {reviewedCount} перевірено
            </Badge>
          )}
        </div>
      </div>
      
      {/* Cards List */}
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-3">
          {cards.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileX className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Розбіжностей немає</p>
              <p className="text-xs mt-1">
                Виділіть текст у документі та оберіть "До розбіжностей"
              </p>
            </div>
          ) : (
            cards.map((card, index) => (
              <DiscrepancyCardItem
                key={card.id}
                card={card}
                index={index + 1}
                canEdit={canEdit}
                onEdit={() => setEditingCard(card)}
                onDelete={() => setShowDeleteConfirm(card.id)}
                onAskAI={() => onAskAI?.(card)}
              />
            ))
          )}
        </div>
      </ScrollArea>
      
      {/* Footer Actions */}
      {cards.length > 0 && (
        <div className="p-3 border-t bg-muted/30">
          <Button 
            className="w-full gap-2 bg-orange-500 hover:bg-orange-600"
            onClick={onCreateAct}
            disabled={cards.length === 0}
          >
            <FileCheck2 className="w-4 h-4" />
            Сформувати акт розбіжностей
          </Button>
        </div>
      )}
      
      {/* Edit Dialog */}
      <Dialog open={!!editingCard} onOpenChange={(open) => !open && setEditingCard(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Редагувати розбіжність</DialogTitle>
            <DialogDescription>
              {editingCard?.clauseReference}
            </DialogDescription>
          </DialogHeader>
          
          {editingCard && (
            <div className="space-y-4 py-2">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Посилання на пункт</label>
                <Input
                  value={editingCard.clauseReference}
                  onChange={(e) => setEditingCard({ ...editingCard, clauseReference: e.target.value })}
                  placeholder="п. 3.5"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1.5 block">Оригінальний текст</label>
                <Textarea
                  value={editingCard.originalText}
                  onChange={(e) => setEditingCard({ ...editingCard, originalText: e.target.value })}
                  className="min-h-[80px]"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1.5 block">Пропонована зміна</label>
                <Textarea
                  value={editingCard.proposedText || ""}
                  onChange={(e) => setEditingCard({ ...editingCard, proposedText: e.target.value })}
                  placeholder="Опишіть бажані зміни..."
                  className="min-h-[80px]"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1.5 block">Статус</label>
                <Select
                  value={editingCard.status}
                  onValueChange={(v) => setEditingCard({ ...editingCard, status: v as DiscrepancyStatus })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(statusConfig).map(([key, config]) => (
                      <SelectItem key={key} value={key}>
                        {config.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingCard(null)}>
              Скасувати
            </Button>
            <Button onClick={handleSaveEdit}>
              Зберегти
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirm Dialog */}
      <Dialog open={!!showDeleteConfirm} onOpenChange={(open) => !open && setShowDeleteConfirm(null)}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Видалити розбіжність?
            </DialogTitle>
            <DialogDescription>
              Ця дія не може бути скасована.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteConfirm(null)}>
              Скасувати
            </Button>
            <Button variant="destructive" onClick={() => showDeleteConfirm && handleDelete(showDeleteConfirm)}>
              Видалити
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

interface DiscrepancyCardItemProps {
  card: DiscrepancyCard;
  index: number;
  canEdit: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onAskAI?: () => void;
}

const DiscrepancyCardItem = ({ 
  card, 
  index, 
  canEdit, 
  onEdit, 
  onDelete,
  onAskAI 
}: DiscrepancyCardItemProps) => {
  const status = statusConfig[card.status];
  
  return (
    <div className={cn(
      "rounded-lg border p-3 space-y-2",
      card.status === "accepted" && "border-emerald-200 dark:border-emerald-800",
      card.status === "rejected" && "border-destructive/50",
    )}>
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">
            #{index}
          </span>
          <Badge variant="outline" className="text-xs font-mono">
            {card.clauseReference}
          </Badge>
          <Badge className={cn("text-[10px]", status.bg, status.color)}>
            {status.label}
          </Badge>
        </div>
        
        {canEdit && (
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onEdit}>
              <Edit2 className="w-3.5 h-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={onDelete}>
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        )}
      </div>
      
      {/* Original Text */}
      <div className="text-sm">
        <p className="text-xs text-muted-foreground mb-0.5">Оригінальний текст:</p>
        <p className="line-clamp-2 italic bg-muted/50 p-2 rounded text-muted-foreground">
          "{card.originalText}"
        </p>
      </div>
      
      {/* Proposed Change */}
      {card.proposedText && (
        <div className="text-sm">
          <p className="text-xs text-muted-foreground mb-0.5">Пропонуємо:</p>
          <p className="line-clamp-2 bg-primary/5 p-2 rounded border-l-2 border-primary">
            {card.proposedText}
          </p>
        </div>
      )}
      
      {/* AI Button */}
      {onAskAI && (
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full h-7 text-xs gap-1.5 mt-1"
          onClick={onAskAI}
        >
          <Sparkles className="w-3.5 h-3.5" />
          Запитати AI про цей пункт
        </Button>
      )}
    </div>
  );
};
