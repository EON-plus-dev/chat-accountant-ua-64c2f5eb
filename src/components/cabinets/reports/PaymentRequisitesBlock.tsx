import { useState } from "react";
import { Copy, Check, Banknote, Info, QrCode, Maximize2, AlertTriangle } from "lucide-react";
import type { RequisitesMode } from "@/config/reportsConfig";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { taxBudgetCodes, type TaxType } from "@/config/paymentsConfig";
import { formatCurrency } from "@/lib/formatters";
import { buildEmvQrPayload } from "@/lib/nbuQrCode";

interface RequisiteCardProps {
  taxType: TaxType;
  amount: number;
  purpose: string;
  accent?: "primary" | "muted";
  showQr?: boolean;
}

function formatIban(iban: string): string {
  // UA21 8201 7203 4313 0001 0000 15825
  return iban.replace(/(.{4})/g, "$1 ").trim();
}

function RequisiteCard({ taxType, amount, purpose, accent = "primary", showQr = true }: RequisiteCardProps) {
  const { toast } = useToast();
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const conf = taxBudgetCodes[taxType];

  if (!conf || !conf.iban) return null;

  const copy = async (value: string, field: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 1500);
      toast({ title: "Скопійовано", description: label });
    } catch {
      toast({ title: "Не вдалося скопіювати", variant: "destructive" });
    }
  };

  // Формат для вставки в Приват24/Monobank: однією рядком
  const bankFormat = [
    `Отримувач: ${conf.recipient}`,
    `ЄДРПОУ: ${conf.edrpou}`,
    `IBAN: ${conf.iban}`,
    `КБК: ${conf.code}`,
    `Сума: ${amount.toFixed(2)} грн`,
    `Призначення: ${purpose}`,
  ].join("; ");

  return (
    <div
      className={
        accent === "primary"
          ? "rounded-md border border-primary/20 bg-primary/5 p-3 space-y-2"
          : "rounded-md border bg-muted/20 p-3 space-y-2"
      }
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Banknote className="h-3.5 w-3.5 text-primary shrink-0" />
            <span className="text-xs font-semibold uppercase tracking-wide">{conf.name}</span>
            <Badge variant="outline" className="font-mono text-[10px] h-4">
              КБК {conf.code}
            </Badge>
          </div>
        </div>
        <p className="text-sm font-bold font-mono whitespace-nowrap">
          {formatCurrency(amount)}
        </p>
      </div>

      <dl className="text-xs space-y-1">
        <div className="grid grid-cols-[110px_1fr] gap-2">
          <dt className="text-muted-foreground">Отримувач</dt>
          <dd className="font-medium">{conf.recipient}</dd>
        </div>
        <div className="grid grid-cols-[110px_1fr] gap-2">
          <dt className="text-muted-foreground">ЄДРПОУ</dt>
          <dd className="font-mono">{conf.edrpou}</dd>
        </div>
        <div className="grid grid-cols-[110px_1fr_auto] gap-2 items-center">
          <dt className="text-muted-foreground">IBAN</dt>
          <dd className="font-mono text-[11px] break-all">{formatIban(conf.iban)}</dd>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 shrink-0"
            onClick={() => copy(conf.iban, `iban-${taxType}`, "IBAN скопійовано")}
            aria-label="Копіювати IBAN"
          >
            {copiedField === `iban-${taxType}` ? (
              <Check className="h-3 w-3 text-emerald-600" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
          </Button>
        </div>
        <div className="grid grid-cols-[110px_1fr] gap-2">
          <dt className="text-muted-foreground">МФО</dt>
          <dd className="font-mono">{conf.mfo}</dd>
        </div>
        <div className="grid grid-cols-[110px_1fr] gap-2">
          <dt className="text-muted-foreground">Призначення</dt>
          <dd className="text-foreground/90 italic leading-snug">«{purpose}»</dd>
        </div>
      </dl>

      <div className="flex flex-wrap gap-1.5 pt-1">
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-xs gap-1.5"
          onClick={() => copy(bankFormat, `bank-${taxType}`, "Реквізити скопійовано як платіжку")}
        >
          {copiedField === `bank-${taxType}` ? (
            <Check className="h-3 w-3 text-emerald-600" />
          ) : (
            <Copy className="h-3 w-3" />
          )}
          Копіювати як платіжку
        </Button>
      </div>

      {/* QR-код NBU EMV для оплати скануванням — лише якщо showQr */}
      {showQr && (
        <PaymentQrBlock
          payload={buildEmvQrPayload({
            iban: conf.iban,
            recipientName: conf.recipient,
            edrpou: conf.edrpou,
            amount,
            purpose,
          })}
          taxName={conf.name}
          amount={amount}
          purpose={purpose}
        />
      )}
    </div>
  );
}

interface PaymentQrBlockProps {
  payload: string;
  taxName: string;
  amount: number;
  purpose: string;
}

function PaymentQrBlock({ payload, taxName, amount, purpose }: PaymentQrBlockProps) {
  return (
    <div className="mt-2 pt-2.5 border-t border-border/60">
      <div className="flex items-start gap-3">
        <div className="shrink-0 rounded-md bg-background p-2 border">
          <QRCodeSVG
            value={payload}
            size={96}
            level="M"
            aria-label={`QR-код для оплати: ${taxName}`}
          />
        </div>
        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="flex items-center gap-1.5">
            <QrCode className="h-3.5 w-3.5 text-primary" />
            <p className="text-xs font-medium">Скануйте банком для оплати</p>
          </div>
          <p className="text-[11px] text-muted-foreground leading-snug">
            Відкрийте Monobank, Privat24 або інший банк → «Сканувати QR» → платіжка заповниться автоматично.
          </p>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 px-2 text-[11px] gap-1">
                <Maximize2 className="h-3 w-3" />
                Розгорнути
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-base">{taxName}</DialogTitle>
                <DialogDescription className="text-xs">{purpose}</DialogDescription>
              </DialogHeader>
              <div className="flex flex-col items-center gap-3 py-2">
                <div className="rounded-lg bg-background p-4 border-2">
                  <QRCodeSVG
                    value={payload}
                    size={280}
                    level="M"
                    aria-label={`QR-код для оплати: ${taxName}`}
                  />
                </div>
                <p className="text-lg font-bold font-mono">{formatCurrency(amount)}</p>
                <p className="text-xs text-muted-foreground text-center">
                  Не сканується? Скопіюйте реквізити вище та вставте у платіжку вручну.
                </p>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}

interface PaymentRequisitesBlockProps {
  reportType: string;
  periodLabel: string;
  payerName?: string;
  payerTaxId?: string;
  amounts: {
    ep?: number;
    militaryFop?: number;
    esv?: number;
    pdfo?: number;
    militaryEmp?: number;
    esvEmployer?: number;
  };
  /**
   * Режим відображення:
   * - "full" (default): повні реквізити з QR-кодом (для submitted/accepted звітів)
   * - "preview": реквізити без QR + жовтий банер «не сплачуйте до подання» (для approved)
   * - "hidden": нічого не рендериться (для scheduled/processing/review/rejected)
   */
  mode?: RequisitesMode;
}

/**
 * Блок реквізитів для сплати — будує картки залежно від типу звіту:
 * - ep → ЄП (КБК 18050400) + ВЗ ФОП (КБК 11011001)
 * - 1df → ПДФО (КБК 11010100) + ВЗ найманих (КБК 11011000)
 * - esv / esv-emp → ЄСВ (КБК 22010100)
 * - vz → ВЗ найманих
 *
 * Видимість контролюється через prop `mode`:
 * - реквізити для оплати показуємо ЛИШЕ після підтвердження звіту,
 * - QR-код — лише після подання та отримання квитанції №1.
 */
export function PaymentRequisitesBlock({
  reportType,
  periodLabel,
  payerName = "Платник",
  payerTaxId = "",
  amounts,
  mode = "full",
}: PaymentRequisitesBlockProps) {
  if (mode === "hidden") return null;

  const payerSuffix = payerTaxId
    ? `, ${payerName}, ІПН ${payerTaxId}`
    : `, ${payerName}`;

  const cards: { taxType: TaxType; amount: number; purpose: string; accent?: "primary" | "muted" }[] = [];

  if (reportType === "ep") {
    if (amounts.ep && amounts.ep > 0) {
      cards.push({
        taxType: "ep",
        amount: amounts.ep,
        purpose: `Єдиний податок за ${periodLabel}${payerSuffix}`,
        accent: "primary",
      });
    }
    if (amounts.militaryFop && amounts.militaryFop > 0) {
      cards.push({
        taxType: "military-fop",
        amount: amounts.militaryFop,
        purpose: `Військовий збір за ${periodLabel}${payerSuffix}`,
        accent: "muted",
      });
    }
  } else if (reportType === "1df") {
    if (amounts.pdfo && amounts.pdfo > 0) {
      cards.push({
        taxType: "pdfo",
        amount: amounts.pdfo,
        purpose: `ПДФО із зарплати найманих за ${periodLabel}${payerSuffix}`,
        accent: "primary",
      });
    }
    if (amounts.militaryEmp && amounts.militaryEmp > 0) {
      cards.push({
        taxType: "military",
        amount: amounts.militaryEmp,
        purpose: `Військовий збір із зарплати найманих за ${periodLabel}${payerSuffix}`,
        accent: "muted",
      });
    }
    if (amounts.esvEmployer && amounts.esvEmployer > 0) {
      cards.push({
        taxType: "esv-employer",
        amount: amounts.esvEmployer,
        purpose: `ЄСВ роботодавця за ${periodLabel}${payerSuffix}`,
        accent: "muted",
      });
    }
  } else if (reportType === "esv" || reportType === "esv-emp") {
    if (amounts.esv && amounts.esv > 0) {
      cards.push({
        taxType: "esv",
        amount: amounts.esv,
        purpose: `Єдиний соціальний внесок за ${periodLabel}${payerSuffix}`,
        accent: "primary",
      });
    }
  } else if (reportType === "vz" || reportType === "vz-emp") {
    if (amounts.militaryEmp && amounts.militaryEmp > 0) {
      cards.push({
        taxType: "military",
        amount: amounts.militaryEmp,
        purpose: `Військовий збір за ${periodLabel}${payerSuffix}`,
        accent: "primary",
      });
    }
  }

  if (cards.length === 0) return null;

  const showQr = mode === "full";

  return (
    <section className="space-y-2.5">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Реквізити для сплати
        </h4>
        {mode === "preview" && (
          <span className="text-[10px] uppercase tracking-wide font-semibold text-amber-700 dark:text-amber-300">
            Попередній перегляд
          </span>
        )}
      </div>

      {/* Жовтий банер для preview-режиму (звіт підтверджений, але ще не поданий) */}
      {mode === "preview" && (
        <div className="flex items-start gap-2.5 p-3 rounded-md bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
          <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
          <div className="text-xs text-amber-800 dark:text-amber-200 leading-snug">
            <p className="font-semibold">Не сплачуйте до подання звіту</p>
            <p className="mt-0.5">
              Спочатку подайте звіт до ДПС та отримайте квитанцію №1 з остаточним номером.
              Лише після цього QR-код для оплати буде активовано — це гарантує правильне зарахування платежу.
            </p>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {cards.map((c, i) => (
          <RequisiteCard key={`${c.taxType}-${i}`} {...c} showQr={showQr} />
        ))}
      </div>

      <div className="flex items-start gap-2 text-[11px] text-muted-foreground bg-muted/30 rounded-md p-2.5">
        <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
        <p>
          Демо-реквізити для м. Києва (ГУ ДПС). Уточніть IBAN для вашого регіону на офіційному сайті ДПС
          перед сплатою. КБК — згідно з Наказом Мінфіну №11.
        </p>
      </div>
    </section>
  );
}

