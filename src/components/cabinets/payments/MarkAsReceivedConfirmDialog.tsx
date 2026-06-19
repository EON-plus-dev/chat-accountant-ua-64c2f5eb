/**
 * Mark As Received Confirm Dialog
 * Lightweight confirm before booking an inbound payment as FOP income.
 * Asks for income category (services / goods / other) — критично для ФОП 3 групи.
 */

import { useState } from "react";
import { BookOpen, Loader2 } from "lucide-react";
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
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import type { UnifiedPayment } from "@/config/unifiedPaymentsConfig";

export type IncomeCategory = "services" | "goods" | "other";

const categoryOptions: { value: IncomeCategory; label: string; hint: string }[] = [
  { value: "services", label: "Послуги", hint: "Дизайн, консалтинг, IT — найчастіший випадок ФОП" },
  { value: "goods", label: "Товари", hint: "Продаж фізичних або цифрових товарів" },
  { value: "other", label: "Інше", hint: "Роялті, оренда, інші джерела доходу" },
];

interface MarkAsReceivedConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payment: UnifiedPayment | null;
  onConfirm?: (data: { category: IncomeCategory; note?: string }) => void;
}

export function MarkAsReceivedConfirmDialog({
  open,
  onOpenChange,
  payment,
  onConfirm,
}: MarkAsReceivedConfirmDialogProps) {
  const [category, setCategory] = useState<IncomeCategory>("services");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!payment) return null;

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await new Promise((r) => setTimeout(r, 300));
      onConfirm?.({ category, note: note.trim() || undefined });
      toast.success("Зараховано в дохід ФОП", {
        description: `${payment.entityName} · ₴${payment.amount.toLocaleString("uk-UA")} · ${
          categoryOptions.find((o) => o.value === category)?.label
        } · додано в Книгу доходів`,
      });
      onOpenChange(false);
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
            <BookOpen className="h-5 w-5 text-primary" />
            Зарахувати ₴{payment.amount.toLocaleString("uk-UA")} в дохід?
          </DialogTitle>
          <DialogDescription>
            {payment.entityName} — оберіть категорію доходу для Книги обліку ФОП.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Категорія доходу</Label>
            <RadioGroup value={category} onValueChange={(v) => setCategory(v as IncomeCategory)}>
              {categoryOptions.map((opt) => (
                <label
                  key={opt.value}
                  htmlFor={`cat-${opt.value}`}
                  className="flex items-start gap-3 rounded-lg border p-3 cursor-pointer hover:bg-muted/40"
                >
                  <RadioGroupItem value={opt.value} id={`cat-${opt.value}`} className="mt-0.5" />
                  <div className="space-y-0.5">
                    <div className="text-sm font-medium">{opt.label}</div>
                    <div className="text-xs text-muted-foreground">{opt.hint}</div>
                  </div>
                </label>
              ))}
            </RadioGroup>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="received-note">
              Примітка <span className="text-muted-foreground text-xs">(необов'язково)</span>
            </Label>
            <Textarea
              id="received-note"
              placeholder="Напр. № договору, період робіт..."
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
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting && <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />}
            Зарахувати в дохід
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
