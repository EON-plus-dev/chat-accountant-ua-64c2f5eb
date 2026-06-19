/**
 * PaymentDrillView — компактний preview платіжного доручення/операції.
 * Викликається коли користувач клікає на платіж з контексту, де НЕ хоче
 * втратити поточну сторінку (контрагент, декларація-джерело тощо).
 */

import { ArrowRight, ExternalLink, Wallet, Calendar, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { uk } from "date-fns/locale";
import { DrillSheet } from "../DrillSheet";
import { useDrillStack } from "../DrillStackProvider";
import { RelatedAuditsList } from "./RelatedAuditsList";

interface Props {
  paymentId: string;
  /** Опц. метадані для preview */
  amount?: number;
  currency?: string;
  date?: string;
  contractor?: string;
  purpose?: string;
  statusLabel?: string;
  relatedPprId?: string;
  sourceLabel?: string;
  onOpenFullPayment?: (id: string) => void;
}

const formatCurrency = (n: number, ccy = "UAH") => {
  const symbol = ccy === "UAH" ? "₴" : ccy === "USD" ? "$" : ccy === "EUR" ? "€" : "";
  return `${symbol}${n.toLocaleString("uk-UA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export function PaymentDrillView({
  paymentId,
  amount,
  currency,
  date,
  contractor,
  purpose,
  statusLabel,
  relatedPprId,
  sourceLabel,
  onOpenFullPayment,
}: Props) {
  const { popAll } = useDrillStack();

  return (
    <DrillSheet
      matchKind="payment"
      matchId={paymentId}
      title={`Платіж ${paymentId}`}
      sourceLabel={sourceLabel}
      footer={
        <Button
          size="sm"
          className="w-full"
          onClick={() => {
            popAll();
            onOpenFullPayment?.(paymentId);
          }}
        >
          <ExternalLink className="h-4 w-4 mr-1.5" />
          Відкрити повний платіж
          <ArrowRight className="h-4 w-4 ml-1.5" />
        </Button>
      }
    >
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Wallet className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium leading-tight font-mono">{paymentId}</p>
            {statusLabel && (
              <Badge variant="secondary" size="sm" className="mt-1.5 font-normal">
                {statusLabel}
              </Badge>
            )}
          </div>
          {typeof amount === "number" && (
            <div className="text-right shrink-0">
              <p className="text-lg font-semibold font-mono">
                {formatCurrency(amount, currency)}
              </p>
            </div>
          )}
        </div>

        <Separator />

        <div className="space-y-3 text-sm">
          {date && (
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" /> Дата
              </span>
              <span>{format(new Date(date), "dd MMM yyyy", { locale: uk })}</span>
            </div>
          )}
          {contractor && (
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground shrink-0">
                <Building2 className="h-3.5 w-3.5" /> Контрагент
              </span>
              <span className="text-right truncate">{contractor}</span>
            </div>
          )}
          {purpose && (
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">Призначення</span>
              <p className="text-xs leading-relaxed">{purpose}</p>
            </div>
          )}
        </div>

        {relatedPprId && (
          <>
            <Separator />
            <RelatedAuditsList match="pprId" value={relatedPprId} />
          </>
        )}

        <div className="text-xs text-muted-foreground leading-relaxed border-t pt-3">
          Це швидкий перегляд. У повній картці — реквізити, статус-трекер,
          пов'язані документи та дії.
        </div>
      </div>
    </DrillSheet>
  );
}
