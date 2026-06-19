import { 
  FileSignature, Send, Download, Archive, 
  XCircle, CreditCard, Bot, Sparkles, AlertCircle, Building2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { type Document, type DocumentFlowStatus } from "@/config/documentFlowConfig";

interface AIChip {
  label: string;
  prompt: string;
  icon: typeof Sparkles;
}

interface DocumentActionsBlockProps {
  document: Document;
  onSign?: () => void;
  onSend?: () => void;
  onDownload?: () => void;
  onArchive?: () => void;
  onCancel?: () => void;
  onPayment?: () => void;
  onAIChipClick?: (prompt: string) => void;
  showAIChips?: boolean;
  variant?: "header" | "footer" | "inline";
  className?: string;
}

// Get contextual AI chips based on document state
const getContextualAIChips = (doc: Document): AIChip[] => {
  const chips: AIChip[] = [
    { label: "Поясни документ", prompt: `Поясни простими словами документ ${doc.number}`, icon: Sparkles },
    { label: "Знайди ризики", prompt: `Проаналізуй ризики документа ${doc.number}`, icon: AlertCircle },
  ];

  if (doc.contractor) {
    chips.push({ 
      label: "Історія контрагента", 
      prompt: `Покажи історію документів з ${doc.contractor.name}`,
      icon: Building2 
    });
  }

  if (doc.status === "pending-sign") {
    chips.push({ 
      label: "Хто має підписати?", 
      prompt: `Хто наступний у маршруті погодження для ${doc.number}?`,
      icon: FileSignature 
    });
  }

  return chips;
};

export const DocumentActionsBlock = ({
  document,
  onSign,
  onSend,
  onDownload,
  onArchive,
  onCancel,
  onPayment,
  onAIChipClick,
  showAIChips = true,
  variant = "footer",
  className,
}: DocumentActionsBlockProps) => {
  const aiChips = getContextualAIChips(document);
  
  // Determine which primary actions to show based on status
  const canSign = document.status === "draft" || document.status === "pending-sign";
  const canSend = document.status === "signed" || document.status === "confirmed";
  const canArchive = !["archived", "cancelled"].includes(document.status);
  const canCancel = !["archived", "cancelled", "paid"].includes(document.status);
  const needsPayment = document.amount && (!document.paidAmount || document.paidAmount < document.amount);

  if (variant === "header") {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        {canSign && onSign && (
          <Button onClick={onSign} size="sm" className="gap-1.5">
            <FileSignature className="w-4 h-4" />
            Підписати КЕП
          </Button>
        )}
        {canSend && onSend && (
          <Button variant="outline" onClick={onSend} size="sm" className="gap-1.5">
            <Send className="w-4 h-4" />
            Надіслати
          </Button>
        )}
        {onDownload && (
          <Button variant="outline" size="icon" onClick={onDownload}>
            <Download className="w-4 h-4" />
          </Button>
        )}
      </div>
    );
  }

  if (variant === "inline") {
    return (
      <div className={cn("grid grid-cols-2 gap-2", className)}>
        {canSign && onSign ? (
          <Button onClick={onSign} className="gap-2">
            <FileSignature className="w-4 h-4" />
            Підписати
          </Button>
        ) : canSend && onSend ? (
          <Button variant="outline" onClick={onSend} className="gap-2">
            <Send className="w-4 h-4" />
            Надіслати
          </Button>
        ) : needsPayment && onPayment ? (
          <Button onClick={onPayment} className="gap-2">
            <CreditCard className="w-4 h-4" />
            Оплатити
          </Button>
        ) : (
          <Button variant="outline" onClick={onArchive} className="gap-2" disabled={!canArchive}>
            <Archive className="w-4 h-4" />
            Архівувати
          </Button>
        )}
        <Button variant="outline" onClick={onDownload} className="gap-2">
          <Download className="w-4 h-4" />
          Завантажити
        </Button>
      </div>
    );
  }

  // Footer variant with AI chips
  return (
    <div className={cn("px-6 py-3 border-t bg-background/95 backdrop-blur", className)}>
      <div className="flex items-center gap-2">
        {showAIChips && (
          <>
            <Bot className="w-4 h-4 text-muted-foreground shrink-0" />
            <span className="text-sm text-muted-foreground mr-2 shrink-0">AI-асистент:</span>
            <ScrollArea className="flex-1">
              <div className="flex gap-2 pb-1">
                {aiChips.map((chip, i) => (
                  <Button
                    key={i}
                    variant="outline"
                    size="sm"
                    className="shrink-0 gap-1.5 h-8"
                    onClick={() => onAIChipClick?.(chip.prompt)}
                  >
                    <chip.icon className="w-3.5 h-3.5" />
                    {chip.label}
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </>
        )}
      </div>
    </div>
  );
};
