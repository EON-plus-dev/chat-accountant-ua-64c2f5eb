/**
 * Конвертація аудитів / актів / ППР / скарг у плоскі календарні події.
 *
 * Викликається з:
 *  - модуля Календар (повний місячний / квартальний планер)
 *  - CommandCenter «найближчі дедлайни»
 *  - інтеграції з user_events (для нагадувань)
 *
 * Не залежить від React. Повертає сортований за датою масив.
 */

import {
  type TaxAudit,
  type TaxAct,
  type TaxPPR,
  type TaxAppeal,
  demoActs,
  demoPPRs,
  demoAppeals,
  getAuditTypeLabel,
} from "@/config/taxAuditsConfig";

export type AuditCalendarEventKind =
  | "audit-response"
  | "act-objection"
  | "ppr-payment"
  | "ppr-appeal"
  | "appeal-filing";

export interface AuditCalendarEvent {
  id: string;
  kind: AuditCalendarEventKind;
  date: string; // ISO
  title: string;
  description: string;
  /** Куди вести користувача при кліку. */
  link: { auditId: string; appeal?: boolean };
  /** Сума, якщо релевантно (₴). */
  amount?: number;
  /** Чи є дата критичним юридичним дедлайном (для червоного маркеру в календарі). */
  isLegalDeadline: boolean;
}

interface BuildOpts {
  acts?: TaxAct[];
  pprs?: TaxPPR[];
  appeals?: TaxAppeal[];
  /** Якщо true — пропускати завершені/оплачені сутності. За замовчуванням true. */
  excludeCompleted?: boolean;
}

export function buildAuditCalendarEvents(
  audits: TaxAudit[],
  opts: BuildOpts = {},
): AuditCalendarEvent[] {
  const acts = opts.acts ?? demoActs;
  const pprs = opts.pprs ?? demoPPRs;
  const appeals = opts.appeals ?? demoAppeals;
  const excludeCompleted = opts.excludeCompleted ?? true;

  const events: AuditCalendarEvent[] = [];

  // 1. Дедлайни відповідей у перевірках
  for (const audit of audits) {
    if (excludeCompleted && (audit.status === "completed" || audit.status === "appealed")) {
      continue;
    }
    if (!audit.responseDeadline) continue;
    events.push({
      id: `cal-audit:${audit.id}`,
      kind: "audit-response",
      date: audit.responseDeadline,
      title: `Відповідь: ${getAuditTypeLabel(audit.type)}`,
      description: `${audit.period} · ${audit.taxOffice}`,
      link: { auditId: audit.id },
      isLegalDeadline: true,
    });
  }

  // 2. Заперечення до акта
  for (const act of acts) {
    if (excludeCompleted && (act.status === "reviewed" || act.status === "ppr-issued")) continue;
    events.push({
      id: `cal-act:${act.id}`,
      kind: "act-objection",
      date: act.objectionDeadline,
      title: `Заперечення до акта ${act.number}`,
      description: "10 робочих днів з вручення (п. 86.7 ПКУ)",
      link: { auditId: act.parentAuditId },
      amount: act.additionalTax,
      isLegalDeadline: true,
    });
  }

  // 3. Сплата / оскарження ППР
  for (const ppr of pprs) {
    if (excludeCompleted && (ppr.status === "paid" || ppr.status === "enforced")) continue;
    events.push({
      id: `cal-ppr-pay:${ppr.id}`,
      kind: "ppr-payment",
      date: ppr.agreementDeadline,
      title: `Сплатити ППР ${ppr.number}`,
      description: `Форма ${ppr.form} · ₴${ppr.totalAmount.toLocaleString("uk-UA")}`,
      link: { auditId: ppr.parentAuditId },
      amount: ppr.totalAmount,
      isLegalDeadline: true,
    });
    events.push({
      id: `cal-ppr-appeal:${ppr.id}`,
      kind: "ppr-appeal",
      date: ppr.appealAdminDeadline,
      title: `Дедлайн адмін-скарги: ППР ${ppr.number}`,
      description: "10 р.д. з вручення (п. 56.3 ПКУ)",
      link: { auditId: ppr.parentAuditId, appeal: true },
      amount: ppr.totalAmount,
      isLegalDeadline: true,
    });
  }

  // 4. Подання скарг (наступні інстанції)
  for (const appeal of appeals) {
    if (
      excludeCompleted &&
      (appeal.status === "satisfied" ||
        appeal.status === "rejected" ||
        appeal.status === "partial")
    ) {
      continue;
    }
    if (!appeal.filingDeadline) continue;
    events.push({
      id: `cal-appeal:${appeal.id}`,
      kind: "appeal-filing",
      date: appeal.filingDeadline,
      title: `Скарга: ${appeal.number ?? "—"}`,
      description: `Інстанція: ${appeal.instance}`,
      link: { auditId: appeal.parentAuditId, appeal: true },
      amount: appeal.disputedAmount,
      isLegalDeadline: true,
    });
  }

  return events.sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );
}
