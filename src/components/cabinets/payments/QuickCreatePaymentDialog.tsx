/**
 * QuickCreatePaymentDialog
 * Lightweight standalone «+ Створити платіж» entry-point for UnifiedPaymentsPage.
 * Three flows: контрагенту / податок / зарплата.
 * Demo-mode: відправляє toast і закривається. Реальна інтеграція — пізніше.
 */

import { useState, useEffect } from "react";
import { Building2, Landmark, Wallet, Calendar as CalendarIcon, Repeat } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Switch } from "@/components/ui/switch";
import type { RecurrencePeriod } from "@/config/recurringPaymentTemplates";
import { recurrenceLabel } from "@/config/recurringPaymentTemplates";
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
import { cn } from "@/lib/utils";

export type QuickPaymentType = "contractor" | "tax" | "salary";

interface QuickCreatePaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultType?: QuickPaymentType;
  /** Префіли для duplicate-флоу — заповнюються при відкритті. */
  prefillCounterparty?: string;
  prefillAmount?: number;
  prefillPurpose?: string;
}

const typeOptions: {
  value: QuickPaymentType;
  label: string;
  hint: string;
  Icon: typeof Building2;
}[] = [
  { value: "contractor", label: "Контрагенту", hint: "Постачальник, оренда, послуги", Icon: Building2 },
  { value: "tax", label: "Податок / збір", hint: "ЄП, ВЗ, ЕСВ, ПДВ", Icon: Landmark },
  { value: "salary", label: "Зарплата", hint: "Виплата працівнику", Icon: Wallet },
];

export function QuickCreatePaymentDialog({
  open,
  onOpenChange,
  defaultType = "contractor",
  prefillCounterparty,
  prefillAmount,
  prefillPurpose,
}: QuickCreatePaymentDialogProps) {
  const [type, setType] = useState<QuickPaymentType>(defaultType);
  const [counterparty, setCounterparty] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [purpose, setPurpose] = useState("");
  const [recurring, setRecurring] = useState(false);
  const [period, setPeriod] = useState<RecurrencePeriod>("monthly");

  // Apply prefill when dialog opens
  useEffect(() => {
    if (open) {
      setType(defaultType);
      if (prefillCounterparty !== undefined) setCounterparty(prefillCounterparty);
      if (prefillAmount !== undefined && prefillAmount > 0) setAmount(String(prefillAmount));
      if (prefillPurpose !== undefined) setPurpose(prefillPurpose);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const reset = () => {
    setType(defaultType);
    setCounterparty("");
    setAmount("");
    setPurpose("");
    setDueDate(format(new Date(), "yyyy-MM-dd"));
    setRecurring(false);
    setPeriod("monthly");
  };

  const handleClose = (next: boolean) => {
    if (!next) reset();
    onOpenChange(next);
  };

  const handleSubmit = () => {
    const numAmount = parseFloat(amount.replace(",", "."));
    if (!counterparty.trim() || !numAmount || numAmount <= 0) {
      toast.error("Заповніть отримувача та суму");
      return;
    }
    const labelByType: Record<QuickPaymentType, string> = {
      contractor: "Платіж контрагенту",
      tax: "Сплата податку",
      salary: "Виплата зарплати",
    };
    if (recurring) {
      toast.success(`${labelByType[type]} додано як шаблон`, {
        description: `${counterparty} · ₴${numAmount.toLocaleString("uk-UA")} · ${recurrenceLabel[period]} · scheduled на 3 місяці вперед`,
      });
    } else {
      toast.success(`${labelByType[type]} створено`, {
        description: `${counterparty} · ₴${numAmount.toLocaleString("uk-UA")} · до ${format(new Date(dueDate), "dd.MM.yyyy")}`,
      });
    }
    handleClose(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Новий платіж</DialogTitle>
          <DialogDescription>
            Підготуйте платіж — потім підтвердите його одним кліком.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Type selector */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground uppercase tracking-wide">Тип</Label>
            <div className="grid grid-cols-3 gap-2">
              {typeOptions.map((opt) => {
                const active = type === opt.value;
                const Icon = opt.Icon;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setType(opt.value)}
                    className={cn(
                      "flex flex-col items-center gap-1 rounded-lg border p-2.5 text-center transition-colors",
                      active
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-border/80 hover:bg-muted/50"
                    )}
                  >
                    <Icon className={cn("h-4 w-4", active ? "text-primary" : "text-muted-foreground")} />
                    <span className="text-xs font-medium leading-tight">{opt.label}</span>
                    <span className="text-[10px] text-muted-foreground leading-tight">{opt.hint}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Counterparty */}
          <div className="space-y-1.5">
            <Label htmlFor="qcp-counterparty" className="text-xs text-muted-foreground uppercase tracking-wide">
              {type === "tax" ? "Отримувач" : type === "salary" ? "Працівник" : "Отримувач"}
            </Label>
            <Input
              id="qcp-counterparty"
              value={counterparty}
              onChange={(e) => setCounterparty(e.target.value)}
              placeholder={
                type === "tax"
                  ? "ДПС / Казначейська служба"
                  : type === "salary"
                  ? "ПІБ працівника"
                  : "Назва компанії або ПІБ"
              }
            />
          </div>

          {/* Amount + due date */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="qcp-amount" className="text-xs text-muted-foreground uppercase tracking-wide">
                Сума, ₴
              </Label>
              <Input
                id="qcp-amount"
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value.replace(/[^\d.,]/g, ""))}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="qcp-date" className="text-xs text-muted-foreground uppercase tracking-wide inline-flex items-center gap-1">
                <CalendarIcon className="h-3 w-3" />
                Термін
              </Label>
              <Input
                id="qcp-date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>

          {/* Recurring */}
          <div className="space-y-2 rounded-lg border border-border p-3">
            <div className="flex items-center justify-between gap-2">
              <Label htmlFor="qcp-recurring" className="text-xs uppercase tracking-wide text-muted-foreground inline-flex items-center gap-1.5 cursor-pointer">
                <Repeat className="h-3 w-3" />
                Періодичність
              </Label>
              <Switch id="qcp-recurring" checked={recurring} onCheckedChange={setRecurring} />
            </div>
            {recurring && (
              <ToggleGroup
                type="single"
                value={period}
                onValueChange={(v) => v && setPeriod(v as RecurrencePeriod)}
                variant="outline"
                size="sm"
                className="w-full"
              >
                <ToggleGroupItem value="monthly" className="text-xs flex-1 h-8">Щомісяця</ToggleGroupItem>
                <ToggleGroupItem value="quarterly" className="text-xs flex-1 h-8">Щокварталу</ToggleGroupItem>
                <ToggleGroupItem value="yearly" className="text-xs flex-1 h-8">Щороку</ToggleGroupItem>
              </ToggleGroup>
            )}
            {recurring && (
              <p className="text-[11px] text-muted-foreground">
                Створимо scheduled-платежі на наступні 3 місяці автоматично. Керувати — у меню «Регулярні платежі».
              </p>
            )}
          </div>

          {/* Purpose */}
          <div className="space-y-1.5">
            <Label htmlFor="qcp-purpose" className="text-xs text-muted-foreground uppercase tracking-wide">
              Призначення (необов'язково)
            </Label>
            <Textarea
              id="qcp-purpose"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="Напр.: Оплата за рахунком №42 від 01.04.2026"
              rows={2}
              className="resize-none"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" onClick={() => handleClose(false)}>
            Скасувати
          </Button>
          <Button onClick={handleSubmit}>Створити</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
