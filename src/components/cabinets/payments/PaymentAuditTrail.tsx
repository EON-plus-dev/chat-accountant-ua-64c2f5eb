/**
 * Аудит-трейл платежу: повний lifecycle (створено → в чергу → надіслано → оплачено → звірено).
 */

import { format } from "date-fns";
import { uk } from "date-fns/locale";
import { History, UserCircle2, FilePenLine, CheckCircle2, FileSearch, Send, Clock } from "lucide-react";
import {
  type UnifiedPayment,
  isTaxPayment,
  isSalaryPayment,
  isContractorPayment,
} from "@/config/unifiedPaymentsConfig";

export interface PaymentAuditEntry {
  id: string;
  action: "created" | "queued" | "sent-to-bank" | "updated" | "paid" | "received" | "reconciled";
  actor: string;
  at: string;
  note?: string;
}

interface PaymentAuditTrailProps {
  payment: UnifiedPayment;
  /** Додаткові записи (наприклад, statementRef з MarkAsPaid/Received) */
  extraEntries?: PaymentAuditEntry[];
}

const actionConfig = {
  created: { icon: FilePenLine, label: "Створено", color: "text-muted-foreground" },
  queued: { icon: Clock, label: "Поставлено в чергу", color: "text-slate-600 dark:text-slate-400" },
  "sent-to-bank": { icon: Send, label: "Надіслано в банк", color: "text-sky-600 dark:text-sky-400" },
  updated: { icon: FilePenLine, label: "Змінено", color: "text-amber-600 dark:text-amber-400" },
  paid: { icon: CheckCircle2, label: "Оплачено", color: "text-emerald-600 dark:text-emerald-400" },
  received: { icon: CheckCircle2, label: "Підтверджено надходження", color: "text-emerald-600 dark:text-emerald-400" },
  reconciled: { icon: FileSearch, label: "Звірено з випискою", color: "text-sky-600 dark:text-sky-400" },
} as const;

function generateAuditTrail(payment: UnifiedPayment): PaymentAuditEntry[] {
  const entries: PaymentAuditEntry[] = [];
  const baseDate = new Date(payment.date);
  const data = payment.sourceData;

  // Дата створення: для tax/salary беремо з sourceData; для решти — за добу до date
  let createdAt = new Date(baseDate.getTime() - 24 * 60 * 60 * 1000).toISOString();
  if (isTaxPayment(data)) {
    createdAt = data.deadline; // оптимістично
  } else if (isSalaryPayment(data)) {
    createdAt = data.scheduledDate;
  } else if (isContractorPayment(data)) {
    createdAt = data.date;
  }

  entries.push({
    id: `${payment.id}-created`,
    action: "created",
    actor: "Система · авто-нарахування",
    at: createdAt,
    note: payment.relatedReportId ? `На основі звіту ${payment.relatedReportId}` : undefined,
  });

  // Lifecycle для out-платежів
  if (payment.direction === "out") {
    if (
      payment.status === "created" ||
      payment.status === "sent-to-bank" ||
      payment.status === "paid"
    ) {
      entries.push({
        id: `${payment.id}-queued`,
        action: "queued",
        actor: "Система",
        at: createdAt,
      });
    }
    if (payment.status === "sent-to-bank" || payment.status === "paid") {
      entries.push({
        id: `${payment.id}-sent`,
        action: "sent-to-bank",
        actor: payment.bankProvider ? `Банк · ${payment.bankProvider}` : "Банк",
        at: createdAt,
      });
    }
  }

  // Виконання
  if (payment.status === "paid" || payment.status === "income") {
    entries.push({
      id: `${payment.id}-paid`,
      action: payment.direction === "in" ? "received" : "paid",
      actor: "Власник кабінету",
      at: payment.date,
    });
  }

  return entries;
}

export function PaymentAuditTrail({ payment, extraEntries = [] }: PaymentAuditTrailProps) {
  const trail = [...generateAuditTrail(payment), ...extraEntries].sort(
    (a, b) => new Date(a.at).getTime() - new Date(b.at).getTime()
  );

  return (
    <div className="rounded-lg border border-border/60 bg-muted/20 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <History className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-sm font-medium">Аудит-трейл</h3>
      </div>

      <ol className="space-y-2.5">
        {trail.map((entry) => {
          const cfg = actionConfig[entry.action];
          const Icon = cfg.icon;
          return (
            <li key={entry.id} className="flex items-start gap-2.5 text-sm">
              <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${cfg.color}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2 flex-wrap">
                  <span className="font-medium">{cfg.label}</span>
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {format(new Date(entry.at), "dd.MM.yyyy", { locale: uk })}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <UserCircle2 className="h-3 w-3" />
                  <span>{entry.actor}</span>
                </div>
                {entry.note && (
                  <p className="text-xs text-muted-foreground mt-0.5 italic">{entry.note}</p>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
