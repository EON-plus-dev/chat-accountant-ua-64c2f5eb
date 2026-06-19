/**
 * Mark Payment As Received Dialog
 * Confirms inbound payment was credited to the account, with bank-statement reconciliation.
 */

import { useState } from "react";
import { format } from "date-fns";
import { CheckCircle2, Loader2, BookOpen } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import type { UnifiedPayment } from "@/config/unifiedPaymentsConfig";

interface MarkAsReceivedDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payment: UnifiedPayment | null;
  onConfirm?: (data: {
    receivedAt: string;
    statementRef?: string;
    addToIncomeBook: boolean;
    note?: string;
  }) => void;
}

export function MarkAsReceivedDialog({
  open,
  onOpenChange,
  payment,
  onConfirm,
}: MarkAsReceivedDialogProps) {
  const [receivedAt, setReceivedAt] = useState(format(new Date(), "yyyy-MM-dd"));
  const [statementRef, setStatementRef] = useState("");
  const [addToIncomeBook, setAddToIncomeBook] = useState(true);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!payment) return null;

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await new Promise((r) => setTimeout(r, 400));
      onConfirm?.({
        receivedAt,
        statementRef: statementRef.trim() || undefined,
        addToIncomeBook,
        note: note.trim() || undefined,
      });
      toast.success("Надходження підтверджено", {
        description: `+₴${payment.amount.toLocaleString("uk-UA")}${addToIncomeBook ? " · додано в Книгу доходів" : ""}`,
      });
      onOpenChange(false);
      setStatementRef("");
      setNote("");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            Підтвердити надходження
          </DialogTitle>
          <DialogDescription>
            {payment.entityName} · +₴{payment.amount.toLocaleString("uk-UA")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="received-at">Дата зарахування на р/р</Label>
            <Input
              id="received-at"
              type="date"
              value={receivedAt}
              onChange={(e) => setReceivedAt(e.target.value)}
              max={format(new Date(), "yyyy-MM-dd")}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="statement-ref-in">
              Банк-виписка <span className="text-muted-foreground text-xs">(для звірки)</span>
            </Label>
            <Input
              id="statement-ref-in"
              placeholder="Напр. Виписка №125 від 22.04.2026"
              value={statementRef}
              onChange={(e) => setStatementRef(e.target.value)}
            />
          </div>

          <div className="flex items-start gap-2 rounded-lg border bg-muted/30 p-3">
            <Checkbox
              id="add-to-book"
              checked={addToIncomeBook}
              onCheckedChange={(v) => setAddToIncomeBook(Boolean(v))}
              className="mt-0.5"
            />
            <div className="flex-1">
              <Label htmlFor="add-to-book" className="flex items-center gap-1.5 cursor-pointer font-medium">
                <BookOpen className="h-3.5 w-3.5 text-primary" />
                Додати в Книгу доходів
              </Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                Запис буде створено автоматично з прив'язкою до цього надходження.
              </p>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="note-in">Примітка <span className="text-muted-foreground text-xs">(необов'язково)</span></Label>
            <Textarea
              id="note-in"
              placeholder="Коментар для аудиту..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            Скасувати
          </Button>
          <Button onClick={handleSubmit} disabled={submitting || !receivedAt}>
            {submitting && <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />}
            Підтвердити надходження
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
