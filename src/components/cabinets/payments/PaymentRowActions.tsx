/**
 * PaymentRowActions
 * Quick-actions «...» меню для рядка платежу в UnifiedPaymentsTable.
 * Контекст-залежне: набір дій залежить від direction + status.
 */

import {
  MoreHorizontal,
  Send,
  CheckCircle2,
  Copy,
  Eye,
  XCircle,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { UnifiedPayment } from "@/config/unifiedPaymentsConfig";

export interface PaymentRowActionHandlers {
  onView?: (payment: UnifiedPayment) => void;
  onPay?: (payment: UnifiedPayment) => void;
  onMarkPaid?: (payment: UnifiedPayment) => void;
  onMarkReceived?: (payment: UnifiedPayment) => void;
  onClarify?: (payment: UnifiedPayment) => void;
  onDuplicate?: (payment: UnifiedPayment) => void;
  onCancel?: (payment: UnifiedPayment) => void;
}

interface PaymentRowActionsProps extends PaymentRowActionHandlers {
  payment: UnifiedPayment;
}

export function PaymentRowActions({
  payment,
  onView,
  onPay,
  onMarkPaid,
  onMarkReceived,
  onClarify,
  onDuplicate,
  onCancel,
}: PaymentRowActionsProps) {
  const isOut = payment.direction === "out";
  const isIn = payment.direction === "in";
  const status = payment.status as string;

  const canPay = isOut && ["scheduled", "created", "sent-to-bank", "not-created", "overdue"].includes(status);
  const canMarkPaid = isOut && status !== "paid" && status !== "cancelled";
  const canClarify = isIn && status === "needs-clarification";
  const canMarkReceived = isIn && status === "needs-clarification";
  const canCancel = isOut && !["paid", "cancelled"].includes(status);
  const canDuplicate = isOut && payment.paymentType === "contractor";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          aria-label="Дії над платежем"
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52" onClick={(e) => e.stopPropagation()}>
        {canPay && (
          <DropdownMenuItem onSelect={() => onPay?.(payment)}>
            <Send className="h-3.5 w-3.5 mr-2" />
            Сплатити зараз
          </DropdownMenuItem>
        )}
        {canClarify && (
          <DropdownMenuItem onSelect={() => onClarify?.(payment)}>
            <HelpCircle className="h-3.5 w-3.5 mr-2" />
            Розпізнати платіж
          </DropdownMenuItem>
        )}
        {canMarkReceived && (
          <DropdownMenuItem onSelect={() => onMarkReceived?.(payment)}>
            <CheckCircle2 className="h-3.5 w-3.5 mr-2" />
            Зарахувати в дохід
          </DropdownMenuItem>
        )}
        {canMarkPaid && (
          <DropdownMenuItem onSelect={() => onMarkPaid?.(payment)}>
            <CheckCircle2 className="h-3.5 w-3.5 mr-2" />
            Позначити оплаченим
          </DropdownMenuItem>
        )}
        {canDuplicate && (
          <DropdownMenuItem onSelect={() => onDuplicate?.(payment)}>
            <Copy className="h-3.5 w-3.5 mr-2" />
            Дублювати
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onSelect={() => onView?.(payment)}>
          <Eye className="h-3.5 w-3.5 mr-2" />
          Деталі
        </DropdownMenuItem>
        {canCancel && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={() => onCancel?.(payment)}
              className="text-rose-600 focus:text-rose-600 dark:text-rose-400 dark:focus:text-rose-400"
            >
              <XCircle className="h-3.5 w-3.5 mr-2" />
              Скасувати
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
