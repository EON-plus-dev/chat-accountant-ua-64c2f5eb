/**
 * Bulk Mark Payments As Paid Dialog
 * Dedicated bulk variant — shows the full list and a single "paid date" field
 * instead of borrowing the first payment as a misleading template.
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import type { UnifiedPayment } from "@/config/unifiedPaymentsConfig";

interface BulkMarkAsPaidDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payments: UnifiedPayment[];
  onConfirm?: (data: { paidAt: string; note?: string; ids: string[] }) => void;
}

export function BulkMarkAsPaidDialog({ open, onOpenChange, payments, onConfirm }: BulkMarkAsPaidDialogProps) {
  const [paidAt, setPaidAt] = useState(format(new Date(), "yyyy-MM-dd"));
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const total = payments.reduce((s, p) => s + p.amount, 0);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await new Promise((r) => setTimeout(r, 400));
      onConfirm?.({ paidAt, note: note.trim() || undefined, ids: payments.map((p) => p.id) });
      toast.success(`Позначено оплаченими: ${payments.length}`, {
        description: `Загалом ₴${total.toLocaleString("uk-UA")} · додано в історію аудиту`,
      });
      onOpenChange(false);
      setNote("");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            Позначити оплаченими ({payments.length})
          </DialogTitle>
          <DialogDescription>
            Усі вибрані платежі отримають однакову дату оплати. Загалом{" "}
            <span className="font-medium text-foreground">₴{total.toLocaleString("uk-UA")}</span>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="rounded-lg border bg-muted/30">
            <ScrollArea className="max-h-48">
              <div className="p-2 space-y-1">
                {payments.map((p) => (
                  <div key={p.id} className="flex items-center justify-between gap-2 px-2 py-1.5 text-sm rounded hover:bg-background">
                    <div className="flex items-center gap-2 min-w-0">
                      <Badge variant="outline" className="text-[10px] uppercase shrink-0">
                        {p.paymentType}
                      </Badge>
                      <span className="truncate">{p.entityName}</span>
                    </div>
                    <span className="font-mono text-xs shrink-0">
                      ₴{p.amount.toLocaleString("uk-UA")}
                    </span>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="bulk-paid-at">Дата фактичної оплати (для всіх)</Label>
            <Input
              id="bulk-paid-at"
              type="date"
              value={paidAt}
              onChange={(e) => setPaidAt(e.target.value)}
              max={format(new Date(), "yyyy-MM-dd")}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="bulk-note">
              Примітка <span className="text-muted-foreground text-xs">(необов'язково)</span>
            </Label>
            <Textarea
              id="bulk-note"
              placeholder="Напр. «Оплачено пакетом через клієнт-банк 22.04»"
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
          <Button onClick={handleSubmit} disabled={submitting || !paidAt || payments.length === 0}>
            {submitting && <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />}
            Підтвердити {payments.length}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
