/**
 * Маппінг ППР (TaxPPR) у чернетку платежу TaxPayment.
 *
 * Створює структуру для CreatePaymentSheet / черги "Payments — на сплату":
 *  - amountToPay = principal + fine + penalty
 *  - taxType = "other" (донарахування за актом ДПС, не звичайний податок)
 *  - period = метаінформація про ППР
 *
 * Не пише в реальний store — повертає об'єкт, який викликаюча сторона
 * передає в свій onCreatePayment.
 */

import type { TaxPPR, TaxAudit } from "@/config/taxAuditsConfig";
import type { TaxPayment } from "@/config/paymentsConfig";

export interface PprToPaymentDraft {
  cabinetId: string;
  taxType: TaxPayment["taxType"];
  taxTypeLabel: string;
  period: string;
  year: number;
  amountToPay: number;
  status: TaxPayment["status"];
  statusLabel: string;
  deadline: string;
  createdAt: string;
  // Зв'язки для трасування назад до ППР/перевірки
  metadata: {
    sourcePprId: string;
    sourceAuditId: string;
    pprNumber: string;
    pprForm: TaxPPR["form"];
    breakdown: {
      principal: number;
      fine: number;
      penalty: number;
    };
  };
}

const PPR_FORM_TITLE: Record<TaxPPR["form"], string> = {
  Р: "Основне зобов'язання",
  Ш: "Штраф",
  В: "ПДВ",
  Д: "Донарахування",
  ПС: "Пеня",
};

export function buildPaymentDraftFromPPR(
  ppr: TaxPPR,
  audit: TaxAudit,
  cabinetId: string,
): PprToPaymentDraft {
  const issued = new Date(ppr.issuedDate);
  const total =
    ppr.principalAmount + (ppr.fineAmount ?? 0) + (ppr.penaltyAmount ?? 0);
  return {
    cabinetId,
    taxType: "other",
    taxTypeLabel: `ППР ${ppr.number} (${PPR_FORM_TITLE[ppr.form]})`,
    period: `${audit.period} · перевірка ${audit.orderNumber}`,
    year: issued.getFullYear(),
    amountToPay: total,
    status: "not-created",
    statusLabel: "До сплати за ППР",
    deadline: ppr.agreementDeadline,
    createdAt: ppr.issuedDate,
    metadata: {
      sourcePprId: ppr.id,
      sourceAuditId: audit.id,
      pprNumber: ppr.number,
      pprForm: ppr.form,
      breakdown: {
        principal: ppr.principalAmount,
        fine: ppr.fineAmount ?? 0,
        penalty: ppr.penaltyAmount ?? 0,
      },
    },
  };
}
