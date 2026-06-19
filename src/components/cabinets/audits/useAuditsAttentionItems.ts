/**
 * Адаптер AttentionInbox для розділу «Перевірки» (ФОП).
 *
 * Джерела пріоритету:
 *  - critical:
 *      • прострочені запити в активних аудитах (responseDeadline < сьогодні)
 *      • запити зі статусом "overdue"
 *      • протермінований дедлайн заперечень до акта (objectionDeadline)
 *      • протермінований дедлайн адмін-узгодження ППР (agreementDeadline)
 *      • протермінований filingDeadline активної скарги
 *  - attention:
 *      • запити / акти / ППР / скарги з дедлайном у наступні 7 днів
 *  - normal:
 *      • активні аудити без явного дедлайну (для ситуативної видимості)
 */

import { useMemo } from "react";
import {
  AlertTriangle,
  Clock,
  FileWarning,
  Scale,
  Gavel,
  ClipboardCheck,
} from "lucide-react";
import { differenceInCalendarDays } from "date-fns";
import {
  mergeAttentionItems,
  type AttentionItem,
  type AttentionPriority,
} from "@/components/cabinets/shared/attention-inbox";
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

interface UseAuditsAttentionItemsParams {
  audits: TaxAudit[];
  acts?: TaxAct[];
  pprs?: TaxPPR[];
  appeals?: TaxAppeal[];
  onOpenAudit?: (auditId: string) => void;
  onOpenAppeal?: (auditId: string) => void;
  onOpenAllOverdue?: () => void;
  /** Відкрити форму відповіді одразу для конкретного запиту в перевірці */
  onOpenResponse?: (auditId: string, requestId: string) => void;
}

function deadlinePriority(days: number): AttentionPriority {
  if (days < 0) return "critical";
  if (days <= 7) return "attention";
  return "normal";
}

function relativeLabel(days: number): string {
  if (days < 0) return `Прострочено ${Math.abs(days)} дн.`;
  if (days === 0) return "Сьогодні";
  if (days === 1) return "Завтра";
  return `Через ${days} дн.`;
}

export function useAuditsAttentionItems({
  audits,
  acts = demoActs,
  pprs = demoPPRs,
  appeals = demoAppeals,
  onOpenAudit,
  onOpenAppeal,
  onOpenAllOverdue,
  onOpenResponse,
}: UseAuditsAttentionItemsParams): AttentionItem[] {
  return useMemo(() => {
    const today = new Date();
    const items: AttentionItem[] = [];

    // 1. Прострочені запити в перевірках
    const overdueRequests = audits.flatMap((a) =>
      a.requests
        .filter((r) => {
          if (r.status === "overdue") return true;
          if (r.status === "answered") return false;
          if (!r.deadline) return false;
          return differenceInCalendarDays(new Date(r.deadline), today) < 0;
        })
        .map((r) => ({ audit: a, request: r })),
    );

    if (overdueRequests.length === 1) {
      const { audit, request } = overdueRequests[0];
      const days = request.deadline
        ? differenceInCalendarDays(new Date(request.deadline), today)
        : -1;
      items.push({
        id: `audit-request:${request.id}`,
        priority: "critical",
        icon: AlertTriangle,
        title: `Прострочений запит у перевірці`,
        meta: `${getAuditTypeLabel(audit.type)} · ${audit.period} · ${relativeLabel(days)}`,
        primaryAction: {
          label: "Відповісти",
          onClick: () =>
            onOpenResponse
              ? onOpenResponse(audit.id, request.id)
              : onOpenAudit?.(audit.id),
        },
      });
    } else if (overdueRequests.length > 1) {
      items.push({
        id: `audit-requests:overdue`,
        priority: "critical",
        icon: AlertTriangle,
        title: `${overdueRequests.length} прострочених запитів від ДПС`,
        meta: "Кожен день — додаткові санкції",
        badge: { text: String(overdueRequests.length), tone: "count" },
        primaryAction: {
          label: "Переглянути",
          onClick: () => onOpenAllOverdue?.(),
        },
      });
    }

    // 2. Активні дедлайни запитів у наступні 7 днів
    audits.forEach((audit) => {
      if (!audit.responseDeadline) return;
      if (audit.status === "completed" || audit.status === "appealed") return;
      const days = differenceInCalendarDays(new Date(audit.responseDeadline), today);
      if (days < 0 || days > 7) return;
      items.push({
        id: `audit:${audit.id}`,
        priority: deadlinePriority(days),
        icon: Clock,
        title: `Відповідь на ${getAuditTypeLabel(audit.type).toLowerCase()}`,
        meta: `${audit.period} · ${relativeLabel(days)} · ДПС: ${audit.taxOffice}`,
        primaryAction: {
          label: "Відкрити",
          onClick: () => onOpenAudit?.(audit.id),
        },
      });
    });

    // 3. Дедлайн заперечень до акта (10 р.д. з вручення)
    acts.forEach((act) => {
      if (act.status === "reviewed" || act.status === "ppr-issued") return;
      const days = differenceInCalendarDays(new Date(act.objectionDeadline), today);
      if (days > 7) return;
      items.push({
        id: `act:${act.id}`,
        priority: deadlinePriority(days),
        icon: FileWarning,
        title: `Заперечення до акта ${act.number}`,
        meta: `${relativeLabel(days)} · 10 р.д. з вручення`,
        primaryAction: {
          label: "Перейти до перевірки",
          onClick: () => onOpenAudit?.(act.parentAuditId),
        },
      });
    });

    // 4. Дедлайн узгодження / адмін-скарги ППР (10 р.д.)
    pprs.forEach((ppr) => {
      if (ppr.status === "paid" || ppr.status === "enforced") return;
      const days = differenceInCalendarDays(new Date(ppr.agreementDeadline), today);
      if (days > 7) return;
      items.push({
        id: `ppr:${ppr.id}`,
        priority: deadlinePriority(days),
        icon: Scale,
        title: `ППР ${ppr.number}: сплатити або оскаржити`,
        meta: `${relativeLabel(days)} · ₴${ppr.totalAmount.toLocaleString("uk-UA")} (${ppr.form})`,
        primaryAction: {
          label: "Відкрити перевірку",
          onClick: () => onOpenAudit?.(ppr.parentAuditId),
        },
        secondaryActions: onOpenAppeal
          ? [{ label: "Відкрити оскарження", onClick: () => onOpenAppeal(ppr.parentAuditId) }]
          : undefined,
      });
    });

    // 5. Активні скарги з близьким filingDeadline
    appeals.forEach((appeal) => {
      if (
        appeal.status === "satisfied" ||
        appeal.status === "rejected" ||
        appeal.status === "partial"
      ) {
        return;
      }
      if (!appeal.filingDeadline) return;
      const days = differenceInCalendarDays(new Date(appeal.filingDeadline), today);
      if (days > 7) return;
      items.push({
        id: `appeal:${appeal.id}`,
        priority: deadlinePriority(days),
        icon: Gavel,
        title: `Подати скаргу ${appeal.number ?? ""}`.trim(),
        meta: `${relativeLabel(days)} · інстанція ${appeal.instance}`,
        primaryAction: {
          label: "Відкрити оскарження",
          onClick: () => onOpenAppeal?.(appeal.parentAuditId),
        },
      });
    });

    return mergeAttentionItems(items);
  }, [audits, acts, pprs, appeals, onOpenAudit, onOpenAppeal, onOpenAllOverdue, onOpenResponse]);
}
