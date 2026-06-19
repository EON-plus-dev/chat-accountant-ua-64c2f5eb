/**
 * Демо-дані для ОКП-сторінки податку (Інтегрована картка платника ДПС).
 *
 * Не є реальним джерелом — використовується лише як офлайн-вʼю стилю
 * Електронного кабінету ДПС у демо-кабінетах.
 */

import type { TaxType, TaxPayment } from "./paymentsConfig";

// =====================================================================
// Бюджетні рахунки з періодами чинності
// =====================================================================

export interface BudgetAccount {
  taxType: TaxType;
  kbk: string;
  iban: string;
  recipient: string;
  recipientEdrpou: string;
  region: string;
  validFrom: string; // ISO date
  validUntil: string | null;
  budgetLevel: "state" | "local";
}

export const budgetAccounts: BudgetAccount[] = [
  {
    taxType: "ep",
    kbk: "18050400",
    iban: "UA218201720343130001000015825",
    recipient: "ГУК у м.Києві / Шевч.р-н",
    recipientEdrpou: "37993783",
    region: "м. Київ",
    validFrom: "2025-01-01",
    validUntil: null,
    budgetLevel: "local",
  },
  {
    taxType: "esv",
    kbk: "71040000",
    iban: "UA538212070000026007300905065",
    recipient: "ГУ ДПС у м.Києві",
    recipientEdrpou: "44094520",
    region: "м. Київ",
    validFrom: "2025-01-01",
    validUntil: null,
    budgetLevel: "state",
  },
  {
    taxType: "military-fop",
    kbk: "11011001",
    iban: "UA748999980314090529000026015",
    recipient: "ГУК у м.Києві",
    recipientEdrpou: "37993783",
    region: "м. Київ",
    validFrom: "2025-01-01",
    validUntil: null,
    budgetLevel: "state",
  },
  {
    taxType: "pdfo",
    kbk: "11010100",
    iban: "UA218201720343160001000015826",
    recipient: "ГУК у м.Києві / Шевч.р-н",
    recipientEdrpou: "37993783",
    region: "м. Київ",
    validFrom: "2025-01-01",
    validUntil: null,
    budgetLevel: "local",
  },
  {
    taxType: "military",
    kbk: "11011000",
    iban: "UA218201720343160001000015827",
    recipient: "ГУК у м.Києві",
    recipientEdrpou: "37993783",
    region: "м. Київ",
    validFrom: "2025-01-01",
    validUntil: null,
    budgetLevel: "state",
  },
  {
    taxType: "esv-employer",
    kbk: "71040000",
    iban: "UA538212070000026007300905065",
    recipient: "ГУ ДПС у м.Києві",
    recipientEdrpou: "44094520",
    region: "м. Київ",
    validFrom: "2025-01-01",
    validUntil: null,
    budgetLevel: "state",
  },
];

export function getBudgetAccount(taxType: TaxType, asOf: Date = new Date()): BudgetAccount | undefined {
  const ts = asOf.getTime();
  return budgetAccounts.find(
    (a) =>
      a.taxType === taxType &&
      new Date(a.validFrom).getTime() <= ts &&
      (a.validUntil === null || new Date(a.validUntil).getTime() >= ts),
  );
}

// =====================================================================
// Орган ДПС кабінету (демо)
// =====================================================================

export interface DpsAuthority {
  name: string;
  region: string;
  edrpou: string;
}

export function getDpsAuthorityForCabinet(_cabinetId: string): DpsAuthority {
  // У продакшні — з реєстру за адресою/КОАТУУ кабінету.
  return {
    name: "ГУ ДПС у м. Києві, Шевченківський район",
    region: "м. Київ",
    edrpou: "44094520",
  };
}

// =====================================================================
// Мораторій на нарахування пені
// =====================================================================

export interface MoratoriumPeriod {
  from: string;
  until: string | null;
  reason: string;
}

export const penaltyMoratorium: MoratoriumPeriod[] = [
  {
    from: "2022-02-24",
    until: "2024-08-01",
    reason: "Воєнний стан (п. 69 підрозд. 10 розд. XX ПКУ)",
  },
];

export function isMoratoriumActive(date: Date = new Date()): MoratoriumPeriod | null {
  const ts = date.getTime();
  return (
    penaltyMoratorium.find(
      (m) =>
        new Date(m.from).getTime() <= ts &&
        (m.until === null || new Date(m.until).getTime() >= ts),
    ) ?? null
  );
}

// =====================================================================
// Податкові повідомлення-рішення (ППР) — демо
// =====================================================================

export type PprForm = "Р" | "ПН" | "Ш" | "Д" | "В";
export type PprStatus =
  | "agreed"
  | "admin_appeal"
  | "court_appeal"
  | "cancelled"
  | "paid";

export interface Ppr {
  id: string;
  cabinetId: string;
  taxType: TaxType;
  number: string;
  date: string; // ISO
  form: PprForm;
  amount: number;
  status: PprStatus;
  auditId?: string;
  dueDate: string; // ISO
}

export const pprStatusLabel: Record<PprStatus, string> = {
  agreed: "Узгоджене",
  admin_appeal: "Адмін. оскарження",
  court_appeal: "Судове оскарження",
  cancelled: "Скасоване",
  paid: "Сплачене",
};

export const pprFormLabel: Record<PprForm, string> = {
  Р: "Р — донарах. зобовʼязання",
  ПН: "ПН — порушення ЕРПН",
  Ш: "Ш — штраф",
  Д: "Д — донарахування",
  В: "В — повернення",
};

const demoPprs: Ppr[] = [
  // Демо-ППР для кабінету ip-fop-3
  {
    id: "ppr-001",
    cabinetId: "ip-fop-3",
    taxType: "ep",
    number: "0012345/0107-2026",
    date: "2026-03-12",
    form: "Р",
    amount: 4250,
    status: "agreed",
    auditId: "audit-2026-Q1-camera",
    dueDate: "2026-03-22",
  },
];

export function getPprsForCabinet(cabinetId: string, taxType?: TaxType): Ppr[] {
  return demoPprs.filter(
    (p) => p.cabinetId === cabinetId && (taxType ? p.taxType === taxType : true),
  );
}

// =====================================================================
// Платіжки (Settlements) — демо
// =====================================================================

export interface Settlement {
  id: string;
  paymentId: string; // FK → TaxPayment.id
  paidAt: string;
  creditedAt: string;
  amount: number;
  payerName?: string;
  payerEdrpou?: string;
  bankName: string;
  paymentInstructionNo: string;
  purpose: string;
  purposeCode: "101" | "107" | "121" | "140" | "";
}

/**
 * Будуємо демо-список settlements на основі реальних `paidAmount` платежів,
 * щоб не вести окремий датасет вручну.
 */
export function buildDemoSettlements(payments: TaxPayment[]): Settlement[] {
  return payments
    .filter((p) => (p.paidAmount ?? 0) > 0 && p.paidDate)
    .map((p, i) => {
      const paid = p.paidAmount ?? 0;
      return {
        id: `settle-${p.id}`,
        paymentId: p.id,
        paidAt: p.paidDate!,
        // У ОКП дата зарахування = T+0..1 банк. дн.
        creditedAt: shiftBusinessDay(p.paidDate!, i % 2 === 0 ? 0 : 1),
        amount: paid,
        bankName: p.bankLabel ?? "ПриватБанк",
        paymentInstructionNo: p.paymentOrderNumber ?? `${1000 + i}`,
        purpose: `Сплата ${p.taxTypeLabel} за ${p.period}`,
        purposeCode: "101",
      };
    });
}

function shiftBusinessDay(iso: string, days: number): string {
  const d = new Date(iso);
  let added = 0;
  while (added < days) {
    d.setDate(d.getDate() + 1);
    const dow = d.getDay();
    if (dow !== 0 && dow !== 6) added += 1;
  }
  return d.toISOString().slice(0, 10);
}

// =====================================================================
// Розстрочення/відстрочення (демо — порожній за замовчуванням)
// =====================================================================

export interface DeferralPlan {
  id: string;
  cabinetId: string;
  taxType: TaxType;
  approvedAt: string;
  totalAmount: number;
  remaining: number;
  schedule: Array<{ dueDate: string; amount: number; paid: boolean }>;
  reason: string;
}

export function getDeferralPlan(_cabinetId: string, _taxType: TaxType): DeferralPlan | null {
  return null;
}
