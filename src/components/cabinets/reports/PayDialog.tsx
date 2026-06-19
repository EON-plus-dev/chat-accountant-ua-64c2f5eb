import { useState } from "react";
import { Copy, Check, QrCode, ExternalLink, CheckCheck, Info } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/formatters";
import { taxBudgetCodes, type TaxType } from "@/config/paymentsConfig";
import { buildEmvQrPayload } from "@/lib/nbuQrCode";
import {
  buildMonobankWebLink,
  buildPrivat24WebLink,
  openBankLink,
} from "@/lib/bankDeepLinks";
import type { Report } from "@/config/reportsConfig";
import type { RelatedPayment } from "@/lib/reportPayments";

interface PayDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  report: Report;
  payments: RelatedPayment[];
  onMarkPaid?: (payment: RelatedPayment) => void;
}

/**
 * Мапа RelatedPayment → TaxType для отримання реквізитів.
 * Для звіту ep VZ-частина → military-fop (КБК 11011001 з 01.01.2025).
 */
function resolveTaxType(report: Report, payment: RelatedPayment): TaxType {
  if (payment.type === "ep") return "ep";
  if (payment.type === "esv") return "esv";
  // vz: для ФОП-звіту — military-fop, інакше military
  if (payment.type === "vz") {
    return report.type === "ep" ? "military-fop" : "military";
  }
  return "other";
}

function formatIban(iban: string): string {
  return iban.replace(/(.{4})/g, "$1 ").trim();
}

export function PayDialog({
  open,
  onOpenChange,
  report,
  payments,
  onMarkPaid,
}: PayDialogProps) {
  const pendingPayments = payments.filter((p) => p.status !== "paid");
  const [activeIndex, setActiveIndex] = useState(0);
  const { toast } = useToast();
  const [copied, setCopied] = useState<string | null>(null);

  if (pendingPayments.length === 0) return null;

  const safeIndex = Math.min(activeIndex, pendingPayments.length - 1);
  const active = pendingPayments[safeIndex];
  const taxType = resolveTaxType(report, active);
  const conf = taxBudgetCodes[taxType];

  const purpose = `*;101;${conf.code};${active.typeLabel} за ${
    report.periodLabel ?? ""
  }`.trim();

  const qrPayload = conf.iban
    ? buildEmvQrPayload({
        iban: conf.iban,
        recipientName: conf.recipient,
        edrpou: conf.edrpou,
        amount: active.amount,
        purpose,
      })
    : "";

  const bankFormat = [
    `Отримувач: ${conf.recipient}`,
    `ЄДРПОУ: ${conf.edrpou}`,
    `IBAN: ${conf.iban}`,
    `КБК: ${conf.code}`,
    `Сума: ${active.amount.toFixed(2)} грн`,
    `Призначення: ${purpose}`,
  ].join("\n");

  const handleCopy = async (value: string, key: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      setTimeout(() => setCopied(null), 1500);
      toast({ title: "Скопійовано", description: label });
    } catch {
      toast({ title: "Не вдалося скопіювати", variant: "destructive" });
    }
  };

  const handleOpenMono = () => {
    openBankLink(buildMonobankWebLink());
  };

  const handleOpenPrivat = () => {
    openBankLink(
      buildPrivat24WebLink({
        iban: conf.iban,
        amount: active.amount,
        purpose,
        recipientCode: conf.edrpou,
      })
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[92dvh] overflow-y-auto">
        <DialogHeader className="text-left">
          <DialogTitle className="text-base">Сплатити податок</DialogTitle>
          <DialogDescription className="text-xs">
            {report.periodLabel ?? ""} · {report.typeLabel ?? "Звіт"}
          </DialogDescription>
        </DialogHeader>

        {/* Перемикач платежів — лише якщо їх більше одного */}
        {pendingPayments.length > 1 && (
          <div className="flex flex-wrap gap-1.5">
            {pendingPayments.map((p, idx) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setActiveIndex(idx)}
                className={`text-xs px-2.5 py-1 rounded-md border transition-colors ${
                  idx === safeIndex
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card hover:bg-accent"
                }`}
              >
                {p.typeLabel} · {formatCurrency(p.amount)}
              </button>
            ))}
          </div>
        )}

        {/* Primary: великий QR + сума */}
        <div className="rounded-lg border bg-muted/30 p-4 flex flex-col items-center gap-3">
          {qrPayload ? (
            <div className="rounded-lg bg-background p-3 border-2">
              <QRCodeSVG
                value={qrPayload}
                size={220}
                level="M"
                aria-label={`QR-код для оплати: ${conf.name}`}
              />
            </div>
          ) : (
            <div className="text-xs text-muted-foreground">QR недоступний</div>
          )}
          <div className="text-center space-y-1">
            <p className="text-2xl font-bold font-mono">
              {formatCurrency(active.amount)}
            </p>
            <Badge variant="outline" className="font-mono text-[10px]">
              КБК {conf.code}
            </Badge>
          </div>
          <p className="text-[11px] text-muted-foreground text-center leading-snug">
            <QrCode className="h-3 w-3 inline mr-1" />
            Відкрийте свій банк → «Сканувати QR» — платіжка заповниться автоматично.
          </p>
        </div>

        {/* Primary action: копіювати реквізити */}
        <Button
          size="lg"
          className="w-full gap-2"
          onClick={() => handleCopy(bankFormat, "all", "Реквізити скопійовано")}
        >
          {copied === "all" ? (
            <Check className="h-4 w-4" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
          {copied === "all" ? "Скопійовано" : "Скопіювати реквізити"}
        </Button>

        {/* Реквізити списком (тонкий сірий блок) */}
        <dl className="text-xs space-y-1 rounded-md border p-3 bg-card">
          <div className="grid grid-cols-[100px_1fr] gap-2">
            <dt className="text-muted-foreground">Отримувач</dt>
            <dd className="font-medium">{conf.recipient}</dd>
          </div>
          <div className="grid grid-cols-[100px_1fr] gap-2">
            <dt className="text-muted-foreground">ЄДРПОУ</dt>
            <dd className="font-mono">{conf.edrpou}</dd>
          </div>
          <div className="grid grid-cols-[100px_1fr_auto] gap-2 items-center">
            <dt className="text-muted-foreground">IBAN</dt>
            <dd className="font-mono text-[11px] break-all">
              {formatIban(conf.iban)}
            </dd>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 shrink-0"
              onClick={() => handleCopy(conf.iban, "iban", "IBAN скопійовано")}
              aria-label="Копіювати IBAN"
            >
              {copied === "iban" ? (
                <Check className="h-3 w-3 text-emerald-600" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </Button>
          </div>
          <div className="grid grid-cols-[100px_1fr] gap-2">
            <dt className="text-muted-foreground">Призначення</dt>
            <dd className="text-foreground/90 italic leading-snug">
              «{purpose}»
            </dd>
          </div>
        </dl>

        {/* Secondary: відкрити банки (web) */}
        <div className="space-y-2">
          <p className="text-[11px] text-muted-foreground flex items-start gap-1.5">
            <Info className="h-3 w-3 mt-0.5 shrink-0" />
            Відкрити банк у браузері. Введіть IBAN та суму вручну за реквізитами
            вище — або скануйте QR з телефону.
          </p>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={handleOpenMono}
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Monobank
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={handleOpenPrivat}
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Приват24
            </Button>
          </div>
        </div>

        {/* Tertiary: позначити як сплачено */}
        {onMarkPaid && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full gap-2 text-emerald-700 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
            onClick={() => {
              onMarkPaid(active);
              onOpenChange(false);
            }}
          >
            <CheckCheck className="h-4 w-4" />
            Я вже сплатив(ла) — позначити як сплачено
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
}
