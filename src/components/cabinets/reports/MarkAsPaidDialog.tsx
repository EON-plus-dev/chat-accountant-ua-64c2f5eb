import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { uk } from "date-fns/locale";
import { CalendarIcon, CheckCircle2, Copy, Check } from "lucide-react";
import {
  PAYMENT_REQUISITES,
  buildPaymentPurpose,
  type PaymentRequisiteType,
} from "@/config/paymentRequisitesConfig";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/formatters";

const formSchema = z.object({
  paidDate: z
    .date({ required_error: "Вкажіть дату сплати" })
    .max(new Date(new Date().setHours(23, 59, 59, 999)), {
      message: "Дата сплати не може бути в майбутньому",
    }),
  amount: z
    .number({ invalid_type_error: "Вкажіть коректну суму" })
    .positive("Сума має бути більше 0")
    .max(10_000_000, "Сума занадто велика"),
  reference: z
    .string()
    .trim()
    .max(50, "Не більше 50 символів")
    .optional()
    .or(z.literal("")),
});

export type MarkAsPaidFormValues = z.infer<typeof formSchema>;

interface MarkAsPaidDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  paymentLabel: string;
  defaultAmount: number;
  onConfirm: (data: MarkAsPaidFormValues) => void;
  /** Тип платежу для показу реквізитів (опційно) */
  paymentType?: PaymentRequisiteType;
  /** ІПН/ЄДРПОУ платника для шаблону призначення */
  payerIpn?: string;
  /** Період звіту для шаблону призначення */
  period?: string;
  /** ID звіту для шаблону призначення */
  reportId?: string;
}

function CopyableField({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success(`${label} скопійовано`);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Не вдалося скопіювати");
    }
  };
  return (
    <div className="flex items-center justify-between gap-2 text-xs">
      <div className="min-w-0 flex-1">
        <p className="text-muted-foreground">{label}</p>
        <p className="font-mono truncate text-foreground">{value}</p>
      </div>
      <Button
        type="button"
        size="icon"
        variant="ghost"
        className="h-6 w-6 shrink-0"
        onClick={handleCopy}
        aria-label={`Скопіювати ${label}`}
      >
        {copied ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
      </Button>
    </div>
  );
}

export function MarkAsPaidDialog({
  open,
  onOpenChange,
  paymentLabel,
  defaultAmount,
  onConfirm,
  paymentType,
  payerIpn,
  period,
  reportId,
}: MarkAsPaidDialogProps) {
  const form = useForm<MarkAsPaidFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      paidDate: new Date(),
      amount: defaultAmount,
      reference: "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        paidDate: new Date(),
        amount: defaultAmount,
        reference: "",
      });
    }
  }, [open, defaultAmount, form]);

  const onSubmit = (values: MarkAsPaidFormValues) => {
    onConfirm({
      ...values,
      reference: values.reference?.trim() || undefined,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            Записати факт сплати
          </DialogTitle>
          <DialogDescription>
            {paymentLabel} — {formatCurrency(defaultAmount)}. Вкажіть фактичну дату та суму
            сплати.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-md border border-border/60 bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
          ℹ️ Це <span className="font-medium text-foreground">лише запис</span> у системі — фактично сплачуйте через банк або Дію.
        </div>

        {paymentType && (
          <div className="rounded-md border border-border/60 bg-muted/30 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-foreground">Реквізити для сплати</p>
              <span className="text-[10px] text-muted-foreground">Скопіюйте в банк</span>
            </div>
            <div className="space-y-1.5">
              <CopyableField
                label="Отримувач"
                value={PAYMENT_REQUISITES[paymentType].recipientTemplate}
              />
              <CopyableField label="КБК" value={PAYMENT_REQUISITES[paymentType].kbk} />
              <CopyableField
                label="Призначення платежу"
                value={buildPaymentPurpose(paymentType, payerIpn ?? "", period ?? "", reportId)}
              />
            </div>
            {PAYMENT_REQUISITES[paymentType].note && (
              <p className="text-[10px] text-muted-foreground border-t border-border/40 pt-1.5">
                {PAYMENT_REQUISITES[paymentType].note}
              </p>
            )}
            <p className="text-[10px] text-muted-foreground">
              ℹ️ IBAN області уточніть у{" "}
              <a
                href="https://cabinet.tax.gov.ua"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-foreground"
              >
                Кабінеті платника
              </a>
              .
            </p>
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="paidDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Дата сплати</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP", { locale: uk })
                          ) : (
                            <span>Оберіть дату</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date > new Date() || date < new Date("2020-01-01")}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Сума, грн</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={field.value}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reference"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>№ платіжки (необов'язково)</FormLabel>
                  <FormControl>
                    <Input placeholder="Напр., PO-2026-0421" maxLength={50} {...field} />
                  </FormControl>
                  <FormDescription>Допомагає трасувати платіж у банку</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="flex-col gap-2 sm:flex-row sm:gap-2">
              <Button
                type="button"
                variant="outline"
                disabled
                title="Прямі платежі будуть доступні згодом"
                className="sm:order-2"
              >
                Перейти до сплати →
              </Button>
              <Button type="submit" className="sm:order-1">
                <CheckCircle2 className="h-4 w-4 mr-1" />
                Я вже сплатив — записати дату
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
