/**
 * METRIC CONTEXTS — period-aware фактологія для кожної з 10 метрик.
 *
 * Замість того, щоб FocusMetricView/AnalyticsAiBriefing тягли статичні KPI
 * з config (які не залежать від обраного періоду), ця утиліта рахує реальні
 * показники з `filteredData` (вже відфільтрованого по period+customRange
 * через `filterDataByRange`).
 *
 * Викликається один раз на верхньому рівні `PeriodModeView` і передається
 * вниз як `metricContexts` — щоб і Hero, і supporting-KPI, і таблиця бюджету,
 * і AI-довідка користувалися ОДНИМИ й тими самими цифрами.
 */

import type { AnalyticsDataSet } from "./dataLayer";
import type { TaxBudgetRow } from "@/config/cabinetAnalyticsConfig";
import type { AnalyticsRisk } from "@/types/analyticsTypes";
import type { Document } from "@/config/documentFlowConfig";
import type { TaxPayment } from "@/config/paymentsConfig";
import type { Cabinet } from "@/types/cabinet";
import { FOP_INCOME_LIMITS } from "@/config/taxConstantsConfig";

const sum = <T,>(arr: T[], pick: (t: T) => number): number =>
  arr.reduce((s, x) => s + (pick(x) || 0), 0);

const pctDelta = (cur: number, prev: number): number =>
  prev > 0 ? Math.round(((cur - prev) / prev) * 1000) / 10 : 0;

const isOverdue = (deadline: string, now: Date): boolean =>
  new Date(deadline).getTime() < now.getTime();

const isPaid = (p: TaxPayment): boolean => p.status === "paid";

// ── INCOME ──
export interface IncomeContext {
  total: number;
  prevTotal: number;
  deltaPct: number;
  count: number;
  avgCheck: number;
  topPayer?: { name: string; value: number };
  peakDay?: { label: string; value: number };
}

// ── EXPENSES ──
export interface ExpensesContext {
  total: number;
  prevTotal: number;
  deltaPct: number;
  count: number;
  avg: number;
  topCategory?: { name: string; value: number; pct: number };
}

// ── NET ──
export interface NetContext {
  income: number;
  expenses: number;
  taxes: number;
  net: number;
  marginPct: number;
  prevNet: number;
  deltaPct: number;
  biggestDrag: "expenses" | "taxes" | null;
}

// ── TRANSACTIONS ──
export interface TransactionsContext {
  count: number;
  prevCount: number;
  deltaPct: number;
  turnover: number;
  avgCheck: number;
  maxCheck: number;
  returnsCount: number;
  peakDay?: { label: string; value: number };
}

// ── LIMITS ──
export interface LimitsContext {
  enabled: boolean;
  group?: 1 | 2 | 3;
  used: number;       // Σ доходу за рік (накопичувально)
  limit: number;      // річний ліміт
  percent: number;    // 0..100
  remaining: number;
  status: "ok" | "warning" | "critical";
  burnPerDay: number;
  daysToLimit: number | null; // null = темпу нема або вже >100%
  forecastEndOfYearPct: number;
}

// ── TAXES ──
export interface TaxesContext {
  accrued: number;
  paid: number;
  debt: number;
  paidCount: number;
  totalCount: number;
  closedTypes: string[];   // ["ЄП", "ВЗ"]
  pendingTypes: string[];  // ["ЄСВ", "ПДФО"]
  overdueTypes: string[];
  breakdown: TaxBudgetRow[];
  upcoming: Array<{ name: string; date: string; daysLeft: number; amount: number; status: "ok" | "soon" | "urgent" }>;
}

// ── SALARIES ──
export interface SalariesContext {
  fundGross: number;
  net: number;
  pdfoVz: number;     // ПДФО + ВЗ
  esv: number;
  payCount: number;
  burdenPct: number;  // (fund / income) * 100
  prevFund: number;
  deltaPct: number;
}

// ── COMPLIANCE ──
export interface ComplianceContext {
  score: number;       // 0..100
  open: number;
  critical: number;
  upcoming: number;    // дедлайн у наст. 14 днів
  overdue: number;
  topRisks: AnalyticsRisk[];
}

// ── DOCUMENTS ──
export interface DocumentsContext {
  total: number;
  signed: number;
  unsigned: number;    // pending-sign / draft-pending-contractor / draft
  overdue: number;     // dueDate < today та не paid/signed
  awaiting: number;    // needs-clarification / in-review
}

// ── ACCESS ──
export interface AccessContext {
  users: number;
  roles: number;
  twofaPct: number;
  logins7d: number;
  recent: Array<{ user: string; device: string; when: string }>;
  suspiciousCount: number;
}

// ── Aggregate ──
export interface MetricContexts {
  income: IncomeContext;
  expenses: ExpensesContext;
  net: NetContext;
  transactions: TransactionsContext;
  limits: LimitsContext;
  taxes: TaxesContext;
  salaries: SalariesContext;
  compliance: ComplianceContext;
  documents: DocumentsContext;
  access: AccessContext;
}

interface BuildContextsArgs {
  filteredData: AnalyticsDataSet;
  prevFilteredData: AnalyticsDataSet;
  fullData: AnalyticsDataSet;       // не фільтроване — для річного ліміту, 2FA тощо
  cabinet: Cabinet;
  analyticsRisks: AnalyticsRisk[];
  healthScore: number;              // 0..100
}

const SHORT_MONTH_UA = ["Січ", "Лют", "Бер", "Кві", "Тра", "Чер", "Лип", "Сер", "Вер", "Жов", "Лис", "Гру"];
const fmtDay = (iso: string): string => {
  const dt = new Date(iso);
  return `${String(dt.getDate()).padStart(2, "0")} ${SHORT_MONTH_UA[dt.getMonth()] ?? ""}`;
};

export function buildMetricContexts(args: BuildContextsArgs): MetricContexts {
  const { filteredData, prevFilteredData, fullData, cabinet, analyticsRisks, healthScore } = args;
  const now = new Date();

  // ── INCOME ──
  const incomeRecords = filteredData.incomeRecords.filter((r) => r.status === "income");
  const prevIncomeRecords = prevFilteredData.incomeRecords.filter((r) => r.status === "income");
  const incomeTotal = sum(incomeRecords, (r) => r.inIncomeBook);
  const prevIncomeTotal = sum(prevIncomeRecords, (r) => r.inIncomeBook);

  // Топ-1 платник
  const payerMap = new Map<string, number>();
  for (const r of incomeRecords) {
    const k = r.contractor || "Без контрагента";
    payerMap.set(k, (payerMap.get(k) || 0) + r.inIncomeBook);
  }
  const topPayerEntry = [...payerMap.entries()].sort((a, b) => b[1] - a[1])[0];

  // Пік за день
  const dayMap = new Map<string, number>();
  for (const r of incomeRecords) {
    const k = r.date.slice(0, 10);
    dayMap.set(k, (dayMap.get(k) || 0) + r.inIncomeBook);
  }
  const peakDayEntry = [...dayMap.entries()].sort((a, b) => b[1] - a[1])[0];

  const income: IncomeContext = {
    total: incomeTotal,
    prevTotal: prevIncomeTotal,
    deltaPct: pctDelta(incomeTotal, prevIncomeTotal),
    count: incomeRecords.length,
    avgCheck: incomeRecords.length > 0 ? Math.round(incomeTotal / incomeRecords.length) : 0,
    topPayer: topPayerEntry ? { name: topPayerEntry[0], value: topPayerEntry[1] } : undefined,
    peakDay: peakDayEntry ? { label: fmtDay(peakDayEntry[0]), value: peakDayEntry[1] } : undefined,
  };

  // ── EXPENSES ──
  const expensesAll = [
    ...filteredData.contractorPayments.map((p) => ({ amount: p.amount, category: (p as any).category || "Контрагенти" })),
    ...filteredData.salaryPayments.map((p) => ({ amount: p.amount, category: "Зарплати" })),
  ];
  const expensesTotal = sum(expensesAll, (e) => e.amount);
  const prevExpensesAll = [
    ...prevFilteredData.contractorPayments.map((p) => p.amount),
    ...prevFilteredData.salaryPayments.map((p) => p.amount),
  ];
  const prevExpensesTotal = prevExpensesAll.reduce((s, v) => s + v, 0);

  const catMap = new Map<string, number>();
  for (const e of expensesAll) {
    catMap.set(e.category, (catMap.get(e.category) || 0) + e.amount);
  }
  const topCatEntry = [...catMap.entries()].sort((a, b) => b[1] - a[1])[0];

  const expenses: ExpensesContext = {
    total: expensesTotal,
    prevTotal: prevExpensesTotal,
    deltaPct: pctDelta(expensesTotal, prevExpensesTotal),
    count: expensesAll.length,
    avg: expensesAll.length > 0 ? Math.round(expensesTotal / expensesAll.length) : 0,
    topCategory: topCatEntry
      ? {
          name: topCatEntry[0],
          value: topCatEntry[1],
          pct: expensesTotal > 0 ? Math.round((topCatEntry[1] / expensesTotal) * 100) : 0,
        }
      : undefined,
  };

  // ── TAXES (потрібно раніше за NET) ──
  const taxesAccrued = sum(filteredData.taxPayments, (t) => t.amountToPay);
  const taxesPaid = sum(filteredData.taxPayments.filter(isPaid), (t) => t.paidAmount ?? t.amountToPay);
  const taxesDebt = Math.max(0, taxesAccrued - taxesPaid);

  // Розбивка по типу
  const taxTypeMap = new Map<string, { name: string; accrued: number; paid: number; nearestDeadline: string; hasOverdue: boolean }>();
  for (const t of filteredData.taxPayments) {
    if (t.status === "cancelled") continue;
    const key = t.taxType;
    const cur = taxTypeMap.get(key) ?? {
      name: t.taxTypeLabel || key,
      accrued: 0,
      paid: 0,
      nearestDeadline: t.deadline,
      hasOverdue: false,
    };
    cur.accrued += t.amountToPay;
    if (isPaid(t)) cur.paid += t.paidAmount ?? t.amountToPay;
    if (!isPaid(t) && isOverdue(t.deadline, now)) cur.hasOverdue = true;
    if (new Date(t.deadline) < new Date(cur.nearestDeadline)) cur.nearestDeadline = t.deadline;
    taxTypeMap.set(key, cur);
  }
  const breakdown: TaxBudgetRow[] = [...taxTypeMap.values()].map((row) => ({
    name: row.name,
    accrued: row.accrued,
    paid: row.paid,
    status: row.paid >= row.accrued && row.accrued > 0 ? "closed" : row.hasOverdue ? "overdue" : "pending",
    deadline: `до ${fmtDay(row.nearestDeadline)}`,
  }));
  const closedTypes = breakdown.filter((b) => b.status === "closed").map((b) => b.name);
  const pendingTypes = breakdown.filter((b) => b.status === "pending").map((b) => b.name);
  const overdueTypes = breakdown.filter((b) => b.status === "overdue").map((b) => b.name);
  const paidCount = closedTypes.length;
  const totalCount = breakdown.length;

  // Найближчі дедлайни (топ-3 ще не сплачених)
  const upcoming = filteredData.taxPayments
    .filter((t) => !isPaid(t) && t.status !== "cancelled")
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
    .slice(0, 3)
    .map((t) => {
      const daysLeft = Math.ceil((new Date(t.deadline).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return {
        name: `${t.taxTypeLabel} · ${t.period}`,
        date: `до ${fmtDay(t.deadline)}`,
        daysLeft,
        amount: t.amountToPay,
        status: (daysLeft < 0 ? "urgent" : daysLeft <= 7 ? "urgent" : daysLeft <= 14 ? "soon" : "ok") as
          | "ok"
          | "soon"
          | "urgent",
      };
    });

  const taxes: TaxesContext = {
    accrued: taxesAccrued,
    paid: taxesPaid,
    debt: taxesDebt,
    paidCount,
    totalCount,
    closedTypes,
    pendingTypes,
    overdueTypes,
    breakdown,
    upcoming,
  };

  // ── NET ──
  const netCur = incomeTotal - expensesTotal - taxesAccrued;
  const prevTaxesAccrued = sum(prevFilteredData.taxPayments, (t) => t.amountToPay);
  const prevNet = prevIncomeTotal - prevExpensesTotal - prevTaxesAccrued;
  const marginPct = incomeTotal > 0 ? Math.round((netCur / incomeTotal) * 1000) / 10 : 0;
  const biggestDrag: NetContext["biggestDrag"] =
    expensesTotal === 0 && taxesAccrued === 0 ? null : expensesTotal >= taxesAccrued ? "expenses" : "taxes";

  const net: NetContext = {
    income: incomeTotal,
    expenses: expensesTotal,
    taxes: taxesAccrued,
    net: netCur,
    marginPct,
    prevNet,
    deltaPct: pctDelta(netCur, prevNet),
    biggestDrag,
  };

  // ── TRANSACTIONS ──
  const txCount = filteredData.incomeRecords.filter((r) => r.status !== "return").length;
  const prevTxCount = prevFilteredData.incomeRecords.filter((r) => r.status !== "return").length;
  const turnover = sum(filteredData.incomeRecords.filter((r) => r.status !== "return"), (r) => r.inIncomeBook);
  const maxCheck = filteredData.incomeRecords.reduce((m, r) => Math.max(m, r.amount || 0), 0);
  const returnsCount = filteredData.incomeRecords.filter((r) => r.status === "return").length;

  // Пік за день (count)
  const dayCountMap = new Map<string, number>();
  for (const r of filteredData.incomeRecords) {
    if (r.status === "return") continue;
    const k = r.date.slice(0, 10);
    dayCountMap.set(k, (dayCountMap.get(k) || 0) + 1);
  }
  const peakDayCntEntry = [...dayCountMap.entries()].sort((a, b) => b[1] - a[1])[0];

  const transactions: TransactionsContext = {
    count: txCount,
    prevCount: prevTxCount,
    deltaPct: pctDelta(txCount, prevTxCount),
    turnover,
    avgCheck: txCount > 0 ? Math.round(turnover / txCount) : 0,
    maxCheck,
    returnsCount,
    peakDay: peakDayCntEntry ? { label: fmtDay(peakDayCntEntry[0]), value: peakDayCntEntry[1] } : undefined,
  };

  // ── LIMITS (FOP only, накопичувально від початку року) ──
  const limitsEnabled = cabinet.type === "fop" && Boolean(cabinet.fopGroup);
  const fopGroup = (cabinet.fopGroup ?? 3) as 1 | 2 | 3;
  const limit = limitsEnabled ? FOP_INCOME_LIMITS[fopGroup] || 0 : 0;
  const yearStart = new Date(now.getFullYear(), 0, 1);
  const ytdRecords = fullData.incomeRecords.filter(
    (r) => r.status === "income" && new Date(r.date) >= yearStart && new Date(r.date) <= now,
  );
  const used = sum(ytdRecords, (r) => r.inIncomeBook);
  const percent = limit > 0 ? Math.round((used / limit) * 1000) / 10 : 0;
  const remaining = Math.max(0, limit - used);
  // burn rate = середнє за день з останніх 30 днів
  const cutoff30 = new Date(now);
  cutoff30.setDate(cutoff30.getDate() - 30);
  const last30 = ytdRecords.filter((r) => new Date(r.date) >= cutoff30);
  const burnPerDay = last30.length > 0 ? Math.round(sum(last30, (r) => r.inIncomeBook) / 30) : 0;
  const daysToLimit = burnPerDay > 0 && remaining > 0 ? Math.ceil(remaining / burnPerDay) : null;
  // прогноз на 31.12
  const dayOfYear = Math.floor((now.getTime() - yearStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  const daysLeftInYear = 365 - dayOfYear;
  const forecastEoyPct =
    limit > 0 ? Math.round(((used + burnPerDay * daysLeftInYear) / limit) * 100) : 0;

  const limits: LimitsContext = {
    enabled: limitsEnabled,
    group: limitsEnabled ? fopGroup : undefined,
    used,
    limit,
    percent,
    remaining,
    status: percent >= 90 ? "critical" : percent >= 70 ? "warning" : "ok",
    burnPerDay,
    daysToLimit,
    forecastEndOfYearPct: forecastEoyPct,
  };

  // ── SALARIES ──
  const salPay = filteredData.salaryPayments;
  const salFund = sum(salPay, (p) => p.grossAmount || p.amount);
  const salNet = sum(salPay, (p) => p.netAmount || p.amount);
  const salPdfo = sum(salPay, (p) => p.pdfoAmount || 0) + sum(salPay, (p) => p.militaryTaxAmount || 0);
  const salEsv = sum(salPay, (p) => p.esvAmount || 0);
  const prevSalFund = sum(prevFilteredData.salaryPayments, (p) => p.grossAmount || p.amount);

  const salaries: SalariesContext = {
    fundGross: salFund,
    net: salNet,
    pdfoVz: salPdfo,
    esv: salEsv,
    payCount: salPay.length,
    burdenPct: incomeTotal > 0 ? Math.round((salFund / incomeTotal) * 1000) / 10 : 0,
    prevFund: prevSalFund,
    deltaPct: pctDelta(salFund, prevSalFund),
  };

  // ── COMPLIANCE ──
  const cutoff14 = new Date(now);
  cutoff14.setDate(cutoff14.getDate() + 14);
  const compOpen = analyticsRisks.filter((r) => r.severity === "critical" || r.severity === "warning").length;
  const compCritical = analyticsRisks.filter((r) => r.severity === "critical").length;
  const compOverdue = analyticsRisks.filter((r) => r.deadline && new Date(r.deadline) < now).length;
  const compUpcoming = analyticsRisks.filter(
    (r) => r.deadline && new Date(r.deadline) >= now && new Date(r.deadline) <= cutoff14,
  ).length;
  const sortedRisks = [...analyticsRisks].sort((a, b) => {
    const sevWeight = { critical: 3, warning: 2, info: 1 } as const;
    return (sevWeight[b.severity] ?? 0) - (sevWeight[a.severity] ?? 0);
  });

  const compliance: ComplianceContext = {
    score: Math.round(healthScore),
    open: compOpen,
    critical: compCritical,
    upcoming: compUpcoming,
    overdue: compOverdue,
    topRisks: sortedRisks.slice(0, 3),
  };

  // ── DOCUMENTS ──
  const docs = filteredData.documents;
  const SIGNED_STATUSES: Document["status"][] = ["signed", "sent", "confirmed", "paid", "registered"];
  const UNSIGNED_STATUSES: Document["status"][] = ["draft", "draft-pending-contractor", "pending-sign"];
  const AWAITING_STATUSES: Document["status"][] = ["needs-clarification", "in-review", "discrepancy-pending"];
  const docsSigned = docs.filter((d) => SIGNED_STATUSES.includes(d.status)).length;
  const docsUnsigned = docs.filter((d) => UNSIGNED_STATUSES.includes(d.status)).length;
  const docsAwaiting = docs.filter((d) => AWAITING_STATUSES.includes(d.status)).length;
  const docsOverdue = docs.filter(
    (d) => d.dueDate && new Date(d.dueDate) < now && d.status !== "paid" && !SIGNED_STATUSES.includes(d.status),
  ).length;

  const documents: DocumentsContext = {
    total: docs.length,
    signed: docsSigned,
    unsigned: docsUnsigned,
    overdue: docsOverdue,
    awaiting: docsAwaiting,
  };

  // ── ACCESS (поки що детермінована fixture-логіка на основі cabinet.id) ──
  // Реальні дані прийдуть з useCabinetMembers/useUserEvents у наступних ітераціях.
  const seed = cabinet.id.split("").reduce((s, c) => s + c.charCodeAt(0), 0);
  const access: AccessContext = {
    users: 1 + (seed % 3),
    roles: 1 + (seed % 2),
    twofaPct: seed % 4 === 0 ? 100 : 50,
    logins7d: 8 + (seed % 12),
    suspiciousCount: 0,
    recent: [
      { user: "Ви", device: "Chrome · macOS", when: "5 хв тому" },
      { user: "Бухгалтер", device: "Safari · iPhone", when: "2 год тому" },
      { user: "Ви", device: "Chrome · macOS", when: "вчора, 18:30" },
    ],
  };

  return { income, expenses, net, transactions, limits, taxes, salaries, compliance, documents, access };
}
