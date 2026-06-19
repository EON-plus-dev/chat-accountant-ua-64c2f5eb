import { TaxAudit, AuditRequest } from "@/config/taxAuditsConfig";
import { differenceInDays, parseISO, isPast } from "date-fns";

export type ReadinessLevel = "ready" | "attention" | "critical";

export type ReadinessActionKind =
  | "open-response"
  | "open-requests-tab"
  | "attach-documents"
  | "open-counterparty"
  | "decide-ppr";

export interface ReadinessAction {
  kind: ReadinessActionKind;
  label: string;
  payload?: { requestId?: string };
  variant?: "primary" | "outline";
}

export interface ReadinessFactor {
  id: string;
  label: string;
  status: "ok" | "warn" | "bad";
  detail: string;
  action?: ReadinessAction;
}

export interface AuditReadinessReport {
  score: number;
  level: ReadinessLevel;
  summary: string;
  factors: ReadinessFactor[];
}

const matchDocsForRequest = (
  request: AuditRequest,
  audit: TaxAudit,
): number => {
  if (!request.documentsRequested?.length) return audit.documents.length > 0 ? 1 : 0;
  const docs = audit.documents.map((d) => `${d.name} ${d.type}`.toLowerCase());
  let hits = 0;
  for (const req of request.documentsRequested) {
    const key = req.toLowerCase().split(/\s+/)[0];
    if (docs.some((d) => d.includes(key))) hits++;
  }
  return hits / request.documentsRequested.length;
};

export const analyzeAuditReadiness = (audit: TaxAudit): AuditReadinessReport => {
  const factors: ReadinessFactor[] = [];

  const overdue = audit.requests.filter((r) => r.status === "overdue");
  const pending = audit.requests.filter((r) => r.status === "pending");
  const answered = audit.requests.filter((r) => r.status === "answered");

  if (overdue.length > 0) {
    const oldest = [...overdue].sort(
      (a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime(),
    )[0];
    factors.push({
      id: "overdue",
      label: `Прострочено запитів: ${overdue.length}`,
      status: "bad",
      detail: "Інспектор може скласти акт без вашої позиції. Терміново надайте відповідь.",
      action: {
        kind: "open-response",
        label: "Відповісти зараз",
        variant: "primary",
        payload: { requestId: oldest.id },
      },
    });
  } else {
    factors.push({
      id: "no-overdue",
      label: "Прострочених запитів немає",
      status: "ok",
      detail: "Усі поточні запити в межах строків ПКУ.",
    });
  }

  const soon = pending.filter((r) => {
    const d = parseISO(r.deadline);
    return !isPast(d) && differenceInDays(d, new Date()) <= 3;
  });
  if (soon.length > 0) {
    const closest = [...soon].sort(
      (a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime(),
    )[0];
    factors.push({
      id: "soon",
      label: `Запитів зі строком ≤ 3 днів: ${soon.length}`,
      status: "warn",
      detail: "Підготуйте відповіді сьогодні-завтра, щоб уникнути прострочки.",
      action: {
        kind: "open-response",
        label: "Підготувати відповідь",
        variant: "outline",
        payload: { requestId: closest.id },
      },
    });
  }

  const docCoverage =
    pending.length === 0
      ? 1
      : pending.reduce((sum, r) => sum + matchDocsForRequest(r, audit), 0) / pending.length;

  if (docCoverage >= 0.8) {
    factors.push({
      id: "docs",
      label: "Документи зібрано",
      status: "ok",
      detail: `Покриття запитуваних документів ≈ ${Math.round(docCoverage * 100)}%.`,
    });
  } else if (docCoverage >= 0.4) {
    factors.push({
      id: "docs",
      label: "Документи частково зібрано",
      status: "warn",
      detail: `Покриття ≈ ${Math.round(docCoverage * 100)}%. AI-підбір допоможе закрити прогалини.`,
      action: {
        kind: "attach-documents",
        label: "Прикріпити документи",
        variant: "outline",
      },
    });
  } else {
    factors.push({
      id: "docs",
      label: "Документи не зібрано",
      status: "bad",
      detail: "Більшість запитуваних документів ще не прикріплено до перевірки.",
      action: {
        kind: "attach-documents",
        label: "Прикріпити документи",
        variant: "outline",
      },
    });
  }

  const risky = audit.requests.filter((r) => r.relatedCounterparty?.isRisky);
  if (risky.length > 0) {
    factors.push({
      id: "kwod",
      label: `Ризикові контрагенти: ${risky.length}`,
      status: "warn",
      detail:
        "За цими операціями ймовірні додаткові питання. Підготуйте підтверджуючі документи реальності операцій.",
      action: {
        kind: "open-requests-tab",
        label: "Перевірити контрагентів",
        variant: "outline",
      },
    });
  }

  if (audit.result?.hasViolations && audit.status !== "appealed" && audit.status !== "completed") {
    factors.push({
      id: "ppr",
      label: "Винесено ППР",
      status: "warn",
      detail:
        "Сума узгоджується через 10 робочих днів. Прийняти рішення: сплатити чи оскаржити.",
      action: {
        kind: "decide-ppr",
        label: "Рішення по ППР",
        variant: "outline",
      },
    });
  }

  const weights = { ok: 100, warn: 60, bad: 0 };
  const score = Math.round(
    factors.reduce((s, f) => s + weights[f.status], 0) / Math.max(factors.length, 1),
  );

  let level: ReadinessLevel = "ready";
  let summary = "Перевірка під контролем. Продовжуйте моніторити дедлайни.";
  if (factors.some((f) => f.status === "bad")) {
    level = "critical";
    summary = "Є критичні прогалини, які можуть погіршити результат перевірки.";
  } else if (factors.some((f) => f.status === "warn")) {
    level = "attention";
    summary = "Загалом усе добре, але є моменти, які варто закрити найближчими днями.";
  }

  if (answered.length > 0 && pending.length === 0 && overdue.length === 0) {
    summary = "Всі запити закриті. Очікуємо реакцію ДПС.";
  }

  return { score, level, summary, factors };
};
