/**
 * Mark Payment As Paid Dialog
 * Real confirmation dialog for outbound payments — replaces stub button.
 */

import { useState } from "react";
import { format } from "date-fns";
import { CheckCircle2, Loader2 } from "lucide-react";
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
import type { UnifiedPayment } from "@/config/unifiedPaymentsConfig";

interface MarkAsPaidDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payment: UnifiedPayment | null;
  onConfirm?: (data: { paidAt: string; statementRef?: string; note?: string }) => void;
}

export function MarkAsPaidDialog({ open, onOpenChange, payment, onConfirm }: MarkAsPaidDialogProps) {
  const [paidAt, setPaidAt] = useState(format(new Date(), "yyyy-MM-dd"));
  const [statementRef, setStatementRef] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!payment) return null;

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await new Promise((r) => setTimeout(r, 400));
      onConfirm?.({ paidAt, statementRef: statementRef.trim() || undefined, note: note.trim() || undefined });
      toast.success("Платіж позначено як сплачений", {
        description: `${payment.entityName} — ₴${payment.amount.toLocaleString("uk-UA")}`,
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
            Підтвердити оплату
          </DialogTitle>
          <DialogDescription>
            {payment.entityName} · ₴{payment.amount.toLocaleString("uk-UA")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="paid-at">Дата фактичної оплати</Label>
            <Input
              id="paid-at"
              type="date"
              value={paidAt}
              onChange={(e) => setPaidAt(e.target.value)}
              max={format(new Date(), "yyyy-MM-dd")}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="statement-ref">Виписка / посилання на банк <span className="text-muted-foreground text-xs">(необов'язково)</span></Label>
            <Input
              id="statement-ref"
              placeholder="Напр. Виписка №125 від 22.04.2026"
              value={statementRef}
              onChange={(e) => setStatementRef(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="note">Примітка <span className="text-muted-foreground text-xs">(необов'язково)</span></Label>
            <Textarea
              id="note"
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
          <Button onClick={handleSubmit} disabled={submitting || !paidAt}>
            {submitting && <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />}
            Підтвердити оплату
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
