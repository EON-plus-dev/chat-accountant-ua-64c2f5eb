/**
 * IssueReceiptDialog
 * Простий діалог формування квитанції (ПДФ-стаб) для надходження.
 */

import { useMemo, useState } from "react";
import { format } from "date-fns";
import { Receipt } from "lucide-react";
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
import { toast } from "@/hooks/use-toast";
import type { IncomeBookRecord } from "@/config/incomeBookConfig";

interface IssueReceiptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  record: IncomeBookRecord;
}

function generateReceiptNumber(): string {
  const yyyy = new Date().getFullYear();
  const nnnn = String(Math.floor(1000 + Math.random() * 9000));
  return `КВТ-${yyyy}-${nnnn}`;
}

export function IssueReceiptDialog({ open, onOpenChange, record }: IssueReceiptDialogProps) {
  const defaultNumber = useMemo(() => generateReceiptNumber(), [open]);
  const defaultDate = useMemo(() => {
    try {
      return format(new Date(record.date), "yyyy-MM-dd");
    } catch {
      return format(new Date(), "yyyy-MM-dd");
    }
  }, [record.date]);

  const [date, setDate] = useState(defaultDate);
  const [number, setNumber] = useState(defaultNumber);
  const [purpose, setPurpose] = useState(record.description || "Оплата за товари/послуги");

  const formatCurrency = (a: number) => `₴${a.toLocaleString("uk-UA")}`;

  const handleSubmit = () => {
    toast({
      title: "Квитанцію сформовано",
      description: `Квитанцію №${number} (PDF) збережено в архіві документів.`,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-primary" />
            Видати квитанцію
          </DialogTitle>
          <DialogDescription>
            Сформуйте PDF-квитанцію за надходження. Документ автоматично потрапить в архів.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="receipt-date" className="text-xs">Дата квитанції</Label>
              <Input
                id="receipt-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-9 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="receipt-number" className="text-xs">Номер</Label>
              <Input
                id="receipt-number"
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                className="h-9 text-sm font-mono"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Отримувач</Label>
            <Input value={record.contractor || "—"} readOnly className="h-9 text-sm bg-muted" />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Сума</Label>
            <Input value={formatCurrency(record.amount)} readOnly className="h-9 text-sm bg-muted font-mono" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="receipt-purpose" className="text-xs">Призначення</Label>
            <Textarea
              id="receipt-purpose"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="text-sm min-h-[72px]"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Скасувати</Button>
          <Button onClick={handleSubmit}>
            <Receipt className="h-4 w-4 mr-1.5" />
            Сформувати PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
